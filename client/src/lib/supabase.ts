import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type TransactionType = 'income' | 'expense';

export type Category =
  | 'Salary'
  | 'Freelance'
  | 'Food'
  | 'Rent'
  | 'Transport'
  | 'Shopping'
  | 'Bills'
  | 'Health'
  | 'Entertainment'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Salary',
  'Freelance',
  'Food',
  'Rent',
  'Transport',
  'Shopping',
  'Bills',
  'Health',
  'Entertainment',
  'Other',
];

export const INCOME_CATEGORIES: Category[] = ['Salary', 'Freelance', 'Other'];
export const EXPENSE_CATEGORIES: Category[] = [
  'Food',
  'Rent',
  'Transport',
  'Shopping',
  'Bills',
  'Health',
  'Entertainment',
  'Other',
];

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  date: string;
  note: string | null;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target: number;
  saved: number;
  deadline: string | null;
  created_at: string;
}

export type NewTransaction = Omit<Transaction, 'id' | 'user_id' | 'created_at'>;
export type NewGoal = Pick<Goal, 'title' | 'target' | 'deadline'>;

const rupeeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function inr(amount: number): string {
  return rupeeFormatter.format(amount);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
