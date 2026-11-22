import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight, TrendingUp, Wallet } from 'lucide-react';

type Tone = 'brand' | 'pos' | 'neg' | 'warn';

const toneMap: Record<Tone, { icon: LucideIcon; bg: string; text: string; ring: string }> = {
  brand: { icon: Wallet, bg: 'bg-teal-50', text: 'text-teal-600', ring: 'ring-teal-100' },
  pos: { icon: ArrowUpRight, bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  neg: { icon: ArrowDownRight, bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-100' },
  warn: { icon: TrendingUp, bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
};

interface StatCardProps {
  label: string;
  value: string;
  tone?: Tone;
  sub?: string;
  negative?: boolean;
}

export default function StatCard({ label, value, tone = 'brand', sub, negative }: StatCardProps) {
  const { icon: Icon, bg, text, ring } = toneMap[tone];
  const valueColor = negative ? 'text-red-600' : 'text-slate-900';

  return (
    <div className="animate-slide-up rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg} ${text} ring-4 ${ring}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <p className={`mt-3 text-2xl font-bold tracking-tight ${valueColor}`}>{value}</p>
      {sub && <p className="mt-1 text-xs font-medium text-slate-400">{sub}</p>}
    </div>
  );
}
