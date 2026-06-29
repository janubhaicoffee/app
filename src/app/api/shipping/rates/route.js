import { getShippingRates } from "@/lib/nimbuspost";
import { NextResponse } from "next/server";
import { calculateOrderTotal, getProductCatalog } from "@/lib/products";

export async function POST(request) {
  try {
    const body = await request.json();
    const { destination, cartItems } = body;

    if (!destination || !cartItems) {
      return NextResponse.json({ success: false, error: "Missing required fields: destination, cartItems" }, { status: 400 });
    }

    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(destination)) {
      return NextResponse.json({ success: false, error: "Invalid 6-digit pincode" }, { status: 400 });
    }

    // Secure calculation on server side
    const order_amount = await calculateOrderTotal(cartItems, 0);
    const catalog = await getProductCatalog();
    const productMap = catalog.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

    const coffeeItems = cartItems;

    const weight = coffeeItems.reduce((acc, item) => {
      const prod = productMap[item.id];
      return acc + ((prod?.weight || 500) * item.quantity);
    }, 0);

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
