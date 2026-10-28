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

type ByLevel = Record<Level, string>;
const levels = (beginner: string, intermediate: string, advanced: string): ByLevel => ({ beginner, intermediate, advanced });

/** How fast barre exercises go: slowly while they are learned, quicker as they become secure. */
const BARRE_TEMPO = levels("one every 4 counts", "one every 2 counts", "one every count");
const POSITIONS = levels("in 1st, 2nd and 5th", "in 1st, 2nd, 4th and 5th", "in 1st, 2nd, 4th and 5th");

/**
 * What to do for each step, by level. Counts follow common Vaganova practice but vary between
 * teachers; they are suggestions, and the timer decides how many times through.
 */
const STEP_COUNTS: Record<string, ByLevel> = {
  "demi-plie": levels(`2 ${POSITIONS.beginner} · 4 counts down, 4 up`, `2 ${POSITIONS.intermediate} · 4 counts down, 4 up`, `2 ${POSITIONS.advanced}, with port de bras`),
  "grand-plie": levels(`1 ${POSITIONS.beginner} · 8 counts`, `1 ${POSITIONS.intermediate} · 8 counts`, `1 ${POSITIONS.advanced}, with port de bras`),
  "battement-tendu": en("En croix"),
  "battement-tendu-jete": en("En croix"),
  "rond-de-jambe-par-terre": en("En dehors, then en dedans"),
  // Fondu and développé stay slow and smooth at every level.
  "battement-fondu": levels("En croix · one every 4 counts", "En croix · one every 2 counts", "En croix · one every 2 counts"),
  "battement-frappe": en("En croix"),
  "rond-de-jambe-en-lair": en("En dehors, then en dedans"),
  "petit-battement": levels("Even beats, one every 2 counts", "Even beats, one every count", "Two beats every count, with accents"),
  "battement-developpe": levels("En croix · one every 8 counts", "En croix · one every 4 counts", "En croix · one every 4 counts, holding at the height"),
  "grand-battement-jete": en("En croix"),
  "soutenu-en-tournant": levels("Half turns, then full turns", "4 full turns in a row", "8 full turns in a row, quick"),
  pirouette: levels("Single turns from 5th", "Single turns from 5th and 4th", "Double turns, en dehors and en dedans"),
  chaines: levels("8 turns in a line", "8 turns in a line", "16 turns, finishing in a pose"),
  "fouette-en-tournant": levels("8 in a row", "8 in a row", "16 in a row"),
};
function en(pattern: string): ByLevel {
  return levels(`${pattern} · ${BARRE_TEMPO.beginner}`, `${pattern} · ${BARRE_TEMPO.intermediate}`, `${pattern} · ${BARRE_TEMPO.advanced}`);
}

/** For steps without their own counts. */
const SECTION_COUNTS: Record<SectionKey, ByLevel> = {
  barre: BARRE_TEMPO,
  adagio: levels("Hold 8 counts", "Développé into the pose, hold 4 counts", "Développé, hold, then promenade"),
  turns: levels("4 times", "4 singles", "4 doubles"),
  allegro: levels("8 times, with a pause after each", "16 times without stopping", "2 × 16, quick"),
};
/** Big jumps take more out of the dancer, so fewer of them. */
const GRAND_ALLEGRO = levels("4 times", "8 times", "8 times, at full height");

function counts(key: SectionKey, step: CatalogStep, level: Level) {
  if (STEP_COUNTS[step.slug]) return STEP_COUNTS[step.slug][level];
  if (key === "allegro" && step.jumpSize === "grand") return GRAND_ALLEGRO[level];
  return SECTION_COUNTS[key][level];
}

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
      // Each row has its own alternatives: the unpicked steps that fall between it and its
      // neighbours in the lesson, best first. A step between two rows goes to the nearer one, or to
      // the other if the nearer one is fixed (the barre's warm-up keeps its steps). So swapping
      // never moves or changes another row, and the lesson order holds whatever is swapped.
      const lesson = inLessonOrder(key, pool[key], pool[key]);
      const at = picked.map((s) => lesson.indexOf(s));
      const fixed = picked.map((s) => key === "barre" && WARM_UP.includes(s.slug));
      const alternatives = picked.map((): CatalogStep[] => []);
      for (const step of pool[key].filter((s) => !picked.includes(s)).sort(preference(choices))) {
        const r = lesson.indexOf(step);
        const after = at.findIndex((x) => x > r); // the row just after it, if any
        const below = after === -1 ? at.length - 1 : after - 1;
        const candidates = [below, after].filter((i) => i >= 0 && !fixed[i]);
        if (!candidates.length) continue;
        const row = candidates.reduce((best, i) => (Math.abs(r - at[i]) < Math.abs(r - at[best]) ? i : best));
        alternatives[row].push(step);
      }
      const rows = picked.map((origin, i) => {
        const options = [origin, ...alternatives[i]];
        const choice = (((choices.alts[origin.slug] ?? 0) % options.length) + options.length) % options.length;
        return { origin: origin.slug, step: options[choice], choice, options: options.length };
      });
      // Share the section's seconds in 30-second slices; the first item takes what is left over.
      const each = Math.floor(split[key] / rows.length / 30) * 30;
      const items = rows.map((row) => {
        const sided = key === "turns" || (row.step.sided && key !== "allegro");
        const sides = key === "turns" ? " · right, then left" : sided ? " · each side" : "";
        return { ...row, prescription: counts(key, row.step, choices.level) + sides, seconds: each, sided };
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
