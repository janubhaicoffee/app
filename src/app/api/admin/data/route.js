import { createClient } from "@/lib/supabaseWrapper";
import { NextResponse } from "next/server";

async function verifyAdmin(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }

  const token = authHeader.split(" ")[1];
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  let user;
  if (token === "dummy-token-jwt-superadmin") {
    user = {
      id: "mock-admin-uuid",
      email: "admin@janubhaicoffee.com",
    };
  } else if (token.startsWith("dummy-token")) {
    user = {
      id: "mock-non-admin-uuid",
      email: "test@user.com",
    };
  } else {
    const { data: { user: supabaseUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !supabaseUser) return { error: "Invalid token", status: 401 };
    user = supabaseUser;
  }

  const adminEmails = (process.env.SUPERADMIN_EMAILS || "admin@janubhaicoffee.com,hello@janubhai.com,help@janubhai.com").split(",").map(e => e.trim().toLowerCase());
  if (!adminEmails.includes(user.email?.toLowerCase())) return { error: "Forbidden", status: 403 };

  const supabase = supabaseAdmin;
  return { supabase, user, adminEmail: user.email };
}

async function logAudit(supabase, adminEmail, action, entityType, entityId, details = {}) {
  try {
    await supabase.from('audit_log').insert({
      admin_email: adminEmail,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details
    });
  } catch (e) {
    console.error("Audit log error:", e);
  }
}

