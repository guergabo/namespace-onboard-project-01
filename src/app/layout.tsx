import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
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
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="relative min-h-full">
        <div aria-hidden className="grain" />
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
