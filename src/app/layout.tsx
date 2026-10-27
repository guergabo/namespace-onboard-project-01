import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "tendu", template: "%s · tendu" },
  description: "A Vaganova ballet glossary and a workout builder that assembles a class around your goals.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${newsreader.variable} ${inter.variable} h-full antialiased`}>
      <body className="relative min-h-full">
        <div aria-hidden className="grain" />
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
