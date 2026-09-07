import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('electronAPI', {
    // Dashboard
    getDashboardStats: function () { return ipcRenderer.invoke('db:getDashboardStats'); },
    // Farms
    getFarms: function () { return ipcRenderer.invoke('db:getFarms'); },
    addFarm: function (farm) { return ipcRenderer.invoke('db:addFarm', farm); },
    updateFarm: function (farm) { return ipcRenderer.invoke('db:updateFarm', farm); },
    deleteFarm: function (id) { return ipcRenderer.invoke('db:deleteFarm', id); },
    // Commerces
    getCommerces: function () { return ipcRenderer.invoke('db:getCommerces'); },
    addCommerce: function (commerce) { return ipcRenderer.invoke('db:addCommerce', commerce); },
    updateCommerce: function (commerce) { return ipcRenderer.invoke('db:updateCommerce', commerce); },
    deleteCommerce: function (id) { return ipcRenderer.invoke('db:deleteCommerce', id); },
    // Transactions
    getTransactions: function () { return ipcRenderer.invoke('db:getTransactions'); },
    addTransaction: function (transaction) { return ipcRenderer.invoke('db:addTransaction', transaction); },
    deleteTransaction: function (id) { return ipcRenderer.invoke('db:deleteTransaction', id); },
    // Workers & Attendance & Payroll
    getWorkers: function () { return ipcRenderer.invoke('db:getWorkers'); },
    addWorker: function (worker) { return ipcRenderer.invoke('db:addWorker', worker); },
    updateWorker: function (worker) { return ipcRenderer.invoke('db:updateWorker', worker); },
    deleteWorker: function (id) { return ipcRenderer.invoke('db:deleteWorker', id); },
    getAttendanceLogs: function (date) { return ipcRenderer.invoke('db:getAttendanceLogs', date); },
    recordAttendance: function (log) { return ipcRenderer.invoke('db:recordAttendance', log); },
    addWorkerPayment: function (payment) { return ipcRenderer.invoke('db:addWorkerPayment', payment); },
    getWorkerPayments: function (workerId) { return ipcRenderer.invoke('db:getWorkerPayments', workerId); },
    verifyKioskPin: function (pinCode) { return ipcRenderer.invoke('db:verifyKioskPin', pinCode); },
    // Clients & Credit Ledger
    getClients: function () { return ipcRenderer.invoke('db:getClients'); },
    addClient: function (client) { return ipcRenderer.invoke('db:addClient', client); },
    updateClient: function (client) { return ipcRenderer.invoke('db:updateClient', client); },
    deleteClient: function (id) { return ipcRenderer.invoke('db:deleteClient', id); },
    getClientPurchases: function (clientId) { return ipcRenderer.invoke('db:getClientPurchases', clientId); },
    addClientPurchase: function (purchase) { return ipcRenderer.invoke('db:addClientPurchase', purchase); },
    payClientDebt: function (purchaseId, amount) { return ipcRenderer.invoke('db:payClientDebt', { purchaseId: purchaseId, amount: amount }); }
});
