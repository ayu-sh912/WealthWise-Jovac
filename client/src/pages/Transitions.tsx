import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Inbox,
} from 'lucide-react';
import TransactionForm from '@/components/TransactionForm';
import { fetchTransactions } from '@/lib/reports';
import { supabase, inr, formatDate, type Transaction, type TransactionType, type Category } from '@/lib/supabase';

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function availableMonths(): { value: string; label: string }[] {
  const now = new Date();
  const months: { value: string; label: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
    months.push({ value, label });
  }
  return months;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [monthFilter, setMonthFilter] = useState('');
  const [editing, setEditing] = useState<Transaction | null>(null);

  const months = availableMonths();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTransactions(typeFilter, monthFilter || undefined);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, monthFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (data: {
    type: TransactionType;
    amount: number;
    category: Category;
    date: string;
    note: string;
  }) => {
    if (editing) {
      const { error: updateError } = await supabase
        .from('transactions')
        .update(data)
        .eq('id', editing.id);
      if (updateError) throw new Error(updateError.message);
      setEditing(null);
    } else {
      const { error: insertError } = await supabase.from('transactions').insert(data);
      if (insertError) throw new Error(insertError.message);
    }
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this transaction? This cannot be undone.')) return;
    const { error: delError } = await supabase.from('transactions').delete().eq('id', id);
    if (delError) {
      setError(delError.message);
      return;
    }
    await load();
  };

  const startEdit = (t: Transaction) => {
    setEditing(t);
    setError('');
  };

  const cancelEdit = () => setEditing(null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transactions</h1>
        <p className="mt-1 text-sm text-slate-500">Add, edit and filter your income and expenses.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        {/* Form */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <TransactionForm editing={editing} onSubmit={handleSubmit} onCancelEdit={cancelEdit} />
        </div>

        {/* List */}
        <div>
          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              {(['all', 'income', 'expense'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                    typeFilter === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t === 'all' ? 'All' : t}
                </button>
              ))}
            </div>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none transition-all focus:border-teal-500"
            >
              <option value="">All months</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Inbox className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600">No transactions found</p>
              <p className="mt-1 text-xs text-slate-400">
                {typeFilter !== 'all' || monthFilter ? 'Try changing your filters.' : 'Add one using the form.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((t) => {
                const isIncome = t.type === 'income';
                return (
                  <div
                    key={t.id}
                    className="group flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {isIncome ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {t.note || t.category}
                        </p>
                        <span className="hidden shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 sm:inline">
                          {t.category}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">{formatDate(t.date)}</p>
                    </div>

                    <p
                      className={`shrink-0 text-sm font-bold ${isIncome ? 'text-emerald-600' : 'text-slate-800'}`}
                    >
                      {isIncome ? '+' : '-'}
                      {inr(Number(t.amount))}
                    </p>

                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => startEdit(t)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

