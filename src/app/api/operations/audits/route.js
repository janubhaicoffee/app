import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyStaffAuth } from '@/lib/staffAuth';

export const OPERATIONS_14_AREAS = [
  { id: 'outlet_status', num: 1, name: 'Outlet Status', desc: 'Shop is open and functioning normally. All key systems are working.' },
  { id: 'manager_checks', num: 2, name: 'Manager', desc: 'Manager is doing checks, leading the team and reporting on time.' },
  { id: 'staff_discipline', num: 3, name: 'Staff', desc: 'Attendance, hygiene, discipline, uniform, grooming and customer handling.' },
  { id: 'food_menu', num: 4, name: 'Food & Menu', desc: 'All required ingredients and menu items are available.' },
  { id: 'quality_hygiene', num: 5, name: 'Quality & Hygiene', desc: 'Kitchen, machines, fridge/freezer, cleanliness and hygiene standards.' },
  { id: 'cash_sales', num: 6, name: 'Cash & Sales', desc: 'Registers checked. Sales recorded. Discrepancies identified.' },
  { id: 'staff_consumption_wastage', num: 7, name: 'Staff Consumption / Wastage', desc: 'Staff consumption and wastage recorded and within limits.' },
  { id: 'maintenance_repairs', num: 8, name: 'Maintenance', desc: 'Shop, electricity, leakage, equipment and repairs - all working fine.' },
  { id: 'vendors_work', num: 9, name: 'Vendors', desc: 'Approved vendors. Work completed. Payments and receipts in place.' },
  { id: 'compliance_licenses', num: 10, name: 'Compliance', desc: 'FSSAI, GST, required documents and displays are in place.' },
  { id: 'customer_experience', num: 11, name: 'Customer Experience', desc: 'Service, speed, music, ambience. Complaints are handled.' },
  { id: 'marketing_support', num: 12, name: 'Marketing Support', desc: 'Useful photos/videos captured when required.' },
  { id: 'pending_issues', num: 13, name: 'Pending Issues', desc: 'Open issues identified and follow-up assigned.' },
  { id: 'growth_opportunity', num: 14, name: 'Growth Opportunity', desc: 'Anything worth improving, optimising or scaling.' },
];

export async function GET(req) {
  try {
    const auth = await verifyStaffAuth(req, ['operations_head', 'operations', 'operation_manager', 'manager', 'growth', 'superadmin', 'owner']);
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const { searchParams } = new URL(req.url);
    const outletId = searchParams.get('outlet_id');

    let query = supabaseAdmin
      .from('operations_control_audits')
      .select('*')
      .order('created_at', { ascending: false });

    if (outletId) {
      query = query.eq('outlet_id', outletId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [], areas: OPERATIONS_14_AREAS });
  } catch (err) {
    console.error('Error fetching operations audits:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch operations audits' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await verifyStaffAuth(req, ['operations_head', 'operations', 'operation_manager', 'superadmin', 'owner']);
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const body = await req.json();
    const {
      outlet_id,
      audit_date = new Date().toISOString().split('T')[0],
      reviewed_by = 'Operations Head',
      checklist_14_areas = [],
      overall_rating = 100,
      observation_id_reviewed = null,
      oh_review_notes = '',
    } = body;

    let finalOutletId = outlet_id;
    if (!finalOutletId) {
      const { data: outlet } = await supabaseAdmin.from('outlets').select('id').limit(1).maybeSingle();
      finalOutletId = outlet?.id || 'a0000000-0000-0000-0000-000000000001';
    }

    // 1. Insert Operations Audit
    const { data: audit, error: auditErr } = await supabaseAdmin
      .from('operations_control_audits')
      .insert({
        outlet_id: finalOutletId,
        audit_date,
        reviewed_by,
        checklist_14_areas,
        overall_rating: Number(overall_rating || 100),
      })
      .select()
      .single();

    if (auditErr) throw auditErr;

    // 2. If reviewing a specific manager observation, update observation record
    if (observation_id_reviewed) {
      await supabaseAdmin
        .from('manager_observations')
        .update({
          reviewed_by_oh: true,
          oh_review_notes,
          oh_reviewed_at: new Date().toISOString(),
        })
        .eq('id', observation_id_reviewed);
    }

    return NextResponse.json({ success: true, data: audit });
  } catch (err) {
    console.error('Error saving operations control audit:', err);
    return NextResponse.json({ error: err.message || 'Failed to save operations audit' }, { status: 500 });
  }
}
