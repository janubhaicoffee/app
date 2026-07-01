import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { order_id, method, amount, cash_received, shift_id, staff_id, notes } = body;

    if (!order_id || !method || amount === undefined) {
      return NextResponse.json({ error: "Missing required fields: order_id, method, amount" }, { status: 400 });
    }

    const validMethods = ["cash", "card", "upi", "wallet", "split"];
    if (!validMethods.includes(method)) {
      return NextResponse.json({ error: `Invalid payment method. Must be one of: ${validMethods.join(", ")}` }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("pos_orders")
      .select("id, total_amount, payment_status, outlet_id")
      .eq("id", order_id)
      .single();

    if (orderError) {
      if (orderError.code === "PGRST116") {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      throw orderError;
    }

    if (order.payment_status === "paid") {
      return NextResponse.json({ error: "Order is already paid" }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
    }

    if (Math.abs(parsedAmount - parseFloat(order.total_amount)) > 0.01) {
      return NextResponse.json({ error: `Payment amount ${parsedAmount} does not match order total ${order.total_amount}` }, { status: 400 });
    }

    let changeGiven = 0;
    if (method === "cash" && cash_received !== undefined) {
      const received = parseFloat(cash_received);
      if (isNaN(received) || received < parsedAmount) {
        return NextResponse.json({ error: "Cash received must be at least the payment amount" }, { status: 400 });
      }
      changeGiven = parseFloat((received - parsedAmount).toFixed(2));
    }

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("pos_payments")
      .insert([{
        order_id,
        method,
        amount: parsedAmount,
        cash_received: method === "cash" ? parseFloat(cash_received) : null,
        change_given: changeGiven,
        shift_id: shift_id || null,
        staff_id: staff_id || null,
        notes: notes || null
      }])
      .select()
      .single();

    if (paymentError) throw paymentError;

    const { error: updateError } = await supabaseAdmin
      .from("pos_orders")
      .update({ payment_status: "paid", status: "completed" })
      .eq("id", order_id);

    if (updateError) throw updateError;

    if (shift_id) {
      const { data: shift } = await supabaseAdmin
        .from("pos_shifts")
        .select("total_sales, total_cash, total_card, total_upi")
        .eq("id", shift_id)
        .single();

      if (shift) {
        const shiftUpdates = {
          total_sales: (parseFloat(shift.total_sales) || 0) + parsedAmount
        };

        if (method === "cash") {
          shiftUpdates.total_cash = (parseFloat(shift.total_cash) || 0) + parsedAmount;
        } else if (method === "card") {
          shiftUpdates.total_card = (parseFloat(shift.total_card) || 0) + parsedAmount;
        } else if (method === "upi") {
          shiftUpdates.total_upi = (parseFloat(shift.total_upi) || 0) + parsedAmount;
        }

        const { error: shiftError } = await supabaseAdmin
          .from("pos_shifts")
          .update(shiftUpdates)
          .eq("id", shift_id);

        if (shiftError) console.error("Failed to update shift totals:", shiftError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        payment,
        change_given: changeGiven,
        order_id,
        payment_status: "paid"
      }
    }, { status: 201 });
  } catch (error) {
    console.error("POS Payments POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
