import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from("outlet_reorder_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Reorder Requests GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { item_name, quantity, requested_by, notes } = body;

    if (!item_name) {
      return NextResponse.json({ error: "Missing required field: item_name" }, { status: 400 });
    }

    const insertData = {
      item_name,
      quantity: quantity !== undefined ? parseInt(quantity) : 1,
      requested_by: requested_by || null,
      status: "pending",
      notes: notes || null,
    };

    const { data, error } = await supabaseAdmin
      .from("outlet_reorder_requests")
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;

    // Also create an alert for the reorder request
    await supabaseAdmin
      .from("outlet_alerts")
      .insert([{
        message: `Manual reorder requested for ${item_name} (qty: ${insertData.quantity})`,
        severity: "medium",
        resolved: false,
        time: new Date().toISOString()
      }]);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Reorder Requests POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing reorder request id" }, { status: 400 });
    }

    const updates = {
      updated_at: new Date().toISOString()
    };
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabaseAdmin
      .from("outlet_reorder_requests")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Reorder Requests PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing reorder request id" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("outlet_reorder_requests")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder Requests DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}