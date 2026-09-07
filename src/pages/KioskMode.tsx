import React, { useState } from 'react';
import { api } from '../services/api';
import { Worker } from '../types';
import { KeyRound, CheckCircle2, AlertCircle, Sprout, ArrowRight } from 'lucide-react';

interface KioskModeProps {
  onExitKiosk: () => void;
}

export const KioskMode: React.FC<KioskModeProps> = ({ onExitKiosk }) => {
  const [pin, setPin] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string; worker?: Worker } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleClear = () => {
    setPin('');
    setStatusMessage(null);
  };

  const handleVerify = async () => {
    if (pin.length !== 4) return;
    setLoading(true);
    try {
      const worker = await api.verifyKioskPin(pin);
      if (worker) {
        // Record attendance
        await api.recordAttendance({
          worker_id: worker.id!,
          date: new Date().toISOString().split('T')[0],
          status: 'PRESENT',
          notes: 'تسجيل بصمة عبر كشك الحائط (Kiosk Mode)'
        });

        setStatusMessage({
          type: 'success',
          text: `أهلاً وسهلاً بك يا ${worker.name}! تم تسجيل حضورك اليوم بنجاح 🌿`,
          worker
        });
        setPin('');
      } else {
        setStatusMessage({
          type: 'error',
          text: 'رمز PIN غير صحيح! يرجى إعادة المحاولة أو مراجعة المشرف.'
        });
        setPin('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative font-arabic selection:bg-none select-none">
      {/* Top Exit Button */}
      <button
        onClick={onExitKiosk}
        className="absolute top-6 right-6 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 text-xs font-bold flex items-center gap-2 transition-all"
      >
        <ArrowRight className="w-4 h-4" />
        <span>الخروج من وضع الكشك</span>
      </button>

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-palm to-deglet-gold flex items-center justify-center shadow-lg shadow-palm/40 mb-4">
          <Sprout className="w-9 h-9 text-slate-950 stroke-[2.5]" />
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight">كشك بصمة العمال الحائطي</h2>
        <p className="text-xs text-deglet-amber font-semibold mt-1">
          أدخل كود الـ PIN الخاص بك لتأكيد الحضور اليومي
        </p>

        {/* PIN Display Boxes */}
        <div className="flex gap-3 my-6">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-14 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-mono font-black transition-all ${
                pin[index]
                  ? 'border-deglet-gold bg-slate-800 text-deglet-gold scale-105 shadow-md shadow-deglet-gold/20'
                  : 'border-slate-800 bg-slate-950/60 text-slate-600'
              }`}
            >
              {pin[index] ? '•' : ''}
            </div>
          ))}
        </div>

        {/* Feedback Message */}
        {statusMessage && (
          <div className={`w-full p-3.5 rounded-2xl mb-6 text-xs font-extrabold flex items-center justify-center gap-2 animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-14 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xl font-bold font-mono rounded-2xl border border-slate-700 shadow-md transition-all flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-14 bg-rose-900/60 hover:bg-rose-800/80 active:scale-95 text-rose-300 text-sm font-bold rounded-2xl border border-rose-800/60 transition-all flex items-center justify-center"
          >
            مسح C
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xl font-bold font-mono rounded-2xl border border-slate-700 shadow-md transition-all flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleVerify}
            disabled={pin.length !== 4 || loading}
            className={`h-14 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center ${
              pin.length === 4
                ? 'bg-gradient-to-r from-palm to-palm-light text-white shadow-palm/40 hover:scale-105'
                : 'bg-slate-800 text-slate-600 border border-slate-800 cursor-not-allowed'
            }`}
          >
            {loading ? 'جاري...' : 'تأكيد ✓'}
          </button>
        </div>
      </div>
    </div>
  );
};
