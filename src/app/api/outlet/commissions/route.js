import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const outletId = searchParams.get("outletId");
    const status = searchParams.get("status");
    const periodYear = searchParams.get("periodYear");
    const periodMonth = searchParams.get("periodMonth");
    const isSummary = searchParams.get("summary") === "true";

    if (!outletId) {
      return NextResponse.json({ error: "Missing required query param: outletId" }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: staff, error: staffError } = await supabaseAdmin
      .from("outlet_staff")
      .select("id")
      .eq("user_id", user.id)
      .eq("outlet_id", outletId)
      .maybeSingle();

    if (staffError) throw staffError;
    if (!staff) {
      return NextResponse.json({ error: "Forbidden: not a staff member of this outlet" }, { status: 403 });
    }

    if (isSummary) {
      const { data: txns } = await supabaseAdmin
        .from("commission_transactions")
        .select("total_commission, status")
        .eq("outlet_id", outletId);

      const summary = (txns || []).reduce((acc, row) => {
        const amt = parseFloat(row.total_commission || 0);
        if (row.status === "pending") { acc.pending_total += amt; acc.pending_count += 1; }
        else if (row.status === "approved") { acc.approved_total += amt; acc.approved_count += 1; }
        else if (row.status === "paid") { acc.paid_total += amt; acc.paid_count += 1; }
        acc.total_count += 1;
        return acc;
      }, { pending_total: 0, approved_total: 0, paid_total: 0, total_count: 0, pending_count: 0, approved_count: 0, paid_count: 0 });

      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
      twelveMonthsAgo.setDate(1);

      const { data: monthly } = await supabaseAdmin
        .from("commission_transactions")
        .select("total_commission, status, period_year, period_month")
        .eq("outlet_id", outletId)
        .gte("created_at", twelveMonthsAgo.toISOString());

      const monthlyMap = {};
      (monthly || []).forEach(r => {
        const key = `${r.period_year}-${String(r.period_month).padStart(2, "0")}`;
        if (!monthlyMap[key]) monthlyMap[key] = { period_year: r.period_year, period_month: r.period_month, total: 0 };
        monthlyMap[key].total += parseFloat(r.total_commission || 0);
      });

      return NextResponse.json({
        success: true,
        data: {
          summary,
          monthlyTotals: Object.entries(monthlyMap)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([, v]) => v)
        }
      });
    }

    let query = supabaseAdmin
      .from("commission_transactions")
      .select(`
        *,
        pos_product:pos_product_id(name),
        pos_order:pos_order_id(order_number, created_at)
      `)
      .eq("outlet_id", outletId)
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (periodYear) query = query.eq("period_year", parseInt(periodYear, 10));
    if (periodMonth) query = query.eq("period_month", parseInt(periodMonth, 10));

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Commissions GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
