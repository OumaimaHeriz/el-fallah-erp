import React, { useEffect, useState } from 'react';
import { Client } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { ClientStatementModal } from '../components/ClientStatementModal';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  BookUser, PlusCircle, Edit3, Trash2, Phone, 
  MapPin, CreditCard, FileText, CheckCircle2, AlertCircle
} from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const { t } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Selected client for statement modal
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await api.getClients();
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleOpenAdd = () => {
    setEditingClient(null);
    setName('');
    setPhone('');
    setAddress('');
    setNotes('');
    setIsClientModalOpen(true);
  };

  const handleOpenEdit = (c: Client) => {
    setEditingClient(c);
    setName(c.name);
    setPhone(c.phone);
    setAddress(c.address);
    setNotes(c.notes || '');
    setIsClientModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient && editingClient.id) {
      await api.updateClient({
        id: editingClient.id,
        name,
        phone,
        address,
        notes
      });
    } else {
      await api.addClient({
        name,
        phone,
        address,
        notes
      });
    }
    setIsClientModalOpen(false);
    loadClients();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await api.deleteClient(deleteId);
      setDeleteId(null);
      loadClients();
    }
  };

  const totalCreditDebt = clients.reduce((sum, c) => sum + (c.balance || 0), 0);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
            <BookUser className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">{t('clients')} ودفتر الكريدي</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              متابعة الزبائن، المبيعات الآجلة، إجمالي الديون المستحقة: <strong className="text-rose-700 font-mono text-sm font-bold">{totalCreditDebt.toLocaleString()} د.ج</strong>
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة زبون جديد</span>
        </button>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((c) => {
          const hasDebt = (c.balance || 0) > 0;
          return (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      hasDebt ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {hasDebt ? 'عليه كريدي (دَيْن)' : 'خالص الذمة ✓'}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-lg mt-2">{c.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenEdit(c)} className="p-1.5 text-slate-400 hover:text-palm">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => c.id && setDeleteId(c.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-4 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="font-mono">{c.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{c.address}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl border">
                    <span className="text-slate-500 font-bold block text-[10px]">مجموع المشتريات</span>
                    <span className="font-mono font-bold text-slate-800">{(c.total_purchases || 0).toLocaleString()} د.ج</span>
                  </div>
                  <div className={`p-2 rounded-xl border ${hasDebt ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <span className="text-slate-500 font-bold block text-[10px]">الكريدي المتبقي</span>
                    <span className={`font-mono font-black ${hasDebt ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {(c.balance || 0).toLocaleString()} د.ج
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedClient(c)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow"
              >
                <FileText className="w-4 h-4 text-deglet-gold" />
                <span>فتح كشف الحساب وسجل المبيعات</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Client Modal */}
      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title={editingClient ? 'تعديل بيانات الزبون' : 'إضافة زبون جديد'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">اسم الزبون / الشركة</label>
            <input
              type="text"
              required
              placeholder="مثال: شركة التاج لتوزيع التمور"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 text-sm border rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">رقم الهاتف</label>
            <input
              type="text"
              required
              placeholder="0661..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 text-sm border rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">العنوان / الولاية</label>
            <input
              type="text"
              required
              placeholder="مثال: الشراقة، الجزائر العاصمة"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 text-sm border rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">ملاحظات إضافية</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 text-sm border rounded-xl"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setIsClientModalOpen(false)} className="px-4 py-2 text-xs font-bold bg-slate-100 rounded-xl">إلغاء</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl shadow">{editingClient ? 'حفظ التعديلات' : 'إضافة الزبون'}</button>
          </div>
        </form>
      </Modal>

      {/* Client Statement Modal */}
      <ClientStatementModal
        isOpen={selectedClient !== null}
        onClose={() => setSelectedClient(null)}
        client={selectedClient}
        onRefreshClients={loadClients}
      />

      {/* Confirm Delete */}
      <ConfirmModal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
};
