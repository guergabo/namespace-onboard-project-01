import assert from "node:assert/strict";
import { test } from "node:test";
import type { Goal, Level } from "@/db/schema";
import { buildClass, choicesQuery, parseChoices, type CatalogStep, type Choices } from "./class-builder";

const step = (slug: string, category: string, level: Level, goals: Goal[], jumpSize: CatalogStep["jumpSize"] = null): CatalogStep => ({
  slug,
  name: slug,
  level,
  goals,
  category,
  jumpSize,
  pose: null,
  sided: !["demi-plie", "changement-de-pieds", "temps-leve"].includes(slug),
});

// Listed out of lesson order on purpose, so ordering comes from the builder.
const catalog: CatalogStep[] = [
  step("grand-battement-jete", "battements", "intermediate", ["flexibility"]),
  step("battement-tendu", "battements", "beginner", ["feet"]),
  step("rond-de-jambe-par-terre", "rotary", "beginner", ["turnout"]),
  step("demi-plie", "battements", "beginner", ["full-class"]),
  step("battement-frappe", "battements", "beginner", ["feet"]),
  step("battement-fondu", "battements", "intermediate", ["extensions"]),
  step("croise-devant", "croise-efface", "beginner", ["full-class"]),
  step("first-arabesque", "poses", "beginner", ["balance"]),
  step("attitude-croisee", "poses", "intermediate", ["balance"]),
  step("pirouette", "turns", "intermediate", ["turns"]),
  step("chaines", "turns", "intermediate", ["turns"]),
  step("soutenu-en-tournant", "turns", "beginner", ["turns"]),
  step("fouette-en-tournant", "other-turns", "advanced", ["turns", "stamina"]),
  step("grand-jete", "jumps-two-to-one", "intermediate", ["jumps"], "grand"),
  step("sissonne-ouverte", "jumps-two-to-one", "beginner", ["jumps"], "medium"),
  step("changement-de-pieds", "jumps-two-to-two", "beginner", ["jumps"], "petit"),
  step("temps-leve", "jumps", "beginner", ["jumps"], "petit"),
];

const choices = (overrides: Partial<Choices> = {}): Choices => ({
  level: "intermediate",
  goals: ["full-class"],
  minutes: 45,
  barre: true,
  travel: true,
  jumps: true,
  seed: 1,
  skip: [],
  ...overrides,
});

const slugs = (c: Choices) => buildClass(catalog, c).flatMap((s) => s.items.map((i) => i.step.slug));
const section = (c: Choices, key: string) => buildClass(catalog, c).find((s) => s.key === key);

test("every length adds up exactly, per section and per item", () => {
  for (const minutes of [15, 30, 45, 60] as const) {
    for (const goals of [["full-class"], ["turns", "jumps", "balance"]] as Goal[][]) {
      const sections = buildClass(catalog, choices({ minutes, goals }));
      assert.equal(sections.reduce((sum, s) => sum + s.seconds, 0), minutes * 60);
      for (const s of sections) assert.equal(s.items.reduce((sum, i) => sum + i.seconds, 0), s.seconds, `${minutes} min ${s.key}`);
    }
  }
});

test("a class follows the lesson: barre in Vaganova's order, then centre, turns, and allegro from small to big jumps", () => {
  const sections = buildClass(catalog, choices({ minutes: 60, seed: 3 }));
  assert.deepEqual(sections.map((s) => s.key), ["barre", "adagio", "turns", "allegro"]);
  const barre = sections[0].items.map((i) => i.step.slug);
  assert.deepEqual(barre.slice(0, 2), ["demi-plie", "battement-tendu"]);
  const order = ["demi-plie", "battement-tendu", "rond-de-jambe-par-terre", "battement-fondu", "battement-frappe", "grand-battement-jete"];
  assert.deepEqual(barre, order.filter((s) => barre.includes(s)));
  const sizes = sections[3].items.map((i) => ({ petit: 0, medium: 1, grand: 2 })[i.step.jumpSize!]);
  assert.deepEqual(sizes, [...sizes].sort());
});

