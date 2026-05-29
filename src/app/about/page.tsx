"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import QRCodeGenerator from "@/components/QRCodeGenerator";

export default function AboutPage() {
    const { t } = useLanguage();
    const [isFlipped, setIsFlipped] = useState<boolean>(false);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [cardUrl, setCardUrl] = useState<string>("");

    // 3D Tilt Coordinates
    const [rotateX, setRotateX] = useState<number>(0);
    const [rotateY, setRotateY] = useState<number>(0);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setCardUrl(window.location.href);
        }
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        
        // Calculate coordinates relative to card center
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Scale values to rotate maximum ~10 degrees
        const tiltX = -(y / (rect.height / 2)) * 10;
        const tiltY = (x / (rect.width / 2)) * 10;
        
        setRotateX(tiltX);
        setRotateY(tiltY);
    };

    const handleMouseLeave = () => {
        // Reset tilt on leave
        setRotateX(0);
        setRotateY(0);
    };

    const copyToClipboard = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(t.about.website);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground bg-hex-pattern p-4 md:p-12 font-mono flex flex-col items-center justify-between">
            {/* JSON-LD Structured Data for AI Crawlers */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Person",
                        "name": t.about.name,
                        "jobTitle": t.about.role,
                        "url": t.about.website,
                        "sameAs": [
                            "https://github.com/OtisJester",
                            "https://ulsome.com"
                        ],
                        "description": t.about.intro,
                        "knowsAbout": [
                            "Game Development",
                            "Level Design",
                            "Systems Design",
                            "Narrative Design"
                        ],
                        "worksFor": {
                            "@type": "Organization",
                            "name": "ULSOME"
                        }
                    })
                }}
            />

            <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-between min-h-[90vh]">
                
                {/* Top Header / Language Switcher */}
                <div className="w-full flex justify-between items-center mb-8">
                    <Link href="/" className="text-primary/50 hover:text-primary transition-colors text-xs uppercase tracking-[0.2em] border border-primary/20 px-2 py-1 bg-black/40 backdrop-blur-md">
                        ← Return HQ
                    </Link>
                    <LanguageSwitcher />
                </div>

                {/* Core Area: Card Display */}
                <div 
                    className="w-full flex flex-col items-center justify-center py-8 relative"
                    style={{ perspective: "1200px" }}
                >
                    
                    {/* Card Container */}
                    <motion.div
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        animate={{ 
                            rotateX: rotateX,
                            rotateY: isFlipped ? 180 + rotateY : rotateY
                        }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 150, 
                            damping: 20, 
                            mass: 0.8
                        }}
                        style={{ transformStyle: "preserve-3d" }}
                        className="w-full max-w-2xl min-h-[480px] md:min-h-[380px] cursor-pointer relative z-10"
                    >
                        
                        {/* ==================== CARD FRONT ==================== */}
                        <div 
                            onClick={() => setIsFlipped(true)}
                            className="absolute inset-0 w-full h-full glass-panel rounded-xl p-8 flex flex-col justify-between select-none shadow-[0_0_30px_rgba(205,164,94,0.05)] border border-primary/10"
                            style={{ 
                                backfaceVisibility: "hidden", 
                                WebkitBackfaceVisibility: "hidden" 
                            }}
                        >
                            {/* Decorative Tech Corners */}
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/40 rounded-tl-xl" />
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/40 rounded-tr-xl" />
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/40 rounded-bl-xl" />
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/40 rounded-br-xl" />

                            {/* Card Header */}
                            <div className="flex justify-between items-start border-b border-primary/10 pb-4">
                                <div>
                                    <h2 className="text-xs uppercase text-primary/60 tracking-[0.25em]">Identity Profile</h2>
                                    <span className="text-xs text-white/30">ULSOME // PROTOCOL 01</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] uppercase font-bold px-2 py-0.5 tracking-wider rounded">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                    STATUS: ACTIVE
                                </div>
                            </div>

                            {/* Main Body content */}
                            <div className="flex flex-col md:flex-row gap-8 items-center py-6">
                                {/* Hexagon Avatar with scanning line effect */}
                                <div className="relative group shrink-0">
                                    <div className="w-32 h-32 clip-hex bg-gradient-to-br from-primary/30 via-transparent to-primary/10 flex items-center justify-center p-1 relative overflow-hidden">
                                        <div className="absolute inset-0.5 bg-[#0a0a0b] clip-hex flex items-center justify-center overflow-hidden">
                                            <img
                                                src="/avatar.png"
                                                alt={t.about.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    {/* Scan bar effect on hover */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-primary/40 blur-[1px] animate-[scan_3s_infinite_ease-in-out] pointer-events-none" />
                                </div>

                                {/* Identity details */}
                                <div className="flex-1 text-center md:text-left space-y-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-white tracking-wide">{t.about.name}</h1>
                                        <span className="text-primary text-xs uppercase tracking-widest block mt-0.5 font-semibold">
                                            {t.about.role}
                                        </span>
                                    </div>

                                    <div className="space-y-3 border-t border-white/5 pt-3">
                                        {/* Experience */}
                                        <div>
                                            <span className="text-[10px] text-white/30 uppercase tracking-widest block mb-1">
                                                Specification & Exp
                                            </span>
                                            <p className="text-sm text-white/80 whitespace-pre-line leading-relaxed">
                                                {t.about.experience}
                                            </p>
                                        </div>

                                        {/* Website Contact Info */}
                                        <div>
                                            <span className="text-[10px] text-white/30 uppercase tracking-widest block mb-1">
                                                {t.about.contact_title}
                                            </span>
                                            <div className="flex items-center justify-center md:justify-start gap-2">
                                                <a 
                                                    href={t.about.website}
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    onClick={(e) => e.stopPropagation()} // Avoid triggering card flip
                                                    className="text-primary hover:text-white transition-colors text-sm border-b border-primary/20 hover:border-white pb-0.5 max-w-[240px] truncate"
                                                >
                                                    {t.about.website.replace(/^https?:\/\//, "")}
                                                </a>
                                                <button 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        copyToClipboard(); 
                                                    }}
                                                    className="p-1 hover:bg-white/10 text-white/40 hover:text-primary transition-all rounded"
                                                    title="Copy Link"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer / Flip indicator */}
                            <div className="flex items-center justify-between border-t border-white/5 pt-4 text-[10px] text-white/40">
                                <span>"{t.about.intro}"</span>
                                <div className="flex items-center gap-1 text-primary animate-pulse group-hover:text-white">
                                    <span>SCAN CARD / FLIP</span>
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* ==================== CARD BACK ==================== */}
                        <div 
                            onClick={() => setIsFlipped(false)}
                            className="absolute inset-0 w-full h-full glass-panel rounded-xl p-8 flex flex-col justify-between select-none shadow-[0_0_30px_rgba(205,164,94,0.1)] border border-primary/20"
                            style={{ 
                                backfaceVisibility: "hidden", 
                                WebkitBackfaceVisibility: "hidden", 
                                transform: "rotateY(180deg)" 
                            }}
                        >
                            {/* Decorative Tech Corners */}
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/40 rounded-tl-xl" />
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/40 rounded-tr-xl" />
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/40 rounded-bl-xl" />
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/40 rounded-br-xl" />

                            {/* Card Header */}
                            <div className="flex justify-between items-start border-b border-primary/10 pb-4">
                                <div>
                                    <h2 className="text-xs uppercase text-primary/60 tracking-[0.25em]">Interactive Code</h2>
                                    <span className="text-xs text-white/30">SCAN TO LINK PROTOCOL</span>
                                </div>
                                <div className="text-[10px] text-white/40 tracking-wider">
                                    BACKSIDE // ADDR
                                </div>
                            </div>

                            {/* Body Section: QR Code */}
                            <div className="flex flex-col items-center justify-center py-4 relative group">
                                <QRCodeGenerator 
                                    value={cardUrl || t.about.website}
                                    size={160}
                                    fgColor="#cda45e"
                                    bgColor="transparent"
                                />
                                
                                {/* Sci-fi Scan Bar overlay over QR code */}
                                <div className="absolute top-2 w-[176px] h-0.5 bg-primary/40 shadow-[0_0_8px_#cda45e] animate-[scan_2s_infinite_ease-in-out] pointer-events-none" />
                                
                                <p className="text-[10px] text-white/30 tracking-[0.2em] mt-3">
                                    SCAN TO OPEN MOBILE CARD
                                </p>
                            </div>

                            {/* Card Footer / Flip back */}
                            <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                <div className="flex gap-2">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard();
                                        }}
                                        className="px-3 py-1 bg-primary/10 hover:bg-primary hover:text-black border border-primary/30 hover:border-transparent text-primary text-[10px] transition-all rounded uppercase font-semibold"
                                    >
                                        Copy Page URL
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-1 text-primary animate-pulse">
                                    <span>RETURN CARD INFO</span>
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                    </motion.div>

                    {/* Copied Popup Overlay (HUD Style) */}
                    <AnimatePresence>
                        {isCopied && (
                            <motion.div
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute -bottom-16 left-1/2 -translate-x-1/2 px-6 py-2 border border-primary/30 bg-black/90 text-primary text-xs font-mono tracking-[0.15em] shadow-[0_0_15px_rgba(205,164,94,0.2)] rounded z-50 whitespace-nowrap"
                            >
                                [ SYSTEM: WEBSITE URL COPIED TO CLIPBOARD ]
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Section */}
                <div className="text-white/20 text-[10px] tracking-widest text-center mt-8 pb-4">
                    ULSOME SYSTEM // OTIS CHANG // ALL RIGHTS RESERVED
                </div>

            </div>

            {/* Scanning Scan animation keyframes definition in CSS */}
            <style jsx global>{`
                @keyframes scan {
                    0%, 100% {
                        transform: translateY(0);
                        opacity: 0.3;
                    }
                    50% {
                        transform: translateY(148px);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}

