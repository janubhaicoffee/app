import { getSupabase, type Expense, type MenuItem, type Order, type Outlet, type Profile } from "./supabase";

export interface InventoryRecord {
  id: string;
  outlet_id: string;
  name: string;
  unit: string;
  current_stock: number;
  min_stock_level: number;
  last_updated: string;
}

export interface WalletRecord {
  user_id: string;
  balance_credits: number;
  tier: string;
  created_at: string;
}

export interface FranchiseApplication {
  id: string;
  applicant_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  proposed_location: string;
  investment_range: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface CommunityEvent {
  id: string;
  outlet_id: string;
  title: string;
  description: string | null;
  event_date: string;
  created_at: string;
}

export interface PricingTierSummary {
  tier: string;
  outlets: number;
}

type OutletWithTier = Outlet & {
  pricing_tier?: string | null;
};

function dataError(error: { message?: string } | null) {
  if (error) throw new Error(error.message || "Supabase query failed");
}

function rows<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : [];
}

function scopedByOutlet<T extends { eq: (column: string, value: string) => T }>(query: T, profile: Profile) {
  if (profile.role !== "superadmin" && profile.outlet_id) {
    return query.eq("outlet_id", profile.outlet_id);
  }

  return query;
}

export async function fetchOutlets() {
  const supabase = getSupabase() as any;
  const { data, error } = await supabase.from("outlets").select("*").order("created_at", { ascending: false });
  dataError(error);
  return rows<OutletWithTier>(data);
}

export async function fetchMenuItems() {
  const supabase = getSupabase() as any;
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true)
    .order("category", { ascending: true });
  dataError(error);
  return rows<MenuItem>(data);
}

export async function fetchOutletMenu(outletId: string) {
  const supabase = getSupabase() as any;
  const { data: outletData, error: outletError } = await supabase
    .from("outlets")
    .select("*")
    .eq("id", outletId)
    .single();
  dataError(outletError);

  const { data: menuData, error: menuError } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true)
    .order("category", { ascending: true });
  dataError(menuError);

  return {
    outlet: outletData as unknown as OutletWithTier,
    menu: rows<MenuItem>(menuData),
  };
}

export async function fetchCommunityEvents(outletId?: string) {
  const supabase = getSupabase() as any;
  let query = supabase.from("community_events").select("*").order("event_date", { ascending: true });
  if (outletId) query = query.eq("outlet_id", outletId);
  const { data, error } = await query;
  dataError(error);
  return rows<CommunityEvent>(data);
}

export async function fetchOrders(profile: Profile) {
  const supabase = getSupabase() as any;
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

  if (profile.role === "customer") query = query.eq("user_id", profile.id);
  else query = scopedByOutlet(query, profile);

  const { data, error } = await query;
  dataError(error);
  return rows<Order>(data);
}

export async function updateOrderStatus(orderId: string, status: Order["status"]) {
  const supabase = getSupabase() as any;
  const { error } = await supabase.from("orders").update({ status } as any).eq("id", orderId);
  dataError(error);
}

export async function createOrder(profile: Profile, items: Array<MenuItem & { quantity: number }>) {
  const supabase = getSupabase() as any;
  if (!profile.outlet_id) throw new Error("Your profile is not assigned to an outlet.");
  if (items.length === 0) throw new Error("Cart is empty.");

  const total = items.reduce((sum, item) => sum + Number(item.base_price) * item.quantity, 0);
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      outlet_id: profile.outlet_id,
      user_id: profile.id,
      total_amount: total,
      payment_method: "cash",
      status: "pending",
    } as any)
    .select("id")
    .single();
  dataError(orderError);

  const orderId = (order as { id: string }).id;
  const { error: itemError } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: orderId,
      menu_item_id: item.id,
      quantity: item.quantity,
      price_at_time: item.base_price,
    })) as any
  );
  dataError(itemError);
  return orderId;
}

export async function fetchInventory(profile: Profile) {
  const supabase = getSupabase() as any;
  const query = scopedByOutlet(
    supabase.from("inventory_items").select("*").order("last_updated", { ascending: false }),
    profile
  );
  const { data, error } = await query;
  dataError(error);
  return rows<InventoryRecord>(data);
}

export async function fetchExpenses(profile: Profile) {
  const supabase = getSupabase() as any;
  const query = scopedByOutlet(
    supabase.from("expenses").select("*").order("created_at", { ascending: false }),
    profile
  );
  const { data, error } = await query;
  dataError(error);
  return rows<Expense>(data);
}

export async function createExpense(profile: Profile, input: { category: string; amount: number; note: string }) {
  const supabase = getSupabase() as any;
  if (!profile.outlet_id) throw new Error("Your profile is not assigned to an outlet.");
  const { error } = await supabase.from("expenses").insert({
    outlet_id: profile.outlet_id,
    user_id: profile.id,
    category: input.category,
    amount: input.amount,
    note: input.note || null,
  } as any);
  dataError(error);
}

export async function fetchProfiles() {
  const supabase = getSupabase() as any;
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  dataError(error);
  return rows<Profile>(data);
}

export async function fetchWallet(userId: string) {
  const supabase = getSupabase() as any;
  const { data, error } = await supabase.from("wallets").select("*").eq("user_id", userId).maybeSingle();
  dataError(error);
  return data as WalletRecord | null;
}

export async function fetchFranchiseApplications(profile: Profile) {
  const supabase = getSupabase() as any;
  let query = supabase.from("franchise_applications").select("*").order("created_at", { ascending: false });
  if (profile.role !== "superadmin") query = query.eq("applicant_id", profile.id);
  const { data, error } = await query;
  dataError(error);
  return rows<FranchiseApplication>(data);
}

export async function fetchPricingTierSummary() {
  const outlets = await fetchOutlets();
  const counts = new Map<string, number>();
  outlets.forEach((outlet) => {
    const tier = outlet.pricing_tier || "standard";
    counts.set(tier, (counts.get(tier) || 0) + 1);
  });

  return Array.from(counts.entries()).map(([tier, outletCount]) => ({ tier, outlets: outletCount } satisfies PricingTierSummary));
}
