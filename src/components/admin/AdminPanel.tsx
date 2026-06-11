import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { getPendingTransactions, resolveTransaction, getAllTransactions, Transaction } from '@/lib/transactions';
import { getAllUsers, AdminUser } from '@/lib/admin';
import { Check, X, Loader2, DollarSign, Users, ArrowDownToLine, ArrowUpFromLine, ShieldCheck, Mail, MailWarning } from 'lucide-react';
import { isEmailConfigured } from '@/lib/email';

const AdminPanel: React.FC = () => {
  const [pending, setPending] = useState<Transaction[]>([]);
  const [all, setAll] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, a, u] = await Promise.all([getPendingTransactions(), getAllTransactions(), getAllUsers()]);
      setPending(p); setAll(a); setUsers(u);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resolve = async (tx: Transaction, approve: boolean) => {
    setWorking(tx.id);
    try {
      await resolveTransaction(tx, approve);
      toast.success(approve ? 'Approved' : 'Rejected');
      await load();
    } catch {
      toast.error('Action failed');
    } finally {
      setWorking(null);
    }
  };

  const totalDeposited = all.filter((t) => t.type === 'deposit' && t.status === 'approved').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = all.filter((t) => t.type === 'withdraw' && t.status === 'approved').reduce((s, t) => s + t.amount, 0);
  const totalBalances = users.reduce((s, u) => s + (u.balance || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center py-32 text-slate-400"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading admin panel…</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <ShieldCheck className="w-6 h-6 text-indigo-400" />
        <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
        <span
          className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            isEmailConfigured ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
          }`}
          title={isEmailConfigured ? 'EmailJS is configured' : 'Add EmailJS keys in src/lib/email.ts'}
        >
          {isEmailConfigured ? <Mail className="w-3.5 h-3.5" /> : <MailWarning className="w-3.5 h-3.5" />}
          {isEmailConfigured ? 'Email notifications active' : 'Email notifications not configured'}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat icon={DollarSign} label="Total Deposited" value={`${totalDeposited.toFixed(2)} USDT`} color="from-emerald-500 to-teal-500" />
        <Stat icon={ArrowUpFromLine} label="Total Withdrawn" value={`${totalWithdrawn.toFixed(2)} USDT`} color="from-amber-500 to-orange-500" />
        <Stat icon={DollarSign} label="User Balances" value={`${totalBalances.toFixed(2)} USDT`} color="from-indigo-500 to-purple-600" />
        <Stat icon={Users} label="Total Users" value={`${users.length}`} color="from-violet-500 to-fuchsia-600" />
      </div>

      {/* Pending approvals */}
      <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 mb-8">
        <h3 className="text-lg font-bold text-white mb-4">Pending Approvals ({pending.length})</h3>
        {pending.length === 0 ? (
          <p className="text-slate-400 text-sm py-6 text-center">No pending requests.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((t) => (
              <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-slate-800/50 border border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${t.type === 'deposit' ? 'bg-emerald-500/15' : 'bg-amber-500/15'}`}>
                    {t.type === 'deposit' ? <ArrowDownToLine className="w-5 h-5 text-emerald-400" /> : <ArrowUpFromLine className="w-5 h-5 text-amber-400" />}
                  </div>
                  <div>
                    <p className="text-white font-semibold capitalize">{t.type} · <span className="font-mono">{t.amount.toFixed(2)} USDT</span></p>
                    <p className="text-xs text-slate-400">{t.email}</p>
                    {t.txid && <p className="text-xs text-slate-500 font-mono break-all">TxID: {t.txid}</p>}
                    {t.address && <p className="text-xs text-slate-500 font-mono break-all">To: {t.address} · net {t.net?.toFixed(2)} USDT</p>}
                    <p className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => resolve(t, true)} disabled={working === t.id}
                    className="flex items-center gap-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60">
                    {working === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve
                  </button>
                  <button onClick={() => resolve(t, false)} disabled={working === t.id}
                    className="flex items-center gap-1 rounded-xl bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60">
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Users */}
      <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Users ({users.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-white/10">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid} className="border-b border-white/5">
                  <td className="py-3 pr-4 text-white">{u.name}</td>
                  <td className="py-3 pr-4 text-slate-300">{u.email}</td>
                  <td className="py-3 font-mono text-emerald-300">{(u.balance || 0).toFixed(2)} USDT</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ icon: React.ElementType; label: string; value: string; color: string }> = ({ icon: Icon, label, value, color }) => (
  <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-5">
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <p className="text-sm text-slate-400">{label}</p>
    <p className="text-xl font-bold text-white font-mono mt-0.5">{value}</p>
  </div>
);

export default AdminPanel;
