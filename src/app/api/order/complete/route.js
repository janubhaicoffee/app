import { createShipment } from "@/lib/nimbuspost";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from '@/lib/supabaseWrapper';
import { Resend } from 'resend';
import { calculateOrderTotal, getProductCatalog } from "@/lib/products";

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

// Missing Service Role check
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("WARNING: SUPABASE_SERVICE_ROLE_KEY is missing. RLS might block inserts.");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { formData, cartItems, shippingRate, finalTotal: clientFinalTotal, paymentId, razorpayOrderId, razorpaySignature, isGift, giftMessage, isSubscription, subscriptionId, subscriptionFrequency, userId } = body;

    if (!formData || !cartItems || !shippingRate || !clientFinalTotal || !paymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ success: false, error: "Missing required order data or payment signatures" }, { status: 400 });
    }

    // Input Validation (Regex)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone)) return NextResponse.json({ success: false, error: "Invalid phone number" }, { status: 400 });
    
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(formData.pincode)) return NextResponse.json({ success: false, error: "Invalid 6-digit pincode" }, { status: 400 });

    // Server-Side Price Verification
    const finalTotal = await calculateOrderTotal(cartItems, parseFloat(shippingRate.shipping_cost));
    if (finalTotal !== clientFinalTotal) {
      console.error(`Price mismatch: Server ${finalTotal} != Client ${clientFinalTotal}`);
      return NextResponse.json({ success: false, error: "Price mismatch detected. Order rejected." }, { status: 400 });
    }

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

    const orderNumber = `JB-${Math.floor(Date.now() / 1000)}`;

    const catalog = await getProductCatalog();
    const productMap = catalog.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
    
    const coffeeItems = cartItems;

    let awbNumber = null;
    let shipmentData = null;
    let qikinkOrderData = null;

    // Process Coffee items via Nimbuspost
    if (coffeeItems.length > 0) {
      const weight = coffeeItems.reduce((acc, item) => acc + ((productMap[item.id]?.weight || 500) * item.quantity), 0);
      
      const orderData = {
        order_number: orderNumber,
        shipping_charges: parseFloat(shippingRate.shipping_cost),
        discount: 0,
        cod_charges: isCOD ? finalTotal : 0,
        payment_type: isCOD ? "cod" : "prepaid",
        order_amount: finalTotal,
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
          state: formData.state,
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
        order_items: coffeeItems.map(item => ({
          name: item.name,
          qty: item.quantity.toString(),
          price: item.price.toString(),
          sku: item.id
        })),
        courier_id: (shippingRate.courier_id === 'qikink' ? 1 : shippingRate.courier_id).toString()
      };

      try {
        shipmentData = await createShipment(orderData);
        awbNumber = shipmentData.awb_number;
      } catch (shipmentErr) {
        console.error("Failed to create Nimbuspost shipment:", shipmentErr);
      }
    }



    // 4. Save Order to Supabase
    // Sanitize gift message against XSS
    const sanitizedGiftMessage = giftMessage ? giftMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";

    const { data: orderRow, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId || null,
        customer_email: formData.email || null,
        customer_phone: formData.phone || null,
        total_amount: finalTotal,
        status: awbNumber ? "processing" : "payment_successful_shipping_failed",
        razorpay_order_id: isSubscription ? null : razorpayOrderId,
        razorpay_payment_id: paymentId,
        awb_number: awbNumber,
        is_gift: isGift || false,
        gift_message: sanitizedGiftMessage
      })
      .select('id')
      .single();

    if (orderError) {
      console.error("Supabase Order Insert Error (Supressed PII)");
      throw new Error("Database insertion failed");
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
      console.error("Supabase Order Insert Error (Supressed PII)");
      throw new Error("Database insertion failed");
    }

    // 5. Save Order Items (catalog and productMap already created)
    
    const orderItemsToInsert = cartItems.map(item => {
      let itemPrice = productMap[item.id]?.price || 0;
      if (item.variant_id && productMap[item.id]?.variants) {
         const v = productMap[item.id].variants.find(v => v.id === item.variant_id);
         if (v) itemPrice = v.price;
      }
      return {
        order_id: orderRow.id,
        product_id: item.id.toString(),
        product_name: item.name,
        quantity: item.quantity,
        price: itemPrice
      };
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error("Supabase Order Items Insert Error");
    }

    // 5.5 Deduct Stock
    for (const item of cartItems) {
      const p = productMap[item.id];
      if (!p) continue;
      
      if (item.variant_id && p.variants && Array.isArray(p.variants)) {
        const newVariants = p.variants.map(v => {
          if (v.id === item.variant_id) {
            return { ...v, stock: Math.max(0, v.stock - item.quantity) };
          }
          return v;
        });
        // We also update base product stock to reflect total variant stock roughly, or just let variants govern themselves.
        await supabase.from('products').update({ variants: newVariants }).eq('id', p.id);
      } else {
        await supabase.from('products').update({ stock: Math.max(0, p.stock - item.quantity) }).eq('id', p.id);
      }
    }

    // 6. Send Order Confirmation Email via Resend
    if (formData.email && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'Janu Bhai Coffee <hello@janubhai.com>',
          to: [formData.email],
          subject: `Order Confirmation #${orderNumber} - Janu Bhai`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h1 style="color: #e74c3c;">Thank you for your order!</h1>
              <p>Hi ${formData.name},</p>
              <p>We've received your order <strong>#${orderNumber}</strong> and we're getting it ready to ship.</p>
              
              <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Order Details:</h3>
                <p><strong>Total Amount:</strong> ₹${finalTotal}</p>
                ${awbNumber ? `<p><strong>Tracking Number (AWB):</strong> ${awbNumber}</p>` : ''}
              </div>

              <h3>Shipping Address:</h3>
              <p>${formData.address}<br/>${formData.city}, ${formData.pincode}</p>

              <p style="margin-top: 30px;">You can track your order status by logging into your account at janubhai.com using this email address.</p>
              <p>Cheers,<br/><strong>The Janu Bhai Team</strong></p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error("Failed to send order confirmation email:", emailErr);
        // We don't fail the order if the email fails
      }
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
    return NextResponse.json({ success: false, error: error.message || "An internal server error occurred" }, { status: 500 });
  }
}
