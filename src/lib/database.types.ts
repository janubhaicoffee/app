export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      outlets: {
        Row: {
          id: string
          name: string
          city: string
          address: string
          status: 'active' | 'suspended' | 'pending_approval'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          city: string
          address: string
          status?: 'active' | 'suspended' | 'pending_approval'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          city?: string
          address?: string
          status?: 'active' | 'suspended' | 'pending_approval'
          created_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          name: string
          category: string
          base_price: number
          image_url: string | null
          is_available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          base_price: number
          image_url?: string | null
          is_available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          base_price?: number
          image_url?: string | null
          is_available?: boolean
          created_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: string
          outlet_id: string
          name: string
          current_stock: number
          min_stock_level: number
          unit: string
          last_updated: string
        }
        Insert: {
          id?: string
          outlet_id: string
          name: string
          current_stock: number
          min_stock_level: number
          unit: string
          last_updated?: string
        }
        Update: {
          id?: string
          outlet_id?: string
          name?: string
          current_stock?: number
          min_stock_level?: number
          unit?: string
          last_updated?: string
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          balance_credits: number
          tier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          balance_credits?: number
          tier?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          balance_credits?: number
          tier?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          outlet_id: string
          user_id: string | null
          total_amount: number
          payment_method: 'cash' | 'online' | 'wallet'
          source: 'walk_in' | 'zomato' | 'swiggy' | 'app'
          status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          outlet_id: string
          user_id?: string | null
          total_amount: number
          payment_method: 'cash' | 'online' | 'wallet'
          source?: 'walk_in' | 'zomato' | 'swiggy' | 'app'
          status?: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          outlet_id?: string
          user_id?: string | null
          total_amount?: number
          payment_method?: 'cash' | 'online' | 'wallet'
          source?: 'walk_in' | 'zomato' | 'swiggy' | 'app'
          status?: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          created_at?: string
        }
      }
    }
  }
}
