# Albatross

A daily lateral thinking puzzle game. Each day, a new puzzle is released. Ask up to 20 yes-or-no questions to figure out the solution.

## Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Linter/Formatter**: Biome
- **Database**: Supabase (Postgres)
- **AI**: Vercel AI SDK + DeepSeek v3.2 via Vercel AI Gateway

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

## How It Works

1. A puzzle prompt and GIF are displayed on screen
2. The player types yes-or-no questions to narrow down the solution
3. An AI model (DeepSeek v3.2) judges each question and responds with: **Yes**, **No**, **Not relevant**, or **That's not a yes or no question**
4. After 20 questions or giving up, the solution is revealed

In development mode, the same puzzle is always served regardless of date.
