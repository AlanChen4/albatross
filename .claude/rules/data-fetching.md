# Data Fetching

Don't create Next.js API routes that merely proxy Supabase queries. If RLS policies already grant the needed access, use the Supabase client directly — from the server client in Server Components / Server Actions, or from the browser client in Client Components. Only use an API route when it performs logic that can't run on the client (e.g. calling an external API with a secret key, or writing data that RLS shouldn't allow directly).
