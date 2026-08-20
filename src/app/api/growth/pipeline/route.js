import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyStaffAuth } from '@/lib/staffAuth';

export async function GET(req) {
  try {
    const auth = await verifyStaffAuth(req, ['growth', 'brand_leader', 'operations_head', 'operations', 'superadmin', 'owner']);
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const { data: priorities, error: pErr } = await supabaseAdmin
      .from('growth_strategic_priorities')
      .select('*')
      .order('priority_number', { ascending: true });

    if (pErr) throw pErr;

    const { data: pipeline, error: oErr } = await supabaseAdmin
      .from('growth_opportunity_pipeline')
      .select('*')
      .order('created_at', { ascending: false });

    if (oErr) throw oErr;

    return NextResponse.json({
      success: true,
      priorities: priorities || [],
      pipeline: pipeline || [],
    });
  } catch (err) {
    console.error('Error fetching growth pipeline:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch pipeline' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await verifyStaffAuth(req, ['growth', 'brand_leader', 'operations_head', 'operations', 'superadmin', 'owner']);
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const body = await req.json();
    const { type, ...payload } = body;

    if (type === 'priority') {
      const { data, error } = await supabaseAdmin
        .from('growth_strategic_priorities')
        .insert({
          priority_number: Number(payload.priority_number || 1),
          priority_title: payload.priority_title,
          objective: payload.objective,
          key_actions: payload.key_actions || '',
          success_measure: payload.success_measure || '',
          target_date: payload.target_date || null,
          status: payload.status || 'in_progress',
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (type === 'opportunity') {
      const { data, error } = await supabaseAdmin
        .from('growth_opportunity_pipeline')
        .insert({
          title: payload.title,
          type: payload.type || 'Marketing',
          potential_impact: payload.potential_impact || 'Medium',
          next_step: payload.next_step,
          owner: payload.owner || 'Growth Lead',
          status: payload.status || 'New',
          notes: payload.notes || '',
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: 'Invalid payload type' }, { status: 400 });
  } catch (err) {
    console.error('Error adding to pipeline:', err);
    return NextResponse.json({ error: err.message || 'Failed to add pipeline entry' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const auth = await verifyStaffAuth(req, ['growth', 'brand_leader', 'operations_head', 'operations', 'superadmin', 'owner']);
    if (!auth.isAuthorized) {
      return auth.response;
    }

    const body = await req.json();
    const { type, id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    const table = type === 'priority' ? 'growth_strategic_priorities' : 'growth_opportunity_pipeline';
    const { data, error } = await supabaseAdmin.from(table).update(updates).eq('id', id).select().single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Error updating pipeline entry:', err);
    return NextResponse.json({ error: err.message || 'Failed to update pipeline entry' }, { status: 500 });
  }
}
