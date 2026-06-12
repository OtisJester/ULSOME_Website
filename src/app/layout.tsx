import type { Metadata } from "next";
import { Playfair_Display, Space_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ulsome.com"),
  title: {
    default: "ULSOME | Precision & Awe",
    template: "%s | ULSOME",
  },
  description:
    "ULSOME — indie game development by Otis Chang, focused on elegant rules and deep reflection. 專注於極簡規則與深度思考的獨立遊戲開發。",
  openGraph: {
    siteName: "ULSOME",
    type: "website",
    url: "/",
    title: "ULSOME | Precision & Awe",
    description:
      "Indie game development focused on elegant rules and deep reflection.",
    images: ["/images/logo_full.png"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Pre-rendered content defaults to zh; LanguageProvider updates lang on switch.
    <html lang="zh-Hant" className="dark">
      <body
        className={`${playfair.variable} ${spaceMono.variable} antialiased bg-background text-foreground font-mono`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
