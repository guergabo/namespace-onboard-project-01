import type { Goal, Level } from "@/db/schema";
import type { Pose } from "./pose";

/**
 * Assembles a class from glossary steps. Pure: the same choices and catalog always give the
 * same class, so a class can live in its URL.
 *
 * A class follows the order of a Vaganova lesson: exercises at the barre (or in the centre
 * without one), then poses and adagio, turns, and allegro from small jumps to big ones.
 */

export type CatalogStep = {
  slug: string;
  name: string;
  level: Level;
  goals: Goal[];
  /** Slug of the step's category, which is a chapter or one of its sections. */
  category: string;
  jumpSize: "petit" | "medium" | "grand" | null;
  /** A line figure to show next to the step, if the glossary has one. */
  pose: Pose | null;
  /** The step's phases in order, for showing the movement; empty when the glossary has none. */
  phases: Pose[];
  /** Whether the step has a working leg, so it is done on each side. Demi-plié, for one, isn't. */
  sided: boolean;
};

export const MINUTES = [15, 30, 45, 60] as const;

export type Choices = {
  level: Level;
  /** Up to three goals; "full-class" stands alone. */
  goals: Goal[];
  minutes: (typeof MINUTES)[number];
  /** A barre or a chair to hold. Without one, the barre exercises are done in the centre. */
  barre: boolean;
  /** Room to travel across the floor. */
  travel: boolean;
  jumps: boolean;
  /** Varies which steps are picked; the barre order never changes. */
  seed: number;
  /**
   * Swaps, by the slug of the step a row started with: how far along that row's alternatives the
   * dancer has moved. Any whole number works; it wraps round, so ‹ and › cycle.
   */
  alts: Record<string, number>;
};

export type SectionKey = "barre" | "adagio" | "turns" | "allegro";

export type ClassItem = {
  step: CatalogStep;
  /** The step this row started with, which keys its swaps. */
  origin: string;
  /** Which of the row's alternatives is showing, and how many there are (the first is the origin). */
  choice: number;
  options: number;
  prescription: string;
  seconds: number;
  /** Done on the right, then the left: steps with a working leg, and every turn (its direction). */
  sided: boolean;
};
export type ClassSection = { key: SectionKey; title: string; seconds: number; items: ClassItem[] };

export const SECTION_NAMES: Record<SectionKey, string> = { barre: "Barre", adagio: "Centre", turns: "Turns", allegro: "Allegro" };
/** Seconds as m:ss. */
export const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

/** Tailwind classes for each section's colour in the timelines. */
export const SECTION_COLORS: Record<SectionKey, string> = {
  barre: "bg-cream/75",
  adagio: "bg-blush/80",
  turns: "bg-sage-200/80",
  allegro: "bg-gold/85",
};

/** Vaganova's order of exercises at the barre (chapters I–III). */
const BARRE_ORDER = [
  "demi-plie",
  "grand-plie",
  "battement-tendu",
  "battement-tendu-jete",
  "rond-de-jambe-par-terre",
  "battement-fondu",
  "battement-frappe",
  "rond-de-jambe-en-lair",
  "petit-battement",
  "battement-developpe",
  "grand-battement-jete",
];
/** The barre always starts with these, so the body is warm before anything else. */
const WARM_UP = ["demi-plie", "battement-tendu"];

const ADAGIO_CATEGORIES = ["croise-efface", "poses"];
const TURN_CATEGORIES = ["turns", "other-turns"];
const ALLEGRO_CATEGORIES = ["jumps", "jumps-ground", "jumps-two-to-two", "jumps-two-to-one", "jumps-one-to-other", "beats"];
/** Steps that travel across the floor. */
const TRAVELLING = ["chaines", "chasse", "grand-jete", "jete-entrelace"];

const SECTION_GOALS: Record<SectionKey, Goal[]> = {
  barre: ["feet", "turnout", "flexibility"],
  adagio: ["extensions", "balance"],
  turns: ["turns"],
  allegro: ["jumps", "petit-allegro", "stamina"],
};
const BASE_WEIGHT: Record<SectionKey, number> = { barre: 0.45, adagio: 0.15, turns: 0.15, allegro: 0.25 };
/** Rough length of one item, used to decide how many items fit in a section. */
const ITEM_SECONDS: Record<SectionKey, number> = { barre: 150, adagio: 90, turns: 120, allegro: 120 };
const JUMP_ORDER = { petit: 0, medium: 1, grand: 2 } as const;

