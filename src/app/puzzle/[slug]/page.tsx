import { notFound, redirect } from "next/navigation";
import { PuzzleGame } from "~/app/_components/puzzle-game";
import { createClient } from "~/lib/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PuzzlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  if (UUID_REGEX.test(slug)) {
    const { data } = await supabase
      .from("puzzles")
      .select("slug")
      .eq("id", slug)
      .single();

    if (!data) notFound();
    redirect(`/puzzle/${data.slug}`);
  }

  const { data: puzzle, error } = await supabase
    .from("puzzles")
    .select("id, prompt, image_url, slug")
    .eq("slug", slug)
    .single();

  if (error || !puzzle) {
    notFound();
  }

  return (
    <div className="flex h-dvh flex-col">
      <PuzzleGame puzzle={puzzle} />
    </div>
  );
}
