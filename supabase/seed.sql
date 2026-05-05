-- Insert initial Superadmin user profile (requires user creation first, but we can just insert into profiles directly if we bypass auth for seeding, or we can use generic UUIDs for testing UI)
-- However, since profiles references auth.users, we need an auth user. 
-- For pure DB seeding, it's easier to insert into auth.users directly or just create mock users.
-- Actually, a better approach is to mock some data in seed.sql that satisfies the schema constraints.

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'superadmin@janubhai.com', 'hashed_pw', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Super Admin", "role":"superadmin"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'manager1@janubhai.com', 'hashed_pw', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Connaught Place Manager", "role":"manager"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'employee1@janubhai.com', 'hashed_pw', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Raj (POS)", "role":"employee"}', now(), now(), '', '', '', '');

-- Note: The trigger might fail during seed if the trigger inserts into profiles but we also insert here. 
-- Since trigger is active, auth.users inserts will automatically create profiles!
-- We just need to update the profiles to assign outlet_id.

-- Insert Outlets
INSERT INTO outlets (id, name, location, is_active)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Connaught Place', 'Inner Circle, CP, New Delhi', true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Hauz Khas Village', 'HKV Main Road, New Delhi', true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Koramangala', '1st Block, Bangalore', true);

-- Update profiles with outlet mapping (Trigger already created profiles)
UPDATE profiles SET outlet_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE profiles SET outlet_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' WHERE id = '33333333-3333-3333-3333-333333333333';

-- Insert Menu Items
INSERT INTO menu_items (id, name, category, price, is_available)
VALUES
('10000000-0000-0000-0000-000000000001', 'Strong Filter Kaapi', 'Hot Coffee', 45.00, true),
('10000000-0000-0000-0000-000000000002', 'Classic Adrak Chai', 'Tea', 30.00, true),
('10000000-0000-0000-0000-000000000003', 'Cold Coffee (Thick)', 'Cold Beverages', 80.00, true),
('10000000-0000-0000-0000-000000000004', 'Bun Maska', 'Snacks', 40.00, true),
('10000000-0000-0000-0000-000000000005', 'Vada Pav', 'Snacks', 35.00, true);

-- Insert Some Orders for Manager Dashboard Data
INSERT INTO orders (id, outlet_id, user_id, total_amount, payment_method, status, created_at)
VALUES
('o1000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 125.00, 'cash', 'completed', now() - interval '2 hours'),
('o1000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 80.00, 'online', 'completed', now() - interval '1 hour'),
('o1000000-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 300.00, 'online', 'completed', now() - interval '30 minutes');

-- Insert Order Items
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time)
VALUES
('o1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1, 45.00),
('o1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 1, 80.00),

('o1000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 1, 80.00),

('o1000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 2, 45.00),
('o1000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', 6, 35.00);
