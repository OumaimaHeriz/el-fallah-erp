import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { initDatabase, dbService } from '../database/db';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'EL-FALLAH ERP/CRM - الفلاح لإدارة مزارع النخيل والتمور',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    icon: path.join(__dirname, '../../public/favicon.svg'),
    backgroundColor: '#fbf9f5'
  });

  // Remove default menu bar for clean app feel
  mainWindow.setMenu(null);

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ----------------------------------------------------
// ELECTRON IPC HANDLERS FOR BETTER-SQLITE3 DB SERVICE
// ----------------------------------------------------

function setupIpcHandlers() {
  // Dashboard
  ipcMain.handle('db:getDashboardStats', () => dbService.getDashboardStats());

  // Farms
  ipcMain.handle('db:getFarms', () => dbService.getFarms());
  ipcMain.handle('db:addFarm', (_, farm) => dbService.addFarm(farm));
  ipcMain.handle('db:updateFarm', (_, farm) => dbService.updateFarm(farm));
  ipcMain.handle('db:deleteFarm', (_, id) => dbService.deleteFarm(id));

  // Commerces
  ipcMain.handle('db:getCommerces', () => dbService.getCommerces());
  ipcMain.handle('db:addCommerce', (_, commerce) => dbService.addCommerce(commerce));
  ipcMain.handle('db:updateCommerce', (_, commerce) => dbService.updateCommerce(commerce));
  ipcMain.handle('db:deleteCommerce', (_, id) => dbService.deleteCommerce(id));

  // Transactions
  ipcMain.handle('db:getTransactions', () => dbService.getTransactions());
  ipcMain.handle('db:addTransaction', (_, transaction) => dbService.addTransaction(transaction));
  ipcMain.handle('db:deleteTransaction', (_, id) => dbService.deleteTransaction(id));

  // Workers & Attendance & Payroll
  ipcMain.handle('db:getWorkers', () => dbService.getWorkers());
  ipcMain.handle('db:addWorker', (_, worker) => dbService.addWorker(worker));
  ipcMain.handle('db:updateWorker', (_, worker) => dbService.updateWorker(worker));
  ipcMain.handle('db:deleteWorker', (_, id) => dbService.deleteWorker(id));

  ipcMain.handle('db:getAttendanceLogs', (_, date) => dbService.getAttendanceLogs(date));
  ipcMain.handle('db:recordAttendance', (_, log) => dbService.recordAttendance(log));

  ipcMain.handle('db:addWorkerPayment', (_, payment) => dbService.addWorkerPayment(payment));
  ipcMain.handle('db:getWorkerPayments', (_, workerId) => dbService.getWorkerPayments(workerId));

  ipcMain.handle('db:verifyKioskPin', (_, pinCode) => dbService.verifyKioskPin(pinCode));

  // Clients & Credit Ledger
  ipcMain.handle('db:getClients', () => dbService.getClients());
  ipcMain.handle('db:addClient', (_, client) => dbService.addClient(client));
  ipcMain.handle('db:updateClient', (_, client) => dbService.updateClient(client));
  ipcMain.handle('db:deleteClient', (_, id) => dbService.deleteClient(id));

  ipcMain.handle('db:getClientPurchases', (_, clientId) => dbService.getClientPurchases(clientId));
  ipcMain.handle('db:addClientPurchase', (_, purchase) => dbService.addClientPurchase(purchase));
  ipcMain.handle('db:payClientDebt', (_, { purchaseId, amount }) => dbService.payClientDebt(purchaseId, amount));
}

app.whenReady().then(() => {
  // Initialize Database in user data folder
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'el_fallah_erp.db');
  initDatabase(dbPath);

  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
