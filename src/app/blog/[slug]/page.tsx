import type { Metadata } from "next";
import { getPostData, getAllPostSlugs } from "@/lib/markdown";
import { resolvePost, POST_DEFAULT_LOCALE } from "@/lib/posts";
import BlogPost from "./BlogPost";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const paths = getAllPostSlugs();
    return paths.map((path) => path.params);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostData(slug);
    const meta = resolvePost(post, POST_DEFAULT_LOCALE);
    return {
        title: meta.title,
        description: meta.excerpt,
        openGraph: {
            title: `${meta.title} | ULSOME`,
            description: meta.excerpt,
            type: "article",
            url: `/blog/${slug}`,
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const postData = await getPostData(slug);
    return <BlogPost post={postData} />;
}
