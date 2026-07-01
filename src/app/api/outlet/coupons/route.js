import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from("outlet_coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Coupons GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, applies_to, specific_products, specific_categories, is_active, starts_at, expires_at } = body;

    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json({ error: "Missing required fields: code, discount_type, discount_value" }, { status: 400 });
    }

    const insertData = {
      code: code.toUpperCase(),
      description: description || null,
      discount_type,
      discount_value: parseFloat(discount_value),
      min_order_amount: min_order_amount !== undefined ? parseFloat(min_order_amount) : 0,
      max_discount_amount: max_discount_amount !== undefined ? parseFloat(max_discount_amount) : null,
      usage_limit: usage_limit !== undefined ? parseInt(usage_limit) : 0,
      applies_to: applies_to || "all",
      specific_products: specific_products || [],
      specific_categories: specific_categories || [],
      is_active: is_active !== undefined ? !!is_active : true,
      starts_at: starts_at || new Date().toISOString(),
      expires_at: expires_at || null,
    };

    const { data, error } = await supabaseAdmin
      .from("outlet_coupons")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Coupons POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing coupon id" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("outlet_coupons")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Coupons DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}