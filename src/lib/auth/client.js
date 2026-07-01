"use client";

import { supabase } from '@/lib/supabase'

export async function getUserOutlet() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: staff } = await supabase
    .from('outlet_staff')
    .select('*, outlet:outlets(*)')
    .eq('user_id', session.user.id)
    .maybeSingle()

  return staff
}

export async function hasRole(role) {
  const staff = await getUserOutlet()
  if (!staff) return false
  return staff.role === role
}

export async function requireOutletAccess() {
  const staff = await getUserOutlet()
  if (!staff) return '/auth/login'
  return null
}
