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
  phases: [],
  sided: !["demi-plie", "changement-de-pieds", "temps-leve", "chaines"].includes(slug),
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
  alts: {},
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

test("the same choices give the same class, and a swap changes only its own row", () => {
  // A short class, so each section picks from more steps than it has room for.
  const base = choices({ minutes: 15, seed: 11 });
  for (let seed = 1; seed <= 20; seed++) assert.deepEqual(slugs({ ...base, seed }), slugs({ ...base, seed }), `seed ${seed}`);
  let tried = 0;
  for (const c of [base, choices({ minutes: 30, seed: 4 }), choices({ minutes: 60, goals: ["turns"], seed: 2 })]) {
    const rows = (alts: Choices["alts"]) =>
      buildClass(catalog, { ...c, alts }).flatMap((s) => s.items.map((i) => ({ origin: i.origin, step: i.step.slug, options: i.options })));
    const before = rows({});
    for (const [i, row] of before.entries()) {
      for (let n = 1; n < row.options; n++, tried++) {
        const after = rows({ [row.origin]: n });
        assert.equal(after.length, before.length);
        assert.notEqual(after[i].step, row.step, `${row.origin} at ${n}`);
        // Every other row keeps its step, its place and its alternatives.
        assert.deepEqual([...after.slice(0, i), ...after.slice(i + 1)], [...before.slice(0, i), ...before.slice(i + 1)], `${row.origin} at ${n}`);
      }
    }
  }
  assert.ok(tried >= 5, `only ${tried} swaps tried`);
});

test("whatever is swapped, the barre keeps Vaganova's order, jumps go small to big, and no step repeats", () => {
  const base = choices({ minutes: 60, seed: 7 });
  const origins = buildClass(catalog, base).flatMap((s) => s.items.map((i) => i.origin));
  const barreOrder = ["demi-plie", "grand-plie", "battement-tendu", "battement-tendu-jete", "rond-de-jambe-par-terre", "battement-fondu", "battement-frappe", "rond-de-jambe-en-lair", "petit-battement", "battement-developpe", "grand-battement-jete"];
  for (let n = 0; n < 12; n++) {
    const sections = buildClass(catalog, { ...base, alts: Object.fromEntries(origins.map((o, i) => [o, n + i])) });
    const all = sections.flatMap((s) => s.items.map((i) => i.step.slug));
    assert.equal(new Set(all).size, all.length, `repeat at ${n}: ${all}`);
    const barre = sections.find((s) => s.key === "barre")!.items.map((i) => barreOrder.indexOf(i.step.slug));
    assert.deepEqual(barre, [...barre].sort((x, y) => x - y), `barre at ${n}`);
    const sizes = sections.find((s) => s.key === "allegro")!.items.map((i) => ({ petit: 0, medium: 1, grand: 2 })[i.step.jumpSize!]);
    assert.deepEqual(sizes, [...sizes].sort(), `allegro at ${n}`);
  }
});

test("‹ and › wrap round a row's alternatives, and two swapped rows never show the same step", () => {
  const base = choices({ minutes: 15 });
  const row = (alts: Choices["alts"]) => section({ ...base, alts }, "adagio")!.items[0];
  const { origin, options } = row({});
  // The intermediate centre has three steps for its one row.
  assert.equal(options, 3);
  const cycle = [0, 1, 2].map((n) => row({ [origin]: n }).step.slug);
  assert.deepEqual([...cycle].sort(), ["attitude-croisee", "croise-devant", "first-arabesque"]);
  assert.equal(row({ [origin]: 3 }).step.slug, cycle[0]);
  assert.equal(row({ [origin]: -1 }).step.slug, cycle[2]);

  const allegro = section(base, "allegro")!.items;
  assert.ok(allegro.length >= 2);
  for (let n = 1; n <= 4; n++) {
    const both = section({ ...base, alts: Object.fromEntries(allegro.map((i) => [i.origin, n])) }, "allegro")!.items.map((i) => i.step.slug);
    assert.equal(new Set(both).size, allegro.length, `both rows at ${n}: ${both}`);
  }
});

test("a row with no alternatives has nothing to swap", () => {
  assert.deepEqual(section(choices({ level: "beginner" }), "turns")!.items.map((i) => i.options), [1]);
});

test("only steps with a working leg are done on each side, and turns in both directions", () => {
  const barre = section(choices({ seed: 3 }), "barre")!.items;
  const counts = Object.fromEntries(barre.map((i) => [i.step.slug, i.prescription]));
  assert.ok(!counts["demi-plie"].includes("side"), counts["demi-plie"]);
  assert.ok(counts["battement-tendu"].endsWith(" · each side"), counts["battement-tendu"]);
  // Turns go both ways, even those without a working leg.
  const chaines = section(choices({ minutes: 60, goals: ["turns"] }), "turns")!.items.find((i) => i.step.slug === "chaines")!;
  assert.ok(chaines.prescription.endsWith(" · right, then left"), chaines.prescription);
  assert.equal(chaines.sided, true);
});

test("counts suit the step and the level", () => {
  const counts = (level: Level, slug: string) =>
    buildClass(catalog, choices({ level, minutes: 60, goals: ["turns", "feet"] }))
      .flatMap((s) => s.items)
      .find((i) => i.step.slug === slug)?.prescription;
  // Barre exercises speed up with level; beginners learn pliés without 4th position.
  assert.match(counts("beginner", "battement-tendu")!, /every 4 counts/);
  assert.match(counts("advanced", "battement-tendu")!, /every count/);
  assert.doesNotMatch(counts("beginner", "demi-plie")!, /4th/);
  // Chaînés are never doubles, whatever the level.
  assert.doesNotMatch(counts("advanced", "chaines")!, /double/);
  assert.match(counts("advanced", "pirouette")!, /Double/);
});

test("a goal gives its section more time", () => {
  const turns = (goals: Goal[]) => section(choices({ goals }), "turns")!.seconds;
  assert.ok(turns(["turns"]) > turns(["full-class"]));
});

test("choices survive a round trip through the URL", () => {
  const c = choices({ goals: ["turns", "feet"], travel: false, seed: 42, alts: { pirouette: 2, "croise-devant": -1 } });
  assert.deepEqual(parseChoices(Object.fromEntries(new URLSearchParams(choicesQuery(c)))), c);
  assert.equal(parseChoices({ level: "beginner", min: "20" }), null);
});
