import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Client, ClientPurchase } from '../types';
import { api } from '../services/api';
import { Printer, PlusCircle, CheckCircle, Sprout, CreditCard } from 'lucide-react';

interface ClientStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onRefreshClients: () => void;
}

export const ClientStatementModal: React.FC<ClientStatementModalProps> = ({
  isOpen,
  onClose,
  client,
  onRefreshClients
}) => {
  const [purchases, setPurchases] = useState<ClientPurchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null);

  // New Purchase Form state
  const [description, setDescription] = useState('');
  const [weightKg, setWeightKg] = useState<number>(1000);
  const [unitPrice, setUnitPrice] = useState<number>(700);
  const [paidAmount, setPaidAmount] = useState<number>(0);

  const loadPurchases = async () => {
    if (!client?.id) return;
    setLoading(true);
    try {
      const data = await api.getClientPurchases(client.id);
      setPurchases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && client) {
      loadPurchases();
    }
  }, [isOpen, client]);

  if (!client) return null;

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client.id || !description) return;
    await api.addClientPurchase({
      client_id: client.id,
      date: new Date().toISOString().split('T')[0],
      item_description: description,
      weight_kg: Number(weightKg),
      unit_price: Number(unitPrice),
      total_amount: Number(weightKg) * Number(unitPrice),
      paid_amount: Number(paidAmount),
      remaining_amount: (Number(weightKg) * Number(unitPrice)) - Number(paidAmount)
    });
    setShowAddModal(false);
    setDescription('');
    loadPurchases();
    onRefreshClients();
  };

  const handlePayDebt = async (purchaseId: number) => {
    if (!payAmount || payAmount <= 0) return;
    await api.payClientDebt(purchaseId, payAmount);
    setPayAmount(0);
    setSelectedPurchaseId(null);
    loadPurchases();
    onRefreshClients();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`بروفايل وكشف حساب الزبون: ${client.name}`} maxWidth="2xl">
      <div className="space-y-6">
        {/* Top summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 block">مجموع المشتريات</span>
            <span className="text-lg font-black text-slate-900">{(client.total_purchases || 0).toLocaleString()} د.ج</span>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-emerald-950">
            <span className="text-xs font-bold text-emerald-600 block">المبلغ التسديد الفعلي</span>
            <span className="text-lg font-black text-emerald-700">{(client.total_paid || 0).toLocaleString()} د.ج</span>
          </div>
          <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-rose-950">
            <span className="text-xs font-bold text-rose-600 block">الكريدي المتبقي (الدّيْن)</span>
            <span className="text-lg font-black text-rose-700">{(client.balance || 0).toLocaleString()} د.ج</span>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between pt-2">
          <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <span>سجل المعاملات والشحنات المشتراة</span>
          </h4>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-palm hover:bg-palm-dark text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
            >
              <PlusCircle className="w-4 h-4 text-deglet-gold" />
              <span>تسجيل شحنة مبيعات</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
            >
              <Printer className="w-4 h-4 text-deglet-amber" />
              <span>طباعة الكشف</span>
            </button>
          </div>
        </div>

        {/* Add Purchase inline form modal */}
        {showAddModal && (
          <form onSubmit={handleCreatePurchase} className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 space-y-4">
            <h5 className="font-extrabold text-slate-900 text-sm">تسجيل عملية بيع تمور جديدة للزبون</h5>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">وصف التمور / الشحنة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 50 قنطار تمور دقلة نور طولقة درجة 1"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 text-sm border rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الوزن الإجمالي (كغ)</label>
                <input
                  type="number"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full p-2 text-sm border rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">سعر الكيلوغرام (د.ج)</label>
                <input
                  type="number"
                  required
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  className="w-full p-2 text-sm border rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">المبلغ الإجمالي المالي</label>
                <input
                  type="text"
                  disabled
                  value={`${(weightKg * unitPrice).toLocaleString()} د.ج`}
                  className="w-full p-2 text-sm bg-slate-200 border rounded-xl font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">المبلغ المدفوع تسليمًا (د.ج)</label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full p-2 text-sm border rounded-xl font-bold text-emerald-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-palm text-white rounded-lg text-xs font-bold"
              >
                حفظ الشحنة
              </button>
            </div>
          </form>
        )}

        {/* Purchases Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900 text-white font-bold">
              <tr>
                <th className="p-3">التاريخ</th>
                <th className="p-3">البيان والشحنة</th>
                <th className="p-3">الوزن / السعر</th>
                <th className="p-3">الإجمالي</th>
                <th className="p-3">المدفوع</th>
                <th className="p-3 text-rose-400">الكريدي</th>
                <th className="p-3 text-center">تسديد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    لا توجد مشتريات مسجلة لهذا الزبون حتى الآن.
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-600">{p.date}</td>
                    <td className="p-3 font-bold text-slate-800">{p.item_description}</td>
                    <td className="p-3">
                      {p.weight_kg} كغ × {p.unit_price} د.ج
                    </td>
                    <td className="p-3 font-bold font-mono text-slate-900">{p.total_amount.toLocaleString()} د.ج</td>
                    <td className="p-3 font-bold font-mono text-emerald-600">{p.paid_amount.toLocaleString()} د.ج</td>
                    <td className="p-3 font-bold font-mono text-rose-600">
                      {p.remaining_amount > 0 ? `${p.remaining_amount.toLocaleString()} د.ج` : 'خالص'}
                    </td>
                    <td className="p-3 text-center">
                      {p.remaining_amount > 0 ? (
                        selectedPurchaseId === p.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              placeholder="المبلغ"
                              value={payAmount || ''}
                              onChange={(e) => setPayAmount(Number(e.target.value))}
                              className="w-20 p-1 text-xs border rounded"
                            />
                            <button
                              onClick={() => p.id && handlePayDebt(p.id)}
                              className="p-1 bg-emerald-600 text-white rounded text-xs"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedPurchaseId(p.id || null)}
                            className="px-2 py-1 bg-amber-500 text-white rounded text-[11px] font-bold"
                          >
                            تسديد جزء
                          </button>
                        )
                      ) : (
                        <span className="text-emerald-600 font-bold">✓ مسدد بالكامل</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};
