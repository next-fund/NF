import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { WITHDRAW_FEE_RATE } from '@/lib/constants';
import { createWithdraw } from '@/lib/transactions';
import { Overlay } from '@/components/DepositModal';
import { Loader2, ArrowUpFromLine } from 'lucide-react';

const WithdrawModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, userData } = useAuth();
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const amt = parseFloat(amount) || 0;
  const fee = +(amt * WITHDRAW_FEE_RATE).toFixed(2);
  const net = +(amt - fee).toFixed(2);
  const balance = userData?.balance ?? 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (amt > balance) return toast.error('Amount exceeds your balance');
    if (!address.trim() || !address.startsWith('0x')) return toast.error('Enter a valid BSC (0x...) address');
    if (!user) return;
    setBusy(true);
    try {
      await createWithdraw(user.uid, userData?.email || user.email || '', amt, address.trim());
      toast.success('Withdrawal submitted for admin approval');
      onClose();
    } catch {
      toast.error('Failed to submit withdrawal');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-amber-500/15"><ArrowUpFromLine className="w-6 h-6 text-amber-400" /></div>
        <div>
          <h3 className="text-xl font-bold text-white">Withdraw USDT</h3>
          <p className="text-sm text-slate-400">Available: <span className="font-mono text-emerald-300">{balance.toFixed(2)} USDT</span></p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Your USDT (BEP-20) Address</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x..."
            className="w-full rounded-xl bg-slate-800/80 border border-white/10 px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount (USDT)</label>
          <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
            className="w-full rounded-xl bg-slate-800/80 border border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>

        <div className="rounded-2xl bg-slate-800/60 border border-white/10 p-4 space-y-2 text-sm">
          <Row label="Fee (1%)" value={`-${fee.toFixed(2)} USDT`} className="text-amber-300" />
          <div className="border-t border-white/10 pt-2">
            <Row label="You will receive" value={`${net > 0 ? net.toFixed(2) : '0.00'} USDT`} className="text-emerald-300 font-semibold" />
          </div>
        </div>
        <p className="text-xs text-slate-400">A 1% network/processing fee is deducted from every withdrawal.</p>

        <button type="submit" disabled={busy}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 py-3 font-semibold text-white transition disabled:opacity-60">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} Submit for Approval
        </button>
      </form>
    </Overlay>
  );
};

const Row: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
  <div className="flex justify-between">
    <span className="text-slate-400">{label}</span>
    <span className={`font-mono ${className || 'text-white'}`}>{value}</span>
  </div>
);

export default WithdrawModal;
