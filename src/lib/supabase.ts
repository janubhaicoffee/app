import { createClient } from '@supabase/supabase-js';
import { UserRole } from './roles';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClient;
}

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

export interface Expense {
  id: string;
  outlet_id: string;
  user_id: string;
  category: string;
  amount: number;
  note: string | null;
  created_at: string;
}
