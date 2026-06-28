import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const body = await req.json();
    const { session_id, cart_payload, email } = body;

    if (!session_id || !cart_payload) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    if (cart_payload.length === 0) {
      // Cart cleared, we could optionally update status to 'cleared'
      await supabase.from('abandoned_carts').update({ status: 'cleared', updated_at: new Date().toISOString() }).eq('session_id', session_id);
      return NextResponse.json({ success: true });
    }

    // Upsert the cart
    const { error } = await supabase.from('abandoned_carts').upsert({
      session_id,
      cart_payload,
      customer_email: email || null,
      updated_at: new Date().toISOString(),
      status: 'abandoned'
    }, { onConflict: 'session_id' });

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving abandoned cart:", error);
    return NextResponse.json({ error: "Failed to save cart" }, { status: 500 });
  }
}
