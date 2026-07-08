import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.NEXT_SECRET_RAZORPAY_KEY,
});

export async function POST(request) {
  try {
    const {
      outletCode,
      items,
      customerName,
      customerPhone,
      notes,
      paymentMode,
      userId,
      guestCount,
    } = await request.json();

    if (!outletCode || !items?.length || !customerName || !customerPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: outlet, error: outletErr } = await supabaseAdmin
      .from('outlets')
      .select('id')
      .eq('code', outletCode)
      .maybeSingle();

    if (outletErr || !outlet) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 });
    }

    // Upsert customer in unified customers table
    const { error: custErr } = await supabaseAdmin.rpc('upsert_customer_by_phone', {
      p_phone: customerPhone,
      p_name: customerName,
      p_email: null,
    });

    if (custErr) {
      const { data: existing } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('phone', customerPhone)
        .maybeSingle();

      if (existing) {
        const { data: current } = await supabaseAdmin
          .from('customers')
          .select('visit_count')
          .eq('id', existing.id)
          .single();
        await supabaseAdmin
          .from('customers')
          .update({
            name: customerName,
            visit_count: (current?.visit_count || 0) + 1,
            last_visit_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabaseAdmin.from('customers').insert({
          phone: customerPhone,
          name: customerName,
          visit_count: 1,
          last_visit_at: new Date().toISOString(),
        });
      }
    }

    if (userId) {
      await supabaseAdmin
        .from('customers')
        .update({ user_id: userId, updated_at: new Date().toISOString() })
        .eq('phone', customerPhone);
    }

    // Generate order number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const { count } = await supabaseAdmin
      .from('pos_orders')
      .select('*', { count: 'exact', head: true })
      .eq('outlet_id', outlet.id)
      .gte('created_at', new Date().toISOString().slice(0, 10));

    const orderNumber = `QR-${dateStr}-${(count || 0) + 1}`;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal;

    // Create Razorpay order if online payment
    let razorpayOrder = null;
    if (paymentMode === 'online' && total > 0) {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(total * 100),
        currency: 'INR',
        receipt: orderNumber,
        notes: { outletCode, customerPhone },
      });
    }

    // Create pos_order
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('pos_orders')
      .insert({
        outlet_id: outlet.id,
        order_number: orderNumber,
        type: 'dine_in',
        status: 'pending',
        source: 'qr_menu',
        subtotal,
        tax_total: 0,
        total,
        payment_status: paymentMode === 'online' ? 'pending' : 'unpaid',
        payment_method: paymentMode === 'online' ? 'razorpay' : 'cash',
        customer_name: customerName,
        customer_phone: customerPhone,
        guest_count: guestCount || 1,
        notes,
        razorpay_order_id: razorpayOrder?.id || null,
      })
      .select()
      .single();

    if (orderErr) {
      return NextResponse.json({ error: orderErr.message }, { status: 500 });
    }

    // Insert order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      outlet_id: outlet.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      status: 'pending',
    }));

    const { error: itemsErr } = await supabaseAdmin.from('pos_order_items').insert(orderItems);

    if (itemsErr) {
      console.error('Failed to insert order items:', itemsErr);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber,
      total,
      paymentStatus: order.payment_status,
      razorpayOrderId: razorpayOrder?.id || null,
      amount: razorpayOrder?.amount ? Math.round(total * 100) : null,
    });
  } catch (err) {
    console.error('QR order error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
