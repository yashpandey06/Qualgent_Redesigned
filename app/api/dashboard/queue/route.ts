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
  const result = url.searchParams.get('result');
  const category = url.searchParams.get('category');
  const priority = url.searchParams.get('priority');
  const version = url.searchParams.get('version');

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
      .select('id, category')
      .in('project_id', projectIds);
    suiteIds = (suites || []).map((s: any) => s.id);
  }

  // Get all test runs for these suites, with optional filtering
  let runs: any[] = [];
  if (suiteIds.length > 0) {
    let query = supabase
      .from('test_runs')
      .select(`
        *,
        test_suites!inner(
          id,
          name,
          category,
          projects!inner(
            id,
            name
          )
        )
      `)
      .in('suite_id', suiteIds)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status && status !== 'All Statuses') {
      query = query.eq('status', status.toLowerCase());
    }
    if (result && result !== 'All Results') {
      query = query.eq('result', result.toLowerCase());
    }
    if (category && category !== 'All Categories') {
      query = query.eq('test_suites.category', category);
    }
    if (priority && priority !== 'All Priorities') {
      // For now, we'll use metadata field for priority
      query = query.eq('metadata->priority', priority);
    }
    if (version && version !== 'All Versions') {
      // For now, we'll use metadata field for version
      query = query.eq('metadata->version', version);
    }

    const { data: runsData, error: runsError } = await query;
    if (runsError) {
      return NextResponse.json({ error: runsError.message }, { status: 500 });
    }
    runs = runsData || [];
  }

  // Get filter options for the UI
  const { data: allRuns } = await supabase
    .from('test_runs')
    .select(`
      status,
      result,
      metadata,
      test_suites!inner(
        category,
        projects!inner(
          id
        )
      )
    `)
    .in('suite_id', suiteIds);

  // Extract unique filter values
  const filterOptions = {
    statuses: Array.from(new Set(allRuns?.map(r => r.status).filter(Boolean) || [])),
    results: Array.from(new Set(allRuns?.map(r => r.result).filter(Boolean) || [])),
    categories: Array.from(new Set(allRuns?.map(r => r.test_suites?.category).filter(Boolean) || [])),
    priorities: Array.from(new Set(allRuns?.map(r => r.metadata?.priority).filter(Boolean) || [])),
    versions: Array.from(new Set(allRuns?.map(r => r.metadata?.version).filter(Boolean) || [])),
  };

  return NextResponse.json({ 
    runs,
    filterOptions,
    totalRuns: runs.length,
    stats: {
      running: runs.filter(r => r.status === 'running').length,
      completed: runs.filter(r => r.status === 'completed').length,
      failed: runs.filter(r => r.status === 'failed').length,
      pending: runs.filter(r => r.status === 'pending').length,
    }
  });
} 