import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserTransactions, Transaction } from '@/lib/transactions';
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp, Layers, History } from 'lucide-react';

const typeMeta: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  deposit: { label: 'Deposit', icon: ArrowDownToLine, color: 'text-emerald-400' },
  withdraw: { label: 'Withdraw', icon: ArrowUpFromLine, color: 'text-amber-400' },
  return: { label: 'Daily Return', icon: TrendingUp, color: 'text-indigo-400' },
  invest: { label: 'Package', icon: Layers, color: 'text-purple-400' },
};

const statusBadge: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-300',
  approved: 'bg-emerald-500/15 text-emerald-300',
  rejected: 'bg-red-500/15 text-red-300',
};

const TransactionHistory: React.FC<{ refreshKey?: number }> = ({ refreshKey }) => {
  const { user } = useAuth();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserTransactions(user.uid)
      .then(setTxs)
      .catch(() => setTxs([]))
      .finally(() => setLoading(false));
  }, [user, refreshKey]);

  return (
    <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-bold text-white">Transaction History</h3>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm py-8 text-center">Loading…</p>
      ) : txs.length === 0 ? (
        <p className="text-slate-400 text-sm py-8 text-center">No transactions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-white/10">
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 font-medium">Amount</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => {
                const m = typeMeta[t.type] || typeMeta.deposit;
                const Icon = m.icon;
                const sign = t.type === 'withdraw' || t.type === 'invest' ? '-' : '+';
                return (
                  <tr key={t.id} className="border-b border-white/5">
                    <td className="py-3 pr-4">
                      <span className={`flex items-center gap-2 ${m.color}`}>
                        <Icon className="w-4 h-4" /> {m.label}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-white">{sign}{t.amount.toFixed(2)} USDT</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${statusBadge[t.status]}`}>{t.status}</span>
                    </td>
                    <td className="py-3 text-slate-400">{new Date(t.createdAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
