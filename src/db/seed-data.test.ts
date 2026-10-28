import assert from "node:assert/strict";
import { test } from "node:test";
import { sideText } from "../lib/pose";
import { seedSteps } from "./seed-data";

// Seeding already rejects unknown categories, terms and relationship endpoints, and CI seeds a
// fresh database; these cover what the database cannot.

test("slugs are unique across steps and variants, so relationships are unambiguous", () => {
  const slugs = seedSteps.flatMap((s) => [s.slug, ...(s.variants ?? []).map((v) => v.slug)]);
  const duplicates = slugs.filter((slug, i) => slugs.indexOf(slug) !== i);
  assert.deepEqual(duplicates, []);
});

test("every side token in the glossary text is one the page can replace", () => {
  const strings: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === "string") strings.push(value);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk(seedSteps);
  const leftovers = strings.flatMap((s) => [sideText(s, "R"), sideText(s, "L")]).filter((s) => /[{}]/.test(s));
  assert.deepEqual(leftovers, []);
});
