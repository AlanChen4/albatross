# Albatross

A lateral thinking puzzle game platform.

## Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Linter/Formatter**: Biome
- **Database**: Supabase (Postgres)
- **AI**: Vercel AI SDK

## Getting Started

```bash
# Install dependencies
pnpm install

# Fill in your env vars
cp .env.local.example .env.local
$EDITOR .env.local

# Start Supabase locally
npx supabase start

# Apply migrations and seed data
npx supabase db reset

# Start the dev server
pnpm dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `VERCEL_AI_GATEWAY_API_KEY` | API key for Vercel AI Gateway |

Fill in your values in `.env.local`.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm format` | Format code with Biome |
| `pnpm lint` | Lint code with Biome |
| `pnpm typecheck` | Run TypeScript type checking |