'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();

    const init = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error('Auth error:', err);
      }
    };
    init();

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return unsub;
  }, []);

  return { user, loading };
}
