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
    if (error) throw new Error(`Failed to fetch puzzle: ${error.message}`);
    return data;
  }

  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("puzzle_schedule")
    .select("puzzles(id, prompt, image_url)")
    .eq("release_date", today)
    .single();
  if (error) throw new Error(`No puzzle for today: ${error.message}`);
  const puzzle = data.puzzles;
  if (Array.isArray(puzzle))
    throw new Error("Expected single puzzle, got array");
  return puzzle;
}
