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
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const refresh = useCallback(() => {
    const ok = checkIsAuthenticated();
    setAuthenticated(ok);
    setUser(ok ? getUserData() : null);
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
    <AuthContext.Provider value={{ user, isAuthenticated: authenticated, isReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
