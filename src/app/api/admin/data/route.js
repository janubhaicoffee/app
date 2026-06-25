import { createClient } from "@/lib/supabaseWrapper";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify token using admin client
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify admin privileges
    const adminEmails = (process.env.SUPERADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    if (!adminEmails.includes(user.email?.toLowerCase())) {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "check") {
      return NextResponse.json({ isAdmin: true });
    }

    if (type === "dashboard") {
      const [{ count: pCount }, { count: cCount }, { count: oCount }, { count: aCount }, { data: allOrders }] = await Promise.all([
        supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('customers').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('orders').select('total_amount, status, created_at')
      ]);

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

      const chartData = Object.values(chartDataMap);

      return NextResponse.json({
        data: {
          products: pCount || 0,
          customers: cCount || 0,
          orders: oCount || 0,
          articles: aCount || 0,
          revenue: revenue,
          chartData: chartData
        }
      });
    }

    if (type === "products") {
      const { data: products, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .or('category.is.null,category.neq.merch')
        .order('id', { ascending: true });
      
      if (error) throw error;
      return NextResponse.json({ data: products });
    }

    if (type === "merch") {
      const { data: merch, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('category', 'merch')
        .order('id', { ascending: true });
      
      if (error) throw error;
      return NextResponse.json({ data: merch });
    }

    if (type === "orders") {
      const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return NextResponse.json({ data: orders });
    }

    if (type === "customers") {
      const { data: customers, error } = await supabaseAdmin
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return NextResponse.json({ data: customers });
    }

    if (type === "articles") {
      const { data: articles, error } = await supabaseAdmin
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return NextResponse.json({ data: articles });
    }

    if (type === "settings") {
      const { data: settings, error } = await supabaseAdmin
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
          razorpay_mode: 'test' 
        } 
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  } catch (error) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const adminEmails = (process.env.SUPERADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    if (!adminEmails.includes(user.email?.toLowerCase())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { action, payload, id } = body;

    if (action === "create_product") {
      const { data, error } = await supabaseAdmin.from('products').insert([payload]);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } else if (action === "update_product") {
      const { data, error } = await supabaseAdmin.from('products').update(payload).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } else if (action === "update_order") {
      const { data, error } = await supabaseAdmin.from('orders').update(payload).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } else if (action === "update_article") {
      const { data, error } = await supabaseAdmin.from('articles').update(payload).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } else if (action === "update_settings") {
      const { error } = await supabaseAdmin.from('store_settings').upsert({ id: 'global', ...payload, updated_at: new Date().toISOString() });
      if (error) throw error;
      return NextResponse.json({ success: true });
    } else if (action === "delete_article") {
      const { error } = await supabaseAdmin.from('articles').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin API POST Error:", error);
    return NextResponse.json({ error: error.message || JSON.stringify(error) || "Internal Server Error" }, { status: 500 });
  }
}
