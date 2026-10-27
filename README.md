# tendu

A personal ballet workout web app: a Vaganova glossary of steps (organised by category, with variants,
terms, and relationships between steps) and, next, a workout builder that assembles a class from it.

## Stack

- Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS 4
- SQLite via Drizzle ORM (`better-sqlite3`); the database file lives in `data/tendu.db`

All glossary content — categories, steps, variants, terms, relationships, key positions, and diagram
data — is stored in the database. The initial content is in `src/db/seed-data.ts`; every entry starts
as a draft ("needs review").

## Development

```bash
npm install
npm run db:setup   # create tables and load the glossary seed
npm run dev
```

After changing `src/db/seed-data.ts`, run `npm run db:seed` and restart the dev server (glossary
queries are cached for an hour).

## Structure

- `src/db/schema.ts` — tables
- `src/db/seed-data.ts`, `src/db/seed.ts` — glossary content and loader
- `src/lib/glossary.ts` — read-only glossary queries
- `src/app/glossary` — glossary, category, step, variant, and term pages
- `src/components/diagrams.tsx` — feet, studio square, and turn diagrams drawn from diagram data
