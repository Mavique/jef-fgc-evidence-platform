import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "@/styles/globals.css";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans"
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "Jengrac Education Foundation",
  description:
    "JEF builds AI and Extended Reality systems for education, training and skills development."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${display.variable} ${sans.variable} ${mono.variable} bg-ink font-sans text-paper antialiased`}>
        <SiteNav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
