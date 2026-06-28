"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

function StarRating({ rating }) {
  return (
    <span style={{ color: "var(--accent-gold)", letterSpacing: "2px", fontSize: "0.95rem" }}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

function truncate(text, len = 80) {
  if (!text) return "—";
  return text.length > len ? text.substring(0, len) + "…" : text;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => { fetchReviews(); }, []);

  async function fetchReviews() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/data?type=reviews", {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setReviews(json.data || []);
      }
    } catch (e) { console.error(e); }
  }

  async function apiCall(action, id) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    const res = await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action, id })
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Request failed");
      return false;
    }
    return true;
  }

  async function handleApprove(id) {
    if (await apiCall("approve_review", id)) fetchReviews();
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this review? This cannot be undone.")) return;
    if (await apiCall("delete_review", id)) fetchReviews();
  }

  const filtered = reviews.filter(r => {
    const status = r.is_approved ? "approved" : "pending";
    if (filter !== "all" && status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const product = r.products?.name || "";
      const author = (r.author_name || r.name || "").toLowerCase();
      if (!product.toLowerCase().includes(q) && !author.includes(q)) return false;
    }
    return true;
  });

  const counts = { all: reviews.length, pending: reviews.filter(r => !r.is_approved).length, approved: reviews.filter(r => r.is_approved).length };

  return (
    <div>
      <div className="admin-header">
        <h1>Reviews Moderation</h1>
      </div>

      <div className="admin-toolbar">
        <div className="admin-filter-tabs">
          {["all", "pending", "approved"].map(t => (
            <button key={t} className={`filter-tab${filter === t ? " active" : ""}`} onClick={() => setFilter(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)} ({counts[t]})
            </button>
          ))}
        </div>
        <div className="admin-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" placeholder="Search by product or author..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Author</th>
              <th>Rating</th>
              <th>Title</th>
              <th>Content</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: "center", color: "var(--text-secondary)" }}>No reviews found.</td></tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {r.products?.image_url && (
                        <img src={r.products.image_url} alt="" style={{ width: 32, height: 32, borderRadius: 4, objectFit: "cover" }} />
                      )}
                      <span style={{ fontWeight: 500, fontSize: "0.85rem" }}>{r.products?.name || "Unknown Product"}</span>
                    </div>
                  </td>
                  <td>{r.author_name || r.name || "Anonymous"}</td>
                  <td><StarRating rating={r.rating} /></td>
                  <td style={{ fontWeight: 600 }}>{r.title || "—"}</td>
                  <td style={{ fontSize: "0.82rem", color: "var(--text-secondary)", maxWidth: 200 }}>{truncate(r.content)}</td>
                  <td>
                    {r.is_approved ? (
                      <span className="status-badge" style={{ background: "#d4edda", color: "#155724" }}>Approved</span>
                    ) : (
                      <span className="status-badge" style={{ background: "#fff3cd", color: "#856404" }}>Pending</span>
                    )}
                  </td>
                  <td style={{ fontSize: "0.82rem" }}>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    {!r.is_approved && (
                      <button className="admin-btn-sm admin-btn-success" style={{ marginRight: "0.4rem", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "6px", padding: "0.35rem 0.7rem", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }} onClick={() => handleApprove(r.id)}>Approve</button>
                    )}
                    <button className="admin-btn-outline admin-btn-sm" style={{ borderColor: "var(--accent-red)", color: "var(--accent-red)" }} onClick={() => handleDelete(r.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
