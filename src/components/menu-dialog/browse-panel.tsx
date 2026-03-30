"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRoughBorder } from "~/hooks/use-rough-border";
import { createClient } from "~/lib/supabase/client";

type PuzzleCard = {
  id: string;
  title: string;
  slug: string;
  prompt: string;
  image_url: string | null;
  created_at: string;
  like_count: number;
};

function PuzzleGridCard({
  puzzle,
  index,
  onNavigate,
}: {
  puzzle: PuzzleCard;
  index: number;
  onNavigate: () => void;
}) {
  const { ref, svgOverlay } = useRoughBorder({
    enabled: true,
    shape: "rectangle",
    underline: false,
  });

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        className="group relative block overflow-hidden p-4"
        href={`/puzzle/${puzzle.slug}`}
        onClick={onNavigate}
        ref={ref as React.Ref<HTMLAnchorElement>}
      >
        {svgOverlay}
        <h3 className="font-medium text-sm">{puzzle.title}</h3>
        <p className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-snug">
          {puzzle.prompt}
        </p>
        <p className="mt-2 text-muted-foreground text-xs">
          {puzzle.like_count} {puzzle.like_count === 1 ? "like" : "likes"}
        </p>
      </Link>
    </motion.div>
  );
}

export function BrowsePanel({ onClose }: { onClose: () => void }) {
  const [puzzles, setPuzzles] = useState<PuzzleCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPuzzles() {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("puzzles")
        .select(
          "id, title, slug, prompt, image_url, created_at, puzzle_likes(count)",
        )
        .eq("status", "published")
        .limit(50);
      const puzzles = (data ?? [])
        .map(
          (p: {
            id: string;
            title: string;
            slug: string;
            prompt: string;
            image_url: string | null;
            created_at: string;
            puzzle_likes: { count: number }[];
          }) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            prompt: p.prompt,
            image_url: p.image_url,
            created_at: p.created_at,
            like_count: p.puzzle_likes[0]?.count ?? 0,
          }),
        )
        .sort((a: PuzzleCard, b: PuzzleCard) => b.like_count - a.like_count);
      setPuzzles(puzzles);
      setLoading(false);
    }
    fetchPuzzles();
  }, []);

  if (loading) {
    return <p className="text-muted-foreground text-xs">Loading puzzles...</p>;
  }

  if (puzzles.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No puzzles yet. Be the first to create one!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {puzzles.map((puzzle, i) => (
        <PuzzleGridCard
          index={i}
          key={puzzle.id}
          onNavigate={onClose}
          puzzle={puzzle}
        />
      ))}
    </div>
  );
}
