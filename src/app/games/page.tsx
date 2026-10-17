"use client";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { GameCategory } from "@/locales/dictionary";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const CATEGORY_ORDER: GameCategory[] = ["past", "developing", "prototype"];

export default function GamesPage() {
    const { t, locale } = useLanguage();
    const [activeCategory, setActiveCategory] = useState<GameCategory>("past");

    const steamLang = locale === "zh" ? "tchinese" : "english";
    const filteredGames = t.projects.games_list.filter(
        (game) => game.category === activeCategory
    );

    return (
        <div className="min-h-screen bg-background text-foreground bg-hex-pattern p-3 sm:p-6 md:p-12 font-mono">
            <LanguageSwitcher />

            <div className="max-w-4xl mx-auto border-l border-r border-[#333] min-h-screen bg-[#0a0a0b] relative shadow-2xl">
                {/* Top Blueprint Bar */}
                <div className="h-14 sm:h-16 border-b border-[#333] flex items-center justify-between px-4 sm:px-8 bg-[#0f0f10]">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link
                            href="/"
                            className="text-primary/70 hover:text-primary transition-colors text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] border border-primary/25 px-2.5 py-1"
                        >
                            {t.common.back_home}
                        </Link>
                        <div className="h-4 w-px bg-[#333] hidden sm:block" />
                        <span className="text-white/30 text-xs hidden sm:inline">
                            DOC_ID: PRJ-DB-2026
                        </span>
                    </div>
                    <div className="text-primary text-xs tracking-widest animate-pulse pr-20 sm:pr-0">
                        STATUS: ONLINE
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-4 sm:p-8 md:p-14">
                    {/* Header Section */}
                    <header className="mb-8 border-b border-primary/20 pb-6">
                        <h1 className="text-3xl sm:text-4xl md:text-6xl text-white font-heading uppercase tracking-wider mb-2">
                            {t.projects.title}
                        </h1>
                        <h2 className="text-sm sm:text-lg text-primary font-mono">
                            {t.projects.description}
                        </h2>
                    </header>

                    {/* Tactical Category Tabs */}
                    <nav aria-label="Project Categories" className="mb-8 sm:mb-10">
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 bg-[#0f1115] p-1.5 border border-white/10">
                            {CATEGORY_ORDER.map((category) => {
                                const count = t.projects.games_list.filter(
                                    (g) => g.category === category
                                ).length;
                                const isActive = activeCategory === category;

                                return (
                                    <button
                                        key={category}
                                        type="button"
                                        onClick={() => setActiveCategory(category)}
                                        className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 py-3 px-2 text-xs sm:text-sm font-bold tracking-wider uppercase transition-all cursor-pointer border-b-2 ${
                                            isActive
                                                ? "bg-primary/15 text-primary border-primary shadow-[0_0_15px_rgba(0,210,196,0.15)]"
                                                : "text-white/45 hover:text-white/80 hover:bg-white/5 border-transparent"
                                        }`}
                                    >
                                        <span>{t.projects.categories[category]}</span>
                                        <span
                                            className={`text-[11px] px-1.5 py-0.5 rounded-sm ${
                                                isActive
                                                    ? "bg-primary/20 text-primary"
                                                    : "bg-black/40 text-white/40"
                                            }`}
                                        >
                                            {String(count).padStart(2, "0")}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Project Cards List */}
                    <div className="flex flex-col gap-8 sm:gap-10">
                        {filteredGames.length === 0 && (
                            <div className="border border-dashed border-white/15 bg-white/[0.02] p-12 text-center text-white/40 text-xs sm:text-sm uppercase tracking-[0.2em]">
                                {t.projects.empty_category}
                            </div>
                        )}
                        {filteredGames.map((game) => {
                            const steamLink = game.links.find((l) => l.platform === "steam");
                            const otherLinks = game.links.filter((l) => l.platform !== "steam");
                            const steamId = steamLink?.url.match(/\/app\/(\d+)/)?.[1];

                            return (
                                <article
                                    key={game.id}
                                    className="group border border-white/15 bg-white/[0.03] hover:border-primary/50 transition-all duration-300 flex flex-col"
                                >
                                    {/* 1. Card Header: Title, Role Badge & Tags */}
                                    <div className="p-4 sm:p-6 border-b border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-primary transition-colors font-heading uppercase tracking-wide">
                                                {game.title}
                                            </h2>
                                            {game.role && (
                                                <span className="text-xs px-2.5 py-0.5 bg-primary/15 border border-primary/40 text-primary font-bold">
                                                    {game.role}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-1.5">
                                            {game.tags.map((tag: string) => (
                                                <span
                                                    key={tag}
                                                    className="text-xs uppercase tracking-wider px-2 py-0.5 bg-white/5 border border-white/10 text-white/60"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. Middle Visual / Full-Width Steam Widget Area */}
                                    <div className="w-full border-b border-white/10 bg-black/60 overflow-hidden">
                                        {steamId ? (
                                            <div className="p-2 sm:p-4 overflow-x-auto">
                                                <iframe
                                                    key={`${steamId}-${locale}`}
                                                    src={`https://store.steampowered.com/widget/${steamId}/?l=${steamLang}`}
                                                    title={`${game.title} — Steam`}
                                                    loading="lazy"
                                                    className="w-full min-h-[190px] block"
                                                    style={{ border: "none" }}
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className={`w-full min-h-[140px] sm:min-h-[160px] relative flex items-center justify-between p-5 sm:p-8 bg-gradient-to-br ${game.thumbnailGradient} opacity-90 group-hover:opacity-100 transition-opacity`}
                                            >
                                                <div className="z-10 flex flex-col gap-2">
                                                    <span className="inline-block w-fit bg-black/50 backdrop-blur-md px-3 py-1 text-xs font-mono border border-white/15 uppercase tracking-wider text-white/90">
                                                        {game.status === "Released"
                                                            ? t.projects.status_released
                                                            : t.projects.status_dev}
                                                    </span>
                                                    <span className="text-white/60 text-xs uppercase tracking-widest">
                                                        ID // {game.id.toUpperCase()}
                                                    </span>
                                                </div>

                                                <div className="text-white/25 group-hover:text-white/40 group-hover:scale-110 transition-all duration-500">
                                                    <svg
                                                        width="64"
                                                        height="64"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                    >
                                                        <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 3. Below Steam Badge: Design & Contribution Details */}
                                    <div className="p-4 sm:p-6 md:p-7 flex flex-col gap-3.5 bg-[#090b0f]">
                                        <div className="flex items-center gap-2 text-xs text-primary/80 uppercase tracking-[0.15em]">
                                            <span className="inline-block w-1.5 h-1.5 bg-primary" />
                                            <span>{t.projects.contribution_label}</span>
                                        </div>

                                        <p className="text-white/85 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                            {game.description}
                                        </p>

                                        {game.details && game.details.length > 0 && (
                                            <ul className="flex flex-col gap-2 border-l-2 border-primary/40 pl-4 mt-1">
                                                {game.details.map((detail, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="text-white/70 text-xs sm:text-sm leading-relaxed flex items-start gap-2"
                                                    >
                                                        <span className="text-primary mt-0.5 shrink-0">
                                                            ▸
                                                        </span>
                                                        <span>{detail}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {/* Non-Steam / Additional Action Links */}
                                        {otherLinks.length > 0 && (
                                            <div className="pt-3 mt-1 border-t border-white/10 flex flex-col sm:flex-row flex-wrap gap-3">
                                                {otherLinks.map((link, i) => {
                                                    const isInternal = link.url.startsWith("/");
                                                    return (
                                                        <a
                                                            key={i}
                                                            href={link.url}
                                                            target={isInternal ? undefined : "_blank"}
                                                            rel={
                                                                isInternal
                                                                    ? undefined
                                                                    : "noopener noreferrer"
                                                            }
                                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary/10 border border-primary/50 text-primary font-bold text-xs sm:text-sm uppercase tracking-widest hover:bg-primary hover:text-black transition-all w-full sm:w-auto"
                                                        >
                                                            {link.platform === "ios" && (
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    viewBox="0 0 384 512"
                                                                    fill="currentColor"
                                                                >
                                                                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.9-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
                                                                </svg>
                                                            )}
                                                            {link.platform === "android" && (
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    viewBox="0 0 576 512"
                                                                    fill="currentColor"
                                                                >
                                                                    <path d="M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-265.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m273.7-144.48,47.94-83a10,10,0,1,0-17.27-10h0l-48.54,84.07a301.25,301.25,0,0,0-246.56,0L116.18,64.45a10,10,0,1,0-17.27,10h0l47.94,83C64.53,202.22,8.24,285.55,0,384H576c-8.24-98.45-64.54-181.78-146.85-226.55" />
                                                                </svg>
                                                            )}
                                                            {link.platform === "web" && (
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    viewBox="0 0 24 24"
                                                                    fill="currentColor"
                                                                >
                                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                                                                </svg>
                                                            )}
                                                            <span>{t.projects.play}</span>
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
