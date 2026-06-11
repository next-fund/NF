import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  balance: number;
  photoURL?: string;
}

export async function getAllUsers(): Promise<AdminUser[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<AdminUser, 'uid'>) }));
}
