import { asc, eq, inArray, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import {
  categories,
  diagrams,
  itemTerms,
  phases,
  relationships,
  steps,
  terms,
  variants,
  type DiagramData,
  type RelationshipType,
} from "@/db/schema";
import type { CatalogStep } from "./class-builder";
import { dependsOnSide, type Pose } from "./pose";

/**
 * Read-only glossary queries. The glossary only changes when the seed is reloaded,
 * so results are cached; reseeding calls for a server restart (or waiting an hour).
 */
function glossaryCache() {
  cacheLife("hours");
  cacheTag("glossary");
}

export type CategoryNode = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  children: CategoryNode[];
  stepCount: number;
};

export async function getCategoryTree(): Promise<CategoryNode[]> {
  "use cache";
  glossaryCache();
  const rows = db.select().from(categories).orderBy(asc(categories.sortOrder)).all();
  const counts = new Map<number, number>();
  for (const s of db.select({ categoryId: steps.categoryId }).from(steps).all()) {
    counts.set(s.categoryId, (counts.get(s.categoryId) ?? 0) + 1);
  }
  const nodes = new Map<number, CategoryNode>(
    rows.map((c) => [c.id, { id: c.id, slug: c.slug, name: c.name, description: c.description, children: [], stepCount: 0 }]),
  );
  const roots: CategoryNode[] = [];
  for (const c of rows) {
    const node = nodes.get(c.id)!;
    if (c.parentId) nodes.get(c.parentId)!.children.push(node);
    else roots.push(node);
  }
  const total = (n: CategoryNode): number =>
    (n.stepCount = (counts.get(n.id) ?? 0) + n.children.reduce((sum, child) => sum + total(child), 0));
  roots.forEach(total);
  return roots;
}

function findPath(nodes: CategoryNode[], slug: string): CategoryNode[] | null {
  for (const n of nodes) {
    if (n.slug === slug) return [n];
    const sub = findPath(n.children, slug);
    if (sub) return [n, ...sub];
  }
  return null;
}

function descendantIds(n: CategoryNode): number[] {
  return [n.id, ...n.children.flatMap(descendantIds)];
}

export type Phase = { caption: string; pose: Pose | null };

export type StepCard = {
  slug: string;
  name: string;
  pronunciation: string | null;
  summary: string;
  kind: "pose" | "movement";
  level: string;
  jumpSize: string | null;
  categoryId: number;
  variantCount: number;
  phases: Phase[];
  /** The first diagram, shown on the card when there are no phases. */
  diagram: DiagramData | null;
};

function stepCards(categoryIds?: number[]): StepCard[] {
  const rows = db
    .select()
    .from(steps)
    .where(categoryIds ? inArray(steps.categoryId, categoryIds) : undefined)
    .orderBy(asc(steps.sortOrder))
    .all();
  const ids = rows.map((s) => s.id);
  const variantCounts = new Map<number, number>();
  for (const v of db.select({ stepId: variants.stepId }).from(variants).where(inArray(variants.stepId, ids)).all()) {
    variantCounts.set(v.stepId, (variantCounts.get(v.stepId) ?? 0) + 1);
  }
  const phaseRows = db.select().from(phases).where(inArray(phases.stepId, ids)).orderBy(asc(phases.sortOrder)).all();
  const diagramRows = db.select().from(diagrams).where(inArray(diagrams.stepId, ids)).orderBy(asc(diagrams.sortOrder)).all();
  return rows.map((s) => ({
    slug: s.slug,
    name: s.name,
    pronunciation: s.pronunciation,
    summary: s.summary,
    kind: s.kind,
    level: s.level,
    jumpSize: s.jumpSize,
    categoryId: s.categoryId,
    variantCount: variantCounts.get(s.id) ?? 0,
    phases: phaseRows.filter((p) => p.stepId === s.id).map((p) => ({ caption: p.caption, pose: p.pose })),
    diagram: diagramRows.find((d) => d.stepId === s.id)?.data ?? null,
  }));
}

export async function getCategoryPage(slug: string) {
  "use cache";
  glossaryCache();
  const tree = await getCategoryTree();
  const path = findPath(tree, slug);
  if (!path) return null;
  const category = path[path.length - 1];
  const cards = stepCards(descendantIds(category));
  // Group cards under the category (or subcategory) they belong to, in tree order.
  // Grandchildren carry their parent's name, e.g. "From two feet · to one foot".
  const groups = [
    { node: category, label: null },
    ...category.children.flatMap((c) => [
      { node: c, label: c.name },
      ...c.children.map((g) => ({ node: g, label: `${c.name} · ${g.name}` })),
    ]),
  ]
    .map(({ node, label }) => ({ slug: node.slug, label, steps: cards.filter((s) => s.categoryId === node.id) }))
    .filter((g) => g.steps.length > 0);
  return { path, category, groups };
}

