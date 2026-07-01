import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const { data: staffRecords, error: staffError } = await supabaseAdmin
      .from("outlet_staff")
      .select("outlet_id")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (staffError) throw staffError;

    if (!staffRecords || staffRecords.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const outletIds = staffRecords.map(r => r.outlet_id);

    const { data: outlets, error: outletsError } = await supabaseAdmin
      .from("outlets")
      .select("*")
      .in("id", outletIds)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (outletsError) throw outletsError;

    return NextResponse.json({ success: true, data: outlets || [] });
  } catch (error) {
    console.error("POS Outlets GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}