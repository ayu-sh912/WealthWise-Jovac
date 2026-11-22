import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Target as TargetIcon } from 'lucide-react';
import StatCard from '@/components/StatCard';
import MonthChart from '@/components/MonthChart';
import CategoryBars from '@/components/CategoryBars';
import { fetchSummary, type ReportSummary } from '@/lib/reports';
import { fetchTransactions, fetchGoals } from '@/lib/reports';
import { inr } from '@/lib/supabase';

export default function Dashboard() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [txns, goals] = await Promise.all([fetchTransactions(), fetchGoals()]);
        const s = await fetchSummary(txns, goals);
        if (mounted) setSummary(s);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-7 w-7 animate-spin text-teal-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertCircle className="mb-3 h-10 w-10 text-red-400" />
        <p className="text-sm font-medium text-slate-600">{error}</p>
      </div>
    );
  }

  if (!summary) return null;

  const goalPct = summary.goalsTarget > 0 ? Math.min(100, (summary.goalsSaved / summary.goalsTarget) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Your full money picture at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Balance"
          value={inr(summary.balance)}
          tone="brand"
          sub="All-time net"
          negative={summary.balance < 0}
        />
        <StatCard label="Total income" value={inr(summary.income)} tone="pos" sub="All-time" />
        <StatCard label="Total expense" value={inr(summary.expense)} tone="neg" sub="All-time" />
        <StatCard
          label="Goals progress"
          value={`${goalPct.toFixed(0)}%`}
          tone="warn"
          sub={`${inr(summary.goalsSaved)} of ${inr(summary.goalsTarget)}`}
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MonthChart data={summary.monthly} />
        <CategoryBars data={summary.byCategory} />
      </div>

      {/* Goals summary strip */}
      {summary.goalsTarget > 0 && (
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <TargetIcon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Total savings progress</p>
              <p className="text-sm font-medium text-slate-500">
                {inr(summary.goalsSaved)} / {inr(summary.goalsTarget)}
              </p>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
                style={{ width: `${goalPct}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
