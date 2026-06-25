import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { calculateOrderTotal } from '@/lib/products';

// Rate limiting stub
const RATE_LIMIT_WINDOW = 60000;

export async function POST(req) {
  try {
    const { cartItems, shippingCost } = await req.json();

    if (!cartItems || shippingCost === undefined) {
      return NextResponse.json({ error: "Missing cart data" }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.NEXT_SECRET_RAZORPAY_KEY) {
      return NextResponse.json({ error: "Razorpay keys are missing" }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.NEXT_SECRET_RAZORPAY_KEY,
    });

    const amount = await calculateOrderTotal(cartItems, Number(shippingCost));

    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    };

    // Order creation will use the actual keys

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment gateway' },
      { status: 500 }
    );
  }
}
