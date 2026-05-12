"use client";

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Wallet, Order } from '@/lib/supabase';

// ----------------------------------------------------------------------
// 1. useWallet (Customer Operations)
// ----------------------------------------------------------------------
export function useWallet(userId: string | null) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const supabase = getSupabase() as any;

    const fetchWallet = async () => {
      try {
        const { data, error } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows
        
        // Auto-create wallet if it doesn't exist
        if (!data) {
          const { data: newWallet, error: createErr } = await supabase
            .from('wallets')
            .insert({ user_id: userId, balance_credits: 0, tier: 'poshtik_novice' } as any)
            .select()
            .single();
            
          if (createErr) throw createErr;
          setWallet(newWallet);
        } else {
          setWallet(data);
        }
      } catch (err: any) {
        console.error('Wallet fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();

    const channel = supabase.channel(`wallet-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets', filter: `user_id=eq.${userId}` }, 
        (payload: any) => setWallet(payload.new as Wallet)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const addCredits = async (amount: number) => {
    if (!wallet) return { error: 'No wallet found' };
    const supabase = getSupabase() as any;
    try {
      const { error } = await supabase
        .from('wallets')
        .update({ balance_credits: wallet.balance_credits + amount, updated_at: new Date().toISOString() } as any)
        .eq('id', wallet.id);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const deductCredits = async (amount: number) => {
    if (!wallet) return { error: 'No wallet found' };
    if (wallet.balance_credits < amount) return { error: 'Insufficient credits' };
    
    const supabase = getSupabase() as any;
    try {
      const { error } = await supabase
        .from('wallets')
        .update({ balance_credits: wallet.balance_credits - amount, updated_at: new Date().toISOString() } as any)
        .eq('id', wallet.id);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { wallet, loading, error, addCredits, deductCredits };
}

// ----------------------------------------------------------------------
// 2. useTerminalPOS (Offline-First Fast Checkout Engine)
// ----------------------------------------------------------------------
const OFFLINE_QUEUE_KEY = 'jb-offline-orders';

interface OfflineOrder {
  id: string;
  outletId: string;
  items: { id: string; name: string; price: number; qty: number }[];
  paymentMethod: 'cash' | 'online' | 'wallet';
  userId?: string;
  totalAmount: number;
  createdAt: string;
}

function getOfflineQueue(): OfflineOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOfflineQueue(queue: OfflineOrder[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  }
}

export function useTerminalPOS(outletId: string) {
  const [processing, setProcessing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingOrderCount, setPendingOrderCount] = useState(() => getOfflineQueue().length);

  // Listen for connectivity changes
  useEffect(() => {
    const goOnline = () => {
      setIsOffline(false);
      syncOfflineOrders();
    };
    const goOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', goOnline);
      window.addEventListener('offline', goOffline);
      return () => {
        window.removeEventListener('online', goOnline);
        window.removeEventListener('offline', goOffline);
      };
    }
  }, []);

  // Sync cached orders to Supabase
  const syncOfflineOrders = async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    const supabase = getSupabase() as any;
    const remaining: OfflineOrder[] = [];

    for (const order of queue) {
      try {
        const { error } = await supabase
          .from('orders')
          .insert({
            outlet_id: order.outletId,
            user_id: order.userId || null,
            total_amount: order.totalAmount,
            payment_method: order.paymentMethod,
            source: 'walk_in',
            status: 'completed',
            created_at: order.createdAt,
          } as any);

        if (error) {
          remaining.push(order); // Keep failed ones for next sync
        }
      } catch {
        remaining.push(order);
      }
    }

    saveOfflineQueue(remaining);
    setPendingOrderCount(remaining.length);
  };

  const processWalkInOrder = async (
    items: { id: string, name: string, price: number, qty: number }[],
    paymentMethod: 'cash' | 'online' | 'wallet',
    userId?: string
  ) => {
    setProcessing(true);
    const totalAmount = items.reduce((acc, i) => acc + (i.price * i.qty), 0);

    // ── OFFLINE PATH ──────────────────────────────────────────────
    if (!navigator.onLine) {
      const offlineOrder: OfflineOrder = {
        id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        outletId,
        items,
        paymentMethod,
        userId,
        totalAmount,
        createdAt: new Date().toISOString(),
      };

      const queue = getOfflineQueue();
      queue.push(offlineOrder);
      saveOfflineQueue(queue);
      setPendingOrderCount(queue.length);
      setIsOffline(true);
      setProcessing(false);
      return { success: true, orderId: offlineOrder.id, offline: true };
    }

    // ── ONLINE PATH ───────────────────────────────────────────────
    const supabase = getSupabase() as any;

    try {
      // 1. Handle Wallet Payment
      if (paymentMethod === 'wallet' && userId) {
        const { data: w, error: wErr } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
        if (wErr || !w || w.balance_credits < totalAmount) {
          throw new Error('Wallet payment failed: Insufficient balance or error.');
        }
        const { error: wUpdErr } = await supabase.from('wallets')
          .update({ balance_credits: w.balance_credits - totalAmount } as any)
          .eq('id', w.id);
        if (wUpdErr) throw wUpdErr;
      }

      // 2. Insert Order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          outlet_id: outletId,
          user_id: userId || null,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          source: 'walk_in',
          status: 'completed'
        } as any)
        .select()
        .single();
      
      if (orderErr) throw orderErr;

      // 3. Deduct Inventory (Hardcoded ratios for speed)
      // Hot Coffee = 15g Beans (0.015kg), 150ml Milk (0.15L), 1 Cup
      // Cold Coffee = 20g Beans (0.020kg), 250ml Milk (0.25L), 1 Cup
      
      let totalBeans = 0;
      let totalMilk = 0;
      let totalCups = 0;

      items.forEach(item => {
        if (item.id === 'hot-coffee') {
          totalBeans += (0.015 * item.qty);
          totalMilk += (0.15 * item.qty);
          totalCups += item.qty;
        } else if (item.id === 'cold-coffee') {
          totalBeans += (0.020 * item.qty);
          totalMilk += (0.25 * item.qty);
          totalCups += item.qty;
        }
      });

      // Brutally fetch and update inventory (in production this should be a PG Function)
      const { data: inv } = await supabase.from('inventory_items').select('*').eq('outlet_id', outletId);
      
      if (inv) {
        for (const i of inv) {
          let deduction = 0;
          if (i.name.toLowerCase().includes('bean')) deduction = totalBeans;
          if (i.name.toLowerCase().includes('milk')) deduction = totalMilk;
          if (i.name.toLowerCase().includes('cup')) deduction = totalCups;

          if (deduction > 0) {
            await supabase.from('inventory_items')
              .update({ current_stock: i.current_stock - deduction } as any)
              .eq('id', i.id);
          }
        }
      }

      // Also sync any previously cached offline orders
      syncOfflineOrders();

      setProcessing(false);
      return { success: true, orderId: order?.id, offline: false };
    } catch (err: any) {
      // If the error was a network issue, fall back to offline queue
      if (!navigator.onLine) {
        const offlineOrder: OfflineOrder = {
          id: `offline-${Date.now()}`,
          outletId,
          items,
          paymentMethod,
          userId,
          totalAmount,
          createdAt: new Date().toISOString(),
        };
        const queue = getOfflineQueue();
        queue.push(offlineOrder);
        saveOfflineQueue(queue);
        setPendingOrderCount(queue.length);
        setIsOffline(true);
        setProcessing(false);
        return { success: true, orderId: offlineOrder.id, offline: true };
      }

      console.error("Terminal Checkout Error:", err);
      setProcessing(false);
      return { success: false, error: err.message };
    }
  };

  return { processWalkInOrder, processing, isOffline, pendingOrderCount, syncOfflineOrders };
}

// ----------------------------------------------------------------------
// 3. useLiveOmnichannel (Kitchen Feed)
// ----------------------------------------------------------------------
export function useLiveOmnichannel(outletId: string) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const supabase = getSupabase() as any;
    
    // Initial fetch
    supabase.from('orders')
      .select('*')
      .eq('outlet_id', outletId)
      .in('status', ['pending', 'preparing', 'ready'])
      .order('created_at', { ascending: false })
      .then(({ data }: any) => {
        if (data) setOrders(data);
      });

    // Subscribe to new/updated orders
    const channel = supabase.channel(`omni-${outletId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `outlet_id=eq.${outletId}` }, 
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setOrders(prev => [payload.new as Order, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new as Order : o));
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [outletId]);

  return { orders };
}