test("steps above the chosen level never appear", () => {
  const beginner = slugs(choices({ level: "beginner", minutes: 60 }));
  const byLevel = Object.fromEntries(catalog.map((s) => [s.slug, s.level]));
  assert.deepEqual(beginner.filter((s) => byLevel[s] !== "beginner"), []);
  assert.ok(slugs(choices({ level: "advanced", minutes: 60, goals: ["turns", "stamina"] })).includes("fouette-en-tournant"));
});

test("space switches: no jumps drops allegro, no room drops travelling steps, no barre renames it", () => {
  assert.equal(section(choices({ jumps: false }), "allegro"), undefined);
  const noRoom = slugs(choices({ travel: false, minutes: 60, goals: ["turns", "jumps"] }));
  assert.ok(!noRoom.includes("chaines") && !noRoom.includes("grand-jete"));
  assert.equal(section(choices({ barre: false }), "barre")?.title, "Barre exercises in the centre");
});

test("the same choices give the same class, and a swap changes only that step's section", () => {
  // A short class, so each section picks from more steps than it has room for.
  const base = choices({ minutes: 15, seed: 11 });
  for (let seed = 1; seed <= 20; seed++) assert.deepEqual(slugs({ ...base, seed }), slugs({ ...base, seed }), `seed ${seed}`);
  const before = buildClass(catalog, base);
  const swapped = before.find((s) => s.key === "adagio")!.items[0].step.slug;
  const after = buildClass(catalog, { ...base, skip: [swapped] });
  for (const s of before) {
    const other = after.find((a) => a.key === s.key)!.items.map((i) => i.step.slug);
    if (s.key === "adagio") assert.ok(!other.includes(swapped));
    else assert.deepEqual(other, s.items.map((i) => i.step.slug), s.key);
  }
});

test("swapping the same row again and again cycles through the alternatives without shrinking the class", () => {
  // Swaps the first centre step as the page does: the URL keeps only the swaps still in effect.
  let c = choices({ minutes: 15 });
  const original = buildClass(catalog, c);
  const sizes = original.map((s) => s.items.length);
  const seen = new Set<string>();
  for (let click = 0; click < 10; click++) {
    const sections = buildClass(catalog, c);
    assert.deepEqual(sections.map((s) => s.items.length), sizes, `click ${click}`);
    const first = sections.find((s) => s.key === "adagio")!.items[0].step.slug;
    seen.add(first);
    c = { ...c, skip: [...sections.flatMap((s) => s.skipped), first] };
  }
  // The intermediate centre has three steps for its one row, so every one comes round, and the
  // URL never holds more swaps than the section has steps.
  assert.deepEqual([...seen].sort(), ["attitude-croisee", "croise-devant", "first-arabesque"]);
  assert.ok(c.skip.length <= 3, `URL keeps ${c.skip.length} swaps`);
});

test("a section with no alternatives offers no swap", () => {
  const turns = section(choices({ level: "beginner" }), "turns")!;
  assert.equal(turns.swappable, false);
  assert.equal(section(choices({ minutes: 15 }), "adagio")!.swappable, true);
});

test("only steps with a working leg are done on each side", () => {
  const barre = section(choices({ seed: 3 }), "barre")!.items;
  const counts = Object.fromEntries(barre.map((i) => [i.step.slug, i.prescription]));
  assert.equal(counts["demi-plie"], "2 × 8 counts");
  assert.equal(counts["battement-tendu"], "2 × 8 counts · each side");
});

test("a goal gives its section more time", () => {
  const turns = (goals: Goal[]) => section(choices({ goals }), "turns")!.seconds;
  assert.ok(turns(["turns"]) > turns(["full-class"]));
});

test("choices survive a round trip through the URL", () => {
  const c = choices({ goals: ["turns", "feet"], travel: false, seed: 42, skip: ["pirouette"] });
  assert.deepEqual(parseChoices(Object.fromEntries(new URLSearchParams(choicesQuery(c)))), c);
  assert.equal(parseChoices({ level: "beginner", min: "20" }), null);
});
