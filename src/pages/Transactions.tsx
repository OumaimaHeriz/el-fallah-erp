import React, { useEffect, useState } from 'react';
import { Transaction, Farm, Commerce, TransactionType } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  PlusCircle, Trash2, ArrowUpRight, ArrowDownLeft, 
  Filter, Wallet, Download, Calendar
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form State
  const [type, setType] = useState<TransactionType>('INCOME');
  const [category, setCategory] = useState('مبيعات تمور');
  const [amount, setAmount] = useState<number>(10000);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | ''>('');
  const [selectedCommerceId, setSelectedCommerceId] = useState<number | ''>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [txs, fList, cList] = await Promise.all([
        api.getTransactions(),
        api.getFarms(),
        api.getCommerces()
      ]);
      setTransactions(txs);
      setFarms(fList);
      setCommerces(cList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addTransaction({
      type,
      category,
      amount: Number(amount),
      description,
      date,
      farm_id: selectedFarmId !== '' ? Number(selectedFarmId) : null,
      commerce_id: selectedCommerceId !== '' ? Number(selectedCommerceId) : null
    });

    setIsModalOpen(false);
    resetForm();
    loadData();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await api.deleteTransaction(deleteId);
      setDeleteId(null);
      loadData();
    }
  };

  const resetForm = () => {
    setType('INCOME');
    setCategory('مبيعات تمور');
    setAmount(10000);
    setDescription('');
    setSelectedFarmId('');
    setSelectedCommerceId('');
  };

  const filteredTxs = transactions.filter((t) => {
    if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchCat = t.category.toLowerCase().includes(q);
      return matchDesc || matchCat;
    }
    return true;
  });

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Treasury Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-palm text-deglet-gold flex items-center justify-center shadow-lg shadow-palm/20">
            <Wallet className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">سجل المعاملات المالية والخزينة</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              مجموع المداخيل: <span className="font-bold text-emerald-700 font-mono">{totalIncome.toLocaleString()} د.ج</span> |
              مجموع المصاريف: <span className="font-bold text-rose-700 font-mono">{totalExpense.toLocaleString()} د.ج</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-palm to-palm-light text-white font-bold rounded-xl text-sm shadow-md shadow-palm/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4 text-deglet-gold" />
          <span>إضافة معاملة جديدة</span>
        </button>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-100/80 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-extrabold text-slate-700">تصفية حسب النوع:</span>
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              typeFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border'
            }`}
          >
            الكل ({transactions.length})
          </button>
          <button
            onClick={() => setTypeFilter('INCOME')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              typeFilter === 'INCOME' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-800 border'
            }`}
          >
            المداخيل (+)
          </button>
          <button
            onClick={() => setTypeFilter('EXPENSE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              typeFilter === 'EXPENSE' ? 'bg-rose-600 text-white' : 'bg-white text-rose-800 border'
            }`}
          >
            المصاريف (-)
          </button>
        </div>

        <div className="w-64">
          <input
            type="text"
            placeholder="بحث بالوصف أو الصنف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-900 text-white font-bold">
            <tr>
              <th className="p-4">النوع</th>
              <th className="p-4">الصنف</th>
              <th className="p-4">البيان / الوصف</th>
              <th className="p-4">المزرعة / النشاط التجاري</th>
              <th className="p-4">التاريخ</th>
              <th className="p-4 text-left">المبلغ (د.ج)</th>
              <th className="p-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredTxs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                  لا توجد معاملات مالية مطابقة للفلترة الحالية.
                </td>
              </tr>
            ) : (
              filteredTxs.map((tx) => {
                const isIncome = tx.type === 'INCOME';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                        isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                        {isIncome ? 'دخل (+)' : 'مصروف (-)'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800">{tx.category}</td>
                    <td className="p-4 text-slate-900 font-semibold">{tx.description}</td>
                    <td className="p-4 text-xs font-bold text-slate-600">
                      {tx.farm_name ? `🌴 ${tx.farm_name}` : tx.commerce_name ? `🏪 ${tx.commerce_name}` : 'عام'}
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-500">{tx.date}</td>
                    <td className={`p-4 text-left font-mono font-black text-base ${
                      isIncome ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {isIncome ? '+' : '-'}{tx.amount.toLocaleString()} د.ج
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => tx.id && setDeleteId(tx.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Transaction Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تسجيل معاملة مالية جديدة">
        <form onSubmit={handleCreateTransaction} className="space-y-4">
          <div className="flex gap-3 bg-slate-100 p-1.5 rounded-xl">
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'INCOME' ? 'bg-emerald-600 text-white shadow' : 'text-slate-700'
              }`}
            >
              دخل / إيراد (+)
            </button>
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'EXPENSE' ? 'bg-rose-600 text-white shadow' : 'text-slate-700'
              }`}
            >
              مصروف (-)
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">الصنف</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 text-sm border rounded-xl bg-white font-bold"
            >
              {type === 'INCOME' ? (
                <>
                  <option value="مبيعات تمور">مبيعات تمور (دقلة نور / غرس)</option>
                  <option value="مبيعات فسائل نخيل">مبيعات فسائل نخيل</option>
                  <option value="تأجير معدات">تأجير معدات أو واحة</option>
                  <option value="مداخيل أخرى">مداخيل إضافية أخرى</option>
                </>
              ) : (
                <>
                  <option value="أجور عمال">أجور وتسبيقات عمال</option>
                  <option value="أسمدة ومواد">أسمدة ومبيدات حشرية</option>
                  <option value="سقي ومياه">مصاريف السقي والكهرباء</option>
                  <option value="نقل وتخزين">نقل التمور وكراء غرف التبريد</option>
                  <option value="صيانة معدات">صيانة معدات وجرارات</option>
                  <option value="مصاريف أخرى">مصاريف عامة أخرى</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">المبلغ (د.ج)</label>
            <input
              type="number"
              required
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-2.5 text-sm border rounded-xl font-bold font-mono text-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">البيان / الوصف</label>
            <input
              type="text"
              required
              placeholder="مثال: شراء أسمدة عضوي لمزرعة طولقة"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 text-sm border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">ربط بمزرعة (اختياري)</label>
              <select
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value ? Number(e.target.value) : '')}
                className="w-full p-2.5 text-xs border rounded-xl"
              >
                <option value="">-- بدون مزرعة --</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">ربط بنشاط تجاري (اختياري)</label>
              <select
                value={selectedCommerceId}
                onChange={(e) => setSelectedCommerceId(e.target.value ? Number(e.target.value) : '')}
                className="w-full p-2.5 text-xs border rounded-xl"
              >
                <option value="">-- بدون نشاط --</option>
                {commerces.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">التاريخ</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 text-sm border rounded-xl font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold bg-slate-100 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-palm text-white rounded-xl shadow"
            >
              تسجيل المعاملة
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
