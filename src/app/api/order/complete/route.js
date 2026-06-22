import { createShipment } from "@/lib/nimbuspost";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client to bypass RLS for inserting orders
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { formData, cartItems, shippingRate, finalTotal, paymentId, razorpayOrderId, razorpaySignature, isGift, giftMessage, isSubscription, subscriptionId, subscriptionFrequency, userId } = body;

    if (!formData || !cartItems || !shippingRate || !finalTotal || !paymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ success: false, error: "Missing required order data or payment signatures" }, { status: 400 });
    }

    // 1. Verify Razorpay Signature
    const secret = process.env.NEXT_SECRET_RAZORPAY_KEY;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpayOrderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json({ success: false, error: "Invalid payment signature. Payment verification failed." }, { status: 400 });
    }

    const orderNumber = `JB-${Math.floor(Date.now() / 1000)}`;
    const weight = cartItems.reduce((acc, item) => acc + (500 * item.quantity), 0) || 500;

    // 2. Prepare order payload for Nimbuspost
    const orderData = {
      order_number: orderNumber,
      shipping_charges: parseFloat(shippingRate.shipping_cost),
      discount: 0,
      cod_charges: 0,
      payment_type: "prepaid", // We don't have COD
      order_amount: finalTotal,
      package_weight: weight,
      package_length: 10,
      package_breadth: 10,
      package_height: 10,
      request_auto_pickup: "yes", // Crucial: automatically schedule pickup!
      consignee: {
        name: formData.name,
        address: formData.address,
        address_2: "",
        city: formData.city,
        state: formData.city, // If state is missing, fallback to city
        pincode: formData.pincode,
        phone: formData.phone
      },
      pickup: {
        warehouse_name: "Janu Bhai HQ",
        name: "Janu Bhai Team",
        address: "Janu Bhai Fulfillment Center",
        address_2: "",
        city: "New Delhi",
        state: "Delhi",
        pincode: process.env.NIMBUSPOST_WAREHOUSE_PINCODE || "110001",
        phone: "9999999999"
      },
      order_items: cartItems.map(item => ({
        name: item.name,
        qty: item.quantity.toString(),
        price: item.price.toString(),
        sku: item.id
      })),
      courier_id: shippingRate.courier_id.toString()
    };

    // 3. Create the shipment
    let awbNumber = null;
    let shipmentData = null;
    try {
      shipmentData = await createShipment(orderData);
      awbNumber = shipmentData.awb_number;
    } catch (shipmentErr) {
      console.error("Failed to create Nimbuspost shipment:", shipmentErr);
      // We will still process the order in DB even if shipping fails, but flag it
    }

    // 4. Save Order to Supabase
    const { data: orderRow, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId || null,
        total_amount: finalTotal,
        status: awbNumber ? "processing" : "payment_successful_shipping_failed",
        razorpay_order_id: isSubscription ? null : razorpayOrderId,
        razorpay_payment_id: paymentId,
        awb_number: awbNumber,
        is_gift: isGift || false,
        gift_message: giftMessage || ""
      })
      .select('id')
      .single();

    if (orderError) {
      console.error("Supabase Order Insert Error:", orderError);
      throw new Error("Failed to save order to database.");
    }

    // 4.5 Save Subscription if applicable
    if (isSubscription && subscriptionId) {
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId || null,
          razorpay_sub_id: subscriptionId,
          status: "active",
          frequency: subscriptionFrequency,
          cart_snapshot: { cartItems, formData }
        });
        
      if (subError) {
        console.error("Supabase Subscription Insert Error:", subError);
      }
    }

    if (orderError) {
      console.error("Supabase Order Insert Error:", orderError);
      throw new Error("Failed to save order to database.");
    }

    // 5. Save Order Items
    const orderItemsToInsert = cartItems.map(item => ({
      order_id: orderRow.id,
      product_id: item.id.toString(),
      product_name: item.name,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error("Supabase Order Items Insert Error:", itemsError);
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      awb: awbNumber,
      order_number: orderNumber,
      shipmentData
    });

  } catch (error) {
    console.error("Order Completion Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
