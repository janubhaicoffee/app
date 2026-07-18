import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    if (!outletId) return NextResponse.json({ error: 'Missing outletId' }, { status: 400 });

    const supabaseClient = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: outlet } = await supabaseAdmin
      .from('outlets')
      .select('id, name, opening_time, closing_time')
      .eq('id', outletId)
      .single();

    const { data: posConfig } = await supabaseAdmin
      .from('outlet_settings')
      .select('value')
      .eq('outlet_id', outletId)
      .eq('key', 'pos_config')
      .maybeSingle();
      
    const { data: notificationConfig } = await supabaseAdmin
      .from('outlet_settings')
      .select('value')
      .eq('outlet_id', outletId)
      .eq('key', 'notification_config')
      .maybeSingle();

    return NextResponse.json({
      success: true,
      data: {
        operating_hours: outlet || { opening_time: '08:00', closing_time: '22:00' },
        outlet_name: outlet?.name || 'Janu Bhai Cafe',
        pos_config: posConfig?.value || {
          terminal_name: 'Main Register 1',
          auto_print_receipt: true,
          receipt_header: 'Welcome to Janu Bhai Cafe!',
          receipt_footer: 'Thank you! Visit again.',
        },
        notifications: notificationConfig?.value || {
          low_stock: true,
          daily_report: true,
          new_orders: true,
        }
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabaseClient = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { outletId, operating_hours, pos_config, notifications } = body;
    if (!outletId) return NextResponse.json({ error: 'Missing outletId' }, { status: 400 });

    if (operating_hours) {
      await supabaseAdmin
        .from('outlets')
        .update({
          opening_time: operating_hours.opening_time,
          closing_time: operating_hours.closing_time,
        })
        .eq('id', outletId);
    }

    if (pos_config) {
      const { data: existing } = await supabaseAdmin
        .from('outlet_settings')
        .select('id')
        .eq('outlet_id', outletId)
        .eq('key', 'pos_config')
        .maybeSingle();

      if (existing) {
        await supabaseAdmin
          .from('outlet_settings')
          .update({ value: pos_config, updated_by: session.user.id, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabaseAdmin
          .from('outlet_settings')
          .insert({
            outlet_id: outletId,
            key: 'pos_config',
            value: pos_config,
            description: 'POS & Receipt Configuration',
            updated_by: session.user.id
          });
      }
    }
    
    if (notifications) {
      const { data: existingNotif } = await supabaseAdmin
        .from('outlet_settings')
        .select('id')
        .eq('outlet_id', outletId)
        .eq('key', 'notification_config')
        .maybeSingle();

      if (existingNotif) {
        await supabaseAdmin
          .from('outlet_settings')
          .update({ value: notifications, updated_by: session.user.id, updated_at: new Date().toISOString() })
          .eq('id', existingNotif.id);
      } else {
        await supabaseAdmin
          .from('outlet_settings')
          .insert({
            outlet_id: outletId,
            key: 'notification_config',
            value: notifications,
            description: 'Notification Preferences',
            updated_by: session.user.id
          });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
