import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get("outletId");
    const role = searchParams.get("role");

    let query = supabaseAdmin
      .from("outlet_staff")
      .select("*, outlets(name, code)")
      .order("name", { ascending: true });

    if (outletId) query = query.eq("outlet_id", outletId);
    if (role) query = query.eq("role", role);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Admin Staff GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { outlet_id, auth_user_id, name, email, phone, role, pin, hourly_rate, notes } = body;

    if (!outlet_id || !name) {
      return NextResponse.json({ error: "Missing required fields: outlet_id, name" }, { status: 400 });
    }

    let resolvedAuthUserId = auth_user_id;

    if (email && !resolvedAuthUserId) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserByEmail(email);
      if (userData?.user) {
        resolvedAuthUserId = userData.user.id;
      }
    }

    const { data: existing } = await supabaseAdmin
      .from("outlet_staff")
      .select("id")
      .eq("outlet_id", outlet_id)
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Staff member with this email already exists in this outlet" }, { status: 409 });
    }

    const { data, error } = await supabaseAdmin
      .from("outlet_staff")
      .insert([{
        outlet_id,
        auth_user_id: resolvedAuthUserId || null,
        name,
        email: email || null,
        phone: phone || null,
        role: role || "staff",
        pin: pin || null,
        hourly_rate: hourly_rate !== undefined ? parseFloat(hourly_rate) : null,
        notes: notes || null,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;

    if (resolvedAuthUserId && email) {
      try {
        const { error: linkError } = await supabaseAdmin
          .from("outlet_staff")
          .update({ auth_user_id: resolvedAuthUserId })
          .eq("id", data.id);

        if (linkError) console.error("Failed to link auth user:", linkError);
      } catch (linkErr) {
        console.error("Failed to link auth user:", linkErr);
      }
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Admin Staff POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
