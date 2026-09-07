export type Language = 'ar' | 'fr';
export type TransactionType = 'INCOME' | 'EXPENSE';
export interface Farm {
    id?: number;
    name: string;
    location: string;
    date_variety: string;
    palm_count: number;
    status: 'ACTIVE' | 'MAINTENANCE' | 'HARVESTING';
    created_at?: string;
    total_income?: number;
    total_expenses?: number;
    net_profit?: number;
}
export interface Commerce {
    id?: number;
    name: string;
    market_name: string;
    kg_price: number;
    capacity_kg: number;
    status: 'ACTIVE' | 'CLOSED' | 'SEASONAL';
    created_at?: string;
    total_sales?: number;
    total_expenses?: number;
}
export interface Transaction {
    id?: number;
    type: TransactionType;
    category: string;
    amount: number;
    description: string;
    date: string;
    farm_id?: number | null;
    commerce_id?: number | null;
    client_id?: number | null;
    worker_id?: number | null;
    created_at?: string;
    farm_name?: string;
    commerce_name?: string;
    client_name?: string;
    worker_name?: string;
}
export interface Worker {
    id?: number;
    name: string;
    role: string;
    phone: string;
    daily_rate: number;
    pin_code: string;
    status: 'ACTIVE' | 'INACTIVE';
    created_at?: string;
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
    total_purchases?: number;
    total_paid?: number;
    balance?: number;
}
export interface ClientPurchase {
    id?: number;
    client_id: number;
    date: string;
    item_description: string;
    weight_kg: number;
    unit_price: number;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    notes?: string;
    created_at?: string;
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
    monthly_flow: Array<{
        month: string;
        income: number;
        expense: number;
    }>;
}
