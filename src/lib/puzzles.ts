import { createClient } from "~/lib/supabase/server";

export async function getNextPuzzle() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("get_next_puzzle_for_user")
    .single();

  if (error) return null;
  return data as {
    id: string;
    prompt: string;
    image_url: string | null;
    slug: string;
  };
}
