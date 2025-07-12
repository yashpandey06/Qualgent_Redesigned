import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const supabase = getSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse query params for filtering
  const url = new URL(request.url);
  const suiteId = url.searchParams.get('suite_id');
  const runId = url.searchParams.get('run_id');

  if (!suiteId && !runId) {
    return NextResponse.json({ error: 'Either suite_id or run_id is required' }, { status: 400 });
  }

  // Get comments for the specified suite or run
  let query = supabase
    .from('test_comments')
    .select('*')
    .order('created_at', { ascending: false });

  if (suiteId) {
    query = query.eq('suite_id', suiteId);
  } else if (runId) {
    query = query.eq('run_id', runId);
  }

  const { data: comments, error: commentsError } = await query;
  if (commentsError) {
    return NextResponse.json({ error: commentsError.message }, { status: 500 });
  }

  return NextResponse.json({ comments: comments || [] });
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { content, suite_id, run_id } = body;
  
  if (!content || (!suite_id && !run_id)) {
    return NextResponse.json({ error: 'Content and either suite_id or run_id are required' }, { status: 400 });
  }

  // Validate that the suite or run belongs to a project owned by the user
  if (suite_id) {
    const { data: suite } = await supabase
      .from('test_suites')
      .select('id, project_id')
      .eq('id', suite_id)
      .single();
    if (!suite) {
      return NextResponse.json({ error: 'Suite not found or not owned by user' }, { status: 403 });
    }
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', suite.project_id)
      .eq('owner_id', user.id)
      .single();
    if (!project) {
      return NextResponse.json({ error: 'Project not found or not owned by user' }, { status: 403 });
    }
  } else if (run_id) {
    const { data: run } = await supabase
      .from('test_runs')
      .select('id, suite_id')
      .eq('id', run_id)
      .single();
    if (!run) {
      return NextResponse.json({ error: 'Run not found or not owned by user' }, { status: 403 });
    }
    const { data: suite } = await supabase
      .from('test_suites')
      .select('id, project_id')
      .eq('id', run.suite_id)
      .single();
    if (!suite) {
      return NextResponse.json({ error: 'Suite not found or not owned by user' }, { status: 403 });
    }
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', suite.project_id)
      .eq('owner_id', user.id)
      .single();
    if (!project) {
      return NextResponse.json({ error: 'Project not found or not owned by user' }, { status: 403 });
    }
  }

  // Insert new comment
  const { data: newComment, error: insertError } = await supabase
    .from('test_comments')
    .insert({
      content,
      author_id: user.id,
      suite_id: suite_id || null,
      run_id: run_id || null,
    })
    .select()
    .single();
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ comment: newComment });
} 