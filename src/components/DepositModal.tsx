import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { DEPOSIT_ADDRESS } from '@/lib/constants';
import { createDeposit } from '@/lib/transactions';
import { X, Copy, Check, Loader2, ArrowDownToLine } from 'lucide-react';

const DepositModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, userData } = useAuth();
  const [amount, setAmount] = useState('');
  const [txid, setTxid] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(DEPOSIT_ADDRESS);
    setCopied(true);
    toast.success('Address copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (!txid.trim()) return toast.error('Enter the transaction hash (TxID)');
    if (!user) return;
    setBusy(true);
    try {
      await createDeposit(user.uid, userData?.email || user.email || '', amt, txid.trim());
      toast.success('Deposit submitted for admin approval');
      onClose();
    } catch {
      toast.error('Failed to submit deposit');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-emerald-500/15"><ArrowDownToLine className="w-6 h-6 text-emerald-400" /></div>
        <div>
          <h3 className="text-xl font-bold text-white">Deposit USDT</h3>
          <p className="text-sm text-slate-400">BEP-20 (Binance Smart Chain)</p>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-800/60 border border-white/10 p-4 mb-5">
        <p className="text-xs text-slate-400 mb-2">Send USDT (BEP-20) to this address:</p>
        <div className="flex items-center gap-2 bg-slate-950/60 rounded-xl p-3">
          <code className="text-sm text-emerald-300 font-mono break-all flex-1">{DEPOSIT_ADDRESS}</code>
          <button onClick={copy} className="shrink-0 p-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-amber-300/80 mt-3">Only send USDT on the BSC (BEP-20) network. Other networks may result in loss of funds.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount (USDT)</label>
          <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
            className="w-full rounded-xl bg-slate-800/80 border border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Transaction Hash (TxID)</label>
          <input value={txid} onChange={(e) => setTxid(e.target.value)} placeholder="0x..."
            className="w-full rounded-xl bg-slate-800/80 border border-white/10 px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button type="submit" disabled={busy}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 py-3 font-semibold text-white transition disabled:opacity-60">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} Submit for Approval
        </button>
      </form>
    </Overlay>
  );
};

export const Overlay: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
    <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
      {children}
    </div>
  </div>
);

export default DepositModal;
