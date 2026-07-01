import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const { data, error } = await supabaseAdmin
        .from("outlets")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return NextResponse.json({ error: "Outlet not found" }, { status: 404 });
        }
        throw error;
      }
      return NextResponse.json({ success: true, data });
    }

    const { data, error } = await supabaseAdmin
      .from("outlets")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Admin Outlets GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, code, address, city, state, pincode, phone, email, timezone, currency, tax_rate, status, settings } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "Missing required fields: name, code" }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from("outlets")
      .select("id")
      .eq("code", code)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Outlet code already exists" }, { status: 409 });
    }

    const { data, error } = await supabaseAdmin
      .from("outlets")
      .insert([{
        name,
        code: code.toUpperCase(),
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        phone: phone || null,
        email: email || null,
        timezone: timezone || "UTC",
        currency: currency || "INR",
        tax_rate: tax_rate !== undefined ? parseFloat(tax_rate) : 0,
        status: status || "active",
        settings: settings || {}
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Admin Outlets POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, name, code, address, city, state, pincode, phone, email, timezone, currency, tax_rate, status, settings } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing outlet id" }, { status: 400 });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (code !== undefined) updates.code = code.toUpperCase();
    if (address !== undefined) updates.address = address;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (pincode !== undefined) updates.pincode = pincode;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (timezone !== undefined) updates.timezone = timezone;
    if (currency !== undefined) updates.currency = currency;
    if (tax_rate !== undefined) updates.tax_rate = parseFloat(tax_rate);
    if (status !== undefined) {
      if (!["active", "inactive", "closed"].includes(status)) {
        return NextResponse.json({ error: "Invalid status. Must be: active, inactive, closed" }, { status: 400 });
      }
      updates.status = status;
    }
    if (settings !== undefined) updates.settings = settings;

    const { data, error } = await supabaseAdmin
      .from("outlets")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Admin Outlets PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing outlet id" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("outlets")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Outlets DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
