import React, { useEffect, useState } from 'react';
import { Worker, AttendanceLog, Farm, Commerce } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { PayslipModal } from '../components/PayslipModal';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  Users, PlusCircle, CalendarCheck, Banknote, Edit3, 
  Trash2, Printer, CheckCircle, XCircle, Clock, KeyRound, Phone
} from 'lucide-react';

export const WorkersPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'directory' | 'attendance' | 'payroll'>('directory');

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<AttendanceLog[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected date for attendance ledger
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal states
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Payslip modal state
  const [payslipWorker, setPayslipWorker] = useState<Worker | null>(null);

  // Advance modal state
  const [advanceWorker, setAdvanceWorker] = useState<Worker | null>(null);
  const [advanceAmount, setAdvanceAmount] = useState<number>(3000);
  const [advanceNotes, setAdvanceNotes] = useState<string>('تسبيق مصاريف عائلية');

  // Form states for worker
  const [name, setName] = useState('');
  const [role, setRole] = useState('جناء / قطاف نخيل');
  const [phone, setPhone] = useState('');
  const [dailyRate, setDailyRate] = useState<number>(3500);
  const [pinCode, setPinCode] = useState('1234');

  const loadData = async () => {
    setLoading(true);
    try {
      const [wList, aLogs, fList, cList] = await Promise.all([
        api.getWorkers(),
        api.getAttendanceLogs(selectedDate),
        api.getFarms(),
        api.getCommerces()
      ]);
      setWorkers(wList);
      setAttendance(aLogs);
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
  }, [selectedDate]);

  const handleOpenAddWorker = () => {
    setEditingWorker(null);
    setName('');
    setRole('جناء / قطاف نخيل');
    setPhone('');
    setDailyRate(3500);
    setPinCode('1234');
    setIsWorkerModalOpen(true);
  };

  const handleOpenEditWorker = (w: Worker) => {
    setEditingWorker(w);
    setName(w.name);
    setRole(w.role);
    setPhone(w.phone);
    setDailyRate(w.daily_rate);
    setPinCode(w.pin_code);
    setIsWorkerModalOpen(true);
  };

  const handleSaveWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWorker && editingWorker.id) {
      await api.updateWorker({
        id: editingWorker.id,
        name,
        role,
        phone,
        daily_rate: Number(dailyRate),
        pin_code: pinCode,
        status: 'ACTIVE'
      });
    } else {
      await api.addWorker({
        name,
        role,
        phone,
        daily_rate: Number(dailyRate),
        pin_code: pinCode,
        status: 'ACTIVE'
      });
    }
    setIsWorkerModalOpen(false);
    loadData();
  };

  const handleDeleteWorker = async () => {
    if (deleteId) {
      await api.deleteWorker(deleteId);
      setDeleteId(null);
      loadData();
    }
  };

  const handleMarkAttendance = async (workerId: number, status: 'PRESENT' | 'ABSENT' | 'HALF_DAY', farmId?: number) => {
    await api.recordAttendance({
      worker_id: workerId,
      date: selectedDate,
      status,
      farm_id: farmId || (farms.length > 0 ? farms[0].id : undefined)
    });
    loadData();
  };

  const handleAddAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advanceWorker?.id) return;
    await api.addWorkerPayment({
      worker_id: advanceWorker.id,
      amount: Number(advanceAmount),
      payment_type: 'ADVANCE',
      payment_date: selectedDate,
      notes: advanceNotes
    });
    setAdvanceWorker(null);
    loadData();
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Users className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">{t('workers')} والحضور والأجور</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              سجل العمال، كراس الحضور اليومي، التسبيقات (الأفونس) وطباعة وصولات خلاص المستحقات.
            </p>
          </div>
        </div>

        {activeTab === 'directory' && (
          <button
            onClick={handleOpenAddWorker}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل عامل جديد</span>
          </button>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-5 py-3 text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'directory'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>سجل العمال ({workers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-5 py-3 text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>كراس الحضور اليومي</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-5 py-3 text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'payroll'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>التسبيقات والأجور (وصولات الخلاص)</span>
        </button>
      </div>

      {/* TAB 1: WORKER DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.map((w) => (
            <div key={w.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 relative group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                    {w.role}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-lg mt-2">{w.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenEditWorker(w)} className="p-1.5 text-slate-400 hover:text-blue-600">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => w.id && setDeleteId(w.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-mono">{w.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>الأجرة اليومية: <strong className="text-emerald-700 font-mono text-sm">{w.daily_rate.toLocaleString()} د.ج</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>رمز البصمة PIN: <strong className="font-mono text-slate-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{w.pin_code}</strong></span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold">أيام العمل: {w.total_days_worked || 0} يوم</span>
                <span className="font-mono font-bold text-blue-700">الصافي: {(w.remaining_payout || 0).toLocaleString()} د.ج</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: DAILY ATTENDANCE LEDGER */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-100 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-700">تاريخ سجل الحضور:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 text-sm font-bold font-mono border rounded-lg bg-white"
              />
            </div>
            <span className="text-xs font-bold text-slate-500">
              عدد العمال الحاضرين اليوم: {attendance.filter(a => a.status === 'PRESENT').length} عامل
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-4">اسم العامل</th>
                  <th className="p-4">الوظيفة</th>
                  <th className="p-4">الأجرة اليومية</th>
                  <th className="p-4">حالة الحضور اليوم</th>
                  <th className="p-4 text-center">إجراء تسجيل الحضور السريع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {workers.map((w) => {
                  const currentLog = attendance.find(a => a.worker_id === w.id);
                  const currentStatus = currentLog?.status;
                  return (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="p-4 font-extrabold text-slate-900">{w.name}</td>
                      <td className="p-4 text-xs font-bold text-slate-600">{w.role}</td>
                      <td className="p-4 font-mono font-bold text-emerald-700">{w.daily_rate.toLocaleString()} د.ج</td>
                      <td className="p-4">
                        {currentStatus === 'PRESENT' && (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs inline-flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> حاضر (يوم كامل)
                          </span>
                        )}
                        {currentStatus === 'HALF_DAY' && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-xs inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> نصف يوم (0.5)
                          </span>
                        )}
                        {currentStatus === 'ABSENT' && (
                          <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full font-bold text-xs inline-flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> غائب
                          </span>
                        )}
                        {!currentStatus && (
                          <span className="text-slate-400 text-xs font-bold">لم يسجل بعد</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => w.id && handleMarkAttendance(w.id, 'PRESENT')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'PRESENT' ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            حاضر
                          </button>
                          <button
                            onClick={() => w.id && handleMarkAttendance(w.id, 'HALF_DAY')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'HALF_DAY' ? 'bg-amber-500 text-white' : 'bg-slate-100 hover:bg-amber-100 text-amber-800'
                            }`}
                          >
                            نصف يوم
                          </button>
                          <button
                            onClick={() => w.id && handleMarkAttendance(w.id, 'ABSENT')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'ABSENT' ? 'bg-rose-600 text-white' : 'bg-slate-100 hover:bg-rose-100 text-rose-800'
                            }`}
                          >
                            غائب
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ADVANCES & PAYROLL */}
      {activeTab === 'payroll' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-900 text-white font-bold">
              <tr>
                <th className="p-4">اسم العامل</th>
                <th className="p-4">الوظيفة</th>
                <th className="p-4">أيام العمل</th>
                <th className="p-4">المستحق الإجمالي</th>
                <th className="p-4 text-rose-400">التسبيقات (أفونس)</th>
                <th className="p-4 text-emerald-400">الصافي الخالص</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {workers.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50">
                  <td className="p-4 font-extrabold text-slate-900">{w.name}</td>
                  <td className="p-4 text-xs font-bold text-slate-600">{w.role}</td>
                  <td className="p-4 font-bold font-mono">{w.total_days_worked || 0} يوم</td>
                  <td className="p-4 font-bold font-mono text-slate-900">{(w.total_earned || 0).toLocaleString()} د.ج</td>
                  <td className="p-4 font-bold font-mono text-rose-600">{(w.total_advances || 0).toLocaleString()} د.ج</td>
                  <td className="p-4 font-extrabold font-mono text-emerald-700 text-base">
                    {(w.remaining_payout || 0).toLocaleString()} د.ج
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setAdvanceWorker(w)}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold border border-rose-200"
                      >
                        + تسبيق (أفونس)
                      </button>
                      <button
                        onClick={() => setPayslipWorker(w)}
                        className="px-3 py-1.5 bg-palm text-white hover:bg-palm-dark rounded-lg text-xs font-bold flex items-center gap-1 shadow"
                      >
                        <Printer className="w-3.5 h-3.5 text-deglet-gold" />
                        <span>وصل خلاص</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Worker Modal */}
      <Modal isOpen={isWorkerModalOpen} onClose={() => setIsWorkerModalOpen(false)} title={editingWorker ? 'تعديل بيانات العامل' : 'تسجيل عامل جديد'}>
        <form onSubmit={handleSaveWorker} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">اسم العامل الثلاثي</label>
            <input
              type="text"
              required
              placeholder="مثال: كمال طاهري"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 text-sm border rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">الوظيفة / الدور في المزرعة</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2.5 text-sm border rounded-xl font-bold bg-white"
            >
              <option value="جناء / قطاف نخيل">جناء / قطاف نخيل (موسمي)</option>
              <option value="سقي وخدمة الأرض">سقي وخدمة الأرض (دائم)</option>
              <option value="توضيب وتغليف التمور">توضيب وتغليف التمور</option>
              <option value="سائق شاحنة ونقل">سائق شاحنة ونقل</option>
              <option value="مشرف المزرعة والجناء">مشرف المزرعة والجناء</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <label className="text-xs font-bold text-slate-700 block mb-1">الأجرة اليومية (د.ج)</label>
              <input
                type="number"
                required
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                className="w-full p-2.5 text-sm border rounded-xl font-bold font-mono text-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">رمز الـ PIN للبصمة (4 أرقام لكشك Wall Kiosk)</label>
            <input
              type="text"
              required
              maxLength={4}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="w-full p-2.5 text-sm border rounded-xl font-mono text-center font-bold text-lg tracking-widest text-amber-700 bg-amber-50"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setIsWorkerModalOpen(false)} className="px-4 py-2 text-xs font-bold bg-slate-100 rounded-xl">إلغاء</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl shadow">{editingWorker ? 'حفظ التعديلات' : 'تسجيل العامل'}</button>
          </div>
        </form>
      </Modal>

      {/* Advance Modal */}
      <Modal isOpen={advanceWorker !== null} onClose={() => setAdvanceWorker(null)} title={`تسجيل تسبيق مال (أفونس) للعامل: ${advanceWorker?.name}`}>
        <form onSubmit={handleAddAdvance} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">مبلغ التسبيق / الأفونس (د.ج)</label>
            <input
              type="number"
              required
              min={500}
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(Number(e.target.value))}
              className="w-full p-2.5 text-sm border rounded-xl font-bold font-mono text-rose-700"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">ملاحظات / السبب</label>
            <input
              type="text"
              value={advanceNotes}
              onChange={(e) => setAdvanceNotes(e.target.value)}
              className="w-full p-2.5 text-sm border rounded-xl"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setAdvanceWorker(null)} className="px-4 py-2 text-xs font-bold bg-slate-100 rounded-xl">إلغاء</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl shadow">تأكيد التسبيق</button>
          </div>
        </form>
      </Modal>

      {/* Payslip Modal */}
      <PayslipModal isOpen={payslipWorker !== null} onClose={() => setPayslipWorker(null)} worker={payslipWorker} />

      {/* Confirm Delete */}
      <ConfirmModal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={handleDeleteWorker} />
    </div>
  );
};
