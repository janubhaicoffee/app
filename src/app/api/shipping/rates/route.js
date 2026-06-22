import { getShippingRates } from "@/lib/nimbuspost";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { destination, weight, order_amount } = body;

    if (!destination || !weight || !order_amount) {
      return NextResponse.json({ success: false, error: "Missing required fields: destination, weight, order_amount" }, { status: 400 });
    }

    // Call Nimbuspost to get serviceability and rates for prepaid payment
    const rates = await getShippingRates({
      destination,
      weight,
      order_amount,
      payment_type: "prepaid"
    });

    // The Nimbuspost API returns an array of available couriers. 
    // We will find the cheapest one or just return the first available one to the frontend.
    if (!rates || rates.length === 0) {
      return NextResponse.json({ success: false, error: "Service unserviceable for this pincode" }, { status: 400 });
    }

    // Sort by freight_charges ascending so we pick the cheapest courier rate
    rates.sort((a, b) => parseFloat(a.freight_charges) - parseFloat(b.freight_charges));
    const cheapestRate = rates[0];

    return NextResponse.json({
      success: true,
      shipping_cost: parseFloat(cheapestRate.freight_charges),
      courier_id: cheapestRate.courier_id,
      courier_name: cheapestRate.courier_name,
      estimated_delivery_days: cheapestRate.delivery_days || "3-5"
    });

  } catch (error) {
    console.error("Shipping Rates Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
