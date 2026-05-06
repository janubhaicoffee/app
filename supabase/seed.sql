-- ============================================================
-- SUPABASE SEED DATA
-- Run this after applying the migration to populate test data
-- ============================================================

-- Create test auth users (for local dev / Supabase dashboard testing)
-- Note: In production, users are created through the Auth flow

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'superadmin@janubhai.com', 'hashed_pw', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Super Admin", "role":"superadmin"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'manager1@janubhai.com', 'hashed_pw', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Connaught Place Manager", "role":"manager"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'employee1@janubhai.com', 'hashed_pw', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Raj (POS)", "role":"employee"}', now(), now(), '', '', '', '');

-- The trigger auto-creates profiles. Now assign outlet IDs
-- These outlet IDs must match the ones in the Netlify Database
UPDATE profiles SET outlet_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE profiles SET outlet_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' WHERE id = '33333333-3333-3333-3333-333333333333';

-- Insert sample orders (outlet_id references Netlify DB, menu_item_id references Netlify DB)
INSERT INTO orders (id, outlet_id, user_id, total_amount, payment_method, status, created_at)
VALUES
('o1000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 125.00, 'cash', 'completed', now() - interval '2 hours'),
('o1000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 80.00, 'online', 'completed', now() - interval '1 hour'),
('o1000000-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 300.00, 'online', 'completed', now() - interval '30 minutes');

INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time)
VALUES
('o1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1, 45.00),
('o1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 1, 80.00),
('o1000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 1, 80.00),
('o1000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 2, 45.00),
('o1000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', 6, 35.00);
