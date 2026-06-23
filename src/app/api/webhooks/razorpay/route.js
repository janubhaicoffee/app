import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createShipment } from "@/lib/nimbuspost";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) return NextResponse.json({ error: "Webhook secret is missing" }, { status: 500 });

    const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Webhook Target Validation
    if (process.env.RAZORPAY_ACCOUNT_ID && event.account_id !== process.env.RAZORPAY_ACCOUNT_ID) {
      return NextResponse.json({ error: "Invalid account_id" }, { status: 400 });
    }

    // Webhook Replay Protection
    // Check if the event_id has already been processed to prevent replay attacks
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('event_id', event.id)
      .single();

    if (existingEvent) {
      return NextResponse.json({ status: "ok", message: "Event already processed" });
    }

    // Log the event as processed
    await supabase.from('webhook_events').insert({ event_id: event.id, event_type: event.event });

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      
      const { error } = await supabase
        .from("orders")
        .update({ status: "payment_webhook_received" })
        .eq("razorpay_order_id", razorpayOrderId);

      if (error) console.error("Razorpay Webhook Supabase Error");
    }

    if (event.event === "subscription.charged") {
      const paymentEntity = event.payload.payment.entity;
      const subId = event.payload.subscription.entity.id;
      const paymentId = paymentEntity.id;
      const amount = paymentEntity.amount / 100;

      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id")
        .eq("razorpay_payment_id", paymentId)
        .single();
        
      if (!existingOrder) {
        const { data: subData } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("razorpay_sub_id", subId)
          .single();

        if (subData) {
          const { cartItems, formData } = subData.cart_snapshot;
          const orderNumber = `JB-SUB-${Math.floor(Date.now() / 1000)}`;
          const weight = cartItems.reduce((acc, item) => acc + (500 * item.quantity), 0) || 500;
          
          const orderData = {
            order_number: orderNumber,
            shipping_charges: 0,
            discount: 0,
            cod_charges: 0,
            payment_type: "prepaid",
            order_amount: amount,
            package_weight: weight,
            package_length: 10,
            package_breadth: 10,
            package_height: 10,
            request_auto_pickup: "yes",
            consignee: {
              name: formData.name,
              address: formData.address,
              address_2: "",
              city: formData.city,
              state: formData.city,
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
            courier_id: "1"
          };

          let awbNumber = null;
          try {
            // Using static import at top instead of dynamic require
            const shipmentData = await createShipment(orderData);
            awbNumber = shipmentData.awb_number;
          } catch (e) {
            console.error("Auto Shipment failed");
          }

          await supabase
            .from("orders")
            .insert({
              user_id: subData.user_id,
              total_amount: amount,
              status: awbNumber ? "processing" : "payment_successful_shipping_failed",
              razorpay_payment_id: paymentId,
              awb_number: awbNumber
            });
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Razorpay Webhook Error");
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
