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

    // 1. Check if superadmin
    const adminEmails = (process.env.SUPERADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isEmailAdmin = adminEmails.includes(user.email?.toLowerCase());

    if (isEmailAdmin) {
      return NextResponse.json({ role: 'superadmin' });
    }

    const { data: adminProfile } = await supabaseAdmin
      .from('admin_profiles')
      .select('*')
      .eq('phone', user.phone || '')
      .maybeSingle();

    if (adminProfile) {
      return NextResponse.json({ role: 'superadmin' });
    }

    // 2. Check if partner or staff
    const emailFilter = user.email ? `email.eq.${user.email}` : '';
    const phoneFilter = user.phone ? `phone.eq.${user.phone}` : '';
    const userIdFilter = `user_id.eq.${user.id}`;
    const orFilter = [userIdFilter, emailFilter, phoneFilter].filter(Boolean).join(',');

    const { data: staff } = await supabaseAdmin
      .from('outlet_staff')
      .select('*')
      .or(orFilter)
      .maybeSingle();

    if (staff) {
      // Ensure user_id is linked to the outlet_staff record
      if (staff.user_id !== user.id) {
        await supabaseAdmin
          .from('outlet_staff')
          .update({ user_id: user.id })
          .eq('id', staff.id);
      }

      if (['owner', 'partner'].includes(staff.role)) {
        return NextResponse.json({ role: 'partner', staffRole: staff.role, outletId: staff.outlet_id });
      }
      return NextResponse.json({ role: 'staff', staffRole: staff.role, outletId: staff.outlet_id });
    }

    return NextResponse.json({ role: 'customer' });
  } catch (error) {
    console.error('Check role API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
