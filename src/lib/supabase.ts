import { createClient } from '@supabase/supabase-js';
import { UserRole } from './roles';
import type { Database } from './database.types';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Use a singleton instance to prevent multiple client creations
export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

export const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
  return supabase;
};

// Re-export specific Row types for convenience
export type Outlet = Database['public']['Tables']['outlets']['Row'];
export type MenuItem = Database['public']['Tables']['menu_items']['Row'];
export type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];
export type Wallet = Database['public']['Tables']['wallets']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];

export interface Profile {
  id: string;
  role: UserRole;
  outlet_id: string | null;
  full_name: string;
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
