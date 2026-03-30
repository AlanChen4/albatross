import { env } from "~/env";
import { createClient } from "~/lib/supabase/server";

export async function getTodaysPuzzle() {
  const supabase = await createClient();

  if (env.NEXT_PUBLIC_NODE_ENV === "development") {
    const { data, error } = await supabase
      .from("puzzles")
      .select("id, prompt, image_url")
      .eq("status", "published")
      .limit(1)
      .single();
    if (error) return null;
    return data;
  }

  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("puzzle_schedule")
    .select("puzzles(id, prompt, image_url)")
    .eq("release_date", today)
    .single();
  if (error) return null;
  const puzzle = data.puzzles;
  if (Array.isArray(puzzle)) return null;
  return puzzle;
}
