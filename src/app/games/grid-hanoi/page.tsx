"use client";
import { useLanguage } from "@/lib/i18n";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function GridHanoiPage() {
    const { t } = useLanguage();
    const g = t.gridHanoi;
    const game = t.projects.games_list.find((item) => item.id === "grid-hanoi")!;

    return (
        <div className="min-h-screen bg-background text-foreground bg-hex-pattern p-4 md:p-12 font-mono">
            <LanguageSwitcher />

            <div className="max-w-4xl mx-auto border-l border-r border-[#333] min-h-screen bg-[#0a0a0b] relative shadow-2xl">
                {/* Top Blueprint Bar */}
                <div className="h-16 border-b border-[#333] flex items-center justify-between px-8 bg-[#0f0f10]">
                    <div className="flex items-center gap-4">
                        <Link href="/games" className="text-primary/50 hover:text-primary transition-colors text-xs uppercase tracking-[0.2em] border border-primary/20 px-2 py-1">
                            ← {t.nav.games}
                        </Link>
                        <div className="h-4 w-px bg-[#333]" />
                        <span className="text-white/30 text-xs">DOC_ID: PRJ-GH-2026</span>
                    </div>
                    <div className="text-primary text-xs tracking-widest animate-pulse">
                        STATUS: ONLINE
                    </div>
                </div>

                {/* Content Area — the whole card is a single click-through into the game */}
                <div className="p-8 md:p-16">
                    <a
                        href="/play/grid-hanoi/index.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block border border-white/10 bg-white/5 hover:border-primary/50 transition-all duration-300 cursor-pointer"
                    >
                        {/* Visual / Thumbnail Area — same language as the /games list cards */}
                        <div className="relative w-full min-h-[220px] border-b border-white/5 bg-black/50 overflow-hidden">
                            <div className={`w-full h-full absolute inset-0 bg-gradient-to-br ${game.thumbnailGradient} opacity-80 group-hover:opacity-100 transition-opacity`}>
                                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 text-xs font-mono border border-white/10 uppercase tracking-wider z-10">
                                    {t.projects.status_released}
                                </div>
                                <div className="text-white/20 group-hover:text-white/40 group-hover:scale-110 transition-all duration-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <svg width="72" height="72" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-10">
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {game.tags.map((tag) => (
                                    <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-white/5 border border-white/5 text-white/50">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl md:text-4xl font-bold text-white group-hover:text-primary transition-colors font-heading uppercase tracking-wide mb-1">
                                {g.title}
                            </h1>
                            <h2 className="text-sm text-primary/70 font-mono mb-6">
                                {g.subtitle}
                            </h2>
                            <div className="h-px w-16 bg-primary/30 mb-6" />

                            {/* Concept */}
                            <div className="flex flex-col gap-4 mb-8">
                                {g.concept.map((paragraph, i) => (
                                    <p key={i} className="text-white/70 text-sm md:text-base leading-relaxed">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>

                            {/* Rules */}
                            <div className="border border-white/10 bg-black/20 p-5 mb-8">
                                <h3 className="text-primary text-xs uppercase tracking-widest mb-4">
                                    {g.rules_title}
                                </h3>
                                <ol className="flex flex-col gap-3">
                                    {g.rules.map((rule, i) => (
                                        <li key={i} className="text-white/70 text-sm leading-relaxed flex gap-3">
                                            <span className="text-primary/60 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                                            <span>{rule}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Click cue — visual only, the whole card above is already the link */}
                            <div className="flex items-center justify-center gap-2 py-3 bg-primary/10 border border-primary/50 text-primary font-bold text-sm uppercase tracking-widest group-hover:bg-primary group-hover:text-black transition-all w-full">
                                <span className="group-hover:translate-x-1 transition-transform">▲</span>
                                <span>{g.play_cta}</span>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}
