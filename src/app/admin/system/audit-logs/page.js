"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search, Download, Calendar, RefreshCw, Clock,
  Shield, ChevronLeft, ChevronRight, Filter
} from "lucide-react";

const ACTION_COLORS = {
  create: { bg: "#d4edda", color: "#155724" },
  update: { bg: "#cce5ff", color: "#004085" },
  delete: { bg: "#f8d7da", color: "#721c24" },
  bulk_update: { bg: "#fff3cd", color: "#856404" },
  update_inventory: { bg: "#e8d5f5", color: "#6a1b9a" },
  refund: { bg: "#ffe0b2", color: "#e65100" }
};

const ENTITY_TYPES = [
  "product", "order", "customer", "coupon", "article",
  "settings", "review", "media", "shipping_zone", "outlet", "staff"
];

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterEntity, setFilterEntity] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [toast, setToast] = useState(null);
  const pageSize = 50;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filterAction, filterEntity]);

  async function fetchLogs() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/admin/data?type=audit_log", {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });

      if (res.ok) {
        const json = await res.json();
        let data = json.data || [];
        setTotalCount(data.length);

        if (filterAction !== "all") {
          data = data.filter(e => e.action === filterAction);
        }
        if (filterEntity !== "all") {
          data = data.filter(e =>
            (e.entity_type || e.entity || "").toLowerCase() === filterEntity
          );
        }

        const start = (page - 1) * pageSize;
        setLogs(data.slice(start, start + pageSize));
      }
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    setPage(1);
    fetchLogs();
  }

  function exportCSV() {
    if (!logs.length) return;
    const headers = ["Timestamp", "Admin Email", "Action", "Entity Type", "Entity ID", "Details"];
    const rows = logs.map(e => [
      new Date(e.created_at).toISOString(),
      e.admin_email || "",
      e.action || "",
      e.entity_type || e.entity || "",
      e.entity_id || "",
      typeof e.details === 'object' ? JSON.stringify(e.details) : (e.details || "")
    ].map(v => `"${v.replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Audit log exported");
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  const filteredForDisplay = logs.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (e.admin_email || "").toLowerCase().includes(q) ||
      (e.action || "").toLowerCase().includes(q) ||
      (e.entity_type || e.entity || "").toLowerCase().includes(q) ||
      (e.entity_id || "").toLowerCase().includes(q) ||
      (JSON.stringify(e.details) || "").toLowerCase().includes(q);
  });

  return (
    <div>
      {toast && (
        <div className={`admin-toast ${toast.type === "error" ? "admin-toast-error" : ""}`}>
          {toast.message}
        </div>
      )}

      <div className="admin-header">
        <div>
          <h1>System Audit Logs</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Track all administrative actions across the system
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="admin-btn-outline admin-btn-sm" onClick={fetchLogs}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="admin-btn-outline admin-btn-sm" onClick={exportCSV}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="admin-card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="admin-search" style={{ flex: 1, minWidth: 200 }}>
            <Search size={16} color="var(--text-secondary)" />
            <input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Filter size={14} color="var(--text-secondary)" />
            <select value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1); }}
              style={{ padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
              <option value="all">All Actions</option>
              {Object.keys(ACTION_COLORS).map(a => (
                <option key={a} value={a}>{a.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <select value={filterEntity} onChange={e => { setFilterEntity(e.target.value); setPage(1); }}
              style={{ padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
              <option value="all">All Entities</option>
              {ENTITY_TYPES.map(t => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={14} color="var(--text-secondary)" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
              placeholder="From" />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>—</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
              placeholder="To" />
            <button className="admin-btn-sm" onClick={applyFilters}>Apply</button>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Audit Log Entries</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {totalCount} total entries
          </span>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /> Loading audit logs...</div>
        ) : filteredForDisplay.length === 0 ? (
          <div className="empty-state">
            <Shield size={48} />
            <h3>No audit log entries found</h3>
            <p>Audit logs will appear here as admins perform actions.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: 600, overflowY: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap' }}>Timestamp</th>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Entity Type</th>
                  <th>Entity ID</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredForDisplay.map((entry, i) => {
                  const actionColor = ACTION_COLORS[entry.action] || { bg: "#e2e3e5", color: "#383d41" };
                  let details = entry.details;
                  if (details && typeof details === 'object') {
                    details = JSON.stringify(details);
                  }
                  return (
                    <tr key={entry.id || i}>
                      <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={12} color="var(--text-secondary)" />
                          {new Date(entry.created_at).toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {entry.admin_email || '—'}
                      </td>
                      <td>
                        <span className="status-badge" style={{
                          background: actionColor.bg,
                          color: actionColor.color,
                          textTransform: 'capitalize'
                        }}>
                          {entry.action?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>
                        {entry.entity_type || entry.entity || '—'}
                      </td>
                      <td style={{ fontSize: '0.8rem', fontFamily: 'monospace', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {entry.entity_id || '—'}
                      </td>
                      <td style={{ fontSize: '0.82rem', maxWidth: 300 }}>
                        <div style={{
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          color: details ? 'var(--text-secondary)' : '#999'
                        }}>
                          {details ? (
                            details.length > 100 ? details.slice(0, 100) + '...' : details
                          ) : '—'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', padding: '1rem 0 0', borderTop: '1px solid var(--border-color)', marginTop: '1rem' }}>
            <button className="admin-btn-outline admin-btn-sm" disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}>
              <ChevronLeft size={14} /> Previous
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Page {page} of {totalPages}
            </span>
            <button className="admin-btn-outline admin-btn-sm" disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
