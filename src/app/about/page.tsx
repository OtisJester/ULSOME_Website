"use client";

import { useLanguage } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Link from "next/link";

export default function AboutPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-background text-foreground bg-grid p-4 md:p-12 font-mono">
            <LanguageSwitcher />

            <div className="max-w-5xl mx-auto border-l border-r border-[#333] min-h-screen bg-[#0a0a0b] relative shadow-2xl">
                {/* Top Blueprint Bar */}
                <div className="h-16 border-b border-[#333] flex items-center justify-between px-8 bg-[#0f0f10]">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-primary/50 hover:text-primary transition-colors text-xs uppercase tracking-[0.2em] border border-primary/20 px-2 py-1">
                            ← Return
                        </Link>
                        <div className="h-4 w-px bg-[#333]" />
                        <span className="text-white/30 text-xs text-transform uppercase">{t.about.subtitle}</span>
                    </div>
                    <div className="text-primary text-xs tracking-widest animate-pulse">
                        STATUS: ACTIVE
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 md:p-16 flex flex-col items-center justify-center min-h-[60vh]">

                    {/* ID Card Layout */}
                    <div className="relative w-full max-w-2xl bg-white/5 border border-white/10 p-1">
                        {/* Decorative Corners */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/50" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/50" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/50" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/50" />

                        <div className="bg-[#0f0f10] p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center">

                            {/* Avatar Section */}
                            <div className="relative">
                                {/* Hexagon Border/Frame Effect */}
                                <div className="w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-full flex items-center justify-center border border-primary/30 relative overflow-hidden">
                                    <img
                                        src="/avatar.png"
                                        alt={t.about.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-full whitespace-nowrap">
                                    {t.about.role}
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-4xl font-bold text-white mb-2 uppercase tracking-wide">
                                    {t.about.name}
                                </h1>
                                <div className="h-px w-full bg-gradient-to-r from-primary/50 to-transparent mb-6" />

                                <div className="space-y-6">
                                    {/* Experience */}
                                    <div>
                                        <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Experience</div>
                                        <div className="text-lg text-primary font-bold whitespace-pre-line">
                                            {t.about.experience}
                                        </div>
                                    </div>

                                    {/* Contact */}
                                    <div>
                                        <div className="text-xs text-white/40 uppercase tracking-widest mb-1">{t.about.contact_title}</div>
                                        <a href={`mailto:${t.about.email}`} className="text-white hover:text-primary transition-colors border-b border-white/20 hover:border-primary pb-1">
                                            {t.about.email}
                                        </a>
                                    </div>

                                    <div className="pt-4">
                                        <p className="text-white/60 text-sm leading-relaxed italic border-l-2 border-primary/30 pl-4 whitespace-pre-line">
                                            "{t.about.intro}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
