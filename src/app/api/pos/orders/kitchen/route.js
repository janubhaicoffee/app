import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get("outletId");
    const station = searchParams.get("station");

    let query = supabaseAdmin
      .from("pos_orders")
      .select("*, pos_order_items(*), pos_tables!inner(number)")
      .in("status", ["pending", "preparing"])
      .order("created_at", { ascending: true });

    if (outletId) query = query.eq("outlet_id", outletId);

    const { data, error } = await query;
    if (error) throw error;

    const now = new Date();
    const enriched = (data || []).map(order => {
      const createdAt = new Date(order.created_at);
      const elapsedMs = now - createdAt;
      const elapsedMinutes = Math.floor(elapsedMs / 60000);

      let filteredItems = order.pos_order_items || [];
      if (station) {
        filteredItems = filteredItems.filter(item =>
          item.station === station || !item.station
        );
      }

      return {
        ...order,
        pos_order_items: filteredItems,
        time_elapsed_minutes: elapsedMinutes,
        time_elapsed_display: elapsedMinutes < 60
          ? `${elapsedMinutes}m`
          : `${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m`
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    console.error("POS Kitchen GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
