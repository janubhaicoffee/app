-- ============================================================
-- JANU BHAI COFFEE OS: EXPANDED SCHEMA
-- ============================================================

-- Role expansion
ALTER TYPE user_role ADD VALUE 'regional_admin';
ALTER TYPE user_role ADD VALUE 'outlet_owner';
ALTER TYPE user_role ADD VALUE 'cashier';
ALTER TYPE user_role ADD VALUE 'kitchen';
ALTER TYPE user_role ADD VALUE 'franchise_applicant';

-- Outlets Table
CREATE TABLE IF NOT EXISTS outlets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'pending_approval'
    owner_id UUID REFERENCES auth.users(id),
    pricing_tier TEXT DEFAULT 'standard', -- 'standard', 'premium', 'airport'
    metadata JSONB DEFAULT '{}', -- store latitude, longitude, contact etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Menu Items (Localizable)
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}', -- tags like 'bestseller', 'gen-z-choice'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Outlet-specific overrides for menu items
CREATE TABLE IF NOT EXISTS outlet_menu_items (
    outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    price NUMERIC(10, 2), -- localized price override
    is_available BOOLEAN DEFAULT true,
    PRIMARY KEY (outlet_id, menu_item_id)
);

-- Franchise Applications
CREATE TABLE IF NOT EXISTS franchise_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID REFERENCES auth.users(id),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    proposed_location TEXT NOT NULL,
    investment_range TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'under_review', 'approved', 'rejected'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inventory Management
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit TEXT NOT NULL, -- 'kg', 'ltr', 'units'
    current_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
    min_stock_level NUMERIC(10, 2) NOT NULL DEFAULT 10,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    change_amount NUMERIC(10, 2) NOT NULL,
    reason TEXT, -- 'restock', 'waste', 'consumption'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Community Features
CREATE TABLE IF NOT EXISTS community_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB DEFAULT '{}', -- artist info, capacity etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Loyalty Wallet
CREATE TABLE IF NOT EXISTS wallets (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance_credits NUMERIC(10, 2) DEFAULT 0,
    tier TEXT DEFAULT 'bronze',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
