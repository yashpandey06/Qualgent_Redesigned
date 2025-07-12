-- Add sample data with metadata for queue filtering

-- Update existing test runs with metadata
UPDATE test_runs SET 
  metadata = jsonb_build_object('version', 'v1.0', 'priority', 'High')
WHERE id = '55555555-5555-5555-5555-555555555555';

UPDATE test_runs SET 
  metadata = jsonb_build_object('version', 'v2.0', 'priority', 'Medium')
WHERE id = '66666666-6666-6666-6666-666666666666';

UPDATE test_runs SET 
  metadata = jsonb_build_object('version', 'v1.0', 'priority', 'Low')
WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

UPDATE test_runs SET 
  metadata = jsonb_build_object('version', 'v2.0', 'priority', 'High')
WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

UPDATE test_runs SET 
  metadata = jsonb_build_object('version', 'v1.0', 'priority', 'Medium')
WHERE id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

UPDATE test_runs SET 
  metadata = jsonb_build_object('version', 'v2.0', 'priority', 'Low')
WHERE id = 'gggggggg-gggg-gggg-gggg-gggggggggggg';

UPDATE test_runs SET 
  metadata = jsonb_build_object('version', 'v1.0', 'priority', 'High')
WHERE id = 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh';

-- Add more test runs with different statuses and results
INSERT INTO test_runs (id, name, status, suite_id, started_at, completed_at, result, duration_seconds, metadata, created_at, updated_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Smoke Test Run #3', 'pending', '33333333-3333-3333-3333-333333333333', NULL, NULL, NULL, NULL, jsonb_build_object('version', 'v1.0', 'priority', 'Medium'), '2025-01-08T09:00:00Z', '2025-01-08T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO test_runs (id, name, status, suite_id, started_at, completed_at, result, duration_seconds, metadata, created_at, updated_at) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Regression Test Run #2', 'running', '44444444-4444-4444-4444-444444444444', '2025-01-08T10:00:00Z', NULL, NULL, NULL, jsonb_build_object('version', 'v2.0', 'priority', 'High'), '2025-01-08T09:30:00Z', '2025-01-08T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO test_runs (id, name, status, suite_id, started_at, completed_at, result, duration_seconds, metadata, created_at, updated_at) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Sanity Test Run #2', 'completed', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-01-08T11:00:00Z', '2025-01-08T11:03:00Z', 'passed', 180, jsonb_build_object('version', 'v1.0', 'priority', 'Low'), '2025-01-08T10:45:00Z', '2025-01-08T11:03:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO test_runs (id, name, status, suite_id, started_at, completed_at, result, duration_seconds, metadata, created_at, updated_at) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Payment Flow Test Run #2', 'failed', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-01-08T12:00:00Z', '2025-01-08T12:05:00Z', 'failed', 300, jsonb_build_object('version', 'v2.0', 'priority', 'High'), '2025-01-08T11:30:00Z', '2025-01-08T12:05:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO test_runs (id, name, status, suite_id, started_at, completed_at, result, duration_seconds, metadata, created_at, updated_at) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'User Registration Test Run #2', 'completed', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2025-01-08T13:00:00Z', '2025-01-08T13:08:00Z', 'passed', 480, jsonb_build_object('version', 'v1.0', 'priority', 'Medium'), '2025-01-08T12:45:00Z', '2025-01-08T13:08:00Z')
ON CONFLICT (id) DO NOTHING; 