-- Updated seed data with categories and comments

-- Update existing test suites to include categories
UPDATE test_suites SET category = 'Smoke' WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE test_suites SET category = 'Regression' WHERE id = '44444444-4444-4444-4444-444444444444';

-- Add more test suites with different categories
INSERT INTO test_suites (id, name, description, project_id, category, created_at, updated_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sanity Login Test', 'Basic login functionality test', '11111111-1111-1111-1111-111111111111', 'Sanity', '2025-01-03T00:00:00Z', '2025-01-03T00:00:00Z'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Payment Flow Test', 'Complete payment process test', '22222222-2222-2222-2222-222222222222', 'Regression', '2025-01-04T00:00:00Z', '2025-01-04T00:00:00Z'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'User Registration Test', 'New user registration flow', '11111111-1111-1111-1111-111111111111', 'Smoke', '2025-01-05T00:00:00Z', '2025-01-05T00:00:00Z');

-- Add more test runs with different statuses and results
INSERT INTO test_runs (id, name, status, suite_id, started_at, completed_at, result, duration_seconds, created_at, updated_at) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Sanity Login Run #1', 'completed', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-01-03T10:00:00Z', '2025-01-03T10:05:00Z', 'passed', 300, '2025-01-03T09:00:00Z', '2025-01-03T10:05:00Z'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Payment Flow Run #1', 'completed', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-01-04T11:00:00Z', '2025-01-04T11:15:00Z', 'failed', 900, '2025-01-04T10:00:00Z', '2025-01-04T11:15:00Z'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'User Registration Run #1', 'running', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2025-01-05T12:00:00Z', NULL, NULL, NULL, '2025-01-05T11:00:00Z', '2025-01-05T12:00:00Z'),
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Login Test Run #2', 'completed', '33333333-3333-3333-3333-333333333333', '2025-01-06T10:00:00Z', '2025-01-06T10:08:00Z', 'passed', 480, '2025-01-06T09:00:00Z', '2025-01-06T10:08:00Z'),
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Payment Test Run #2', 'completed', '44444444-4444-4444-4444-444444444444', '2025-01-07T11:00:00Z', '2025-01-07T11:12:00Z', 'passed', 720, '2025-01-07T10:00:00Z', '2025-01-07T11:12:00Z');

-- Add comments for test suites
INSERT INTO test_comments (id, content, author_id, suite_id, created_at, updated_at) VALUES
  ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'This login test covers the basic authentication flow. Make sure to test with both valid and invalid credentials.', 'a40d3c43-2c5d-467d-a708-0a20583716f2', '33333333-3333-3333-3333-333333333333', '2025-01-01T14:00:00Z', '2025-01-01T14:00:00Z'),
  ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'Payment flow needs to be tested with different payment methods and edge cases.', 'a40d3c43-2c5d-467d-a708-0a20583716f2', '44444444-4444-4444-4444-444444444444', '2025-01-02T15:00:00Z', '2025-01-02T15:00:00Z'),
  ('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'Sanity test should be quick and cover the most critical functionality.', 'a40d3c43-2c5d-467d-a708-0a20583716f2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-01-03T16:00:00Z', '2025-01-03T16:00:00Z');

-- Add comments for test runs
INSERT INTO test_comments (id, content, author_id, run_id, created_at, updated_at) VALUES
  ('llllllll-llll-llll-llll-llllllllllll', 'Login test passed successfully. All authentication scenarios working as expected.', 'a40d3c43-2c5d-467d-a708-0a20583716f2', '55555555-5555-5555-5555-555555555555', '2025-01-01T10:35:00Z', '2025-01-01T10:35:00Z'),
  ('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'Payment test failed due to timeout on credit card processing. Need to investigate the payment gateway integration.', 'a40d3c43-2c5d-467d-a708-0a20583716f2', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2025-01-04T11:20:00Z', '2025-01-04T11:20:00Z'),
  ('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'User registration test is currently running. This is a comprehensive test covering the entire signup flow.', 'a40d3c43-2c5d-467d-a708-0a20583716f2', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2025-01-05T12:05:00Z', '2025-01-05T12:05:00Z'); 