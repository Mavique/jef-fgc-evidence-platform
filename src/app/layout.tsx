import type { Metadata } from "next";
import "@/styles/globals.css";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Jengrac Education Foundation",
  description:
    "JEF builds AI and Extended Reality systems for education, training and skills development."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-ink font-sans text-paper antialiased">
        <SiteNav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
