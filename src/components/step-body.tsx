"use client";

import { useSyncExternalStore } from "react";
import type { DiagramData } from "@/db/schema";
import type { Phase } from "@/lib/glossary";
import { sideText, type Side } from "@/lib/pose";
import { Diagram, FigureNotes } from "./diagrams";
import { PhaseStrip } from "./glossary-ui";

/** The working-leg choice is shared by every step page and remembered in localStorage. */
const KEY = "tendu:working-leg";
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}
const getSide = (): Side => (localStorage.getItem(KEY) === "L" ? "L" : "R");
function setSide(side: Side) {
  localStorage.setItem(KEY, side);
  listeners.forEach((l) => l());
}

export type BodyDiagram = { data: DiagramData; title: string; caption: string | null };

/**
 * The side-dependent part of a step page: phases, diagrams and how-to text, all drawn for
 * the chosen working leg. Poses show an annotated figure instead of a how-to table.
 */
export function StepBody({
  kind,
  phases,
  diagrams,
  howTo,
}: {
  kind: "pose" | "movement";
  phases: Phase[];
  diagrams: BodyDiagram[];
  howTo: [string, string][];
}) {
  const side = useSyncExternalStore(subscribe, getSide, () => "R" as const);
  const figure = kind === "pose" ? diagrams.find((d) => d.data.kind === "figure") : undefined;
  const others = diagrams.filter((d) => d !== figure);
  const notes = figure?.data.kind === "figure" ? (figure.data.notes ?? []) : [];

  return (
    <div className="space-y-6">
      {(phases.length > 0 || diagrams.length > 0) && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="eyebrow text-cream/65">Working leg</span>
          <div role="radiogroup" aria-label="Working leg" className="flex rounded-full border border-cream/30 p-0.5">
            {(["R", "L"] as const).map((s) => (
              <button
                key={s}
                role="radio"
                aria-checked={side === s}
                onClick={() => setSide(s)}
                className={`rounded-full px-4 py-1 text-[15px] transition ${side === s ? "bg-cream text-sage-900" : "text-cream/85 hover:bg-cream/10"}`}
              >
                {s === "R" ? "Right" : "Left"}
              </button>
            ))}
          </div>
          <span className="text-[15px] text-cream/65">
            Diagrams show the {side === "R" ? "right" : "left"} leg working and the {side === "R" ? "left" : "right"} leg standing.
          </span>
        </div>
      )}

      {figure && (
        <section className="glass grid gap-6 p-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <figure>
            <figcaption className="eyebrow mb-2 text-cream/60">{figure.title}</figcaption>
            <Diagram data={figure.data} side={side} />
          </figure>
          <div className="space-y-6">
            {notes.length > 0 && <FigureNotes notes={notes} side={side} />}
            {others.map((d, i) => (
              <figure key={i} className="max-w-[300px] border-t border-cream/15 pt-4">
                <figcaption className="eyebrow mb-2 text-cream/60">{d.title}</figcaption>
                <Diagram data={d.data} side={side} />
                {d.caption && <p className="mt-2 text-sm text-cream/70">{sideText(d.caption, side)}</p>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {phases.length > 0 && (
        <section className="glass p-6">
          <h2 className="eyebrow mb-4 text-cream/60">Key positions</h2>
          <PhaseStrip phases={phases} side={side} size="lg" />
        </section>
      )}

      {!figure && others.length > 0 && (
        <section className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(210px,1fr))]">
          {others.map((d, i) => (
            <figure key={i} className="glass p-4">
              <figcaption className="eyebrow mb-2 text-cream/60">{d.title}</figcaption>
              <Diagram data={d.data} side={side} />
              {d.caption && <p className="mt-2 text-sm text-cream/70">{sideText(d.caption, side)}</p>}
            </figure>
          ))}
        </section>
      )}

      {kind === "movement" && howTo.length > 0 && (
        <section className="glass p-6">
          <h2 className="font-serif text-3xl">How to do it</h2>
          <dl className="mt-4 divide-y divide-cream/12">
            {howTo.map(([label, text]) => (
              <div key={label} className="grid gap-1 py-3 sm:grid-cols-[160px_1fr] sm:gap-6">
                <dt className="font-medium text-cream/90">{label}</dt>
                <dd className="leading-relaxed text-cream/80">{sideText(text, side)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
