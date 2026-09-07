import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { 
  Farm, Commerce, Transaction, Worker, AttendanceLog, 
  WorkerPayment, Client, ClientPurchase, DashboardStats 
} from '../types';

let db: Database.Database | null = null;

export function initDatabase(dbPath?: string): Database.Database {
  if (db) return db;

  const finalPath = dbPath || path.join(process.cwd(), 'el_fallah_erp.db');
  console.log('Initializing SQLite Database at:', finalPath);

  // Ensure directory exists
  const dir = path.dirname(finalPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(finalPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  createTables(db);
  seedInitialData(db);

  return db;
}

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized! Call initDatabase first.');
  }
  return db;
}

function createTables(database: Database.Database) {
  const schemaSql = `
    CREATE TABLE IF NOT EXISTS farms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      date_variety TEXT NOT NULL DEFAULT 'دقلة نور',
      palm_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS commerces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      market_name TEXT NOT NULL,
      kg_price REAL NOT NULL DEFAULT 0,
      capacity_kg REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS workers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT NOT NULL,
      daily_rate REAL NOT NULL DEFAULT 0,
      pin_code TEXT NOT NULL DEFAULT '0000',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attendance_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PRESENT',
      farm_id INTEGER,
      commerce_id INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
      FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL,
      FOREIGN KEY (commerce_id) REFERENCES commerces(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS worker_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_type TEXT NOT NULL DEFAULT 'ADVANCE',
      payment_date TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS client_purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      item_description TEXT NOT NULL,
      weight_kg REAL NOT NULL DEFAULT 0,
      unit_price REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL DEFAULT 0,
      paid_amount REAL NOT NULL DEFAULT 0,
      remaining_amount REAL NOT NULL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      farm_id INTEGER,
      commerce_id INTEGER,
      client_id INTEGER,
      worker_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL,
      FOREIGN KEY (commerce_id) REFERENCES commerces(id) ON DELETE SET NULL,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE SET NULL
    );
  `;
  database.exec(schemaSql);
}

