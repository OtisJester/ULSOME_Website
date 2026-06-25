"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { resolvePost, type LocalizedPost } from "@/lib/posts";

export default function BlogPost({ post }: { post: LocalizedPost }) {
    const { t, locale } = useLanguage();
    const current = resolvePost(post, locale);

    return (
        <div className="min-h-screen bg-background text-foreground bg-hex-pattern py-24 px-4">
            <LanguageSwitcher />
            <div className="hidden fixed top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent z-50 md:block" />

            <article className="max-w-3xl mx-auto">
                <Link
                    href="/blog"
                    className="inline-block mb-8 text-primary/50 hover:text-primary transition-colors text-xs uppercase tracking-[0.2em] border border-primary/20 px-2 py-1"
                >
                    {t.blog.back_to_list}
                </Link>

                {/* Header */}
                <header className="mb-12 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 !leading-tight text-white">
                        {current.title}
                    </h1>

                    <div className="flex items-center justify-center gap-4 text-white/40 font-mono text-sm">
                        <time>{current.date}</time>
                        <span>•</span>
                        <div className="flex gap-2">
                            {current.tags && current.tags.map((tag: string) => (
                                <span key={tag}>#{tag}</span>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div
                    className="prose prose-invert prose-lg max-w-none glass-panel p-8 md:p-12 rounded-3xl
                     prose-headings:font-bold prose-headings:text-white prose-headings:font-heading
                     prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                     prose-strong:text-white prose-code:text-accent prose-pre:bg-black/50"
                    dangerouslySetInnerHTML={{ __html: current.contentHtml || "" }}
                />

                {/* Footer */}
                <footer className="mt-16 pt-8 border-t border-white/10 text-center text-white/40">
                    {t.blog.thanks}
                </footer>
            </article>
        </div>
    );
}
