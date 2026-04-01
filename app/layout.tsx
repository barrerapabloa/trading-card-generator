import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

/** Editorial high-contrast serif (closer to marketing hero references than Playfair). */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Legendex — Nickname Trading Card",
  description: "AI-powered collector card with nickname, stats, and Flux portrait.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${cormorant.variable} h-full`}
    >
      <body
        className={`${GeistSans.className} min-h-full bg-zinc-950 text-zinc-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
