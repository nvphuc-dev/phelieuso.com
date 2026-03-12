export interface User {
  id: number;
  tenant_id: number;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'employee';
  status: 'active' | 'inactive';
  avatar?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: number;
  name: string;
  email: string;
  phone?: string;
  slug: string;
  status: string;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  type: 'seller' | 'buyer';
  note?: string;
  bonus_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: number;
  name: string;
  unit: string;
  default_purchase_price?: number | null;
  default_sale_price?: number | null;
  description?: string;
  created_at: string;
}

export interface PurchaseItem {
  id: number;
  material: Material;
  weight: number;
  price_per_unit: number;
  total: number;
  note?: string;
}

export interface PurchaseOrder {
  id: number;
  date: string;
  time: string;
  total_amount: number;
  status: 'completed' | 'cancelled';
  note?: string;
  customer: Customer;
  created_by: User;
  items?: PurchaseItem[];
  created_at: string;
  updated_at: string;
}

export interface SalesItem {
  id: number;
  material: Material;
  weight: number;
  price_per_unit: number;
  total: number;
  note?: string;
}

export interface SalesOrder {
  id: number;
  date: string;
  time: string;
  total_amount: number;
  status: 'completed' | 'cancelled';
  note?: string;
  customer: Customer;
  created_by: User;
  items?: SalesItem[];
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id: number;
  material: Material;
  total_weight: number;
  updated_at: string;
}

export interface DashboardReport {
  period: { from: string; to: string };
  purchases: { count: number; total: number };
  sales: { count: number; total: number };
  profit_estimation: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface CustomerMonthlyRevenue {
  customer_id: number;
  customer_name: string;
  customer_phone?: string;
  bonus_rate: number;
  months: Record<number, { total: number; count: number }>;
  annual_total: number;
  bonus_amount: number;
}

export interface CustomerBonusRow {
  customer_id: number;
  customer_name: string;
  customer_phone?: string;
  bonus_rate: number;
  order_count: number;
  annual_total: number;
  bonus_amount: number;
}

export interface UserSalary {
  id: number;
  user_id: number;
  month: string;
  base_salary: number;
  working_days: number;
  paid_leave_days: number;
  absent_days: number;
  bonus: number;
  note?: string;
  daily_rate: number;
  net_salary: number;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
