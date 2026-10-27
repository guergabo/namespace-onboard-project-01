import Link from "next/link";
import type { CategoryNode, StepCard as StepCardData } from "@/lib/glossary";

export function CategoryTree({ nodes, depth = 0 }: { nodes: CategoryNode[]; depth?: number }) {
  return (
    <ul className={depth === 0 ? "space-y-1" : "ml-3 mt-1 space-y-0.5 border-l border-cream/15 pl-3"}>
      {nodes.map((n) => (
        <li key={n.slug}>
          {n.children.length > 0 ? (
            <details open={depth === 0 ? undefined : true} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-2 py-1.5 transition hover:bg-cream/10">
                <Link
                  href={`/glossary/category/${n.slug}`}
                  className={depth === 0 ? "font-serif text-[17px]" : "text-sm text-cream/85"}
                >
                  {n.name}
                </Link>
                <span className="text-cream/50 transition group-open:rotate-90">›</span>
              </summary>
              <CategoryTree nodes={n.children} depth={depth + 1} />
            </details>
          ) : (
            <Link
              href={`/glossary/category/${n.slug}`}
              className={`flex items-center justify-between rounded-lg px-2 py-1.5 transition hover:bg-cream/10 ${
                depth === 0 ? "font-serif text-[17px]" : "text-sm text-cream/85"
              }`}
            >
              {n.name}
              <span className="text-xs text-cream/45">{n.stepCount}</span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

const LEVEL_STYLES: Record<string, string> = {
  beginner: "bg-sage-400/30",
  intermediate: "bg-[#b59a5a]/35",
  advanced: "bg-[#a86e55]/40",
};

export function LevelPill({ level }: { level: string }) {
  return <span className={`pill border-transparent capitalize ${LEVEL_STYLES[level] ?? ""}`}>{level}</span>;
}

/** Key positions of a movement on a floor line, in order. Stands in for phase drawings. */
export function PhaseStrip({ phases, size = "sm" }: { phases: string[]; size?: "sm" | "lg" }) {
  if (phases.length === 0) return null;
  // The large strip runs vertically on phones and horizontally from the sm breakpoint.
  const lg = size === "lg";
  return (
    <ol
      className={`relative gap-3 ${lg ? "flex flex-col sm:grid" : "grid"}`}
      style={{ gridTemplateColumns: `repeat(${phases.length}, minmax(0, 1fr))` }}
    >
      <span aria-hidden className={`absolute left-2 right-2 top-[7px] h-px bg-cream/25 ${lg ? "hidden sm:block" : ""}`} />
      {phases.map((caption, i) => (
        <li key={i} className={`relative ${lg ? "flex items-start gap-3 sm:block" : ""}`}>
          <span
            className={`relative block h-[15px] w-[15px] shrink-0 rounded-full bg-glow ${
              lg ? "glow-dot" : "shadow-[0_0_12px_4px_rgb(255_246_223/0.45)]"
            }`}
          />
          <p className={`leading-snug text-cream/80 ${lg ? "text-sm sm:mt-3" : "mt-3 text-[11px]"}`}>
            <span className="mr-1 text-cream/50">{i + 1}</span>
            {caption}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function StepCard({ step }: { step: StepCardData }) {
  return (
    <Link href={`/glossary/${step.slug}`} className="glass group flex flex-col p-5 transition hover:bg-cream/12">
      <div className="min-h-[92px]">
        {step.phases.length > 0 ? (
          <PhaseStrip phases={step.phases} />
        ) : (
          <p className="text-sm leading-relaxed text-cream/75">{step.summary}</p>
        )}
      </div>
      <div className="mt-5 border-t border-cream/15 pt-4">
        <h3 className="font-serif text-2xl leading-tight transition group-hover:text-glow">{step.name}</h3>
        {step.pronunciation && <p className="mt-1 text-sm text-cream/60">({step.pronunciation})</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <LevelPill level={step.level} />
          {step.jumpSize && <span className="pill border-cream/20 text-cream/75">{step.jumpSize} allegro</span>}
          {step.variantCount > 0 && (
            <span className="text-xs text-cream/55">
              {step.variantCount} {step.variantCount === 1 ? "variant" : "variants"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function StepGrid({ steps }: { steps: StepCardData[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {steps.map((s) => (
        <StepCard key={s.slug} step={s} />
      ))}
    </div>
  );
}

export function Breadcrumb({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-cream/65">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-cream/40">›</span>}
          {item.href ? (
            <Link href={item.href} className="transition hover:text-cream">
              {item.label}
            </Link>
          ) : (
            <span className="text-cream">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Placeholder shown while a glossary page's content streams in. */
export function PageSkeleton() {
  return (
    <div aria-hidden className="animate-pulse space-y-6">
      <div className="h-4 w-48 rounded bg-cream/10" />
      <div className="h-16 w-2/3 rounded-xl bg-cream/10" />
      <div className="h-4 w-1/2 rounded bg-cream/10" />
      <div className="glass h-40" />
      <div className="glass h-64" />
    </div>
  );
}
