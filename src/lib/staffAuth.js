import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * Validates staff authentication and role-based permissions from request headers/cookies.
 * 
 * Hierarchy & Allowed roles:
 * - 'superadmin' / 'owner': Has full access to everything.
 * - 'operations_head' / 'operations' / 'operation_manager': Operations Head (Operations, manager reviews, audits, event editing).
 * - 'growth' / 'brand_leader': Brand & Growth Leader (Brand activations, strategic priorities, pipeline, event creation).
 * - 'manager' / 'store_manager': Store Manager (Checklists, observations, defects, registers, event view-only).
 * - 'staff' / 'barista': General staff members.
 * 
 * @param {Request} request 
 * @param {string[]} allowedRoles 
 * @returns {Promise<{ user: any, staff: any, role: string, isAuthorized: boolean, response?: NextResponse }>}
 */
export async function verifyStaffAuth(request, allowedRoles = []) {
  try {
    const authHeader = request.headers.get('Authorization');
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      // Check cookies if no Bearer token
      const cookieHeader = request.headers.get('cookie') || '';
      const tokenMatch = cookieHeader.match(/sb-[a-zA-Z0-9]+-auth-token=([^;]+)/);
      if (tokenMatch && tokenMatch[1]) {
        try {
          const parsed = JSON.parse(decodeURIComponent(tokenMatch[1]));
          token = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
        } catch (e) {
          token = decodeURIComponent(tokenMatch[1]);
        }
      }
    }

    if (!token) {
      return {
        user: null,
        staff: null,
        role: 'guest',
        isAuthorized: false,
        response: NextResponse.json(
          { success: false, error: 'Unauthorized: Staff authentication token required' },
          { status: 401 }
        ),
      };
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return {
        user: null,
        staff: null,
        role: 'guest',
        isAuthorized: false,
        response: NextResponse.json(
          { success: false, error: 'Unauthorized: Invalid or expired session' },
          { status: 401 }
        ),
      };
    }

    // 1. Check if Superadmin / Founder
    const adminEmails = (process.env.SUPERADMIN_EMAILS || 'help@janubhai.com,hello@janubhai.com')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isSuperAdminEmail = adminEmails.includes(user.email?.toLowerCase());

    const { data: adminProfile } = await supabaseAdmin
      .from('admin_profiles')
      .select('*')
      .or(`email.eq.${user.email || ''},phone.eq.${user.phone || ''}`)
      .maybeSingle();

    if (isSuperAdminEmail || adminProfile) {
      return {
        user,
        staff: adminProfile || { display_name: 'Janu Bhai Admin', role: 'superadmin' },
        role: 'superadmin',
        isAuthorized: true,
      };
    }

    // 2. Query Staff record from outlet_staff
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

    if (!staff) {
      return {
        user,
        staff: null,
        role: 'customer',
        isAuthorized: false,
        response: NextResponse.json(
          { success: false, error: 'Forbidden: Access restricted to authorized Janu Bhai Cafe operations staff' },
          { status: 403 }
        ),
      };
    }

    const userRole = staff.role || 'staff';

    // Role check
    if (allowedRoles.length > 0) {
      // Superadmin and owner always have access
      const hasPermission =
        userRole === 'superadmin' ||
        userRole === 'owner' ||
        allowedRoles.includes(userRole);

      if (!hasPermission) {
        return {
          user,
          staff,
          role: userRole,
          isAuthorized: false,
          response: NextResponse.json(
            { success: false, error: `Forbidden: Requires one of [${allowedRoles.join(', ')}] role permission` },
            { status: 403 }
          ),
        };
      }
    }

    return {
      user,
      staff,
      role: userRole,
      isAuthorized: true,
    };
  } catch (err) {
    console.error('Staff Auth Verification Error:', err);
    return {
      user: null,
      staff: null,
      role: 'error',
      isAuthorized: false,
      response: NextResponse.json(
        { success: false, error: 'Internal staff authentication error' },
        { status: 500 }
      ),
    };
  }
}
