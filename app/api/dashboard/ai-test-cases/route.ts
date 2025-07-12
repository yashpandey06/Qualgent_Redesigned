import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { askGemini } from '@/lib/gemini/gemini';

interface GeneratedTestCase {
  name: string;
  description: string;
  category: string;
  steps: string[];
  expectedResult: string;
  priority: 'High' | 'Medium' | 'Low';
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { prompt, project_id } = body;
    
    if (!prompt || !project_id) {
      return NextResponse.json({ error: 'Prompt and project_id are required' }, { status: 400 });
    }

    // Check if the project belongs to the user
    const { data: project } = await supabase
      .from('projects')
      .select('id, name, description')
      .eq('id', project_id)
      .eq('owner_id', user.id)
      .single();
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found or not owned by user' }, { status: 403 });
    }

    // Generate test cases using Gemini
    const geminiPrompt = `
You are an expert QA engineer. Generate 3 comprehensive test cases for the following application and feature:

Application Name: ${project.name}
Application Description: ${project.description || 'No description provided.'}

Feature to test: ${prompt}

For each test case, provide the following in JSON format:
{
  "testCases": [
    {
      "name": "Descriptive test case name",
      "description": "Detailed description of what this test covers",
      "category": "One of: Smoke, Regression, Sanity",
      "steps": ["Step 1", "Step 2", "Step 3", ...],
      "expectedResult": "What should happen when the test passes",
      "priority": "One of: High, Medium, Low"
    }
  ]
}

Make sure the test cases are practical, cover different scenarios, and follow mobile app testing best practices.
`;

    const geminiResponse = await askGemini(geminiPrompt);
    
    // Parse the JSON response from Gemini
    let testCases: GeneratedTestCase[] = [];
    try {
      // Extract JSON from the response (Gemini might wrap it in markdown or code block)
      let jsonMatch = geminiResponse.match(/```json([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) {
        testCases = JSON.parse(jsonMatch[1]).testCases || [];
      } else {
        // Try to match any JSON block
        jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          testCases = parsed.testCases || [];
        }
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError, geminiResponse);
      // Fallback: create a basic test case from the prompt
      testCases = [{
        name: `Test for: ${prompt.substring(0, 50)}...`,
        description: `AI-generated test case for: ${prompt}`,
        category: 'Smoke',
        steps: ['Open the app', 'Navigate to the feature', 'Perform the action', 'Verify the result'],
        expectedResult: 'The feature should work as expected',
        priority: 'Medium'
      }];
    }

    // If parsing failed or Gemini returned empty, always return at least one test case
    if (!Array.isArray(testCases) || testCases.length === 0) {
      testCases = [{
        name: `Test for: ${prompt.substring(0, 50)}...`,
        description: `AI-generated test case for: ${prompt}`,
        category: 'Smoke',
        steps: ['Open the app', 'Navigate to the feature', 'Perform the action', 'Verify the result'],
        expectedResult: 'The feature should work as expected',
        priority: 'Medium'
      }];
    }

    // Refactor and clean up test cases before inserting
    function cleanTestCase(tc: GeneratedTestCase): GeneratedTestCase {
      // Remove 'Test for:' prefix and trim
      let name = tc.name.replace(/^Test for:/i, '').trim()
      // Clean description
      let description = (tc.description || '').trim()
      // Clean steps: remove leading numbers/punctuation, trim
      let steps = (tc.steps || []).map(s => s.replace(/^\s*\d+\.?\s*/, '').trim())
      // Capitalize category and priority
      let category = tc.category ? tc.category.charAt(0).toUpperCase() + tc.category.slice(1).toLowerCase() : 'Smoke'
      let priority = tc.priority ? tc.priority.charAt(0).toUpperCase() + tc.priority.slice(1).toLowerCase() : 'Medium'
      // Clean expectedResult
      let expectedResult = (tc.expectedResult || '').trim()
      return { name, description, category, steps, expectedResult, priority } as GeneratedTestCase
    }

    // Store the generated test cases in the database
    const storedTestCases = [];
    for (const testCase of testCases) {
      const cleaned = cleanTestCase(testCase);
      const { data: newTestCase, error: insertError } = await supabase
        .from('test_suites')
        .insert({
          name: cleaned.name,
          description: cleaned.description,
          project_id: project_id,
          category: cleaned.category,
          metadata: {
            ai_generated: true,
            original_prompt: prompt,
            steps: cleaned.steps,
            expected_result: cleaned.expectedResult,
            priority: cleaned.priority,
            generated_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error storing test case:', insertError);
        continue;
      }

      storedTestCases.push({
        ...cleaned,
        id: newTestCase.id,
        stored: true
      });
    }

    // Log the AI generation activity
    await supabase
      .from('test_comments')
      .insert({
        content: `AI generated ${testCases.length} test cases for: "${prompt}"`,
        author_id: user.id,
        suite_id: storedTestCases[0]?.id || null,
        metadata: {
          ai_generation: true,
          prompt: prompt,
          generated_count: testCases.length,
          project_name: project.name
        }
      });

    return NextResponse.json({
      success: true,
      testCases: storedTestCases,
      generatedCount: testCases.length,
      projectName: project.name
    });

  } catch (error) {
    console.error('AI test case generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate test cases',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 