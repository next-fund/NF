import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DepositModal from '@/components/DepositModal';
import WithdrawModal from '@/components/WithdrawModal';
import TransactionHistory from '@/components/TransactionHistory';
import { ArrowDownToLine, ArrowUpFromLine, Wallet, Layers } from 'lucide-react';
import type { View } from '@/components/Header';

const Dashboard: React.FC<{ setView: (v: View) => void }> = ({ setView }) => {
  const { userData } = useAuth();
  const [modal, setModal] = useState<'deposit' | 'withdraw' | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const close = () => {
    setModal(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-white">Welcome back, {userData?.name?.split(' ')[0] || 'Investor'}</h1>
        <p className="text-slate-400 text-sm">Here's an overview of your portfolio.</p>
      </div>

      {/* Balance card */}
      <div className="mt-6 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-8 shadow-2xl shadow-indigo-900/40 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="flex items-center gap-2 text-indigo-200 mb-2">
          <Wallet className="w-5 h-5" /> <span className="text-sm font-medium">Total Balance</span>
        </div>
        <p className="text-5xl font-extrabold text-white font-mono tracking-tight">
          {(userData?.balance ?? 0).toFixed(2)} <span className="text-2xl text-indigo-200">USDT</span>
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => setModal('deposit')}
            className="flex items-center gap-2 rounded-xl bg-white text-indigo-700 px-5 py-2.5 font-semibold hover:bg-indigo-50 transition">
            <ArrowDownToLine className="w-4 h-4" /> Deposit
          </button>
          <button onClick={() => setModal('withdraw')}
            className="flex items-center gap-2 rounded-xl bg-white/15 text-white px-5 py-2.5 font-semibold hover:bg-white/25 transition border border-white/20">
            <ArrowUpFromLine className="w-4 h-4" /> Withdraw
          </button>
        </div>
      </div>

      {/* Action cards */}
      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        <ActionCard icon={ArrowDownToLine} title="Deposit USDT" desc="Add funds via BEP-20 network" color="from-emerald-500 to-teal-500" onClick={() => setModal('deposit')} />
        <ActionCard icon={ArrowUpFromLine} title="Withdraw USDT" desc="1% fee · admin approved" color="from-amber-500 to-orange-500" onClick={() => setModal('withdraw')} />
        <ActionCard icon={Layers} title="Browse Packages" desc="Earn automated daily returns" color="from-violet-500 to-purple-600" onClick={() => setView('packages')} />
      </div>

      <div className="mt-6">
        <TransactionHistory refreshKey={refreshKey} />
      </div>

      {modal === 'deposit' && <DepositModal onClose={close} />}
      {modal === 'withdraw' && <WithdrawModal onClose={close} />}
    </div>
  );
};

const ActionCard: React.FC<{ icon: React.ElementType; title: string; desc: string; color: string; onClick: () => void }> = ({ icon: Icon, title, desc, color, onClick }) => (
  <button onClick={onClick} className="text-left rounded-2xl bg-slate-900/60 border border-white/10 p-5 hover:-translate-y-1 hover:border-white/20 transition group">
    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <h4 className="font-semibold text-white">{title}</h4>
    <p className="text-sm text-slate-400">{desc}</p>
  </button>
);

export default Dashboard;
