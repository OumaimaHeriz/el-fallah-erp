import React, { useEffect, useState } from 'react';
import { Commerce } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  Store, PlusCircle, Edit3, Trash2, Tag, 
  Boxes, ShoppingBag, ArrowUpRight
} from 'lucide-react';

export const CommercesPage: React.FC = () => {
  const { t } = useLanguage();
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommerce, setEditingCommerce] = useState<Commerce | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [marketName, setMarketName] = useState('سوق الجملة طولقة');
  const [kgPrice, setKgPrice] = useState<number>(700);
  const [capacityKg, setCapacityKg] = useState<number>(20000);
  const [status, setStatus] = useState<'ACTIVE' | 'CLOSED' | 'SEASONAL'>('ACTIVE');

  const loadCommerces = async () => {
    setLoading(true);
    try {
      const data = await api.getCommerces();
      setCommerces(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommerces();
  }, []);

  const handleOpenAdd = () => {
    setEditingCommerce(null);
    setName('');
    setMarketName('سوق الجملة طولقة');
    setKgPrice(700);
    setCapacityKg(20000);
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Commerce) => {
    setEditingCommerce(c);
    setName(c.name);
    setMarketName(c.market_name);
    setKgPrice(c.kg_price);
    setCapacityKg(c.capacity_kg);
    setStatus(c.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCommerce && editingCommerce.id) {
      await api.updateCommerce({
        id: editingCommerce.id,
        name,
        market_name: marketName,
        kg_price: Number(kgPrice),
        capacity_kg: Number(capacityKg),
        status
      });
    } else {
      await api.addCommerce({
        name,
        market_name: marketName,
        kg_price: Number(kgPrice),
        capacity_kg: Number(capacityKg),
        status
      });
    }

    setIsModalOpen(false);
    loadCommerces();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await api.deleteCommerce(deleteId);
      setDeleteId(null);
      loadCommerces();
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Store className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">{t('commerces')} ومحلات التمور</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              متابعة أنشطة التصدير، محلات أسواق الجملة بطولقة وبسكرة، وأسعار تسليم الكيلوغرام.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow-md shadow-amber-600/20 transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة نشاط تجاري جديد</span>
        </button>
      </div>

      {/* Commerces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {commerces.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    {c.market_name}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-lg mt-2">{c.name}</h3>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 text-slate-400 hover:text-palm rounded-lg hover:bg-slate-100"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => c.id && setDeleteId(c.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mt-4 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-600" />
                  <span>السعر المرجعي: <strong className="text-slate-900 font-mono text-sm">{c.kg_price} د.ج / كغ</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-slate-500" />
                  <span>السعة التخزينية: <strong className="text-slate-900 font-mono text-sm">{(c.capacity_kg / 1000).toFixed(1)} طن</strong> ({c.capacity_kg.toLocaleString()} كغ)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">إجمالي مبيعات النشاط</span>
                <span className="text-sm font-black font-mono text-emerald-700">
                  +{(c.total_sales || 0).toLocaleString()} د.ج
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                {c.status === 'ACTIVE' ? 'نشط 🟢' : 'موسمي 🟠'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Commerce Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCommerce ? 'تعديل نشاط تجاري' : 'إضافة نشاط تجاري جديد'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">اسم المقر / المحل التجارية</label>
            <input
              type="text"
              required
              placeholder="مثال: مؤسسة الفلاح لتصدير التمور"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 text-sm border rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">السوق / المقر الرئيسي</label>
            <input
              type="text"
              required
              placeholder="مثال: سوق الجملة للتمور طولقة"
              value={marketName}
              onChange={(e) => setMarketName(e.target.value)}
              className="w-full p-2.5 text-sm border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">سعر الكيلوغرام المرجعي (د.ج)</label>
              <input
                type="number"
                required
                min={0}
                value={kgPrice}
                onChange={(e) => setKgPrice(Number(e.target.value))}
                className="w-full p-2.5 text-sm border rounded-xl font-bold font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">السعة التخزينية (كغ)</label>
              <input
                type="number"
                required
                min={0}
                value={capacityKg}
                onChange={(e) => setCapacityKg(Number(e.target.value))}
                className="w-full p-2.5 text-sm border rounded-xl font-bold font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">حالة النشاط التجاري</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full p-2.5 text-sm border rounded-xl font-bold bg-white"
            >
              <option value="ACTIVE">نشط (سوق دائم)</option>
              <option value="SEASONAL">موسمي (موسم التمور والجني فقط)</option>
              <option value="CLOSED">مغلق مؤقتاً</option>
            </select>
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
              className="px-5 py-2 text-xs font-bold bg-amber-600 text-white rounded-xl shadow"
            >
              {editingCommerce ? 'حفظ التعديلات' : 'إضافة النشاط'}
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
