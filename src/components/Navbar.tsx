import React from 'react';
import { Calendar, PlusCircle, Search, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { PageId } from './Sidebar';

interface NavbarProps {
  currentPage: PageId;
  onQuickAction?: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onQuickAction,
  searchTerm,
  onSearchChange
}) => {
  const { t } = useLanguage();

  const titleMap: Record<PageId, string> = {
    dashboard: t('dashboard'),
    treasury: t('treasury'),
    farms: t('farms'),
    commerces: t('commerces'),
    workers: t('workers'),
    kiosk: t('kioskMode'),
    clients: t('clients')
  };

  const todayStr = new Date().toLocaleDateString('ar-DZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      {/* Title & Date */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          {titleMap[currentPage]}
          <span className="inline-block w-2 h-2 rounded-full bg-palm animate-pulse" />
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
          <Calendar className="w-3.5 h-3.5 text-deglet-dark" />
          <span>{todayStr}</span>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-4">
        {onSearchChange !== undefined && (
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('search')}
              className="pr-9 pl-4 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-palm focus:bg-white transition-all w-64"
            />
          </div>
        )}

        {onQuickAction && (
          <button
            onClick={onQuickAction}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-palm to-palm-light text-white font-bold text-sm rounded-xl shadow-md shadow-palm/20 hover:shadow-lg hover:shadow-palm/30 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-deglet-gold" />
            <span>إضافة معاملة جديدة</span>
          </button>
        )}

        <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>موسم الجني 2026</span>
        </div>
      </div>
    </header>
  );
};
