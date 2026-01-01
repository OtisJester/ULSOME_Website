"use client";

import { useLanguage } from "@/lib/i18n";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground bg-hex-pattern relative overflow-hidden flex flex-col items-center justify-center selection:bg-primary selection:text-black">
      <LanguageSwitcher />

      {/* Decorative Rotating Hexagons Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.05] overflow-hidden">
        {/* Big Hexagon Ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] animate-[spin_120s_linear_infinite]">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.2">
            <polygon points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25" />
          </svg>
        </div>
        {/* Inner Hexagon Ring (Counter-rotating) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] animate-[spin_80s_linear_infinite_reverse]">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="5 5">
            <polygon points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25" />
          </svg>
        </div>
      </div>

      {/* Background Glow - Golden industrial */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10" />

      <main className="flex flex-col items-center text-center z-10 px-4 max-w-4xl">
        {/* Brand Mark - Hexagon Style */}
        <div className="mb-12 relative animate-fade-in-up">
          <div className="w-32 h-32 mx-auto relative group">
            {/* Outer Spinning Border */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent clip-hex animate-[spin_10s_linear_infinite]" />

            {/* Main Logo Container */}
            <div className="absolute inset-[2px] bg-background clip-hex flex items-center justify-center border border-primary/20 group-hover:border-primary transition-colors">
              <div className="w-24 h-24 bg-gradient-to-br from-[#1a1a1a] to-black clip-hex flex items-center justify-center shadow-inner">
                <span className="text-4xl text-primary font-heading font-bold mt-1">U</span>
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-6xl md:text-9xl font-bold tracking-[0.1em] mb-4 text-white font-heading uppercase">
          {t.home.title}
        </h1>

        <div className="h-px w-24 bg-primary/50 mx-auto mb-6" />

        <p className="text-xl md:text-2xl text-primary/80 mb-4 font-mono uppercase tracking-widest">
          {t.home.subtitle}
        </p>

        <p className="text-lg text-white/40 mb-12 max-w-lg mx-auto leading-relaxed">
          {t.home.description}
        </p>

        {/* Precision Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
          <Link
            href="/games"
            className="group relative px-8 py-4 bg-transparent border border-primary/30 text-primary font-bold uppercase tracking-widest hover:bg-primary hover:text-black transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {t.home.cta_projects}
              <span className="text-xs opacity-50">01</span>
            </span>
            <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>

          <Link
            href="/about"
            className="group relative px-8 py-4 bg-transparent border border-white/10 text-white/50 font-bold uppercase tracking-widest hover:border-white/30 hover:text-white transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {t.home.cta_about}
              <span className="text-xs opacity-30">02</span>
            </span>
          </Link>


        </div>
      </main>

      <footer className="absolute bottom-8 w-full px-8 flex justify-between text-xs text-white/20 font-mono uppercase tracking-widest border-t border-white/5 pt-4">
        <div>SYS.VER.2.0.25</div>
        <div>ULSOME IND. &copy; {new Date().getFullYear()}</div>
      </footer>
    </div>
  );
}
