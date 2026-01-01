"use client";
import { useLanguage } from "@/lib/i18n";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function GamesPage() {
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
                        <span className="text-white/30 text-xs">DOC_ID: PRJ-DB-2025</span>
                    </div>
                    <div className="text-primary text-xs tracking-widest animate-pulse">
                        STATUS: ONLINE
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 md:p-16">

                    {/* Header Section */}
                    <header className="mb-16 border-b border-primary/20 pb-8">
                        <h1 className="text-4xl md:text-6xl text-white font-heading uppercase tracking-wider mb-2">
                            {t.projects.title}
                        </h1>
                        <h2 className="text-xl text-primary font-mono mb-6">
                            {t.projects.description}
                        </h2>
                    </header>

                    {/* List Layout */}
                    <div className="flex flex-col gap-12">
                        {t.projects.games_list.map((game: any) => {
                            // Identify Steam link to promote it to the visual area
                            const steamLink = game.links?.find((l: any) => l.platform === 'steam');
                            const otherLinks = game.links?.filter((l: any) => l.platform !== 'steam');
                            const steamId = steamLink?.url.match(/\/app\/(\d+)/)?.[1];

                            return (
                                <div
                                    key={game.id}
                                    className="group border border-white/10 bg-white/5 p-4 hover:border-primary/50 transition-all duration-300 relative flex flex-col md:flex-row gap-6"
                                >
                                    {/* Visual Area - Left/Top (Wider for Steam Widget) */}
                                    <div className="w-full md:w-9/12 relative flex items-center justify-center border border-white/5 bg-black/50 overflow-hidden min-h-[200px]">
                                        {steamId ? (
                                            <iframe
                                                src={`https://store.steampowered.com/widget/${steamId}/`}
                                                frameBorder="0"
                                                className="w-full h-full min-h-[190px]"
                                                style={{ border: 'none' }}
                                            ></iframe>
                                        ) : (
                                            <div className={`w-full h-full absolute inset-0 bg-gradient-to-br ${game.thumbnailGradient} opacity-80 group-hover:opacity-100 transition-opacity`}>
                                                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 text-xs font-mono border border-white/10 uppercase tracking-wider z-10">
                                                    {game.status === "Released" ? t.projects.status_released : t.projects.status_dev}
                                                </div>
                                                {/* Icon / Image Placeholder */}
                                                <div className="text-white/20 group-hover:text-white/40 group-hover:scale-110 transition-all duration-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Area - Right/Bottom (Narrower) */}
                                    <div className="w-full md:w-3/12 flex flex-col">
                                        <div className="mb-4">
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {game.tags.map((tag: string) => (
                                                    <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-white/5 border border-white/5 text-white/50">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <h2 className="text-xl font-bold mb-2 text-white group-hover:text-primary transition-colors font-heading uppercase tracking-wide">
                                                {game.title}
                                            </h2>
                                            <div className="h-px w-12 bg-primary/30 mb-4" />
                                            <p className="text-white/70 text-sm leading-relaxed">
                                                {game.description}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-3 mt-auto w-full">
                                            {/* Render other links if any */}
                                            {otherLinks && otherLinks.length > 0 && (
                                                otherLinks.map((link: any, i: number) => (
                                                    <a
                                                        key={i}
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-2 py-3 bg-primary/10 border border-primary/50 text-primary font-bold text-sm uppercase tracking-widest hover:bg-primary hover:text-black transition-all w-full"
                                                    >
                                                        {link.platform === 'ios' && (
                                                            <svg className="w-4 h-4" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.9-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" /></svg>
                                                        )}
                                                        {link.platform === 'android' && (
                                                            <svg className="w-4 h-4" viewBox="0 0 576 512" fill="currentColor"><path d="M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-265.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m273.7-144.48,47.94-83a10,10,0,1,0-17.27-10h0l-48.54,84.07a301.25,301.25,0,0,0-246.56,0L116.18,64.45a10,10,0,1,0-17.27,10h0l47.94,83C64.53,202.22,8.24,285.55,0,384H576c-8.24-98.45-64.54-181.78-146.85-226.55" /></svg>
                                                        )}
                                                        {link.platform === 'web' && (
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                                                        )}
                                                        <span>{t.projects.play}</span>
                                                    </a>
                                                ))
                                            )}

                                            {/* Status Badge if NO interactive links exist */}
                                            {(!game.links || game.links.length === 0) && (
                                                <div className="flex-1 text-center py-3 border border-dashed border-white/20 text-white/30 text-sm font-mono uppercase tracking-widest cursor-not-allowed w-full">
                                                    {game.status === "Released" ? t.projects.status_released : t.projects.status_dev}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
