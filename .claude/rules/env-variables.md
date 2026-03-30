# Environment Variables

Never use `process.env` directly in application code. All environment variables are validated through `src/env.ts` using `@t3-oss/env-nextjs` and Zod. Import and use the `env` object instead:

```ts
import { env } from "~/env";
env.NEXT_PUBLIC_SUPABASE_URL;
```

The only place `process.env` should appear is inside the `runtimeEnv` block of `src/env.ts` itself.
