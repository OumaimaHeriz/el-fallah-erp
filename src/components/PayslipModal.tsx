import React from 'react';
import { Modal } from './Modal';
import { Worker } from '../types';
import { Printer, Sprout } from 'lucide-react';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: Worker | null;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  isOpen,
  onClose,
  worker
}) => {
  if (!worker) return null;

  const handlePrint = () => {
    window.print();
  };

  const daysWorked = worker.total_days_worked || 0;
  const grossEarned = worker.total_earned || 0;
  const advances = worker.total_advances || 0;
  const netPaid = worker.remaining_payout || 0;
  const todayStr = new Date().toLocaleDateString('ar-DZ');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="وصل خلاص مستحقات عامل" maxWidth="lg">
      <div id="printable-payslip" className="p-6 bg-amber-50/40 border border-amber-200/80 rounded-2xl text-slate-900 font-arabic relative">
        {/* Document Header */}
        <div className="flex items-center justify-between border-b-2 border-palm pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-palm text-deglet-gold flex items-center justify-center font-bold">
              <Sprout className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-palm">مؤسسة الفلاح لإنتاج وتجارة التمور</h2>
              <p className="text-xs font-semibold text-slate-600">بسكرة - طولقة • ولاية بسكرة</p>
            </div>
          </div>
          <div className="text-left">
            <span className="px-3 py-1 bg-palm/10 text-palm font-black rounded-lg text-xs">
              وصل خلاص رقم #{Date.now().toString().slice(-5)}
            </span>
            <p className="text-xs font-semibold text-slate-500 mt-1">تاريخ الإصدار: {todayStr}</p>
          </div>
        </div>

        {/* Worker Info Card */}
        <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200 mb-6 text-sm">
          <div>
            <span className="text-slate-500 font-bold block text-xs">اسم العامل:</span>
            <span className="font-extrabold text-slate-900 text-base">{worker.name}</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-xs">الوظيفة / الدور:</span>
            <span className="font-bold text-slate-800">{worker.role}</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-xs">رقم الهاتف:</span>
            <span className="font-mono font-bold text-slate-800">{worker.phone}</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-xs">الأجرة اليومية الاتفاقية:</span>
            <span className="font-bold text-emerald-700">{worker.daily_rate.toLocaleString()} د.ج</span>
          </div>
        </div>

        {/* Calculation Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b">
              <tr>
                <th className="p-3">البيان</th>
                <th className="p-3 text-center">العدد / الأيام</th>
                <th className="p-3 text-left">المبلغ (د.ج)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="p-3">إجمالي أيـام العمل المحسوبة</td>
                <td className="p-3 text-center font-bold">{daysWorked} يوم</td>
                <td className="p-3 text-left font-mono font-bold">{grossEarned.toLocaleString()} د.ج</td>
              </tr>
              <tr className="bg-rose-50/50 text-rose-900">
                <td className="p-3">خصم إجمالي التسبيقات (الأفونس)</td>
                <td className="p-3 text-center text-slate-400">-</td>
                <td className="p-3 text-left font-mono font-bold">-{advances.toLocaleString()} د.ج</td>
              </tr>
            </tbody>
            <tfoot className="bg-emerald-50 border-t-2 border-emerald-500 font-black text-emerald-950">
              <tr>
                <td className="p-3.5 text-base" colSpan={2}>الصافي الخالص المستلم نقدًا:</td>
                <td className="p-3.5 text-left text-lg font-mono text-emerald-800">
                  {netPaid.toLocaleString()} د.ج
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-300 text-xs font-bold text-slate-700">
          <div className="text-center h-20 flex flex-col justify-between">
            <span>توقيع وبصمة العامل:</span>
            <span className="text-slate-400 font-mono">...............................................</span>
          </div>
          <div className="text-center h-20 flex flex-col justify-between">
            <span>توقيع وخاتم المشرف:</span>
            <span className="text-palm font-black">إدارة مؤسسة الفلاح</span>
          </div>
        </div>
      </div>

      {/* Modal Controls */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm"
        >
          إغلاق
        </button>
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-palm hover:bg-palm-dark text-white font-bold rounded-xl text-sm shadow-md flex items-center gap-2"
        >
          <Printer className="w-4 h-4 text-deglet-gold" />
          <span>طباعة الوصل</span>
        </button>
      </div>
    </Modal>
  );
};
