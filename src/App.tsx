import React, { useState } from 'react';
import { Sidebar, PageId } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { TransactionsPage } from './pages/Transactions';
import { FarmsPage } from './pages/Farms';
import { CommercesPage } from './pages/Commerces';
import { WorkersPage } from './pages/Workers';
import { KioskMode } from './pages/KioskMode';
import { ClientsPage } from './pages/Clients';
import { LanguageProvider } from './i18n/LanguageContext';

export function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // If in Kiosk Mode, render standalone full-screen Kiosk interface
  if (currentPage === 'kiosk') {
    return <KioskMode onExitKiosk={() => setCurrentPage('dashboard')} />;
  }

  return (
    <div className="flex h-screen bg-sahara-bg overflow-hidden font-arabic select-none text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar currentPage={currentPage} onSelectPage={setCurrentPage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          currentPage={currentPage}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onQuickAction={() => setCurrentPage('treasury')}
        />

        <main className="flex-1 overflow-y-auto bg-sahara-bg">
          {currentPage === 'dashboard' && (
            <Dashboard
              onAddTransactionClick={() => setCurrentPage('treasury')}
              onNavigatePage={(p) => setCurrentPage(p)}
            />
          )}
          {currentPage === 'treasury' && <TransactionsPage />}
          {currentPage === 'farms' && <FarmsPage />}
          {currentPage === 'commerces' && <CommercesPage />}
          {currentPage === 'workers' && <WorkersPage />}
          {currentPage === 'clients' && <ClientsPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
