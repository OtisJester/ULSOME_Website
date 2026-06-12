import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Project database — games Otis Chang has worked on, including OPUS: Echo of Starsong, ARIE: Moonprayer, Super Real AI, and more.",
  openGraph: {
    title: "Projects | ULSOME",
    url: "/games",
  },
};

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
