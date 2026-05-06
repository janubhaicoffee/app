export type UserRole = 
  | 'customer' 
  | 'employee' 
  | 'kitchen' 
  | 'cashier' 
  | 'manager' 
  | 'outlet_owner' 
  | 'regional_admin' 
  | 'superadmin' 
  | 'franchise_applicant';

export interface UserProfile {
  id: string;
  role: UserRole;
  outlet_id?: string;
  city?: string;
  full_name: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  customer: ['order_view', 'track_order', 'profile_edit'],
  employee: ['pos_access', 'order_create', 'order_view'],
  kitchen: ['kitchen_view', 'order_status_update'],
  cashier: ['pos_access', 'payment_reconcile'],
  manager: ['finance_view', 'expense_add', 'inventory_manage', 'staff_manage'],
  outlet_owner: ['finance_full_view', 'outlet_analytics'],
  regional_admin: ['city_analytics', 'outlet_oversight'],
  superadmin: ['all_access', 'outlet_approval', 'franchise_review', 'global_finance'],
  franchise_applicant: ['application_status_view']
};

export const ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Loyal Customer',
  employee: 'Service Associate',
  kitchen: 'Kitchen Ninja',
  cashier: 'Terminal Lead',
  manager: 'Outlet Manager',
  outlet_owner: 'Franchise Partner',
  regional_admin: 'Regional Admin',
  superadmin: 'Global HQ',
  franchise_applicant: 'Partner Applicant'
};
