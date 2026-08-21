import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

async function verifySuperAdmin(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }
  const token = authHeader.split(' ')[1];
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) return { error: 'Invalid token', status: 401 };

  // Check if caller is superadmin
  const adminEmails = (process.env.SUPERADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const isEmailAdmin = adminEmails.includes(user.email?.toLowerCase());

  if (!isEmailAdmin) {
    const { data: profile } = await supabaseAdmin
      .from('admin_profiles')
      .select('*')
      .eq('phone', user.phone || '')
      .maybeSingle();

    if (!profile || profile.role !== 'superadmin') {
      const { data: staff } = await supabaseAdmin
        .from('outlet_staff')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (!staff || !['superadmin', 'owner'].includes(staff.role)) {
        return { error: 'Only Superadmin can modify user roles and permissions', status: 403 };
      }
    }
  }

  return { caller: user };
}

export async function POST(request) {
  try {
    const auth = await verifySuperAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const {
      user_id,
      name,
      email,
      phone,
      role = 'customer',
      outlet_id,
      pin,
      monthly_salary,
      commission_on_profit,
      notes,
    } = body;

    if (!name && !email && !phone && !user_id) {
      return NextResponse.json(
        { error: 'At least one identifier (user_id, email, phone, or name) is required' },
        { status: 400 }
      );
    }

    const cleanEmail = email ? email.trim().toLowerCase() : null;
    const cleanPhone = phone ? phone.trim() : null;
    const cleanName = name ? name.trim() : 'User';

    // 1. Resolve Auth user if available
    let resolvedUserId = user_id;
    if (!resolvedUserId && cleanEmail) {
      try {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserByEmail(cleanEmail);
        if (userData?.user) {
          resolvedUserId = userData.user.id;
        }
      } catch (e) {
        console.warn('Could not lookup user by email:', e.message);
      }
    }

    // 2. Handle Superadmin Assignment
    if (role === 'superadmin' || role === 'owner') {
      await supabaseAdmin.from('admin_profiles').upsert({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role: 'superadmin',
      });

      // Update or create outlet_staff record if outlet_id is provided
      if (outlet_id) {
        const filter = cleanEmail ? { email: cleanEmail } : cleanPhone ? { phone: cleanPhone } : null;
        if (filter) {
          await supabaseAdmin.from('outlet_staff').upsert({
            user_id: resolvedUserId || null,
            display_name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            role: 'superadmin',
            outlet_id,
            pin_code: pin || null,
            is_active: true,
            monthly_salary: monthly_salary !== undefined ? monthly_salary : null,
            commission_on_profit: !!commission_on_profit,
            notes: notes || null,
          });
        }
      }
    } else if (
      [
        'operations_head',
        'operations',
        'operation_manager',
        'growth',
        'brand_leader',
        'manager',
        'store_manager',
        'cashier',
        'barista',
        'kitchen',
        'staff',
      ].includes(role)
    ) {
      // 3. Handle Operations Head / Growth / Store Manager / Staff Roles
      // Remove from admin_profiles if they were previously there and not superadmin
      if (cleanEmail || cleanPhone) {
        let adminDel = supabaseAdmin.from('admin_profiles').delete();
        if (cleanEmail) adminDel = adminDel.eq('email', cleanEmail);
        else if (cleanPhone) adminDel = adminDel.eq('phone', cleanPhone);
        await adminDel;
      }

      // Check for existing outlet_staff entry
      let staffQuery = supabaseAdmin.from('outlet_staff').select('id');
      if (resolvedUserId) staffQuery = staffQuery.eq('user_id', resolvedUserId);
      else if (cleanEmail) staffQuery = staffQuery.eq('email', cleanEmail);
      else if (cleanPhone) staffQuery = staffQuery.eq('phone', cleanPhone);

      const { data: existingStaff } = await staffQuery.maybeSingle();

      const staffPayload = {
        user_id: resolvedUserId || null,
        display_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role,
        outlet_id: outlet_id || null,
        pin_code: pin || null,
        is_active: true,
        monthly_salary: monthly_salary !== undefined ? monthly_salary : null,
        commission_on_profit: !!commission_on_profit,
        notes: notes || null,
      };

      if (existingStaff?.id) {
        await supabaseAdmin
          .from('outlet_staff')
          .update(staffPayload)
          .eq('id', existingStaff.id);
      } else {
        await supabaseAdmin.from('outlet_staff').insert([staffPayload]);
      }
    } else {
      // 4. Demote to Regular Customer (remove administrative & staff privileges)
      if (cleanEmail) {
        await supabaseAdmin.from('admin_profiles').delete().eq('email', cleanEmail);
        await supabaseAdmin.from('outlet_staff').delete().eq('email', cleanEmail);
      }
      if (cleanPhone) {
        await supabaseAdmin.from('admin_profiles').delete().eq('phone', cleanPhone);
        await supabaseAdmin.from('outlet_staff').delete().eq('phone', cleanPhone);
      }
      if (resolvedUserId) {
        await supabaseAdmin.from('outlet_staff').delete().eq('user_id', resolvedUserId);
      }
    }

    // 5. Update Supabase Auth user metadata if user_id exists
    if (resolvedUserId) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(resolvedUserId, {
          user_metadata: {
            role,
            display_name: cleanName,
            outlet_id: outlet_id || null,
          },
        });
      } catch (e) {
        console.warn('Could not update auth user metadata:', e.message);
      }
    }

    // 6. Audit Log entry
    try {
      await supabaseAdmin.from('audit_log').insert({
        admin_email: auth.caller?.email || 'superadmin',
        action: 'update_user_role',
        entity_type: 'user_role',
        entity_id: resolvedUserId || cleanEmail || cleanPhone,
        details: {
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          new_role: role,
          outlet_id,
        },
      });
    } catch (e) {
      console.warn('Audit log write error:', e.message);
    }

    return NextResponse.json({
      success: true,
      message: `User role successfully updated to ${role}`,
      data: {
        user_id: resolvedUserId,
        role,
        outlet_id,
      },
    });
  } catch (error) {
    console.error('Update User Role API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
