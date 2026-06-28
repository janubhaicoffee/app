"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminCustomers() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const [custRes, ordRes] = await Promise.all([
          fetch("/api/admin/data?type=customers", {
            headers: { "Authorization": `Bearer ${session.access_token}` }
          }),
          fetch("/api/admin/data?type=orders", {
            headers: { "Authorization": `Bearer ${session.access_token}` }
          })
        ]);

        const custJson = await custRes.json();
        const ordJson = await ordRes.json();

        if (custRes.ok) setCustomers(custJson.data || []);
        else setError(custJson.error);

        if (ordRes.ok) setOrders(ordJson.data || []);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const orderStats = {};
  orders.forEach(o => {
    if (!orderStats[o.user_id]) orderStats[o.user_id] = { count: 0, total: 0 };
    orderStats[o.user_id].count += 1;
    orderStats[o.user_id].total += o.total_amount || 0;
  });

  const filtered = customers.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (c.name || "").toLowerCase().includes(q) ||
           (c.email || "").toLowerCase().includes(q) ||
           (c.phone || "").toLowerCase().includes(q);
  });

  const exportCSV = () => {
    if (customers.length === 0) return;
    const headers = ["ID", "Name", "Email", "Phone", "Total Orders", "Total Spent", "Tags", "Joined Date"];
    const csvRows = [headers.join(",")];

    customers.forEach(c => {
      const stats = orderStats[c.id] || { count: 0, total: 0 };
      const row = [
        c.id,
        `"${c.name || ""}"`,
        `"${c.email || ""}"`,
        `"${c.phone || ""}"`,
        stats.count,
        stats.total,
        `"${(c.tags || []).join("; ")}"`,
        new Date(c.created_at).toISOString().split("T")[0]
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="admin-loading">Loading customers...</div>;
  if (error) return <div className="admin-loading" style={{ color: "#c62828" }}>Error: {error}</div>;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Customers Directory</h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
            {customers.length} customer{customers.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button className="admin-btn" onClick={exportCSV}>Download CSV</button>
      </div>

      <div className="admin-toolbar">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, maxWidth: "400px", padding: "0.6rem 0.75rem",
            border: "1px solid var(--border-color)", borderRadius: "6px",
            fontSize: "0.9rem", fontFamily: "inherit"
          }}
        />
        {search && (
          <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            {filtered.length} of {customers.length} shown
          </span>
        )}
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Status / Tags</th>
              <th>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                {search ? "No customers match your search." : "No customers found."}
              </td></tr>
            ) : (
              filtered.map(customer => {
                const stats = orderStats[customer.id] || { count: 0, total: 0 };
                return (
                  <tr key={customer.id}>
                    <td>
                      <span
                        style={{ fontWeight: 600, color: "var(--primary-color)", cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => router.push(`/admin/customers/${customer.id}`)}
                      >
                        {customer.name}
                      </span>
                    </td>
                    <td>{customer.email}</td>
                    <td>{customer.phone || "-"}</td>
                    <td>{stats.count}</td>
                    <td>₹{stats.total.toLocaleString()}</td>
                    <td>
                      {customer.status && (
                        <span style={{
                          textTransform: "capitalize", padding: "0.15rem 0.5rem", borderRadius: "4px",
                          fontSize: "0.8rem", fontWeight: 600, marginRight: "0.5rem",
                          background: customer.status === "active" ? "#e8f5e9" : "#ffebee",
                          color: customer.status === "active" ? "#2e7d32" : "#c62828"
                        }}>{customer.status}</span>
                      )}
                      {customer.tags?.length > 0 && (
                        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          {customer.tags.slice(0, 2).join(", ")}{customer.tags.length > 2 ? "..." : ""}
                        </span>
                      )}
                      {!customer.status && (!customer.tags || customer.tags.length === 0) && "-"}
                    </td>
                    <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
