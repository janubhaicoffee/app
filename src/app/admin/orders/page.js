import { createClient } from "@supabase/supabase-js";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrders() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  return <AdminOrdersClient initialOrders={orders || []} />;
}
