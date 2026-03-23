import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const APP_ID = process.env.NEXT_PUBLIC_APP_ID ?? 'minima-list';

// Lazy initialization — only runs on the client side
let _app: FirebaseApp;
let _auth: Auth;
let _db: Firestore;

function ensureClient() {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be initialized on the client side.');
  }
  if (!_app) {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    _auth = getAuth(_app);
    _db = getFirestore(_app);
  }
}

export function getFirebaseAuth(): Auth {
  ensureClient();
  return _auth;
}

export function getFirebaseDb(): Firestore {
  ensureClient();
  return _db;
}
