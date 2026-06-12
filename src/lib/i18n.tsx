'use client';

import React, { createContext, useCallback, useContext, useEffect, useSyncExternalStore, ReactNode } from 'react';
import { dictionary, Locale } from '@/locales/dictionary';

const STORAGE_KEY = 'ulsome-lang';
const DEFAULT_LOCALE: Locale = 'zh';
const CHANGE_EVENT = 'ulsome-lang-change';

function isLocale(value: string | null): value is Locale {
    return value === 'en' || value === 'zh';
}

function subscribe(callback: () => void) {
    // 'storage' keeps other tabs in sync; the custom event covers this tab.
    window.addEventListener('storage', callback);
    window.addEventListener(CHANGE_EVENT, callback);
    return () => {
        window.removeEventListener('storage', callback);
        window.removeEventListener(CHANGE_EVENT, callback);
    };
}

function getSnapshot(): Locale {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isLocale(saved) ? saved : DEFAULT_LOCALE;
}

function getServerSnapshot(): Locale {
    return DEFAULT_LOCALE;
}

interface LanguageContextType {
    locale: Locale;
    t: typeof dictionary['en']; // The structure of the dictionary
    switchLanguage: (lang: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const switchLanguage = useCallback((lang: Locale) => {
        localStorage.setItem(STORAGE_KEY, lang);
        window.dispatchEvent(new Event(CHANGE_EVENT));
    }, []);

    // Keep <html lang> accurate for SEO and screen readers.
    useEffect(() => {
        document.documentElement.lang = locale === 'zh' ? 'zh-Hant' : 'en';
    }, [locale]);

    const t = dictionary[locale];

    return (
        <LanguageContext.Provider value={{ locale, t, switchLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
