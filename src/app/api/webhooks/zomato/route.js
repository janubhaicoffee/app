import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { processDeliveryOrder } from '@/lib/deliveryUtils';

async function verifyHmacSha256(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

async function getZomatoCredentials() {
  const { data } = await supabaseAdmin
    .from('outlet_delivery_keys')
    .select('*')
    .eq('id', 'zomato')
    .eq('active', true)
    .single();
  return data;
}

export async function POST(request) {
  try {
    const credentials = await getZomatoCredentials();
    if (!credentials) {
      return NextResponse.json(
        { code: 200, status: 'failure', message: 'Zomato integration not configured' },
        { status: 200 },
      );
    }

    const rawBody = await request.text();
    const signature = request.headers.get('x-zomato-signature');

    if (signature && credentials.client_secret) {
      const valid = await verifyHmacSha256(rawBody, signature, credentials.client_secret);
      if (!valid) {
        return NextResponse.json(
          { code: 401, status: 'failure', message: 'Invalid signature' },
          { status: 200 },
        );
      }
    }

    const body = JSON.parse(rawBody);

    const order = body.order || body;
    const items = (order.order_items || order.items || []).map((i) => ({
      name: i.menu_item_name || i.name || i.item_name || 'Item',
      quantity: i.qty || i.quantity || 1,
      price: i.price || 0,
    }));
    const total = parseFloat(order.order_total || order.total || body.total || 0);
    const customerName = order.customer_name || order.customer?.name || 'Zomato Customer';

    await processDeliveryOrder({
      partner: 'zomato',
      items,
      total,
      couponUsed: body.coupon_code || order.coupon_code || null,
      customerName,
    });

    return NextResponse.json({
      code: 200,
      status: 'success',
      message: 'Order received successfully',
      external_order_id: order.order_id || null,
    });
  } catch (error) {
    console.error('Zomato webhook error:', error);
    return NextResponse.json(
      { code: 400, status: 'failure', message: error.message, rejection_message_id: 0 },
      { status: 200 },
    );
  }
}