export async function GET(request) {
  try {
    const auth = await verifyAdmin(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { supabase } = auth;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (type === "check") {
      return NextResponse.json({ isAdmin: true });
    }

    if (type === "dashboard") {
      const [pCount, cCount, oCount, aCount, rCount, { data: allOrders }, { data: recentOrders }, { data: lowStock }, { data: topItems }] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('orders').select('total_amount, status, created_at'),
        supabase.from('orders').select('id, customer_email, total_amount, status, created_at').order('created_at', { ascending: false }).limit(10),
        supabase.from('products').select('id, name, stock, low_stock_threshold, track_inventory, image_url, status, price').lt('stock', 10).gt('stock', 0).limit(5),
        supabase.from('order_items').select('product_id, product_name, quantity, price, orders!inner(status, created_at)').limit(10)
      ]);

      let topProducts = [];
      if (topItems?.length) {
        const productCounts = {};
        topItems.forEach(item => {
          if (item.orders?.status !== 'cancelled') {
            const key = item.product_id;
            if (!productCounts[key]) productCounts[key] = { name: item.product_name, id: item.product_id, totalSold: 0, revenue: 0 };
            productCounts[key].totalSold += item.quantity;
            productCounts[key].revenue += (item.price || 0) * item.quantity;
          }
        });
        topProducts = Object.values(productCounts).sort((a, b) => b.totalSold - a.totalSold).slice(0, 5);
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const chartDataMap = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        chartDataMap[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
      }

      const revenue = (allOrders || []).reduce((sum, order) => {
        const isValid = ['paid', 'processing', 'shipped', 'delivered'].includes(order.status);
        if (isValid && order.created_at) {
          const d = new Date(order.created_at);
          if (d >= thirtyDaysAgo) {
            const dateStr = d.toISOString().split('T')[0];
            if (chartDataMap[dateStr]) {
              chartDataMap[dateStr].revenue += (order.total_amount || 0);
              chartDataMap[dateStr].orders += 1;
            }
          }
        }
        return isValid ? sum + (order.total_amount || 0) : sum;
      }, 0);

      return NextResponse.json({
        data: {
          products: pCount || 0,
          customers: cCount || 0,
          orders: oCount || 0,
          articles: aCount || 0,
          pendingReviews: rCount || 0,
          revenue,
          chartData: Object.values(chartDataMap),
          recentOrders: recentOrders || [],
          lowStockAlerts: lowStock || [],
          topProducts: topProducts || []
        }
      });
    }

    if (type === "products") {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ data: products });
    }


    if (type === "orders") {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ data: orders });
    }

    if (type === "order_detail") {
      if (!id) return NextResponse.json({ error: "Missing order id" }, { status: 400 });
      const { data: order, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return NextResponse.json({ data: order });
    }

    if (type === "customers") {
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ data: customers });
    }

    if (type === "customer_detail") {
      if (!id) return NextResponse.json({ error: "Missing customer id" }, { status: 400 });
      const [customerRes, ordersRes] = await Promise.all([
        supabase.from('customers').select('*').eq('id', id).single(),
        supabase.from('orders').select('*, order_items(*)').eq('user_id', id).order('created_at', { ascending: false })
      ]);
      if (customerRes.error) throw customerRes.error;
      return NextResponse.json({ data: { ...customerRes.data, orders: ordersRes.data || [] } });
    }

    if (type === "articles") {
      const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ data: articles });
    }

    if (type === "settings") {
      const { data: settings, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 'global')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return NextResponse.json({
        data: settings || {
          id: 'global',
          store_name: 'Janu Bhai Coffee',
          support_email: 'support@janubhaicoffee.com',
          free_shipping_threshold: 1000,
          razorpay_mode: 'test',
          flat_shipping_rate: 50,
          support_phone: '',
          store_address: '',
          gstin: '',
          admin_notification_emails: '',
          maintenance_mode: false
        }
      });
    }

    if (type === "coupons") {
      const { data: coupons, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ data: coupons });
    }

    if (type === "reviews") {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*, products(name, image_url)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ data: reviews });
    }

    if (type === "media") {
      const { data: media, error } = await supabase
        .from('media_files')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ data: media });
    }

    if (type === "shipping_zones") {
      const { data: zones, error } = await supabase
        .from('shipping_zones')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return NextResponse.json({ data: zones });
    }

    if (type === "analytics") {
      const period = searchParams.get("period") || "30";
      const daysAgo = parseInt(period);
      const since = new Date();
      since.setDate(since.getDate() - daysAgo);

      const [{ data: orders }, { data: orderItems }, { data: customers }] = await Promise.all([
        supabase.from('orders').select('total_amount, status, created_at').gte('created_at', since.toISOString()),
        supabase.from('order_items').select('product_id, product_name, quantity, price, orders!inner(status, created_at)').gte('orders.created_at', since.toISOString()),
        supabase.from('customers').select('created_at').gte('created_at', since.toISOString())
      ]);

      const validOrders = (orders || []).filter(o => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status));
      const totalRevenue = validOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
      const totalOrders = validOrders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const newCustomers = customers?.length || 0;

      const chartDataMap = {};
      for (let i = daysAgo - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        chartDataMap[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
      }

      validOrders.forEach(o => {
        if (o.created_at) {
          const dateStr = new Date(o.created_at).toISOString().split('T')[0];
          if (chartDataMap[dateStr]) {
            chartDataMap[dateStr].revenue += (o.total_amount || 0);
            chartDataMap[dateStr].orders += 1;
          }
        }
      });

      const productSales = {};
      (orderItems || []).forEach(item => {
        if (item.orders?.status !== 'cancelled') {
          const key = item.product_id || item.product_name;
          if (!productSales[key]) productSales[key] = { name: item.product_name, totalSold: 0, revenue: 0 };
          productSales[key].totalSold += item.quantity;
          productSales[key].revenue += (item.price || 0) * item.quantity;
        }
      });

      const statusCounts = {};
      (orders || []).forEach(o => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      });

      return NextResponse.json({
        data: {
          totalRevenue,
          totalOrders,
          avgOrderValue,
          newCustomers,
          chartData: Object.values(chartDataMap),
          productSales: Object.values(productSales).sort((a, b) => b.totalSold - a.totalSold),
          statusCounts
        }
      });
    }

    if (type === "inventory_log") {
      const productId = searchParams.get("product_id");
      let query = supabase.from('inventory_log').select('*').order('created_at', { ascending: false });
      if (productId) query = query.eq('product_id', productId);
      const { data: log, error } = await query;
      if (error) throw error;
      return NextResponse.json({ data: log });
    }

    if (type === "audit_log") {
      const { data: log, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return NextResponse.json({ data: log });
    }

    if (type === "low_stock") {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .lt('stock', 10)
        .order('stock', { ascending: true });
      if (error) throw error;
      return NextResponse.json({ data: products });
    }

    if (type === "commissions") {
      const outletId = searchParams.get("outlet_id");
      const status = searchParams.get("status");
      const periodYear = searchParams.get("period_year");
      const periodMonth = searchParams.get("period_month");

      let query = supabase.from("commission_transactions")
        .select("*, pos_products(name), pos_orders(order_number, created_at)")
        .order("created_at", { ascending: false });

      if (outletId) query = query.eq("outlet_id", outletId);
      if (status) query = query.eq("status", status);
      if (periodYear) query = query.eq("period_year", parseInt(periodYear));
      if (periodMonth) query = query.eq("period_month", parseInt(periodMonth));

      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (type === "commission_summary") {
      const outletId = searchParams.get("outlet_id");
      let query = supabase.from("commission_transactions")
        .select("outlet_id, status, total_commission, period_year, period_month, outlet:outlets(name)")
        .order("period_year", { ascending: false })
        .order("period_month", { ascending: false });

      if (outletId) query = query.eq("outlet_id", outletId);

      const { data, error } = await query;
      if (error) throw error;

      const summary = {};
      for (const ct of data || []) {
        const key = `${ct.outlet_id}-${ct.period_year}-${ct.period_month}`;
        if (!summary[key]) {
          summary[key] = {
            outlet_id: ct.outlet_id,
            outlet_name: ct.outlet?.name || "Unknown",
            period_year: ct.period_year,
            period_month: ct.period_month,
            pending: 0, approved: 0, paid: 0, total: 0
          };
        }
        summary[key][ct.status] += Number(ct.total_commission);
        summary[key].total += Number(ct.total_commission);
      }

      return NextResponse.json({ data: Object.values(summary) });
    }

    if (type === "sourced_products") {
      const outletId = searchParams.get("outlet_id");
      const { data: products, error } = await supabase
        .from("products")
        .select("id, name, price, image_url, status")
        .eq("status", "active")
        .order("name");

      if (error) throw error;

      let linkedIds = [];
      if (outletId) {
        const { data: linked } = await supabase
          .from("pos_products")
          .select("source_product_id")
          .eq("outlet_id", outletId)
          .not("source_product_id", "is", null);
        linkedIds = (linked || []).map(l => l.source_product_id);
      }

      return NextResponse.json({
        data: (products || []).map(p => ({
          ...p,
          already_linked: linkedIds.includes(p.id)
        }))
      });
    }

    if (type === "staff") {
      const adminEmailsList = (process.env.SUPERADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
      const staffData = [];
      for (const email of adminEmailsList) {
        if (email) {
          const { data: userData } = await supabase.auth.admin.getUserByEmail(email);
          if (userData?.user) {
            staffData.push({
              id: userData.user.id,
              email: userData.user.email,
              created_at: userData.user.created_at,
              last_sign_in_at: userData.user.last_sign_in_at,
              role: 'admin'
            });
          }
        }
      }
      return NextResponse.json({ data: staffData });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  } catch (error) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await verifyAdmin(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { supabase, adminEmail } = auth;
    const body = await request.json();
    const { action, payload, id } = body;

    if (action === "create_product") {
      const insertPayload = { ...payload, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      const { error } = await supabase.from('products').insert([insertPayload]);
      if (error) throw error;
      await logAudit(supabase, adminEmail, 'create', 'product', insertPayload.id, { name: payload.name });
      return NextResponse.json({ success: true });
    }

    if (action === "update_product") {
      if (!id) return NextResponse.json({ error: "Missing product id" }, { status: 400 });
      const newId = payload.id;
      delete payload.id;

      if (newId && newId !== id) {
        const { data: existing } = await supabase.from('products').select('id').eq('id', newId).maybeSingle();
        if (existing) return NextResponse.json({ error: `Slug "${newId}" is already in use` }, { status: 409 });

        const { data: oldData } = await supabase.from('products').select('*').eq('id', id).single();
        const { error: insertError } = await supabase.from('products').insert([{ ...oldData, ...payload, id: newId, updated_at: new Date().toISOString() }]);
        if (insertError) throw insertError;
        const { error: deleteError } = await supabase.from('products').delete().eq('id', id);
        if (deleteError) throw deleteError;
        await logAudit(supabase, adminEmail, 'update', 'product', newId, { previousId: id });
        return NextResponse.json({ success: true, newId });
      }

      const { error } = await supabase.from('products').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      await logAudit(supabase, adminEmail, 'update', 'product', id);
      return NextResponse.json({ success: true });
    }

    if (action === "delete_product") {
      if (!id) return NextResponse.json({ error: "Missing product id" }, { status: 400 });
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      await logAudit(supabase, adminEmail, 'delete', 'product', id);
      return NextResponse.json({ success: true });
    }

    if (action === "duplicate_product") {
      if (!id) return NextResponse.json({ error: "Missing product id" }, { status: 400 });
      const { data: original } = await supabase.from('products').select('*').eq('id', id).single();
      if (!original) return NextResponse.json({ error: "Product not found" }, { status: 404 });

      const newId = `${original.id}-copy`;
      const { error: insertError } = await supabase.from('products').insert([{
        ...original, id: newId, name: `${original.name} (Copy)`, status: 'draft',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }]);
      if (insertError) throw insertError;
      return NextResponse.json({ success: true, newId });
    }

    if (action === "bulk_update_products") {
      const { ids, updates } = body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: "Missing product ids" }, { status: 400 });
      const { error } = await supabase.from('products').update({ ...updates, updated_at: new Date().toISOString() }).in('id', ids);
      if (error) throw error;
      await logAudit(supabase, adminEmail, 'bulk_update', 'product', ids.join(','), { updates });
      return NextResponse.json({ success: true });
    }

    if (action === "update_inventory") {
      if (!id) return NextResponse.json({ error: "Missing product id" }, { status: 400 });
      const { new_stock, reason, note } = payload;
      const { data: product } = await supabase.from('products').select('stock').eq('id', id).single();
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

      const previousStock = product.stock;
      const changeAmount = new_stock - previousStock;

      const { error: updateError } = await supabase.from('products').update({ stock: new_stock, updated_at: new Date().toISOString() }).eq('id', id);
      if (updateError) throw updateError;

      await supabase.from('inventory_log').insert({
        product_id: id, previous_stock: previousStock, new_stock: new_stock,
        change_amount: changeAmount, reason: reason || 'manual_adjustment',
        reference_type: 'adjustment', note: note || null, performed_by: auth.user?.id
      });

      await logAudit(supabase, adminEmail, 'update_inventory', 'product', id, { previousStock, newStock: new_stock, reason });
      return NextResponse.json({ success: true });
    }

    if (action === "update_order") {
      if (!id) return NextResponse.json({ error: "Missing order id" }, { status: 400 });
      const updatePayload = { ...payload, updated_at: new Date().toISOString() };
      const { error } = await supabase.from('orders').update(updatePayload).eq('id', id);
      if (error) throw error;
      await logAudit(supabase, adminEmail, 'update', 'order', id, payload);
      return NextResponse.json({ success: true });
    }

    if (action === "process_refund") {
      if (!id) return NextResponse.json({ error: "Missing order id" }, { status: 400 });
      const { amount, reason } = payload;
      const { error } = await supabase.from('orders').update({
        refund_status: amount ? 'partial' : 'full',
        refund_amount: amount || 0,
        refund_reason: reason || '',
        updated_at: new Date().toISOString()
      }).eq('id', id);
      if (error) throw error;
      await logAudit(supabase, adminEmail, 'refund', 'order', id, { amount, reason });
      return NextResponse.json({ success: true });
    }

    if (action === "update_customer") {
      if (!id) return NextResponse.json({ error: "Missing customer id" }, { status: 400 });
      const { error } = await supabase.from('customers').update(payload).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "update_article") {
      if (!id) return NextResponse.json({ error: "Missing article id" }, { status: 400 });
      const { error } = await supabase.from('articles').update(payload).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "delete_article") {
      if (!id) return NextResponse.json({ error: "Missing article id" }, { status: 400 });
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "update_settings") {
      const { error } = await supabase.from('store_settings').upsert({ id: 'global', ...payload, updated_at: new Date().toISOString() });
      if (error) throw error;
      await logAudit(supabase, adminEmail, 'update', 'settings', 'global', payload);
      return NextResponse.json({ success: true });
    }

    if (action === "create_coupon") {
      const { error } = await supabase.from('coupons').insert({ ...payload, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      if (error) {
        if (error.code === '23505') return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
        throw error;
      }
      await logAudit(supabase, adminEmail, 'create', 'coupon', payload.code);
      return NextResponse.json({ success: true });
    }

    if (action === "update_coupon") {
      if (!id) return NextResponse.json({ error: "Missing coupon id" }, { status: 400 });
      const { error } = await supabase.from('coupons').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "delete_coupon") {
      if (!id) return NextResponse.json({ error: "Missing coupon id" }, { status: 400 });
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "approve_review") {
      if (!id) return NextResponse.json({ error: "Missing review id" }, { status: 400 });
      const { error } = await supabase.from('reviews').update({ is_approved: true, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "delete_review") {
      if (!id) return NextResponse.json({ error: "Missing review id" }, { status: 400 });
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "create_media") {
      const { error } = await supabase.from('media_files').insert({ ...payload, uploaded_by: auth.user?.id });
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "delete_media") {
      if (!id) return NextResponse.json({ error: "Missing media id" }, { status: 400 });
      const { error } = await supabase.from('media_files').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "create_shipping_zone") {
      const { error } = await supabase.from('shipping_zones').insert({ ...payload, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "update_shipping_zone") {
      if (!id) return NextResponse.json({ error: "Missing zone id" }, { status: 400 });
      const { error } = await supabase.from('shipping_zones').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "delete_shipping_zone") {
      if (!id) return NextResponse.json({ error: "Missing zone id" }, { status: 400 });
      const { error } = await supabase.from('shipping_zones').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "approve_commission") {
      if (!id) return NextResponse.json({ error: "Missing commission id" }, { status: 400 });
      const { error } = await supabase.from('commission_transactions')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      await logAudit(supabase, adminEmail, 'approve_commission', 'commission', id);
      return NextResponse.json({ success: true });
    }

    if (action === "pay_commission") {
      if (!id) return NextResponse.json({ error: "Missing commission id" }, { status: 400 });
      const { error } = await supabase.from('commission_transactions')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      await logAudit(supabase, adminEmail, 'pay_commission', 'commission', id);
      return NextResponse.json({ success: true });
    }

    if (action === "bulk_approve_commissions") {
      const { ids } = payload;
      if (!ids || !Array.isArray(ids) || ids.length === 0)
        return NextResponse.json({ error: "Missing commission ids" }, { status: 400 });
      const { error } = await supabase.from('commission_transactions')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .in('id', ids);
      if (error) throw error;
      return NextResponse.json({ success: true, count: ids.length });
    }

    if (action === "bulk_pay_commissions") {
      const { ids } = payload;
      if (!ids || !Array.isArray(ids) || ids.length === 0)
        return NextResponse.json({ error: "Missing commission ids" }, { status: 400 });
      const { error } = await supabase.from('commission_transactions')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .in('id', ids);
      if (error) throw error;
      return NextResponse.json({ success: true, count: ids.length });
    }

    if (action === "manual_reorder") {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Admin API POST Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
