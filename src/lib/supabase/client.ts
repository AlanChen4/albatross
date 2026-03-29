import { createBrowserClient } from "@supabase/ssr";
import { env } from "~/env";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient(): ReturnType<typeof createBrowserClient> {
  if (!client) {
    client = createBrowserClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }
  return client;
}
