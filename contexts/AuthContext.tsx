'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getUserData,
  isAuthenticated as checkIsAuthenticated,
  removeAuthData,
  setAuthData,
  type UserData,
} from '@/app/utils/auth';

interface AuthContextValue {
  user: UserData | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (data: UserData, rememberMe?: boolean) => void;
  logout: () => void;
  recheck: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const refresh = useCallback(() => {
    const ok = checkIsAuthenticated();
    // Only set state when something actually changed to avoid extra renders.
    setAuthenticated((prev) => (prev === ok ? prev : ok));
    if (!ok) {
      setUser(null);
      return;
    }
    try {
      setUser((prev) => prev ?? getUserData());
    } catch {
      removeAuthData();
      setAuthenticated(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    setIsReady(true);
  }, [refresh]);

  const login = useCallback(
    (data: UserData, rememberMe = false) => {
      setAuthData(data, rememberMe);
      refresh();
    },
    [refresh]
  );

  const logout = useCallback(() => {
    removeAuthData();
    setUser(null);
    setAuthenticated(false);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: authenticated, isReady, login, logout, recheck: refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
