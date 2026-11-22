import type { CategoryTotal } from '@/lib/reports';
import { inr } from '@/lib/supabase';
import { PieChart } from 'lucide-react';

interface CategoryBarsProps {
  data: CategoryTotal[];
}

export default function CategoryBars({ data }: CategoryBarsProps) {
  const max = data.length > 0 ? data[0].total : 0;

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">Spending by category</h3>
          <p className="text-xs font-medium text-slate-400">This month · top categories first</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-4 ring-teal-100">
          <PieChart className="h-4.5 w-4.5" />
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <PieChart className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-500">No expenses this month yet</p>
          <p className="mt-1 text-xs text-slate-400">Add a transaction to see your breakdown</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((c) => {
            const pct = max > 0 ? (c.total / max) * 100 : 0;
            return (
              <div key={c.category}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{c.category}</span>
                  <span className="text-sm font-medium text-slate-500">{inr(c.total)}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-500 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
