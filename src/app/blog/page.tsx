import { getSortedPostsData } from "@/lib/markdown";
import BlogIndex from "./BlogIndex";

export default function BlogPage() {
    const allPosts = getSortedPostsData();
    return <BlogIndex posts={allPosts} />;
}
