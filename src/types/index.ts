export type Language = 'ar' | 'fr';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Farm {
  id?: number;
  name: string;
  location: string;
  date_variety: string; // دقلة نور, غرس, مش دقلة...
  palm_count: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'HARVESTING';
  created_at?: string;
  // Computed fields from queries
  total_income?: number;
  total_expenses?: number;
  net_profit?: number;
}

export interface Commerce {
  id?: number;
  name: string;
  market_name: string; // سوق طولقة للجملة, سوق بسكرة...
  kg_price: number;
  capacity_kg: number;
  status: 'ACTIVE' | 'CLOSED' | 'SEASONAL';
  created_at?: string;
  // Computed
  total_sales?: number;
  total_expenses?: number;
}

export interface Transaction {
  id?: number;
  type: TransactionType;
  category: string; // مبيعات تمور, صيانة مزرعة, أجور عمال, أسمدة ومواد, نقل وتخزين, آخر
  amount: number;
  description: string;
  date: string;
  farm_id?: number | null;
  commerce_id?: number | null;
  client_id?: number | null;
  worker_id?: number | null;
  created_at?: string;
  // Related entity names for quick display
  farm_name?: string;
  commerce_name?: string;
  client_name?: string;
  worker_name?: string;
}

export interface Worker {
  id?: number;
  name: string;
  role: string; // جناء / قطاف, سقي وخدمة, توضيب وتغليف, سائق, مشرف
  phone: string;
  daily_rate: number; // DZD
  pin_code: string; // 4 digits PIN for Kiosk
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
  // Computed fields
  total_days_worked?: number;
  total_advances?: number;
  total_earned?: number;
  remaining_payout?: number;
}

export interface AttendanceLog {
  id?: number;
  worker_id: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY';
  farm_id?: number | null;
  commerce_id?: number | null;
  notes?: string;
  created_at?: string;
  // Joined
  worker_name?: string;
  worker_role?: string;
  daily_rate?: number;
  farm_name?: string;
  commerce_name?: string;
}

export interface WorkerPayment {
  id?: number;
  worker_id: number;
  amount: number;
  payment_type: 'ADVANCE' | 'FINAL';
  payment_date: string;
  notes?: string;
  created_at?: string;
  // Joined
  worker_name?: string;
  worker_role?: string;
}

export interface Client {
  id?: number;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  created_at?: string;
  // Computed
  total_purchases?: number;
  total_paid?: number;
  balance?: number; // الكريدي المتبقي
}

export interface ClientPurchase {
  id?: number;
  client_id: number;
  date: string;
  item_description: string; // مثلاً: 50 قنطار دقلة نور ممتاز
  weight_kg: number;
  unit_price: number; // price per kg in DZD
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  notes?: string;
  created_at?: string;
  // Joined
  client_name?: string;
  client_phone?: string;
}

export interface DashboardStats {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  active_workers: number;
  total_farms: number;
  total_palms: number;
  total_client_debt: number;
  recent_transactions: Transaction[];
  monthly_flow: Array<{ month: string; income: number; expense: number }>;
}
