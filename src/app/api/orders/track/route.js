import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { trackShipment } from "@/lib/nimbuspost";

export async function POST(request) {
  try {
    const { query } = await request.json();

    if (!query || !query.trim()) {
      return NextResponse.json({ success: false, error: "Missing tracking query" }, { status: 400 });
    }

    const searchQuery = query.trim();
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

    let orderRow = null;

    // 1. Find Order in database
    if (uuidRegex.test(searchQuery)) {
      const { data } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("id", searchQuery)
        .maybeSingle();
      orderRow = data;
    } else if (searchQuery.startsWith("JB-")) {
      const { data } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("order_number", searchQuery)
        .maybeSingle();
      orderRow = data;
    } else {
      const { data } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("awb_number", searchQuery)
        .maybeSingle();
      orderRow = data;
    }

    // 2. Fallback: Search Nimbuspost directly if input looks like an AWB but order is not found
    if (!orderRow) {
      if (/^[0-9]{8,20}$/.test(searchQuery)) {
        try {
          const npData = await trackShipment(searchQuery);
          if (npData && npData.status) {
            return NextResponse.json({
              success: true,
              source: "nimbuspost_direct",
              tracking: {
                status: npData.status,
                awb_number: npData.awb_number,
                order_number: npData.order_number || "N/A",
                courier_name: npData.courier_name || "Courier Partner",
                history: npData.history || []
              }
            });
          }
        } catch (npErr) {
          console.error("Direct Nimbuspost tracking fallback failed:", npErr);
        }
      }

      return NextResponse.json({ success: false, error: "Order or AWB not found. Check details and try again." }, { status: 404 });
    }

    // 3. Fetch Order Items
    const { data: orderItems } = await supabaseAdmin
      .from("order_items")
      .select("*")
      .eq("order_id", orderRow.id);

    // 4. Parse & Mask Customer Shipping Details
    const addressInfo = typeof orderRow.shipping_address === "string"
      ? JSON.parse(orderRow.shipping_address)
      : orderRow.shipping_address || {};

    const maskEmail = (email) => {
      if (!email) return "N/A";
      const parts = email.split("@");
      if (parts.length !== 2) return email;
      const name = parts[0];
      const domain = parts[1];
      if (name.length <= 2) return `${name[0]}***@${domain}`;
      return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
    };

    const maskPhone = (phone) => {
      if (!phone) return "N/A";
      const cleaned = phone.replace(/\D/g, "");
      if (cleaned.length < 4) return phone;
      return `${"*".repeat(cleaned.length - 4)}${cleaned.slice(-4)}`;
    };

    const maskedShippingAddress = {
      name: addressInfo.name || "Customer",
      city: addressInfo.city || "N/A",
      state: addressInfo.state || "N/A",
      pincode: addressInfo.pincode || "N/A",
      address: addressInfo.address ? `${addressInfo.address.substring(0, 5)}...` : "Masked for privacy"
    };

    const maskedOrder = {
      id: orderRow.id,
      order_number: orderRow.order_number || orderRow.id.split("-")[0].toUpperCase(),
      total_amount: orderRow.total_amount,
      status: orderRow.status,
      awb_number: orderRow.awb_number,
      created_at: orderRow.created_at,
      customer_email: maskEmail(orderRow.customer_email),
      customer_phone: maskPhone(orderRow.customer_phone),
      shipping_address: maskedShippingAddress,
      items: orderItems || []
    };

    // 5. Fetch Tracking History from Nimbuspost or construct local database status history
    let trackingHistory = [];
    let courierName = orderRow.courier_name || "Standard Delivery";

    if (orderRow.awb_number) {
      try {
        const npData = await trackShipment(orderRow.awb_number);
        if (npData) {
          trackingHistory = npData.history || [];
          courierName = npData.courier_name || courierName;
          maskedOrder.status = npData.status || orderRow.status;
        }
      } catch (npErr) {
        console.error("Failed to fetch live nimbuspost tracking updates:", npErr);
        // Fall back to database status mapping
      }
    }

    if (trackingHistory.length === 0) {
      const orderDate = new Date(orderRow.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      const updateDate = new Date(orderRow.updated_at || orderRow.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

      // Generate local timeline history based on database state
      trackingHistory.push({
        status_code: "CONFIRMED",
        message: "Order placed and confirmed.",
        location: "System",
        event_time: orderDate
      });

      if (orderRow.status === "payment_webhook_received" || orderRow.status === "processing" || orderRow.status === "payment_successful_shipping_failed") {
        trackingHistory.unshift({
          status_code: "PAID",
          message: "Payment captured successfully.",
          location: "Razorpay Gateway",
          event_time: updateDate
        });
      }

      if (orderRow.status === "processing") {
        trackingHistory.unshift({
          status_code: "PROCESSING",
          message: "Order is being roasted, ground, and packed at our roastery.",
          location: "Janu Bhai HQ",
          event_time: updateDate
        });
      }

      if (orderRow.status === "payment_successful_shipping_failed") {
        trackingHistory.unshift({
          status_code: "AWAITING_SHIPPING",
          message: "Order is packed. Courier assignment is pending.",
          location: "Fulfillment Center",
          event_time: updateDate
        });
      }
    }

    return NextResponse.json({
      success: true,
      source: "database",
      order: maskedOrder,
      courier_name: courierName,
      tracking: {
        status: maskedOrder.status,
        awb_number: orderRow.awb_number || null,
        order_number: maskedOrder.order_number,
        courier_name: courierName,
        history: trackingHistory
      }
    });

  } catch (error) {
    console.error("Order Tracking API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch order tracking details." }, { status: 500 });
  }
}
