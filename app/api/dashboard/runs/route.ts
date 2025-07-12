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
  const status = url.searchParams.get('status');
  const suiteId = url.searchParams.get('suite_id');

  // Get all project IDs for the user
  const { data: userProjects, error: projectsError } = await supabase
    .from('projects')
    .select('id')
    .eq('owner_id', user.id);
  if (projectsError) {
    return NextResponse.json({ error: projectsError.message }, { status: 500 });
  }
  const projectIds = (userProjects || []).map((p: any) => p.id);

  // Get all suite IDs for these projects
  let suiteIds: string[] = [];
  if (projectIds.length > 0) {
    const { data: suites } = await supabase
      .from('test_suites')
      .select('id')
      .in('project_id', projectIds);
    suiteIds = (suites || []).map((s: any) => s.id);
  }

  // Get all test runs for these suites, with optional filtering
  let runs: any[] = [];
  if (suiteIds.length > 0) {
    let query = supabase
      .from('test_runs')
      .select('*')
      .in('suite_id', suiteIds)
      .order('created_at', { ascending: false });
    if (status) {
      query = query.eq('status', status);
    }
    if (suiteId) {
      query = query.eq('suite_id', suiteId);
    }
    const { data: runsData, error: runsError } = await query;
    if (runsError) {
      return NextResponse.json({ error: runsError.message }, { status: 500 });
    }
    runs = runsData || [];
  }

  return NextResponse.json({ runs });
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, suite_id, status, started_at, completed_at } = body;
  if (!name || !suite_id) {
    return NextResponse.json({ error: 'Name and suite_id are required' }, { status: 400 });
  }

  // Check if the suite belongs to a project owned by the user
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

  // Insert new test run
  const { data: newRun, error: insertError } = await supabase
    .from('test_runs')
    .insert({
      name,
      suite_id,
      status: status || 'pending',
      started_at: started_at || null,
      completed_at: completed_at || null,
    })
    .select()
    .single();
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ run: newRun });
} 