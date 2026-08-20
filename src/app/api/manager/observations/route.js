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
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let query = supabaseAdmin
      .from('manager_observations')
      .select('*, observation_photos(*)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (outletId) {
      query = query.eq('outlet_id', outletId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('Error fetching manager observations:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch observations' }, { status: 500 });
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
      observation_date = new Date().toISOString().split('T')[0],
      observation_time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      visit_type = 'daily',
      checklist_items = [],
      issues_found = [],
      overall_score = 100,
      priority = 'medium',
      raw_ai_analysis = null,
      scanned_image_url = null,
      manager_signature = '',
      photos = [], // [{ category, photo_url, caption, severity }]
    } = body;

    // Get valid outlet ID
    let finalOutletId = outlet_id;
    if (!finalOutletId) {
      const { data: outlet } = await supabaseAdmin.from('outlets').select('id').limit(1).maybeSingle();
      finalOutletId = outlet?.id || 'a0000000-0000-0000-0000-000000000001';
    }

    // 1. Insert Observation Record
    const { data: observation, error: obsError } = await supabaseAdmin
      .from('manager_observations')
      .insert({
        outlet_id: finalOutletId,
        outlet_name,
        manager_name,
        observation_date,
        observation_time,
        visit_type,
        checklist_items,
        issues_found,
        overall_score,
        priority,
        raw_ai_analysis,
        scanned_image_url,
        manager_signature,
        reviewed_by_oh: false,
      })
      .select()
      .single();

    if (obsError) throw obsError;

    // 2. Insert any attached observation photos
    if (photos && photos.length > 0) {
      const photoRecords = photos.map((p) => ({
        observation_id: observation.id,
        outlet_id: finalOutletId,
        category: p.category || 'general_inspection',
        photo_url: p.photo_url,
        thumbnail_url: p.photo_url,
        caption: p.caption || '',
        severity: p.severity || 'medium',
        resolved: false,
      }));

      const { error: photoErr } = await supabaseAdmin.from('observation_photos').insert(photoRecords);
      if (photoErr) console.warn('Warning inserting observation photos:', photoErr.message);
    }

    return NextResponse.json({ success: true, data: observation });
  } catch (err) {
    console.error('Error saving manager observation:', err);
    return NextResponse.json({ error: err.message || 'Failed to save observation' }, { status: 500 });
  }
}
