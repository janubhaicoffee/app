import { createClient } from '@supabase/supabase-js';
import { UserRole } from './roles';

// Enforce real Supabase configuration - no placeholders allowed
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
  );
}

export { supabaseUrl };
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  role: UserRole;
  outlet_id: string | null;
  full_name: string;
}

export interface Outlet {
  id: string;
  name: string;
  city: string;
  address: string;
  status: 'active' | 'suspended' | 'pending_approval';
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  base_price: number;
  image_url: string | null;
  is_available: boolean;
}

export interface Order {
  id: string;
  outlet_id: string;
  user_id: string;
  total_amount: number;
  payment_method: 'cash' | 'online';
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}
