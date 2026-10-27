import Link from "next/link";
import { notFound } from "next/navigation";
import type { HowTo } from "@/db/schema";
import { getStep } from "@/lib/glossary";
import { diagramTitle } from "./diagrams";
import { Breadcrumb, LevelPill } from "./glossary-ui";
import { SpeakButton } from "./speak-button";
import { StepBody } from "./step-body";

const HOW_TO_ROWS: [keyof HowTo, string][] = [
  ["start", "Start position"],
  ["standingLeg", "Standing leg"],
  ["workingLeg", "Working leg"],
  ["direction", "Movement"],
  ["arms", "Arms"],
  ["head", "Head"],
  ["bodyDirection", "Body direction"],
  ["finish", "Finish"],
  ["cues", "Cues"],
  ["mistakes", "Common mistakes"],
];

/**
 * A glossary step page. Each variant has its own URL (/glossary/<step>/<variant>);
 * without a variant the page shows the step's overview.
 */
export async function StepPage({ slug, variantSlug }: { slug: string; variantSlug?: string }) {
  const detail = await getStep(slug);
  if (!detail) notFound();
  const { step, path, related, variants } = detail;
  const variant = variantSlug ? variants.find((v) => v.slug === variantSlug) : undefined;
  if (variantSlug && !variant) notFound();

  const howTo: HowTo = { ...step.howTo, ...variant?.howTo };
  const rows = HOW_TO_ROWS.flatMap(([key, label]): [string, string][] => (howTo[key] ? [[label, howTo[key]]] : []));
  const phases = variant?.phases.length ? variant.phases : step.phases;
  // The overview shows the step's own diagrams, or else one of each distinct variant diagram.
  const diagrams = variant?.diagrams.length
    ? variant.diagrams.map((d) => ({ ...d, title: diagramTitle(d.data) }))
    : variant || step.diagrams.length
      ? step.diagrams.map((d) => ({ ...d, title: diagramTitle(d.data) }))
      : variants
          .flatMap((v) => v.diagrams.map((d) => ({ ...d, title: v.name })))
          .filter((d, i, all) => all.findIndex((x) => JSON.stringify(x.data) === JSON.stringify(d.data)) === i);
  const termList = [...step.terms, ...(variant?.terms ?? [])].filter(
    (t, i, all) => all.findIndex((x) => x.slug === t.slug) === i,
  );
  const tabs = [
    { href: `/glossary/${step.slug}`, name: "Overview", active: !variant },
    ...variants.map((v) => ({ href: `/glossary/${step.slug}/${v.slug}`, name: v.name, active: v.slug === variant?.slug })),
  ];

  return (
    <main className="space-y-6">
      <header>
        <Breadcrumb
          items={[
            { href: "/glossary", label: "Glossary" },
            ...path.map((c) => ({ href: `/glossary/category/${c.slug}`, label: c.name })),
          ]}
        />
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <h1 className="font-serif text-6xl leading-none tracking-tight md:text-7xl">{step.name}</h1>
          <SpeakButton text={step.name} />
        </div>
        {(step.pronunciation || step.translation) && (
          <p className="mt-3 font-serif text-xl italic text-cream/80">
            {step.pronunciation && `(${step.pronunciation})`}
            {step.pronunciation && step.translation && " — "}
            {step.translation && `“${step.translation}”`}
          </p>
        )}
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-cream/85">{step.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <LevelPill level={variant?.level ?? step.level} />
          {step.jumpSize && <span className="pill border-cream/20">{step.jumpSize} allegro</span>}
          {(variant ?? step).needsReview && (
            <span className="pill border-dashed border-cream/40 text-cream/70" title="This entry has not been reviewed yet">
              Draft · needs review
            </span>
          )}
        </div>
      </header>

      {variants.length > 0 && (
        <nav aria-label="Variants" className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              scroll={false}
              aria-current={t.active ? "page" : undefined}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                t.active ? "border-cream bg-cream text-sage-900" : "border-cream/30 text-cream/85 hover:bg-cream/10"
              }`}
            >
              {t.name}
            </Link>
          ))}
        </nav>
      )}

      {variant?.summary && <p className="max-w-2xl text-lg text-cream/85">{variant.summary}</p>}

      <StepBody kind={step.kind} phases={phases} diagrams={diagrams} howTo={rows} sided={!path.some((c) => c.slug === "arms")} />

      {termList.length > 0 && (
        <section className="flex flex-wrap items-center gap-2">
          <span className="mr-1 eyebrow text-cream/60">Terms</span>
          {termList.map((t) => (
            <Link key={t.slug} href={`/glossary/terms/${t.slug}`} className="pill italic transition hover:bg-cream/10">
              {t.name}
            </Link>
          ))}
        </section>
      )}

      <aside className="glass grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
        <h2 className="font-serif text-2xl sm:col-span-full">Related</h2>
        {related.length === 0 && <p className="text-sm text-cream/60">No relationships yet.</p>}
        {related.map((group) => (
          <div key={group.title}>
            <h3 className="eyebrow text-cream/60">{group.title}</h3>
            <ul className="mt-2 space-y-1.5">
              {group.items.map((item, i) => (
                <li key={i}>
                  <Link href={item.href} className="text-cream/90 underline-offset-4 transition hover:text-glow hover:underline">
                    {item.label}
                  </Link>
                  {item.note && <span className="text-sm text-cream/60"> — {item.note}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>
    </main>
  );
}
