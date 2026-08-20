import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyStaffAuth } from '@/lib/staffAuth';

export const EXPENSE_CATEGORIES = [
  'Rent',
  'Electricity Bill',
  'Maintenance / Repair',
  'Water / Municipal Charges',
  'Raw Material / Supplies',
  'Packaging / Disposables',
  'Marketing / Promotional',
  'Internet / DTH / Software',
  'Compliance / License Renewal',
  'Transport / Delivery',
  'Staff Related Expenses',
  'Other Expenses',
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
      .from('outlet_expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (outletId) {
      query = query.eq('outlet_id', outletId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Calculate totals
    const expenses = data || [];
    const totalPaid = expenses
      .filter((e) => e.status === 'paid' || e.payment_status === 'Paid')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const totalPending = expenses
      .filter((e) => e.status !== 'paid' && e.payment_status !== 'Paid')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const totalMonth = totalPaid + totalPending;

    return NextResponse.json({
      success: true,
      data: expenses,
      summary: {
        totalPaid,
        totalPending,
        totalMonth,
      },
      categories: EXPENSE_CATEGORIES,
    });
  } catch (err) {
    console.error('Error fetching operational expenses:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch expenses' }, { status: 500 });
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
      category,
      description = '',
      vendor = '',
      amount = 0,
      payment_status = 'Pending',
      proof_url = null,
      notes = '',
      expense_date = new Date().toISOString().split('T')[0],
      verified_by = 'Operations Head',
    } = body;

    if (!category || !amount) {
      return NextResponse.json({ error: 'Category and amount are required' }, { status: 400 });
    }

    let finalOutletId = outlet_id;
    if (!finalOutletId) {
      const { data: outlet } = await supabaseAdmin.from('outlets').select('id').limit(1).maybeSingle();
      finalOutletId = outlet?.id || 'a0000000-0000-0000-0000-000000000001';
    }

    const { data, error } = await supabaseAdmin
      .from('outlet_expenses')
      .insert({
        outlet_id: finalOutletId,
        category,
        description,
        vendor,
        amount: Number(amount),
        status: payment_status === 'Paid' ? 'paid' : 'pending',
        receipt_url: proof_url,
        notes,
        expense_date,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Error recording operational expense:', err);
    return NextResponse.json({ error: err.message || 'Failed to save expense' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const auth = await verifyStaffAuth(req, ['operations_head', 'operations', 'operation_manager', 'superadmin', 'owner']);
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const body = await req.json();
    const { id, status, receipt_url, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    const updates = {};
    if (status) updates.status = status;
    if (receipt_url !== undefined) updates.receipt_url = receipt_url;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabaseAdmin
      .from('outlet_expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Error updating expense status:', err);
    return NextResponse.json({ error: err.message || 'Failed to update expense' }, { status: 500 });
  }
}
