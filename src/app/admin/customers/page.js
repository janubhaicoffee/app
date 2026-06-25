"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch("/api/admin/data?type=customers", {
          headers: {
            "Authorization": `Bearer ${session.access_token}`
          }
        });
        
        const json = await res.json();
        if (res.ok) {
          setCustomers(json.data || []);
        } else {
          setError(json.error);
        }
      } catch (err) {
        setError("Failed to fetch customers");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);

  const exportCSV = () => {
    if (customers.length === 0) return;
    const headers = ["ID", "Name", "Email", "Phone", "Joined Date"];
    const csvRows = [headers.join(",")];
    
    customers.forEach(c => {
      const row = [
        c.id,
        `"${c.name || ''}"`,
        `"${c.email || ''}"`,
        `"${c.phone || ''}"`,
        new Date(c.created_at).toISOString().split('T')[0]
      ];
      csvRows.push(row.join(","));
    });
    
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading customers...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Customers Directory</h1>
        <button className="admin-btn" onClick={exportCSV}>Download CSV</button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No customers found.</td></tr>
            ) : (
              customers.map(customer => (
                <tr key={customer.id}>
                  <td style={{ fontWeight: 600 }}>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || "-"}</td>
                  <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
