import { supabase, type Transaction, type Goal } from '@/lib/supabase';

export interface MonthlyPoint {
  year: number;
  month: number; // 1-12
  label: string; // e.g. "Jul"
  income: number;
  expense: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
}

export interface ReportSummary {
  income: number;
  expense: number;
  balance: number;
  byCategory: CategoryTotal[];
  monthly: MonthlyPoint[];
  goalsTarget: number;
  goalsSaved: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export async function fetchSummary(transactions: Transaction[], goals: Goal[]): Promise<ReportSummary> {
  // Totals
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.type === 'income') income += Number(t.amount);
    else expense += Number(t.amount);
  }

  // Category totals — current month expenses
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const catMap = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    const d = new Date(t.date);
    if (d < monthStart) continue;
    catMap.set(t.category, (catMap.get(t.category) ?? 0) + Number(t.amount));
  }
  const byCategory: CategoryTotal[] = Array.from(catMap.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  // Monthly — last 6 months
  const monthly: MonthlyPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    monthly.push({
      year: y,
      month: m + 1,
      label: MONTH_NAMES[m],
      income: 0,
      expense: 0,
    });
  }
  for (const t of transactions) {
    const d = new Date(t.date);
    const y = d.getFullYear();
    const m = d.getMonth();
    const bucket = monthly.find((p) => p.year === y && p.month === m + 1);
    if (!bucket) continue;
    if (t.type === 'income') bucket.income += Number(t.amount);
    else bucket.expense += Number(t.amount);
  }

  // Goals
  let goalsTarget = 0;
  let goalsSaved = 0;
  for (const g of goals) {
    goalsTarget += Number(g.target);
    goalsSaved += Number(g.saved);
  }

  return { income, expense, balance: income - expense, byCategory, monthly, goalsTarget, goalsSaved };
}

export async function fetchTransactions(type?: string, month?: string): Promise<Transaction[]> {
  let query = supabase.from('transactions').select('*').order('date', { ascending: false });
  if (type && type !== 'all') query = query.eq('type', type);
  if (month) {
    const [y, m] = month.split('-').map(Number);
    const start = new Date(y, m - 1, 1).toISOString();
    const end = new Date(y, m, 1).toISOString();
    query = query.gte('date', start).lt('date', end);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchGoals(): Promise<Goal[]> {
  const { data, error } = await supabase.from('goals').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
