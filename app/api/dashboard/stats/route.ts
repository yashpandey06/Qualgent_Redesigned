import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Total Projects
  const { count: totalProjects } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', user.id);

  // 2. Get all project IDs for the user
  const { data: userProjects } = await supabase
    .from('projects')
    .select('id')
    .eq('owner_id', user.id);
  const projectIds = (userProjects || []).map((p: any) => p.id);

  // 3. Get all suite IDs for these projects
  let suiteIds: string[] = [];
  if (projectIds.length > 0) {
    const { data: suites } = await supabase
      .from('test_suites')
      .select('id')
      .in('project_id', projectIds);
    suiteIds = (suites || []).map((s: any) => s.id);
  }

  // 4. Test Runs counts
  let totalRuns = 0, completedRuns = 0, runningRuns = 0;
  if (suiteIds.length > 0) {
    const { count: runsCount } = await supabase
      .from('test_runs')
      .select('id', { count: 'exact', head: true })
      .in('suite_id', suiteIds);
    totalRuns = runsCount || 0;

    const { count: completedCount } = await supabase
      .from('test_runs')
      .select('id', { count: 'exact', head: true })
      .in('suite_id', suiteIds)
      .eq('status', 'completed');
    completedRuns = completedCount || 0;

    const { count: runningCount } = await supabase
      .from('test_runs')
      .select('id', { count: 'exact', head: true })
      .in('suite_id', suiteIds)
      .eq('status', 'running');
    runningRuns = runningCount || 0;
  }

  return NextResponse.json({
    totalProjects: totalProjects || 0,
    totalRuns,
    completedRuns,
    runningRuns,
  });
} 