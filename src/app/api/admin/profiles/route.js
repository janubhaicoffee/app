import { createClient } from "@/lib/supabaseWrapper";
import { NextResponse } from "next/server";

async function verifyAdmin(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }
  const token = authHeader.split(" ")[1];
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return { error: "Invalid token", status: 401 };

  const adminEmails = (process.env.SUPERADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
  const isEmailAdmin = adminEmails.includes(user.email?.toLowerCase());

  if (!isEmailAdmin) {
    const { data: profile } = await supabaseAdmin
      .from("admin_profiles")
      .select("*")
      .eq("phone", user.phone)
      .maybeSingle();
    if (!profile) return { error: "Forbidden", status: 403 };
  }

  return { supabase: supabaseAdmin, user };
}

export async function GET(request) {
  try {
    const auth = await verifyAdmin(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { data, error } = await auth.supabase
      .from("admin_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("Admin profiles GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await verifyAdmin(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const { email, phone, name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { data, error } = await auth.supabase
      .from("admin_profiles")
      .upsert({
        email: email || null,
        phone: phone || null,
        name
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Admin profiles POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await verifyAdmin(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await auth.supabase.from("admin_profiles").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin profiles DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
