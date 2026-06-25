import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import type { Locale } from '@/locales/dictionary';
import {
    POST_LOCALES,
    POST_DEFAULT_LOCALE,
    type PostData,
    type LocalizedPost,
} from './posts';

export type { PostData, LocalizedPost } from './posts';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

// Unquoted YAML dates ("date: 2026-06-21") parse to a JS Date, which React
// can't render. Normalize frontmatter so date is always a string.
function normalizeData(data: Record<string, unknown>): Record<string, unknown> {
    const date = data.date;
    return {
        ...data,
        date: date instanceof Date ? date.toISOString().slice(0, 10) : date ?? '',
    };
}

// Parse a file name into its slug and locale.
//   "godot-web-build.en.md" -> { slug: 'godot-web-build', locale: 'en' }
//   "hello-world.md"        -> { slug: 'hello-world', locale: POST_DEFAULT_LOCALE }
// Returns null for anything that isn't a markdown file (e.g. the .obsidian dir).
function parseFileName(fileName: string): { slug: string; locale: Locale } | null {
    if (!fileName.endsWith('.md')) return null;

    const base = fileName.replace(/\.md$/, '');
    const parts = base.split('.');
    const maybeLocale = parts[parts.length - 1];

    if (parts.length > 1 && (POST_LOCALES as string[]).includes(maybeLocale)) {
        return { slug: parts.slice(0, -1).join('.'), locale: maybeLocale as Locale };
    }
    return { slug: base, locale: POST_DEFAULT_LOCALE };
}

// Group every markdown file by base slug, reading frontmatter only (no body
// rendering — kept cheap for the list page).
function readAllPosts(): Map<string, LocalizedPost> {
    const map = new Map<string, LocalizedPost>();
    if (!fs.existsSync(postsDirectory)) return map;

    for (const fileName of fs.readdirSync(postsDirectory)) {
        const parsed = parseFileName(fileName);
        if (!parsed) continue;

        const { slug, locale } = parsed;
        const fileContents = fs.readFileSync(path.join(postsDirectory, fileName), 'utf8');
        const { data } = matter(fileContents);

        const entry = map.get(slug) ?? { slug, translations: {} };
        entry.translations[locale] = { slug, locale, ...normalizeData(data) } as PostData;
        map.set(slug, entry);
    }

    return map;
}

// Date used for sorting/display, taken from the default-locale version when
// available, otherwise whichever translation exists.
function sortDate(post: LocalizedPost): string {
    const preferred =
        post.translations[POST_DEFAULT_LOCALE] ?? Object.values(post.translations)[0];
    return (preferred?.date as string) ?? '';
}

export function getSortedPostsData(): LocalizedPost[] {
    return [...readAllPosts().values()].sort((a, b) =>
        sortDate(a) < sortDate(b) ? 1 : -1,
    );
}

export function getAllPostSlugs() {
    return [...readAllPosts().keys()].map((slug) => ({ params: { slug } }));
}

// Resolve the file backing a given slug + locale, allowing the default locale to
// fall back to a suffix-less "slug.md".
function localeFilePath(slug: string, locale: Locale): string | null {
    const suffixed = path.join(postsDirectory, `${slug}.${locale}.md`);
    if (fs.existsSync(suffixed)) return suffixed;

    if (locale === POST_DEFAULT_LOCALE) {
        const bare = path.join(postsDirectory, `${slug}.md`);
        if (fs.existsSync(bare)) return bare;
    }
    return null;
}

// Read and render every available language version of a single post.
export async function getPostData(slug: string): Promise<LocalizedPost> {
    const translations: Partial<Record<Locale, PostData>> = {};

    for (const locale of POST_LOCALES) {
        const filePath = localeFilePath(slug, locale);
        if (!filePath) continue;

        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);
        const processed = await remark().use(html).process(content);

        translations[locale] = {
            slug,
            locale,
            contentHtml: processed.toString(),
            ...normalizeData(data),
        } as PostData;
    }

    return { slug, translations };
}
