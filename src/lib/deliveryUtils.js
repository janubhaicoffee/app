import { supabaseAdmin } from "./supabaseAdmin";

export async function processDeliveryOrder({ partner, items, total, couponUsed, customerName }) {
  const partnerLower = partner.toLowerCase();

  for (const item of items || []) {
    const { data: invItems } = await supabaseAdmin
      .from("outlet_inventory")
      .select("*")
      .eq("name", item.name);
    if (invItems && invItems.length > 0) {
      const invItem = invItems[0];
      const newStock = Math.max(0, (invItem.stock || 0) - item.quantity);
      await supabaseAdmin
        .from("outlet_inventory")
        .update({ stock: newStock })
        .eq("id", invItem.id);
    }
  }

  const { data: txData } = await supabaseAdmin
    .from("outlet_transactions")
    .insert({
      amount: total,
      type: "revenue",
      category: "Delivery Order",
      description: `Order via ${partnerLower}${couponUsed ? ` (Coupon: ${couponUsed})` : ""}`,
      date: new Date().toISOString()
    })
    .select()
    .single();

  if (txData) {
    await supabaseAdmin.from("audit_log").insert({
      admin_email: "system-automated@janubhaicoffee.com",
      action: "add_transaction",
      entity_type: "transactions",
      entity_id: txData.id,
      details: { automatic: true, partner: partnerLower }
    });
  }

  await supabaseAdmin
    .from("outlet_delivery_orders")
    .insert({
      partner: partnerLower,
      items: items,
      total: total,
      status: "preparing",
      customer_name: customerName || "Delivery Customer",
      coupon_used: couponUsed || null,
      created_at: new Date().toISOString()
    });
}
