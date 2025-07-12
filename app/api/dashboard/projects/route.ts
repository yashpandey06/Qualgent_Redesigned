import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export async function GET() {
  // Debug: Log all cookies received by the API route
  console.log('API /dashboard/projects cookies:', cookies().getAll());

  // Debug: Log Supabase environment variables (partially, for safety)
  console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  console.log('SUPABASE_ANON_KEY (first 6 chars):', anonKey ? anonKey.slice(0, 6) : 'undefined');

  const supabase = getSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('projects')
    .select('id, name, description, created_at, updated_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projects: data });
} 