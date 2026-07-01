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
