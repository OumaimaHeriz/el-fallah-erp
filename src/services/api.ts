import { 
  Farm, Commerce, Transaction, Worker, AttendanceLog, 
  WorkerPayment, Client, ClientPurchase, DashboardStats 
} from '../types';

// Declaration for window.electronAPI
declare global {
  interface Window {
    electronAPI?: {
      getDashboardStats: () => Promise<DashboardStats>;
      getFarms: () => Promise<Farm[]>;
      addFarm: (farm: Omit<Farm, 'id'>) => Promise<Farm>;
      updateFarm: (farm: Farm) => Promise<Farm>;
      deleteFarm: (id: number) => Promise<boolean>;

      getCommerces: () => Promise<Commerce[]>;
      addCommerce: (commerce: Omit<Commerce, 'id'>) => Promise<Commerce>;
      updateCommerce: (commerce: Commerce) => Promise<Commerce>;
      deleteCommerce: (id: number) => Promise<boolean>;

      getTransactions: () => Promise<Transaction[]>;
      addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction>;
      deleteTransaction: (id: number) => Promise<boolean>;

      getWorkers: () => Promise<Worker[]>;
      addWorker: (worker: Omit<Worker, 'id'>) => Promise<Worker>;
      updateWorker: (worker: Worker) => Promise<Worker>;
      deleteWorker: (id: number) => Promise<boolean>;

      getAttendanceLogs: (date?: string) => Promise<AttendanceLog[]>;
      recordAttendance: (log: Omit<AttendanceLog, 'id'>) => Promise<AttendanceLog>;

      addWorkerPayment: (payment: Omit<WorkerPayment, 'id'>) => Promise<WorkerPayment>;
      getWorkerPayments: (workerId?: number) => Promise<WorkerPayment[]>;
      verifyKioskPin: (pinCode: string) => Promise<Worker | null>;

      getClients: () => Promise<Client[]>;
      addClient: (client: Omit<Client, 'id'>) => Promise<Client>;
      updateClient: (client: Client) => Promise<Client>;
      deleteClient: (id: number) => Promise<boolean>;

      getClientPurchases: (clientId: number) => Promise<ClientPurchase[]>;
      addClientPurchase: (purchase: Omit<ClientPurchase, 'id'>) => Promise<ClientPurchase>;
      payClientDebt: (purchaseId: number, amount: number) => Promise<boolean>;
    };
  }
}

// Fallback in-memory state if loaded outside Electron (e.g. standard browser preview)
let mockFarms: Farm[] = [
  { id: 1, name: 'واحة طولقة الكبرى - حوش بن زعمية', location: 'طولقة - بسكرة', date_variety: 'دقلة نور ممتازة', palm_count: 1200, status: 'HARVESTING', total_income: 2500000, total_expenses: 128000, net_profit: 2372000 },
  { id: 2, name: 'مزرعة عين بن نوي - النخيل الذهبي', location: 'عين بن نوي - بسكرة', date_variety: 'دقلة نور + غرس', palm_count: 850, status: 'ACTIVE', total_income: 600000, total_expenses: 45000, net_profit: 555000 }
];

let mockCommerces: Commerce[] = [
  { id: 1, name: 'مؤسسة الفلاح لتصدير التمور', market_name: 'سوق الجملة طولقة', kg_price: 680, capacity_kg: 50000, status: 'ACTIVE', total_sales: 3500000, total_expenses: 45000 },
  { id: 2, name: 'محل البركة لتجارة تمور الدقلة', market_name: 'سوق بسكرة المركزي', kg_price: 750, capacity_kg: 15000, status: 'ACTIVE', total_sales: 900000, total_expenses: 0 }
];

let mockWorkers: Worker[] = [
  { id: 1, name: 'العميد عبد القادر بن عيسى', role: 'مشرف المزرعة والجناء', phone: '0661234567', daily_rate: 4000, pin_code: '1234', status: 'ACTIVE', total_days_worked: 22, total_advances: 0, total_earned: 88000, remaining_payout: 88000 },
  { id: 2, name: 'كمال طاهري', role: 'جناء / قطاف نخيل', phone: '0662987654', daily_rate: 3500, pin_code: '1111', status: 'ACTIVE', total_days_worked: 18, total_advances: 5000, total_earned: 63000, remaining_payout: 58000 },
  { id: 3, name: 'ياسين زروقي', role: 'سقي وخدمة الأرض', phone: '0555112233', daily_rate: 3000, pin_code: '2222', status: 'ACTIVE', total_days_worked: 20, total_advances: 3000, total_earned: 60000, remaining_payout: 57000 },
  { id: 4, name: 'فاطمة فرجاني', role: 'توضيب وتغليف التمور', phone: '0770998877', daily_rate: 2800, pin_code: '3333', status: 'ACTIVE', total_days_worked: 15, total_advances: 0, total_earned: 42000, remaining_payout: 42000 }
];

