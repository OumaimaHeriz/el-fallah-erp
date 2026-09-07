import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'rose' | 'amber' | 'blue' | 'purple';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'emerald',
  trend
}) => {
  const variantStyles = {
    emerald: {
      bg: 'from-emerald-50 to-teal-50/50 border-emerald-200/80',
      iconBg: 'bg-emerald-600 text-white shadow-emerald-500/20',
      textColor: 'text-emerald-950',
      valColor: 'text-emerald-700'
    },
    rose: {
      bg: 'from-rose-50 to-red-50/50 border-rose-200/80',
      iconBg: 'bg-rose-600 text-white shadow-rose-500/20',
      textColor: 'text-rose-950',
      valColor: 'text-rose-700'
    },
    amber: {
      bg: 'from-amber-50 to-orange-50/50 border-amber-200/80',
      iconBg: 'bg-amber-600 text-white shadow-amber-500/20',
      textColor: 'text-amber-950',
      valColor: 'text-amber-800'
    },
    blue: {
      bg: 'from-blue-50 to-sky-50/50 border-blue-200/80',
      iconBg: 'bg-blue-600 text-white shadow-blue-500/20',
      textColor: 'text-blue-950',
      valColor: 'text-blue-700'
    },
    purple: {
      bg: 'from-purple-50 to-indigo-50/50 border-purple-200/80',
      iconBg: 'bg-purple-600 text-white shadow-purple-500/20',
      textColor: 'text-purple-950',
      valColor: 'text-purple-700'
    }
  };

  const style = variantStyles[variant];

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${style.bg} border shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-extrabold uppercase tracking-wider ${style.textColor}`}>
            {title}
          </p>
          <h3 className={`text-2xl font-black mt-2 ${style.valColor} tracking-tight`}>
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl ${style.iconBg} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 stroke-[2.2]" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold">
          <span className="text-slate-500">التدفق مقارنة بالشهر السابق</span>
          <span className="px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-700">
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};
