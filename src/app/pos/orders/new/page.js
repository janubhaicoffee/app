"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Search } from "lucide-react";
import ProductGrid from "@/components/pos/ProductGrid";
import CartSidebar from "@/components/pos/CartSidebar";
import TableSelector from "@/components/pos/TableSelector";
import "../../pos.css";

export default function PosNewOrder() {
  const router = useRouter();
  const [outlet, setOutlet] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [orderType, setOrderType] = useState("dine-in");
  const [selectedTable, setSelectedTable] = useState(null);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const TAX_RATE = 0.05;

  useEffect(() => {
    const stored = sessionStorage.getItem("pos_outlet");
    if (!stored) { router.push("/pos"); return; }
    setOutlet(JSON.parse(stored));
  }, [router]);

  useEffect(() => {
    if (!outlet) return;

    const fetchCatalog = async () => {
      try {
        const [prodRes, catRes, tableRes] = await Promise.allSettled([
          fetch(`/api/pos/products?outletId=${outlet.id}`),
          fetch(`/api/pos/categories?outletId=${outlet.id}`),
          fetch(`/api/pos/tables?outletId=${outlet.id}`),
        ]);

        if (prodRes.status === "fulfilled" && prodRes.value.ok) {
          const body = await prodRes.value.json();
          setProducts(body.data || []);
        }
        if (catRes.status === "fulfilled" && catRes.value.ok) {
          const body = await catRes.value.json();
          const cats = body.data || [];
          setCategories(cats);
          if (cats.length > 0) setSelectedCategory(cats[0].id);
        }
        if (tableRes.status === "fulfilled" && tableRes.value.ok) {
          const body = await tableRes.value.json();
          setTables(body.data || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();

    const channel = supabase.channel("pos-menu-realtime");
    channel
      .on("postgres_changes", { event: "*", schema: "public", table: "pos_products", filter: `outlet_id=eq.${outlet.id}` }, () => { fetchCatalog(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "pos_categories", filter: `outlet_id=eq.${outlet.id}` }, () => { fetchCatalog(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "pos_tables", filter: `outlet_id=eq.${outlet.id}` }, () => { fetchCatalog(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [outlet]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price || 0),
        quantity: 1,
      }];
    });
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== productId));
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, quantity: qty } : i))
    );
  };

  const removeItem = (productId) => {
    setCartItems((prev) => prev.filter((i) => i.id !== productId));
  };

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || !outlet) return;
    setPlacing(true);
    try {
      const payload = {
        outlet_id: outlet.id,
        type: orderType,
        table_number: orderType === "dine-in" ? selectedTable : null,
        customer_name: customerName || null,
        notes: orderNotes || null,
        items: cartItems.map((i) => ({
          product_id: i.id,
          product_name: i.name,
          quantity: i.quantity,
          unit_price: i.price,
        })),
        subtotal,
        tax,
        total,
        status: "pending",
      };

      const res = await fetch("/api/pos/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody.error || "Failed to create order");
      }

      const order = await res.json();
      router.push(`/pos/orders/${order.data?.id || order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="pos-fullscreen">
        <div className="pos-top-bar"><h1>New Order</h1></div>
        <div className="pos-loading">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="pos-fullscreen">
      <div className="pos-top-bar">
        <button onClick={() => router.push("/pos/dashboard")}><ArrowLeft size={16} /> Back</button>
        <h1>New Order - {outlet?.name}</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => router.push("/pos/orders")}>Orders</button>
        </div>
      </div>

      <div className="pos-order-type-bar">
        <span style={{ fontSize: 13, fontWeight: 600 }}>Order Type:</span>
        {["dine-in", "takeaway", "delivery"].map((type) => (
          <button
            key={type}
            className={`pos-type-btn ${orderType === type ? "active" : ""}`}
            onClick={() => { setOrderType(type); if (type !== "dine-in") setShowTableSelector(false); }}
          >
            {type === "dine-in" ? "Dine In" : type === "takeaway" ? "Takeaway" : "Delivery"}
          </button>
        ))}
        {orderType === "dine-in" && (
          <button
            className="pos-type-btn"
            style={{ marginLeft: "auto", borderColor: selectedTable ? "var(--accent-red)" : undefined }}
            onClick={() => setShowTableSelector(!showTableSelector)}
          >
            {selectedTable ? `Table ${selectedTable}` : "Select Table"}
          </button>
        )}
      </div>

      {showTableSelector && (
        <div style={{ borderBottom: "1px solid var(--border-color)", background: "#fff" }}>
          <div style={{ maxHeight: 160, overflowY: "auto" }}>
            <TableSelector
              tables={tables}
              selectedTable={selectedTable}
              onSelectTable={(id) => { setSelectedTable(id); setShowTableSelector(false); }}
            />
          </div>
        </div>
      )}

      {error && (
        <div style={{ padding: 8, background: "#ffebee", color: "#c62828", fontSize: 13, textAlign: "center" }}>
          {error}
          <button style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer", fontWeight: 700 }} onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="pos-main-layout">
        <ProductGrid
          products={products}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onAddProduct={addToCart}
          loading={loading}
        />

        <CartSidebar
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          subtotal={subtotal}
          tax={tax}
          total={total}
          customerName={customerName}
          onCustomerNameChange={setCustomerName}
          orderNotes={orderNotes}
          onOrderNotesChange={setOrderNotes}
          onPlaceOrder={handlePlaceOrder}
          placing={placing}
          orderType={orderType}
          tableNumber={selectedTable}
        />
      </div>
    </div>
  );
}
