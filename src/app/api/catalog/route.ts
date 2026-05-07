import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const supabase = getSupabase();

    if (type === 'menu') {
      const { data: menuItems, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true);

      if (error) throw error;

      return NextResponse.json(menuItems);
    }

    if (type === 'outlets') {
      const { data: outlets, error } = await supabase
        .from('outlets')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      return NextResponse.json(outlets);
    }

    return NextResponse.json(
      { error: 'Invalid type parameter. Use ?type=menu or ?type=outlets' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from database' },
      { status: 500 }
    );
  }
}
