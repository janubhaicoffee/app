'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Users,
  UserCheck,
  Shield,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Mail,
  Phone,
  MapPin,
  Tag,
  DollarSign,
  Briefcase,
  Store,
  Key,
  Calendar,
  Layers,
  ChevronRight,
  X,
  Lock,
  Sparkles,
  ShoppingBag,
  Info,
  Check,
  AlertCircle,
  ShieldCheck,
  Award,
  Coffee,
  CreditCard,
  ChefHat,
  Sliders,
} from 'lucide-react';

// Strict 6 Roles for the Entire Application
export const roleBadgeColors = {
  superadmin: { bg: 'rgba(216, 154, 30, 0.2)', color: '#d89a1e', border: 'rgba(216, 154, 30, 0.4)', label: 'Superadmin' },
  operations_head: { bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)', label: 'Operations Head' },
  growth: { bg: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', border: 'rgba(236, 72, 153, 0.4)', label: 'Growth' },
  manager: { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.4)', label: 'Manager' },
  employee: { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.4)', label: 'Employee' },
  customer: { bg: 'rgba(255, 255, 255, 0.08)', color: '#cbb9a8', border: 'rgba(245, 240, 234, 0.12)', label: 'Customer' },
};

export const normalizeRole = (rawRole) => {
  if (!rawRole) return 'customer';
  const r = String(rawRole).toLowerCase().trim();
  if (r === 'superadmin' || r === 'owner') return 'superadmin';
  if (['operations_head', 'operations', 'operation_manager', 'operations_manager', 'area_manager'].includes(r)) return 'operations_head';
  if (['growth', 'brand_leader'].includes(r)) return 'growth';
  if (['manager', 'store_manager'].includes(r)) return 'manager';
  if (['employee', 'staff', 'cashier', 'barista', 'kitchen'].includes(r)) return 'employee';
  return 'customer';
};

function UsersDashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Active Tab: 'customers' | 'staff' | 'admins' | 'audit'
  const initialTab = searchParams.get('tab') || 'customers';
  const [activeTab, setActiveTab] = useState(initialTab);

  // General Loading & Toast state
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Data States
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [adminProfiles, setAdminProfiles] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Customer Filters & Modal
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFilterType, setCustomerFilterType] = useState('all'); // all, spenders, repeat, social, new
  const [customerSortBy, setCustomerSortBy] = useState('newest'); // newest, spent_desc, orders_desc, name_asc
  const [selectedCustomerId, setSelectedCustomerId] = useState(searchParams.get('customer') || null);
  const [selectedCustomerData, setSelectedCustomerData] = useState(null);
  const [customerDetailLoading, setCustomerDetailLoading] = useState(false);
  const [customerNotes, setCustomerNotes] = useState('');
  const [customerTagsInput, setCustomerTagsInput] = useState('');
  const [savingCustomer, setSavingCustomer] = useState(false);

  // Staff Filters
  const [staffSearch, setStaffSearch] = useState('');
  const [staffOutletFilter, setStaffOutletFilter] = useState('all');
  const [staffRoleFilter, setStaffRoleFilter] = useState('all');
  const [staffStatusFilter, setStaffStatusFilter] = useState('all');

  // Unified Role & Permissions Editor Modal (Super Admin only)
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [roleForm, setRoleForm] = useState({
    user_id: '',
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    outlet_id: '',
    pin: '',
    monthly_salary: '',
    commission_on_profit: false,
    notes: '',
  });

  // Audit Logs Filter
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('all');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync tab with URL
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    if (newTab !== 'customers') params.delete('customer');
    params.delete('action');
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Initial Data Fetching from Live Supabase
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${session.access_token}` };

      const [custRes, ordRes, staffRes, outletsRes, profilesRes, auditRes] = await Promise.all([
        fetch('/api/admin/data?type=customers', { headers }),
        fetch('/api/admin/data?type=orders', { headers }),
        fetch('/api/admin/staff', { headers }),
        fetch('/api/admin/outlets', { headers }),
        fetch('/api/admin/profiles', { headers }),
        fetch('/api/admin/data?type=audit_log', { headers }),
      ]);

      let staffList = [];
      let adminList = [];

      if (staffRes.ok) {
        const json = await staffRes.json();
        staffList = (json.data || []).map((s) => ({
          ...s,
          role: normalizeRole(s.role),
        }));
        setStaff(staffList);
      }
      if (profilesRes.ok) {
        const json = await profilesRes.json();
        adminList = (json.data || []).map((a) => ({
          ...a,
          role: normalizeRole(a.role),
        }));
        setAdminProfiles(adminList);
      }
      if (outletsRes.ok) {
        const json = await outletsRes.json();
        setOutlets(json.data || []);
      }
      if (ordRes.ok) {
        const json = await ordRes.json();
        setOrders(json.data || []);
      }
      if (auditRes.ok) {
        const json = await auditRes.json();
        setAuditLogs(json.data || []);
      }

      if (custRes.ok) {
        const json = await custRes.json();
        const rawCustomers = json.data || [];

        // Enrich customers with their normalized live role from staff/admin tables
        const enriched = rawCustomers.map((c) => {
          const emailLower = (c.email || '').toLowerCase();
          const phoneTrimmed = c.phone || '';

          // Check admin profiles
          const matchedAdmin = adminList.find(
            (a) => (a.email && a.email.toLowerCase() === emailLower) || (a.phone && a.phone === phoneTrimmed)
          );
          if (matchedAdmin) {
            return { ...c, computedRole: 'superadmin' };
          }

          // Check staff profiles
          const matchedStaff = staffList.find(
            (s) =>
              (s.user_id && s.user_id === c.id) ||
              (s.email && s.email.toLowerCase() === emailLower) ||
              (s.phone && s.phone === phoneTrimmed)
          );
          if (matchedStaff) {
            return {
              ...c,
              computedRole: normalizeRole(matchedStaff.role),
              outlet_id: matchedStaff.outlet_id,
              staffRecordId: matchedStaff.id,
            };
          }

          return { ...c, computedRole: 'customer' };
        });

        setCustomers(enriched);
      }
    } catch (err) {
      console.error('Failed to load user management data', err);
      showToast('Error loading live user data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Compute Order Statistics per customer
  const orderStats = useMemo(() => {
    const stats = {};
    orders.forEach((o) => {
      const uid = o.user_id;
      if (!uid) return;
      if (!stats[uid]) stats[uid] = { count: 0, total: 0, lastOrderDate: null };
      stats[uid].count += 1;
      stats[uid].total += Number(o.total_amount || 0);
      if (!stats[uid].lastOrderDate || new Date(o.created_at) > new Date(stats[uid].lastOrderDate)) {
        stats[uid].lastOrderDate = o.created_at;
      }
    });
    return stats;
  }, [orders]);

  // Executive Top Metrics Summary
  const executiveMetrics = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c) => (orderStats[c.id]?.count || 0) > 0).length;
    const totalCustomerSpend = Object.values(orderStats).reduce((acc, curr) => acc + curr.total, 0);

    const totalStaff = staff.length;
    const activeStaff = staff.filter((s) => s.is_active).length;
    const totalAdmins = adminProfiles.length || 1;

    const avgSpend = totalCustomers > 0 ? Math.round(totalCustomerSpend / totalCustomers) : 0;

    return {
      totalCustomers,
      activeCustomers,
      totalCustomerSpend,
      totalStaff,
      activeStaff,
      totalAdmins,
      avgSpend,
    };
  }, [customers, staff, adminProfiles, orderStats]);

  // Load individual Customer detail when selected
  useEffect(() => {
    if (!selectedCustomerId) {
      setSelectedCustomerData(null);
      return;
    }

    const fetchCustomerDetail = async () => {
      try {
        setCustomerDetailLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch(`/api/admin/data?type=customer_detail&id=${selectedCustomerId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (res.ok) {
          const json = await res.json();
          setSelectedCustomerData(json.data);
          setCustomerNotes(json.data?.notes || '');
          setCustomerTagsInput((json.data?.tags || []).join(', '));
        }
      } catch (err) {
        showToast('Error loading customer details', 'error');
      } finally {
        setCustomerDetailLoading(false);
      }
    };

    fetchCustomerDetail();
  }, [selectedCustomerId]);

  // Save Customer Notes and Tags
  const handleSaveCustomerNotes = async () => {
    if (!selectedCustomerData) return;
    try {
      setSavingCustomer(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const tagsArray = customerTagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'update_customer',
          id: selectedCustomerData.id,
          payload: {
            notes: customerNotes,
            tags: tagsArray,
          },
        }),
      });

      if (res.ok) {
        showToast('Customer profile updated');
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === selectedCustomerData.id ? { ...c, notes: customerNotes, tags: tagsArray } : c
          )
        );
      } else {
        showToast('Failed to update customer', 'error');
      }
    } catch (err) {
      showToast('Error saving customer info', 'error');
    } finally {
      setSavingCustomer(false);
    }
  };

  // Open Role & Permissions Editor Modal for ANY User / Staff / Admin
  const openRoleEditor = (user) => {
    const matchedStaff = staff.find(
      (s) =>
        (s.user_id && s.user_id === user.id) ||
        (s.email && s.email.toLowerCase() === (user.email || '').toLowerCase()) ||
        (s.phone && s.phone === user.phone)
    );

    const matchedAdmin = adminProfiles.find(
      (a) =>
        (a.email && a.email.toLowerCase() === (user.email || '').toLowerCase()) ||
        (a.phone && a.phone === user.phone)
    );

    const currentRole = normalizeRole(
      user.role || user.computedRole || (matchedAdmin ? 'superadmin' : matchedStaff ? matchedStaff.role : 'customer')
    );

    setRoleForm({
      user_id: user.id || matchedStaff?.user_id || '',
      name: user.name || user.display_name || 'User',
      email: user.email || '',
      phone: user.phone || '',
      role: currentRole,
      outlet_id: user.outlet_id || matchedStaff?.outlet_id || outlets[0]?.id || '',
      pin: matchedStaff?.pin || matchedStaff?.pin_code || '',
      monthly_salary: matchedStaff?.monthly_salary || '',
      commission_on_profit: !!matchedStaff?.commission_on_profit,
      notes: matchedStaff?.notes || '',
    });
    setShowRoleModal(true);
  };

  // Submit Role & Permissions Update to /api/admin/users/role
  const handleSaveRole = async (e) => {
    e.preventDefault();
    try {
      setSavingRole(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        showToast('Session expired, please login', 'error');
        return;
      }

      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(roleForm),
      });

      if (res.ok) {
        const json = await res.json();
        showToast(`Role updated to ${roleForm.role.toUpperCase()} successfully!`);
        setShowRoleModal(false);
        fetchAllData();
      } else {
        const json = await res.json();
        showToast(json.error || 'Failed to update user role', 'error');
      }
    } catch (err) {
      showToast('Error saving user role', 'error');
    } finally {
      setSavingRole(false);
    }
  };

  // Staff Actions
  const handleToggleStaffActive = async (member) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const newStatus = !member.is_active;
      const res = await fetch('/api/admin/staff', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: member.id, is_active: newStatus }),
      });

      if (res.ok) {
        showToast(newStatus ? 'Staff activated' : 'Staff deactivated');
        setStaff((prev) => prev.map((s) => (s.id === member.id ? { ...s, is_active: newStatus } : s)));
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Error updating staff status', 'error');
    }
  };

  const handleDeleteStaff = async (member) => {
    if (!confirm(`Are you sure you want to remove ${member.name || member.display_name} from staff?`)) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/admin/staff?id=${member.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        showToast('Staff member removed');
        setStaff((prev) => prev.filter((s) => s.id !== member.id));
        fetchAllData();
      } else {
        showToast('Failed to delete staff member', 'error');
      }
    } catch (err) {
      showToast('Error deleting staff', 'error');
    }
  };

  // Revoke Admin Profile
  const handleDeleteAdminProfile = async (admin) => {
    if (!confirm(`Revoke admin access for ${admin.name || admin.email}?`)) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/admin/profiles?id=${admin.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        showToast('Admin access revoked');
        setAdminProfiles((prev) => prev.filter((a) => a.id !== admin.id));
        fetchAllData();
      } else {
        showToast('Failed to revoke access', 'error');
      }
    } catch (err) {
      showToast('Error revoking admin access', 'error');
    }
  };

  // CSV Export for Customers
  const exportCustomersCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Orders Count', 'Total Spent (INR)', 'Role', 'Created At'];
    const rows = customers.map((c) => {
      const stats = orderStats[c.id] || { count: 0, total: 0 };
      return [
        c.id,
        `"${c.name || 'Anonymous'}"`,
        c.email || '',
        c.phone || '',
        stats.count,
        stats.total,
        c.computedRole || 'customer',
        c.created_at,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `janubhai_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered & Sorted Customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const matchesSearch =
          !customerSearch ||
          (c.name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
          (c.email || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
          (c.phone || '').includes(customerSearch) ||
          (c.current_location || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
          (c.tags || []).some((t) => t.toLowerCase().includes(customerSearch.toLowerCase()));

        const stats = orderStats[c.id] || { count: 0, total: 0 };

        if (customerFilterType === 'spenders') return matchesSearch && stats.total >= 1000;
        if (customerFilterType === 'repeat') return matchesSearch && stats.count >= 2;
        if (customerFilterType === 'social') return matchesSearch && Boolean(c.auth_provider);
        if (customerFilterType === 'new') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return matchesSearch && new Date(c.created_at) >= thirtyDaysAgo;
        }

        return matchesSearch;
      })
      .sort((a, b) => {
        const statsA = orderStats[a.id] || { count: 0, total: 0 };
        const statsB = orderStats[b.id] || { count: 0, total: 0 };

        if (customerSortBy === 'spent_desc') return statsB.total - statsA.total;
        if (customerSortBy === 'orders_desc') return statsB.count - statsA.count;
        if (customerSortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [customers, customerSearch, customerFilterType, customerSortBy, orderStats]);

  // Filtered Staff
  const filteredStaff = useMemo(() => {
    return staff.filter((m) => {
      const matchesSearch =
        !staffSearch ||
        (m.name || m.display_name || '').toLowerCase().includes(staffSearch.toLowerCase()) ||
        (m.email || '').toLowerCase().includes(staffSearch.toLowerCase()) ||
        (m.phone || '').includes(staffSearch);

      const matchesOutlet = staffOutletFilter === 'all' || m.outlet_id === staffOutletFilter;
      const normalizedRole = normalizeRole(m.role);
      const matchesRole = staffRoleFilter === 'all' || normalizedRole === staffRoleFilter;
      const matchesStatus =
        staffStatusFilter === 'all' ||
        (staffStatusFilter === 'active' && m.is_active) ||
        (staffStatusFilter === 'inactive' && !m.is_active);

      return matchesSearch && matchesOutlet && matchesRole && matchesStatus;
    });
  }, [staff, staffSearch, staffOutletFilter, staffRoleFilter, staffStatusFilter]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        !auditSearch ||
        (log.admin_email || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
        (log.action || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
        (log.entity_type || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
        JSON.stringify(log.details || '').toLowerCase().includes(auditSearch.toLowerCase());

      const matchesAction = auditActionFilter === 'all' || log.action === auditActionFilter;

      return matchesSearch && matchesAction;
    });
  }, [auditLogs, auditSearch, auditActionFilter]);

  const getOutletName = (id) => {
    const outlet = outlets.find((o) => o.id === id);
    return outlet ? outlet.name : 'All Outlets (HQ Global)';
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <span>Loading User Command Center...</span>
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <div className={`admin-toast ${toast.type === 'error' ? 'admin-toast-error' : ''}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="admin-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ margin: 0 }}>Users & Access Management</h1>
            <span
              style={{
                background: 'rgba(216, 154, 30, 0.15)',
                color: 'var(--accent-gold, #d89a1e)',
                border: '1px solid rgba(216, 154, 30, 0.3)',
                padding: '3px 10px',
                borderRadius: '100px',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Master Directory
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary, #cbb9a8)', margin: '0.35rem 0 0', fontSize: '0.9rem' }}>
            Unified command hub for Customers, Store Team & Crew, and Administrative Role Permissions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="admin-btn-outline admin-btn-sm" onClick={fetchAllData} title="Refresh Live Data">
            <RefreshCw size={14} /> Refresh
          </button>
          {activeTab === 'customers' && (
            <button className="admin-btn-outline admin-btn-sm" onClick={exportCustomersCSV}>
              <Download size={14} /> Export CSV
            </button>
          )}
          <button
            className="admin-btn admin-btn-sm"
            onClick={() =>
              openRoleEditor({
                id: '',
                name: '',
                email: '',
                phone: '',
                role: activeTab === 'admins' ? 'superadmin' : activeTab === 'staff' ? 'manager' : 'customer',
              })
            }
          >
            <Plus size={15} /> Assign Role / Add User
          </button>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
        {/* Total Customers */}
        <div
          className="stat-card blue"
          style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
          onClick={() => handleTabChange('customers')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3>
              <Users size={14} style={{ display: 'inline', marginRight: 4 }} /> Customers
            </h3>
            <span style={{ fontSize: '0.75rem', opacity: 0.8, color: '#60a5fa' }}>
              {executiveMetrics.activeCustomers} active buyers
            </span>
          </div>
          <p className="stat-value">{executiveMetrics.totalCustomers}</p>
          <p className="stat-sub">Registered accounts across web & cafe</p>
        </div>

        {/* Staff & Crew */}
        <div
          className="stat-card gold"
          style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
          onClick={() => handleTabChange('staff')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3>
              <Store size={14} style={{ display: 'inline', marginRight: 4 }} /> Store Staff
            </h3>
            <span style={{ fontSize: '0.75rem', opacity: 0.8, color: '#d89a1e' }}>
              {executiveMetrics.activeStaff} on duty
            </span>
          </div>
          <p className="stat-value">{executiveMetrics.totalStaff}</p>
          <p className="stat-sub">Across {outlets.length} active outlet locations</p>
        </div>

        {/* Administrators */}
        <div
          className="stat-card"
          style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
          onClick={() => handleTabChange('admins')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3>
              <Shield size={14} style={{ display: 'inline', marginRight: 4 }} /> Admin & Leadership
            </h3>
            <span style={{ fontSize: '0.75rem', opacity: 0.8, color: 'var(--accent-gold)' }}>
              Super & Ops Leads
            </span>
          </div>
          <p className="stat-value">{executiveMetrics.totalAdmins}</p>
          <p className="stat-sub">Authorized system control profiles</p>
        </div>

        {/* Lifetime Revenue from Customers */}
        <div className="stat-card green">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3>
              <DollarSign size={14} style={{ display: 'inline', marginRight: 4 }} /> Customer Sales
            </h3>
            <span style={{ fontSize: '0.75rem', opacity: 0.8, color: '#69f0ae' }}>
              Avg ₹{executiveMetrics.avgSpend.toLocaleString()} / cust
            </span>
          </div>
          <p className="stat-value">₹ {executiveMetrics.totalCustomerSpend.toLocaleString('en-IN')}</p>
          <p className="stat-sub">Direct order volume generated</p>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(245, 240, 234, 0.1)',
          paddingBottom: '0.25rem',
          marginBottom: '1.5rem',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => handleTabChange('customers')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: activeTab === 'customers' ? 'rgba(216, 154, 30, 0.15)' : 'transparent',
            color: activeTab === 'customers' ? 'var(--accent-gold, #d89a1e)' : 'var(--text-secondary, #cbb9a8)',
            border: 'none',
            borderBottom: activeTab === 'customers' ? '2px solid var(--accent-gold, #d89a1e)' : '2px solid transparent',
            fontWeight: activeTab === 'customers' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.2s ease',
          }}
        >
          <Users size={17} /> Customers Directory ({customers.length})
        </button>

        <button
          onClick={() => handleTabChange('staff')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: activeTab === 'staff' ? 'rgba(216, 154, 30, 0.15)' : 'transparent',
            color: activeTab === 'staff' ? 'var(--accent-gold, #d89a1e)' : 'var(--text-secondary, #cbb9a8)',
            border: 'none',
            borderBottom: activeTab === 'staff' ? '2px solid var(--accent-gold, #d89a1e)' : '2px solid transparent',
            fontWeight: activeTab === 'staff' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.2s ease',
          }}
        >
          <Store size={17} /> Store Staff & Team ({staff.length})
        </button>

        <button
          onClick={() => handleTabChange('admins')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: activeTab === 'admins' ? 'rgba(216, 154, 30, 0.15)' : 'transparent',
            color: activeTab === 'admins' ? 'var(--accent-gold, #d89a1e)' : 'var(--text-secondary, #cbb9a8)',
            border: 'none',
            borderBottom: activeTab === 'admins' ? '2px solid var(--accent-gold, #d89a1e)' : '2px solid transparent',
            fontWeight: activeTab === 'admins' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.2s ease',
          }}
        >
          <Shield size={17} /> Admin Profiles & Roles ({adminProfiles.length})
        </button>

        <button
          onClick={() => handleTabChange('audit')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: activeTab === 'audit' ? 'rgba(216, 154, 30, 0.15)' : 'transparent',
            color: activeTab === 'audit' ? 'var(--accent-gold, #d89a1e)' : 'var(--text-secondary, #cbb9a8)',
            border: 'none',
            borderBottom: activeTab === 'audit' ? '2px solid var(--accent-gold, #d89a1e)' : '2px solid transparent',
            fontWeight: activeTab === 'audit' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.2s ease',
          }}
        >
          <Clock size={17} /> User Security & Activity Logs
        </button>
      </div>

      {/* =========================================================================
          TAB 1: CUSTOMERS DIRECTORY
          ========================================================================= */}
      {activeTab === 'customers' && (
        <div>
          {/* Filter Toolbar */}
          <div className="admin-toolbar" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', width: '100%', alignItems: 'center' }}>
              <div className="admin-search" style={{ flex: 1, minWidth: '260px' }}>
                <Search size={16} color="var(--text-secondary)" />
                <input
                  type="text"
                  placeholder="Search customer name, email, phone, location, tags..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
              </div>

              {/* Sort By Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Sort:</span>
                <select
                  value={customerSortBy}
                  onChange={(e) => setCustomerSortBy(e.target.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-chocolate, #1a0f0c)',
                    color: 'var(--text-warm-white, #f5f0ea)',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="newest">Newest Joined</option>
                  <option value="spent_desc">Highest Spend (₹)</option>
                  <option value="orders_desc">Most Orders</option>
                  <option value="name_asc">Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Quick Filter Chips */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter:</span>
              {[
                { key: 'all', label: 'All Customers' },
                { key: 'spenders', label: 'Big Spenders (₹1,000+)' },
                { key: 'repeat', label: 'Repeat Buyers (2+ orders)' },
                { key: 'social', label: 'Social Logins (Google/FB)' },
                { key: 'new', label: 'Joined Last 30 Days' },
              ].map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => setCustomerFilterType(chip.key)}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: customerFilterType === chip.key ? 'var(--accent-gold, #d89a1e)' : 'rgba(255, 255, 255, 0.06)',
                    color: customerFilterType === chip.key ? '#1a0f0c' : 'var(--text-secondary, #cbb9a8)',
                    border: '1px solid',
                    borderColor: customerFilterType === chip.key ? 'var(--accent-gold, #d89a1e)' : 'rgba(245, 240, 234, 0.1)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {chip.label}
                </button>
              ))}
              <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Showing {filteredCustomers.length} of {customers.length}
              </span>
            </div>
          </div>

          {/* Customers Table */}
          <div className="admin-card">
            {filteredCustomers.length === 0 ? (
              <div className="empty-state">
                <Users size={44} />
                <h3>No customers found</h3>
                <p>Try refining your search terms or filter criteria.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 44 }}></th>
                    <th>Customer</th>
                    <th>Contact Info</th>
                    <th>Current System Role</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Tags</th>
                    <th>Joined</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => {
                    const stats = orderStats[customer.id] || { count: 0, total: 0 };
                    const roleBadge = roleBadgeColors[customer.computedRole] || roleBadgeColors.customer;
                    return (
                      <tr key={customer.id}>
                        <td>
                          {customer.profile_picture_url ? (
                            <img
                              src={customer.profile_picture_url}
                              alt=""
                              style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(216, 154, 30, 0.3)' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #d89a1e, #8c5d13)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                color: '#1a0f0c',
                              }}
                            >
                              {(customer.name || '?')[0].toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary, #f5f0ea)' }}>
                              {customer.name || 'Anonymous User'}
                            </span>
                            {customer.auth_provider && (
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: 4,
                                  fontSize: '0.62rem',
                                  fontWeight: 700,
                                  background:
                                    customer.auth_provider === 'facebook'
                                      ? '#1877F2'
                                      : customer.auth_provider === 'google'
                                      ? '#DB4437'
                                      : 'rgba(255, 255, 255, 0.1)',
                                  color: '#fff',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {customer.auth_provider}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #cbb9a8)' }}>
                            ID: {customer.id?.toString().slice(0, 8)}...
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>{customer.email || '-'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{customer.phone || ''}</div>
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: roleBadge.bg,
                              color: roleBadge.color,
                              border: `1px solid ${roleBadge.border}`,
                            }}
                          >
                            {roleBadge.label}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: stats.count > 0 ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>
                            {stats.count}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: stats.total > 0 ? '#69f0ae' : 'var(--text-secondary)' }}>
                          ₹{stats.total.toLocaleString()}
                        </td>
                        <td>
                          {customer.tags && customer.tags.length > 0 ? (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {customer.tags.slice(0, 2).map((t, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: '0.72rem',
                                    background: 'rgba(216, 154, 30, 0.15)',
                                    color: 'var(--accent-gold, #d89a1e)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>-</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {new Date(customer.created_at).toLocaleDateString('en-IN')}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                            <button
                              className="admin-btn-outline admin-btn-sm"
                              onClick={() => setSelectedCustomerId(customer.id)}
                              title="View Customer Orders & CRM"
                            >
                              <Eye size={13} /> View
                            </button>

                            {/* Superadmin Direct Edit Role Button */}
                            <button
                              className="admin-btn admin-btn-sm"
                              onClick={() => openRoleEditor(customer)}
                              title="Edit Role & Permissions (Assign Operations Head, Growth, Manager, Employee, etc.)"
                              style={{
                                background: 'linear-gradient(135deg, rgba(216, 154, 30, 0.2) 0%, rgba(216, 154, 30, 0.4) 100%)',
                                borderColor: 'var(--accent-gold)',
                                color: 'var(--accent-gold)',
                              }}
                            >
                              <ShieldCheck size={13} /> Edit Role
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: STORE STAFF & TEAM
          ========================================================================= */}
      {activeTab === 'staff' && (
        <div>
          {/* Staff Filter Toolbar */}
          <div className="admin-toolbar">
            <div className="admin-search" style={{ flex: 1, minWidth: '220px' }}>
              <Search size={16} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Search staff by name, email, phone..."
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Outlet Filter */}
              <select
                value={staffOutletFilter}
                onChange={(e) => setStaffOutletFilter(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-chocolate, #1a0f0c)',
                  color: 'var(--text-warm-white, #f5f0ea)',
                  fontSize: '0.85rem',
                }}
              >
                <option value="all">All Outlets</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.code})
                  </option>
                ))}
              </select>

              {/* Role Filter (Strict 6 Roles) */}
              <select
                value={staffRoleFilter}
                onChange={(e) => setStaffRoleFilter(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-chocolate, #1a0f0c)',
                  color: 'var(--text-warm-white, #f5f0ea)',
                  fontSize: '0.85rem',
                }}
              >
                <option value="all">All Official Roles</option>
                <option value="superadmin">Superadmin</option>
                <option value="operations_head">Operations Head</option>
                <option value="growth">Growth</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>

              {/* Status Filter */}
              <select
                value={staffStatusFilter}
                onChange={(e) => setStaffStatusFilter(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-chocolate, #1a0f0c)',
                  color: 'var(--text-warm-white, #f5f0ea)',
                  fontSize: '0.85rem',
                }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active On Duty</option>
                <option value="inactive">Inactive / Deactivated</option>
              </select>
            </div>
          </div>

          {/* Staff Table */}
          <div className="admin-card">
            {filteredStaff.length === 0 ? (
              <div className="empty-state">
                <Store size={44} />
                <h3>No staff members found in Supabase</h3>
                <p>Click "Assign Role / Add User" above to onboard cafe staff and managers.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Staff Name & Role</th>
                    <th>Outlet Assignment</th>
                    <th>Contact Info</th>
                    <th>PIN & POS Access</th>
                    <th>Compensation</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member) => {
                    const normalized = normalizeRole(member.role);
                    const badgeInfo = roleBadgeColors[normalized] || roleBadgeColors.employee;
                    return (
                      <tr key={member.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary, #f5f0ea)' }}>
                            {member.display_name || member.name}
                          </div>
                          <div style={{ marginTop: '0.2rem' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.15rem 0.55rem',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background: badgeInfo.bg,
                                color: badgeInfo.color,
                                border: `1px solid ${badgeInfo.border}`,
                              }}
                            >
                              {badgeInfo.label}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.88rem' }}>
                            <Store size={13} color="var(--accent-gold)" />
                            {getOutletName(member.outlet_id)}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>{member.email || '-'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{member.phone || ''}</div>
                        </td>
                        <td>
                          {member.pin_code || member.pin ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'rgba(255, 255, 255, 0.08)',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                              }}
                            >
                              <Key size={11} color="var(--accent-gold)" /> PIN: {member.pin_code || member.pin}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No PIN Set</span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f5f0ea' }}>
                            {member.monthly_salary ? `₹${Number(member.monthly_salary).toLocaleString()}/mo` : 'Hourly / Standard'}
                          </div>
                          {member.commission_on_profit && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                background: 'rgba(105, 240, 174, 0.15)',
                                color: '#69f0ae',
                                border: '1px solid rgba(105, 240, 174, 0.3)',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                fontWeight: 700,
                              }}
                            >
                              Profit Share
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleStaffActive(member)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: member.is_active ? '#69f0ae' : '#ff8a80',
                            }}
                          >
                            {member.is_active ? (
                              <>
                                <CheckCircle2 size={15} /> Active
                              </>
                            ) : (
                              <>
                                <XCircle size={15} /> Inactive
                              </>
                            )}
                          </button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                            <button
                              className="admin-btn-outline admin-btn-sm"
                              onClick={() => openRoleEditor(member)}
                              title="Edit Role, Permissions & Outlet"
                            >
                              <Edit2 size={13} /> Edit Role
                            </button>
                            <button
                              className="admin-btn-outline admin-btn-sm text-danger"
                              onClick={() => handleDeleteStaff(member)}
                              title="Remove Staff"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ADMIN PROFILES & ROLES ACCESS
          ========================================================================= */}
      {activeTab === 'admins' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 style={{ margin: 0 }}>Authorized Administrative Leadership</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Users granted backend administrative and operational access to Janu Bhai Coffee.
                </p>
              </div>
              <button
                className="admin-btn admin-btn-sm"
                onClick={() =>
                  openRoleEditor({
                    name: '',
                    email: '',
                    phone: '',
                    role: 'superadmin',
                  })
                }
              >
                <Plus size={14} /> Add / Promote Admin
              </button>
            </div>

            {adminProfiles.length === 0 ? (
              <div className="empty-state">
                <Shield size={44} />
                <h3>No custom admin profiles found</h3>
                <p>System access is governed by primary Super Admin credentials.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Admin Name</th>
                    <th>Email Address</th>
                    <th>Phone / Verification</th>
                    <th>Administrative Role</th>
                    <th>Added On</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminProfiles.map((admin) => (
                    <tr key={admin.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary, #f5f0ea)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Shield size={16} color="var(--accent-gold)" />
                          {admin.name}
                        </div>
                      </td>
                      <td>{admin.email || '-'}</td>
                      <td>{admin.phone || '-'}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.15rem 0.6rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: 'rgba(216, 154, 30, 0.2)',
                            color: '#d89a1e',
                            border: '1px solid rgba(216, 154, 30, 0.4)',
                          }}
                        >
                          {roleBadgeColors[admin.role]?.label || 'Superadmin'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {admin.created_at ? new Date(admin.created_at).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          <button
                            className="admin-btn-outline admin-btn-sm"
                            onClick={() => openRoleEditor(admin)}
                            title="Edit Role & Permissions"
                          >
                            <Edit2 size={13} /> Edit Role
                          </button>
                          <button
                            className="admin-btn-outline admin-btn-sm text-danger"
                            onClick={() => handleDeleteAdminProfile(admin)}
                            title="Revoke Admin Access"
                          >
                            <Trash2 size={13} /> Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Strict 6 Roles & Permissions Matrix Guide */}
          <div className="admin-card">
            <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="var(--accent-gold)" /> System Roles & Access Control Matrix (6 Official Roles)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {/* 1. Superadmin */}
              <div
                style={{
                  background: 'rgba(216, 154, 30, 0.06)',
                  border: '1px solid rgba(216, 154, 30, 0.3)',
                  borderRadius: '10px',
                  padding: '1.2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <span
                    style={{
                      background: 'var(--accent-gold)',
                      color: '#1a0f0c',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    LEVEL 1
                  </span>
                  <h4 style={{ margin: 0, color: 'var(--accent-gold)' }}>Superadmin</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>
                  Full unrestricted governance across all stores, financial PnL, master catalog, user roles & system settings.
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#f5f0ea', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>Global Dashboard & Financial Analytics</li>
                  <li>User Role Editing & Staff Permissions</li>
                  <li>Master Outlets & Central Recipe Specs</li>
                  <li>Store & Cafe Global Configurations</li>
                </ul>
              </div>

              {/* 2. Operations Head */}
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.06)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '10px',
                  padding: '1.2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <span
                    style={{
                      background: '#fbbf24',
                      color: '#1a0f0c',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    LEVEL 2
                  </span>
                  <h4 style={{ margin: 0, color: '#fbbf24' }}>Operations Head</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>
                  Multi-outlet quality control, recipe specs, ingredients & cutlery stock monitoring, photo shortage alerts.
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#f5f0ea', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>14-Area Operations Control Book</li>
                  <li>Daily SOP Audits & Checklists</li>
                  <li>Inter-Store Transfers & Purchase Orders</li>
                  <li>Live CCTV Surveillance Streams</li>
                </ul>
              </div>

              {/* 3. Growth */}
              <div
                style={{
                  background: 'rgba(236, 72, 153, 0.06)',
                  border: '1px solid rgba(236, 72, 153, 0.3)',
                  borderRadius: '10px',
                  padding: '1.2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <span
                    style={{
                      background: '#f472b6',
                      color: '#1a0f0c',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    LEVEL 2
                  </span>
                  <h4 style={{ margin: 0, color: '#f472b6' }}>Growth</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>
                  Marketing campaigns, workshop/event RSVPs, brand partnership pipelines, and customer growth intelligence.
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#f5f0ea', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>Growth Strategic Priorities & Opportunities</li>
                  <li>Events & Workshop RSVP Engine</li>
                  <li>Customer Directory & Segmentation</li>
                  <li>AI Articles & Media Management</li>
                </ul>
              </div>

              {/* 4. Manager */}
              <div
                style={{
                  background: 'rgba(59, 130, 246, 0.06)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '10px',
                  padding: '1.2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <span
                    style={{
                      background: '#60a5fa',
                      color: '#1a0f0c',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    LEVEL 3
                  </span>
                  <h4 style={{ margin: 0, color: '#60a5fa' }}>Manager</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>
                  Single-cafe frontline operations, shift check-ins, cash drawers, and store inventory counts.
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#f5f0ea', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>Manager Observation Feed & Daily Logs</li>
                  <li>Store Live Raw Material Stock</li>
                  <li>Cash Withdrawal & Consumption Registers</li>
                  <li>Store POS & Shift Attendance</li>
                </ul>
              </div>

              {/* 5. Employee */}
              <div
                style={{
                  background: 'rgba(34, 197, 94, 0.06)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '10px',
                  padding: '1.2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <span
                    style={{
                      background: '#4ade80',
                      color: '#1a0f0c',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    LEVEL 4
                  </span>
                  <h4 style={{ margin: 0, color: '#4ade80' }}>Employee</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>
                  Cafe counter, POS register terminal, drink prep, table billing, and kitchen fulfillment.
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#f5f0ea', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>POS Order Processing & Table Bills</li>
                  <li>Kitchen Display Screen (KDS)</li>
                  <li>Shift Clock-in via 4-Digit PIN</li>
                  <li>Store Drink & Pastry Fulfillment</li>
                </ul>
              </div>

              {/* 6. Customer */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '1.2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <span
                    style={{
                      background: '#cbb9a8',
                      color: '#1a0f0c',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    LEVEL 5
                  </span>
                  <h4 style={{ margin: 0, color: '#cbb9a8' }}>Customer</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>
                  Public ecommerce storefront, online orders, cafe QR ordering, event registrations, and reviews.
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#f5f0ea', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>Coffee Beans & Drink Storefront</li>
                  <li>Cart, Checkout & Razorpay Payments</li>
                  <li>Order Tracking & Invoice History</li>
                  <li>Tasting Event & Workshop RSVPs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: USER ACTIVITY & SECURITY AUDIT LOGS
          ========================================================================= */}
      {activeTab === 'audit' && (
        <div>
          <div className="admin-toolbar">
            <div className="admin-search" style={{ flex: 1, minWidth: 240 }}>
              <Search size={16} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Search audit trail by admin email, action, entity..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
              />
            </div>

            <select
              value={auditActionFilter}
              onChange={(e) => setAuditActionFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-chocolate, #1a0f0c)',
                color: '#f5f0ea',
                fontSize: '0.85rem',
              }}
            >
              <option value="all">All Actions</option>
              <option value="update_user_role">Role Changes</option>
              <option value="create">Creations</option>
              <option value="update">Updates</option>
              <option value="delete">Deletions</option>
            </select>
          </div>

          <div className="admin-card">
            {filteredAuditLogs.length === 0 ? (
              <div className="empty-state">
                <Clock size={44} />
                <h3>No audit logs found</h3>
                <p>System activities and user role changes will appear here.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Admin / Operator</th>
                    <th>Action</th>
                    <th>Entity Type</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditLogs.map((log, idx) => (
                    <tr key={log.id || idx}>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {new Date(log.created_at || Date.now()).toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                        {log.admin_email || 'System'}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: 'rgba(216, 154, 30, 0.15)',
                            color: 'var(--accent-gold)',
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{log.entity_type || '-'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: UNIFIED USER ROLE & PERMISSIONS EDITOR (SUPERADMIN)
          ========================================================================= */}
      {showRoleModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1500,
            padding: '1rem',
          }}
          onClick={() => setShowRoleModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              background: 'linear-gradient(180deg, #2a1a17 0%, #1a0f0c 100%)',
              border: '1.5px solid rgba(216, 154, 30, 0.45)',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={22} color="var(--accent-gold)" />
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-gold)' }}>
                  User Role & Access Permissions
                </h2>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveRole} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* User Identity Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    User Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-chocolate, #1a0f0c)',
                      color: '#f5f0ea',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91..."
                    value={roleForm.phone}
                    onChange={(e) => setRoleForm({ ...roleForm, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-chocolate, #1a0f0c)',
                      color: '#f5f0ea',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="user@janubhaicoffee.com"
                  value={roleForm.email}
                  onChange={(e) => setRoleForm({ ...roleForm, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-chocolate, #1a0f0c)',
                    color: '#f5f0ea',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              {/* Strict 6 Role Selector */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(216, 154, 30, 0.3)',
                }}
              >
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '0.45rem' }}>
                  Select Assigned Role & System Access Level *
                </label>
                <select
                  value={roleForm.role}
                  onChange={(e) => setRoleForm({ ...roleForm, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid var(--accent-gold)',
                    background: 'var(--bg-chocolate, #1a0f0c)',
                    color: '#f5f0ea',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                  }}
                >
                  <option value="superadmin">👑 Superadmin (Full Unrestricted HQ Governance)</option>
                  <option value="operations_head">📋 Operations Head (Ops Control Book, Stock, SOPs, Shortage Alerts, CCTV)</option>
                  <option value="growth">🚀 Growth (Marketing, Workshop/Event RSVPs, CRM, Articles & Media)</option>
                  <option value="manager">🏪 Manager (Assigned Cafe Store Desk, Observations, Local Stock & Shifts)</option>
                  <option value="employee">☕ Employee (POS Register Counter, Table Billing, Kitchen Queue, Clock-in)</option>
                  <option value="customer">👤 Customer (Standard Web Storefront & Cafe Account - No Admin Privileges)</option>
                </select>

                <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Assigned role takes effect immediately across web, admin, outlet desk, and POS register.
                </p>
              </div>

              {/* Outlet Assignment (for Staff / Managers / Employees) */}
              {roleForm.role !== 'customer' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      Primary Outlet Branch
                    </label>
                    <select
                      value={roleForm.outlet_id}
                      onChange={(e) => setRoleForm({ ...roleForm, outlet_id: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-chocolate, #1a0f0c)',
                        color: '#f5f0ea',
                        fontSize: '0.9rem',
                      }}
                    >
                      <option value="">All Outlets (HQ Global)</option>
                      {outlets.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name} ({o.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      4-Digit POS PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="1234"
                      value={roleForm.pin}
                      onChange={(e) => setRoleForm({ ...roleForm, pin: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-chocolate, #1a0f0c)',
                        color: '#f5f0ea',
                        fontSize: '0.9rem',
                        fontFamily: 'monospace',
                        letterSpacing: '2px',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Monthly Salary & Profit Share (for Manager, Employee, Operations Head) */}
              {['manager', 'employee', 'operations_head'].includes(roleForm.role) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      Monthly Salary (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="25000"
                      value={roleForm.monthly_salary}
                      onChange={(e) => setRoleForm({ ...roleForm, monthly_salary: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-chocolate, #1a0f0c)',
                        color: '#f5f0ea',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.2rem' }}>
                    <input
                      type="checkbox"
                      id="profit_share_chk"
                      checked={roleForm.commission_on_profit}
                      onChange={(e) => setRoleForm({ ...roleForm, commission_on_profit: e.target.checked })}
                      style={{ width: 18, height: 18, accentColor: 'var(--accent-gold)' }}
                    />
                    <label htmlFor="profit_share_chk" style={{ fontSize: '0.82rem', color: '#f5f0ea', cursor: 'pointer' }}>
                      Enable Profit Share Bonus
                    </label>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" className="admin-btn-outline" onClick={() => setShowRoleModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn"
                  disabled={savingRole}
                  style={{ background: 'linear-gradient(135deg, #d89a1e 0%, #b87333 100%)', color: '#1a0f0c', fontWeight: 800 }}
                >
                  {savingRole ? 'Saving Role & Permissions...' : 'Save Role & Access Permissions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DRAWER: CUSTOMER DETAIL & CRM PROFILE
          ========================================================================= */}
      {selectedCustomerId && selectedCustomerData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 1200,
          }}
          onClick={() => setSelectedCustomerId(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              height: '100%',
              background: 'linear-gradient(180deg, #241410 0%, #150c0a 100%)',
              borderLeft: '1px solid rgba(216, 154, 30, 0.3)',
              padding: '1.75rem',
              overflowY: 'auto',
              boxShadow: '-10px 0 40px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f5f0ea' }}>Customer Intelligence</h2>
              <button
                onClick={() => setSelectedCustomerId(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Profile Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '12px',
                border: '1px solid rgba(245, 240, 234, 0.08)',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d89a1e, #8c5d13)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  fontWeight: 900,
                  color: '#1a0f0c',
                }}
              >
                {(selectedCustomerData.name || '?')[0].toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 2px', fontSize: '1.1rem', color: '#f5f0ea' }}>
                  {selectedCustomerData.name || 'Anonymous User'}
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {selectedCustomerData.email || 'No email registered'} &bull; {selectedCustomerData.phone || 'No phone'}
                </div>
              </div>
            </div>

            {/* Role & System Access Card */}
            <div
              style={{
                background: 'rgba(216, 154, 30, 0.08)',
                border: '1.5px solid rgba(216, 154, 30, 0.35)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  System Role & Access Level
                </span>
                <div style={{ marginTop: '3px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      background: (roleBadgeColors[normalizeRole(selectedCustomerData.computedRole)] || roleBadgeColors.customer).bg,
                      color: (roleBadgeColors[normalizeRole(selectedCustomerData.computedRole)] || roleBadgeColors.customer).color,
                    }}
                  >
                    {(roleBadgeColors[normalizeRole(selectedCustomerData.computedRole)] || roleBadgeColors.customer).label}
                  </span>
                </div>
              </div>

              <button
                className="admin-btn admin-btn-sm"
                onClick={() => {
                  setSelectedCustomerId(null);
                  openRoleEditor(selectedCustomerData);
                }}
                style={{ background: 'linear-gradient(135deg, #d89a1e 0%, #b87333 100%)', color: '#1a0f0c', fontWeight: 800 }}
              >
                <ShieldCheck size={14} /> Change Role / Permissions
              </button>
            </div>

            {/* Order Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Orders</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                  {(selectedCustomerData.orders || []).length}
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Spend (INR)</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#69f0ae' }}>
                  ₹{(selectedCustomerData.orders || []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* CRM Notes & Tags */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={customerTagsInput}
                onChange={(e) => setCustomerTagsInput(e.target.value)}
                placeholder="VIP, Espresso Lover, Gafoor Regular..."
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-chocolate, #1a0f0c)',
                  color: '#f5f0ea',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Customer Service & CRM Notes
              </label>
              <textarea
                rows={3}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Prefers oat milk flat white, visits on Saturday afternoons..."
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-chocolate, #1a0f0c)',
                  color: '#f5f0ea',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <button
              className="admin-btn"
              onClick={handleSaveCustomerNotes}
              disabled={savingCustomer}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {savingCustomer ? 'Saving...' : 'Save CRM Notes & Tags'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Loading User Command Center...</span>
        </div>
      }
    >
      <UsersDashboardContent />
    </Suspense>
  );
}
