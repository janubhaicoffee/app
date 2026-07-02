import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get("outletId");
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const date = searchParams.get("date");
    const limit = searchParams.get("limit");

    let query = supabaseAdmin
      .from("pos_orders")
      .select("*, pos_order_items(*)")
      .order("created_at", { ascending: false });

    if (outletId) query = query.eq("outlet_id", outletId);
    if (source) {
      query = query.eq("source", source);
    } else if (status) {
      const statuses = status.split(",");
      query = query.in("status", statuses);
    }
    if (date) query = query.gte("created_at", `${date}T00:00:00`).lte("created_at", `${date}T23:59:59`);
    if (limit) query = query.limit(parseInt(limit));

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("POS Orders GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { outlet_id, table_id, items, order_type, customer_id, staff_id, notes } = body;

    if (!outlet_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields: outlet_id, items" }, { status: 400 });
    }

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateStr}-${rand}`;

    let subtotal = 0;
    const orderItems = items.map(item => {
      const qty = parseInt(item.quantity) || 1;
      const price = parseFloat(item.price) || parseFloat(item.unit_price) || 0;
      const total = qty * price;
      subtotal += total;
      return {
        product_id: item.product_id,
        product_name: item.product_name || "Unknown",
        quantity: qty,
        price,
        total,
        modifiers: item.modifiers || null,
        status: "pending"
      };
    });

    const taxAmount = subtotal * 0.05;
    const totalAmount = subtotal + taxAmount;

    const orderInsert = {
      outlet_id,
      order_number: orderNumber,
      table_id: table_id || null,
      customer_id: customer_id || null,
      staff_id: staff_id || null,
      type: order_type || "dine-in",
      subtotal,
      tax_total: taxAmount,
      total: totalAmount,
      status: "pending",
      payment_status: "unpaid",
      source: "pos",
      notes: notes || null
    };

    const { data: order, error: orderError } = await supabaseAdmin
      .from("pos_orders")
      .insert([orderInsert])
      .select()
      .single();

    if (orderError) throw orderError;

    const itemsWithOrderId = orderItems.map(item => ({ ...item, order_id: order.id }));

    const { data: createdItems, error: itemsError } = await supabaseAdmin
      .from("pos_order_items")
      .insert(itemsWithOrderId)
      .select();

    if (itemsError) {
      await supabaseAdmin.from("pos_orders").delete().eq("id", order.id);
      throw itemsError;
    }

    if (table_id && order_type === "dine-in") {
      const { error: tableError } = await supabaseAdmin
        .from("pos_tables")
        .update({ status: "occupied" })
        .eq("id", table_id);

      if (tableError) console.error("Failed to update table status:", tableError);
    }

    return NextResponse.json({
      success: true,
      data: { ...order, pos_order_items: createdItems }
    }, { status: 201 });
  } catch (error) {
    console.error("POS Orders POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
