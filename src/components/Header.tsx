import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BRAND } from '@/lib/constants';
import { Menu, X, LogOut, Shield, Wallet } from 'lucide-react';

export type View = 'dashboard' | 'packages' | 'profile' | 'about' | 'admin';

interface Props {
  view: View;
  setView: (v: View) => void;
}

const Header: React.FC<Props> = ({ view, setView }) => {
  const { userData, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const links: { key: View; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'packages', label: 'Packages' },
    { key: 'profile', label: 'Profile' },
    { key: 'about', label: 'About' },
  ];
  if (isAdmin) links.push({ key: 'admin', label: 'Admin' });

  const go = (v: View) => {
    setView(v);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <button onClick={() => go('dashboard')} className="flex items-center gap-2.5">
          <img src={BRAND.logo} alt="logo" className="w-9 h-9 rounded-xl" />
          <span className="text-xl font-bold text-white tracking-tight">{BRAND.name}</span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <button
              key={l.key}
              onClick={() => go(l.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                view === l.key ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {l.key === 'admin' && <Shield className="w-4 h-4" />}
              {l.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/20">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-300 font-mono">
              {(userData?.balance ?? 0).toFixed(2)} USDT
            </span>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-slate-950 px-4 py-3 space-y-1">
          <div className="flex items-center gap-2 px-2 py-2 mb-2 text-emerald-300 font-mono text-sm">
            <Wallet className="w-4 h-4" /> {(userData?.balance ?? 0).toFixed(2)} USDT
          </div>
          {links.map((l) => (
            <button
              key={l.key}
              onClick={() => go(l.key)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                view === l.key ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              {l.label}
            </button>
          ))}
          <button onClick={logout} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-300 hover:bg-white/5">
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
