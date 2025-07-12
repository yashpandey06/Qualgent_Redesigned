-- Schema updates for run-view functionality

-- Add category column to test_suites if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'test_suites' AND column_name = 'category') THEN
        ALTER TABLE test_suites ADD COLUMN category text;
    END IF;
END $$;

-- Add additional fields to test_runs for better tracking
DO $$ 
BEGIN
    -- Add result field to track pass/fail
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'test_runs' AND column_name = 'result') THEN
        ALTER TABLE test_runs ADD COLUMN result text CHECK (result IN ('passed', 'failed', 'skipped', NULL));
    END IF;
    
    -- Add duration field to track how long the test took
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'test_runs' AND column_name = 'duration_seconds') THEN
        ALTER TABLE test_runs ADD COLUMN duration_seconds integer;
    END IF;
    
    -- Add error_message field for failed tests
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'test_runs' AND column_name = 'error_message') THEN
        ALTER TABLE test_runs ADD COLUMN error_message text;
    END IF;
    
    -- Add metadata field for additional test run data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'test_runs' AND column_name = 'metadata') THEN
        ALTER TABLE test_runs ADD COLUMN metadata jsonb;
    END IF;
END $$;

-- Create comments table for test cases and runs
CREATE TABLE IF NOT EXISTS test_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  author_id uuid NOT NULL,
  suite_id uuid REFERENCES test_suites(id) ON DELETE CASCADE,
  run_id uuid REFERENCES test_runs(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Ensure either suite_id or run_id is provided, but not both
  CONSTRAINT check_comment_target CHECK (
    (suite_id IS NOT NULL AND run_id IS NULL) OR 
    (suite_id IS NULL AND run_id IS NOT NULL)
  )
);

-- Enable RLS on comments table
ALTER TABLE test_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments
CREATE POLICY "Users can view comments in own projects" ON test_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM test_suites 
            JOIN projects ON projects.id = test_suites.project_id
            WHERE test_suites.id = test_comments.suite_id 
            AND projects.owner_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM test_runs 
            JOIN test_suites ON test_suites.id = test_runs.suite_id
            JOIN projects ON projects.id = test_suites.project_id
            WHERE test_runs.id = test_comments.run_id 
            AND projects.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can create comments in own projects" ON test_comments
    FOR INSERT WITH CHECK (
        auth.uid() = author_id AND (
            EXISTS (
                SELECT 1 FROM test_suites 
                JOIN projects ON projects.id = test_suites.project_id
                WHERE test_suites.id = test_comments.suite_id 
                AND projects.owner_id = auth.uid()
            )
            OR
            EXISTS (
                SELECT 1 FROM test_runs 
                JOIN test_suites ON test_suites.id = test_runs.suite_id
                JOIN projects ON projects.id = test_suites.project_id
                WHERE test_runs.id = test_comments.run_id 
                AND projects.owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update own comments" ON test_comments
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" ON test_comments
    FOR DELETE USING (auth.uid() = author_id);

-- Trigger for comments updated_at
CREATE TRIGGER update_test_comments_updated_at 
    BEFORE UPDATE ON test_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set completed_at and calculate duration when status changes to completed
CREATE OR REPLACE FUNCTION update_test_run_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
        IF NEW.started_at IS NOT NULL THEN
            NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at));
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update completion data
CREATE TRIGGER update_test_run_completion_trigger 
    BEFORE UPDATE ON test_runs 
    FOR EACH ROW EXECUTE FUNCTION update_test_run_completion(); 