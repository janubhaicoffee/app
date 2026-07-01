import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lowStock = searchParams.get("lowStock");

    let query = supabaseAdmin
      .from("outlet_inventory")
      .select("*")
      .order("created_at", { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    let result = data || [];
    if (lowStock === "true") {
      result = result.filter(item => item.stock <= item.threshold);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Inventory GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, threshold, stock, auto_reorder } = body;

    const updates = {};
    if (threshold !== undefined) updates.threshold = parseInt(threshold);
    if (stock !== undefined) updates.stock = parseInt(stock);
    if (auto_reorder !== undefined) updates.auto_reorder = !!auto_reorder;

    // If no specific item ID is passed, update all items (useful for bulk config settings in E2E tests)
    let query = supabaseAdmin.from("outlet_inventory").update(updates);
    if (id) {
      query = query.eq("id", id);
    } else {
      // Update all records
      query = query.neq("id", "00000000-0000-0000-0000-000000000000");
    }

    const { data, error } = await query.select();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Inventory PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
