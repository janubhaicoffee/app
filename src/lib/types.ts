// ================================
// Extended Types for Integrations Engine
// ================================

export type IntegrationStatus = 'connected' | 'disconnected' | 'syncing' | 'error';
export type OrderSource = 'pos' | 'zomato' | 'swiggy' | 'uengage';
export type DeliveryStatus = 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled';

export interface Integration {
  id: string;
  name: string;
  slug: string;
  icon: string;
  status: IntegrationStatus;
  enabled: boolean;
  lastSync: string | null;
  config?: Record<string, unknown>;
}

export interface UnifiedOrder {
  id: string;
  source: OrderSource;
  outletId: string;
  items: { name: string; qty: number; price: number }[];
  totalAmount: number;
  status: 'new' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'online';
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
  delivery?: {
    status: DeliveryStatus;
    riderName?: string;
    trackingUrl?: string;
  };
}

export interface RevenueBySource {
  source: OrderSource;
  label: string;
  amount: number;
  color: string;
  orders: number;
}

// Source metadata for display
export const SOURCE_META: Record<OrderSource, { label: string; color: string; bgColor: string }> = {
  pos: { label: 'POS', color: '#4A3022', bgColor: '#F0E8E0' },
  zomato: { label: 'Zomato', color: '#E23744', bgColor: '#FDEAEC' },
  swiggy: { label: 'Swiggy', color: '#FC8019', bgColor: '#FFF3E6' },
  uengage: { label: 'Uengage', color: '#6C5CE7', bgColor: '#EEECFB' },
};

// ================================
// Finance & Inventory Types
// ================================

export type ExpenseCategory = 'rent' | 'electricity' | 'raw_material' | 'misc';
export type StockLevel = 'safe' | 'low' | 'critical';
export type TimePeriod = 'today' | 'week' | 'month';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  note?: string;
  createdAt: string;
  outletId: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  level: StockLevel;
  lastUpdated: string;
}

export interface DailySnapshot {
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  salesChange: number;  // percentage vs yesterday
  expenseChange: number;
}

export interface OutletFinance {
  outletId: string;
  outletName: string;
  sales: number;
  expenses: number;
  profit: number;
  rank: 'best' | 'worst' | 'normal';
}

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
  rent: { label: 'Rent', icon: '🏠', color: '#6B4A3A' },
  electricity: { label: 'Electricity', icon: '⚡', color: '#F0AD4E' },
  raw_material: { label: 'Raw Material', icon: '📦', color: '#2D8A4E' },
  misc: { label: 'Miscellaneous', icon: '📋', color: '#5C5559' },
};

export const STOCK_COLORS: Record<StockLevel, string> = {
  safe: '#2D8A4E',
  low: '#F0AD4E',
  critical: '#E23744',
};

// ================================
// Role-Based Control Types
// ================================

export type UserRole = 'customer' | 'employee' | 'manager' | 'superadmin';
export type UserStatus = 'active' | 'disabled';
export type OutletStatus = 'active' | 'inactive' | 'suspended';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  outletId?: string; // Bound outlet
  createdAt: string;
}

export interface Outlet {
  id: string;
  name: string;
  location: string;
  phone: string;
  hours: string;
  status: OutletStatus;
  createdAt: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Customer',
  employee: 'Employee',
  manager: 'Manager',
  superadmin: 'Superadmin',
};

export const STATUS_COLORS: Record<OutletStatus | UserStatus, string> = {
  active: '#2D8A4E',
  inactive: '#F0AD4E',
  suspended: '#E23744',
  disabled: '#E23744',
};

// ================================
// Customer Experience Types
// ================================

export interface LoyaltyReward {
  id: string;
  title: string;
  pointsRequired: number;
  description: string;
  icon: string;
}

export interface Address {
  id: string;
  label: string; // Home, Work, etc.
  addressLine: string;
  city: string;
  isDefault: boolean;
}

export interface CustomerProfile extends UserProfile {
  points: number;
  savedAddresses: Address[];
}

export const LOYALTY_REWARDS: LoyaltyReward[] = [
  { id: '1', title: 'Free Coffee', pointsRequired: 100, description: 'Get any regular hot coffee for free', icon: '☕' },
  { id: '2', title: '₹50 Off', pointsRequired: 200, description: 'Flat discount on your next order', icon: '💰' },
  { id: '3', title: 'Free Cold Coffee', pointsRequired: 300, description: 'Get a premium cold coffee for free', icon: '🥤' },
];
