import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ role: 'guest' });
    }
    const token = authHeader.split(' ')[1];

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ role: 'guest' });
    }

    // 1. Check if Superadmin (ENV whitelist or admin_profiles table)
    const adminEmails = (process.env.SUPERADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isEmailAdmin = adminEmails.includes(user.email?.toLowerCase());

    if (isEmailAdmin) {
      return NextResponse.json({
        role: 'superadmin',
        roleName: 'Super Admin',
        userId: user.id,
        email: user.email,
      });
    }

    const { data: adminProfile } = await supabaseAdmin
      .from('admin_profiles')
      .select('*')
      .or(`email.eq.${user.email || ''},phone.eq.${user.phone || ''}`)
      .maybeSingle();

    if (adminProfile && (adminProfile.role === 'superadmin' || !adminProfile.role)) {
      return NextResponse.json({
        role: 'superadmin',
        roleName: 'Super Admin',
        userId: user.id,
        email: user.email,
      });
    }

    // 2. Check if Staff / Leadership in outlet_staff
    const emailFilter = user.email ? `email.eq.${user.email}` : '';
    const phoneFilter = user.phone ? `phone.eq.${user.phone}` : '';
    const userIdFilter = `user_id.eq.${user.id}`;
    const orFilter = [userIdFilter, emailFilter, phoneFilter].filter(Boolean).join(',');

    const { data: staff } = await supabaseAdmin
      .from('outlet_staff')
      .select('*')
      .or(orFilter)
      .eq('is_active', true)
      .maybeSingle();

    if (staff) {
      // Ensure user_id is linked to the outlet_staff record
      if (staff.user_id !== user.id) {
        await supabaseAdmin
          .from('outlet_staff')
          .update({ user_id: user.id })
          .eq('id', staff.id);
      }

      // Map strictly to the 6 official roles: superadmin, operations_head, growth, manager, employee, customer
      if (staff.role === 'superadmin' || staff.role === 'owner') {
        return NextResponse.json({
          role: 'superadmin',
          roleName: 'Super Admin',
          staffName: staff.display_name,
          outletId: staff.outlet_id,
        });
      }

      if (['operations_head', 'operations', 'operation_manager', 'operations_manager', 'area_manager'].includes(staff.role)) {
        return NextResponse.json({
          role: 'operations_head',
          roleName: 'Operations Head',
          staffName: staff.display_name,
          outletId: staff.outlet_id,
        });
      }

      if (['growth', 'brand_leader'].includes(staff.role)) {
        return NextResponse.json({
          role: 'growth',
          roleName: 'Growth',
          staffName: staff.display_name,
          outletId: staff.outlet_id,
        });
      }

      if (['manager', 'store_manager'].includes(staff.role)) {
        return NextResponse.json({
          role: 'manager',
          roleName: 'Manager',
          staffName: staff.display_name,
          outletId: staff.outlet_id,
        });
      }

      // Any other staff role (barista, cashier, kitchen, staff) is unified to employee
      return NextResponse.json({
        role: 'employee',
        roleName: 'Employee',
        staffName: staff.display_name,
        outletId: staff.outlet_id,
      });
    }

    // Default to Customer
    return NextResponse.json({
      role: 'customer',
      roleName: 'Customer',
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error('Check role API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
