"use client";

import { useLanguage } from "@/lib/i18n";

export default function LanguageSwitcher() {
    const { locale, switchLanguage } = useLanguage();

    return (
        <div className="fixed top-6 right-6 z-50 flex gap-1 bg-black/50 backdrop-blur border border-white/10 rounded-full p-1">
            <button
                onClick={() => switchLanguage('en')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${locale === 'en'
                        ? 'bg-primary text-black shadow-[0_0_10px_rgba(205,164,94,0.4)]'
                        : 'text-white/40 hover:text-white'
                    }`}
            >
                EN
            </button>
            <button
                onClick={() => switchLanguage('zh')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${locale === 'zh'
                        ? 'bg-primary text-black shadow-[0_0_10px_rgba(205,164,94,0.4)]'
                        : 'text-white/40 hover:text-white'
                    }`}
            >
                中文
            </button>
        </div>
    );
}