export async function getGlossaryOverview() {
  "use cache";
  glossaryCache();
  const tree = await getCategoryTree();
  const cards = stepCards();
  return tree.map((section) => {
    const ids = new Set(descendantIds(section));
    return { section, steps: cards.filter((s) => ids.has(s.categoryId)) };
  });
}

export async function getGlossaryStats() {
  "use cache";
  glossaryCache();
  const count = (table: typeof steps | typeof variants | typeof terms) => db.$count(table);
  const tree = await getCategoryTree();
  return {
    steps: await count(steps),
    variants: await count(variants),
    terms: await count(terms),
    sections: tree.map((c) => ({ slug: c.slug, name: c.name })),
  };
}

/** Every step with what the class builder needs to choose and show it. */
export async function getClassCatalog(): Promise<CatalogStep[]> {
  "use cache";
  glossaryCache();
  const categorySlugs = new Map(db.select({ id: categories.id, slug: categories.slug }).from(categories).all().map((c) => [c.id, c.slug]));
  const rows = new Map(db.select({ id: steps.id, slug: steps.slug, goals: steps.goals, howTo: steps.howTo }).from(steps).all().map((s) => [s.slug, s]));
  const allDiagrams = db.select({ stepId: diagrams.stepId, caption: diagrams.caption, data: diagrams.data }).from(diagrams).all();
  return stepCards().map((s) => {
    const row = rows.get(s.slug)!;
    const own = allDiagrams.filter((d) => d.stepId === row.id);
    // The same rule as the step page's left/right toggle.
    const sided =
      categorySlugs.get(s.categoryId) !== "arms" &&
      dependsOnSide(
        [...s.phases.map((p) => p.caption), ...Object.values(row.howTo).filter((t): t is string => typeof t === "string"), ...own.map((d) => d.caption ?? "")],
        s.phases.flatMap((p) => (p.pose ? [p.pose] : [])),
        own.map((d) => d.data),
      );
    return {
      slug: s.slug,
      name: s.name,
      level: s.level as CatalogStep["level"],
      goals: row.goals,
      category: categorySlugs.get(s.categoryId)!,
      jumpSize: s.jumpSize as CatalogStep["jumpSize"],
      pose: s.phases.find((p) => p.pose)?.pose ?? (s.diagram?.kind === "figure" ? s.diagram.pose : null),
      phases: s.phases.flatMap((p) => (p.pose ? [p.pose] : [])),
      sided,
    };
  });
}

export async function getCategorySlugs() {
  "use cache";
  glossaryCache();
  return db.select({ slug: categories.slug }).from(categories).all();
}

export async function getStepSlugs() {
  "use cache";
  glossaryCache();
  return db.select({ slug: steps.slug }).from(steps).all();
}

export async function getVariantParams() {
  "use cache";
  glossaryCache();
  return db
    .select({ slug: steps.slug, variant: variants.slug })
    .from(variants)
    .innerJoin(steps, eq(steps.id, variants.stepId))
    .all();
}

export async function getTermSlugs() {
  "use cache";
  glossaryCache();
  return db.select({ slug: terms.slug }).from(terms).all();
}

type ItemRef = { stepId: number | null; variantId: number | null };

export type LinkedItem = {
  /** Name to show, e.g. "Pirouette · En dedans from 4th". */
  label: string;
  /** Link to the step page, or to the variant's own page. */
  href: string;
};

function resolveItems(refs: ItemRef[]): Map<string, LinkedItem> {
  const stepIds = refs.flatMap((r) => (r.stepId ? [r.stepId] : []));
  const variantIds = refs.flatMap((r) => (r.variantId ? [r.variantId] : []));
  const variantRows = db.select().from(variants).where(inArray(variants.id, variantIds)).all();
  const allStepIds = [...stepIds, ...variantRows.map((v) => v.stepId)];
  const stepRows = new Map(db.select().from(steps).where(inArray(steps.id, allStepIds)).all().map((s) => [s.id, s]));
  const out = new Map<string, LinkedItem>();
  for (const id of stepIds) {
    const s = stepRows.get(id)!;
    out.set(`s${id}`, { label: s.name, href: `/glossary/${s.slug}` });
  }
  for (const v of variantRows) {
    const s = stepRows.get(v.stepId)!;
    out.set(`v${v.id}`, { label: `${s.name} · ${v.name}`, href: `/glossary/${s.slug}/${v.slug}` });
  }
  return out;
}

const key = (r: ItemRef) => (r.stepId ? `s${r.stepId}` : `v${r.variantId}`);

export type RelatedGroup = { title: string; items: (LinkedItem & { note: string | null })[] };

