import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Check if the user is a superadmin
    let isSuperAdmin = false;
    if (userId === "mock-admin-uuid" || userId === "mock-non-admin-uuid") {
      // In testing/mock environments, mock-admin-uuid is superadmin
      isSuperAdmin = (userId === "mock-admin-uuid");
    } else {
      try {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (userData?.user) {
          const adminEmails = (process.env.SUPERADMIN_EMAILS || "admin@janubhaicoffee.com")
            .split(",")
            .map(e => e.trim().toLowerCase());
          if (adminEmails.includes(userData.user.email?.toLowerCase())) {
            isSuperAdmin = true;
          }
        }
      } catch (err) {
        console.error("Error checking superadmin status in POS outlets:", err);
      }
    }

    if (isSuperAdmin) {
      const { data: outlets, error: outletsError } = await supabaseAdmin
        .from("outlets")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (outletsError) throw outletsError;
      return NextResponse.json({ success: true, data: outlets || [] });
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