-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE test_step_type AS ENUM ('video', 'image', 'text');
CREATE TYPE test_run_status AS ENUM ('pending', 'running', 'completed', 'failed');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test Suites table
CREATE TABLE public.test_suites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test Runs table
CREATE TABLE public.test_runs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    status test_run_status DEFAULT 'pending',
    suite_id UUID REFERENCES public.test_suites(id) ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test Steps table
CREATE TABLE public.test_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    step_type test_step_type NOT NULL,
    media_url TEXT, -- Placeholder for video/image URLs
    run_id UUID REFERENCES public.test_runs(id) ON DELETE CASCADE NOT NULL,
    step_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Projects
CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE USING (auth.uid() = owner_id);

-- Test Suites
CREATE POLICY "Users can view suites in own projects" ON public.test_suites
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = test_suites.project_id 
            AND projects.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can create suites in own projects" ON public.test_suites
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = test_suites.project_id 
            AND projects.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update suites in own projects" ON public.test_suites
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = test_suites.project_id 
            AND projects.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete suites in own projects" ON public.test_suites
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = test_suites.project_id 
            AND projects.owner_id = auth.uid()
        )
    );

-- Test Runs
CREATE POLICY "Users can view runs in own projects" ON public.test_runs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.test_suites 
            JOIN public.projects ON projects.id = test_suites.project_id
            WHERE test_suites.id = test_runs.suite_id 
            AND projects.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can create runs in own projects" ON public.test_runs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.test_suites 
            JOIN public.projects ON projects.id = test_suites.project_id
            WHERE test_suites.id = test_runs.suite_id 
            AND projects.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update runs in own projects" ON public.test_runs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.test_suites 
            JOIN public.projects ON projects.id = test_suites.project_id
            WHERE test_suites.id = test_runs.suite_id 
            AND projects.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete runs in own projects" ON public.test_runs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.test_suites 
            JOIN public.projects ON projects.id = test_suites.project_id
            WHERE test_suites.id = test_runs.suite_id 
            AND projects.owner_id = auth.uid()
        )
    );

-- Test Steps
CREATE POLICY "Users can view steps in own projects" ON public.test_steps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.test_runs 
            JOIN public.test_suites ON test_suites.id = test_runs.suite_id
            JOIN public.projects ON projects.id = test_suites.project_id
            WHERE test_runs.id = test_steps.run_id 
            AND projects.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can create steps in own projects" ON public.test_steps
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.test_runs 
            JOIN public.test_suites ON test_suites.id = test_runs.suite_id
            JOIN public.projects ON projects.id = test_suites.project_id
            WHERE test_runs.id = test_steps.run_id 
            AND projects.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update steps in own projects" ON public.test_steps
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.test_runs 
            JOIN public.test_suites ON test_suites.id = test_runs.suite_id
            JOIN public.projects ON projects.id = test_suites.project_id
            WHERE test_runs.id = test_steps.run_id 
            AND projects.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete steps in own projects" ON public.test_steps
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.test_runs 
            JOIN public.test_suites ON test_suites.id = test_runs.suite_id
            JOIN public.projects ON projects.id = test_suites.project_id
            WHERE test_runs.id = test_steps.run_id 
            AND projects.owner_id = auth.uid()
        )
    );

-- Functions for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_suites_updated_at BEFORE UPDATE ON public.test_suites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_runs_updated_at BEFORE UPDATE ON public.test_runs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_steps_updated_at BEFORE UPDATE ON public.test_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