// Typed records rather than the schema's lists, so the builder form can use this module without
// pulling the database schema into the browser bundle.
const LEVEL_RANK: Record<Level, number> = { beginner: 0, intermediate: 1, advanced: 2 };
const rank = (level: Level) => LEVEL_RANK[level];

export const GOAL_LABELS: Record<Goal, string> = {
  "full-class": "Full class",
  jumps: "Jumps",
  turns: "Turns",
  extensions: "Extensions",
  feet: "Feet & ankles",
  balance: "Balance",
  flexibility: "Flexibility",
  turnout: "Turnout",
  "petit-allegro": "Petit allegro",
  stamina: "Stamina",
};

/** The steps each section can use for these choices, in the order they would be danced. */
export function candidates(catalog: CatalogStep[], choices: Choices): Record<SectionKey, CatalogStep[]> {
  const usable = catalog.filter(
    (s) => rank(s.level) <= rank(choices.level) && (choices.travel || !TRAVELLING.includes(s.slug)),
  );
  const inCategories = (cats: string[]) => usable.filter((s) => cats.includes(s.category));
  return {
    barre: BARRE_ORDER.flatMap((slug) => usable.filter((s) => s.slug === slug)),
    adagio: inCategories(ADAGIO_CATEGORIES),
    turns: inCategories(TURN_CATEGORIES),
    allegro: choices.jumps ? inCategories(ALLEGRO_CATEGORIES) : [],
  };
}

/** How the class's seconds are shared between the sections that have steps. Sections matching a goal get more. */
export function splitSeconds(choices: Choices, available: Record<SectionKey, boolean>): Record<SectionKey, number> {
  const keys = (Object.keys(BASE_WEIGHT) as SectionKey[]).filter((k) => available[k]);
  const weight = (k: SectionKey) => BASE_WEIGHT[k] + 0.3 * choices.goals.filter((g) => SECTION_GOALS[k].includes(g)).length;
  const total = keys.reduce((sum, k) => sum + weight(k), 0);
  const seconds = { barre: 0, adagio: 0, turns: 0, allegro: 0 };
  // Whole minutes per section; the barre absorbs rounding so the class adds up exactly.
  for (const k of keys) seconds[k] = Math.round((choices.minutes * weight(k)) / total) * 60;
  if (keys.length) seconds[keys[0]] += choices.minutes * 60 - keys.reduce((sum, k) => sum + seconds[k], 0);
  return seconds;
}

/**
 * A stable pseudo-random number in [0, 1) for a step and seed (FNV-1a hash), so swapping one
 * step out never reshuffles the rest of the class.
 */
