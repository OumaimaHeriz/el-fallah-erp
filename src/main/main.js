import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { initDatabase, dbService } from '../database/db';
var mainWindow = null;
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
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
// ----------------------------------------------------
// ELECTRON IPC HANDLERS FOR BETTER-SQLITE3 DB SERVICE
// ----------------------------------------------------
function setupIpcHandlers() {
    // Dashboard
    ipcMain.handle('db:getDashboardStats', function () { return dbService.getDashboardStats(); });
    // Farms
    ipcMain.handle('db:getFarms', function () { return dbService.getFarms(); });
    ipcMain.handle('db:addFarm', function (_, farm) { return dbService.addFarm(farm); });
    ipcMain.handle('db:updateFarm', function (_, farm) { return dbService.updateFarm(farm); });
    ipcMain.handle('db:deleteFarm', function (_, id) { return dbService.deleteFarm(id); });
    // Commerces
    ipcMain.handle('db:getCommerces', function () { return dbService.getCommerces(); });
    ipcMain.handle('db:addCommerce', function (_, commerce) { return dbService.addCommerce(commerce); });
    ipcMain.handle('db:updateCommerce', function (_, commerce) { return dbService.updateCommerce(commerce); });
    ipcMain.handle('db:deleteCommerce', function (_, id) { return dbService.deleteCommerce(id); });
    // Transactions
    ipcMain.handle('db:getTransactions', function () { return dbService.getTransactions(); });
    ipcMain.handle('db:addTransaction', function (_, transaction) { return dbService.addTransaction(transaction); });
    ipcMain.handle('db:deleteTransaction', function (_, id) { return dbService.deleteTransaction(id); });
    // Workers & Attendance & Payroll
    ipcMain.handle('db:getWorkers', function () { return dbService.getWorkers(); });
    ipcMain.handle('db:addWorker', function (_, worker) { return dbService.addWorker(worker); });
    ipcMain.handle('db:updateWorker', function (_, worker) { return dbService.updateWorker(worker); });
    ipcMain.handle('db:deleteWorker', function (_, id) { return dbService.deleteWorker(id); });
    ipcMain.handle('db:getAttendanceLogs', function (_, date) { return dbService.getAttendanceLogs(date); });
    ipcMain.handle('db:recordAttendance', function (_, log) { return dbService.recordAttendance(log); });
    ipcMain.handle('db:addWorkerPayment', function (_, payment) { return dbService.addWorkerPayment(payment); });
    ipcMain.handle('db:getWorkerPayments', function (_, workerId) { return dbService.getWorkerPayments(workerId); });
    ipcMain.handle('db:verifyKioskPin', function (_, pinCode) { return dbService.verifyKioskPin(pinCode); });
    // Clients & Credit Ledger
    ipcMain.handle('db:getClients', function () { return dbService.getClients(); });
    ipcMain.handle('db:addClient', function (_, client) { return dbService.addClient(client); });
    ipcMain.handle('db:updateClient', function (_, client) { return dbService.updateClient(client); });
    ipcMain.handle('db:deleteClient', function (_, id) { return dbService.deleteClient(id); });
    ipcMain.handle('db:getClientPurchases', function (_, clientId) { return dbService.getClientPurchases(clientId); });
    ipcMain.handle('db:addClientPurchase', function (_, purchase) { return dbService.addClientPurchase(purchase); });
    ipcMain.handle('db:payClientDebt', function (_, _a) {
        var purchaseId = _a.purchaseId, amount = _a.amount;
        return dbService.payClientDebt(purchaseId, amount);
    });
}
app.whenReady().then(function () {
    // Initialize Database in user data folder
    var userDataPath = app.getPath('userData');
    var dbPath = path.join(userDataPath, 'el_fallah_erp.db');
    initDatabase(dbPath);
    setupIpcHandlers();
    createWindow();
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        app.quit();
});
