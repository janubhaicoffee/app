import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from("outlet_delivery_keys")
      .select("*");

    if (error) throw error;

    // Convert array to a keyed object or return as list
    // The E2E tests expect to read configured keys.
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Delivery keys GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { partner, client_id, client_secret, api_key, active } = body;

    if (!partner || !["swiggy", "zomato"].includes(partner)) {
      return NextResponse.json({ error: "Invalid partner" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("outlet_delivery_keys")
      .upsert({
        id: partner,
        client_id: client_id || "",
        client_secret: client_secret || "",
        api_key: api_key || "",
        active: active !== undefined ? active : false,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Log administrative action in audit_log table
    await supabaseAdmin.from('audit_log').insert({
      admin_email: 'system-automated@janubhaicoffee.com',
      action: 'configure_delivery',
      entity_type: 'delivery_keys',
      entity_id: partner,
      details: { active: active !== undefined ? active : false }
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Delivery keys POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
