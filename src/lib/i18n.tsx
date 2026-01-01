'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { dictionary, Locale } from '@/locales/dictionary';

// 1. Defining the context shape
interface LanguageContextType {
    locale: Locale;
    t: typeof dictionary['en']; // The structure of the dictionary
    switchLanguage: (lang: Locale) => void;
}

// 2. Creating the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 3. Provider Component
export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>('zh'); // Default to Chinese

    // Optional: Persist to localStorage
    useEffect(() => {
        const saved = localStorage.getItem('ulsome-lang') as Locale;
        if (saved && (saved === 'en' || saved === 'zh')) {
            setLocale(saved);
        }
    }, []);

    const switchLanguage = (lang: Locale) => {
        setLocale(lang);
        localStorage.setItem('ulsome-lang', lang);
    };

    const t = dictionary[locale];

    return (
        <LanguageContext.Provider value={{ locale, t, switchLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

// 4. Custom Hook for easy usage
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
