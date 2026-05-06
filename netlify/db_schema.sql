-- Run this schema in your Netlify Database SQL Editor

-- Outlets Table
CREATE TABLE outlets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Menu Items Table
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Data (Optional: to get started quickly)
INSERT INTO outlets (id, name, location, is_active)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Connaught Place', 'Inner Circle, CP, New Delhi', true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Hauz Khas Village', 'HKV Main Road, New Delhi', true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Koramangala', '1st Block, Bangalore', true);

INSERT INTO menu_items (id, name, category, price, is_available)
VALUES
('10000000-0000-0000-0000-000000000001', 'Strong Filter Kaapi', 'Hot Coffee', 45.00, true),
('10000000-0000-0000-0000-000000000002', 'Classic Adrak Chai', 'Tea', 30.00, true),
('10000000-0000-0000-0000-000000000003', 'Cold Coffee (Thick)', 'Cold Beverages', 80.00, true),
('10000000-0000-0000-0000-000000000004', 'Bun Maska', 'Snacks', 40.00, true),
('10000000-0000-0000-0000-000000000005', 'Vada Pav', 'Snacks', 35.00, true);
