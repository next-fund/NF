import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthPage from '@/components/auth/AuthPage';
import Header, { View } from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import Packages from '@/components/Packages';
import Profile from '@/components/Profile';
import About from '@/components/About';
import AdminPanel from '@/components/admin/AdminPanel';
import { BRAND } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

const AppLayout: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const [view, setView] = useState<View>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header view={view} setView={setView} />
      <main className="flex-1">
        {view === 'dashboard' && <Dashboard setView={setView} />}
        {view === 'packages' && <Packages />}
        {view === 'profile' && <Profile />}
        {view === 'about' && <About />}
        {view === 'admin' && isAdmin && <AdminPanel />}
      </main>

      <footer className="border-t border-white/10 bg-slate-950 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={BRAND.logo} alt="logo" className="w-8 h-8 rounded-lg" />
            <div>
              <p className="text-white font-semibold">{BRAND.name}</p>
              <p className="text-xs text-slate-500">{BRAND.slogan}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} {BRAND.name}. Crypto investments carry risk. Invest responsibly.</p>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
