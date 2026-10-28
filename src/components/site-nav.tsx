import Link from "next/link";

export function SiteNav() {
  return (
    <header className="relative z-40 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
      <Link href="/" className="font-serif text-3xl font-medium italic tracking-tight text-cream">
        tendu
      </Link>
      <nav className="flex items-center gap-8 font-serif text-[17px] text-cream/90">
        <Link href="/glossary" className="transition hover:text-cream">
          Glossary
        </Link>
        <Link href="/class" className="transition hover:text-cream">
          Build my class
        </Link>
      </nav>
    </header>
  );
}
