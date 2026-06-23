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

    const amount = calculateOrderTotal(cartItems, Number(shippingCost));

    const options = {
      amount: (amount * 100).toString(), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 1000)}`,
    };

    // Order creation will use the actual keys

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Error creating order' },
      { status: 500 }
    );
  }
}
