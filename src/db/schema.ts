import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";

export const LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type Level = (typeof LEVELS)[number];

export const GOALS = [
  "full-class",
  "jumps",
  "turns",
  "extensions",
  "feet",
  "balance",
  "flexibility",
  "turnout",
  "petit-allegro",
  "stamina",
] as const;
export type Goal = (typeof GOALS)[number];

export const RELATIONSHIP_TYPES = [
  "built_from",
  "variation_of",
  "learn_first",
  "paired_with",
] as const;
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

/** Structured "how to do it" fields shared by steps and variants. */
export type HowTo = {
  start?: string;
  standingLeg?: string;
  workingLeg?: string;
  direction?: string;
  arms?: string;
  head?: string;
  bodyDirection?: string;
  finish?: string;
  cues?: string;
  mistakes?: string;
};

/** Data the step page draws diagrams from. */
export type DiagramData =
  | { kind: "feet"; position: 1 | 2 | 3 | 4 | 5 }
  | { kind: "room"; facing: number; leg?: number; label?: string }
  | { kind: "turn"; direction: "en dehors" | "en dedans" };

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  parentId: integer("parent_id").references((): AnySQLiteColumn => categories.id),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const steps = sqliteTable(
  "steps",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    pronunciation: text("pronunciation"),
    translation: text("translation"),
    summary: text("summary").notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    level: text("level", { enum: LEVELS }).notNull(),
    goals: text("goals", { mode: "json" }).$type<Goal[]>().notNull().default(sql`'[]'`),
    jumpSize: text("jump_size", { enum: ["petit", "medium", "grand"] }),
    howTo: text("how_to", { mode: "json" }).$type<HowTo>().notNull().default(sql`'{}'`),
    needsReview: integer("needs_review", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("steps_category_idx").on(t.categoryId)],
);

export const variants = sqliteTable(
  "variants",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    stepId: integer("step_id")
      .notNull()
      .references(() => steps.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    level: text("level", { enum: LEVELS }),
    summary: text("summary"),
    howTo: text("how_to", { mode: "json" }).$type<HowTo>().notNull().default(sql`'{}'`),
    needsReview: integer("needs_review", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("variants_step_idx").on(t.stepId)],
);

export const terms = sqliteTable("terms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  pronunciation: text("pronunciation"),
  translation: text("translation"),
  definition: text("definition").notNull(),
});

/** Which steps or variants use a term. Exactly one of stepId / variantId is set. */
export const itemTerms = sqliteTable(
  "item_terms",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    termId: integer("term_id")
      .notNull()
      .references(() => terms.id, { onDelete: "cascade" }),
    stepId: integer("step_id").references(() => steps.id, { onDelete: "cascade" }),
    variantId: integer("variant_id").references(() => variants.id, { onDelete: "cascade" }),
  },
  (t) => [check("item_terms_one_item", sql`(${t.stepId} IS NULL) != (${t.variantId} IS NULL)`)],
);

/** A directed relationship between two steps or variants. */
export const relationships = sqliteTable(
  "relationships",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    type: text("type", { enum: RELATIONSHIP_TYPES }).notNull(),
    fromStepId: integer("from_step_id").references(() => steps.id, { onDelete: "cascade" }),
    fromVariantId: integer("from_variant_id").references(() => variants.id, { onDelete: "cascade" }),
    toStepId: integer("to_step_id").references(() => steps.id, { onDelete: "cascade" }),
    toVariantId: integer("to_variant_id").references(() => variants.id, { onDelete: "cascade" }),
    note: text("note"),
  },
  (t) => [
    check("relationships_one_from", sql`(${t.fromStepId} IS NULL) != (${t.fromVariantId} IS NULL)`),
    check("relationships_one_to", sql`(${t.toStepId} IS NULL) != (${t.toVariantId} IS NULL)`),
  ],
);

/** Ordered key positions a step or variant passes through. */
export const phases = sqliteTable(
  "phases",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    stepId: integer("step_id").references(() => steps.id, { onDelete: "cascade" }),
    variantId: integer("variant_id").references(() => variants.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull(),
    caption: text("caption").notNull(),
    count: text("count"),
    imageUrl: text("image_url"),
  },
  (t) => [check("phases_one_item", sql`(${t.stepId} IS NULL) != (${t.variantId} IS NULL)`)],
);

export const diagrams = sqliteTable(
  "diagrams",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    stepId: integer("step_id").references(() => steps.id, { onDelete: "cascade" }),
    variantId: integer("variant_id").references(() => variants.id, { onDelete: "cascade" }),
    data: text("data", { mode: "json" }).$type<DiagramData>().notNull(),
    caption: text("caption"),
  },
  (t) => [check("diagrams_one_item", sql`(${t.stepId} IS NULL) != (${t.variantId} IS NULL)`)],
);

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const savedWorkouts = sqliteTable("saved_workouts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  level: text("level", { enum: LEVELS }).notNull(),
  goals: text("goals", { mode: "json" }).$type<Goal[]>().notNull(),
  minutes: integer("minutes").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const workoutItems = sqliteTable(
  "workout_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    workoutId: integer("workout_id")
      .notNull()
      .references(() => savedWorkouts.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull(),
    section: text("section").notNull(),
    stepId: integer("step_id")
      .notNull()
      .references(() => steps.id),
    variantId: integer("variant_id").references(() => variants.id),
    prescription: text("prescription").notNull(),
    seconds: integer("seconds").notNull(),
  },
  (t) => [index("workout_items_workout_idx").on(t.workoutId)],
);
