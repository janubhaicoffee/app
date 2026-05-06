-- ============================================================
-- SUPABASE SCHEMA: Auth, Profiles, Orders
-- (Outlets & Menu Items live in Netlify Database)
-- ============================================================

-- Enum types
CREATE TYPE user_role AS ENUM ('customer', 'employee', 'manager', 'superadmin');
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'online');

-- Profiles Table (Extends Supabase Auth)
-- outlet_id is stored as a plain UUID string referencing the Netlify DB outlets table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'customer',
    outlet_id UUID,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders Table
-- outlet_id is a logical reference to the Netlify DB outlets table (no FK constraint)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order Items Table
-- menu_item_id is a logical reference to the Netlify DB menu_items table (no FK constraint)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies: Profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Superadmins can view all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
);

-- Policies: Orders
CREATE POLICY "Staff can manage orders for their outlet" ON orders FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND outlet_id = orders.outlet_id 
        AND role IN ('employee', 'manager', 'superadmin')
    )
);
CREATE POLICY "Superadmins can view all orders" ON orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
);

-- Policies: Order Items
CREATE POLICY "Staff can manage order items" ON order_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM orders o 
        JOIN profiles p ON p.id = auth.uid() 
        WHERE o.id = order_items.order_id 
        AND p.outlet_id = o.outlet_id 
        AND p.role IN ('employee', 'manager', 'superadmin')
    )
);

-- Trigger: Auto-create profile when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        new.id, 
        new.raw_user_meta_data->>'full_name', 
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'customer')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
