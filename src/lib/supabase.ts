import { createClient } from '@supabase/supabase-js';
import { UserRole } from './roles';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

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
