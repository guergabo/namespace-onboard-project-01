import Link from "next/link";
import { GOAL_LABELS, choicesQuery, clock, type Choices, type ClassItem, type ClassSection } from "@/lib/class-builder";
import { ClassPlayer, Timeline, type PlaySection } from "./class-player";
import { Figure } from "./diagrams";

const minutes = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  return `${m}${seconds % 60 ? "½" : ""} min`;
};

/** Which of a row's alternatives is showing: dots for a few, a number for many. */
function Choice({ item }: { item: ClassItem }) {
  if (item.options < 2) return null;
  const label = `Option ${item.choice + 1} of ${item.options}`;
  if (item.options > 6) return <p className="text-xs text-cream/50">{label}</p>;
  return (
    <p className="flex gap-1.5 pt-1" aria-label={label}>
      {Array.from({ length: item.options }, (_, i) => (
        <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === item.choice ? "bg-gold" : "bg-cream/25"}`} />
      ))}
    </p>
  );
}

/** A built class, section by section. Regenerate and the ‹ › swaps are links, so every class has its own URL. */
export function ClassResult({ sections, choices }: { sections: ClassSection[]; choices: Choices }) {
  const href = (c: Choices) => `/class?${choicesQuery(c)}#your-class`;
  const swap = (item: ClassItem, by: number) => href({ ...choices, alts: { ...choices.alts, [item.origin]: item.choice + by } });
  const swapped = sections.some((s) => s.items.some((i) => i.choice > 0));
  const goals = choices.goals.map((g) => GOAL_LABELS[g]).join(" + ");
  const title = `${choices.level[0].toUpperCase()}${choices.level.slice(1)} · ${goals} · ${choices.minutes} min`;
  const play: PlaySection[] = sections.map((s) => ({
    key: s.key,
    title: s.title,
    seconds: s.seconds,
    items: s.items.map(({ step, prescription, seconds, sided }) => ({
      slug: step.slug,
      name: step.name,
      prescription,
      seconds,
      sided,
      poses: step.phases.length ? step.phases : step.pose ? [step.pose] : [],
    })),
  }));
  const arrow = "flex h-8 w-8 items-center justify-center rounded-full text-xl text-cream/70 transition hover:bg-cream/10 hover:text-cream";
  return (
    <section id="your-class" className="scroll-mt-6 space-y-4">
      <div className="rise-in flex flex-wrap items-center justify-between gap-4" style={{ animationDelay: "0.1s" }}>
        <h2 className="font-serif text-4xl leading-tight">Your class</h2>
        <div className="flex flex-wrap items-center gap-2">
          {swapped && (
            <Link href={href({ ...choices, alts: {} })} scroll={false} className="pill transition hover:bg-cream/10">
              Undo swaps
            </Link>
          )}
          <Link href={href({ ...choices, seed: choices.seed + 1, alts: {} })} scroll={false} className="pill transition hover:bg-cream/10">
            ↻ Regenerate
          </Link>
          <ClassPlayer key={choicesQuery(choices)} title={title} sections={play} />
        </div>
      </div>

      <div className="draw-x" style={{ animationDelay: "0.25s" }}>
        <Timeline sections={sections.map(({ key, seconds }) => ({ key, seconds }))} />
      </div>

      {sections.map((section, s) => (
        <div key={section.key} className="glass rise-in p-5" style={{ animationDelay: `${0.45 + s * 0.15}s` }}>
          <div className="flex items-baseline justify-between gap-4 border-b border-cream/15 pb-3">
            <h3 className="font-serif text-2xl">{section.title}</h3>
            <span className="text-cream/75">{minutes(section.seconds)}</span>
          </div>
          <ol className="divide-y divide-cream/10">
            {section.items.map((item, r) => (
              <li
                key={item.origin}
                className="rise-in grid grid-cols-[56px_auto_1fr_auto_auto] items-center gap-2 py-2.5 sm:gap-3"
                style={{ animationDelay: `${0.55 + s * 0.15 + r * 0.06}s` }}
              >
                {/* Keyed by step, so a swapped-in step fades in. */}
                <div key={`${item.step.slug}:figure`} className="phase-in w-14">
                  {item.step.pose && <Figure pose={item.step.pose} side="R" size="sm" />}
                </div>
                {item.options > 1 ? (
                  <Link href={swap(item, -1)} scroll={false} aria-label={`Previous alternative to ${item.step.name}`} className={arrow}>
                    ‹
                  </Link>
                ) : (
                  <span className="w-8" />
                )}
                <div key={`${item.step.slug}:text`} className="phase-in min-w-0">
                  <Link href={`/glossary/${item.step.slug}`} className="font-serif text-lg leading-tight hover:text-glow">
                    {item.step.name}
                  </Link>
                  <p className="text-sm text-cream/65">{item.prescription}</p>
                  <Choice item={item} />
                </div>
                {item.options > 1 ? (
                  <Link href={swap(item, 1)} scroll={false} aria-label={`Next alternative to ${item.step.name}`} className={arrow}>
                    ›
                  </Link>
                ) : (
                  <span className="w-8" />
                )}
                <span className="rounded-full border border-cream/25 px-3 py-1 text-sm tabular-nums text-cream/80">{clock(item.seconds)}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}

      <p className="text-sm text-cream/60">
        Counts are suggestions; adjust them to how you feel. Use ‹ › to try other steps, and each name to open its glossary page.
      </p>
    </section>
  );
}
