import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb, PageSkeleton } from "@/components/glossary-ui";
import { SpeakButton } from "@/components/speak-button";
import { getTerm, getTermSlugs } from "@/lib/glossary";

export async function generateStaticParams() {
  return getTermSlugs();
}

export async function generateMetadata({ params }: PageProps<"/glossary/terms/[slug]">): Promise<Metadata> {
  const data = await getTerm((await params).slug);
  return { title: data?.term.name ?? "Term" };
}

export default function TermPage({ params }: PageProps<"/glossary/terms/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TermContent params={params} />
    </Suspense>
  );
}

async function TermContent({ params }: { params: PageProps<"/glossary/terms/[slug]">["params"] }) {
  const data = await getTerm((await params).slug);
  if (!data) notFound();
  const { term, usedBy } = data;

  return (
    <main className="space-y-8">
      <header>
        <Breadcrumb items={[{ href: "/glossary", label: "Glossary" }, { label: "Terms" }]} />
        <div className="mt-4 flex items-center gap-4">
          <h1 className="font-serif text-6xl italic tracking-tight md:text-7xl">{term.name}</h1>
          <SpeakButton text={term.name} />
        </div>
        {(term.pronunciation || term.translation) && (
          <p className="mt-3 font-serif text-xl italic text-cream/80">
            {term.pronunciation && `(${term.pronunciation})`}
            {term.pronunciation && term.translation && " — "}
            {term.translation && `“${term.translation}”`}
          </p>
        )}
        <p className="mt-4 max-w-2xl leading-relaxed text-cream/85">{term.definition}</p>
      </header>
      <section className="glass p-6">
        <h2 className="font-serif text-2xl">Used in</h2>
        <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {usedBy.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-cream/90 underline-offset-4 hover:text-glow hover:underline">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
