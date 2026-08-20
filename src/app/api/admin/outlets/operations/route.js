import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId');

    // 1. Fetch outlets
    let outletsQuery = supabaseAdmin
      .from('outlets')
      .select('*')
      .order('name', { ascending: true });

    if (outletId) {
      outletsQuery = outletsQuery.eq('id', outletId);
    }

    const { data: outlets, error: outletsError } = await outletsQuery;
    if (outletsError) throw outletsError;

    const todayStr = new Date().toISOString().split('T')[0];

    // 2. Fetch parallel operations data
    const [
      ordersRes,
      posOrdersRes,
      inventoryRes,
      alertsRes,
      camerasRes,
      staffRes,
      checklistsRes,
      incidentsRes,
      transfersRes
    ] = await Promise.all([
      supabaseAdmin
        .from('orders')
        .select('id, total_amount, status, created_at, pickup_outlet_id')
        .gte('created_at', `${todayStr}T00:00:00Z`),
      supabaseAdmin
        .from('pos_orders')
        .select('id, outlet_id, total_amount, status, created_at, order_type')
        .gte('created_at', `${todayStr}T00:00:00Z`),
      supabaseAdmin
        .from('outlet_inventory')
        .select('*'),
      supabaseAdmin
        .from('outlet_alerts')
        .select('*')
        .eq('resolved', false),
      supabaseAdmin
        .from('outlet_cameras')
        .select('*'),
      supabaseAdmin
        .from('outlet_staff')
        .select('id, outlet_id, display_name, role, is_active')
        .eq('is_active', true),
      supabaseAdmin
        .from('outlet_checklists')
        .select('*')
        .eq('date', todayStr),
      supabaseAdmin
        .from('outlet_incident_logs')
        .select('*')
        .in('status', ['open', 'investigating']),
      supabaseAdmin
        .from('stock_transfers')
        .select('*')
        .in('status', ['pending', 'in_transit'])
    ]);

    const todayOrders = ordersRes.data || [];
    const todayPosOrders = posOrdersRes.data || [];
    const allInventory = inventoryRes.data || [];
    const openAlerts = alertsRes.data || [];
    const allCameras = camerasRes.data || [];
    const activeStaff = staffRes.data || [];
    const todayChecklists = checklistsRes.data || [];
    const openIncidents = incidentsRes.data || [];
    const activeTransfers = transfersRes.data || [];

    // Calculate aggregated metrics per outlet
    const outletMatrix = (outlets || []).map((outlet) => {
      // Pos orders for this outlet
      const outletPos = todayPosOrders.filter((o) => o.outlet_id === outlet.id);
      // Main store pickup orders for this outlet
      const outletMain = todayOrders.filter((o) => o.pickup_outlet_id === outlet.id);

      const totalOrdersToday = outletPos.length + outletMain.length;
      const todayRevenue = 
        outletPos.reduce((s, o) => s + (parseFloat(o.total_amount) || 0), 0) +
        outletMain.reduce((s, o) => s + (parseFloat(o.total_amount) || 0), 0);

      // Active orders in kitchen / prep
      const activeOrdersCount = outletPos.filter((o) => 
        ['pending', 'confirmed', 'preparing'].includes(o.status)
      ).length;

      // Low stock items for this outlet
      const outletItems = allInventory.filter((i) => i.outlet_id === outlet.id || !i.outlet_id);
      const lowStockItems = outletItems.filter((i) => (i.stock || 0) <= (i.threshold || 10));

      // Cameras for this outlet
      const outletCameras = allCameras.filter((c) => c.outlet_id === outlet.id || !c.outlet_id);
      const onlineCameras = outletCameras.filter((c) => c.active !== false);

      // Alerts for this outlet
      const outletAlerts = openAlerts.filter((a) => a.outlet_id === outlet.id || !a.outlet_id);

      // Staff active for this outlet
      const outletStaffMembers = activeStaff.filter((s) => s.outlet_id === outlet.id);

      // Checklists for this outlet today
      const outletChecks = todayChecklists.filter((c) => c.outlet_id === outlet.id);
      const hasMorningChecklist = outletChecks.some((c) => c.shift_type === 'morning' || c.checklist_type === 'opening');
      const hasClosingChecklist = outletChecks.some((c) => c.shift_type === 'night' || c.checklist_type === 'closing');

      // Incidents for this outlet
      const outletIncidents = openIncidents.filter((inc) => inc.outlet_id === outlet.id);

      return {
        ...outlet,
        operational_status: outlet.operational_status || (outlet.is_active ? 'open' : 'closed'),
        accepting_orders: outlet.accepting_orders !== false,
        dine_in_active: outlet.dine_in_active !== false,
        takeaway_active: outlet.takeaway_active !== false,
        delivery_active: outlet.delivery_active !== false,
        metrics: {
          totalOrdersToday,
          todayRevenue,
          activeOrdersCount,
          lowStockCount: lowStockItems.length,
          camerasTotal: outletCameras.length,
          camerasOnline: onlineCameras.length,
          openAlertsCount: outletAlerts.length,
          activeStaffCount: outletStaffMembers.length,
          openIncidentsCount: outletIncidents.length,
          checklists: {
            openingDone: hasMorningChecklist,
            closingDone: hasClosingChecklist,
            totalDone: outletChecks.length,
          }
        }
      };
    });

    // Summary high-level KPI cards
    const summary = {
      totalOutlets: outlets.length,
      activeOutlets: outlets.filter((o) => o.is_active && (o.operational_status === 'open' || !o.operational_status)).length,
      pausedOutlets: outlets.filter((o) => o.operational_status === 'paused' || o.operational_status === 'busy').length,
      closedOutlets: outlets.filter((o) => !o.is_active || o.operational_status === 'closed').length,
      totalOrdersToday: outletMatrix.reduce((s, o) => s + o.metrics.totalOrdersToday, 0),
      totalRevenueToday: outletMatrix.reduce((s, o) => s + o.metrics.todayRevenue, 0),
      activePrepOrders: outletMatrix.reduce((s, o) => s + o.metrics.activeOrdersCount, 0),
      totalLowStockAlerts: outletMatrix.reduce((s, o) => s + o.metrics.lowStockCount, 0),
      totalOpenAlerts: openAlerts.length,
      totalOpenIncidents: openIncidents.length,
      activeStockTransfers: activeTransfers.length,
      totalActiveStaff: activeStaff.length,
    };

    return NextResponse.json({
      success: true,
      data: {
        summary,
        outlets: outletMatrix,
        openIncidents: openIncidents.slice(0, 10),
        activeTransfers: activeTransfers.slice(0, 10),
        recentAlerts: openAlerts.slice(0, 10),
      }
    });
  } catch (error) {
    console.error('Operations GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const {
      outletId,
      operational_status,
      accepting_orders,
      dine_in_active,
      takeaway_active,
      delivery_active,
      delivery_radius_km,
      emergency_pause_all,
      emergency_resume_all
    } = body;

    // 1. Handle global emergency pause/resume
    if (emergency_pause_all === true) {
      await supabaseAdmin
        .from('outlets')
        .update({
          operational_status: 'paused',
          accepting_orders: false,
          delivery_active: false,
          updated_at: new Date().toISOString()
        })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      return NextResponse.json({
        success: true,
        message: 'All outlets have been paused in emergency mode.'
      });
    }

    if (emergency_resume_all === true) {
      await supabaseAdmin
        .from('outlets')
        .update({
          operational_status: 'open',
          accepting_orders: true,
          delivery_active: true,
          dine_in_active: true,
          takeaway_active: true,
          updated_at: new Date().toISOString()
        })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      return NextResponse.json({
        success: true,
        message: 'All outlets have resumed active operations.'
      });
    }

    // 2. Handle single outlet switchboard update
    if (!outletId) {
      return NextResponse.json({ error: 'Missing outletId' }, { status: 400 });
    }

    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (operational_status !== undefined) updates.operational_status = operational_status;
    if (accepting_orders !== undefined) updates.accepting_orders = !!accepting_orders;
    if (dine_in_active !== undefined) updates.dine_in_active = !!dine_in_active;
    if (takeaway_active !== undefined) updates.takeaway_active = !!takeaway_active;
    if (delivery_active !== undefined) updates.delivery_active = !!delivery_active;
    if (delivery_radius_km !== undefined) updates.delivery_radius_km = parseFloat(delivery_radius_km) || 5;

    // Sync is_active boolean if operational status is closed
    if (operational_status === 'closed') {
      updates.is_active = false;
    } else if (operational_status === 'open' || operational_status === 'busy' || operational_status === 'paused') {
      updates.is_active = true;
    }

    const { data, error } = await supabaseAdmin
      .from('outlets')
      .update(updates)
      .eq('id', outletId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Operations PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
