import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ADMIN_EMAIL } from '@/lib/constants';
import { creditDuePackages } from '@/lib/packages';

export interface UserData {
  uid: string;
  email: string;
  name: string;
  balance: number;
  photoURL?: string;
  createdAt?: unknown;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  updatePhoto: (url: string) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async (u: User) => {
    const ref = doc(db, 'users', u.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      // Auto-credit any packages whose 24h period has elapsed.
      await creditDuePackages(u.uid);
      const fresh = await getDoc(ref);
      setUserData({ uid: u.uid, ...(fresh.data() as Omit<UserData, 'uid'>) });
    } else {
      const data: Omit<UserData, 'uid'> = {
        email: u.email || '',
        name: u.displayName || (u.email ? u.email.split('@')[0] : 'User'),
        balance: 0,
        photoURL: u.photoURL || '',
        createdAt: serverTimestamp(),
      };
      await setDoc(ref, data);
      setUserData({ uid: u.uid, ...data });
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          await loadUserData(u);
        } catch (e) {
          console.error('loadUserData failed', e);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [loadUserData]);

  const refreshUserData = useCallback(async () => {
    if (!user) return;
    await creditDuePackages(user.uid);
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) setUserData({ uid: user.uid, ...(snap.data() as Omit<UserData, 'uid'>) });
  }, [user]);

  const signUp = async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      name,
      balance: 0,
      photoURL: '',
      createdAt: serverTimestamp(),
    });
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateName = async (name: string) => {
    if (!user) return;
    await updateProfile(user, { displayName: name });
    await updateDoc(doc(db, 'users', user.uid), { name });
    setUserData((p) => (p ? { ...p, name } : p));
  };

  const updatePhoto = async (url: string) => {
    if (!user) return;
    await updateProfile(user, { photoURL: url });
    await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
    setUserData((p) => (p ? { ...p, photoURL: url } : p));
  };

  const changePassword = async (current: string, next: string) => {
    if (!user || !user.email) return;
    const cred = EmailAuthProvider.credential(user.email, current);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, next);
  };

  const isAdmin = !!user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        isAdmin,
        signUp,
        signIn,
        logout,
        resetPassword,
        refreshUserData,
        updateName,
        updatePhoto,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
