import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    // Initialize a service role client to bypass RLS for server-side operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'
    );

    const body = await req.json();
    const { updates, outletId } = body; 
    // updates expected as: [{ id: 'item-id', stock_level: 45 }, ...]

    if (!updates || !outletId) {
      return NextResponse.json({ error: 'Missing required payload (updates, outletId)' }, { status: 400 });
    }

    const alerts: string[] = [];

    // Process updates concurrently for speed
    await Promise.all(updates.map(async (update: any) => {
      // 1. Update the stock
      const { error: updErr } = await supabaseAdmin
        .from('inventory_items')
        .update({ current_stock: update.stock_level, last_updated: new Date().toISOString() })
        .eq('id', update.id)
        .eq('outlet_id', outletId);

      if (updErr) throw updErr;

      // 2. Fetch to check thresholds (could be combined if using returning data, but isolating for clarity)
      const { data: item } = await supabaseAdmin
        .from('inventory_items')
        .select('name, current_stock, min_stock_level, unit')
        .eq('id', update.id)
        .single();

      if (item && item.current_stock < item.min_stock_level) {
        alerts.push(`CRITICAL: ${item.name} is at ${item.current_stock} ${item.unit}. Below minimum threshold of ${item.min_stock_level}!`);
      }
    }));

    return NextResponse.json({
      success: true,
      message: 'Inventory synced successfully.',
      critical_alerts: alerts.length > 0 ? alerts : null
    });

  } catch (error: any) {
    console.error('Inventory Sync Engine Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
