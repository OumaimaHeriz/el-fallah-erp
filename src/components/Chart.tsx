import React from 'react';

interface MonthlyFlowData {
  month: string;
  income: number;
  expense: number;
}

interface ChartProps {
  data: MonthlyFlowData[];
}

export const FinancialChart: React.FC<ChartProps> = ({ data }) => {
  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1000000);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg">مخطط التدفق المالي الشهري</h3>
          <p className="text-xs text-slate-500 font-medium">مقارنة المداخيل والمصاريف بالدينار الجزائري (د.ج)</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-700">المداخيل (+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span className="text-slate-700">المصاريف (-)</span>
          </div>
        </div>
      </div>

      {/* Chart Bars */}
      <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-200 px-2">
        {data.map((item, index) => {
          const incomeHeight = (item.income / maxVal) * 100;
          const expenseHeight = (item.expense / maxVal) * 100;

          return (
            <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div className="w-full flex items-end justify-center gap-1.5 h-full relative">
                {/* Income Bar */}
                <div
                  style={{ height: `${Math.max(incomeHeight, 6)}%` }}
                  className="w-1/2 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all duration-500 group-hover:brightness-110 relative"
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-bold whitespace-nowrap z-20 pointer-events-none transition-opacity">
                    +{item.income.toLocaleString()} د.ج
                  </div>
                </div>

                {/* Expense Bar */}
                <div
                  style={{ height: `${Math.max(expenseHeight, 6)}%` }}
                  className="w-1/2 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-lg transition-all duration-500 group-hover:brightness-110 relative"
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-bold whitespace-nowrap z-20 pointer-events-none transition-opacity">
                    -{item.expense.toLocaleString()} د.ج
                  </div>
                </div>
              </div>

              {/* Month Label */}
              <span className="text-xs font-extrabold text-slate-600 mt-3">
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