function score(seed: number, slug: string) {
  let h = 2166136261 ^ seed;
  for (let i = 0; i < slug.length; i++) h = Math.imul(h ^ slug.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
}

/** Steps serving more of the goals first, then a shuffle that depends on the seed. */
function preference(choices: Choices) {
  const goalScore = (s: CatalogStep) => s.goals.filter((g) => choices.goals.includes(g)).length;
  return (a: CatalogStep, b: CatalogStep) => goalScore(b) - goalScore(a) || score(choices.seed, a.slug) - score(choices.seed, b.slug);
}

/** Puts a section's steps in the order they are danced. */
function inLessonOrder(key: SectionKey, pool: CatalogStep[], chosen: CatalogStep[]) {
  // Glossary order (Vaganova's order at the barre), and allegro from small jumps to big ones.
  const ordered = pool.filter((s) => chosen.includes(s));
  return key === "allegro" ? ordered.sort((a, b) => JUMP_ORDER[a.jumpSize ?? "petit"] - JUMP_ORDER[b.jumpSize ?? "petit"]) : ordered;
}

function pick(key: SectionKey, steps: CatalogStep[], count: number, choices: Choices): CatalogStep[] {
  const preferred = preference(choices);
  if (key === "barre") {
    // Keep the warm-up, then the exercises that serve the goals, in barre order.
    const keep = new Set(steps.filter((s) => WARM_UP.includes(s.slug)).map((s) => s.slug));
    for (const s of steps.filter((s) => !keep.has(s.slug)).sort(preferred)) if (keep.size < count) keep.add(s.slug);
    return steps.filter((s) => keep.has(s.slug));
  }
  return inLessonOrder(key, steps, [...steps].sort(preferred).slice(0, count));
}

/** Counts per section and level; sided steps outside allegro are then done on each side. */
const PRESCRIPTIONS: Record<SectionKey, Record<Level, string>> = {
  barre: {
    beginner: "2 × 8 counts, slowly",
    intermediate: "2 × 8 counts",
    advanced: "4 × 8 counts, brisk",
  },
  adagio: {
    beginner: "Hold 8 counts",
    intermediate: "Develop and hold 4 counts",
    advanced: "Develop, hold, promenade",
  },
  turns: {
    beginner: "4 times",
    intermediate: "4 singles",
    advanced: "4 doubles",
  },
  allegro: {
    beginner: "8 times, slowly",
    intermediate: "16 times",
    advanced: "2 × 16, quick",
  },
};

const TITLES: Record<SectionKey, string> = {
  barre: "Barre",
  adagio: "Centre · poses and adagio",
  turns: "Turns",
  allegro: "Allegro",
};

/** Reads choices from the URL's query; null when no class has been asked for yet. */
export function parseChoices(query: Record<string, string | string[] | undefined>): Choices | null {
  const get = (k: string) => (Array.isArray(query[k]) ? query[k][0] : query[k]);
  const level = get("level") as Level;
  const minutes = Number(get("min")) as Choices["minutes"];
  if (!(level in LEVEL_RANK) || !MINUTES.includes(minutes)) return null;
  const goals = (get("goals") ?? "").split(",").filter((g): g is Goal => g in GOAL_LABELS);
  return {
    level,
    minutes,
    goals: goals.includes("full-class") || goals.length === 0 ? ["full-class"] : goals.slice(0, 3),
    barre: get("barre") !== "0",
    travel: get("travel") === "1",
    jumps: get("jumps") !== "0",
    seed: Number(get("seed")) || 1,
    alts: Object.fromEntries(
      (get("alt") ?? "")
        .split(",")
        .map((pair) => pair.split("."))
        .filter(([slug, n]) => slug && Number.isInteger(Number(n)) && Number(n) !== 0)
        .map(([slug, n]) => [slug, Number(n)]),
    ),
  };
}

export function choicesQuery(c: Choices): string {
  const q = new URLSearchParams({
    level: c.level,
    goals: c.goals.join(","),
    min: String(c.minutes),
    barre: c.barre ? "1" : "0",
    travel: c.travel ? "1" : "0",
    jumps: c.jumps ? "1" : "0",
    seed: String(c.seed),
  });
  const alts = Object.entries(c.alts).filter(([, n]) => n !== 0);
  if (alts.length) q.set("alt", alts.map(([slug, n]) => `${slug}.${n}`).join(","));
  return q.toString();
}

export function buildClass(catalog: CatalogStep[], choices: Choices): ClassSection[] {
  const pool = candidates(catalog, choices);
  const available = { barre: pool.barre.length > 0, adagio: pool.adagio.length > 0, turns: pool.turns.length > 0, allegro: pool.allegro.length > 0 };
  const split = splitSeconds(choices, available);
  return (Object.keys(split) as SectionKey[])
    .filter((key) => split[key] > 0)
    .map((key) => {
      const count = Math.max(1, Math.min(pool[key].length, Math.round(split[key] / ITEM_SECONDS[key])));
      const picked = pick(key, pool[key], count, choices);
      // Each row can cycle through the section's unpicked steps, best first. A step one row has
      // swapped in is no longer offered to the rows after it, so a class never repeats a step.
      const spare = pool[key].filter((s) => !picked.includes(s)).sort(preference(choices));
      const taken = new Set<string>();
      const rows = picked.map((origin) => {
        const options = [origin, ...spare.filter((s) => !taken.has(s.slug))];
        const choice = (((choices.alts[origin.slug] ?? 0) % options.length) + options.length) % options.length;
        taken.add(options[choice].slug);
        return { origin: origin.slug, step: options[choice], choice, options: options.length };
      });
      // A swapped-in step takes its own place in the lesson.
      const order = inLessonOrder(key, pool[key], rows.map((r) => r.step));
      rows.sort((a, b) => order.indexOf(a.step) - order.indexOf(b.step));
      // Share the section's seconds in 30-second slices; the first item takes what is left over.
      const each = Math.floor(split[key] / rows.length / 30) * 30;
      const items = rows.map((row) => {
        const sided = key === "turns" || (row.step.sided && key !== "allegro");
        const sides = key === "turns" ? " · right, then left" : sided ? " · each side" : "";
        return { ...row, prescription: PRESCRIPTIONS[key][choices.level] + sides, seconds: each, sided };
      });
      items[0].seconds += split[key] - each * rows.length;
      return {
        key,
        title: key === "barre" && !choices.barre ? "Barre exercises in the centre" : TITLES[key],
        seconds: split[key],
        items,
      };
    });
}
