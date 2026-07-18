import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const role = searchParams.get('role');

    let query = supabaseAdmin
      .from('outlet_staff')
      .select('*, outlets(name, code)')
      .order('display_name', { ascending: true });

    if (outletId) query = query.eq('outlet_id', outletId);
    if (role) query = query.eq('role', role);

    const { data, error } = await query;
    if (error) throw error;

    const mappedData = (data || []).map((s) => ({
      ...s,
      name: s.display_name,
      pin: s.pin_code,
    }));

    return NextResponse.json({ success: true, data: mappedData });
  } catch (error) {
    console.error('Admin Staff GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      outlet_id, auth_user_id, name, email, phone, role, pin, password,
      monthly_salary, commission_on_profit, aadhaar_number, pan_number, notes 
    } = body;

    if (!outlet_id || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: outlet_id, name' },
        { status: 400 },
      );
    }

    let resolvedAuthUserId = auth_user_id;

    if (email && !resolvedAuthUserId) {
      try {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserByEmail(email);
        if (userData?.user) {
          resolvedAuthUserId = userData.user.id;
        } else {
          // Create new user in Supabase Auth
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: password || 'JanuBhaiPartner123!',
            email_confirm: true,
            user_metadata: { full_name: name },
          });
          if (createError) throw createError;
          resolvedAuthUserId = newUser.user.id;
        }
      } catch (err) {
        console.error('Error getting or creating user by email:', err);
        return NextResponse.json(
          { error: err.message || 'Failed to provision auth user account' },
          { status: 500 },
        );
      }
    }

    const { data: existing } = await supabaseAdmin
      .from('outlet_staff')
      .select('id')
      .eq('outlet_id', outlet_id)
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Staff member with this email already exists in this outlet' },
        { status: 409 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from('outlet_staff')
      .insert([
        {
          outlet_id,
          user_id: resolvedAuthUserId || null,
          display_name: name,
          email: email || null,
          phone: phone || null,
          role: role || 'staff',
          pin_code: pin || null,
          is_active: true,
          joined_at: new Date().toISOString(),
          monthly_salary: monthly_salary !== undefined ? monthly_salary : null,
          commission_on_profit: commission_on_profit !== undefined ? !!commission_on_profit : false,
          aadhaar_number: aadhaar_number || null,
          pan_number: pan_number || null,
          notes: notes || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    const mapped = {
      ...data,
      name: data.display_name,
      pin: data.pin_code,
    };

    return NextResponse.json({ success: true, data: mapped }, { status: 201 });
  } catch (error) {
    console.error('Admin Staff POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { 
      id, outlet_id, user_id, name, email, phone, role, pin, is_active,
      monthly_salary, commission_on_profit, aadhaar_number, pan_number, notes 
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing staff id' }, { status: 400 });
    }

    const updates = {};
    if (outlet_id !== undefined) updates.outlet_id = outlet_id;
    if (user_id !== undefined) updates.user_id = user_id;
    if (name !== undefined) updates.display_name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (role !== undefined) updates.role = role;
    if (pin !== undefined) updates.pin_code = pin;
    if (is_active !== undefined) updates.is_active = is_active;
    if (monthly_salary !== undefined) updates.monthly_salary = monthly_salary;
    if (commission_on_profit !== undefined) updates.commission_on_profit = !!commission_on_profit;
    if (aadhaar_number !== undefined) updates.aadhaar_number = aadhaar_number;
    if (pan_number !== undefined) updates.pan_number = pan_number;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabaseAdmin
      .from('outlet_staff')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const mapped = {
      ...data,
      name: data.display_name,
      pin: data.pin_code,
    };

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Admin Staff PATCH error:', error);
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
    console.error('Admin Staff DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