/** Relationships of a step and its variants, grouped by how they read on the page. */
function relatedGroups(stepId: number, variantIds: number[]): RelatedGroup[] {
  const mine = (r: ItemRef) => r.stepId === stepId || (r.variantId !== null && variantIds.includes(r.variantId));
  const rows = db
    .select()
    .from(relationships)
    .where(
      or(
        eq(relationships.fromStepId, stepId),
        eq(relationships.toStepId, stepId),
        inArray(relationships.fromVariantId, variantIds),
        inArray(relationships.toVariantId, variantIds),
      ),
    )
    .all();
  const edges = rows.map((r) => ({
    type: r.type,
    note: r.note,
    from: { stepId: r.fromStepId, variantId: r.fromVariantId },
    to: { stepId: r.toStepId, variantId: r.toVariantId },
  }));
  const names = resolveItems(edges.flatMap((e) => [e.from, e.to]));

  const groups: { title: string; type: RelationshipType; outgoing: boolean }[] = [
    { title: "Built from", type: "built_from", outgoing: true },
    { title: "Learn first", type: "learn_first", outgoing: false },
    { title: "Variation of", type: "variation_of", outgoing: true },
    { title: "Variations", type: "variation_of", outgoing: false },
    { title: "Used in", type: "built_from", outgoing: false },
    { title: "Learn next", type: "learn_first", outgoing: true },
  ];
  const result: RelatedGroup[] = groups.map((g) => ({
    title: g.title,
    items: edges
      .filter((e) => e.type === g.type && mine(g.outgoing ? e.from : e.to) && !mine(g.outgoing ? e.to : e.from))
      .map((e) => ({ ...names.get(key(g.outgoing ? e.to : e.from))!, note: e.note })),
  }));
  result.push({
    title: "Often paired with",
    items: edges
      .filter((e) => e.type === "paired_with")
      .map((e) => ({ ...names.get(key(mine(e.from) ? e.to : e.from))!, note: e.note })),
  });
  return result.filter((g) => g.items.length > 0);
}

function extrasFor(where: { stepIds: number[]; variantIds: number[] }) {
  const byItem = <T extends ItemRef>(rows: T[]) => (r: ItemRef) =>
    rows.filter((x) => (r.stepId ? x.stepId === r.stepId : x.variantId === r.variantId));
  const phaseRows = db
    .select()
    .from(phases)
    .where(or(inArray(phases.stepId, where.stepIds), inArray(phases.variantId, where.variantIds)))
    .orderBy(asc(phases.sortOrder))
    .all();
  const diagramRows = db
    .select()
    .from(diagrams)
    .where(or(inArray(diagrams.stepId, where.stepIds), inArray(diagrams.variantId, where.variantIds)))
    .orderBy(asc(diagrams.sortOrder))
    .all();
  const termRows = db
    .select({ stepId: itemTerms.stepId, variantId: itemTerms.variantId, slug: terms.slug, name: terms.name })
    .from(itemTerms)
    .innerJoin(terms, eq(terms.id, itemTerms.termId))
    .where(or(inArray(itemTerms.stepId, where.stepIds), inArray(itemTerms.variantId, where.variantIds)))
    .all();
  return {
    phases: (r: ItemRef): Phase[] => byItem(phaseRows)(r).map((p) => ({ caption: p.caption, pose: p.pose })),
    diagrams: (r: ItemRef) => byItem(diagramRows)(r).map((d) => ({ data: d.data, caption: d.caption })),
    terms: (r: ItemRef) => byItem(termRows)(r).map((t) => ({ slug: t.slug, name: t.name })),
  };
}

export async function getStep(slug: string) {
  "use cache";
  glossaryCache();
  const step = db.select().from(steps).where(eq(steps.slug, slug)).get();
  if (!step) return null;
  const tree = await getCategoryTree();
  const categorySlug = db.select({ slug: categories.slug }).from(categories).where(eq(categories.id, step.categoryId)).get()!.slug;
  const path = findPath(tree, categorySlug) ?? [];
  const variantRows = db.select().from(variants).where(eq(variants.stepId, step.id)).orderBy(asc(variants.sortOrder)).all();
  const extras = extrasFor({ stepIds: [step.id], variantIds: variantRows.map((v) => v.id) });
  const stepRef = { stepId: step.id, variantId: null };
  return {
    step: {
      ...step,
      phases: extras.phases(stepRef),
      diagrams: extras.diagrams(stepRef),
      terms: extras.terms(stepRef),
    },
    path: path.map((c) => ({ slug: c.slug, name: c.name })),
    variants: variantRows.map((v) => {
      const ref = { stepId: null, variantId: v.id };
      return { ...v, phases: extras.phases(ref), diagrams: extras.diagrams(ref), terms: extras.terms(ref) };
    }),
    related: relatedGroups(step.id, variantRows.map((v) => v.id)),
  };
}

export type StepDetail = NonNullable<Awaited<ReturnType<typeof getStep>>>;

export async function getTerm(slug: string) {
  "use cache";
  glossaryCache();
  const term = db.select().from(terms).where(eq(terms.slug, slug)).get();
  if (!term) return null;
  const uses = db.select().from(itemTerms).where(eq(itemTerms.termId, term.id)).all();
  const names = resolveItems(uses);
  return {
    term,
    usedBy: uses.map((u) => names.get(key(u))!).sort((a, b) => a.label.localeCompare(b.label)),
  };
}
