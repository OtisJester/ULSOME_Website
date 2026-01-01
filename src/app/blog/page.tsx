import Link from "next/link";
import { getSortedPostsData } from "@/lib/markdown";

export default function BlogIndex() {
    const allPosts = getSortedPostsData();

    return (
        <div className="min-h-screen bg-background text-foreground bg-grid p-8 pt-24">
            <header className="max-w-4xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-4">
                        Digital <span className="text-gradient">Garden</span>
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl">
                        Thoughts, tutorials, and development logs from the trenches of game creation.
                    </p>
                </div>

                <Link
                    href="/"
                    className="text-sm font-semibold text-white/40 hover:text-white transition-colors flex items-center gap-2"
                >
                    ← Back to Base
                </Link>
            </header>

            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                {allPosts.map(({ slug, date, title, excerpt, tags }) => (
                    <Link
                        key={slug}
                        href={`/blog/${slug}`}
                        className="group glass-panel p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 border-l-4 border-transparent hover:border-l-primary"
                    >
                        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-2">
                            <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">
                                {title}
                            </h2>
                            <time className="text-sm text-white/40 font-mono whitespace-nowrap">
                                {date}
                            </time>
                        </div>

                        <p className="text-white/70 mb-6 leading-relaxed">
                            {excerpt}
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {tags && tags.map((tag: string) => (
                                <span key={tag} className="text-xs font-medium px-2 py-1 bg-white/5 rounded text-white/40 group-hover:text-white/60 transition-colors">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </Link>
                ))}

                {allPosts.length === 0 && (
                    <div className="text-center py-20 text-white/30">
                        No posts found. The garden is still being planted. 🌱
                    </div>
                )}
            </div>
        </div>
    );
}
