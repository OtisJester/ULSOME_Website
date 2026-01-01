import { getPostData, getAllPostSlugs } from "@/lib/markdown";
import Link from "next/link";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const paths = getAllPostSlugs();
    return paths.map((path) => path.params);
}

export default async function BlogPost({ params }: Props) {
    const { slug } = await params;
    const postData = await getPostData(slug);

    return (
        <div className="min-h-screen bg-background text-foreground bg-grid py-24 px-4">
            <div className="hidden fixed top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent z-50 md:block" />

            <article className="max-w-3xl mx-auto">
                {/* Header */}
                <header className="mb-12 text-center">
                    <Link
                        href="/blog"
                        className="inline-block mb-8 text-sm font-semibold text-white/40 hover:text-white transition-colors"
                    >
                        ← Back to Garden
                    </Link>

                    <h1 className="text-4xl md:text-6xl font-bold mb-6 !leading-tight text-white">
                        {postData.title}
                    </h1>

                    <div className="flex items-center justify-center gap-4 text-white/40 font-mono text-sm">
                        <time>{postData.date}</time>
                        <span>•</span>
                        <div className="flex gap-2">
                            {postData.tags && postData.tags.map((tag: string) => (
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
                    dangerouslySetInnerHTML={{ __html: postData.contentHtml || "" }}
                />

                {/* Footer */}
                <footer className="mt-16 pt-8 border-t border-white/10 text-center text-white/40">
                    Thanks for reading!
                </footer>
            </article>
        </div>
    );
}
