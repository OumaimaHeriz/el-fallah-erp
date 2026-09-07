import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { FinancialChart } from '../components/Chart';
import { DashboardStats, Transaction } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  TreePalm, CreditCard, ArrowUpRight, ArrowDownLeft, PlusCircle
} from 'lucide-react';

interface DashboardProps {
  onAddTransactionClick: () => void;
  onNavigatePage: (page: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onAddTransactionClick,
  onNavigatePage
}) => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 font-bold">
        جاري تحميل بيانات لوحة التحكم...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-palm-dark to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full bg-deglet-amber/20 text-deglet-gold text-xs font-bold uppercase tracking-wider">
            منظومة الفلاح • طولقة وبسكرة
          </span>
          <h2 className="text-3xl font-black mt-3 leading-tight tracking-tight">
            مرحباً بك في نظام إدارة مزارع النخيل وتجارة التمور
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            متابعة دقيقة للمداخيل، مصاريف الواحات، حركات التمور، أجور العمال، ورصيد ديون الزبائن بخيار الدليل المحلي.
          </p>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={onAddTransactionClick}
              className="px-5 py-2.5 bg-gradient-to-r from-deglet-gold to-deglet-amber text-slate-950 font-black rounded-xl text-sm shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>تسجيل دخل أو مصروف جديد</span>
            </button>
            <button
              onClick={() => onNavigatePage('kiosk')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm border border-slate-700 transition-all"
            >
              فتح كشك بصمة العمال (PIN)
            </button>
          </div>
        </div>

        {/* Decorative Palm Icon Background */}
        <div className="absolute left-8 -bottom-10 opacity-10 pointer-events-none">
          <TreePalm className="w-80 h-80 text-deglet-amber" />
        </div>
      </div>

      {/* Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title={t('totalIncome')}
          value={`${stats.total_income.toLocaleString()} د.ج`}
          subtitle="إجمالي مداخيل المبيعات والمنتوج"
          icon={TrendingUp}
          variant="emerald"
          trend="+18.5% هذا الشهر"
        />
        <StatCard
          title={t('totalExpenses')}
          value={`${stats.total_expenses.toLocaleString()} د.ج`}
          subtitle="مصاريف الأسمدة، السقي والأجور"
          icon={TrendingDown}
          variant="rose"
          trend="-4.2% ضبط المصاريف"
        />
        <StatCard
          title={t('netProfit')}
          value={`${stats.net_profit.toLocaleString()} د.ج`}
          subtitle="صافي الأرباح المحققة للموسم"
          icon={DollarSign}
          variant="amber"
          trend="أداء ممتاز"
        />
        <StatCard
          title={t('activeWorkers')}
          value={`${stats.active_workers} عامل`}
          subtitle="مسجلين في كراس الحضور"
          icon={Users}
          variant="blue"
        />
        <StatCard
          title={t('totalPalms')}
          value={`${stats.total_palms.toLocaleString()} نخلة`}
          subtitle={`تتوزع على ${stats.total_farms} مزارع وواحات`}
          icon={TreePalm}
          variant="purple"
        />
        <StatCard
          title={t('clientDebt')}
          value={`${stats.total_client_debt.toLocaleString()} د.ج`}
          subtitle="مستحقات نقدية متبقية لدى الزبائن"
          icon={CreditCard}
          variant="rose"
        />
      </div>

      {/* Financial Chart */}
      <FinancialChart data={stats.monthly_flow} />

      {/* Recent Transactions Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">{t('recentTransactions')}</h3>
            <p className="text-xs text-slate-500 font-medium">آخر المعاملات المالية الموثقة في الخزينة</p>
          </div>
          <button
            onClick={() => onNavigatePage('treasury')}
            className="text-xs font-bold text-palm hover:text-palm-dark hover:underline"
          >
            عرض كافة المعاملات ←
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
              <tr>
                <th className="p-3">النوع</th>
                <th className="p-3">الصنف</th>
                <th className="p-3">البيان / الوصف</th>
                <th className="p-3">الجهة المربوطة</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3 text-left">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {stats.recent_transactions.map((tx) => {
                const isIncome = tx.type === 'INCOME';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                        {isIncome ? t('income') : t('expense')}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-700">{tx.category}</td>
                    <td className="p-3 text-slate-800">{tx.description}</td>
                    <td className="p-3 text-xs text-slate-500">
                      {tx.farm_name || tx.commerce_name || tx.client_name || tx.worker_name || 'عام'}
                    </td>
                    <td className="p-3 text-xs font-mono text-slate-500">{tx.date}</td>
                    <td className={`p-3 text-left font-mono font-bold text-base ${
                      isIncome ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {isIncome ? '+' : '-'}{tx.amount.toLocaleString()} د.ج
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
