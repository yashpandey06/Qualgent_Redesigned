-- Insert dummy users (for reference, but you must use real auth.users in production)
-- We'll use fixed UUIDs for owner_id to match the mock data

-- Dummy user (replace with a real user from auth.users in your Supabase project)
-- INSERT INTO auth.users (id, email) VALUES ('11111111-1111-1111-1111-111111111111', 'dummy@user.com');

-- Insert projects
TRUNCATE projects RESTART IDENTITY CASCADE;
INSERT INTO projects (id, name, description, owner_id, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Mobile Banking App', 'Comprehensive testing suite for our mobile banking application', 'a40d3c43-2c5d-467d-a708-0a20583716f2', '2025-01-01T00:00:00Z', '2025-01-01T00:00:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'E-commerce Platform', 'Testing flows for checkout, payments, and user management', 'a40d3c43-2c5d-467d-a708-0a20583716f2', '2025-01-02T00:00:00Z', '2025-01-02T00:00:00Z');

-- Insert test suites
TRUNCATE test_suites RESTART IDENTITY CASCADE;
INSERT INTO test_suites (id, name, description, project_id, created_at, updated_at) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Login Suite', 'Suite for login tests', '11111111-1111-1111-1111-111111111111', '2025-01-01T00:00:00Z', '2025-01-01T00:00:00Z'),
  ('44444444-4444-4444-4444-444444444444', 'Payment Suite', 'Suite for payment tests', '22222222-2222-2222-2222-222222222222', '2025-01-02T00:00:00Z', '2025-01-02T00:00:00Z');

-- Insert test runs
TRUNCATE test_runs RESTART IDENTITY CASCADE;
INSERT INTO test_runs (id, name, status, suite_id, started_at, completed_at, created_at, updated_at) VALUES
  ('55555555-5555-5555-5555-555555555555', 'Login Test Run #1', 'completed', '33333333-3333-3333-3333-333333333333', '2025-01-01T10:00:00Z', '2025-01-01T10:30:00Z', '2025-01-01T09:00:00Z', '2025-01-01T10:30:00Z'),
  ('66666666-6666-6666-6666-666666666666', 'Payment Test Run #1', 'running', '44444444-4444-4444-4444-444444444444', '2025-01-01T11:00:00Z', NULL, '2025-01-01T10:00:00Z', '2025-01-01T11:00:00Z');

-- Insert test steps
TRUNCATE test_steps RESTART IDENTITY CASCADE;
INSERT INTO test_steps (id, name, description, step_type, media_url, run_id, step_order, created_at, updated_at) VALUES
  ('77777777-7777-7777-7777-777777777777', 'Open App', 'Open the mobile banking app', 'text', NULL, '55555555-5555-5555-5555-555555555555', 1, '2025-01-01T09:01:00Z', '2025-01-01T09:01:00Z'),
  ('88888888-8888-8888-8888-888888888888', 'Enter Credentials', 'Enter username and password', 'text', NULL, '55555555-5555-5555-5555-555555555555', 2, '2025-01-01T09:02:00Z', '2025-01-01T09:02:00Z'),
  ('99999999-9999-9999-9999-999999999999', 'Submit Login', 'Tap the login button', 'text', NULL, '55555555-5555-5555-5555-555555555555', 3, '2025-01-01T09:03:00Z', '2025-01-01T09:03:00Z');
