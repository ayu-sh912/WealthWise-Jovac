import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Target as TargetIcon,
  CalendarClock,
  CheckCircle2,
} from 'lucide-react';
import { supabase, inr, formatDate, type Goal } from '@/lib/supabase';

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) throw new Error(err.message);
      setGoals(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const tgt = parseFloat(target);
    if (!title.trim()) {
      setError('Give your goal a title');
      return;
    }
    if (!tgt || tgt < 1) {
      setError('Target must be at least 1');
      return;
    }
    setSaving(true);
    try {
      const { error: insError } = await supabase.from('goals').insert({
        title: title.trim(),
        target: tgt,
        deadline: deadline || null,
      });
      if (insError) throw new Error(insError.message);
      setTitle('');
      setTarget('');
      setDeadline('');
      setFormOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMoney = async (g: Goal) => {
    const input = window.prompt(`Add money to "${g.title}" (current: ${inr(Number(g.saved))})`, '');
    if (!input) return;
    const amt = parseFloat(input);
    if (!amt || amt <= 0) {
      setError('Enter a valid amount');
      return;
    }
    const newSaved = Number(g.saved) + amt;
    const { error: updError } = await supabase.from('goals').update({ saved: newSaved }).eq('id', g.id);
    if (updError) {
      setError(updError.message);
      return;
    }
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this goal?')) return;
    const { error: delError } = await supabase.from('goals').delete().eq('id', id);
    if (delError) {
      setError(delError.message);
      return;
    }
    await load();
  };

  const totalTarget = goals.reduce((s, g) => s + Number(g.target), 0);
  const totalSaved = goals.reduce((s, g) => s + Number(g.saved), 0);
  const overallPct = totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-7 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Savings goals</h1>
          <p className="mt-1 text-sm text-slate-500">Set targets and track how close you are.</p>
        </div>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          New goal
        </button>
      </div>

      {/* Overall progress */}
      {goals.length > 0 && (
        <div className="mb-6 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Total saved across all goals</p>
            <p className="text-sm font-medium text-slate-500">
              {inr(totalSaved)} / {inr(totalTarget)}
            </p>
          </div>
          <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Create form */}
      {formOpen && (
        <form
          onSubmit={handleCreate}
          className="mb-6 animate-slide-up space-y-4 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm"
        >
          <h3 className="text-base font-bold text-slate-800">Create a new goal</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Goal title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Emergency fund"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Target amount</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="50000"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Deadline (optional)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create goal
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

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
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
            <TargetIcon className="h-6 w-6 text-teal-500" />
          </div>
          <p className="text-sm font-semibold text-slate-600">No goals yet</p>
          <p className="mt-1 text-xs text-slate-400">Create your first savings goal to start tracking progress.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {goals.map((g) => {
            const pct = Math.min(100, (Number(g.saved) / Number(g.target)) * 100);
            const done = Number(g.saved) >= Number(g.target);
            const remaining = Math.max(0, Number(g.target) - Number(g.saved));
            return (
              <div
                key={g.id}
                className="group animate-slide-up rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        done ? 'bg-emerald-50 text-emerald-600' : 'bg-teal-50 text-teal-600'
                      }`}
                    >
                      {done ? <CheckCircle2 className="h-5 w-5" /> : <TargetIcon className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{g.title}</p>
                      {g.deadline && (
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-slate-400">
                          <CalendarClock className="h-3 w-3" />
                          {formatDate(g.deadline)}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-all hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete goal"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold tracking-tight text-slate-900">{inr(Number(g.saved))}</p>
                    <p className="text-sm font-medium text-slate-400">of {inr(Number(g.target))}</p>
                  </div>
                  <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        done
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : 'bg-gradient-to-r from-teal-500 to-teal-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">{pct.toFixed(0)}%</span>
                    {!done && <span className="text-xs font-medium text-slate-400">{inr(remaining)} to go</span>}
                    {done && <span className="text-xs font-semibold text-emerald-600">Goal reached!</span>}
                  </div>
                </div>

                <button
                  onClick={() => handleAddMoney(g)}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                >
                  <Plus className="h-4 w-4" />
                  Add money
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
