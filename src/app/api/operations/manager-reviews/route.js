import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const outletId = searchParams.get('outlet_id');

    let query = supabaseAdmin
      .from('manager_coordination_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (outletId) {
      query = query.eq('outlet_id', outletId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('Error fetching manager coordination reviews:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch manager reviews' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      outlet_id,
      review_date = new Date().toISOString().split('T')[0],
      reviewed_by = 'Bilal Muhammad (Operations Head)',
      manager_name = 'Arsalan',
      daily_updates_received = true,
      prompt_whatsapp_response = true,
      problems_escalated_on_time = true,
      follows_instructions = true,
      comments_notes = '',
      rating_leadership = 5,
      rating_operations = 5,
      rating_team_management = 5,
      rating_sales_targets = 5,
      rating_quality_service = 5,
      overall_performance_comments = '',
      action_items = [],
      support_provided = [],
      escalation = {},
    } = body;

    let finalOutletId = outlet_id;
    if (!finalOutletId) {
      const { data: outlet } = await supabaseAdmin.from('outlets').select('id').limit(1).maybeSingle();
      finalOutletId = outlet?.id || 'a0000000-0000-0000-0000-000000000001';
    }

    const { data, error } = await supabaseAdmin
      .from('manager_coordination_reviews')
      .insert({
        outlet_id: finalOutletId,
        review_date,
        reviewed_by,
        manager_name,
        daily_updates_received,
        prompt_whatsapp_response,
        problems_escalated_on_time,
        follows_instructions,
        comments_notes,
        rating_leadership: Number(rating_leadership),
        rating_operations: Number(rating_operations),
        rating_team_management: Number(rating_team_management),
        rating_sales_targets: Number(rating_sales_targets),
        rating_quality_service: Number(rating_quality_service),
        overall_performance_comments,
        action_items,
        support_provided,
        escalation,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Error saving manager coordination review:', err);
    return NextResponse.json({ error: err.message || 'Failed to save review' }, { status: 500 });
  }
}
