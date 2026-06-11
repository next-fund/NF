import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WITHDRAW_FEE_RATE } from '@/lib/constants';
import { transactionResolvedEmail } from '@/lib/email';

export interface Transaction {
  id: string;
  uid: string;
  email: string;
  type: 'deposit' | 'withdraw' | 'return' | 'invest';
  amount: number;
  fee?: number;
  net?: number;
  address?: string;
  txid?: string;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  createdAt: number;
}

export async function createDeposit(uid: string, email: string, amount: number, txid: string) {
  await addDoc(collection(db, 'transactions'), {
    uid,
    email,
    type: 'deposit',
    amount,
    txid,
    status: 'pending',
    note: 'USDT BEP-20 deposit',
    createdAt: Date.now(),
  });
}

export async function createWithdraw(uid: string, email: string, amount: number, address: string) {
  const fee = +(amount * WITHDRAW_FEE_RATE).toFixed(2);
  const net = +(amount - fee).toFixed(2);
  await addDoc(collection(db, 'transactions'), {
    uid,
    email,
    type: 'withdraw',
    amount,
    fee,
    net,
    address,
    status: 'pending',
    note: '1% fee deducted',
    createdAt: Date.now(),
  });
}

// Note: queries avoid composite indexes by filtering with a single `where`
// and sorting client-side, so the app works on a fresh Firestore with no
// custom indexes configured.
export async function getUserTransactions(uid: string, max = 20): Promise<Transaction[]> {
  const q = query(collection(db, 'transactions'), where('uid', '==', uid));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) }))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, max);
}

export async function getPendingTransactions(): Promise<Transaction[]> {
  const q = query(collection(db, 'transactions'), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAllTransactions(max = 500): Promise<Transaction[]> {
  const snap = await getDocs(collection(db, 'transactions'));
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) }))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, max);
}

// Admin approve / reject. On approval we adjust the user's balance accordingly,
// then notify the user by email (EmailJS) about the outcome.
export async function resolveTransaction(tx: Transaction, approve: boolean) {
  const txRef = doc(db, 'transactions', tx.id);
  if (!approve) {
    await updateDoc(txRef, { status: 'rejected' });
  } else {
    await updateDoc(txRef, { status: 'approved' });
    const userRef = doc(db, 'users', tx.uid);
    if (tx.type === 'deposit') {
      await updateDoc(userRef, { balance: increment(tx.amount) });
    } else if (tx.type === 'withdraw') {
      await updateDoc(userRef, { balance: increment(-tx.amount) });
    }
  }

  if (tx.type === 'deposit' || tx.type === 'withdraw') {
    // Fire-and-forget; never block the admin action on email delivery.
    transactionResolvedEmail({
      email: tx.email,
      type: tx.type,
      amount: tx.amount,
      approved: approve,
    });
  }
}
