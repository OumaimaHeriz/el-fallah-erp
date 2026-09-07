var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
var db = null;
export function initDatabase(dbPath) {
    if (db)
        return db;
    var finalPath = dbPath || path.join(process.cwd(), 'el_fallah_erp.db');
    console.log('Initializing SQLite Database at:', finalPath);
    // Ensure directory exists
    var dir = path.dirname(finalPath);
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
export function getDb() {
    if (!db) {
        throw new Error('Database not initialized! Call initDatabase first.');
    }
    return db;
}
function createTables(database) {
    var schemaSql = "\n    CREATE TABLE IF NOT EXISTS farms (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      name TEXT NOT NULL,\n      location TEXT NOT NULL,\n      date_variety TEXT NOT NULL DEFAULT '\u062F\u0642\u0644\u0629 \u0646\u0648\u0631',\n      palm_count INTEGER NOT NULL DEFAULT 0,\n      status TEXT NOT NULL DEFAULT 'ACTIVE',\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n    );\n\n    CREATE TABLE IF NOT EXISTS commerces (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      name TEXT NOT NULL,\n      market_name TEXT NOT NULL,\n      kg_price REAL NOT NULL DEFAULT 0,\n      capacity_kg REAL NOT NULL DEFAULT 0,\n      status TEXT NOT NULL DEFAULT 'ACTIVE',\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n    );\n\n    CREATE TABLE IF NOT EXISTS workers (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      name TEXT NOT NULL,\n      role TEXT NOT NULL,\n      phone TEXT NOT NULL,\n      daily_rate REAL NOT NULL DEFAULT 0,\n      pin_code TEXT NOT NULL DEFAULT '0000',\n      status TEXT NOT NULL DEFAULT 'ACTIVE',\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n    );\n\n    CREATE TABLE IF NOT EXISTS attendance_logs (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      worker_id INTEGER NOT NULL,\n      date TEXT NOT NULL,\n      status TEXT NOT NULL DEFAULT 'PRESENT',\n      farm_id INTEGER,\n      commerce_id INTEGER,\n      notes TEXT,\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,\n      FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL,\n      FOREIGN KEY (commerce_id) REFERENCES commerces(id) ON DELETE SET NULL\n    );\n\n    CREATE TABLE IF NOT EXISTS worker_payments (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      worker_id INTEGER NOT NULL,\n      amount REAL NOT NULL,\n      payment_type TEXT NOT NULL DEFAULT 'ADVANCE',\n      payment_date TEXT NOT NULL,\n      notes TEXT,\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE\n    );\n\n    CREATE TABLE IF NOT EXISTS clients (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      name TEXT NOT NULL,\n      phone TEXT NOT NULL,\n      address TEXT NOT NULL,\n      notes TEXT,\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n    );\n\n    CREATE TABLE IF NOT EXISTS client_purchases (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      client_id INTEGER NOT NULL,\n      date TEXT NOT NULL,\n      item_description TEXT NOT NULL,\n      weight_kg REAL NOT NULL DEFAULT 0,\n      unit_price REAL NOT NULL DEFAULT 0,\n      total_amount REAL NOT NULL DEFAULT 0,\n      paid_amount REAL NOT NULL DEFAULT 0,\n      remaining_amount REAL NOT NULL DEFAULT 0,\n      notes TEXT,\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE\n    );\n\n    CREATE TABLE IF NOT EXISTS transactions (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      type TEXT NOT NULL,\n      category TEXT NOT NULL,\n      amount REAL NOT NULL,\n      description TEXT NOT NULL,\n      date TEXT NOT NULL,\n      farm_id INTEGER,\n      commerce_id INTEGER,\n      client_id INTEGER,\n      worker_id INTEGER,\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL,\n      FOREIGN KEY (commerce_id) REFERENCES commerces(id) ON DELETE SET NULL,\n      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,\n      FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE SET NULL\n    );\n  ";
    database.exec(schemaSql);
}
function seedInitialData(database) {
    var farmCount = database.prepare('SELECT COUNT(*) as count FROM farms').get();
    if (farmCount.count > 0)
        return; // Already seeded
    console.log('Seeding initial Algerian date farm & commerce data...');
    var today = new Date().toISOString().split('T')[0];
    // 1. Seed Farms
    var insertFarm = database.prepare("INSERT INTO farms (name, location, date_variety, palm_count, status) VALUES (?, ?, ?, ?, ?)");
    insertFarm.run('واحة طولقة الكبرى - حوش بن زعمية', 'طولقة - ولاية بسكرة', 'دقلة نور ممتازة', 1200, 'HARVESTING');
    insertFarm.run('مزرعة عين بن نوي - النخيل الذهبي', 'عين بن نوي - بسكرة', 'دقلة نور + غرس', 850, 'ACTIVE');
    insertFarm.run('واحة سيدي عقبة الشرقية', 'سيدي عقبة', 'مش دقلة + حمراية', 450, 'ACTIVE');
    // 2. Seed Commerces
    var insertCommerce = database.prepare("INSERT INTO commerces (name, market_name, kg_price, capacity_kg, status) VALUES (?, ?, ?, ?, ?)");
    insertCommerce.run('مؤسسة الفلاح لتصدير التمور', 'سوق الجملة طولقة', 680, 50000, 'ACTIVE');
    insertCommerce.run('محل البركة لتجارة تمور الدقلة', 'سوق بسكرة المركزي', 750, 15000, 'ACTIVE');
    // 3. Seed Workers
    var insertWorker = database.prepare("INSERT INTO workers (name, role, phone, daily_rate, pin_code, status) VALUES (?, ?, ?, ?, ?, ?)");
    insertWorker.run('العميد عبد القادر بن عيسى', 'مشرف المزرعة والجناء', '0661234567', 4000, '1234', 'ACTIVE');
    insertWorker.run('كمال طاهري', 'جناء / قطاف نخيل', '0662987654', 3500, '1111', 'ACTIVE');
    insertWorker.run('ياسين زروقي', 'سقي وخدمة الأرض', '0555112233', 3000, '2222', 'ACTIVE');
    insertWorker.run('فاطمة فرجاني', 'توضيب وتغليف التمور', '0770998877', 2800, '3333', 'ACTIVE');
    // 4. Seed Attendance
    var insertAttendance = database.prepare("INSERT INTO attendance_logs (worker_id, date, status, farm_id, notes) VALUES (?, ?, ?, ?, ?)");
    insertAttendance.run(1, today, 'PRESENT', 1, 'إشراف على جني العراجين');
    insertAttendance.run(2, today, 'PRESENT', 1, 'جني 45 عرجون دقلة نور');
    insertAttendance.run(3, today, 'PRESENT', 2, 'تنظيف شبكات السقي بالتقطير');
    insertAttendance.run(4, today, 'HALF_DAY', 1, 'توضيب صلب التمور المعد للتصدير');
    // 5. Seed Worker Payments
    var insertPayment = database.prepare("INSERT INTO worker_payments (worker_id, amount, payment_type, payment_date, notes) VALUES (?, ?, ?, ?, ?)");
    insertPayment.run(2, 5000, 'ADVANCE', today, 'تسبيق (أفونس) لمصاريف عائلية');
    insertPayment.run(3, 3000, 'ADVANCE', today, 'أفونس شراء البذور');
    // 6. Seed Clients
    var insertClient = database.prepare("INSERT INTO clients (name, phone, address, notes) VALUES (?, ?, ?, ?)");
    insertClient.run('شركة التاج لتوزيع التمور (العاصمة)', '0661998877', 'المدينة الجديدة، الشراقة - الجزائر العاصمة', 'زبون ممتاز لطلب الكميات الكبيرة');
    insertClient.run('الحاج بلعمراني مصطفى (وهران)', '0550443322', 'حي الكورنيش، وهران', 'تاجر جملة تمور الفرانك والتصدير');
    insertClient.run('مؤسسة تمور الأوراس (باتنة)', '0771223344', 'طريق قسنطينة، باتنة', 'طلب تمور الغرس والمش دقلة');
    // 7. Seed Client Purchases
    var insertPurchase = database.prepare("INSERT INTO client_purchases (client_id, date, item_description, weight_kg, unit_price, total_amount, paid_amount, remaining_amount, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    // Total: 5000kg * 700 DZD = 3,500,000 DZD. Paid: 2,500,000. Debt: 1,000,000 DZD.
    insertPurchase.run(1, today, '50 قنطار تمور دقلة نور طولقة درجة أولى', 5000, 700, 3500000, 2500000, 1000000, 'تم تسليم الشحنة عبر شاحنة تبريد');
    insertPurchase.run(2, today, '20 قنطار تمور غرس ممتازة للمصانع', 2000, 450, 900000, 600000, 300000, 'عربون مدفوع نقدًا');
    // 8. Seed Transactions
    var insertTransaction = database.prepare("INSERT INTO transactions (type, category, amount, description, date, farm_id, commerce_id, client_id, worker_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
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
export var dbService = {
    // --- DASHBOARD ---
    getDashboardStats: function () {
        var database = getDb();
        var income = database.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'INCOME'").get().total;
        var expense = database.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'EXPENSE'").get().total;
        var activeWorkers = database.prepare("SELECT COUNT(*) as count FROM workers WHERE status = 'ACTIVE'").get().count;
        var totalFarms = database.prepare("SELECT COUNT(*) as count FROM farms").get().count;
        var totalPalms = database.prepare("SELECT COALESCE(SUM(palm_count), 0) as total FROM farms").get().total;
        var totalDebt = database.prepare("SELECT COALESCE(SUM(remaining_amount), 0) as total FROM client_purchases").get().total;
        var recentTransactions = database.prepare("\n      SELECT t.*, f.name as farm_name, c.name as commerce_name, cl.name as client_name\n      FROM transactions t\n      LEFT JOIN farms f ON t.farm_id = f.id\n      LEFT JOIN commerces c ON t.commerce_id = c.id\n      LEFT JOIN clients cl ON t.client_id = cl.id\n      ORDER BY t.id DESC LIMIT 6\n    ").all();
        // Monthly flow data for chart
        var monthlyFlow = [
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
    getFarms: function () {
        var database = getDb();
        var farms = database.prepare("\n      SELECT f.*,\n        COALESCE((SELECT SUM(amount) FROM transactions WHERE farm_id = f.id AND type = 'INCOME'), 0) as total_income,\n        COALESCE((SELECT SUM(amount) FROM transactions WHERE farm_id = f.id AND type = 'EXPENSE'), 0) as total_expenses\n      FROM farms f ORDER BY f.id DESC\n    ").all();
        return farms.map(function (f) { return (__assign(__assign({}, f), { net_profit: (f.total_income || 0) - (f.total_expenses || 0) })); });
    },
    addFarm: function (farm) {
        var database = getDb();
        var stmt = database.prepare("INSERT INTO farms (name, location, date_variety, palm_count, status) VALUES (?, ?, ?, ?, ?)");
        var info = stmt.run(farm.name, farm.location, farm.date_variety, farm.palm_count, farm.status || 'ACTIVE');
        return __assign({ id: info.lastInsertRowid }, farm);
    },
    updateFarm: function (farm) {
        var database = getDb();
        var stmt = database.prepare("UPDATE farms SET name = ?, location = ?, date_variety = ?, palm_count = ?, status = ? WHERE id = ?");
        stmt.run(farm.name, farm.location, farm.date_variety, farm.palm_count, farm.status, farm.id);
        return farm;
    },
    deleteFarm: function (id) {
        var database = getDb();
        database.prepare("DELETE FROM farms WHERE id = ?").run(id);
        return true;
    },
    // --- COMMERCS ---
    getCommerces: function () {
        var database = getDb();
        return database.prepare("\n      SELECT c.*,\n        COALESCE((SELECT SUM(amount) FROM transactions WHERE commerce_id = c.id AND type = 'INCOME'), 0) as total_sales,\n        COALESCE((SELECT SUM(amount) FROM transactions WHERE commerce_id = c.id AND type = 'EXPENSE'), 0) as total_expenses\n      FROM commerces c ORDER BY c.id DESC\n    ").all();
    },
    addCommerce: function (commerce) {
        var database = getDb();
        var stmt = database.prepare("INSERT INTO commerces (name, market_name, kg_price, capacity_kg, status) VALUES (?, ?, ?, ?, ?)");
        var info = stmt.run(commerce.name, commerce.market_name, commerce.kg_price, commerce.capacity_kg, commerce.status || 'ACTIVE');
        return __assign({ id: info.lastInsertRowid }, commerce);
    },
    updateCommerce: function (commerce) {
        var database = getDb();
        var stmt = database.prepare("UPDATE commerces SET name = ?, market_name = ?, kg_price = ?, capacity_kg = ?, status = ? WHERE id = ?");
        stmt.run(commerce.name, commerce.market_name, commerce.kg_price, commerce.capacity_kg, commerce.status, commerce.id);
        return commerce;
    },
    deleteCommerce: function (id) {
        var database = getDb();
        database.prepare("DELETE FROM commerces WHERE id = ?").run(id);
        return true;
    },
    // --- TRANSACTIONS ---
    getTransactions: function () {
        var database = getDb();
        return database.prepare("\n      SELECT t.*, f.name as farm_name, c.name as commerce_name, cl.name as client_name, w.name as worker_name\n      FROM transactions t\n      LEFT JOIN farms f ON t.farm_id = f.id\n      LEFT JOIN commerces c ON t.commerce_id = c.id\n      LEFT JOIN clients cl ON t.client_id = cl.id\n      LEFT JOIN workers w ON t.worker_id = w.id\n      ORDER BY t.id DESC\n    ").all();
    },
    addTransaction: function (t) {
        var database = getDb();
        var stmt = database.prepare("INSERT INTO transactions (type, category, amount, description, date, farm_id, commerce_id, client_id, worker_id) \n       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        var info = stmt.run(t.type, t.category, t.amount, t.description, t.date, t.farm_id || null, t.commerce_id || null, t.client_id || null, t.worker_id || null);
        return __assign({ id: info.lastInsertRowid }, t);
    },
    deleteTransaction: function (id) {
        var database = getDb();
        database.prepare("DELETE FROM transactions WHERE id = ?").run(id);
        return true;
    },
    // --- WORKERS & ATTENDANCE & PAYROLL ---
    getWorkers: function () {
        var database = getDb();
        var workers = database.prepare("\n      SELECT w.*,\n        (SELECT COUNT(*) FROM attendance_logs WHERE worker_id = w.id AND status = 'PRESENT') as full_days,\n        (SELECT COUNT(*) FROM attendance_logs WHERE worker_id = w.id AND status = 'HALF_DAY') as half_days,\n        COALESCE((SELECT SUM(amount) FROM worker_payments WHERE worker_id = w.id), 0) as total_advances\n      FROM workers w ORDER BY w.id DESC\n    ").all();
        return workers.map(function (w) {
            var daysWorked = w.full_days + (w.half_days * 0.5);
            var totalEarned = daysWorked * w.daily_rate;
            var remaining = totalEarned - w.total_advances;
            return __assign(__assign({}, w), { total_days_worked: daysWorked, total_advances: w.total_advances, total_earned: totalEarned, remaining_payout: remaining > 0 ? remaining : 0 });
        });
    },
    addWorker: function (worker) {
        var database = getDb();
        var stmt = database.prepare("INSERT INTO workers (name, role, phone, daily_rate, pin_code, status) VALUES (?, ?, ?, ?, ?, ?)");
        var info = stmt.run(worker.name, worker.role, worker.phone, worker.daily_rate, worker.pin_code || '0000', worker.status || 'ACTIVE');
        return __assign({ id: info.lastInsertRowid }, worker);
    },
    updateWorker: function (worker) {
        var database = getDb();
        var stmt = database.prepare("UPDATE workers SET name = ?, role = ?, phone = ?, daily_rate = ?, pin_code = ?, status = ? WHERE id = ?");
        stmt.run(worker.name, worker.role, worker.phone, worker.daily_rate, worker.pin_code, worker.status, worker.id);
        return worker;
    },
    deleteWorker: function (id) {
        var database = getDb();
        database.prepare("DELETE FROM workers WHERE id = ?").run(id);
        return true;
    },
    getAttendanceLogs: function (date) {
        var database = getDb();
        var query = "\n      SELECT a.*, w.name as worker_name, w.role as worker_role, w.daily_rate, f.name as farm_name, c.name as commerce_name\n      FROM attendance_logs a\n      JOIN workers w ON a.worker_id = w.id\n      LEFT JOIN farms f ON a.farm_id = f.id\n      LEFT JOIN commerces c ON a.commerce_id = c.id\n    ";
        if (date) {
            query += " WHERE a.date = '".concat(date, "'");
        }
        query += " ORDER BY a.id DESC";
        return database.prepare(query).all();
    },
    recordAttendance: function (log) {
        var database = getDb();
        // Check if attendance already exists for worker on this date
        var existing = database.prepare("SELECT id FROM attendance_logs WHERE worker_id = ? AND date = ?").get(log.worker_id, log.date);
        if (existing) {
            database.prepare("UPDATE attendance_logs SET status = ?, farm_id = ?, commerce_id = ?, notes = ? WHERE id = ?").run(log.status, log.farm_id || null, log.commerce_id || null, log.notes || '', existing.id);
            return __assign({ id: existing.id }, log);
        }
        else {
            var stmt = database.prepare("INSERT INTO attendance_logs (worker_id, date, status, farm_id, commerce_id, notes) VALUES (?, ?, ?, ?, ?, ?)");
            var info = stmt.run(log.worker_id, log.date, log.status, log.farm_id || null, log.commerce_id || null, log.notes || '');
            return __assign({ id: info.lastInsertRowid }, log);
        }
    },
    addWorkerPayment: function (payment) {
        var database = getDb();
        var stmt = database.prepare("INSERT INTO worker_payments (worker_id, amount, payment_type, payment_date, notes) VALUES (?, ?, ?, ?, ?)");
        var info = stmt.run(payment.worker_id, payment.amount, payment.payment_type, payment.payment_date, payment.notes || '');
        // Also record transaction expense automatically
        var worker = database.prepare("SELECT name FROM workers WHERE id = ?").get(payment.worker_id);
        var workerName = worker ? worker.name : 'عامل';
        database.prepare("INSERT INTO transactions (type, category, amount, description, date, worker_id) VALUES (?, ?, ?, ?, ?, ?)").run('EXPENSE', 'أجور عمال', payment.amount, "\u062F\u0641\u0639\u0629 (".concat(payment.payment_type === 'ADVANCE' ? 'تسبيق/أفونس' : 'تصفية أجر', ") - ").concat(workerName), payment.payment_date, payment.worker_id);
        return __assign({ id: info.lastInsertRowid }, payment);
    },
    getWorkerPayments: function (workerId) {
        var database = getDb();
        var query = "\n      SELECT p.*, w.name as worker_name, w.role as worker_role\n      FROM worker_payments p\n      JOIN workers w ON p.worker_id = w.id\n    ";
        if (workerId) {
            query += " WHERE p.worker_id = ".concat(workerId);
        }
        query += " ORDER BY p.id DESC";
        return database.prepare(query).all();
    },
    verifyKioskPin: function (pinCode) {
        var database = getDb();
        var worker = database.prepare("SELECT * FROM workers WHERE pin_code = ? AND status = 'ACTIVE'").get(pinCode);
        return worker || null;
    },
    // --- CLIENTS & CREDIT LEDGER ---
    getClients: function () {
        var database = getDb();
        return database.prepare("\n      SELECT c.*,\n        COALESCE((SELECT SUM(total_amount) FROM client_purchases WHERE client_id = c.id), 0) as total_purchases,\n        COALESCE((SELECT SUM(paid_amount) FROM client_purchases WHERE client_id = c.id), 0) as total_paid,\n        COALESCE((SELECT SUM(remaining_amount) FROM client_purchases WHERE client_id = c.id), 0) as balance\n      FROM clients c ORDER BY c.id DESC\n    ").all();
    },
    addClient: function (client) {
        var database = getDb();
        var stmt = database.prepare("INSERT INTO clients (name, phone, address, notes) VALUES (?, ?, ?, ?)");
        var info = stmt.run(client.name, client.phone, client.address, client.notes || '');
        return __assign({ id: info.lastInsertRowid }, client);
    },
    updateClient: function (client) {
        var database = getDb();
        var stmt = database.prepare("UPDATE clients SET name = ?, phone = ?, address = ?, notes = ? WHERE id = ?");
        stmt.run(client.name, client.phone, client.address, client.notes || '', client.id);
        return client;
    },
    deleteClient: function (id) {
        var database = getDb();
        database.prepare("DELETE FROM clients WHERE id = ?").run(id);
        return true;
    },
    getClientPurchases: function (clientId) {
        var database = getDb();
        return database.prepare("\n      SELECT cp.*, c.name as client_name, c.phone as client_phone\n      FROM client_purchases cp\n      JOIN clients c ON cp.client_id = c.id\n      WHERE cp.client_id = ?\n      ORDER BY cp.id DESC\n    ").all(clientId);
    },
    addClientPurchase: function (purchase) {
        var database = getDb();
        var totalAmount = purchase.weight_kg * purchase.unit_price;
        var remaining = totalAmount - purchase.paid_amount;
        var stmt = database.prepare("INSERT INTO client_purchases (client_id, date, item_description, weight_kg, unit_price, total_amount, paid_amount, remaining_amount, notes)\n       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        var info = stmt.run(purchase.client_id, purchase.date, purchase.item_description, purchase.weight_kg, purchase.unit_price, totalAmount, purchase.paid_amount, remaining > 0 ? remaining : 0, purchase.notes || '');
        // If paid amount > 0, log income transaction
        if (purchase.paid_amount > 0) {
            var client = database.prepare("SELECT name FROM clients WHERE id = ?").get(purchase.client_id);
            var clientName = client ? client.name : 'زبون';
            database.prepare("INSERT INTO transactions (type, category, amount, description, date, client_id) VALUES (?, ?, ?, ?, ?, ?)").run('INCOME', 'مبيعات تمور', purchase.paid_amount, "\u062A\u0633\u062F\u064A\u062F \u0645\u0646 \u0627\u0644\u0634\u0631\u0627\u0621: ".concat(purchase.item_description, " - ").concat(clientName), purchase.date, purchase.client_id);
        }
        return __assign(__assign({ id: info.lastInsertRowid }, purchase), { total_amount: totalAmount, remaining_amount: remaining > 0 ? remaining : 0 });
    },
    payClientDebt: function (purchaseId, amount) {
        var database = getDb();
        var purchase = database.prepare("SELECT * FROM client_purchases WHERE id = ?").get(purchaseId);
        if (!purchase)
            return false;
        var newPaid = purchase.paid_amount + amount;
        var newRemaining = purchase.total_amount - newPaid;
        database.prepare("UPDATE client_purchases SET paid_amount = ?, remaining_amount = ? WHERE id = ?").run(newPaid, newRemaining > 0 ? newRemaining : 0, purchaseId);
        // Record Income Transaction
        var client = database.prepare("SELECT name FROM clients WHERE id = ?").get(purchase.client_id);
        var clientName = client ? client.name : 'زبون';
        database.prepare("INSERT INTO transactions (type, category, amount, description, date, client_id) VALUES (?, ?, ?, ?, ?, ?)").run('INCOME', 'تسديد ديون', amount, "\u062A\u0633\u062F\u064A\u062F \u0643\u0631\u064A\u062F\u064A \u0633\u0627\u0628\u0642 - ".concat(clientName), new Date().toISOString().split('T')[0], purchase.client_id);
        return true;
    }
};
