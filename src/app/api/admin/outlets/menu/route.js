import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outlet_id');

    // 1. Fetch categories from Supabase
    let categoriesQuery = supabaseAdmin
      .from('pos_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    // 2. Fetch menu products from Supabase
    let productsQuery = supabaseAdmin
      .from('pos_products')
      .select('*, pos_categories(id, name)')
      .order('name', { ascending: true });

    if (outletId && outletId !== 'all') {
      productsQuery = productsQuery.eq('outlet_id', outletId);
    }

    // 3. Fetch inventory items from Supabase
    let inventoryQuery = supabaseAdmin
      .from('outlet_inventory')
      .select('*, outlets(id, name, code)')
      .order('name', { ascending: true });

    if (outletId && outletId !== 'all') {
      inventoryQuery = inventoryQuery.eq('outlet_id', outletId);
    }

    // 4. Fetch photo shortage alerts from Supabase
    let alertsQuery = supabaseAdmin
      .from('outlet_alerts')
      .select('*, outlets(id, name, code)')
      .order('created_at', { ascending: false });

    if (outletId && outletId !== 'all') {
      alertsQuery = alertsQuery.eq('outlet_id', outletId);
    }

    const [
      { data: categories, error: catError },
      { data: products, error: prodError },
      { data: inventory, error: invError },
      { data: alerts, error: alertError },
    ] = await Promise.all([
      categoriesQuery,
      productsQuery,
      inventoryQuery,
      alertsQuery,
    ]);

    if (catError) console.warn('pos_categories error:', catError.message);
    if (prodError) console.warn('pos_products error:', prodError.message);
    if (invError) console.warn('outlet_inventory error:', invError.message);
    if (alertError) console.warn('outlet_alerts error:', alertError.message);

    // Format products with ingredients from modifiers JSONB
    const formattedMenu = (products || []).map((p) => {
      const parsedModifiers = typeof p.modifiers === 'string' ? JSON.parse(p.modifiers) : p.modifiers || {};
      return {
        id: p.id,
        name: p.name,
        category_id: p.category_id,
        category: p.pos_categories?.name || 'General',
        price: Number(p.price || 0),
        tax_rate: 5,
        prep_time_minutes: parsedModifiers.prep_time_minutes || 5,
        is_available: p.is_available !== false,
        is_veg: parsedModifiers.is_veg !== false,
        image_url: p.image_url || '/product.png',
        description: parsedModifiers.description || '',
        ingredients: Array.isArray(parsedModifiers.ingredients) ? parsedModifiers.ingredients : [],
        outlet_id: p.outlet_id,
      };
    });

    return NextResponse.json({
      success: true,
      categories: categories || [],
      menu: formattedMenu,
      inventory: inventory || [],
      alerts: alerts || [],
    });
  } catch (error) {
    console.error('Menu & Ingredients GET error:', error);
    return NextResponse.json({
      success: true,
      categories: [],
      menu: [],
      inventory: [],
      alerts: [],
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    // 1. Create Category in Supabase
    if (action === 'create_category') {
      const { name, outlet_id, description, sort_order } = payload;
      if (!name) {
        return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from('pos_categories')
        .insert([
          {
            name,
            outlet_id: outlet_id || null,
            description: description || null,
            sort_order: sort_order ? parseInt(sort_order) : 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data }, { status: 201 });
    }

    // 2. Create Menu Item with Recipe Ingredients in Supabase
    if (action === 'create_menu_item') {
      const {
        name,
        category_id,
        outlet_id,
        price,
        description,
        is_veg,
        is_available,
        prep_time_minutes,
        image_url,
        ingredients = [],
      } = payload;

      if (!name || price === undefined) {
        return NextResponse.json({ error: 'Item name and price are required' }, { status: 400 });
      }

      const modifiers = {
        description: description || '',
        is_veg: is_veg !== false,
        prep_time_minutes: prep_time_minutes ? parseInt(prep_time_minutes) : 5,
        ingredients: Array.isArray(ingredients) ? ingredients : [],
      };

      const { data, error } = await supabaseAdmin
        .from('pos_products')
        .insert([
          {
            name,
            category_id: category_id || null,
            outlet_id: outlet_id || null,
            price: parseFloat(price) || 0,
            image_url: image_url || null,
            is_available: is_available !== false,
            modifiers,
          },
        ])
        .select('*, pos_categories(id, name)')
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data }, { status: 201 });
    }

    // 3. Create Raw Ingredient or Cutlery Stock in Supabase
    if (action === 'create_inventory_item') {
      const { outlet_id, name, category, stock, threshold, unit, unit_cost } = payload;
      if (!name) {
        return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from('outlet_inventory')
        .insert([
          {
            outlet_id: outlet_id || null,
            name,
            category: category || 'ingredient',
            stock: parseFloat(stock) || 0,
            threshold: parseFloat(threshold) || 10,
            unit: unit || 'units',
            unit_cost: parseFloat(unit_cost) || 0,
            auto_reorder: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data }, { status: 201 });
    }

    // 4. Report Low Stock / Missing Item with Photo in Supabase
    if (action === 'report_low_stock') {
      const {
        outlet_id,
        outlet_name,
        item_name,
        category = 'ingredient',
        photo_url,
        estimated_stock,
        urgency = 'critical',
        notes,
        reported_by = 'Store Manager',
      } = payload;

      const message = `🚨 SHORTAGE ALERT [${outlet_name || 'Outlet'}] - ${item_name} is ${estimated_stock || 'critically low'}. ${notes || ''}`;

      const { data, error } = await supabaseAdmin
        .from('outlet_alerts')
        .insert([
          {
            outlet_id: outlet_id || null,
            message,
            severity: urgency === 'critical' ? 'critical' : urgency === 'high' ? 'high' : 'medium',
            photo_url: photo_url || null,
            item_name: item_name || null,
            category: category || 'ingredient',
            reported_by,
            resolved: false,
            time: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        // Fallback insert without extra columns if table has default schema
        const { data: fbData } = await supabaseAdmin
          .from('outlet_alerts')
          .insert([
            {
              message: `${message} (Photo: ${photo_url || 'None'})`,
              severity: urgency === 'critical' ? 'critical' : 'high',
              time: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        return NextResponse.json({ success: true, alert: fbData });
      }

      return NextResponse.json({ success: true, alert: data });
    }

    // 5. Resolve Shortage Alert in Supabase
    if (action === 'resolve_alert') {
      const { alert_id } = payload;
      if (!alert_id) return NextResponse.json({ error: 'Missing alert_id' }, { status: 400 });

      const { error } = await supabaseAdmin
        .from('outlet_alerts')
        .update({ resolved: true })
        .eq('id', alert_id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Menu & Ingredients POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    // Update Menu Item
    if (action === 'update_menu_item') {
      const {
        id,
        name,
        category_id,
        price,
        description,
        is_veg,
        is_available,
        prep_time_minutes,
        image_url,
        ingredients,
      } = payload;

      if (!id) return NextResponse.json({ error: 'Missing item id' }, { status: 400 });

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (category_id !== undefined) updates.category_id = category_id;
      if (price !== undefined) updates.price = parseFloat(price);
      if (image_url !== undefined) updates.image_url = image_url;
      if (is_available !== undefined) updates.is_available = !!is_available;

      if (description !== undefined || is_veg !== undefined || prep_time_minutes !== undefined || ingredients !== undefined) {
        updates.modifiers = {
          description: description || '',
          is_veg: is_veg !== false,
          prep_time_minutes: prep_time_minutes ? parseInt(prep_time_minutes) : 5,
          ingredients: Array.isArray(ingredients) ? ingredients : [],
        };
      }

      const { data, error } = await supabaseAdmin
        .from('pos_products')
        .update(updates)
        .eq('id', id)
        .select('*, pos_categories(id, name)')
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    // Update Inventory Stock
    if (action === 'update_inventory_stock') {
      const { id, stock, threshold, unit_cost } = payload;
      if (!id) return NextResponse.json({ error: 'Missing inventory id' }, { status: 400 });

      const updates = {};
      if (stock !== undefined) updates.stock = parseFloat(stock);
      if (threshold !== undefined) updates.threshold = parseFloat(threshold);
      if (unit_cost !== undefined) updates.unit_cost = parseFloat(unit_cost);

      const { data, error } = await supabaseAdmin
        .from('outlet_inventory')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Menu & Ingredients PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing record id' }, { status: 400 });
    }

    if (type === 'category') {
      const { error } = await supabaseAdmin.from('pos_categories').delete().eq('id', id);
      if (error) throw error;
    } else if (type === 'menu_item') {
      const { error } = await supabaseAdmin.from('pos_products').delete().eq('id', id);
      if (error) throw error;
    } else if (type === 'inventory') {
      const { error } = await supabaseAdmin.from('outlet_inventory').delete().eq('id', id);
      if (error) throw error;
    } else if (type === 'alert') {
      const { error } = await supabaseAdmin.from('outlet_alerts').delete().eq('id', id);
      if (error) throw error;
    } else {
      return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Menu & Ingredients DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
