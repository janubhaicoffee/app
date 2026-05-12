"use client";

import { useState, useCallback, createContext, useContext } from 'react';
import en, { type TranslationKey } from './en';
import hinglish from './hinglish';

type Locale = 'en' | 'hinglish';

const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
  en,
  hinglish,
};

interface I18nContextValue {
  locale: Locale;
  t: (key: TranslationKey) => string;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  t: (key) => en[key],
  setLocale: () => {},
  toggleLocale: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Persist locale preference
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('jb-locale') as Locale) || 'en';
    }
    return 'en';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jb-locale', newLocale);
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'hinglish' : 'en');
  }, [locale, setLocale]);

  const t = useCallback((key: TranslationKey): string => {
    return dictionaries[locale][key] || en[key] || key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, t, setLocale, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export type { Locale, TranslationKey as TKey };
