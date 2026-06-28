"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [superadminEmails, setSuperadminEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchStaff();
    fetchAuditLog();
  }, []);

  async function fetchStaff() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/data?type=staff", {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setStaff(json.data?.staff || []);
        setSuperadminEmails(json.data?.superadmin_emails || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAuditLog() {
    setAuditLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/data?type=audit_log", {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setAuditLog(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAuditLoading(false);
    }
  }

  const handleAddAdmin = (e) => {
    e.preventDefault();
    if (!addEmail.trim()) return;
    showToast(`Email "${addEmail}" noted. Add it to SUPERADMIN_EMAILS env var and ensure the user exists in auth.`, "info");
    setAddEmail("");
  };

  const getRoleBadge = (role) => {
    const styles = {
      superadmin: { bg: "#cce5ff", color: "#004085" },
      admin: { bg: "#d4edda", color: "#155724" },
      staff: { bg: "#e2e3e5", color: "#383d41" },
    };
    const s = styles[role] || styles.staff;
    return <span className="status-badge" style={{ background: s.bg, color: s.color }}>{role}</span>;
  };

  return (
    <div className="admin-staff-page">
      {toast && (
        <div className={`admin-toast ${toast.type === "error" ? "admin-toast-error" : ""}`}>
          {toast.message}
        </div>
      )}

      <div className="admin-header">
        <h1>Staff Management</h1>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Current Staff</h3>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{staff.length} member{staff.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Created</th>
                <th>Last Login</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>Loading...</td></tr>
              ) : staff.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>No staff found.</td></tr>
              ) : (
                staff.map(member => (
                  <tr key={member.id}>
                    <td style={{ fontWeight: 600 }}>{member.email}</td>
                    <td>{member.created_at ? new Date(member.created_at).toLocaleDateString() : "—"}</td>
                    <td>{member.last_login ? new Date(member.last_login).toLocaleString() : "—"}</td>
                    <td>{getRoleBadge(member.role)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Configured Super Admins</h3>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {superadminEmails.length === 0 ? (
            <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No SUPERADMIN_EMAILS configured in environment.</span>
          ) : (
            superadminEmails.map(email => (
              <span key={email} className="status-badge" style={{ background: "#cce5ff", color: "#004085", fontSize: "0.8rem", padding: "0.3rem 0.8rem" }}>
                {email}
              </span>
            ))
          )}
        </div>
        <p className="form-hint" style={{ marginTop: "0.75rem" }}>
          Super admins are configured via the SUPERADMIN_EMAILS environment variable. To add or remove, update the env and restart.
        </p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Add Admin</h3>
        </div>
        <form onSubmit={handleAddAdmin} style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Email Address</label>
            <input required type="email" value={addEmail}
              onChange={e => setAddEmail(e.target.value)}
              placeholder="admin@example.com" />
          </div>
          <button type="submit" className="admin-btn">Add Admin</button>
        </form>
        <p className="form-hint" style={{ marginTop: "0.75rem" }}>
          Note: The user must already exist in the auth system. You must also add this email to the SUPERADMIN_EMAILS environment variable and restart the server for the change to take effect.
        </p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Audit Log</h3>
          <button className="admin-btn-sm" onClick={fetchAuditLog}>Refresh</button>
        </div>
        <div className="admin-table-wrap" style={{ maxHeight: 400, overflowY: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLoading ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>Loading...</td></tr>
              ) : auditLog.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>No audit log entries yet.</td></tr>
              ) : (
                auditLog.map((entry, i) => (
                  <tr key={entry.id || i}>
                    <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>{entry.admin_email || entry.admin_id || "—"}</td>
                    <td>
                      <span className="status-badge" style={{ background: "#eee", color: "#333" }}>
                        {entry.action}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>{entry.entity || entry.entity_type || "—"}</td>
                    <td style={{ fontSize: "0.85rem", maxWidth: 250 }}>
                      {entry.details
                        ? (typeof entry.details === "object" ? JSON.stringify(entry.details).slice(0, 80) + (JSON.stringify(entry.details).length > 80 ? "..." : "") : entry.details)
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx global>{`
        .admin-staff-page { position: relative; }
        .admin-table-wrap { overflow-x: auto; }
        .form-hint { font-size: 0.8rem; color: #999; }
      `}</style>
    </div>
  );
}
