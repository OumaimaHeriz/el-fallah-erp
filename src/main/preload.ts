import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Dashboard
  getDashboardStats: () => ipcRenderer.invoke('db:getDashboardStats'),

  // Farms
  getFarms: () => ipcRenderer.invoke('db:getFarms'),
  addFarm: (farm: any) => ipcRenderer.invoke('db:addFarm', farm),
  updateFarm: (farm: any) => ipcRenderer.invoke('db:updateFarm', farm),
  deleteFarm: (id: number) => ipcRenderer.invoke('db:deleteFarm', id),

  // Commerces
  getCommerces: () => ipcRenderer.invoke('db:getCommerces'),
  addCommerce: (commerce: any) => ipcRenderer.invoke('db:addCommerce', commerce),
  updateCommerce: (commerce: any) => ipcRenderer.invoke('db:updateCommerce', commerce),
  deleteCommerce: (id: number) => ipcRenderer.invoke('db:deleteCommerce', id),

  // Transactions
  getTransactions: () => ipcRenderer.invoke('db:getTransactions'),
  addTransaction: (transaction: any) => ipcRenderer.invoke('db:addTransaction', transaction),
  deleteTransaction: (id: number) => ipcRenderer.invoke('db:deleteTransaction', id),

  // Workers & Attendance & Payroll
  getWorkers: () => ipcRenderer.invoke('db:getWorkers'),
  addWorker: (worker: any) => ipcRenderer.invoke('db:addWorker', worker),
  updateWorker: (worker: any) => ipcRenderer.invoke('db:updateWorker', worker),
  deleteWorker: (id: number) => ipcRenderer.invoke('db:deleteWorker', id),

  getAttendanceLogs: (date?: string) => ipcRenderer.invoke('db:getAttendanceLogs', date),
  recordAttendance: (log: any) => ipcRenderer.invoke('db:recordAttendance', log),

  addWorkerPayment: (payment: any) => ipcRenderer.invoke('db:addWorkerPayment', payment),
  getWorkerPayments: (workerId?: number) => ipcRenderer.invoke('db:getWorkerPayments', workerId),

  verifyKioskPin: (pinCode: string) => ipcRenderer.invoke('db:verifyKioskPin', pinCode),

  // Clients & Credit Ledger
  getClients: () => ipcRenderer.invoke('db:getClients'),
  addClient: (client: any) => ipcRenderer.invoke('db:addClient', client),
  updateClient: (client: any) => ipcRenderer.invoke('db:updateClient', client),
  deleteClient: (id: number) => ipcRenderer.invoke('db:deleteClient', id),

  getClientPurchases: (clientId: number) => ipcRenderer.invoke('db:getClientPurchases', clientId),
  addClientPurchase: (purchase: any) => ipcRenderer.invoke('db:addClientPurchase', purchase),
  payClientDebt: (purchaseId: number, amount: number) => ipcRenderer.invoke('db:payClientDebt', { purchaseId, amount })
});
