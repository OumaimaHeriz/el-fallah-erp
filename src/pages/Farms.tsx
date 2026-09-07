import React, { useEffect, useState } from 'react';
import { Farm } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  TreePalm, PlusCircle, Edit3, Trash2, MapPin, 
  Sprout, TrendingUp, TrendingDown, DollarSign
} from 'lucide-react';

export const FarmsPage: React.FC = () => {
  const { t } = useLanguage();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [dateVariety, setDateVariety] = useState('دقلة نور ممتازة');
  const [palmCount, setPalmCount] = useState<number>(500);
  const [status, setStatus] = useState<'ACTIVE' | 'MAINTENANCE' | 'HARVESTING'>('HARVESTING');

  const loadFarms = async () => {
    setLoading(true);
    try {
      const data = await api.getFarms();
      setFarms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  const handleOpenAdd = () => {
    setEditingFarm(null);
    setName('');
    setLocation('');
    setDateVariety('دقلة نور ممتازة');
    setPalmCount(500);
    setStatus('HARVESTING');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (farm: Farm) => {
    setEditingFarm(farm);
    setName(farm.name);
    setLocation(farm.location);
    setDateVariety(farm.date_variety);
    setPalmCount(farm.palm_count);
    setStatus(farm.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFarm && editingFarm.id) {
      await api.updateFarm({
        id: editingFarm.id,
        name,
        location,
        date_variety: dateVariety,
        palm_count: Number(palmCount),
        status
      });
    } else {
      await api.addFarm({
        name,
        location,
        date_variety: dateVariety,
        palm_count: Number(palmCount),
        status
      });
    }

    setIsModalOpen(false);
    loadFarms();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await api.deleteFarm(deleteId);
      setDeleteId(null);
      loadFarms();
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-palm-dark to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-palm-light to-deglet-gold text-slate-950 flex items-center justify-center shadow-lg">
            <TreePalm className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black">{t('farms')} (واحات طولقة وبسكرة)</h2>
            <p className="text-xs text-deglet-sand mt-0.5">
              متابعة الإنتاجية، أحواض النخيل، والجريد مع التدقيق المالي المستقل لكل مزرعة.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-deglet-gold text-slate-950 font-black rounded-xl text-sm shadow-md hover:scale-105 transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>إضافة مزرعة / واحة جديدة</span>
        </button>
      </div>

      {/* Farms Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farms.map((farm) => {
          const profit = farm.net_profit || 0;
          return (
            <div
              key={farm.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div className="p-6 space-y-4">
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                      farm.status === 'HARVESTING' 
                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {farm.status === 'HARVESTING' ? 'موسم الجني' : 'خدمة وسقي'}
                    </span>
                    <h3 className="font-black text-slate-900 text-lg mt-2 group-hover:text-palm transition-colors">
                      {farm.name}
                    </h3>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenEdit(farm)}
                      className="p-1.5 text-slate-400 hover:text-palm rounded-lg hover:bg-slate-100"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => farm.id && setDeleteId(farm.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Location & Variety */}
                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-deglet-dark" />
                    <span>الموقع: {farm.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sprout className="w-4 h-4 text-palm" />
                    <span>الصنف: <strong className="text-slate-900">{farm.date_variety}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TreePalm className="w-4 h-4 text-emerald-600" />
                    <span>عدد النخيل: <strong className="text-slate-900 font-mono text-sm">{farm.palm_count}</strong> نخلة</span>
                  </div>
                </div>

                {/* Financial breakdown per farm */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
                    <span className="text-slate-500 font-bold block text-[10px]">المداخيل</span>
                    <span className="font-mono font-bold text-emerald-700">{(farm.total_income || 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-rose-50/60 p-2 rounded-xl border border-rose-100">
                    <span className="text-slate-500 font-bold block text-[10px]">المصاريف</span>
                    <span className="font-mono font-bold text-rose-700">{(farm.total_expenses || 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-amber-50/60 p-2 rounded-xl border border-amber-100">
                    <span className="text-slate-500 font-bold block text-[10px]">صافي الربح</span>
                    <span className="font-mono font-bold text-amber-800">{profit.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Bottom footer status */}
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>كود المزرعة: #{farm.id}</span>
                <span className="text-palm font-bold">تدقيق مالي نشط ✓</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Farm Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFarm ? 'تعديل بيانات الواحة' : 'إضافة مزرعة / واحة جديدة'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">اسم المزرعة / الواحة</label>
            <input
              type="text"
              required
              placeholder="مثال: واحة طولقة الكبرى - حوش بن زعمية"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 text-sm border rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">الموقع / المنطقة</label>
            <input
              type="text"
              required
              placeholder="مثال: طولقة، ولاية بسكرة"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2.5 text-sm border rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">صنف التمور الرئيسي</label>
            <select
              value={dateVariety}
              onChange={(e) => setDateVariety(e.target.value)}
              className="w-full p-2.5 text-sm border rounded-xl font-bold bg-white"
            >
              <option value="دقلة نور ممتازة">دقلة نور ممتازة (Deglet Nour)</option>
              <option value="غرس وطني">غرس وطني (Ghars)</option>
              <option value="مش دقلة">مش دقلة (Mech-Degla)</option>
              <option value="حمراية وبويقب">حمراية وبويقب</option>
              <option value="تشكيلة متنوعة">تشكيلة أصناف متنوعة</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">عدد النخيل</label>
              <input
                type="number"
                required
                min={1}
                value={palmCount}
                onChange={(e) => setPalmCount(Number(e.target.value))}
                className="w-full p-2.5 text-sm border rounded-xl font-bold font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">الحالة النفعية</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 text-sm border rounded-xl font-bold bg-white"
              >
                <option value="HARVESTING">موسم الجني والتلقيح</option>
                <option value="ACTIVE">خدمة وسقي عادي</option>
                <option value="MAINTENANCE">صيانة وتقليم</option>
              </select>
            </div>
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
              {editingFarm ? 'حفظ التعديلات' : 'إضافة المزرعة'}
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
