import type { Locale } from '@/locales/dictionary';

// Locales a post can be authored in, and the one used as fallback / SEO default.
export const POST_LOCALES: Locale[] = ['zh', 'en'];
export const POST_DEFAULT_LOCALE: Locale = 'zh';

// A single-language version of a post (one .md file).
export interface PostData {
    slug: string;
    locale: Locale;
    title: string;
    date: string;
    excerpt: string;
    tags: string[];
    contentHtml?: string;
    [key: string]: unknown;
}

// One logical post, grouping every language version that exists for a slug.
export interface LocalizedPost {
    slug: string;
    translations: Partial<Record<Locale, PostData>>;
}

// Pick the requested locale, falling back to the default, then any available
// version — so a post that only exists in one language still renders.
export function resolvePost(post: LocalizedPost, locale: Locale): PostData {
    return (
        post.translations[locale] ??
        post.translations[POST_DEFAULT_LOCALE] ??
        Object.values(post.translations)[0]!
    );
}
