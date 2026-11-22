import type { MonthlyPoint } from '@/lib/reports';
import { inr } from '@/lib/supabase';

interface MonthChartProps {
  data: MonthlyPoint[];
}

export default function MonthChart({ data }: MonthChartProps) {
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">Monthly trend</h3>
          <p className="text-xs font-medium text-slate-400">Last 6 months · income vs expense</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2.5 w-2.5 rounded-sm bg-teal-500" /> Income
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-400" /> Expense
          </span>
        </div>
      </div>

      <div className="flex h-52 items-end justify-between gap-3 sm:gap-6">
        {data.map((d) => (
          <div key={`${d.year}-${d.month}`} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-44 w-full items-end justify-center gap-1.5">
              <div
                className="group relative w-full max-w-[22px] rounded-t-md bg-gradient-to-t from-teal-600 to-teal-400 transition-all duration-500 ease-out hover:from-teal-700 hover:to-teal-500"
                style={{ height: `${(d.income / max) * 100}%` }}
              >
                <Tooltip amount={d.income} />
              </div>
              <div
                className="group relative w-full max-w-[22px] rounded-t-md bg-gradient-to-t from-red-500 to-red-300 transition-all duration-500 ease-out hover:from-red-600 hover:to-red-400"
                style={{ height: `${(d.expense / max) * 100}%` }}
              >
                <Tooltip amount={d.expense} />
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tooltip({ amount }: { amount: number }) {
  return (
    <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
      {inr(amount)}
    </div>
  );
}
