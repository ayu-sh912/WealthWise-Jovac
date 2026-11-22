import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Navbar, { type Page } from '@/components/Navbar';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Transactions from '@/pages/Transactions';
import Goals from '@/pages/Goals';
import { Loader2 } from 'lucide-react';

function Shell() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-7 w-7 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar page={page} setPage={setPage} />
      <main className="animate-fade-in">
        {page === 'dashboard' && <Dashboard />}
        {page === 'transactions' && <Transactions />}
        {page === 'goals' && <Goals />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