let mockClients: Client[] = [
  { id: 1, name: 'شركة التاج لتوزيع التمور (العاصمة)', phone: '0661998877', address: 'الشراقة - الجزائر العاصمة', notes: 'زبون ممتاز لطلب الكميات الكبيرة', total_purchases: 3500000, total_paid: 2500000, balance: 1000000 },
  { id: 2, name: 'الحاج بلعمراني مصطفى (وهران)', phone: '0550443322', address: 'حي الكورنيش، وهران', notes: 'تاجر جملة تمور الفرانك والتصدير', total_purchases: 900000, total_paid: 600000, balance: 300000 }
];

let mockTransactions: Transaction[] = [
  { id: 1, type: 'INCOME', category: 'مبيعات تمور', amount: 2500000, description: 'دفعة من زبون شركة التاج - تمور دقلة نور', date: new Date().toISOString().split('T')[0], farm_name: 'واحة طولقة الكبرى', commerce_name: 'مؤسسة الفلاح', client_name: 'شركة التاج' },
  { id: 2, type: 'INCOME', category: 'مبيعات تمور', amount: 600000, description: 'دفعة نقدية زبون الحاج بلعمراني - تمور غرس', date: new Date().toISOString().split('T')[0], farm_name: 'مزرعة عين بن نوي', commerce_name: 'محل البركة', client_name: 'الحاج بلعمراني' },
  { id: 3, type: 'EXPENSE', category: 'أجور عمال', amount: 8000, description: 'تسبيقات عمال (كمال + ياسين)', date: new Date().toISOString().split('T')[0], worker_name: 'كمال طاهري' },
  { id: 4, type: 'EXPENSE', category: 'أسمدة ومواد', amount: 120000, description: 'شراء أسمدة عضوي ومبادات سوسة النخيل', date: new Date().toISOString().split('T')[0], farm_name: 'واحة طولقة الكبرى' }
];

let mockPurchases: ClientPurchase[] = [
  { id: 1, client_id: 1, date: new Date().toISOString().split('T')[0], item_description: '50 قنطار تمور دقلة نور طولقة درجة أولى', weight_kg: 5000, unit_price: 700, total_amount: 3500000, paid_amount: 2500000, remaining_amount: 1000000, client_name: 'شركة التاج لتوزيع التمور' },
  { id: 2, client_id: 2, date: new Date().toISOString().split('T')[0], item_description: '20 قنطار تمور غرس ممتازة للمصانع', weight_kg: 2000, unit_price: 450, total_amount: 900000, paid_amount: 600000, remaining_amount: 300000, client_name: 'الحاج بلعمراني مصطفى' }
];

