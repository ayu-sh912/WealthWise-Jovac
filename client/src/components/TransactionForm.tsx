import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, Plus, Save, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  CATEGORIES,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  type Transaction,
  type TransactionType,
  type Category,
} from '@/lib/supabase';

interface TransactionFormProps {
  editing: Transaction | null;
  onSubmit: (data: { type: TransactionType; amount: number; category: Category; date: string; note: string }) => Promise<void>;
  onCancelEdit: () => void;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function TransactionForm({ editing, onSubmit, onCancelEdit }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editing) {
      setType(editing.type);
      setAmount(String(editing.amount));
      setCategory(editing.category);
      setDate(editing.date);
      setNote(editing.note ?? '');
      setError('');
    }
  }, [editing]);

  // When type changes, ensure category is valid for that type
  useEffect(() => {
    const valid = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!valid.includes(category)) {
      setCategory(valid[0]);
    }
  }, [type, category]);

  const reset = () => {
    setType('expense');
    setAmount('');
    setCategory('Food');
    setDate(todayISO());
    setNote('');
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('Enter an amount greater than 0');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        type,
        amount: amt,
        category,
        date,
        note: note.trim() || '',
      });
      if (!editing) reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancelEdit();
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const placeholder = type === 'income' ? 'Source (e.g. March salary)' : 'Description (e.g. Grocery run)';

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800">
          {editing ? 'Edit transaction' : 'Add transaction'}
        </h3>
        {editing && (
          <button
            onClick={handleCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cancel edit"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ArrowDownRight className="h-4 w-4" /> Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ArrowUpRight className="h-4 w-4" /> Income
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Amount</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Note</label>
          <input
            type="text"
            maxLength={200}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : editing ? (
            <Save className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {editing ? 'Save changes' : 'Add transaction'}
        </button>
      </form>
    </div>
  );
}

// Keep CATEGORIES import used (exported for potential reuse)
export { CATEGORIES };
