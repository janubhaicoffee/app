import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

const DEFAULT_TEMPLATES = {
  opening: [
    { id: 'op_1', category: 'Equipment', title: 'Espresso machine power & pressure check (9 bars)', checked: false, notes: '' },
    { id: 'op_2', category: 'Equipment', title: 'Grinder calibration & test shot extraction timing (25-30s)', checked: false, notes: '' },
    { id: 'op_3', category: 'Food Safety', title: 'Milk refrigerator temperature check (under 4°C)', checked: false, notes: '' },
    { id: 'op_4', category: 'Supplies', title: 'Dairy, alt-milks & artisanal syrups expiry and stock check', checked: false, notes: '' },
    { id: 'op_5', category: 'Supplies', title: 'Paper cups, sipper lids, sleeves & straws replenished', checked: false, notes: '' },
    { id: 'op_6', category: 'Cash & POS', title: 'Cash register float verified (opening balance counted)', checked: false, notes: '' },
    { id: 'op_7', category: 'Cash & POS', title: 'POS terminal, receipt printer & payment scanner connected', checked: false, notes: '' },
    { id: 'op_8', category: 'Ambience', title: 'Cafe lighting, AC set to 22°C & ambient jazz playlist active', checked: false, notes: '' },
    { id: 'op_9', category: 'Hygiene', title: 'Restroom cleanliness, hand soap & sanitizers restocked', checked: false, notes: '' }
  ],
  midday: [
    { id: 'mid_1', category: 'Food Safety', title: 'Temperature logs check on milk fridges & display counter', checked: false, notes: '' },
    { id: 'mid_2', category: 'Hygiene', title: 'Steam wands wiped & purged after milk steaming rushes', checked: false, notes: '' },
    { id: 'mid_3', category: 'Hygiene', title: 'Dine-in tables wiped & floor cleared of debris', checked: false, notes: '' },
    { id: 'mid_4', category: 'Supplies', title: 'Coffee beans hopper refilled from dark storage', checked: false, notes: '' },
    { id: 'mid_5', category: 'Staff', title: 'Midday shift changeover & station handover complete', checked: false, notes: '' }
  ],
  closing: [
    { id: 'cl_1', category: 'Equipment', title: 'Backflush espresso group heads with blind filter & detergent', checked: false, notes: '' },
    { id: 'cl_2', category: 'Equipment', title: 'Disassemble, clean and soak steam wand nozzles in hot water', checked: false, notes: '' },
    { id: 'cl_3', category: 'Food Safety', title: 'Empty coffee bean hoppers into airtight storage tins', checked: false, notes: '' },
    { id: 'cl_4', category: 'Food Safety', title: 'Store open milk, syrups & bakery in refrigerated containment', checked: false, notes: '' },
    { id: 'cl_5', category: 'Hygiene', title: 'Deep clean counter surfaces, rinse pitchers & knock box', checked: false, notes: '' },
    { id: 'cl_6', category: 'Cash & POS', title: 'EOD cash settlement performed & matched against POS daily report', checked: false, notes: '' },
    { id: 'cl_7', category: 'Cash & POS', title: 'Daily POS shift closure generated & printed', checked: false, notes: '' },
    { id: 'cl_8', category: 'Security', title: 'Espresso boilers, display lights, ACs & music shut down', checked: false, notes: '' },
    { id: 'cl_9', category: 'Security', title: 'All exterior doors locked & CCTV surveillance active', checked: false, notes: '' }
  ]
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const checklistType = searchParams.get('type');

    let query = supabaseAdmin
      .from('outlet_checklists')
      .select('*, outlets(name, code)')
      .order('created_at', { ascending: false });

    if (outletId) query = query.eq('outlet_id', outletId);
    if (date) query = query.eq('date', date);
    if (checklistType) query = query.eq('checklist_type', checklistType);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      templates: DEFAULT_TEMPLATES
    });
  } catch (error) {
    console.error('Checklists GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      outlet_id,
      date,
      shift_type,
      checklist_type,
      items,
      score,
      completed_by,
      verified_by,
      notes
    } = body;

    if (!outlet_id || !checklist_type) {
      return NextResponse.json(
        { error: 'Missing required fields: outlet_id, checklist_type' },
        { status: 400 }
      );
    }

    const itemsArray = Array.isArray(items) ? items : (DEFAULT_TEMPLATES[checklist_type] || []);
    const checkedCount = itemsArray.filter((i) => i.checked).length;
    const computedScore = itemsArray.length > 0 ? Math.round((checkedCount / itemsArray.length) * 100) : 100;

    const insertData = {
      outlet_id,
      date: date || new Date().toISOString().split('T')[0],
      shift_type: shift_type || (checklist_type === 'closing' ? 'night' : 'morning'),
      checklist_type: checklist_type || 'opening',
      items: itemsArray,
      score: score !== undefined ? score : computedScore,
      completed_by: completed_by || 'Staff Barista',
      verified_by: verified_by || null,
      notes: notes || null,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('outlet_checklists')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Checklists POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
