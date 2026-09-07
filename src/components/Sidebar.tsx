import React from 'react';
import { 
  LayoutDashboard, Wallet, TreePalm, Store, 
  Users, KeyRound, BookUser, Sprout, Languages
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export type PageId = 'dashboard' | 'treasury' | 'farms' | 'commerces' | 'workers' | 'kiosk' | 'clients';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onSelectPage }) => {
  const { t, language, setLanguage } = useLanguage();

  const menuItems = [
    { id: 'dashboard' as PageId, label: t('dashboard'), icon: LayoutDashboard },
    { id: 'treasury' as PageId, label: t('treasury'), icon: Wallet },
    { id: 'farms' as PageId, label: t('farms'), icon: TreePalm },
    { id: 'commerces' as PageId, label: t('commerces'), icon: Store },
    { id: 'workers' as PageId, label: t('workers'), icon: Users },
    { id: 'clients' as PageId, label: t('clients'), icon: BookUser },
    { id: 'kiosk' as PageId, label: t('kioskMode'), icon: KeyRound, badge: 'PIN' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen border-r border-l border-slate-800 shadow-xl select-none z-20 flex-shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-palm-dark">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-palm-light to-deglet-gold flex items-center justify-center shadow-lg shadow-palm-light/30">
            <Sprout className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-wide leading-tight">
              {t('appName')}
            </h1>
            <p className="text-xs text-deglet-amber font-medium mt-0.5">
              بسكرة • طولقة
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-palm-light to-palm text-white shadow-md shadow-palm/40 translate-x-1'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3 space-x-reverse">
                <Icon className={`w-5 h-5 ${isActive ? 'text-deglet-gold' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-deglet-dark text-amber-100 uppercase tracking-wider">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer & Language Switcher */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-2 space-x-reverse text-xs text-slate-400 font-medium">
            <Languages className="w-4 h-4 text-deglet-amber" />
            <span>اللغة / Langue</span>
          </div>
          <div className="flex space-x-1 space-x-reverse">
            <button
              onClick={() => setLanguage('ar')}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors ${
                language === 'ar'
                  ? 'bg-palm text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              عربي
            </button>
            <button
              onClick={() => setLanguage('fr')}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors ${
                language === 'fr'
                  ? 'bg-palm text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              FR
            </button>
          </div>
        </div>
        <div className="mt-3 text-center text-[11px] text-slate-500 font-sans">
          v1.0.0 • SQLite Offline Edition
        </div>
      </div>
    </aside>
  );
};
