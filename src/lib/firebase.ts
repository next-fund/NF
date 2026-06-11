// ============================================================
//  FIREBASE CONFIGURATION
//  -----------------------------------------------------------
//  EDIT THE VALUES BELOW with your own Firebase project config.
//  Get them from: Firebase Console > Project Settings > General
//  > Your apps > SDK setup and configuration > Config
//
//  This app uses the FREE Firebase tier:
//   - Authentication (Email/Password)
//   - Cloud Firestore (database)
//   - Storage (profile pictures)
//
//  Remember to ENABLE in the Firebase console:
//   1. Authentication > Sign-in method > Email/Password
//   2. Firestore Database (start in production or test mode)
//   3. Storage
// ============================================================

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: 'AIzaSyCqEhOC63Nt7odybAWy6q7ABR0YP5UZbv4',
  authDomain: 'nextfund-9e57f.firebaseapp.com',
  projectId: 'nextfund-9e57f',
  storageBucket: 'nextfund-9e57f.firebasestorage.app',
  messagingSenderId: '262455734214',
  appId: '1:262455734214:web:62c8a32ac612fb0ea40cc7',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Returns true when the config still holds placeholder values, so we
// can show a friendly setup notice instead of crashing.
export const isFirebaseConfigured = !firebaseConfig.apiKey.startsWith('YOUR_');

export default app;
