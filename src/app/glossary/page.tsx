import type { Metadata } from "next";
import Link from "next/link";
import { StepGrid } from "@/components/glossary-ui";
import { getGlossaryOverview } from "@/lib/glossary";

export const metadata: Metadata = { title: "Glossary" };

export default async function GlossaryPage() {
  const sections = await getGlossaryOverview();
  return (
    <main className="space-y-14">
      <header>
        <h1 className="font-serif text-6xl tracking-tight md:text-7xl">Glossary</h1>
        <p className="mt-3 max-w-xl text-cream/75">
          Vaganova terminology, organised by what a step is and how it moves. Jumps are grouped by take-off and
          landing; every step links to what it is built from and what it leads to.
        </p>
      </header>
      {sections.map(({ section, steps }) => (
        <section key={section.slug}>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-4xl">{section.name}</h2>
              {section.description && <p className="mt-1 text-sm text-cream/65">{section.description}</p>}
            </div>
            <Link href={`/glossary/category/${section.slug}`} className="shrink-0 text-sm text-cream/70 hover:text-cream">
              View section →
            </Link>
          </div>
          <StepGrid steps={steps} />
        </section>
      ))}
    </main>
  );
}
