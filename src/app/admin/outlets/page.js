'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  Store,
  Plus,
  Search,
  Filter,
  Edit3,
  Power,
  PowerOff,
  MapPin,
  Users,
  DollarSign,
  X,
  Building2,
  ClipboardCheck,
  Camera,
  ArrowLeftRight,
  ShoppingBag,
  Settings,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  AlertTriangle,
  FileText,
  Save,
  Mail,
  Phone,
  Shield,
  Video,
  Key,
  Layers,
  ChevronDown,
  Trash2,
  Calendar,
  Sparkles,
  Check,
  UtensilsCrossed,
  Coffee,
  Package,
  AlertCircle,
  UploadCloud,
  ImageIcon,
  ChefHat,
  Box,
  Flame,
  CheckCircle,
} from 'lucide-react';

const statusBadges = {
  open: { bg: 'rgba(46, 125, 50, 0.2)', color: '#69f0ae', border: 'rgba(76, 175, 80, 0.4)', label: 'Open' },
  busy: { bg: 'rgba(216, 154, 30, 0.2)', color: '#d89a1e', border: 'rgba(216, 154, 30, 0.4)', label: 'Busy' },
  paused: { bg: 'rgba(239, 68, 68, 0.2)', color: '#ff8a80', border: 'rgba(239, 68, 68, 0.4)', label: 'Paused' },
  closed: { bg: 'rgba(255, 255, 255, 0.08)', color: '#cbb9a8', border: 'rgba(245, 240, 234, 0.12)', label: 'Closed' },
  active: { bg: 'rgba(46, 125, 50, 0.2)', color: '#69f0ae', border: 'rgba(76, 175, 80, 0.4)', label: 'Active' },
  inactive: { bg: 'rgba(255, 255, 255, 0.08)', color: '#cbb9a8', border: 'rgba(245, 240, 234, 0.12)', label: 'Inactive' },
};

