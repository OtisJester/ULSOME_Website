import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Otis Chang",
  description:
    "Otis Chang — game designer & systems architect at ULSOME. Digital business card with contact info and QR code.",
  openGraph: {
    title: "About — Otis Chang | ULSOME",
    url: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
