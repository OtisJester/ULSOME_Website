import type { Metadata } from "next";
import { Playfair_Display, Space_Mono } from "next/font/google"; // Changed fonts
import "./globals.css";

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
  title: "ULSOME | Precision & Awe",
  description: "ULSOME: Delivering industrial precision and digital craftsmanship in game development and web experiences.",
};

// ... keep context provider logic if we add it later, for now just font setup
import { LanguageProvider } from "@/lib/i18n";

// ... existing imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
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
