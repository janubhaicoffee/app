import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client.
// To use your live Supabase project, add these to a .env file:
// VITE_SUPABASE_URL=your_project_url
// VITE_SUPABASE_ANON_KEY=your_anon_key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'customer' | 'employee' | 'manager' | 'superadmin';

export interface Profile {
  id: string;
  role: UserRole;
  outlet_id: string | null;
  full_name: string;
}

export interface Outlet {
  id: string;
  name: string;
  location: string;
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
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
