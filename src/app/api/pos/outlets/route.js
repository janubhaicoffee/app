import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Check if user is superadmin via env email or admin_profiles
    let isSuperAdmin = false;
    let userRole = 'staff';
    let hasGlobalOutletAccess = false;

    try {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (userData?.user) {
        const adminEmails = (process.env.SUPERADMIN_EMAILS || '')
          .split(',')
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
        if (adminEmails.includes(userData.user.email?.toLowerCase())) {
          isSuperAdmin = true;
          userRole = 'superadmin';
          hasGlobalOutletAccess = true;
        } else {
          // Check admin_profiles
          const { data: adminProf } = await supabaseAdmin
            .from('admin_profiles')
            .select('*')
            .or(`phone.eq.${userData.user.phone || ''},email.eq.${userData.user.email || ''}`)
            .maybeSingle();

          if (adminProf) {
            userRole = adminProf.role || 'superadmin';
            if (['superadmin', 'operations_head', 'growth'].includes(userRole)) {
              hasGlobalOutletAccess = true;
            }
          } else {
            // Check outlet_staff for role
            const emailFilter = userData.user.email ? `email.eq.${userData.user.email}` : '';
            const phoneFilter = userData.user.phone ? `phone.eq.${userData.user.phone}` : '';
            const userIdFilter = `user_id.eq.${userId}`;
            const orFilter = [userIdFilter, emailFilter, phoneFilter].filter(Boolean).join(',');

            const { data: staffMember } = await supabaseAdmin
              .from('outlet_staff')
              .select('*')
              .or(orFilter)
              .eq('is_active', true)
              .maybeSingle();

            if (staffMember) {
              userRole = staffMember.role || 'employee';
              if (['superadmin', 'operations_head', 'growth'].includes(userRole)) {
                hasGlobalOutletAccess = true;
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error checking role in POS outlets:', err);
    }

    if (isSuperAdmin || hasGlobalOutletAccess) {
      const { data: outlets, error: outletsError } = await supabaseAdmin
        .from('outlets')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (outletsError) throw outletsError;
      return NextResponse.json({
        success: true,
        data: outlets || [],
        isSuperAdmin,
        role: userRole,
        canSwitchOutlets: true,
      });
    }

    const { data: staffRecords, error: staffError } = await supabaseAdmin
      .from('outlet_staff')
      .select('outlet_id')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (staffError) throw staffError;

    if (!staffRecords || staffRecords.length === 0) {
      return NextResponse.json({ success: true, data: [], role: userRole, canSwitchOutlets: false });
    }

    const outletIds = staffRecords.map((r) => r.outlet_id).filter(Boolean);

    const { data: outlets, error: outletsError } = await supabaseAdmin
      .from('outlets')
      .select('*')
      .in('id', outletIds)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (outletsError) throw outletsError;

    return NextResponse.json({
      success: true,
      data: outlets || [],
      isSuperAdmin: false,
      role: userRole,
      canSwitchOutlets: outlets && outlets.length > 1,
    });
  } catch (error) {
    console.error('POS Outlets GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
