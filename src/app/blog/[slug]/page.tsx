import type { Metadata } from "next";
import { getPostData, getAllPostSlugs } from "@/lib/markdown";
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
    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            title: `${post.title} | ULSOME`,
            description: post.excerpt,
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
