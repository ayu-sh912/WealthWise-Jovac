import { LayoutDashboard, ArrowLeftRight, Target, LogOut, Wallet } from 'lucide-react';
import { useAuth, displayName } from '@/context/AuthContext';

export type Page = 'dashboard' | 'transactions' | 'goals';

interface NavbarProps {
  page: Page;
  setPage: (p: Page) => void;
}

const TABS: { key: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { key: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { key: 'goals', label: 'Goals', icon: Target },
];

export default function Navbar({ page, setPage }: NavbarProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, rgb(var(--brand-light)), rgb(var(--brand-dark)))' }}
          >
            <Wallet className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-bold tracking-tight text-slate-800">WealthWise</p>
            <p className="hidden text-[11px] font-medium text-slate-400 sm:block">Smart money tracking</p>
          </div>
        </div>

        {/* Tabs */}
        <nav className="hidden items-center gap-1 rounded-full bg-slate-100 p-1 md:flex">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = page === key;
            return (
              <button
                key={key}
                onClick={() => setPage(key)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-[13px] font-semibold text-slate-700">{displayName(user)}</p>
            <p className="text-[11px] text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-50 hover:text-red-600"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Mobile tabs */}
      <nav className="flex items-center gap-1 border-t border-slate-100 px-3 py-2 md:hidden">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = page === key;
          return (
            <button
              key={key}
              onClick={() => setPage(key)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${
                active ? 'text-teal-600' : 'text-slate-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
