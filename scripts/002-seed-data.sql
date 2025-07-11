-- Insert sample data (Note: This will only work after you have authenticated users)
-- You can run this after creating your first user account

-- Sample projects (replace with actual user IDs after authentication)
INSERT INTO public.projects (name, description, owner_id) VALUES
('Mobile Banking App', 'Comprehensive testing suite for our mobile banking application', '00000000-0000-0000-0000-000000000000'),
('E-commerce Platform', 'Testing flows for checkout, payments, and user management', '00000000-0000-0000-0000-000000000000'),
('Social Media App', 'UI/UX testing for social features and content sharing', '00000000-0000-0000-0000-000000000000');

-- Sample test suites
INSERT INTO public.test_suites (name, description, project_id) VALUES
('Login Flow Tests', 'Authentication and login process validation', (SELECT id FROM public.projects WHERE name = 'Mobile Banking App' LIMIT 1)),
('Payment Processing', 'End-to-end payment flow testing', (SELECT id FROM public.projects WHERE name = 'Mobile Banking App' LIMIT 1)),
('User Registration', 'New user onboarding and registration', (SELECT id FROM public.projects WHERE name = 'E-commerce Platform' LIMIT 1));

-- Sample test runs
INSERT INTO public.test_runs (name, status, suite_id) VALUES
('Login Test Run #1', 'completed', (SELECT id FROM public.test_suites WHERE name = 'Login Flow Tests' LIMIT 1)),
('Payment Test Run #1', 'running', (SELECT id FROM public.test_suites WHERE name = 'Payment Processing' LIMIT 1)),
('Registration Test Run #1', 'pending', (SELECT id FROM public.test_suites WHERE name = 'User Registration' LIMIT 1));

-- Sample test steps
INSERT INTO public.test_steps (name, description, step_type, media_url, run_id, step_order) VALUES
('Open Login Screen', 'Navigate to the login screen and verify UI elements', 'video', '/placeholder-video.mp4', (SELECT id FROM public.test_runs WHERE name = 'Login Test Run #1' LIMIT 1), 1),
('Enter Credentials', 'Input valid username and password', 'video', '/placeholder-video.mp4', (SELECT id FROM public.test_runs WHERE name = 'Login Test Run #1' LIMIT 1), 2),
('Verify Dashboard', 'Confirm successful login and dashboard load', 'image', '/placeholder-image.jpg', (SELECT id FROM public.test_runs WHERE name = 'Login Test Run #1' LIMIT 1), 3),
('Payment Form Validation', 'Test payment form with various inputs', 'video', '/placeholder-video.mp4', (SELECT id FROM public.test_runs WHERE name = 'Payment Test Run #1' LIMIT 1), 1),
('Process Payment', 'Execute payment transaction', 'video', '/placeholder-video.mp4', (SELECT id FROM public.test_runs WHERE name = 'Payment Test Run #1' LIMIT 1), 2);
