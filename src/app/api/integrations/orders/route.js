import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const partner = searchParams.get("partner");

    let query = supabaseAdmin
      .from("outlet_delivery_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (partner && partner !== "all") {
      query = query.eq("partner", partner.toLowerCase());
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Integrations Orders GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

let orderQueue = Promise.resolve();

async function processOrder(body) {
  const { partner, items, price, total, couponUsed } = body;
  const orderTotal = price || total || 0;

  // 1. Update stock levels in database
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

  // 2. Insert a transaction
  const { data: txData } = await supabaseAdmin
    .from("outlet_transactions")
    .insert({
      amount: orderTotal,
      type: "revenue",
      category: "Delivery Order",
      description: `Order via ${partner}${couponUsed ? ` (Coupon: ${couponUsed})` : ""}`,
      date: new Date().toISOString()
    })
    .select()
    .single();

  // 3. Insert audit log for the new transaction
  if (txData) {
    await supabaseAdmin.from("audit_log").insert({
      admin_email: "admin@janubhaicoffee.com",
      action: "add_transaction",
      entity_type: "transactions",
      entity_id: txData.id,
      details: { automatic: true, partner }
    });
  }

  // 4. Insert delivery order
  await supabaseAdmin
    .from("outlet_delivery_orders")
    .insert({
      partner: partner.toLowerCase(),
      items: items,
      total: orderTotal,
      status: "preparing",
      customer_name: "Delivery Customer",
      coupon_used: couponUsed || null,
      created_at: new Date().toISOString()
    });

  return NextResponse.json({ success: true });
}

export async function POST(request) {
  try {
    const body = await request.json();
    return new Promise((resolve) => {
      orderQueue = orderQueue.then(async () => {
        try {
          const res = await processOrder(body);
          resolve(res);
        } catch (err) {
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        }
      });
    });
  } catch (error) {
    console.error("Integrations Orders POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
