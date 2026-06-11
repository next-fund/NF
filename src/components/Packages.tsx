import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { PACKAGES, InvestmentPackage, TWENTY_FOUR_HOURS } from '@/lib/constants';
import { activatePackage, getActivePackages, UserPackage } from '@/lib/packages';
import { Check, Loader2, TrendingUp, Clock } from 'lucide-react';

const Packages: React.FC<{ onChanged?: () => void }> = ({ onChanged }) => {
  const { user, userData, refreshUserData } = useAuth();
  const [active, setActive] = useState<UserPackage[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const loadActive = () => {
    if (user) getActivePackages(user.uid).then(setActive).catch(() => setActive([]));
  };
  useEffect(loadActive, [user]);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const balance = userData?.balance ?? 0;

  const handleActivate = async (pkg: InvestmentPackage) => {
    if (!user) return;
    setBusy(pkg.id);
    try {
      const res = await activatePackage(user.uid, userData?.email || user.email || '', pkg);
      if (res.ok) {
        toast.success(res.message);
        await refreshUserData();
        loadActive();
        onChanged?.();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Activation failed');
    } finally {
      setBusy(null);
    }
  };

  const countdown = (p: UserPackage) => {
    const next = (p.lastCreditAt || p.activatedAt) + TWENTY_FOUR_HOURS;
    const diff = Math.max(0, next - Date.now());
    const h = Math.floor(diff / 3.6e6);
    const m = Math.floor((diff % 3.6e6) / 6e4);
    const s = Math.floor((diff % 6e4) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Investment Packages</h2>
        <p className="text-slate-400">Activate a plan and earn automated returns credited every 24 hours.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {PACKAGES.map((pkg) => {
          const affordable = balance >= pkg.investment;
          const monthly = pkg.dailyReturn * 30;
          return (
            <div key={pkg.id}
              className={`relative rounded-3xl border p-6 transition hover:-translate-y-1 ${pkg.highlight ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/10 bg-slate-900/60'}`}>
              {pkg.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white">Popular</span>
              )}
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pkg.color} flex items-center justify-center mb-4`}>
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
              <p className="text-3xl font-extrabold text-white mt-2 font-mono">{pkg.investment}<span className="text-base text-slate-400 font-normal"> USDT</span></p>
              <ul className="mt-5 space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {pkg.dailyReturn} USDT / day</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> ~{monthly} USDT / month</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Auto-credited every 24h</li>
              </ul>
              <button
                onClick={() => handleActivate(pkg)}
                disabled={!affordable || busy === pkg.id}
                className={`mt-6 w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold transition ${affordable ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                {busy === pkg.id && <Loader2 className="w-4 h-4 animate-spin" />}
                {affordable ? 'Activate' : 'Insufficient Balance'}
              </button>
            </div>
          );
        })}
      </div>

      <h3 className="text-xl font-bold text-white mb-4">Your Active Packages</h3>
      {active.length === 0 ? (
        <p className="text-slate-400 text-sm">No active packages yet. Activate one above to start earning.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {active.map((p) => (
            <div key={p.id} className="rounded-2xl bg-slate-900/60 border border-white/10 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white">{p.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">Active</span>
              </div>
              <p className="text-sm text-slate-400">Daily return: <span className="text-emerald-300 font-mono">+{p.dailyReturn} USDT</span></p>
              <p className="text-sm text-slate-400">Total earned: <span className="text-white font-mono">{(p.totalCredited || 0).toFixed(2)} USDT</span></p>
              <div className="mt-3 flex items-center gap-2 text-sm text-indigo-300">
                <Clock className="w-4 h-4" /> Next credit in {countdown(p)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Packages;
