import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from '@/lib/supabaseWrapper';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { finalizeOrder } from '@/lib/orderUtils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      formData, 
      cartItems, 
      shippingRate, 
      finalTotal: clientFinalTotal, 
      paymentId, 
      razorpayOrderId, 
      razorpaySignature, 
      isGift, 
      giftMessage, 
      isSubscription, 
      subscriptionId, 
      subscriptionFrequency, 
      userId 
    } = body;

    if (!formData || !cartItems || !shippingRate || !clientFinalTotal || !paymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ success: false, error: "Missing required order data or payment signatures" }, { status: 400 });
    }

    // Input Validation (Regex)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone)) return NextResponse.json({ success: false, error: "Invalid phone number" }, { status: 400 });
    
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(formData.pincode)) return NextResponse.json({ success: false, error: "Invalid 6-digit pincode" }, { status: 400 });

    // 1. Verify Razorpay Signature (Skip if COD)
    const isCOD = paymentId && paymentId.startsWith("COD_") && razorpaySignature === "COD_SIGNATURE";

    if (!isCOD) {
      const secret = process.env.NEXT_SECRET_RAZORPAY_KEY;
      const payloadToSign = isSubscription 
        ? paymentId + "|" + razorpayOrderId 
        : razorpayOrderId + "|" + paymentId;

      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(payloadToSign)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return NextResponse.json({ success: false, error: "Invalid payment signature. Payment verification failed." }, { status: 400 });
      }
    }

    // 2. Retrieve or Pre-Create the Order
    let orderRow = null;

    if (!isCOD) {
      // For online orders, they should be pre-created by /api/razorpay
      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('razorpay_order_id', razorpayOrderId)
        .maybeSingle();

      orderRow = existingOrder;
    }

    // If order was not pre-created or is COD, insert it now in "pending" status
    if (!orderRow) {
      const orderNumber = isCOD ? `JB-COD-${Math.floor(Date.now() / 1000)}` : `JB-${Math.floor(Date.now() / 1000)}`;

      const { data: newOrder, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: userId || null,
          customer_email: formData.email || null,
          customer_phone: formData.phone || null,
          total_amount: clientFinalTotal,
          status: "pending",
          razorpay_order_id: isSubscription ? null : razorpayOrderId,
          razorpay_payment_id: paymentId,
          order_number: orderNumber,
          shipping_address: {
            name: formData.name,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode
          },
          is_gift: isGift || false,
          gift_message: giftMessage ? giftMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;") : ""
        })
        .select('*')
        .single();

      if (orderError || !newOrder) {
        console.error("Failed to create order on completion:", orderError);
        return NextResponse.json({ success: false, error: "Database insertion failed" }, { status: 500 });
      }

      orderRow = newOrder;

      // Save Order Items
      const orderItemsToInsert = cartItems.map(item => ({
        order_id: orderRow.id,
        product_id: item.id.toString(),
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        variant_id: item.variant_id || null
      }));

      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) {
        console.error("Failed to insert order items on completion:", itemsError);
      }
    }

    // 3. Finalize Order (create shipment, deduct stock, reward points, send email)
    const result = await finalizeOrder(orderRow, paymentId);

    // 4. Save Subscription if applicable
    if (isSubscription && subscriptionId) {
      const { error: subError } = await supabaseAdmin
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

    return NextResponse.json({
      success: true,
      message: "Order finalized successfully",
      awb: result.awb,
      order_number: orderRow.order_number,
      orderId: orderRow.id
    });

  } catch (error) {
    console.error("Order Completion Error:", error);
    return NextResponse.json({ success: false, error: error.message || "An internal server error occurred" }, { status: 500 });
  }
}