function seedInitialData(database: Database.Database) {
  const farmCount = database.prepare('SELECT COUNT(*) as count FROM farms').get() as { count: number };
  if (farmCount.count > 0) return; // Already seeded

  console.log('Seeding initial Algerian date farm & commerce data...');

  const today = new Date().toISOString().split('T')[0];

  // 1. Seed Farms
  const insertFarm = database.prepare(
    `INSERT INTO farms (name, location, date_variety, palm_count, status) VALUES (?, ?, ?, ?, ?)`
  );
  insertFarm.run('واحة طولقة الكبرى - حوش بن زعمية', 'طولقة - ولاية بسكرة', 'دقلة نور ممتازة', 1200, 'HARVESTING');
  insertFarm.run('مزرعة عين بن نوي - النخيل الذهبي', 'عين بن نوي - بسكرة', 'دقلة نور + غرس', 850, 'ACTIVE');
  insertFarm.run('واحة سيدي عقبة الشرقية', 'سيدي عقبة', 'مش دقلة + حمراية', 450, 'ACTIVE');

  // 2. Seed Commerces
  const insertCommerce = database.prepare(
    `INSERT INTO commerces (name, market_name, kg_price, capacity_kg, status) VALUES (?, ?, ?, ?, ?)`
  );
  insertCommerce.run('مؤسسة الفلاح لتصدير التمور', 'سوق الجملة طولقة', 680, 50000, 'ACTIVE');
  insertCommerce.run('محل البركة لتجارة تمور الدقلة', 'سوق بسكرة المركزي', 750, 15000, 'ACTIVE');

  // 3. Seed Workers
  const insertWorker = database.prepare(
    `INSERT INTO workers (name, role, phone, daily_rate, pin_code, status) VALUES (?, ?, ?, ?, ?, ?)`
  );
  insertWorker.run('العميد عبد القادر بن عيسى', 'مشرف المزرعة والجناء', '0661234567', 4000, '1234', 'ACTIVE');
  insertWorker.run('كمال طاهري', 'جناء / قطاف نخيل', '0662987654', 3500, '1111', 'ACTIVE');
  insertWorker.run('ياسين زروقي', 'سقي وخدمة الأرض', '0555112233', 3000, '2222', 'ACTIVE');
  insertWorker.run('فاطمة فرجاني', 'توضيب وتغليف التمور', '0770998877', 2800, '3333', 'ACTIVE');

  // 4. Seed Attendance
  const insertAttendance = database.prepare(
    `INSERT INTO attendance_logs (worker_id, date, status, farm_id, notes) VALUES (?, ?, ?, ?, ?)`
  );
  insertAttendance.run(1, today, 'PRESENT', 1, 'إشراف على جني العراجين');
  insertAttendance.run(2, today, 'PRESENT', 1, 'جني 45 عرجون دقلة نور');
  insertAttendance.run(3, today, 'PRESENT', 2, 'تنظيف شبكات السقي بالتقطير');
  insertAttendance.run(4, today, 'HALF_DAY', 1, 'توضيب صلب التمور المعد للتصدير');

  // 5. Seed Worker Payments
  const insertPayment = database.prepare(
    `INSERT INTO worker_payments (worker_id, amount, payment_type, payment_date, notes) VALUES (?, ?, ?, ?, ?)`
  );
  insertPayment.run(2, 5000, 'ADVANCE', today, 'تسبيق (أفونس) لمصاريف عائلية');
  insertPayment.run(3, 3000, 'ADVANCE', today, 'أفونس شراء البذور');

  // 6. Seed Clients
  const insertClient = database.prepare(
    `INSERT INTO clients (name, phone, address, notes) VALUES (?, ?, ?, ?)`
  );
  insertClient.run('شركة التاج لتوزيع التمور (العاصمة)', '0661998877', 'المدينة الجديدة، الشراقة - الجزائر العاصمة', 'زبون ممتاز لطلب الكميات الكبيرة');
  insertClient.run('الحاج بلعمراني مصطفى (وهران)', '0550443322', 'حي الكورنيش، وهران', 'تاجر جملة تمور الفرانك والتصدير');
  insertClient.run('مؤسسة تمور الأوراس (باتنة)', '0771223344', 'طريق قسنطينة، باتنة', 'طلب تمور الغرس والمش دقلة');

  // 7. Seed Client Purchases
  const insertPurchase = database.prepare(
    `INSERT INTO client_purchases (client_id, date, item_description, weight_kg, unit_price, total_amount, paid_amount, remaining_amount, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  // Total: 5000kg * 700 DZD = 3,500,000 DZD. Paid: 2,500,000. Debt: 1,000,000 DZD.
  insertPurchase.run(1, today, '50 قنطار تمور دقلة نور طولقة درجة أولى', 5000, 700, 3500000, 2500000, 1000000, 'تم تسليم الشحنة عبر شاحنة تبريد');
  insertPurchase.run(2, today, '20 قنطار تمور غرس ممتازة للمصانع', 2000, 450, 900000, 600000, 300000, 'عربون مدفوع نقدًا');

  // 8. Seed Transactions
  const insertTransaction = database.prepare(
    `INSERT INTO transactions (type, category, amount, description, date, farm_id, commerce_id, client_id, worker_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  insertTransaction.run('INCOME', 'مبيعات تمور', 2500000, 'دفعة من زبون شركة التاج - تمور دقلة نور', today, 1, 1, 1, null);
  insertTransaction.run('INCOME', 'مبيعات تمور', 600000, 'دفعة نقدية زبون الحاج بلعمراني - تمور غرس', today, 1, 2, 2, null);
  insertTransaction.run('EXPENSE', 'أجور عمال', 8000, 'تسبيقات عمال (كمال + ياسين)', today, 1, null, null, 2);
  insertTransaction.run('EXPENSE', 'أسمدة ومواد', 120000, 'شراء أسمدة عضوي ومبادات سوسة النخيل', today, 1, null, null, null);
  insertTransaction.run('EXPENSE', 'نقل وتخزين', 45000, 'مصاريف وقود شاحنة النقل وكراء غرفة التبريد', today, null, 1, null, null);

  console.log('Seed completed successfully!');
}

// ----------------------------------------------------
// DATABASE API IMPLEMENTATION (DIRECT CRUD QUERIES)
// ----------------------------------------------------

export const dbService = {
  // --- DASHBOARD ---
  getDashboardStats(): DashboardStats {
    const database = getDb();

    const income = (database.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'INCOME'").get() as any).total;
    const expense = (database.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'EXPENSE'").get() as any).total;
    const activeWorkers = (database.prepare("SELECT COUNT(*) as count FROM workers WHERE status = 'ACTIVE'").get() as any).count;
    const totalFarms = (database.prepare("SELECT COUNT(*) as count FROM farms").get() as any).count;
    const totalPalms = (database.prepare("SELECT COALESCE(SUM(palm_count), 0) as total FROM farms").get() as any).total;
    const totalDebt = (database.prepare("SELECT COALESCE(SUM(remaining_amount), 0) as total FROM client_purchases").get() as any).total;

    const recentTransactions = database.prepare(`
      SELECT t.*, f.name as farm_name, c.name as commerce_name, cl.name as client_name
      FROM transactions t
      LEFT JOIN farms f ON t.farm_id = f.id
      LEFT JOIN commerces c ON t.commerce_id = c.id
      LEFT JOIN clients cl ON t.client_id = cl.id
      ORDER BY t.id DESC LIMIT 6
    `).all() as Transaction[];

    // Monthly flow data for chart
    const monthlyFlow = [
      { month: 'أفريل', income: 450000, expense: 180000 },
      { month: 'ماي', income: 620000, expense: 210000 },
      { month: 'جوان', income: 800000, expense: 300000 },
      { month: 'جويلية', income: 1100000, expense: 420000 },
      { month: 'أوت', income: 1850000, expense: 550000 },
      { month: 'سبتمبر', income: income > 0 ? income : 3100000, expense: expense > 0 ? expense : 173000 }
    ];

    return {
      total_income: income,
      total_expenses: expense,
      net_profit: income - expense,
      active_workers: activeWorkers,
      total_farms: totalFarms,
      total_palms: totalPalms,
      total_client_debt: totalDebt,
      recent_transactions: recentTransactions,
      monthly_flow: monthlyFlow
    };
  },

  // --- FARMS ---
  getFarms(): Farm[] {
    const database = getDb();
    const farms = database.prepare(`
      SELECT f.*,
        COALESCE((SELECT SUM(amount) FROM transactions WHERE farm_id = f.id AND type = 'INCOME'), 0) as total_income,
        COALESCE((SELECT SUM(amount) FROM transactions WHERE farm_id = f.id AND type = 'EXPENSE'), 0) as total_expenses
      FROM farms f ORDER BY f.id DESC
    `).all() as Farm[];
    
    return farms.map(f => ({
      ...f,
      net_profit: (f.total_income || 0) - (f.total_expenses || 0)
    }));
  },

  addFarm(farm: Omit<Farm, 'id'>): Farm {
    const database = getDb();
    const stmt = database.prepare(
      `INSERT INTO farms (name, location, date_variety, palm_count, status) VALUES (?, ?, ?, ?, ?)`
    );
    const info = stmt.run(farm.name, farm.location, farm.date_variety, farm.palm_count, farm.status || 'ACTIVE');
    return { id: info.lastInsertRowid as number, ...farm };
  },

  updateFarm(farm: Farm): Farm {
    const database = getDb();
    const stmt = database.prepare(
      `UPDATE farms SET name = ?, location = ?, date_variety = ?, palm_count = ?, status = ? WHERE id = ?`
    );
    stmt.run(farm.name, farm.location, farm.date_variety, farm.palm_count, farm.status, farm.id);
    return farm;
  },

  deleteFarm(id: number): boolean {
    const database = getDb();
    database.prepare(`DELETE FROM farms WHERE id = ?`).run(id);
    return true;
  },

  // --- COMMERCS ---
  getCommerces(): Commerce[] {
    const database = getDb();
    return database.prepare(`
      SELECT c.*,
        COALESCE((SELECT SUM(amount) FROM transactions WHERE commerce_id = c.id AND type = 'INCOME'), 0) as total_sales,
        COALESCE((SELECT SUM(amount) FROM transactions WHERE commerce_id = c.id AND type = 'EXPENSE'), 0) as total_expenses
      FROM commerces c ORDER BY c.id DESC
    `).all() as Commerce[];
  },

  addCommerce(commerce: Omit<Commerce, 'id'>): Commerce {
    const database = getDb();
    const stmt = database.prepare(
      `INSERT INTO commerces (name, market_name, kg_price, capacity_kg, status) VALUES (?, ?, ?, ?, ?)`
    );
    const info = stmt.run(commerce.name, commerce.market_name, commerce.kg_price, commerce.capacity_kg, commerce.status || 'ACTIVE');
    return { id: info.lastInsertRowid as number, ...commerce };
  },

  updateCommerce(commerce: Commerce): Commerce {
    const database = getDb();
    const stmt = database.prepare(
      `UPDATE commerces SET name = ?, market_name = ?, kg_price = ?, capacity_kg = ?, status = ? WHERE id = ?`
    );
    stmt.run(commerce.name, commerce.market_name, commerce.kg_price, commerce.capacity_kg, commerce.status, commerce.id);
    return commerce;
  },

  deleteCommerce(id: number): boolean {
    const database = getDb();
    database.prepare(`DELETE FROM commerces WHERE id = ?`).run(id);
    return true;
  },

  // --- TRANSACTIONS ---
  getTransactions(): Transaction[] {
    const database = getDb();
    return database.prepare(`
      SELECT t.*, f.name as farm_name, c.name as commerce_name, cl.name as client_name, w.name as worker_name
      FROM transactions t
      LEFT JOIN farms f ON t.farm_id = f.id
      LEFT JOIN commerces c ON t.commerce_id = c.id
      LEFT JOIN clients cl ON t.client_id = cl.id
      LEFT JOIN workers w ON t.worker_id = w.id
      ORDER BY t.id DESC
    `).all() as Transaction[];
  },

  addTransaction(t: Omit<Transaction, 'id'>): Transaction {
    const database = getDb();
    const stmt = database.prepare(
      `INSERT INTO transactions (type, category, amount, description, date, farm_id, commerce_id, client_id, worker_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const info = stmt.run(
      t.type, t.category, t.amount, t.description, t.date,
      t.farm_id || null, t.commerce_id || null, t.client_id || null, t.worker_id || null
    );
    return { id: info.lastInsertRowid as number, ...t };
  },

  deleteTransaction(id: number): boolean {
    const database = getDb();
    database.prepare(`DELETE FROM transactions WHERE id = ?`).run(id);
    return true;
  },

  // --- WORKERS & ATTENDANCE & PAYROLL ---
  getWorkers(): Worker[] {
    const database = getDb();
    const workers = database.prepare(`
      SELECT w.*,
        (SELECT COUNT(*) FROM attendance_logs WHERE worker_id = w.id AND status = 'PRESENT') as full_days,
        (SELECT COUNT(*) FROM attendance_logs WHERE worker_id = w.id AND status = 'HALF_DAY') as half_days,
        COALESCE((SELECT SUM(amount) FROM worker_payments WHERE worker_id = w.id), 0) as total_advances
      FROM workers w ORDER BY w.id DESC
    `).all() as any[];

    return workers.map(w => {
      const daysWorked = w.full_days + (w.half_days * 0.5);
      const totalEarned = daysWorked * w.daily_rate;
      const remaining = totalEarned - w.total_advances;
      return {
        ...w,
        total_days_worked: daysWorked,
        total_advances: w.total_advances,
        total_earned: totalEarned,
        remaining_payout: remaining > 0 ? remaining : 0
      };
    });
  },

  addWorker(worker: Omit<Worker, 'id'>): Worker {
    const database = getDb();
    const stmt = database.prepare(
      `INSERT INTO workers (name, role, phone, daily_rate, pin_code, status) VALUES (?, ?, ?, ?, ?, ?)`
    );
    const info = stmt.run(worker.name, worker.role, worker.phone, worker.daily_rate, worker.pin_code || '0000', worker.status || 'ACTIVE');
    return { id: info.lastInsertRowid as number, ...worker };
  },

  updateWorker(worker: Worker): Worker {
    const database = getDb();
    const stmt = database.prepare(
      `UPDATE workers SET name = ?, role = ?, phone = ?, daily_rate = ?, pin_code = ?, status = ? WHERE id = ?`
    );
    stmt.run(worker.name, worker.role, worker.phone, worker.daily_rate, worker.pin_code, worker.status, worker.id);
    return worker;
  },

  deleteWorker(id: number): boolean {
    const database = getDb();
    database.prepare(`DELETE FROM workers WHERE id = ?`).run(id);
    return true;
  },

  getAttendanceLogs(date?: string): AttendanceLog[] {
    const database = getDb();
    let query = `
      SELECT a.*, w.name as worker_name, w.role as worker_role, w.daily_rate, f.name as farm_name, c.name as commerce_name
      FROM attendance_logs a
      JOIN workers w ON a.worker_id = w.id
      LEFT JOIN farms f ON a.farm_id = f.id
      LEFT JOIN commerces c ON a.commerce_id = c.id
    `;
    if (date) {
      query += ` WHERE a.date = '${date}'`;
    }
    query += ` ORDER BY a.id DESC`;
    return database.prepare(query).all() as AttendanceLog[];
  },

  recordAttendance(log: Omit<AttendanceLog, 'id'>): AttendanceLog {
    const database = getDb();
    // Check if attendance already exists for worker on this date
    const existing = database.prepare(
      `SELECT id FROM attendance_logs WHERE worker_id = ? AND date = ?`
    ).get(log.worker_id, log.date) as { id: number } | undefined;

    if (existing) {
      database.prepare(
        `UPDATE attendance_logs SET status = ?, farm_id = ?, commerce_id = ?, notes = ? WHERE id = ?`
      ).run(log.status, log.farm_id || null, log.commerce_id || null, log.notes || '', existing.id);
      return { id: existing.id, ...log };
    } else {
      const stmt = database.prepare(
        `INSERT INTO attendance_logs (worker_id, date, status, farm_id, commerce_id, notes) VALUES (?, ?, ?, ?, ?, ?)`
      );
      const info = stmt.run(log.worker_id, log.date, log.status, log.farm_id || null, log.commerce_id || null, log.notes || '');
      return { id: info.lastInsertRowid as number, ...log };
    }
  },

  addWorkerPayment(payment: Omit<WorkerPayment, 'id'>): WorkerPayment {
    const database = getDb();
    const stmt = database.prepare(
      `INSERT INTO worker_payments (worker_id, amount, payment_type, payment_date, notes) VALUES (?, ?, ?, ?, ?)`
    );
    const info = stmt.run(payment.worker_id, payment.amount, payment.payment_type, payment.payment_date, payment.notes || '');

    // Also record transaction expense automatically
    const worker = database.prepare(`SELECT name FROM workers WHERE id = ?`).get(payment.worker_id) as any;
    const workerName = worker ? worker.name : 'عامل';
    database.prepare(
      `INSERT INTO transactions (type, category, amount, description, date, worker_id) VALUES (?, ?, ?, ?, ?, ?)`
    ).run('EXPENSE', 'أجور عمال', payment.amount, `دفعة (${payment.payment_type === 'ADVANCE' ? 'تسبيق/أفونس' : 'تصفية أجر'}) - ${workerName}`, payment.payment_date, payment.worker_id);

    return { id: info.lastInsertRowid as number, ...payment };
  },

  getWorkerPayments(workerId?: number): WorkerPayment[] {
    const database = getDb();
    let query = `
      SELECT p.*, w.name as worker_name, w.role as worker_role
      FROM worker_payments p
      JOIN workers w ON p.worker_id = w.id
    `;
    if (workerId) {
      query += ` WHERE p.worker_id = ${workerId}`;
    }
    query += ` ORDER BY p.id DESC`;
    return database.prepare(query).all() as WorkerPayment[];
  },

  verifyKioskPin(pinCode: string): Worker | null {
    const database = getDb();
    const worker = database.prepare(
      `SELECT * FROM workers WHERE pin_code = ? AND status = 'ACTIVE'`
    ).get(pinCode) as Worker | undefined;
    return worker || null;
  },

  // --- CLIENTS & CREDIT LEDGER ---
  getClients(): Client[] {
    const database = getDb();
    return database.prepare(`
      SELECT c.*,
        COALESCE((SELECT SUM(total_amount) FROM client_purchases WHERE client_id = c.id), 0) as total_purchases,
        COALESCE((SELECT SUM(paid_amount) FROM client_purchases WHERE client_id = c.id), 0) as total_paid,
        COALESCE((SELECT SUM(remaining_amount) FROM client_purchases WHERE client_id = c.id), 0) as balance
      FROM clients c ORDER BY c.id DESC
    `).all() as Client[];
  },

  addClient(client: Omit<Client, 'id'>): Client {
    const database = getDb();
    const stmt = database.prepare(
      `INSERT INTO clients (name, phone, address, notes) VALUES (?, ?, ?, ?)`
    );
    const info = stmt.run(client.name, client.phone, client.address, client.notes || '');
    return { id: info.lastInsertRowid as number, ...client };
  },

  updateClient(client: Client): Client {
    const database = getDb();
    const stmt = database.prepare(
      `UPDATE clients SET name = ?, phone = ?, address = ?, notes = ? WHERE id = ?`
    );
    stmt.run(client.name, client.phone, client.address, client.notes || '', client.id);
    return client;
  },

  deleteClient(id: number): boolean {
    const database = getDb();
    database.prepare(`DELETE FROM clients WHERE id = ?`).run(id);
    return true;
  },

  getClientPurchases(clientId: number): ClientPurchase[] {
    const database = getDb();
    return database.prepare(`
      SELECT cp.*, c.name as client_name, c.phone as client_phone
      FROM client_purchases cp
      JOIN clients c ON cp.client_id = c.id
      WHERE cp.client_id = ?
      ORDER BY cp.id DESC
    `).all(clientId) as ClientPurchase[];
  },

  addClientPurchase(purchase: Omit<ClientPurchase, 'id'>): ClientPurchase {
    const database = getDb();
    const totalAmount = purchase.weight_kg * purchase.unit_price;
    const remaining = totalAmount - purchase.paid_amount;

    const stmt = database.prepare(
      `INSERT INTO client_purchases (client_id, date, item_description, weight_kg, unit_price, total_amount, paid_amount, remaining_amount, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const info = stmt.run(
      purchase.client_id, purchase.date, purchase.item_description, purchase.weight_kg,
      purchase.unit_price, totalAmount, purchase.paid_amount, remaining > 0 ? remaining : 0, purchase.notes || ''
    );

    // If paid amount > 0, log income transaction
    if (purchase.paid_amount > 0) {
      const client = database.prepare(`SELECT name FROM clients WHERE id = ?`).get(purchase.client_id) as any;
      const clientName = client ? client.name : 'زبون';
      database.prepare(
        `INSERT INTO transactions (type, category, amount, description, date, client_id) VALUES (?, ?, ?, ?, ?, ?)`
      ).run('INCOME', 'مبيعات تمور', purchase.paid_amount, `تسديد من الشراء: ${purchase.item_description} - ${clientName}`, purchase.date, purchase.client_id);
    }

    return { 
      id: info.lastInsertRowid as number, 
      ...purchase, 
      total_amount: totalAmount, 
      remaining_amount: remaining > 0 ? remaining : 0 
    };
  },

  payClientDebt(purchaseId: number, amount: number): boolean {
    const database = getDb();
    const purchase = database.prepare(`SELECT * FROM client_purchases WHERE id = ?`).get(purchaseId) as ClientPurchase | undefined;
    if (!purchase) return false;

    const newPaid = purchase.paid_amount + amount;
    const newRemaining = purchase.total_amount - newPaid;

    database.prepare(
      `UPDATE client_purchases SET paid_amount = ?, remaining_amount = ? WHERE id = ?`
    ).run(newPaid, newRemaining > 0 ? newRemaining : 0, purchaseId);

    // Record Income Transaction
    const client = database.prepare(`SELECT name FROM clients WHERE id = ?`).get(purchase.client_id) as any;
    const clientName = client ? client.name : 'زبون';
    database.prepare(
      `INSERT INTO transactions (type, category, amount, description, date, client_id) VALUES (?, ?, ?, ?, ?, ?)`
    ).run('INCOME', 'تسديد ديون', amount, `تسديد كريدي سابق - ${clientName}`, new Date().toISOString().split('T')[0], purchase.client_id);

    return true;
  }
};
