# Albatross

Project rules live in `.claude/rules/`. Keep this list in sync when adding or removing rule files.

- [Stack](.claude/rules/stack.md) — Framework, language, tooling
- [Environment Variables](.claude/rules/env-variables.md) — Use `~/env`, never `process.env`
- [Styling](.claude/rules/styling.md) — Tailwind v4, design tokens, `cn()`
- [Proxy](.claude/rules/proxy.md) — `proxy.ts` for session refresh, no `middleware.ts`
- [Data Fetching](.claude/rules/data-fetching.md) — Direct Supabase client over API routes
- [Database Migrations](.claude/rules/database-migrations.md) — Supabase CLI migration workflow (scoped to `supabase/migrations/`)
- [Commit Conventions](.claude/rules/commit-conventions.md) — Gitmoji prefixes
