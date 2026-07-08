import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

function mapOutletToFrontend(o) {
  if (!o) return null;
  return {
    ...o,
    status: o.is_active ? 'active' : 'inactive',
    settings: {
      gstin: o.gstin || '',
      manager_name: o.manager_name || '',
      manager_phone: o.manager_phone || '',
      rent: o.rent_monthly || 0,
      electricity: o.electricity_monthly || 0,
      water: o.water_monthly || 0,
      internet: o.internet_monthly || 0,
      cogs: o.cogs_percentage || 0,
    },
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const { data, error } = await supabaseAdmin.from('outlets').select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Outlet not found' }, { status: 404 });
        }
        throw error;
      }
      return NextResponse.json({ success: true, data: mapOutletToFrontend(data) });
    }

    const { data, error } = await supabaseAdmin
      .from('outlets')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data: (data || []).map(mapOutletToFrontend) });
  } catch (error) {
    console.error('Admin Outlets GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      code,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      opening_time,
      closing_time,
      status,
      settings,
    } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Missing required fields: name, code' }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from('outlets')
      .select('id')
      .eq('code', code.toUpperCase())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Outlet code already exists' }, { status: 409 });
    }

    const setObj = settings || {};
    const { data, error } = await supabaseAdmin
      .from('outlets')
      .insert([
        {
          name,
          code: code.toUpperCase(),
          address: address || null,
          city: city || null,
          state: state || null,
          pincode: pincode || null,
          phone: phone || null,
          email: email || null,
          opening_time: opening_time || '08:00',
          closing_time: closing_time || '22:00',
          is_active: status !== undefined ? status === 'active' : true,
          gstin: setObj.gstin || null,
          manager_name: setObj.manager_name || null,
          manager_phone: setObj.manager_phone || null,
          rent_monthly: setObj.rent ? parseFloat(setObj.rent) : 0,
          electricity_monthly: setObj.electricity ? parseFloat(setObj.electricity) : 0,
          water_monthly: setObj.water ? parseFloat(setObj.water) : 0,
          internet_monthly: setObj.internet ? parseFloat(setObj.internet) : 0,
          cogs_percentage: setObj.cogs ? parseFloat(setObj.cogs) : 35,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data: mapOutletToFrontend(data) }, { status: 201 });
  } catch (error) {
    console.error('Admin Outlets POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      code,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      opening_time,
      closing_time,
      status,
      settings,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing outlet id' }, { status: 400 });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (code !== undefined) updates.code = code.toUpperCase();
    if (address !== undefined) updates.address = address;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (pincode !== undefined) updates.pincode = pincode;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (opening_time !== undefined) updates.opening_time = opening_time;
    if (closing_time !== undefined) updates.closing_time = closing_time;
    if (status !== undefined) updates.is_active = status === 'active';

    if (settings !== undefined) {
      const setObj = settings || {};
      if (setObj.gstin !== undefined) updates.gstin = setObj.gstin;
      if (setObj.manager_name !== undefined) updates.manager_name = setObj.manager_name;
      if (setObj.manager_phone !== undefined) updates.manager_phone = setObj.manager_phone;
      if (setObj.rent !== undefined)
        updates.rent_monthly = setObj.rent ? parseFloat(setObj.rent) : 0;
      if (setObj.electricity !== undefined)
        updates.electricity_monthly = setObj.electricity ? parseFloat(setObj.electricity) : 0;
      if (setObj.water !== undefined)
        updates.water_monthly = setObj.water ? parseFloat(setObj.water) : 0;
      if (setObj.internet !== undefined)
        updates.internet_monthly = setObj.internet ? parseFloat(setObj.internet) : 0;
      if (setObj.cogs !== undefined)
        updates.cogs_percentage = setObj.cogs ? parseFloat(setObj.cogs) : 35;
    }

    const { data, error } = await supabaseAdmin
      .from('outlets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data: mapOutletToFrontend(data) });
  } catch (error) {
    console.error('Admin Outlets PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing outlet id' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('outlets').delete().eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Outlets DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
