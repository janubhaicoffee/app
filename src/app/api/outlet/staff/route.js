import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const role = searchParams.get('role');
    const active = searchParams.get('active');

    let query = supabaseAdmin
      .from('outlet_staff')
      .select('*')
      .order('created_at', { ascending: false });

    if (outletId) query = query.eq('outlet_id', outletId);
    if (role) query = query.eq('role', role);
    if (active === 'true') query = query.eq('is_active', true);
    if (active === 'false') query = query.eq('is_active', false);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Staff GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      outlet_id,
      user_id,
      role,
      display_name,
      phone,
      email,
      pin_code,
      permissions,
      is_active,
    } = body;

    if (!outlet_id || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: outlet_id, role' },
        { status: 400 },
      );
    }

    const insertData = {
      outlet_id,
      user_id: user_id || null,
      role,
      display_name: display_name || null,
      phone: phone || null,
      email: email || null,
      pin_code: pin_code || null,
      permissions: permissions || {},
      is_active: is_active !== undefined ? !!is_active : true,
    };

    const { data, error } = await supabaseAdmin
      .from('outlet_staff')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Staff POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, role, display_name, phone, email, pin_code, permissions, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing staff id' }, { status: 400 });
    }

    const updates = {};
    if (role !== undefined) updates.role = role;
    if (display_name !== undefined) updates.display_name = display_name;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (pin_code !== undefined) updates.pin_code = pin_code;
    if (permissions !== undefined) updates.permissions = permissions;
    if (is_active !== undefined) updates.is_active = !!is_active;

    const { data, error } = await supabaseAdmin
      .from('outlet_staff')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Staff PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing staff id' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('outlet_staff').delete().eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Staff DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