const transferStatusConfig = {
  pending: { bg: 'rgba(216, 154, 30, 0.2)', color: '#d89a1e', label: 'Pending Approval' },
  in_transit: { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', label: 'In-Transit' },
  completed: { bg: 'rgba(76, 175, 80, 0.2)', color: '#69f0ae', label: 'Completed' },
  cancelled: { bg: 'rgba(239, 68, 68, 0.2)', color: '#ff8a80', label: 'Cancelled' },
};

const poStatusBadges = {
  draft: { bg: 'rgba(255, 255, 255, 0.08)', color: '#cbb9a8', label: 'Draft' },
  ordered: { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', label: 'Ordered / Dispatched' },
  received: { bg: 'rgba(76, 175, 80, 0.2)', color: '#69f0ae', label: 'Received & Stocked' },
  cancelled: { bg: 'rgba(239, 68, 68, 0.2)', color: '#ff8a80', label: 'Cancelled' },
};

function OutletsMasterDashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Active Tab: 'all' | 'menu' | 'stock' | 'checklists' | 'surveillance' | 'transfers' | 'purchase-orders' | 'settings'
  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab === 'commissions' ? 'menu' : initialTab);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // 1. All Outlets State (Live Supabase)
  const [outlets, setOutlets] = useState([]);
  const [outletSearch, setOutletSearch] = useState('');
  const [showOutletModal, setShowOutletModal] = useState(false);
  const [editOutlet, setEditOutlet] = useState(null);
  const [savingOutlet, setSavingOutlet] = useState(false);
  const [outletForm, setOutletForm] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    tax_rate: 5,
    operational_status: 'open',
    accepting_orders: true,
    dine_in_active: true,
    takeaway_active: true,
    delivery_active: true,
    delivery_radius_km: 5,
    opening_time: '08:00',
    closing_time: '22:00',
    fssai_number: '',
    manager_name: '',
    manager_phone: '',
    manager_email: '',
    rent: '',
    electricity: '',
    water: '',
    internet: '',
    cogs: '',
  });

  // 2. Central Menu State (Live Supabase: pos_products & pos_categories)
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedMenuCategory, setSelectedMenuCategory] = useState('all');
  const [inspectingRecipeItem, setInspectingRecipeItem] = useState(null);
  const [showMenuItemModal, setShowMenuItemModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [savingMenuItem, setSavingMenuItem] = useState(false);
  const [menuItemForm, setMenuItemForm] = useState({
    name: '',
    category_id: '',
    price: '',
    description: '',
    is_veg: true,
    is_available: true,
    prep_time_minutes: 5,
    image_url: '',
    ingredients: [],
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

  // 3. Ingredients & Cutlery Stock Tracker State (Live Supabase: outlet_inventory)
  const [inventoryItems, setInventoryItems] = useState([]);
  const [stockOutletFilter, setStockOutletFilter] = useState('all');
  const [stockCategoryFilter, setStockCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [stockSearch, setStockSearch] = useState('');
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [savingInventory, setSavingInventory] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({
    outlet_id: '',
    name: '',
    category: 'ingredient',
    stock: '',
    threshold: '10',
    unit: 'kg',
    unit_cost: '0',
  });

  // 4. Photo-Based Shortage & Low-Stock Alerts State (Live Supabase: outlet_alerts)
  const [shortageAlerts, setShortageAlerts] = useState([]);
  const [showReportShortageModal, setShowReportShortageModal] = useState(false);
  const [submittingShortage, setSubmittingShortage] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [viewingPhotoModal, setViewingPhotoModal] = useState(null);
  const [shortageForm, setShortageForm] = useState({
    outlet_id: '',
    category: 'ingredient',
    item_name: '',
    estimated_stock: 'Critically Low / Depleted (0%)',
    urgency: 'critical',
    notes: '',
    photo_base64: null,
  });

  // 5. Checklists State (Live Supabase: outlet_checklists)
  const [checklists, setChecklists] = useState([]);
  const [checklistTemplates, setChecklistTemplates] = useState({});
  const [selectedChecklistOutlet, setSelectedChecklistOutlet] = useState('');
  const [selectedChecklistDate, setSelectedChecklistDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedChecklistType, setSelectedChecklistType] = useState('opening');
  const [activeChecklistItems, setActiveChecklistItems] = useState([]);
  const [checklistCompletedBy, setChecklistCompletedBy] = useState('Shift Supervisor');
  const [checklistVerifiedBy, setChecklistVerifiedBy] = useState('Operations Head');
  const [checklistNotes, setChecklistNotes] = useState('');
  const [submittingChecklist, setSubmittingChecklist] = useState(false);

  // 6. Surveillance & Cameras State (Live Supabase: outlet_cameras)
  const [cameras, setCameras] = useState([]);
  const [surveillanceOutletFilter, setSurveillanceOutletFilter] = useState('all');
  const [showAddCameraModal, setShowAddCameraModal] = useState(false);
  const [cameraForm, setCameraForm] = useState({ name: '', url: '', outlet_id: '' });
  const [submittingCamera, setSubmittingCamera] = useState(false);

  // 7. Stock Transfers State (Live Supabase: stock_transfers)
  const [transfers, setTransfers] = useState([]);
  const [transferSearch, setTransferSearch] = useState('');
  const [transferStatusFilter, setTransferStatusFilter] = useState('all');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [submittingTransfer, setSubmittingTransfer] = useState(false);
  const [transferForm, setTransferForm] = useState({
    source_outlet_id: '',
    destination_outlet_id: '',
    item_name: '',
    quantity: '',
    unit: 'kg',
    requested_by: 'Store Manager',
    notes: '',
  });

  // 8. Purchase Orders State (Live Supabase: outlet_purchase_orders)
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [poSearch, setPoSearch] = useState('');
  const [poStatusFilter, setPoStatusFilter] = useState('all');
  const [showPoModal, setShowPoModal] = useState(false);
  const [submittingPo, setSubmittingPo] = useState(false);
  const [poForm, setPoForm] = useState({
    outlet_id: '',
    vendor_name: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_date: '',
    notes: '',
    items: [{ item_name: '', quantity: 1, unit_price: 0 }],
  });

  // 9. Global Cafe Settings State
  const [cafeSettings, setCafeSettings] = useState({
    cafe_name: '',
    global_gstin: '',
    central_fssai: '',
    support_email: '',
    support_phone: '',
    hq_address: '',
  });
  const [savingCafeSettings, setSavingCafeSettings] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Pure Live Fetch directly from Supabase via API endpoints
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers = session ? { Authorization: `Bearer ${session.access_token}` } : {};

      const [
        outletsRes,
        menuRes,
        chkRes,
        camsRes,
        transfersRes,
        posRes,
        settingsRes,
      ] = await Promise.all([
        fetch('/api/admin/outlets', { headers }),
        fetch('/api/admin/outlets/menu', { headers }),
        fetch('/api/outlet/checklists', { headers }),
        fetch('/api/outlet/cameras', { headers }),
        fetch('/api/outlet/transfers', { headers }),
        fetch('/api/outlet/purchase-orders', { headers }),
        fetch('/api/admin/data?type=cafe_settings', { headers }),
      ]);

      if (outletsRes.ok) {
        const j = await outletsRes.json();
        const list = j.data || [];
        setOutlets(list);
        if (list.length > 0) {
          if (!selectedChecklistOutlet) setSelectedChecklistOutlet(list[0].id);
          if (!shortageForm.outlet_id) setShortageForm((prev) => ({ ...prev, outlet_id: list[0].id }));
          if (!inventoryForm.outlet_id) setInventoryForm((prev) => ({ ...prev, outlet_id: list[0].id }));
        }
      }

      if (menuRes.ok) {
        const j = await menuRes.json();
        setCategories(j.categories || []);
        setMenuItems(j.menu || []);
        setInventoryItems(j.inventory || []);
        setShortageAlerts(j.alerts || []);
      }

      if (chkRes.ok) {
        const j = await chkRes.json();
        setChecklists(j.data || []);
        setChecklistTemplates(j.templates || {});
      }

      if (camsRes.ok) {
        const j = await camsRes.json();
        setCameras(j.data || []);
      }

      if (transfersRes.ok) {
        const j = await transfersRes.json();
        setTransfers(j.data || []);
      }

      if (posRes.ok) {
        const j = await posRes.json();
        setPurchaseOrders(j.data || []);
      }

      if (settingsRes.ok) {
        const j = await settingsRes.json();
        if (j.data) setCafeSettings(j.data);
      }
    } catch (err) {
      console.error('Failed to load live outlet data from Supabase:', err);
      showToast('Error loading live data from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Update Checklist active items on selector change
  useEffect(() => {
    if (checklistTemplates[selectedChecklistType]) {
      const existing = checklists.find(
        (c) =>
          c.outlet_id === selectedChecklistOutlet &&
          c.date === selectedChecklistDate &&
          c.checklist_type === selectedChecklistType
      );
      if (existing && Array.isArray(existing.items)) {
        setActiveChecklistItems(existing.items);
        setChecklistCompletedBy(existing.completed_by || 'Staff');
        setChecklistVerifiedBy(existing.verified_by || 'Operations Head');
        setChecklistNotes(existing.notes || '');
      } else {
        setActiveChecklistItems((checklistTemplates[selectedChecklistType] || []).map((item) => ({ ...item, checked: false })));
        setChecklistNotes('');
      }
    }
  }, [selectedChecklistOutlet, selectedChecklistDate, selectedChecklistType, checklistTemplates, checklists]);

  // Executive KPI Summary computed directly from live state
  const executiveMetrics = useMemo(() => {
    const totalOutlets = outlets.length;
    const activeOutlets = outlets.filter((o) => o.is_active !== false).length;
    const openOutlets = outlets.filter((o) => o.operational_status === 'open').length;

    const lowStockCount = inventoryItems.filter(
      (it) => (Number(it.stock) || 0) <= (Number(it.threshold) || 10)
    ).length;

    const criticalShortagesCount = shortageAlerts.filter((a) => !a.resolved).length;
    const totalTransfers = transfers.filter((t) => t.status === 'in_transit' || t.status === 'pending').length;
    const onlineCameras = cameras.filter((c) => c.active !== false).length;

    return {
      totalOutlets,
      activeOutlets,
      openOutlets,
      lowStockCount,
      criticalShortagesCount,
      totalTransfers,
      onlineCameras,
      menuItemsCount: menuItems.length,
    };
  }, [outlets, inventoryItems, shortageAlerts, transfers, cameras, menuItems]);

  const getOutletName = (id) => {
    const o = outlets.find((x) => x.id === id);
    return o ? o.name : id || 'All Outlets';
  };

  // --- CRUD HANDLERS (Direct Supabase API Calls) ---

  // 1. Operational Status Live Toggle
  const handleToggleOperationalStatus = async (outletId, status) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin/outlets?id=${outletId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ operational_status: status }),
      });

      if (res.ok) {
        showToast(`Outlet status changed to ${status}`);
        setOutlets((prev) => prev.map((o) => (o.id === outletId ? { ...o, operational_status: status } : o)));
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  };

  // 2. Channel Toggle
  const handleToggleChannel = async (outletId, field, currentValue) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin/outlets?id=${outletId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ [field]: !currentValue }),
      });

      if (res.ok) {
        showToast('Channel settings updated');
        setOutlets((prev) => prev.map((o) => (o.id === outletId ? { ...o, [field]: !currentValue } : o)));
      }
    } catch (err) {
      showToast('Error updating channel', 'error');
    }
  };

  // 3. Save Outlet (Insert / Update)
  const handleSaveOutlet = async (e) => {
    e.preventDefault();
    if (!outletForm.name.trim()) {
      showToast('Outlet name is required', 'error');
      return;
    }
    try {
      setSavingOutlet(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const payload = {
        ...outletForm,
        settings: {
          rent: outletForm.rent ? parseFloat(outletForm.rent) : 0,
          electricity: outletForm.electricity ? parseFloat(outletForm.electricity) : 0,
          water: outletForm.water ? parseFloat(outletForm.water) : 0,
          internet: outletForm.internet ? parseFloat(outletForm.internet) : 0,
          cogs: outletForm.cogs ? parseFloat(outletForm.cogs) : 0,
        },
      };

      let res;
      if (editOutlet) {
        res = await fetch(`/api/admin/outlets?id=${editOutlet.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/outlets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        showToast(editOutlet ? 'Outlet updated in database' : 'New outlet created');
        setShowOutletModal(false);
        fetchAllData();
      } else {
        const j = await res.json();
        showToast(j.error || 'Failed to save outlet', 'error');
      }
    } catch (err) {
      showToast('Error saving outlet', 'error');
    } finally {
      setSavingOutlet(false);
    }
  };

  // 4. Create / Edit Menu Item (pos_products)
  const handleSaveMenuItem = async (e) => {
    e.preventDefault();
    if (!menuItemForm.name.trim() || menuItemForm.price === '') {
      showToast('Item name and price are required', 'error');
      return;
    }
    try {
      setSavingMenuItem(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      let res;
      if (editingMenuItem) {
        res = await fetch('/api/admin/outlets/menu', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            action: 'update_menu_item',
            payload: { id: editingMenuItem.id, ...menuItemForm },
          }),
        });
      } else {
        res = await fetch('/api/admin/outlets/menu', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            action: 'create_menu_item',
            payload: menuItemForm,
          }),
        });
      }

      if (res.ok) {
        showToast(editingMenuItem ? 'Menu item updated' : 'New menu item created');
        setShowMenuItemModal(false);
        setEditingMenuItem(null);
        fetchAllData();
      } else {
        const j = await res.json();
        showToast(j.error || 'Failed to save menu item', 'error');
      }
    } catch (err) {
      showToast('Error saving menu item', 'error');
    } finally {
      setSavingMenuItem(false);
    }
  };

  // Delete Menu Item
  const handleDeleteMenuItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await fetch(`/api/admin/outlets/menu?type=menu_item&id=${itemId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Menu item deleted');
        setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
      } else {
        showToast('Failed to delete item', 'error');
      }
    } catch (err) {
      showToast('Error deleting item', 'error');
    }
  };

  // 5. Create Category (pos_categories)
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      showToast('Category name is required', 'error');
      return;
    }
    try {
      setSavingCategory(true);
      const res = await fetch('/api/admin/outlets/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_category',
          payload: { name: newCategoryName.trim(), sort_order: categories.length + 1 },
        }),
      });

      if (res.ok) {
        showToast('New menu category created');
        setShowCategoryModal(false);
        setNewCategoryName('');
        fetchAllData();
      } else {
        showToast('Failed to create category', 'error');
      }
    } catch (err) {
      showToast('Error creating category', 'error');
    } finally {
      setSavingCategory(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId) => {
    if (!confirm('Delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/outlets/menu?type=category&id=${catId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Category deleted');
        setCategories((prev) => prev.filter((c) => c.id !== catId));
      }
    } catch (err) {
      showToast('Error deleting category', 'error');
    }
  };

  // 6. Save Inventory Stock Item (outlet_inventory)
  const handleSaveInventoryItem = async (e) => {
    e.preventDefault();
    if (!inventoryForm.name.trim()) {
      showToast('Item name is required', 'error');
      return;
    }
    try {
      setSavingInventory(true);
      const res = await fetch('/api/admin/outlets/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_inventory_item',
          payload: inventoryForm,
        }),
      });

      if (res.ok) {
        showToast('Stock supply item created');
        setShowInventoryModal(false);
        setInventoryForm({
          outlet_id: outlets[0]?.id || '',
          name: '',
          category: 'ingredient',
          stock: '',
          threshold: '10',
          unit: 'kg',
          unit_cost: '0',
        });
        fetchAllData();
      } else {
        showToast('Failed to add inventory item', 'error');
      }
    } catch (err) {
      showToast('Error adding inventory item', 'error');
    } finally {
      setSavingInventory(false);
    }
  };

  // Delete Inventory Item
  const handleDeleteInventoryItem = async (invId) => {
    if (!confirm('Delete this inventory item?')) return;
    try {
      const res = await fetch(`/api/admin/outlets/menu?type=inventory&id=${invId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Inventory item deleted');
        setInventoryItems((prev) => prev.filter((i) => i.id !== invId));
      }
    } catch (err) {
      showToast('Error deleting item', 'error');
    }
  };

  // 7. Report Shortage with Photo (outlet_alerts)
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      setPreviewImageUrl(base64Data);
      setShortageForm((prev) => ({ ...prev, photo_base64: base64Data }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitShortageReport = async (e) => {
    e.preventDefault();
    if (!shortageForm.item_name.trim()) {
      showToast('Please enter the missing or low ingredient/cutlery item', 'error');
      return;
    }
    try {
      setSubmittingShortage(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      let uploadedPhotoUrl = null;
      if (shortageForm.photo_base64) {
        const photoRes = await fetch('/api/upload/photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Data: shortageForm.photo_base64, fileName: `shortage_${Date.now()}.jpg` }),
        });
        if (photoRes.ok) {
          const photoJson = await photoRes.json();
          uploadedPhotoUrl = photoJson.url;
        } else {
          uploadedPhotoUrl = shortageForm.photo_base64;
        }
      }

      const targetOutlet = outlets.find((o) => o.id === shortageForm.outlet_id) || outlets[0];

      const res = await fetch('/api/admin/outlets/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'report_low_stock',
          payload: {
            outlet_id: shortageForm.outlet_id || targetOutlet?.id,
            outlet_name: targetOutlet?.name || 'Janu Bhai Cafe',
            item_name: shortageForm.item_name,
            category: shortageForm.category,
            photo_url: uploadedPhotoUrl,
            estimated_stock: shortageForm.estimated_stock,
            urgency: shortageForm.urgency,
            notes: shortageForm.notes,
            reported_by: 'Store Manager',
          },
        }),
      });

      if (res.ok) {
        showToast('Shortage reported! Operations Head notified in real-time with photo.');
        setShowReportShortageModal(false);
        setPreviewImageUrl(null);
        setShortageForm({
          outlet_id: outlets[0]?.id || '',
          category: 'ingredient',
          item_name: '',
          estimated_stock: 'Critically Low / Depleted (0%)',
          urgency: 'critical',
          notes: '',
          photo_base64: null,
        });
        fetchAllData();
      } else {
        showToast('Failed to submit shortage report', 'error');
      }
    } catch (err) {
      showToast('Error submitting report', 'error');
    } finally {
      setSubmittingShortage(false);
    }
  };

  // Resolve Alert in Supabase
  const handleResolveAlert = async (alertId) => {
    try {
      const res = await fetch('/api/admin/outlets/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve_alert', payload: { alert_id: alertId } }),
      });

      if (res.ok) {
        showToast('Shortage marked as resolved & restocked!');
        setShortageAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a)));
      }
    } catch (err) {
      showToast('Error resolving alert', 'error');
    }
  };

  // Delete Alert
  const handleDeleteAlert = async (alertId) => {
    try {
      const res = await fetch(`/api/admin/outlets/menu?type=alert&id=${alertId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Alert removed');
        setShortageAlerts((prev) => prev.filter((a) => a.id !== alertId));
      }
    } catch (err) {
      showToast('Error deleting alert', 'error');
    }
  };

  // 8. Submit SOP Checklist
  const handleSubmitChecklist = async (e) => {
    e.preventDefault();
    try {
      setSubmittingChecklist(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const totalItems = activeChecklistItems.length;
      const checkedCount = activeChecklistItems.filter((i) => i.checked).length;
      const score = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 100;

      const payload = {
        outlet_id: selectedChecklistOutlet,
        date: selectedChecklistDate,
        checklist_type: selectedChecklistType,
        shift_type: selectedChecklistType === 'closing' ? 'night' : selectedChecklistType === 'midday' ? 'midday' : 'morning',
        items: activeChecklistItems,
        score,
        completed_by: checklistCompletedBy,
        verified_by: checklistVerifiedBy,
        notes: checklistNotes,
      };

      const res = await fetch('/api/outlet/checklists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(`SOP Checklist saved! Compliance score: ${score}%`);
        fetchAllData();
      } else {
        showToast('Failed to save checklist', 'error');
      }
    } catch (err) {
      showToast('Error submitting checklist', 'error');
    } finally {
      setSubmittingChecklist(false);
    }
  };

  // 9. Stock Transfer Actions
  const handleSaveTransfer = async (e) => {
    e.preventDefault();
    if (!transferForm.source_outlet_id || !transferForm.destination_outlet_id || !transferForm.item_name || !transferForm.quantity) {
      showToast('Please fill all transfer fields', 'error');
      return;
    }
    if (transferForm.source_outlet_id === transferForm.destination_outlet_id) {
      showToast('Source and destination must be different', 'error');
      return;
    }
    try {
      setSubmittingTransfer(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch('/api/outlet/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          ...transferForm,
          quantity: parseFloat(transferForm.quantity),
          status: 'pending',
        }),
      });

      if (res.ok) {
        showToast('Stock transfer recorded in database');
        setShowTransferModal(false);
        setTransferForm({
          source_outlet_id: '',
          destination_outlet_id: '',
          item_name: '',
          quantity: '',
          unit: 'kg',
          requested_by: 'Store Manager',
          notes: '',
        });
        fetchAllData();
      } else {
        showToast('Failed to create transfer', 'error');
      }
    } catch (err) {
      showToast('Error creating transfer', 'error');
    } finally {
      setSubmittingTransfer(false);
    }
  };

  const handleUpdateTransferStatus = async (transferId, status) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch('/api/outlet/transfers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ id: transferId, status }),
      });

      if (res.ok) {
        showToast(`Transfer status updated to ${status}`);
        setTransfers((prev) => prev.map((t) => (t.id === transferId ? { ...t, status } : t)));
      }
    } catch (err) {
      showToast('Error updating transfer', 'error');
    }
  };

  // 10. Purchase Order Actions
  const handleSavePo = async (e) => {
    e.preventDefault();
    if (!poForm.outlet_id || !poForm.vendor_name || poForm.items.length === 0) {
      showToast('Please select outlet, vendor, and items', 'error');
      return;
    }
    try {
      setSubmittingPo(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const subtotal = poForm.items.reduce((sum, it) => sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.unit_price) || 0), 0);
      const tax = Math.round(subtotal * 0.05);
      const total = subtotal + tax;

      const res = await fetch('/api/outlet/purchase-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          ...poForm,
          subtotal,
          tax,
          total,
          status: 'ordered',
        }),
      });

      if (res.ok) {
        showToast('Purchase order saved');
        setShowPoModal(false);
        fetchAllData();
      } else {
        showToast('Failed to create PO', 'error');
      }
    } catch (err) {
      showToast('Error creating PO', 'error');
    } finally {
      setSubmittingPo(false);
    }
  };

  const handleUpdatePoStatus = async (poId, status) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`/api/outlet/purchase-orders?id=${poId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        showToast(`PO status updated to ${status}`);
        setPurchaseOrders((prev) => prev.map((p) => (p.id === poId ? { ...p, status } : p)));
      }
    } catch (err) {
      showToast('Error updating PO', 'error');
    }
  };

  // 11. Save Cafe Global Settings
  const handleSaveCafeSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingCafeSettings(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'update_cafe_settings',
          payload: cafeSettings,
        }),
      });

      if (res.ok) {
        showToast('Cafe business settings saved');
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch (err) {
      showToast('Error saving settings', 'error');
    } finally {
      setSavingCafeSettings(false);
    }
  };

  // Filtering Logic
  const filteredOutlets = useMemo(() => {
    return outlets.filter(
      (o) =>
        !outletSearch ||
        o.name?.toLowerCase().includes(outletSearch.toLowerCase()) ||
        o.code?.toLowerCase().includes(outletSearch.toLowerCase()) ||
        o.city?.toLowerCase().includes(outletSearch.toLowerCase())
    );
  }, [outlets, outletSearch]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCategory = selectedMenuCategory === 'all' || item.category === selectedMenuCategory || item.category_id === selectedMenuCategory;
      const matchSearch =
        !menuSearch ||
        item.name?.toLowerCase().includes(menuSearch.toLowerCase()) ||
        item.description?.toLowerCase().includes(menuSearch.toLowerCase()) ||
        item.ingredients?.some((ing) => ing.item_name?.toLowerCase().includes(menuSearch.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [menuItems, selectedMenuCategory, menuSearch]);

  const filteredStockItems = useMemo(() => {
    return inventoryItems.filter((it) => {
      const matchOutlet = stockOutletFilter === 'all' || !it.outlet_id || it.outlet_id === stockOutletFilter;
      const matchCategory = stockCategoryFilter === 'all' || it.category === stockCategoryFilter;
      const isLow = (Number(it.stock) || 0) <= (Number(it.threshold) || 10);
      const matchStatus =
        stockStatusFilter === 'all' ||
        (stockStatusFilter === 'low' && isLow) ||
        (stockStatusFilter === 'normal' && !isLow);
      const matchSearch = !stockSearch || it.name?.toLowerCase().includes(stockSearch.toLowerCase());
      return matchOutlet && matchCategory && matchStatus && matchSearch;
    });
  }, [inventoryItems, stockOutletFilter, stockCategoryFilter, stockStatusFilter, stockSearch]);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <span>Connecting to Supabase Live Database...</span>
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
            <h1 style={{ margin: 0 }}>Outlet Operations Command</h1>
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
              Live Database Connected
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary, #cbb9a8)', margin: '0.35rem 0 0', fontSize: '0.9rem' }}>
            Centralized menu recipes, real-time ingredient & cutlery stock levels, photo shortage reporting, SOP audits, and multi-outlet switchboards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="admin-btn-outline admin-btn-sm" onClick={fetchAllData} title="Refresh Live Data from Supabase">
            <RefreshCw size={14} /> Refresh Live
          </button>
          {activeTab === 'all' && (
            <button className="admin-btn admin-btn-sm" onClick={() => { setEditOutlet(null); setShowOutletModal(true); }}>
              <Plus size={15} /> Add New Outlet
            </button>
          )}
          {activeTab === 'menu' && (
            <>
              <button className="admin-btn-outline admin-btn-sm" onClick={() => setShowCategoryModal(true)}>
                <Plus size={14} /> Add Category
              </button>
              <button
                className="admin-btn admin-btn-sm"
                onClick={() => {
                  setEditingMenuItem(null);
                  setMenuItemForm({
                    name: '',
                    category_id: categories[0]?.id || '',
                    price: '',
                    description: '',
                    is_veg: true,
                    is_available: true,
                    prep_time_minutes: 5,
                    image_url: '',
                    ingredients: [],
                  });
                  setShowMenuItemModal(true);
                }}
              >
                <Plus size={15} /> Add Menu Item & Recipe
              </button>
            </>
          )}
          {activeTab === 'stock' && (
            <>
              <button className="admin-btn-outline admin-btn-sm" onClick={() => setShowInventoryModal(true)}>
                <Plus size={14} /> Add Raw Ingredient / Supply
              </button>
              <button
                className="admin-btn admin-btn-sm"
                onClick={() => setShowReportShortageModal(true)}
                style={{ background: 'linear-gradient(135deg, #d89a1e 0%, #b87333 100%)', color: '#1a0f0c', fontWeight: 800 }}
              >
                <Camera size={15} /> 📸 Report Shortage with Photo
              </button>
            </>
          )}
          {activeTab === 'transfers' && (
            <button className="admin-btn admin-btn-sm" onClick={() => setShowTransferModal(true)}>
              <Plus size={15} /> Request Stock Transfer
            </button>
          )}
          {activeTab === 'purchase-orders' && (
            <button className="admin-btn admin-btn-sm" onClick={() => setShowPoModal(true)}>
              <Plus size={15} /> Create Purchase Order
            </button>
          )}
        </div>
      </div>

      {/* 5 Executive KPI Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
        <div
          className="stat-card gold"
          style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
          onClick={() => handleTabChange('all')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3>
              <Store size={14} style={{ display: 'inline', marginRight: 4 }} /> Outlets
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#69f0ae', fontWeight: 700 }}>
              {executiveMetrics.openOutlets} Open Live
            </span>
          </div>
          <p className="stat-value">{executiveMetrics.totalOutlets}</p>
          <p className="stat-sub">{executiveMetrics.activeOutlets} active branches configured</p>
        </div>

        <div
          className="stat-card blue"
          style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
          onClick={() => handleTabChange('menu')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3>
              <Coffee size={14} style={{ display: 'inline', marginRight: 4 }} /> Central Menu
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#60a5fa' }}>{categories.length} Categories</span>
          </div>
          <p className="stat-value">{executiveMetrics.menuItemsCount}</p>
          <p className="stat-sub">Live menu products in Supabase</p>
        </div>

        <div
          className="stat-card red"
          style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
          onClick={() => handleTabChange('stock')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3>
              <AlertTriangle size={14} style={{ display: 'inline', marginRight: 4 }} /> Stock Shortages
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#ff8a80', fontWeight: 700 }}>
              {executiveMetrics.criticalShortagesCount} Photo Alerts
            </span>
          </div>
          <p className="stat-value">{executiveMetrics.lowStockCount}</p>
          <p className="stat-sub">Items below safe minimum threshold</p>
        </div>

        <div
          className="stat-card green"
          style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
          onClick={() => handleTabChange('checklists')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3>
              <ClipboardCheck size={14} style={{ display: 'inline', marginRight: 4 }} /> SOP Audits
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#69f0ae' }}>Shift Logs</span>
          </div>
          <p className="stat-value">{checklists.length}</p>
          <p className="stat-sub">Opening, midday & closing records</p>
        </div>

        <div
          className="stat-card"
          style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
          onClick={() => handleTabChange('transfers')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3>
              <ArrowLeftRight size={14} style={{ display: 'inline', marginRight: 4 }} /> Stock Transfers
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#60a5fa' }}>Inter-Store</span>
          </div>
          <p className="stat-value">{executiveMetrics.totalTransfers}</p>
          <p className="stat-sub">Active & in-transit supply dispatches</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          borderBottom: '1px solid rgba(245, 240, 234, 0.1)',
          paddingBottom: '0.25rem',
          marginBottom: '1.5rem',
          overflowX: 'auto',
        }}
      >
        {[
          { key: 'all', label: `All Outlets (${outlets.length})`, icon: Store },
          { key: 'menu', label: `Central Menu (${menuItems.length})`, icon: Coffee },
          { key: 'stock', label: `Ingredients & Cutlery Stock (${inventoryItems.length})`, icon: Package },
          { key: 'checklists', label: 'Checklists & Audits', icon: ClipboardCheck },
          { key: 'surveillance', label: `Live Surveillance (${cameras.length})`, icon: Camera },
          { key: 'transfers', label: `Stock Transfers (${transfers.length})`, icon: ArrowLeftRight },
          { key: 'purchase-orders', label: `Purchase Orders (${purchaseOrders.length})`, icon: ShoppingBag },
          { key: 'settings', label: 'Cafe & Outlet Settings', icon: Settings },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.7rem 1.1rem',
                background: isActive ? 'rgba(216, 154, 30, 0.15)' : 'transparent',
                color: isActive ? 'var(--accent-gold, #d89a1e)' : 'var(--text-secondary, #cbb9a8)',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent-gold, #d89a1e)' : '2px solid transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <IconComponent size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: ALL OUTLETS & LIVE SWITCHBOARD
          ========================================================================= */}
      {activeTab === 'all' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="admin-toolbar">
            <div className="admin-search" style={{ flex: 1, minWidth: 260 }}>
              <Search size={16} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Search outlet by name, branch code, city..."
                value={outletSearch}
                onChange={(e) => setOutletSearch(e.target.value)}
              />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Showing {filteredOutlets.length} of {outlets.length} live outlets
            </span>
          </div>

          {filteredOutlets.length === 0 ? (
            <div className="empty-state">
              <Store size={44} />
              <h3>No outlets found in database</h3>
              <p>Create your first outlet branch using the button above.</p>
              <button className="admin-btn" onClick={() => setShowOutletModal(true)} style={{ marginTop: '0.5rem' }}>
                <Plus size={15} /> Add New Outlet
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
              {filteredOutlets.map((outlet) => {
                const status = statusBadges[outlet.operational_status] || statusBadges.open;
                return (
                  <div
                    key={outlet.id}
                    className="admin-card"
                    style={{
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: '1px solid rgba(216, 154, 30, 0.25)',
                      position: 'relative',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f5f0ea' }}>
                            {outlet.name}
                          </h3>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: 'var(--accent-gold, #d89a1e)',
                            }}
                          >
                            CODE: {outlet.code}
                          </span>
                        </div>

                        <select
                          value={outlet.operational_status || 'open'}
                          onChange={(e) => handleToggleOperationalStatus(outlet.id, e.target.value)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: status.bg,
                            color: status.color,
                            border: `1px solid ${status.color}50`,
                            outline: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="open" style={{ background: '#1e1210', color: '#69f0ae' }}>🟢 OPEN</option>
                          <option value="busy" style={{ background: '#1e1210', color: '#d89a1e' }}>🟡 BUSY</option>
                          <option value="paused" style={{ background: '#1e1210', color: '#ff8a80' }}>🔴 PAUSED</option>
                          <option value="closed" style={{ background: '#1e1210', color: '#cbb9a8' }}>⚪ CLOSED</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={13} color="var(--accent-gold)" />
                          <span>{outlet.address || 'Address not set'}, {outlet.city || ''}</span>
                        </div>
                        {outlet.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={13} color="var(--accent-gold)" />
                            <span>{outlet.phone}</span>
                          </div>
                        )}
                        {outlet.fssai_number && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Shield size={13} color="var(--accent-gold)" />
                            <span>FSSAI: {outlet.fssai_number}</span>
                          </div>
                        )}
                      </div>

                      {/* Channel Switches */}
                      <div
                        style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid rgba(245, 240, 234, 0.08)',
                          marginBottom: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <button
                          onClick={() => handleToggleChannel(outlet.id, 'dine_in_active', outlet.dine_in_active)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: outlet.dine_in_active !== false ? '#69f0ae' : '#888',
                          }}
                        >
                          {outlet.dine_in_active !== false ? '✓' : '✗'} Dine-In
                        </button>

                        <button
                          onClick={() => handleToggleChannel(outlet.id, 'takeaway_active', outlet.takeaway_active)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: outlet.takeaway_active !== false ? '#69f0ae' : '#888',
                          }}
                        >
                          {outlet.takeaway_active !== false ? '✓' : '✗'} Takeaway
                        </button>

                        <button
                          onClick={() => handleToggleChannel(outlet.id, 'delivery_active', outlet.delivery_active)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: outlet.delivery_active !== false ? '#69f0ae' : '#888',
                          }}
                        >
                          {outlet.delivery_active !== false ? '✓' : '✗'} Delivery ({outlet.delivery_radius_km || 5}km)
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(245, 240, 234, 0.08)', paddingTop: '0.75rem' }}>
                      <button
                        className="admin-btn-outline admin-btn-sm"
                        onClick={() => {
                          setEditOutlet(outlet);
                          setOutletForm({
                            name: outlet.name || '',
                            code: outlet.code || '',
                            address: outlet.address || '',
                            city: outlet.city || '',
                            state: outlet.state || '',
                            pincode: outlet.pincode || '',
                            phone: outlet.phone || '',
                            email: outlet.email || '',
                            tax_rate: outlet.tax_rate || 5,
                            operational_status: outlet.operational_status || 'open',
                            accepting_orders: outlet.accepting_orders !== false,
                            dine_in_active: outlet.dine_in_active !== false,
                            takeaway_active: outlet.takeaway_active !== false,
                            delivery_active: outlet.delivery_active !== false,
                            delivery_radius_km: outlet.delivery_radius_km || 5,
                            opening_time: outlet.opening_time || '08:00',
                            closing_time: outlet.closing_time || '22:00',
                            fssai_number: outlet.fssai_number || '',
                            manager_name: outlet.manager_name || '',
                            manager_phone: outlet.manager_phone || '',
                            manager_email: outlet.manager_email || '',
                            rent: outlet.settings?.rent || '',
                            electricity: outlet.settings?.electricity || '',
                            water: outlet.settings?.water || '',
                            internet: outlet.settings?.internet || '',
                            cogs: outlet.settings?.cogs || '',
                          });
                          setShowOutletModal(true);
                        }}
                      >
                        <Edit3 size={13} /> Edit Details
                      </button>

                      <Link href={`/admin/outlets/${outlet.id}`} className="admin-btn admin-btn-sm">
                        <Eye size={13} /> Full Outlet View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: CENTRALISED MASTER MENU & RECIPES (LIVE SUPABASE)
          ========================================================================= */}
      {activeTab === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => setSelectedMenuCategory('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '100px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: '1px solid',
                  cursor: 'pointer',
                  background: selectedMenuCategory === 'all' ? 'rgba(216, 154, 30, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedMenuCategory === 'all' ? 'var(--accent-gold, #d89a1e)' : 'var(--text-secondary, #cbb9a8)',
                  borderColor: selectedMenuCategory === 'all' ? 'var(--accent-gold, #d89a1e)' : 'rgba(245, 240, 234, 0.1)',
                }}
              >
                All Categories ({menuItems.length})
              </button>

              {categories.map((cat) => (
                <div key={cat.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  <button
                    onClick={() => setSelectedMenuCategory(cat.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '100px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: '1px solid',
                      cursor: 'pointer',
                      background: selectedMenuCategory === cat.id ? 'rgba(216, 154, 30, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      color: selectedMenuCategory === cat.id ? 'var(--accent-gold, #d89a1e)' : 'var(--text-secondary, #cbb9a8)',
                      borderColor: selectedMenuCategory === cat.id ? 'var(--accent-gold, #d89a1e)' : 'rgba(245, 240, 234, 0.1)',
                    }}
                  >
                    {cat.name}
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    style={{ background: 'none', border: 'none', color: '#ff8a80', cursor: 'pointer', padding: '0 4px', fontSize: '0.7rem' }}
                    title="Delete category"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                className="admin-btn-outline admin-btn-sm"
                onClick={() => setShowCategoryModal(true)}
                style={{ borderRadius: '100px', padding: '4px 10px', fontSize: '0.75rem' }}
              >
                + New Category
              </button>
            </div>

            <div className="admin-search" style={{ minWidth: 260 }}>
              <Search size={15} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Search live menu items, recipes..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
              />
            </div>
          </div>

          {filteredMenuItems.length === 0 ? (
            <div className="empty-state">
              <Coffee size={44} />
              <h3>No menu items found in Supabase</h3>
              <p>Add your first centralized menu item and ingredient recipe below.</p>
              <button
                className="admin-btn"
                onClick={() => {
                  setEditingMenuItem(null);
                  setMenuItemForm({
                    name: '',
                    category_id: categories[0]?.id || '',
                    price: '',
                    description: '',
                    is_veg: true,
                    is_available: true,
                    prep_time_minutes: 5,
                    image_url: '',
                    ingredients: [],
                  });
                  setShowMenuItemModal(true);
                }}
                style={{ marginTop: '0.5rem' }}
              >
                <Plus size={15} /> Add Menu Item & Recipe
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className="admin-card"
                  style={{
                    margin: 0,
                    border: '1px solid rgba(216, 154, 30, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: 'var(--accent-gold)',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {item.category}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: item.is_veg ? 'rgba(76, 175, 80, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: item.is_veg ? '#69f0ae' : '#ff8a80',
                            fontWeight: 700,
                          }}
                        >
                          {item.is_veg ? '🟢 VEG' : '🔴 NON-VEG'}
                        </span>
                        <button
                          onClick={() => handleDeleteMenuItem(item.id)}
                          style={{ background: 'none', border: 'none', color: '#ff8a80', cursor: 'pointer', padding: '0 2px' }}
                          title="Delete menu item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.1rem', color: '#f5f0ea' }}>
                      {item.name}
                    </h3>
                    {item.description && (
                      <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {item.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#69f0ae' }}>
                        ₹{item.price}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        ⏱️ {item.prep_time_minutes || 5} mins prep
                      </span>
                    </div>

                    {/* Ingredients & Cutlery Box */}
                    <div
                      style={{
                        background: 'rgba(0, 0, 0, 0.35)',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(245, 240, 234, 0.08)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                          🧪 Recipe Ingredients & Cutlery ({(item.ingredients || []).length})
                        </span>
                      </div>
                      {(item.ingredients || []).length === 0 ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          No ingredients mapped yet. Click edit to configure recipe.
                        </span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {item.ingredients.map((ing, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                background: ing.category === 'cutlery' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                                color: ing.category === 'cutlery' ? '#93c5fd' : '#f5f0ea',
                                border: `1px solid ${ing.category === 'cutlery' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(245, 240, 234, 0.08)'}`,
                              }}
                            >
                              {ing.item_name} ({ing.quantity}{ing.unit})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid rgba(245, 240, 234, 0.08)', paddingTop: '0.75rem' }}>
                    <button
                      className="admin-btn-outline admin-btn-sm"
                      onClick={() => {
                        setEditingMenuItem(item);
                        setMenuItemForm({
                          name: item.name,
                          category_id: item.category_id || '',
                          price: item.price,
                          description: item.description || '',
                          is_veg: item.is_veg !== false,
                          is_available: item.is_available !== false,
                          prep_time_minutes: item.prep_time_minutes || 5,
                          image_url: item.image_url || '',
                          ingredients: item.ingredients || [],
                        });
                        setShowMenuItemModal(true);
                      }}
                    >
                      <Edit3 size={13} /> Edit Recipe
                    </button>

                    <button
                      className="admin-btn admin-btn-sm"
                      onClick={() => setInspectingRecipeItem(item)}
                    >
                      <ChefHat size={13} /> View Spec
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: INGREDIENTS & CUTLERY STOCK MANAGEMENT + SHORTAGE PHOTO FEED
          ========================================================================= */}
      {activeTab === 'stock' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Operations Head Real-Time Shortage Photo Alert Feed */}
          {shortageAlerts.length > 0 && (
            <div
              className="admin-card"
              style={{
                border: '1.5px solid rgba(239, 68, 68, 0.45)',
                background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, rgba(26, 15, 12, 0.95) 100%)',
              }}
            >
              <div className="admin-card-header" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <AlertCircle size={20} color="#ff8a80" />
                  <h3 style={{ margin: 0, color: '#ff8a80' }}>
                    Live Outlet Shortage & Missing Item Reports (Photo-Verified)
                  </h3>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Reported by Store Managers directly to Operations Head
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {shortageAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: '10px',
                      border: `1px solid ${alert.resolved ? 'rgba(76, 175, 80, 0.3)' : 'rgba(239, 68, 68, 0.35)'}`,
                      padding: '1rem',
                      display: 'flex',
                      gap: '0.85rem',
                    }}
                  >
                    {alert.photo_url ? (
                      <div
                        onClick={() => setViewingPhotoModal(alert.photo_url)}
                        style={{
                          width: '74px',
                          height: '74px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid rgba(216, 154, 30, 0.4)',
                          cursor: 'pointer',
                          flexShrink: 0,
                          position: 'relative',
                        }}
                        title="Click to view photo"
                      >
                        <img
                          src={alert.photo_url}
                          alt="Shortage verification"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Eye size={16} color="#fff" />
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '74px',
                          height: '74px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <ImageIcon size={24} color="var(--text-secondary)" />
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: alert.resolved ? 'rgba(76, 175, 80, 0.2)' : 'rgba(239, 68, 68, 0.25)',
                            color: alert.resolved ? '#69f0ae' : '#ff8a80',
                          }}
                        >
                          {alert.resolved ? '✓ RESOLVED' : '🚨 SHORTAGE'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            {alert.time ? new Date(alert.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                          <button
                            onClick={() => handleDeleteAlert(alert.id)}
                            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0 }}
                            title="Delete alert"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f5f0ea', margin: '4px 0 2px' }}>
                        {alert.item_name || 'Ingredient Shortage'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                        {alert.message}
                      </div>

                      {!alert.resolved && (
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button
                            className="admin-btn-outline admin-btn-sm"
                            onClick={() => {
                              setTransferForm((prev) => ({
                                ...prev,
                                item_name: alert.item_name || 'Arabica Coffee Beans',
                                destination_outlet_id: alert.outlet_id || outlets[0]?.id,
                              }));
                              handleTabChange('transfers');
                              setShowTransferModal(true);
                            }}
                            style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                          >
                            🔄 Dispatch Transfer
                          </button>

                          <button
                            className="admin-btn admin-btn-sm"
                            onClick={() => handleResolveAlert(alert.id)}
                            style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                          >
                            ✓ Mark Restocked
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stock Table Filter Toolbar */}
          <div className="admin-toolbar" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <div className="admin-search" style={{ flex: 1, minWidth: 220 }}>
              <Search size={15} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Search raw ingredients, coffee beans, cups, cutlery..."
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
              />
            </div>

            <select
              value={stockOutletFilter}
              onChange={(e) => setStockOutletFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-chocolate, #1a0f0c)',
                color: '#f5f0ea',
                fontSize: '0.85rem',
              }}
            >
              <option value="all">🏢 All Outlets (Stock Master)</option>
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>

            <select
              value={stockCategoryFilter}
              onChange={(e) => setStockCategoryFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-chocolate, #1a0f0c)',
                color: '#f5f0ea',
                fontSize: '0.85rem',
              }}
            >
              <option value="all">📦 All Categories</option>
              <option value="ingredient">🧪 Ingredients & Raw Materials</option>
              <option value="cutlery">🍴 Cutlery, Cups & Packaging</option>
            </select>

            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-chocolate, #1a0f0c)',
                color: '#f5f0ea',
                fontSize: '0.85rem',
              }}
            >
              <option value="all">All Stock Statuses</option>
              <option value="low">🚨 Low / Depleted Only</option>
              <option value="normal">🟢 Safe Levels</option>
            </select>

            <button
              className="admin-btn-outline admin-btn-sm"
              onClick={() => setShowInventoryModal(true)}
            >
              <Plus size={14} /> Add Supply
            </button>

            <button
              className="admin-btn admin-btn-sm"
              onClick={() => setShowReportShortageModal(true)}
              style={{ background: 'linear-gradient(135deg, #d89a1e 0%, #b87333 100%)', color: '#1a0f0c', fontWeight: 800 }}
            >
              <Camera size={14} /> Report Shortage (Photo)
            </button>
          </div>

          {/* Stock Levels Ledger Table */}
          <div className="admin-card" style={{ margin: 0, padding: 0 }}>
            {filteredStockItems.length === 0 ? (
              <div className="empty-state">
                <Package size={44} />
                <h3>No raw ingredients or cutlery stock found</h3>
                <p>Add supplies or ingredients using the "Add Supply" button above.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item & Supply Name</th>
                    <th>Category</th>
                    <th>Branch Outlet</th>
                    <th>Current Stock</th>
                    <th>Min Safe Threshold</th>
                    <th>Stock Status</th>
                    <th style={{ textAlign: 'right' }}>Quick Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStockItems.map((item) => {
                    const isLow = (Number(item.stock) || 0) <= (Number(item.threshold) || 10);
                    const isDepleted = (Number(item.stock) || 0) <= 2;
                    return (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 700, color: '#f5f0ea' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {item.category === 'cutlery' ? <Box size={16} color="#60a5fa" /> : <Coffee size={16} color="var(--accent-gold)" />}
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: item.category === 'cutlery' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(216, 154, 30, 0.15)',
                              color: item.category === 'cutlery' ? '#60a5fa' : 'var(--accent-gold)',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            {item.category === 'cutlery' ? 'Cutlery & Packaging' : 'Ingredient'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{getOutletName(item.outlet_id)}</td>
                        <td>
                          <span
                            style={{
                              fontWeight: 800,
                              fontSize: '0.95rem',
                              color: isDepleted ? '#ff8a80' : isLow ? '#fbbf24' : '#69f0ae',
                            }}
                          >
                            {item.stock} {item.unit || 'units'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {item.threshold || 10} {item.unit || 'units'}
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: isDepleted ? 'rgba(239, 68, 68, 0.25)' : isLow ? 'rgba(216, 154, 30, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                              color: isDepleted ? '#ff8a80' : isLow ? '#d89a1e' : '#69f0ae',
                            }}
                          >
                            {isDepleted ? '🚨 DEPLETED / EMPTY' : isLow ? '⚠️ LOW STOCK' : '🟢 IN STOCK'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                            <button
                              className="admin-btn-outline admin-btn-sm"
                              onClick={() => {
                                setTransferForm((prev) => ({
                                  ...prev,
                                  item_name: item.name,
                                  destination_outlet_id: item.outlet_id || outlets[0]?.id,
                                }));
                                handleTabChange('transfers');
                                setShowTransferModal(true);
                              }}
                              title="Dispatch from other store"
                            >
                              Transfer
                            </button>

                            <button
                              onClick={() => handleDeleteInventoryItem(item.id)}
                              style={{ background: 'none', border: 'none', color: '#ff8a80', cursor: 'pointer', padding: '0 4px' }}
                              title="Delete item"
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
          TAB 4: CHECKLISTS & SOP AUDITS (LIVE SUPABASE)
          ========================================================================= */}
      {activeTab === 'checklists' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 style={{ margin: 0 }}>Daily SOP Inspection Audit</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Standard Operating Procedures & Bar Quality Audit
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitChecklist} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Outlet
                  </label>
                  <select
                    value={selectedChecklistOutlet}
                    onChange={(e) => setSelectedChecklistOutlet(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-chocolate, #1a0f0c)',
                      color: '#f5f0ea',
                      fontSize: '0.85rem',
                    }}
                  >
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedChecklistDate}
                    onChange={(e) => setSelectedChecklistDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-chocolate, #1a0f0c)',
                      color: '#f5f0ea',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Shift Type
                  </label>
                  <select
                    value={selectedChecklistType}
                    onChange={(e) => setSelectedChecklistType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-chocolate, #1a0f0c)',
                      color: '#f5f0ea',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="opening">🌅 Morning Opening</option>
                    <option value="midday">☀️ Midday Inspection</option>
                    <option value="closing">🌙 Night Closing</option>
                  </select>
                </div>
              </div>

              {/* Checklist Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <h4 style={{ margin: '0.5rem 0', fontSize: '0.92rem', color: 'var(--accent-gold)' }}>
                  Checklist Tasks & Verification Items ({activeChecklistItems.filter((i) => i.checked).length}/{activeChecklistItems.length})
                </h4>

                {activeChecklistItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const updated = [...activeChecklistItems];
                      updated[idx].checked = !updated[idx].checked;
                      setActiveChecklistItems(updated);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: item.checked ? 'rgba(76, 175, 80, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${item.checked ? 'rgba(76, 175, 80, 0.35)' : 'rgba(245, 240, 234, 0.08)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '4px',
                        border: `1.5px solid ${item.checked ? '#69f0ae' : '#888'}`,
                        background: item.checked ? '#69f0ae' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1a0f0c',
                        fontWeight: 900,
                        fontSize: '0.75rem',
                      }}
                    >
                      {item.checked && '✓'}
                    </div>
                    <span style={{ fontSize: '0.88rem', color: item.checked ? '#f5f0ea' : 'var(--text-secondary)' }}>
                      {item.label || item.text || item.title || item.task}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Completed By
                  </label>
                  <input
                    type="text"
                    value={checklistCompletedBy}
                    onChange={(e) => setChecklistCompletedBy(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-chocolate, #1a0f0c)',
                      color: '#f5f0ea',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Verified By
                  </label>
                  <input
                    type="text"
                    value={checklistVerifiedBy}
                    onChange={(e) => setChecklistVerifiedBy(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-chocolate, #1a0f0c)',
                      color: '#f5f0ea',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <textarea
                rows={2}
                placeholder="Audit observations, machine temperatures, maintenance flags..."
                value={checklistNotes}
                onChange={(e) => setChecklistNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-chocolate, #1a0f0c)',
                  color: '#f5f0ea',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                }}
              />

              <button
                type="submit"
                className="admin-btn"
                disabled={submittingChecklist}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {submittingChecklist ? 'Saving Audit...' : 'Submit SOP Inspection Audit'}
              </button>
            </form>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <h3 style={{ margin: 0 }}>Recent SOP Audit Logs</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {checklists.length} logs in Supabase
              </span>
            </div>

            {checklists.length === 0 ? (
              <div className="empty-state">
                <ClipboardCheck size={40} />
                <h3>No checklists logged</h3>
                <p>Complete daily opening and closing audits on the left.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '560px', overflowY: 'auto' }}>
                {checklists.map((chk) => (
                  <div
                    key={chk.id}
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
                      <div style={{ fontWeight: 700, color: '#f5f0ea', fontSize: '0.9rem' }}>
                        {getOutletName(chk.outlet_id)}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {chk.date} &bull; <span style={{ textTransform: 'capitalize' }}>{chk.checklist_type}</span> ({chk.completed_by || 'Staff'})
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: '1rem',
                          color: (chk.score || 100) >= 80 ? '#69f0ae' : '#ff8a80',
                        }}
                      >
                        {chk.score || 100}%
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Compliance</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: LIVE SURVEILLANCE & CCTV STREAMS (LIVE SUPABASE)
          ========================================================================= */}
      {activeTab === 'surveillance' && (
        <div>
          <div className="admin-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filter by Outlet:</span>
              <select
                value={surveillanceOutletFilter}
                onChange={(e) => setSurveillanceOutletFilter(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-chocolate, #1a0f0c)',
                  color: '#f5f0ea',
                  fontSize: '0.85rem',
                }}
              >
                <option value="all">All Outlets</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="admin-btn admin-btn-sm" onClick={() => setShowAddCameraModal(true)}>
              <Plus size={14} /> Add CCTV Stream
            </button>
          </div>

          {cameras.length === 0 ? (
            <div className="empty-state">
              <Camera size={44} />
              <h3>No CCTV camera streams configured</h3>
              <p>Add stream URLs to monitor cafe counter and dining floor live.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {cameras
                .filter((c) => surveillanceOutletFilter === 'all' || c.outlet_id === surveillanceOutletFilter)
                .map((cam) => (
                  <div
                    key={cam.id}
                    className="admin-card"
                    style={{
                      margin: 0,
                      padding: 0,
                      overflow: 'hidden',
                      border: '1px solid rgba(216, 154, 30, 0.25)',
                    }}
                  >
                    <div
                      style={{
                        height: 200,
                        background: '#0a0504',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      {cam.url?.includes('http') ? (
                        <iframe
                          src={cam.url}
                          title={cam.name}
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          allow="autoplay; encrypted-media"
                        />
                      ) : (
                        <>
                          <Video size={40} color="var(--accent-gold)" style={{ opacity: 0.8 }} />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            RTSP / WebRTC Stream Feed
                          </span>
                        </>
                      )}

                      <span
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          background: cam.active !== false ? 'rgba(46, 125, 50, 0.85)' : 'rgba(239, 68, 68, 0.85)',
                          color: '#fff',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {cam.active !== false ? '🔴 LIVE STREAM' : '⏸ PAUSED'}
                      </span>
                    </div>

                    <div style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#f5f0ea' }}>{cam.name}</h4>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {getOutletName(cam.outlet_id)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 6: STOCK TRANSFERS (LIVE SUPABASE)
          ========================================================================= */}
      {activeTab === 'transfers' && (
        <div>
          <div className="admin-toolbar">
            <div className="admin-search" style={{ flex: 1, minWidth: 240 }}>
              <Search size={16} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Search transfer item, outlet, requested by..."
                value={transferSearch}
                onChange={(e) => setTransferSearch(e.target.value)}
              />
            </div>

            <select
              value={transferStatusFilter}
              onChange={(e) => setTransferStatusFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-chocolate, #1a0f0c)',
                color: '#f5f0ea',
                fontSize: '0.85rem',
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="in_transit">In-Transit</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button className="admin-btn admin-btn-sm" onClick={() => setShowTransferModal(true)}>
              <Plus size={14} /> Request Transfer
            </button>
          </div>

          <div className="admin-card">
            {transfers.length === 0 ? (
              <div className="empty-state">
                <ArrowLeftRight size={44} />
                <h3>No stock transfers recorded</h3>
                <p>Submit inter-cafe raw materials movement requests using the button above.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item & Quantity</th>
                    <th>Source Outlet</th>
                    <th>Destination Outlet</th>
                    <th>Requested By</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers
                    .filter((t) => {
                      const matchesSearch =
                        !transferSearch ||
                        t.item_name?.toLowerCase().includes(transferSearch.toLowerCase()) ||
                        t.requested_by?.toLowerCase().includes(transferSearch.toLowerCase());
                      const matchesStatus = transferStatusFilter === 'all' || t.status === transferStatusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map((t) => {
                      const conf = transferStatusConfig[t.status] || transferStatusConfig.pending;
                      return (
                        <tr key={t.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: '#f5f0ea' }}>{t.item_name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>
                              {t.quantity} {t.unit || 'units'}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{getOutletName(t.source_outlet_id)}</td>
                          <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{getOutletName(t.destination_outlet_id)}</td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {t.requested_by || 'Manager'}
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                background: conf.bg,
                                color: conf.color,
                              }}
                            >
                              {conf.label}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                              {t.status === 'pending' && (
                                <button
                                  className="admin-btn-outline admin-btn-sm"
                                  onClick={() => handleUpdateTransferStatus(t.id, 'in_transit')}
                                >
                                  Dispatch
                                </button>
                              )}
                              {t.status === 'in_transit' && (
                                <button
                                  className="admin-btn admin-btn-sm"
                                  onClick={() => handleUpdateTransferStatus(t.id, 'completed')}
                                >
                                  Mark Received
                                </button>
                              )}
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
          TAB 7: PURCHASE ORDERS & SUPPLIES (LIVE SUPABASE)
          ========================================================================= */}
      {activeTab === 'purchase-orders' && (
        <div>
          <div className="admin-toolbar">
            <div className="admin-search" style={{ flex: 1, minWidth: 240 }}>
              <Search size={16} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Search PO number, vendor, notes..."
                value={poSearch}
                onChange={(e) => setPoSearch(e.target.value)}
              />
            </div>

            <select
              value={poStatusFilter}
              onChange={(e) => setPoStatusFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-chocolate, #1a0f0c)',
                color: '#f5f0ea',
                fontSize: '0.85rem',
              }}
            >
              <option value="all">All PO Statuses</option>
              <option value="draft">Draft</option>
              <option value="ordered">Ordered / Dispatched</option>
              <option value="received">Received & Stocked</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button className="admin-btn admin-btn-sm" onClick={() => setShowPoModal(true)}>
              <Plus size={14} /> Create Purchase Order
            </button>
          </div>

          <div className="admin-card">
            {purchaseOrders.length === 0 ? (
              <div className="empty-state">
                <ShoppingBag size={44} />
                <h3>No purchase orders in database</h3>
                <p>Create procurement orders for roastery beans, dairy, syrups, and packaging.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Outlet Branch</th>
                    <th>Vendor Supplier</th>
                    <th>Order Date</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders
                    .filter((p) => {
                      const matchesSearch =
                        !poSearch ||
                        p.po_number?.toLowerCase().includes(poSearch.toLowerCase()) ||
                        p.vendor_name?.toLowerCase().includes(poSearch.toLowerCase());
                      const matchesStatus = poStatusFilter === 'all' || p.status === poStatusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map((po) => {
                      const badge = poStatusBadges[po.status] || poStatusBadges.draft;
                      return (
                        <tr key={po.id}>
                          <td style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-gold)' }}>
                            {po.po_number}
                          </td>
                          <td>{getOutletName(po.outlet_id)}</td>
                          <td style={{ fontWeight: 600 }}>{po.vendor_name || 'Roastery Direct'}</td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{po.order_date}</td>
                          <td style={{ fontSize: '0.82rem' }}>{(po.items || []).length} item(s)</td>
                          <td style={{ fontWeight: 700, color: '#69f0ae' }}>
                            ₹{Number(po.total || 0).toLocaleString()}
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                background: badge.bg,
                                color: badge.color,
                              }}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {po.status === 'ordered' && (
                              <button
                                className="admin-btn admin-btn-sm"
                                onClick={() => handleUpdatePoStatus(po.id, 'received')}
                              >
                                Mark Stocked
                              </button>
                            )}
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
          TAB 8: CAFE & OUTLET SETTINGS
          ========================================================================= */}
      {activeTab === 'settings' && (
        <div style={{ maxWidth: '800px' }}>
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 size={18} color="var(--accent-gold)" /> Global Cafe Entity Settings
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Centralized legal, tax, and brand parameters for Janu Bhai Cafe entity.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCafeSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Cafe Business Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={cafeSettings.cafe_name || ''}
                    onChange={(e) => setCafeSettings({ ...cafeSettings, cafe_name: e.target.value })}
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
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Global GSTIN Number
                  </label>
                  <input
                    type="text"
                    placeholder="07AAAAA0000A1Z5"
                    value={cafeSettings.global_gstin || ''}
                    onChange={(e) => setCafeSettings({ ...cafeSettings, global_gstin: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Central FSSAI License Number
                  </label>
                  <input
                    type="text"
                    placeholder="100XXXXXXXXXXX"
                    value={cafeSettings.central_fssai || ''}
                    onChange={(e) => setCafeSettings({ ...cafeSettings, central_fssai: e.target.value })}
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
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Cafe Support Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={cafeSettings.support_phone || ''}
                    onChange={(e) => setCafeSettings({ ...cafeSettings, support_phone: e.target.value })}
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
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Cafe Support Email Address
                </label>
                <input
                  type="email"
                  value={cafeSettings.support_email || ''}
                  onChange={(e) => setCafeSettings({ ...cafeSettings, support_email: e.target.value })}
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
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Headquarters Address
                </label>
                <input
                  type="text"
                  placeholder="Gafoor Nagar, Jamia Nagar, Okhla, New Delhi 110025"
                  value={cafeSettings.hq_address || ''}
                  onChange={(e) => setCafeSettings({ ...cafeSettings, hq_address: e.target.value })}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button type="submit" className="admin-btn" disabled={savingCafeSettings}>
                  <Save size={15} /> {savingCafeSettings ? 'Saving...' : 'Save Cafe Global Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT MENU ITEM & RECIPE
          ========================================================================= */}
      {showMenuItemModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setShowMenuItemModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '650px',
              background: 'linear-gradient(180deg, #2a1a17 0%, #1a0f0c 100%)',
              border: '1px solid rgba(216, 154, 30, 0.35)',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Coffee size={22} color="var(--accent-gold)" />
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>
                  {editingMenuItem ? 'Edit Central Menu Item & Recipe' : 'Add Central Menu Item & Recipe'}
                </h2>
              </div>
              <button
                onClick={() => setShowMenuItemModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMenuItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Signature Cold Coffee, Paneer Toastie"
                    value={menuItemForm.name}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, name: e.target.value })}
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
                    Category *
                  </label>
                  <select
                    required
                    value={menuItemForm.category_id}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, category_id: e.target.value })}
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
                    <option value="">Select category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="180"
                    value={menuItemForm.price}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, price: e.target.value })}
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
                    Prep Time (Mins)
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    value={menuItemForm.prep_time_minutes}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, prep_time_minutes: e.target.value })}
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
                    Dietary
                  </label>
                  <select
                    value={menuItemForm.is_veg ? 'veg' : 'nonveg'}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, is_veg: e.target.value === 'veg' })}
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
                    <option value="veg">🟢 Vegetarian</option>
                    <option value="nonveg">🔴 Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Artisan espresso with textured micro-foamed milk..."
                  value={menuItemForm.description}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, description: e.target.value })}
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

              {/* Recipe Ingredients & Cutlery Rows Builder */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    🧪 Linked Recipe Ingredients & Packaging Cutlery
                  </label>
                  <button
                    type="button"
                    className="admin-btn-outline admin-btn-sm"
                    onClick={() =>
                      setMenuItemForm((prev) => ({
                        ...prev,
                        ingredients: [...prev.ingredients, { item_name: '', quantity: 1, unit: 'g', category: 'ingredient' }],
                      }))
                    }
                    style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                  >
                    + Add Ingredient / Cutlery
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {menuItemForm.ingredients.map((ing, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Ingredient or Cup/Cutlery name"
                        value={ing.item_name}
                        onChange={(e) => {
                          const updated = [...menuItemForm.ingredients];
                          updated[idx].item_name = e.target.value;
                          setMenuItemForm({ ...menuItemForm, ingredients: updated });
                        }}
                        style={{
                          flex: 2,
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-chocolate, #1a0f0c)',
                          color: '#f5f0ea',
                          fontSize: '0.82rem',
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={ing.quantity}
                        onChange={(e) => {
                          const updated = [...menuItemForm.ingredients];
                          updated[idx].quantity = parseFloat(e.target.value) || 0;
                          setMenuItemForm({ ...menuItemForm, ingredients: updated });
                        }}
                        style={{
                          width: '70px',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-chocolate, #1a0f0c)',
                          color: '#f5f0ea',
                          fontSize: '0.82rem',
                        }}
                      />
                      <select
                        value={ing.unit}
                        onChange={(e) => {
                          const updated = [...menuItemForm.ingredients];
                          updated[idx].unit = e.target.value;
                          setMenuItemForm({ ...menuItemForm, ingredients: updated });
                        }}
                        style={{
                          width: '75px',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-chocolate, #1a0f0c)',
                          color: '#f5f0ea',
                          fontSize: '0.82rem',
                        }}
                      >
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="kg">kg</option>
                        <option value="unit">unit</option>
                        <option value="slices">slices</option>
                      </select>
                      <select
                        value={ing.category}
                        onChange={(e) => {
                          const updated = [...menuItemForm.ingredients];
                          updated[idx].category = e.target.value;
                          setMenuItemForm({ ...menuItemForm, ingredients: updated });
                        }}
                        style={{
                          width: '95px',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-chocolate, #1a0f0c)',
                          color: '#f5f0ea',
                          fontSize: '0.82rem',
                        }}
                      >
                        <option value="ingredient">Ingredient</option>
                        <option value="cutlery">Cutlery</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = menuItemForm.ingredients.filter((_, i) => i !== idx);
                          setMenuItemForm({ ...menuItemForm, ingredients: updated });
                        }}
                        style={{ background: 'none', border: 'none', color: '#ff8a80', cursor: 'pointer', padding: '0 4px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" className="admin-btn-outline" onClick={() => setShowMenuItemModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn" disabled={savingMenuItem}>
                  {savingMenuItem ? 'Saving...' : editingMenuItem ? 'Update Menu Item' : 'Create Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
          }}
          onClick={() => setShowCategoryModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              background: 'linear-gradient(180deg, #2a1a17 0%, #1a0f0c 100%)',
              border: '1px solid rgba(216, 154, 30, 0.35)',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem' }}>Add Menu Category</h3>
            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                required
                placeholder="e.g. Cold Brews, Sandwiches, Desserts"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="admin-btn-outline" onClick={() => setShowCategoryModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn" disabled={savingCategory}>
                  {savingCategory ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Raw Inventory Item Modal */}
      {showInventoryModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setShowInventoryModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              background: 'linear-gradient(180deg, #2a1a17 0%, #1a0f0c 100%)',
              border: '1px solid rgba(216, 154, 30, 0.35)',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.15rem' }}>Add Raw Ingredient / Cutlery Supply</h3>
            <form onSubmit={handleSaveInventoryItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Outlet Branch *
                </label>
                <select
                  required
                  value={inventoryForm.outlet_id}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, outlet_id: e.target.value })}
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
                  <option value="">Select outlet...</option>
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Supply Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arabica Coffee Beans, Mayonnaise Jar, Paper Cups 250ml"
                  value={inventoryForm.name}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Category
                  </label>
                  <select
                    value={inventoryForm.category}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, category: e.target.value })}
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
                    <option value="ingredient">🧪 Raw Ingredient</option>
                    <option value="cutlery">🍴 Cutlery & Packaging</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Unit
                  </label>
                  <input
                    type="text"
                    placeholder="kg, litres, sleeves, units"
                    value={inventoryForm.unit}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Current Stock *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="25"
                    value={inventoryForm.stock}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, stock: e.target.value })}
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
                    Min Safe Threshold
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="10"
                    value={inventoryForm.threshold}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, threshold: e.target.value })}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" className="admin-btn-outline" onClick={() => setShowInventoryModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn" disabled={savingInventory}>
                  {savingInventory ? 'Saving...' : 'Add Supply Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Report Shortage with Photo */}
      {showReportShortageModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setShowReportShortageModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              background: 'linear-gradient(180deg, #2a1a17 0%, #1a0f0c 100%)',
              border: '1.5px solid rgba(239, 68, 68, 0.45)',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Camera size={22} color="#ff8a80" />
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#ff8a80' }}>
                  Report Shortage / Missing Stock (Photo-Verified)
                </h2>
              </div>
              <button
                onClick={() => setShowReportShortageModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitShortageReport} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Reporting Outlet Branch *
                  </label>
                  <select
                    required
                    value={shortageForm.outlet_id}
                    onChange={(e) => setShortageForm({ ...shortageForm, outlet_id: e.target.value })}
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
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Supply Category *
                  </label>
                  <select
                    value={shortageForm.category}
                    onChange={(e) => setShortageForm({ ...shortageForm, category: e.target.value })}
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
                    <option value="ingredient">🧪 Ingredient (Mayo, Milk, Beans, Syrups)</option>
                    <option value="cutlery">🍴 Cutlery & Packaging (Cups, Lids, Bags)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Missing / Low Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mayonnaise & Garlic Spread Bottle, Hot Coffee Cups 250ml..."
                  value={shortageForm.item_name}
                  onChange={(e) => setShortageForm({ ...shortageForm, item_name: e.target.value })}
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

              {/* Photo Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-gold)', marginBottom: '0.3rem' }}>
                  📸 Attach Photo Evidence of Shortage (Empty Bottle / Shelf / Depleted Bin)
                </label>
                <div
                  style={{
                    border: '2px dashed rgba(216, 154, 30, 0.35)',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    background: 'rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                  }}
                >
                  {previewImageUrl ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={previewImageUrl}
                        alt="Shortage preview"
                        style={{ maxHeight: '160px', borderRadius: '8px', objectFit: 'contain' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImageUrl(null);
                          setShortageForm((prev) => ({ ...prev, photo_base64: null }));
                        }}
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          background: '#c62828',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: 24,
                          height: 24,
                          cursor: 'pointer',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud size={32} color="var(--accent-gold)" style={{ margin: '0 auto 0.5rem' }} />
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Click to take a live photo or upload an image file
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoUpload}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          opacity: 0,
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Remaining Stock Level
                  </label>
                  <input
                    type="text"
                    value={shortageForm.estimated_stock}
                    onChange={(e) => setShortageForm({ ...shortageForm, estimated_stock: e.target.value })}
                    placeholder="e.g. 0% (Completely Empty), 1 bottle left"
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Urgency Level
                  </label>
                  <select
                    value={shortageForm.urgency}
                    onChange={(e) => setShortageForm({ ...shortageForm, urgency: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-chocolate, #1a0f0c)',
                      color: '#f5f0ea',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="critical">🚨 Critical (Out of Stock Now)</option>
                    <option value="high">⚠️ High (Will run out soon)</option>
                    <option value="medium">🟡 Medium (Restock needed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Manager Observation Notes
                </label>
                <textarea
                  rows={2}
                  value={shortageForm.notes}
                  onChange={(e) => setShortageForm({ ...shortageForm, notes: e.target.value })}
                  placeholder="e.g. Mayonnaise bottle empty, backstore also has 0 stock. Urgent for sandwiches."
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" className="admin-btn-outline" onClick={() => setShowReportShortageModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn"
                  disabled={submittingShortage}
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: '#fff', fontWeight: 700 }}
                >
                  {submittingShortage ? 'Transmitting Alert...' : '🚀 Transmit Shortage to Ops Head'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Photo Viewer */}
      {viewingPhotoModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1.5rem',
          }}
          onClick={() => setViewingPhotoModal(null)}
        >
          <div style={{ position: 'relative', maxWidth: '85vw', maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
            <img
              src={viewingPhotoModal}
              alt="Verification full preview"
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
            />
            <button
              onClick={() => setViewingPhotoModal(null)}
              style={{
                position: 'absolute',
                top: -16,
                right: -16,
                background: '#c62828',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Recipe Spec Modal */}
      {inspectingRecipeItem && (
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
          onClick={() => setInspectingRecipeItem(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              background: 'linear-gradient(180deg, #2a1a17 0%, #1a0f0c 100%)',
              border: '1.5px solid rgba(216, 154, 30, 0.45)',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ChefHat size={20} color="var(--accent-gold)" />
                <h3 style={{ margin: 0, color: 'var(--accent-gold)' }}>
                  Recipe Specification: {inspectingRecipeItem.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectingRecipeItem(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Portions and supplies required per preparation:
            </p>

            {(inspectingRecipeItem.ingredients || []).length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                No recipe ingredients mapped yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {inspectingRecipeItem.ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid rgba(245, 240, 234, 0.08)',
                    }}
                  >
                    <span style={{ fontSize: '0.88rem', color: '#f5f0ea', fontWeight: 600 }}>
                      {ing.item_name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: ing.category === 'cutlery' ? '#60a5fa' : 'var(--accent-gold)',
                      }}
                    >
                      {ing.quantity} {ing.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              className="admin-btn"
              onClick={() => setInspectingRecipeItem(null)}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Outlet Modal */}
      {showOutletModal && (
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
          onClick={() => setShowOutletModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '600px',
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
                  {editOutlet ? 'Edit Outlet Branch' : 'Onboard New Cafe Outlet'}
                </h2>
              </div>
              <button
                onClick={() => setShowOutletModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveOutlet} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Outlet Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Janu Bhai Cafe - Gafoor Nagar"
                    value={outletForm.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!editOutlet && !outletForm.code) {
                        const words = val.split(/[\s-]+/).filter(Boolean);
                        let c = 'JBC-';
                        if (words.length > 0) c += (words[words.length - 1] || 'HQ').substring(0, 3).toUpperCase();
                        setOutletForm({ ...outletForm, name: val, code: c });
                      } else {
                        setOutletForm({ ...outletForm, name: val });
                      }
                    }}
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
                    Branch Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="JBC-HQ"
                    value={outletForm.code}
                    onChange={(e) => setOutletForm({ ...outletForm, code: e.target.value.toUpperCase() })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-chocolate, #1a0f0c)',
                      color: '#f5f0ea',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="Plot 42, Main Market Road"
                  value={outletForm.address}
                  onChange={(e) => setOutletForm({ ...outletForm, address: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Pincode
                  </label>
                  <input
                    type="text"
                    placeholder="110025"
                    value={outletForm.pincode}
                    onChange={(e) => setOutletForm({ ...outletForm, pincode: e.target.value })}
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
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="New Delhi"
                    value={outletForm.city}
                    onChange={(e) => setOutletForm({ ...outletForm, city: e.target.value })}
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
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="Delhi"
                    value={outletForm.state}
                    onChange={(e) => setOutletForm({ ...outletForm, state: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Outlet Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={outletForm.phone}
                    onChange={(e) => setOutletForm({ ...outletForm, phone: e.target.value })}
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
                    FSSAI Number
                  </label>
                  <input
                    type="text"
                    placeholder="100XXXXXXXXXXX"
                    value={outletForm.fssai_number}
                    onChange={(e) => setOutletForm({ ...outletForm, fssai_number: e.target.value })}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" className="admin-btn-outline" onClick={() => setShowOutletModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn" disabled={savingOutlet}>
                  {savingOutlet ? 'Saving...' : editOutlet ? 'Update Outlet' : 'Create Outlet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add CCTV Modal */}
      {showAddCameraModal && (
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
          onClick={() => setShowAddCameraModal(false)}
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
                <Camera size={20} color="var(--accent-gold)" />
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Add CCTV Camera Stream</h2>
              </div>
              <button
                onClick={() => setShowAddCameraModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCamera} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Select Outlet Branch *
                </label>
                <select
                  required
                  value={cameraForm.outlet_id}
                  onChange={(e) => setCameraForm({ ...cameraForm, outlet_id: e.target.value })}
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
                  <option value="">Select an outlet...</option>
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Camera Location / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Barista Counter Cam 1, Dining Area"
                  value={cameraForm.name}
                  onChange={(e) => setCameraForm({ ...cameraForm, name: e.target.value })}
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
                  Stream RTSP / WebRTC URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://stream.janubhai.com/cam1 or rtsp://..."
                  value={cameraForm.url}
                  onChange={(e) => setCameraForm({ ...cameraForm, url: e.target.value })}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" className="admin-btn-outline" onClick={() => setShowAddCameraModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn" disabled={submittingCamera}>
                  {submittingCamera ? 'Adding...' : 'Add Camera Stream'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {showTransferModal && (
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
          onClick={() => setShowTransferModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
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
                <ArrowLeftRight size={20} color="var(--accent-gold)" />
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Request Inter-Store Stock Transfer</h2>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Source Outlet (From) *
                  </label>
                  <select
                    required
                    value={transferForm.source_outlet_id}
                    onChange={(e) => setTransferForm({ ...transferForm, source_outlet_id: e.target.value })}
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
                    <option value="">Select source...</option>
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Destination Outlet (To) *
                  </label>
                  <select
                    required
                    value={transferForm.destination_outlet_id}
                    onChange={(e) => setTransferForm({ ...transferForm, destination_outlet_id: e.target.value })}
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
                    <option value="">Select destination...</option>
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Item to Transfer *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arabica Espresso Coffee Beans, Mayonnaise Spread, Hot Cups..."
                  value={transferForm.item_name}
                  onChange={(e) => setTransferForm({ ...transferForm, item_name: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Quantity *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="10"
                    value={transferForm.quantity}
                    onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
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
                    Unit
                  </label>
                  <select
                    value={transferForm.unit}
                    onChange={(e) => setTransferForm({ ...transferForm, unit: e.target.value })}
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
                    <option value="kg">kg (Kilograms)</option>
                    <option value="litres">litres (L)</option>
                    <option value="bottles">bottles</option>
                    <option value="sleeves">sleeves (Cups)</option>
                    <option value="boxes">boxes</option>
                    <option value="units">units / packs</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" className="admin-btn-outline" onClick={() => setShowTransferModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn" disabled={submittingTransfer}>
                  {submittingTransfer ? 'Submitting...' : 'Submit Transfer Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Order Modal */}
      {showPoModal && (
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
          onClick={() => setShowPoModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '620px',
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
                <ShoppingBag size={20} color="var(--accent-gold)" />
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Create Vendor Purchase Order</h2>
              </div>
              <button
                onClick={() => setShowPoModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePo} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Procuring Outlet *
                  </label>
                  <select
                    required
                    value={poForm.outlet_id}
                    onChange={(e) => setPoForm({ ...poForm, outlet_id: e.target.value })}
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
                    <option value="">Select outlet...</option>
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Vendor / Supplier *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Roastery Green Bean Importers"
                    value={poForm.vendor_name}
                    onChange={(e) => setPoForm({ ...poForm, vendor_name: e.target.value })}
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
                  Ordered Items & Supplies
                </label>
                {poForm.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.item_name}
                      onChange={(e) => {
                        const updated = [...poForm.items];
                        updated[idx].item_name = e.target.value;
                        setPoForm({ ...poForm, items: updated });
                      }}
                      style={{
                        flex: 2,
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-chocolate, #1a0f0c)',
                        color: '#f5f0ea',
                        fontSize: '0.85rem',
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const updated = [...poForm.items];
                        updated[idx].quantity = e.target.value;
                        setPoForm({ ...poForm, items: updated });
                      }}
                      style={{
                        width: '80px',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-chocolate, #1a0f0c)',
                        color: '#f5f0ea',
                        fontSize: '0.85rem',
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Unit ₹"
                      value={item.unit_price}
                      onChange={(e) => {
                        const updated = [...poForm.items];
                        updated[idx].unit_price = e.target.value;
                        setPoForm({ ...poForm, items: updated });
                      }}
                      style={{
                        width: '100px',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-chocolate, #1a0f0c)',
                        color: '#f5f0ea',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="admin-btn-outline admin-btn-sm"
                  onClick={() =>
                    setPoForm({ ...poForm, items: [...poForm.items, { item_name: '', quantity: 1, unit_price: 0 }] })
                  }
                  style={{ marginTop: '0.25rem' }}
                >
                  + Add Item
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" className="admin-btn-outline" onClick={() => setShowPoModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn" disabled={submittingPo}>
                  {submittingPo ? 'Creating PO...' : 'Create Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOutletsMasterPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Connecting to Supabase Live Database...</span>
        </div>
      }
    >
      <OutletsMasterDashboardContent />
    </Suspense>
  );
}
