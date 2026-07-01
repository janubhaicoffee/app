import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.NEXT_SECRET_RAZORPAY_KEY,
});

export async function POST(request) {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = await request.json();

    if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 });
    }

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.NEXT_SECRET_RAZORPAY_KEY)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Update pos_order
    const { error } = await supabaseAdmin
      .from('pos_orders')
      .update({
        payment_status: 'paid',
        razorpay_payment_id: razorpayPaymentId,
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Payment verified' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
