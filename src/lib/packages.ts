import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PACKAGES, TWENTY_FOUR_HOURS, InvestmentPackage } from '@/lib/constants';
import { dailyReturnEmail } from '@/lib/email';

export interface UserPackage {
  id: string;
  uid: string;
  email: string;
  packageId: string;
  name: string;
  investment: number;
  dailyReturn: number;
  activatedAt: number;
  lastCreditAt: number;
  totalCredited: number;
  status: string;
}
export async function getActivePackages(uid: string): Promise<UserPackage[]> {
  // Single equality filter (no composite index needed); filter status client-side.
  const q = query(collection(db, 'userPackages'), where('uid', '==', uid));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<UserPackage, 'id'>) }))
    .filter((p) => p.status === 'active');
}

// Credits any package whose 24h periods have elapsed since the last credit.
export async function creditDuePackages(uid: string): Promise<number> {
  const packages = await getActivePackages(uid);
  const now = Date.now();
  let totalCredit = 0;

  for (const p of packages) {
    const elapsed = now - (p.lastCreditAt || p.activatedAt);
    const periods = Math.floor(elapsed / TWENTY_FOUR_HOURS);
    if (periods >= 1) {
      const credit = periods * p.dailyReturn;
      totalCredit += credit;
      await updateDoc(doc(db, 'userPackages', p.id), {
        lastCreditAt: (p.lastCreditAt || p.activatedAt) + periods * TWENTY_FOUR_HOURS,
        totalCredited: (p.totalCredited || 0) + credit,
      });
      await addDoc(collection(db, 'transactions'), {
        uid,
        email: p.email,
        type: 'return',
        amount: credit,
        status: 'approved',
        note: `${p.name} package daily return (${periods}d)`,
        createdAt: now,
      });
      // Notify the investor by email (fire-and-forget).
      dailyReturnEmail({ email: p.email, name: p.name, packageName: p.name, amount: credit });
    }
  }

  if (totalCredit > 0) {
    await updateDoc(doc(db, 'users', uid), { balance: increment(totalCredit) });
  }
  return totalCredit;
}

// Activates a package if the user has sufficient balance. Deducts investment.
export async function activatePackage(
  uid: string,
  email: string,
  pkg: InvestmentPackage,
): Promise<{ ok: boolean; message: string }> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return { ok: false, message: 'User not found' };
  const balance = (snap.data().balance as number) || 0;
  if (balance < pkg.investment) {
    return { ok: false, message: 'Insufficient balance to activate this package.' };
  }
  const now = Date.now();
  await updateDoc(userRef, { balance: increment(-pkg.investment) });
  await addDoc(collection(db, 'userPackages'), {
    uid,
    email,
    packageId: pkg.id,
    name: pkg.name,
    investment: pkg.investment,
    dailyReturn: pkg.dailyReturn,
    activatedAt: now,
    lastCreditAt: now,
    totalCredited: 0,
    status: 'active',
  });
  await addDoc(collection(db, 'transactions'), {
    uid,
    email,
    type: 'invest',
    amount: pkg.investment,
    status: 'approved',
    note: `Activated ${pkg.name} package`,
    createdAt: now,
  });
  return { ok: true, message: `${pkg.name} package activated!` };
}

export function findPackage(id: string) {
  return PACKAGES.find((p) => p.id === id);
}
