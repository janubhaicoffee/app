import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req) {
  try {
    const { amount } = await req.json();

    // Ensure we have API keys (fallback to test keys if not present, though in real prod it will fail without actual keys)
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
    });

    const options = {
      amount: (amount * 100).toString(), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 1000)}`,
    };

    // Since we're using dummy keys, Razorpay will fail if they are invalid.
    // For the sake of this test implementation without real keys, we return a mock order if dummy keys are detected.
    if (process.env.RAZORPAY_KEY_ID === undefined) {
       console.log("Mocking Razorpay Order because actual keys are missing in env");
       return NextResponse.json({
         orderId: `order_mock_${Math.floor(Math.random() * 10000)}`
       });
    }

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
