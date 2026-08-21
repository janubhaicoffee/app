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
} from 'lucide-react';

const roleBadgeColors = {
  superadmin: { bg: 'rgba(216, 154, 30, 0.2)', color: '#d89a1e', border: 'rgba(216, 154, 30, 0.4)', label: 'Super Admin' },
  owner: { bg: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.4)', label: 'Owner' },
  operations_head: { bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)', label: 'Operations Head' },
  operations: { bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)', label: 'Operations' },
  operation_manager: { bg: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.4)', label: 'Operations Manager' },
  growth: { bg: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', border: 'rgba(236, 72, 153, 0.4)', label: 'Growth Lead' },
  brand_leader: { bg: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', border: 'rgba(236, 72, 153, 0.4)', label: 'Brand Leader' },
  manager: { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.4)', label: 'Store Manager' },
  store_manager: { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.4)', label: 'Store Manager' },
  cashier: { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.4)', label: 'Cashier' },
  barista: { bg: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', border: 'rgba(249, 115, 22, 0.4)', label: 'Barista' },
  kitchen: { bg: 'rgba(234, 179, 8, 0.2)', color: '#facc15', border: 'rgba(234, 179, 8, 0.4)', label: 'Kitchen Crew' },
  staff: { bg: 'rgba(156, 163, 175, 0.2)', color: '#d1d5db', border: 'rgba(156, 163, 175, 0.4)', label: 'General Staff' },
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

  // Staff Filters & Modal
  const [staffSearch, setStaffSearch] = useState('');
  const [staffOutletFilter, setStaffOutletFilter] = useState('all');
  const [staffRoleFilter, setStaffRoleFilter] = useState('all');
  const [staffStatusFilter, setStaffStatusFilter] = useState('all');
  const [showStaffModal, setShowStaffModal] = useState(searchParams.get('action') === 'add-staff');
  const [editStaffMember, setEditStaffMember] = useState(null);
  const [savingStaff, setSavingStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({
    outlet_id: '',
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    pin: '',
    password: '',
    monthly_salary: '',
    commission_on_profit: false,
    aadhaar_number: '',
    pan_number: '',
    notes: '',
  });

  // Admin Profiles Modal
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'superadmin',
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

  // Initial Data Fetching
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

      if (custRes.ok) {
        const json = await custRes.json();
        setCustomers(json.data || []);
      }
      if (ordRes.ok) {
        const json = await ordRes.json();
        setOrders(json.data || []);
      }
      if (staffRes.ok) {
        const json = await staffRes.json();
        setStaff(json.data || []);
      }
      if (outletsRes.ok) {
        const json = await outletsRes.json();
        setOutlets(json.data || []);
      }
      if (profilesRes.ok) {
        const json = await profilesRes.json();
        setAdminProfiles(json.data || []);
      }
      if (auditRes.ok) {
        const json = await auditRes.json();
        setAuditLogs(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load user management data', err);
      showToast('Error loading user data', 'error');
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
      stats[uid].total += o.total_amount || 0;
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
          setCustomerNotes(json.data.notes || '');
          setCustomerTagsInput((json.data.tags || []).join(', '));
        } else {
          showToast('Failed to load customer profile details', 'error');
        }
      } catch (err) {
        showToast('Error loading customer', 'error');
      } finally {
        setCustomerDetailLoading(false);
      }
    };

    fetchCustomerDetail();
  }, [selectedCustomerId]);

  // Save Customer Tags & Notes
  const handleSaveCustomerNotes = async () => {
    if (!selectedCustomerId) return;
    try {
      setSavingCustomer(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const tags = customerTagsInput
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
          id: selectedCustomerId,
          payload: { tags, notes: customerNotes },
        }),
      });

      if (res.ok) {
        showToast('Customer profile updated');
        setSelectedCustomerData((prev) => ({ ...prev, tags, notes: customerNotes }));
        setCustomers((prev) =>
          prev.map((c) => (c.id === selectedCustomerId ? { ...c, tags, notes: customerNotes } : c))
        );
      } else {
        const json = await res.json();
        showToast(json.error || 'Failed to update customer', 'error');
      }
    } catch (err) {
      showToast('Error updating customer', 'error');
    } finally {
      setSavingCustomer(false);
    }
  };

  // Filtered & Sorted Customers
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Search query
    if (customerSearch.trim()) {
      const q = customerSearch.toLowerCase();
      result = result.filter(
        (c) =>
          (c.name || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.phone || '').toLowerCase().includes(q) ||
          (c.current_location || '').toLowerCase().includes(q) ||
          (c.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    // Filter Chips
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    if (customerFilterType === 'spenders') {
      result = result.filter((c) => (orderStats[c.id]?.total || 0) >= 1000);
    } else if (customerFilterType === 'repeat') {
      result = result.filter((c) => (orderStats[c.id]?.count || 0) >= 2);
    } else if (customerFilterType === 'social') {
      result = result.filter((c) => c.auth_provider === 'google' || c.auth_provider === 'facebook');
    } else if (customerFilterType === 'new') {
      result = result.filter((c) => new Date(c.created_at) >= thirtyDaysAgo);
    }

    // Sorting
    result.sort((a, b) => {
      const statsA = orderStats[a.id] || { count: 0, total: 0 };
      const statsB = orderStats[b.id] || { count: 0, total: 0 };

      if (customerSortBy === 'spent_desc') return statsB.total - statsA.total;
      if (customerSortBy === 'orders_desc') return statsB.count - statsA.count;
      if (customerSortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
      // newest
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return result;
  }, [customers, customerSearch, customerFilterType, customerSortBy, orderStats]);

  // Export Customers CSV
  const exportCustomersCSV = () => {
    if (customers.length === 0) return;
    const headers = [
      'Customer ID',
      'Name',
      'Email',
      'Phone',
      'Auth Provider',
      'Location',
      'Total Orders',
      'Total Spent (INR)',
      'Tags',
      'Joined Date',
    ];
    const rows = filteredCustomers.map((c) => {
      const stats = orderStats[c.id] || { count: 0, total: 0 };
      return [
        c.id,
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${(c.phone || '').replace(/"/g, '""')}"`,
        c.auth_provider || 'Email',
        `"${(c.current_location || c.hometown || '').replace(/"/g, '""')}"`,
        stats.count,
        stats.total,
        `"${(c.tags || []).join('; ')}"`,
        new Date(c.created_at).toISOString().split('T')[0],
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customers_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredCustomers.length} customers`);
  };

  // Staff Management Actions
  const openAddStaffModal = () => {
    setEditStaffMember(null);
    setStaffForm({
      outlet_id: outlets[0]?.id || '',
      name: '',
      email: '',
      phone: '',
      role: 'staff',
      pin: '',
      password: '',
      monthly_salary: '',
      commission_on_profit: false,
      aadhaar_number: '',
      pan_number: '',
      notes: '',
    });
    setShowStaffModal(true);
  };

  const openEditStaffModal = (member) => {
    setEditStaffMember(member);
    setStaffForm({
      outlet_id: member.outlet_id || '',
      name: member.display_name || member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      role: member.role || 'staff',
      pin: member.pin_code || member.pin || '',
      password: '',
      monthly_salary: member.monthly_salary !== null ? member.monthly_salary : '',
      commission_on_profit: !!member.commission_on_profit,
      aadhaar_number: member.aadhaar_number || '',
      pan_number: member.pan_number || '',
      notes: member.notes || '',
    });
    setShowStaffModal(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.name.trim()) {
      showToast('Staff name is required', 'error');
      return;
    }
    if (!staffForm.outlet_id && staffForm.role !== 'superadmin' && staffForm.role !== 'operations_head') {
      showToast('Please select an outlet for store staff', 'error');
      return;
    }

    try {
      setSavingStaff(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const body = {
        outlet_id: staffForm.outlet_id || null,
        name: staffForm.name,
        email: staffForm.email || null,
        phone: staffForm.phone || null,
        role: staffForm.role,
        pin: staffForm.pin || null,
        password: staffForm.password || undefined,
        monthly_salary: staffForm.monthly_salary ? parseFloat(staffForm.monthly_salary) : null,
        commission_on_profit: !!staffForm.commission_on_profit,
        aadhaar_number: staffForm.aadhaar_number || null,
        pan_number: staffForm.pan_number || null,
        notes: staffForm.notes || null,
      };

      let res;
      if (editStaffMember) {
        body.id = editStaffMember.id;
        if (!staffForm.pin) delete body.pin;
        res = await fetch('/api/admin/staff', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch('/api/admin/staff', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        showToast(editStaffMember ? 'Staff updated successfully' : 'Staff member added');
        setShowStaffModal(false);
        fetchAllData();
      } else {
        const json = await res.json();
        showToast(json.error || 'Failed to save staff member', 'error');
      }
    } catch (err) {
      showToast('Error saving staff', 'error');
    } finally {
      setSavingStaff(false);
    }
  };

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
      } else {
        showToast('Failed to delete staff member', 'error');
      }
    } catch (err) {
      showToast('Error deleting staff', 'error');
    }
  };

  // Filtered Staff
  const filteredStaff = useMemo(() => {
    return staff.filter((m) => {
      const matchesSearch =
        !staffSearch ||
        (m.name || m.display_name || '').toLowerCase().includes(staffSearch.toLowerCase()) ||
        (m.email || '').toLowerCase().includes(staffSearch.toLowerCase()) ||
        (m.phone || '').includes(staffSearch);

      const matchesOutlet = staffOutletFilter === 'all' || m.outlet_id === staffOutletFilter;
      const matchesRole = staffRoleFilter === 'all' || m.role === staffRoleFilter;
      const matchesStatus =
        staffStatusFilter === 'all' ||
        (staffStatusFilter === 'active' && m.is_active) ||
        (staffStatusFilter === 'inactive' && !m.is_active);

      return matchesSearch && matchesOutlet && matchesRole && matchesStatus;
    });
  }, [staff, staffSearch, staffOutletFilter, staffRoleFilter, staffStatusFilter]);

  // Admin Profiles Actions
  const handleSaveAdminProfile = async (e) => {
    e.preventDefault();
    if (!adminForm.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    if (!adminForm.email && !adminForm.phone) {
      showToast('Either email or phone is required for admin authorization', 'error');
      return;
    }

    try {
      setSavingAdmin(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/admin/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(adminForm),
      });

      if (res.ok) {
        showToast('Admin privilege granted');
        setShowAdminModal(false);
        setAdminForm({ name: '', email: '', phone: '', role: 'superadmin' });
        fetchAllData();
      } else {
        const json = await res.json();
        showToast(json.error || 'Failed to grant admin access', 'error');
      }
    } catch (err) {
      showToast('Error granting admin access', 'error');
    } finally {
      setSavingAdmin(false);
    }
  };

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
      } else {
        showToast('Failed to revoke access', 'error');
      }
    } catch (err) {
      showToast('Error revoking admin access', 'error');
    }
  };

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const isUserRelated =
        ['customer', 'staff', 'admin_profiles', 'profile', 'user'].includes(
          (log.entity_type || log.entity || '').toLowerCase()
        ) ||
        ['create', 'update', 'delete'].includes(log.action);

      const matchesSearch =
        !auditSearch ||
        (log.admin_email || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
        (log.action || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
        (log.entity_type || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
        JSON.stringify(log.details || '').toLowerCase().includes(auditSearch.toLowerCase());

      const matchesAction = auditActionFilter === 'all' || log.action === auditActionFilter;

      return isUserRelated && matchesSearch && matchesAction;
    });
  }, [auditLogs, auditSearch, auditActionFilter]);

  const getOutletName = (id) => {
    const outlet = outlets.find((o) => o.id === id);
    return outlet ? outlet.name : 'All Outlets (HQ)';
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
          {activeTab === 'staff' && (
            <button className="admin-btn admin-btn-sm" onClick={openAddStaffModal}>
              <Plus size={15} /> Add Staff Member
            </button>
          )}
          {activeTab === 'admins' && (
            <button className="admin-btn admin-btn-sm" onClick={() => setShowAdminModal(true)}>
              <Plus size={15} /> Grant Admin Access
            </button>
          )}
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
                    <th>Location</th>
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
                    return (
                      <tr key={customer.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedCustomerId(customer.id)}>
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
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {customer.current_location || customer.hometown || '-'}
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
                              {customer.tags.length > 2 && (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                  +{customer.tags.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>-</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {new Date(customer.created_at).toLocaleDateString('en-IN')}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="admin-btn-outline admin-btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCustomerId(customer.id);
                            }}
                          >
                            <Eye size={13} /> View
                          </button>
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

              {/* Role Filter */}
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
                <option value="all">All Roles</option>
                <option value="superadmin">Super Admin</option>
                <option value="operations_head">Operations Head</option>
                <option value="growth">Growth Lead</option>
                <option value="manager">Store Manager</option>
                <option value="cashier">Cashier</option>
                <option value="barista">Barista</option>
                <option value="kitchen">Kitchen Crew</option>
                <option value="staff">General Staff</option>
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
                <h3>No staff members found</h3>
                <p>Click "Add Staff Member" above to onboard your cafe crew and managers.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Staff Name & Role</th>
                    <th>Outlet Assignment</th>
                    <th>Contact Info</th>
                    <th>PIN & Access</th>
                    <th>Compensation</th>
                    <th>Identity Verif.</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member) => {
                    const badgeInfo = roleBadgeColors[member.role] || roleBadgeColors.staff;
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
                              <Key size={11} color="var(--accent-gold)" /> PIN Set
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No PIN</span>
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
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 5px',
                                borderRadius: '3px',
                                background: member.aadhaar_number ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                color: member.aadhaar_number ? '#81c784' : '#888',
                              }}
                            >
                              Aadhaar: {member.aadhaar_number ? '✓' : '✗'}
                            </span>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 5px',
                                borderRadius: '3px',
                                background: member.pan_number ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                color: member.pan_number ? '#81c784' : '#888',
                              }}
                            >
                              PAN: {member.pan_number ? '✓' : '✗'}
                            </span>
                          </div>
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
                              onClick={() => openEditStaffModal(member)}
                              title="Edit Staff Member"
                            >
                              <Edit2 size={13} />
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
          {/* Admin Profiles Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 style={{ margin: 0 }}>Authorized Administrative Users</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Users granted backend administrative access to Janu Bhai Coffee command suites.
                </p>
              </div>
              <button className="admin-btn admin-btn-sm" onClick={() => setShowAdminModal(true)}>
                <Plus size={14} /> Add Admin User
              </button>
            </div>

            {adminProfiles.length === 0 ? (
              <div className="empty-state">
                <Shield size={44} />
                <h3>No custom admin profiles configured</h3>
                <p>System access is currently governed by primary Super Admin credentials.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Admin Name</th>
                    <th>Email Address</th>
                    <th>Phone / Verification</th>
                    <th>Role & Scope</th>
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
                          {admin.role || 'Super Admin'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {admin.created_at ? new Date(admin.created_at).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="admin-btn-outline admin-btn-sm text-danger"
                          onClick={() => handleDeleteAdminProfile(admin)}
                          title="Revoke Admin Access"
                        >
                          <Trash2 size={13} /> Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Role Privileges & Capabilities Guide */}
          <div className="admin-card">
            <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="var(--accent-gold)" /> Role Permissions & Access Control Matrix
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {/* Super Admin */}
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
                  <h4 style={{ margin: 0, color: 'var(--accent-gold)' }}>Super Admin / Owner</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>
                  Full unrestricted governance over all stores, financial revenue, catalogs, user access, and system configurations.
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#f5f0ea', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>Global Dashboard & Financial Analytics</li>
                  <li>Product Catalog, Inventory & Pricing</li>
                  <li>Customer CRM, Staff Onboarding & Admin Whitelisting</li>
                  <li>Store & Cafe Global Configurations</li>
                </ul>
              </div>

              {/* Operations Head */}
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
                  Multi-outlet quality control, SOP enforcement, surveillance, stock movements, and store crew management.
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#f5f0ea', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>14-Area Operations Control Book</li>
                  <li>Daily SOP Checklists & Audits</li>
                  <li>Inter-Store Stock Transfers & POs</li>
                  <li>Live CCTV Surveillance Streams</li>
                </ul>
              </div>

              {/* Brand & Growth */}
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
                  <h4 style={{ margin: 0, color: '#f472b6' }}>Brand & Growth Lead</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>
                  Marketing activations, workshop/event RSVPs, brand partnership pipelines, and customer growth intelligence.
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#f5f0ea', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>Growth Strategic Priorities & Opportunities</li>
                  <li>Events & Workshop RSVP Engine</li>
                  <li>Customer Directory & Audience Segmentation</li>
                  <li>AI Articles & Media Management</li>
                </ul>
              </div>

              {/* Store Manager */}
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
                  <h4 style={{ margin: 0, color: '#60a5fa' }}>Store Manager & Baristas</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>
                  Single-cafe frontline operations, shift check-ins, cash drawers, and store inventory counts.
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#f5f0ea', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>Manager Observation Feed & Daily Logs</li>
                  <li>Store Live Raw Material Inventory</li>
                  <li>Cash Withdrawal & Consumption Registers</li>
                  <li>Store POS & Shift Attendance</li>
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
                placeholder="Search audit trail by admin, action, or user ID..."
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
                color: 'var(--text-warm-white, #f5f0ea)',
                fontSize: '0.85rem',
              }}
            >
              <option value="all">All Actions</option>
              <option value="create">Created</option>
              <option value="update">Updated</option>
              <option value="delete">Deleted / Revoked</option>
            </select>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <h3 style={{ margin: 0 }}>User & Personnel Audit Log Entries</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {filteredAuditLogs.length} events recorded
              </span>
            </div>

            {filteredAuditLogs.length === 0 ? (
              <div className="empty-state">
                <Clock size={44} />
                <h3>No recent user audit logs</h3>
                <p>System modifications to customers, staff, or roles will be logged here automatically.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Admin User</th>
                    <th>Action</th>
                    <th>Entity Type</th>
                    <th>Entity Reference</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditLogs.slice(0, 50).map((log, idx) => (
                    <tr key={log.id || idx}>
                      <td style={{ fontSize: '0.8rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{log.admin_email || 'System'}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            background:
                              log.action === 'create'
                                ? 'rgba(76, 175, 80, 0.2)'
                                : log.action === 'delete'
                                ? 'rgba(239, 68, 68, 0.2)'
                                : 'rgba(59, 130, 246, 0.2)',
                            color:
                              log.action === 'create'
                                ? '#81c784'
                                : log.action === 'delete'
                                ? '#f87171'
                                : '#60a5fa',
                            textTransform: 'capitalize',
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>
                        {log.entity_type || log.entity || '-'}
                      </td>
                      <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{log.entity_id || '-'}</td>
                      <td style={{ fontSize: '0.82rem', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
          MODAL: CUSTOMER PROFILE & ORDER HISTORY DRAWER
          ========================================================================= */}
      {selectedCustomerId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 1000,
          }}
          onClick={() => setSelectedCustomerId(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '620px',
              height: '100%',
              background: 'linear-gradient(180deg, #241410 0%, #1a0f0c 100%)',
              borderLeft: '1px solid rgba(216, 154, 30, 0.3)',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.6)',
              overflowY: 'auto',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={22} color="var(--accent-gold)" />
                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Customer Profile</h2>
              </div>
              <button
                onClick={() => setSelectedCustomerId(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {customerDetailLoading ? (
              <div className="admin-loading" style={{ margin: 'auto' }}>
                <div className="admin-spinner" /> Loading customer history...
              </div>
            ) : selectedCustomerData ? (
              <>
                {/* Identity Card */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(216, 154, 30, 0.2)',
                  }}
                >
                  {selectedCustomerData.profile_picture_url ? (
                    <img
                      src={selectedCustomerData.profile_picture_url}
                      alt=""
                      style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-gold)' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #d89a1e, #8c5d13)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.6rem',
                        fontWeight: 800,
                        color: '#1a0f0c',
                      }}
                    >
                      {(selectedCustomerData.name || '?')[0].toUpperCase()}
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f5f0ea' }}>
                        {selectedCustomerData.name || 'Anonymous User'}
                      </h3>
                      {selectedCustomerData.auth_provider && (
                        <span
                          style={{
                            padding: '0.15rem 0.45rem',
                            borderRadius: 4,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            background:
                              selectedCustomerData.auth_provider === 'facebook'
                                ? '#1877F2'
                                : selectedCustomerData.auth_provider === 'google'
                                ? '#DB4437'
                                : '#555',
                            color: '#fff',
                            textTransform: 'uppercase',
                          }}
                        >
                          {selectedCustomerData.auth_provider}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {selectedCustomerData.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Mail size={12} color="var(--accent-gold)" /> {selectedCustomerData.email}
                        </div>
                      )}
                      {selectedCustomerData.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Phone size={12} color="var(--accent-gold)" /> {selectedCustomerData.phone}
                        </div>
                      )}
                      {(selectedCustomerData.current_location || selectedCustomerData.hometown) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <MapPin size={12} color="var(--accent-gold)" /> {selectedCustomerData.current_location || selectedCustomerData.hometown}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lifetime Spending & Orders Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'rgba(216, 154, 30, 0.08)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(216, 154, 30, 0.25)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Total Orders Placed</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '0.2rem' }}>
                      {selectedCustomerData.orders?.length || 0}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(105, 240, 174, 0.08)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(105, 240, 174, 0.25)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Total Lifetime Spend</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#69f0ae', marginTop: '0.2rem' }}>
                      ₹{((selectedCustomerData.orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0)).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Tags & Internal Staff Notes */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(245, 240, 234, 0.1)' }}>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.92rem', color: 'var(--accent-gold)' }}>
                    Customer Tags & VIP Notes
                  </h4>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      Tags (Comma separated, e.g. VIP, Whole Bean, Light Roast)
                    </label>
                    <input
                      type="text"
                      value={customerTagsInput}
                      onChange={(e) => setCustomerTagsInput(e.target.value)}
                      placeholder="e.g. VIP, Roastery Regular, Chemex Fan"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-chocolate, #1a0f0c)',
                        color: 'var(--text-warm-white, #f5f0ea)',
                        fontSize: '0.88rem',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      Private Admin / Staff Notes
                    </label>
                    <textarea
                      rows={3}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="Notes about customer preferences, coffee taste, allergies, or special instructions..."
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-chocolate, #1a0f0c)',
                        color: 'var(--text-warm-white, #f5f0ea)',
                        fontSize: '0.88rem',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <button
                    className="admin-btn admin-btn-sm"
                    disabled={savingCustomer}
                    onClick={handleSaveCustomerNotes}
                    style={{ width: '100%' }}
                  >
                    {savingCustomer ? 'Saving Changes...' : 'Save Profile Notes & Tags'}
                  </button>
                </div>

                {/* Recent Orders List */}
                <div>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#f5f0ea' }}>
                    Order History ({selectedCustomerData.orders?.length || 0})
                  </h4>

                  {(!selectedCustomerData.orders || selectedCustomerData.orders.length === 0) ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No orders placed yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {selectedCustomerData.orders.map((order) => (
                        <div
                          key={order.id}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(245, 240, 234, 0.08)',
                            borderRadius: '8px',
                            padding: '0.85rem 1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-gold)', fontSize: '0.85rem' }}>
                              #{order.id?.toString().slice(-6).toUpperCase()}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              {new Date(order.created_at).toLocaleDateString('en-IN')} &bull; {order.order_items?.length || 0} item(s)
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, color: '#f5f0ea', fontSize: '0.92rem' }}>
                              ₹{Number(order.total_amount || 0).toLocaleString()}
                            </div>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: order.status === 'delivered' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                color: order.status === 'delivered' ? '#81c784' : '#fbbf24',
                              }}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT STAFF MEMBER
          ========================================================================= */}
      {showStaffModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setShowStaffModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              background: 'linear-gradient(180deg, #2a1a17 0%, #1a0f0c 100%)',
              border: '1px solid rgba(216, 154, 30, 0.35)',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Store size={20} color="var(--accent-gold)" />
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>
                  {editStaffMember ? 'Edit Staff Member' : 'Onboard New Staff Member'}
                </h2>
              </div>
              <button
                onClick={() => setShowStaffModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Outlet Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Assigned Cafe / Outlet *
                </label>
                <select
                  value={staffForm.outlet_id}
                  onChange={(e) => setStaffForm({ ...staffForm, outlet_id: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-chocolate, #1a0f0c)',
                    color: 'var(--text-warm-white, #f5f0ea)',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">Select an outlet...</option>
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Name & Role */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-chocolate, #1a0f0c)',
                      color: 'var(--text-warm-white, #f5f0ea)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Role & Position *
                  </label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-chocolate, #1a0f0c)',
                      color: 'var(--text-warm-white, #f5f0ea)',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="superadmin">Super Admin</option>
                    <option value="operations_head">Operations Head</option>
                    <option value="growth">Growth Lead</option>
                    <option value="manager">Store Manager</option>
                    <option value="cashier">Cashier</option>
                    <option value="barista">Barista</option>
                    <option value="kitchen">Kitchen Crew</option>
                    <option value="staff">General Staff</option>
                  </select>
                </div>
              </div>

              {/* Email & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="rahul@janubhaicoffee.com"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-chocolate, #1a0f0c)',
                      color: 'var(--text-warm-white, #f5f0ea)',
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
                    placeholder="+91 9876543210"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-chocolate, #1a0f0c)',
                      color: 'var(--text-warm-white, #f5f0ea)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              {/* PIN Code & Monthly Salary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    POS Terminal 4-Digit PIN
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 1234"
                    value={staffForm.pin}
                    onChange={(e) => setStaffForm({ ...staffForm, pin: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-chocolate, #1a0f0c)',
                      color: 'var(--text-warm-white, #f5f0ea)',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Monthly Salary (₹ INR)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 25000"
                    value={staffForm.monthly_salary}
                    onChange={(e) => setStaffForm({ ...staffForm, monthly_salary: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-chocolate, #1a0f0c)',
                      color: 'var(--text-warm-white, #f5f0ea)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              {/* Commission on Profit Toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                <input
                  type="checkbox"
                  checked={staffForm.commission_on_profit}
                  onChange={(e) => setStaffForm({ ...staffForm, commission_on_profit: e.target.checked })}
                  style={{ accentColor: 'var(--accent-gold)' }}
                />
                <span>Eligible for Store Profit Sharing / Commission</span>
              </label>

              {/* Aadhaar & PAN */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    placeholder="XXXX XXXX XXXX"
                    value={staffForm.aadhaar_number}
                    onChange={(e) => setStaffForm({ ...staffForm, aadhaar_number: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-chocolate, #1a0f0c)',
                      color: 'var(--text-warm-white, #f5f0ea)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    PAN Number
                  </label>
                  <input
                    type="text"
                    placeholder="ABCDE1234F"
                    value={staffForm.pan_number}
                    onChange={(e) => setStaffForm({ ...staffForm, pan_number: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-chocolate, #1a0f0c)',
                      color: 'var(--text-warm-white, #f5f0ea)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => setShowStaffModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn"
                  disabled={savingStaff}
                >
                  {savingStaff ? 'Saving...' : editStaffMember ? 'Update Staff Member' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: GRANT ADMIN PRIVILEGE
          ========================================================================= */}
      {showAdminModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setShowAdminModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              background: 'linear-gradient(180deg, #2a1a17 0%, #1a0f0c 100%)',
              border: '1px solid rgba(216, 154, 30, 0.35)',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={20} color="var(--accent-gold)" />
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Grant Administrative Access</h2>
              </div>
              <button
                onClick={() => setShowAdminModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAdminProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Admin Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arsalan / Bilal"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-chocolate, #1a0f0c)',
                    color: 'var(--text-warm-white, #f5f0ea)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Admin Email
                </label>
                <input
                  type="email"
                  placeholder="admin@janubhaicoffee.com"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-chocolate, #1a0f0c)',
                    color: 'var(--text-warm-white, #f5f0ea)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Admin Phone Number (for OTP Login)
                </label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-chocolate, #1a0f0c)',
                    color: 'var(--text-warm-white, #f5f0ea)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Assigned Administrative Role
                </label>
                <select
                  value={adminForm.role}
                  onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-chocolate, #1a0f0c)',
                    color: 'var(--text-warm-white, #f5f0ea)',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="superadmin">Super Admin / Owner (Full Access)</option>
                  <option value="operations_head">Operations Head (Ops Book, Checklists, Streams)</option>
                  <option value="growth">Growth & Brand Lead (BD Hub, RSVPs, Audience)</option>
                  <option value="manager">Store Manager (Outlet Frontline & Inventory)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => setShowAdminModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn"
                  disabled={savingAdmin}
                >
                  {savingAdmin ? 'Granting...' : 'Grant Admin Privileges'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersMasterPage() {
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
