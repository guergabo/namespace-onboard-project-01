/**
 * Loads the glossary seed into the database, replacing existing glossary rows.
 * Users and saved workouts are kept. Run with: npm run db:seed
 */
import { db } from "./index";
import {
  categories,
  diagrams,
  itemTerms,
  phases,
  relationships,
  steps,
  terms,
  variants,
} from "./schema";
import { seedCategories, seedRelationships, seedSteps, seedTerms } from "./seed-data";

type Item = { stepId: number; variantId: null } | { stepId: null; variantId: number };

db.transaction((tx) => {
  for (const table of [relationships, itemTerms, phases, diagrams, variants, steps, terms, categories]) {
    tx.delete(table).run();
  }

  const categoryIds = new Map<string, number>();
  seedCategories.forEach((c, i) => {
    const parentId = c.parent ? categoryIds.get(c.parent) : null;
    if (c.parent && parentId === undefined) throw new Error(`Unknown parent category ${c.parent}`);
    const row = tx
      .insert(categories)
      .values({ slug: c.slug, name: c.name, description: c.description, parentId, sortOrder: i })
      .returning({ id: categories.id })
      .get();
    categoryIds.set(c.slug, row.id);
  });

  const termIds = new Map<string, number>();
  for (const t of seedTerms) {
    termIds.set(t.slug, tx.insert(terms).values(t).returning({ id: terms.id }).get().id);
  }

  const items = new Map<string, Item>();
  const addExtras = (item: Item, extra: { terms?: string[]; phases?: string[]; diagrams?: object[] }) => {
    for (const slug of extra.terms ?? []) {
      const termId = termIds.get(slug);
      if (!termId) throw new Error(`Unknown term ${slug}`);
      tx.insert(itemTerms).values({ termId, ...item }).run();
    }
    extra.phases?.forEach((caption, i) => tx.insert(phases).values({ ...item, sortOrder: i, caption }).run());
    for (const data of extra.diagrams ?? []) {
      tx.insert(diagrams).values({ ...item, data: data as never }).run();
    }
  };

  seedSteps.forEach((s, i) => {
    const categoryId = categoryIds.get(s.category);
    if (!categoryId) throw new Error(`Unknown category ${s.category} for ${s.slug}`);
    const stepId = tx
      .insert(steps)
      .values({
        slug: s.slug,
        name: s.name,
        pronunciation: s.pronunciation,
        translation: s.translation,
        summary: s.summary,
        categoryId,
        level: s.level,
        goals: s.goals,
        jumpSize: s.jumpSize,
        howTo: s.howTo ?? {},
        sortOrder: i,
      })
      .returning({ id: steps.id })
      .get().id;
    const stepItem: Item = { stepId, variantId: null };
    items.set(s.slug, stepItem);
    addExtras(stepItem, s);

    s.variants?.forEach((v, j) => {
      const variantId = tx
        .insert(variants)
        .values({ slug: v.slug, stepId, name: v.name, level: v.level, summary: v.summary, howTo: v.howTo ?? {}, sortOrder: j })
        .returning({ id: variants.id })
        .get().id;
      const variantItem: Item = { stepId: null, variantId };
      items.set(v.slug, variantItem);
      addExtras(variantItem, v);
    });
  });

  for (const r of seedRelationships) {
    const from = items.get(r.from);
    const to = items.get(r.to);
    if (!from || !to) throw new Error(`Unknown relationship endpoint ${r.from} → ${r.to}`);
    tx.insert(relationships)
      .values({
        type: r.type,
        note: r.note,
        fromStepId: from.stepId,
        fromVariantId: from.variantId,
        toStepId: to.stepId,
        toVariantId: to.variantId,
      })
      .run();
  }
});

console.log(
  `Seeded ${seedCategories.length} categories, ${seedSteps.length} steps, ` +
    `${seedSteps.reduce((n, s) => n + (s.variants?.length ?? 0), 0)} variants, ` +
    `${seedTerms.length} terms, ${seedRelationships.length} relationships.`,
);