export const api = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    if (window.electronAPI) return window.electronAPI.getDashboardStats();
    return {
      total_income: 3100000,
      total_expenses: 173000,
      net_profit: 2927000,
      active_workers: mockWorkers.length,
      total_farms: mockFarms.length,
      total_palms: 2500,
      total_client_debt: 1300000,
      recent_transactions: mockTransactions,
      monthly_flow: [
        { month: 'أفريل', income: 450000, expense: 180000 },
        { month: 'ماي', income: 620000, expense: 210000 },
        { month: 'جوان', income: 800000, expense: 300000 },
        { month: 'جويلية', income: 1100000, expense: 420000 },
        { month: 'أوت', income: 1850000, expense: 550000 },
        { month: 'سبتمبر', income: 3100000, expense: 173000 }
      ]
    };
  },

  // Farms
  getFarms: async (): Promise<Farm[]> => {
    if (window.electronAPI) return window.electronAPI.getFarms();
    return mockFarms;
  },
  addFarm: async (farm: Omit<Farm, 'id'>): Promise<Farm> => {
    if (window.electronAPI) return window.electronAPI.addFarm(farm);
    const newFarm = { id: Date.now(), ...farm, total_income: 0, total_expenses: 0, net_profit: 0 };
    mockFarms.push(newFarm);
    return newFarm;
  },
  updateFarm: async (farm: Farm): Promise<Farm> => {
    if (window.electronAPI) return window.electronAPI.updateFarm(farm);
    mockFarms = mockFarms.map(f => f.id === farm.id ? farm : f);
    return farm;
  },
  deleteFarm: async (id: number): Promise<boolean> => {
    if (window.electronAPI) return window.electronAPI.deleteFarm(id);
    mockFarms = mockFarms.filter(f => f.id !== id);
    return true;
  },

  // Commerces
  getCommerces: async (): Promise<Commerce[]> => {
    if (window.electronAPI) return window.electronAPI.getCommerces();
    return mockCommerces;
  },
  addCommerce: async (commerce: Omit<Commerce, 'id'>): Promise<Commerce> => {
    if (window.electronAPI) return window.electronAPI.addCommerce(commerce);
    const newComm = { id: Date.now(), ...commerce, total_sales: 0, total_expenses: 0 };
    mockCommerces.push(newComm);
    return newComm;
  },
  updateCommerce: async (commerce: Commerce): Promise<Commerce> => {
    if (window.electronAPI) return window.electronAPI.updateCommerce(commerce);
    mockCommerces = mockCommerces.map(c => c.id === commerce.id ? commerce : c);
    return commerce;
  },
  deleteCommerce: async (id: number): Promise<boolean> => {
    if (window.electronAPI) return window.electronAPI.deleteCommerce(id);
    mockCommerces = mockCommerces.filter(c => c.id !== id);
    return true;
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    if (window.electronAPI) return window.electronAPI.getTransactions();
    return mockTransactions;
  },
  addTransaction: async (t: Omit<Transaction, 'id'>): Promise<Transaction> => {
    if (window.electronAPI) return window.electronAPI.addTransaction(t);
    const newTx = { id: Date.now(), ...t };
    mockTransactions.unshift(newTx);
    return newTx;
  },
  deleteTransaction: async (id: number): Promise<boolean> => {
    if (window.electronAPI) return window.electronAPI.deleteTransaction(id);
    mockTransactions = mockTransactions.filter(t => t.id !== id);
    return true;
  },

  // Workers
  getWorkers: async (): Promise<Worker[]> => {
    if (window.electronAPI) return window.electronAPI.getWorkers();
    return mockWorkers;
  },
  addWorker: async (w: Omit<Worker, 'id'>): Promise<Worker> => {
    if (window.electronAPI) return window.electronAPI.addWorker(w);
    const newW = { id: Date.now(), ...w, total_days_worked: 0, total_advances: 0, total_earned: 0, remaining_payout: 0 };
    mockWorkers.push(newW);
    return newW;
  },
  updateWorker: async (w: Worker): Promise<Worker> => {
    if (window.electronAPI) return window.electronAPI.updateWorker(w);
    mockWorkers = mockWorkers.map(item => item.id === w.id ? w : item);
    return w;
  },
  deleteWorker: async (id: number): Promise<boolean> => {
    if (window.electronAPI) return window.electronAPI.deleteWorker(id);
    mockWorkers = mockWorkers.filter(w => w.id !== id);
    return true;
  },

  getAttendanceLogs: async (date?: string): Promise<AttendanceLog[]> => {
    if (window.electronAPI) return window.electronAPI.getAttendanceLogs(date);
    return [];
  },
  recordAttendance: async (log: Omit<AttendanceLog, 'id'>): Promise<AttendanceLog> => {
    if (window.electronAPI) return window.electronAPI.recordAttendance(log);
    return { id: Date.now(), ...log };
  },

  addWorkerPayment: async (payment: Omit<WorkerPayment, 'id'>): Promise<WorkerPayment> => {
    if (window.electronAPI) return window.electronAPI.addWorkerPayment(payment);
    return { id: Date.now(), ...payment };
  },
  getWorkerPayments: async (workerId?: number): Promise<WorkerPayment[]> => {
    if (window.electronAPI) return window.electronAPI.getWorkerPayments(workerId);
    return [];
  },
  verifyKioskPin: async (pin: string): Promise<Worker | null> => {
    if (window.electronAPI) return window.electronAPI.verifyKioskPin(pin);
    return mockWorkers.find(w => w.pin_code === pin) || null;
  },

  // Clients
  getClients: async (): Promise<Client[]> => {
    if (window.electronAPI) return window.electronAPI.getClients();
    return mockClients;
  },
  addClient: async (c: Omit<Client, 'id'>): Promise<Client> => {
    if (window.electronAPI) return window.electronAPI.addClient(c);
    const newC = { id: Date.now(), ...c, total_purchases: 0, total_paid: 0, balance: 0 };
    mockClients.push(newC);
    return newC;
  },
  updateClient: async (c: Client): Promise<Client> => {
    if (window.electronAPI) return window.electronAPI.updateClient(c);
    mockClients = mockClients.map(item => item.id === c.id ? c : item);
    return c;
  },
  deleteClient: async (id: number): Promise<boolean> => {
    if (window.electronAPI) return window.electronAPI.deleteClient(id);
    mockClients = mockClients.filter(c => c.id !== id);
    return true;
  },

  getClientPurchases: async (clientId: number): Promise<ClientPurchase[]> => {
    if (window.electronAPI) return window.electronAPI.getClientPurchases(clientId);
    return mockPurchases.filter(p => p.client_id === clientId);
  },
  addClientPurchase: async (p: Omit<ClientPurchase, 'id'>): Promise<ClientPurchase> => {
    if (window.electronAPI) return window.electronAPI.addClientPurchase(p);
    const total = p.weight_kg * p.unit_price;
    const remaining = total - p.paid_amount;
    const newP = { id: Date.now(), ...p, total_amount: total, remaining_amount: remaining > 0 ? remaining : 0 };
    mockPurchases.unshift(newP);
    return newP;
  },
  payClientDebt: async (purchaseId: number, amount: number): Promise<boolean> => {
    if (window.electronAPI) return window.electronAPI.payClientDebt(purchaseId, amount);
    const p = mockPurchases.find(item => item.id === purchaseId);
    if (p) {
      p.paid_amount += amount;
      p.remaining_amount = Math.max(0, p.total_amount - p.paid_amount);
    }
    return true;
  }
};
