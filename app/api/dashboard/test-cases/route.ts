import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const supabase = getSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get category from query params
  const url = new URL(request.url);
  const category = url.searchParams.get('category');

  // Get all project IDs for the user
  const { data: userProjects, error: projectsError } = await supabase
    .from('projects')
    .select('id')
    .eq('owner_id', user.id);
  if (projectsError) {
    return NextResponse.json({ error: projectsError.message }, { status: 500 });
  }
  const projectIds = (userProjects || []).map((p: any) => p.id);

  // Get all test suites (test cases) for these projects, filter by category if provided
  let testCases: any[] = [];
  if (projectIds.length > 0) {
    let query = supabase
      .from('test_suites')
      .select('*')
      .in('project_id', projectIds)
      .order('created_at', { ascending: false });
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }
    const { data: suites, error: suitesError } = await query;
    if (suitesError) {
      return NextResponse.json({ error: suitesError.message }, { status: 500 });
    }
    testCases = suites || [];
  }

  return NextResponse.json({ testCases });
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, project_id, category } = body;
  if (!name || !project_id) {
    return NextResponse.json({ error: 'Name and project_id are required' }, { status: 400 });
  }

  // Check if the project belongs to the user
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', project_id)
    .eq('owner_id', user.id)
    .single();
  if (!project) {
    return NextResponse.json({ error: 'Project not found or not owned by user' }, { status: 403 });
  }

  // Insert new test suite (test case)
  const { data: newTestCase, error: insertError } = await supabase
    .from('test_suites')
    .insert({ name, description, project_id, category })
    .select()
    .single();
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ testCase: newTestCase });
} 