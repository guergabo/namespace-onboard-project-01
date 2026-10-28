"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Goal, Level } from "@/db/schema";
import {
  GOAL_LABELS,
  MINUTES,
  candidates,
  choicesQuery,
  splitSeconds,
  type CatalogStep,
  type Choices,
  type SectionKey,
} from "@/lib/class-builder";

const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];
const SECTION_COLORS: Record<SectionKey, string> = {
  barre: "bg-cream/75",
  adagio: "bg-blush/80",
  turns: "bg-sage-200/80",
  allegro: "bg-gold/85",
};
const SECTION_NAMES: Record<SectionKey, string> = { barre: "Barre", adagio: "Centre", turns: "Turns", allegro: "Allegro" };

function Pill({ on, disabled, onClick, children }: { on: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-[15px] transition disabled:opacity-40 ${
        on ? "border-cream bg-cream text-sage-900" : "border-cream/30 text-cream/85 hover:bg-cream/10"
      }`}
    >
      {children}
    </button>
  );
}

function Switch({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex items-center gap-2.5 text-[15px] text-cream/85">
      <span className={`relative h-5 w-9 rounded-full transition ${on ? "bg-cream" : "bg-cream/20"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${on ? "left-[18px] bg-sage-700" : "left-0.5 bg-cream/70"}`} />
      </span>
      {label}
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-3 border-t border-cream/12 py-4 first:border-t-0 sm:grid-cols-[150px_1fr] sm:items-center">
      <legend className="contents">
        <span className="eyebrow text-cream/60">{label}</span>
      </legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

/** The class choices, with a live preview of how the minutes split across the sections. */
export function ClassForm({ catalog, initial }: { catalog: CatalogStep[]; initial: Choices | null }) {
  const router = useRouter();
  const [choices, setChoices] = useState<Choices>(
    initial ?? { level: "beginner", goals: ["full-class"], minutes: 30, barre: true, travel: false, jumps: true, seed: 1, skip: [] },
  );
  const set = (patch: Partial<Choices>) => setChoices((c) => ({ ...c, ...patch }));

  const toggleGoal = (g: Goal) => {
    if (g === "full-class") return set({ goals: ["full-class"] });
    const others = choices.goals.filter((x) => x !== "full-class");
    const goals = others.includes(g) ? others.filter((x) => x !== g) : [...others, g];
    set({ goals: goals.length ? goals : ["full-class"] });
  };
  const goalsFull = choices.goals.filter((g) => g !== "full-class").length >= 3;

  const pool = candidates(catalog, { ...choices, skip: [] });
  const split = splitSeconds(choices, { barre: pool.barre.length > 0, adagio: pool.adagio.length > 0, turns: pool.turns.length > 0, allegro: pool.allegro.length > 0 });
  const parts = (Object.keys(split) as SectionKey[]).filter((k) => split[k] > 0);

  return (
    <form
      className="glass p-6"
      onSubmit={(e) => {
        e.preventDefault();
        // A fresh seed each time, so building again gives a different mix.
        const seed = Math.floor(Math.random() * 1_000_000) + 1;
        router.push(`/class?${choicesQuery({ ...choices, seed, skip: [] })}#your-class`);
      }}
    >
      <Row label="Level">
        {LEVELS.map((l) => (
          <Pill key={l} on={choices.level === l} onClick={() => set({ level: l })}>
            <span className="capitalize">{l}</span>
          </Pill>
        ))}
      </Row>
      <Row label="Goals (up to 3)">
        {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => {
          const on = choices.goals.includes(g);
          return (
            <Pill key={g} on={on} disabled={!on && g !== "full-class" && goalsFull} onClick={() => toggleGoal(g)}>
              {GOAL_LABELS[g]}
            </Pill>
          );
        })}
      </Row>
      <Row label="Time">
        {MINUTES.map((m) => (
          <Pill key={m} on={choices.minutes === m} onClick={() => set({ minutes: m })}>
            {m} min
          </Pill>
        ))}
      </Row>
      <Row label="Space">
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <Switch on={choices.barre} onChange={(barre) => set({ barre })} label="Barre or chair" />
          <Switch on={choices.travel} onChange={(travel) => set({ travel })} label="Room to travel" />
          <Switch on={choices.jumps} onChange={(jumps) => set({ jumps })} label="Jumps today" />
        </div>
      </Row>

      <div className="border-t border-cream/12 pt-5">
        <p className="eyebrow text-cream/60">How the {choices.minutes} minutes split</p>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full">
          {parts.map((k) => (
            <div key={k} className={SECTION_COLORS[k]} style={{ width: `${(split[k] / (choices.minutes * 60)) * 100}%` }} />
          ))}
        </div>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-cream/75">
          {parts.map((k) => (
            <li key={k} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${SECTION_COLORS[k]}`} />
              {SECTION_NAMES[k]} {Math.round(split[k] / 60)}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex justify-center">
        <button type="submit" className="rounded-full bg-cream px-8 py-3.5 font-serif text-xl text-sage-900 shadow-[0_10px_40px_rgb(47_45_27/0.35)] transition hover:bg-glow">
          Build my class →
        </button>
      </div>
    </form>
  );
}
