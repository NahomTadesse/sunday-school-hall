'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import en from '@/lib/i18n/en.json';
import am from '@/lib/i18n/am.json';

export type Locale = 'en' | 'am';

const dictionaries: Record<Locale, Record<string, string>> = { en, am };

const LANGUAGE_COOKIE = 'app_language';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = Cookies.get(LANGUAGE_COOKIE) as Locale | undefined;
    if (saved && (saved === 'en' || saved === 'am')) {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    Cookies.set(LANGUAGE_COOKIE, next, { expires: 365 });
  }, []);

  const t = useCallback(
    (key: string) => {
      return dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t, dir: 'ltr' as const }), [locale, setLocale, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
