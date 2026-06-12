import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Journal",
    template: "%s | ULSOME",
  },
  description:
    "Development logs and design notes from ULSOME — game design, systems thinking, and project post-mortems.",
  openGraph: {
    title: "Journal | ULSOME",
    url: "/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
