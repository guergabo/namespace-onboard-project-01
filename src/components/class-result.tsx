import Link from "next/link";
import { GOAL_LABELS, choicesQuery, type Choices, type ClassSection } from "@/lib/class-builder";
import { Figure } from "./diagrams";

const minutes = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  return `${m}${seconds % 60 ? "½" : ""} min`;
};

/** A built class, section by section. Regenerate and swap are links, so every class has its own URL. */
export function ClassResult({ sections, choices }: { sections: ClassSection[]; choices: Choices }) {
  const href = (c: Choices) => `/class?${choicesQuery(c)}#your-class`;
  // Only swaps still in effect go into the URL, so cycling through a section keeps it short.
  const skipped = sections.flatMap((s) => s.skipped);
  const goals = choices.goals.map((g) => GOAL_LABELS[g]).join(" + ");
  return (
    <section id="your-class" className="scroll-mt-6 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-serif text-4xl leading-tight">
          <span className="capitalize">{choices.level}</span> · {goals} · {choices.minutes} min
        </h2>
        <div className="flex gap-2">
          {skipped.length > 0 && (
            <Link href={href({ ...choices, skip: [] })} scroll={false} className="pill transition hover:bg-cream/10">
              Undo swaps
            </Link>
          )}
          <Link href={href({ ...choices, seed: choices.seed + 1, skip: [] })} scroll={false} className="pill transition hover:bg-cream/10">
            ↻ Regenerate
          </Link>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.key} className="glass p-5">
          <div className="flex items-baseline justify-between gap-4 border-b border-cream/15 pb-3">
            <h3 className="font-serif text-2xl">{section.title}</h3>
            <span className="text-cream/75">{minutes(section.seconds)}</span>
          </div>
          <ol className="divide-y divide-cream/10">
            {section.items.map(({ step, prescription, seconds }) => (
              <li key={step.slug} className="grid grid-cols-[48px_1fr_auto_auto] items-center gap-4 py-2.5">
                <div className="w-12">{step.pose && <Figure pose={step.pose} side="R" size="sm" />}</div>
                <div className="min-w-0">
                  <Link href={`/glossary/${step.slug}`} className="font-serif text-lg leading-tight hover:text-glow">
                    {step.name}
                  </Link>
                  <p className="text-sm text-cream/65">{prescription}</p>
                </div>
                <span className="text-sm text-cream/75">{minutes(seconds)}</span>
                {section.swappable ? (
                  <Link
                    href={href({ ...choices, skip: [...skipped, step.slug] })}
                    scroll={false}
                    aria-label={`Swap ${step.name} for another step`}
                    title="Swap for another step"
                    className="rounded-full px-2 py-1 text-cream/70 transition hover:bg-cream/10 hover:text-cream"
                  >
                    ⇄
                  </Link>
                ) : (
                  <span />
                )}
              </li>
            ))}
          </ol>
        </div>
      ))}

      <p className="text-sm text-cream/60">
        Counts are suggestions; adjust them to how you feel. Each step links to its glossary page.
      </p>
    </section>
  );
}
