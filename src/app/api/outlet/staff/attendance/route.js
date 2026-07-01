import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get("outletId");
    const staffId = searchParams.get("staffId");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = supabaseAdmin.from("staff_attendance").select("*, outlet_staff(display_name, role)").order("created_at", { ascending: false });

    if (outletId) query = query.eq("outlet_id", outletId);
    if (staffId) query = query.eq("staff_id", staffId);
    if (date) query = query.eq("date", date);
    if (startDate) query = query.gte("date", startDate);
    if (endDate) query = query.lte("date", endDate);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Staff Attendance GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { outlet_id, staff_id, date, clock_in, clock_out, total_hours, status, notes } = body;

    if (!outlet_id || !staff_id || !date) {
      return NextResponse.json({ error: "Missing required fields: outlet_id, staff_id, date" }, { status: 400 });
    }

    const insertData = {
      outlet_id,
      staff_id,
      date,
      clock_in: clock_in || null,
      clock_out: clock_out || null,
      total_hours: total_hours !== undefined ? parseFloat(total_hours) : null,
      status: status || "present",
      notes: notes || null,
    };

    const { data, error } = await supabaseAdmin
      .from("staff_attendance")
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Staff Attendance POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, clock_out, total_hours, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing attendance id" }, { status: 400 });
    }

    const updates = {};
    if (clock_out !== undefined) updates.clock_out = clock_out;
    if (total_hours !== undefined) updates.total_hours = parseFloat(total_hours);
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabaseAdmin
      .from("staff_attendance")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Staff Attendance PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}