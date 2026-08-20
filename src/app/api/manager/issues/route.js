import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyStaffAuth } from '@/lib/staffAuth';

export async function GET(req) {
  try {
    const auth = await verifyStaffAuth(req, ['manager', 'store_manager', 'operations_head', 'operations', 'operation_manager', 'growth', 'superadmin', 'owner']);
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const { searchParams } = new URL(req.url);
    const outletId = searchParams.get('outlet_id');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('manager_issue_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (outletId) {
      query = query.eq('outlet_id', outletId);
    }
    if (status) {
      query = query.eq('resolution_status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('Error fetching issue records:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch issue records' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await verifyStaffAuth(req, ['manager', 'store_manager', 'operations_head', 'operations', 'superadmin', 'owner']);
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const body = await req.json();
    const {
      outlet_id,
      outlet_name = 'Janu Bhai Cafe - Gafoor Nagar',
      manager_name = 'Store Manager',
      record_date = new Date().toISOString().split('T')[0],
      issue_description,
      action_taken = '',
      vendor_contacted = '',
      vendor_contact_phone = '',
      approved_vendor_used = true,
      vendor_name = '',
      resolution_status = 'pending',
      pending_work = '',
      expected_completion_date = null,
      cost_required = false,
      estimated_cost = 0,
      actual_cost = 0,
      whatsapp_sent_to_oh = false,
      oh_informed = false,
      oh_instructions = '',
      follow_up_required = false,
      follow_up_date = null,
      photo_urls = [],
    } = body;

    if (!issue_description) {
      return NextResponse.json({ error: 'Issue description is required' }, { status: 400 });
    }

    let finalOutletId = outlet_id;
    if (!finalOutletId) {
      const { data: outlet } = await supabaseAdmin.from('outlets').select('id').limit(1).maybeSingle();
      finalOutletId = outlet?.id || 'a0000000-0000-0000-0000-000000000001';
    }

    const { data, error } = await supabaseAdmin
      .from('manager_issue_records')
      .insert({
        outlet_id: finalOutletId,
        outlet_name,
        manager_name,
        record_date,
        issue_description,
        action_taken,
        vendor_contacted,
        vendor_contact_phone,
        approved_vendor_used,
        vendor_name,
        resolution_status,
        pending_work,
        expected_completion_date: expected_completion_date || null,
        cost_required,
        estimated_cost: Number(estimated_cost || 0),
        actual_cost: Number(actual_cost || 0),
        whatsapp_sent_to_oh,
        oh_informed,
        oh_instructions,
        follow_up_required,
        follow_up_date: follow_up_date || null,
        photo_urls,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Error saving issue record:', err);
    return NextResponse.json({ error: err.message || 'Failed to save issue record' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const auth = await verifyStaffAuth(req, ['manager', 'store_manager', 'operations_head', 'operations', 'superadmin', 'owner']);
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Issue record ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('manager_issue_records')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Error updating issue record:', err);
    return NextResponse.json({ error: err.message || 'Failed to update issue record' }, { status: 500 });
  }
}
