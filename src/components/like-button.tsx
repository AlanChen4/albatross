"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import rough from "roughjs";
import { useUser } from "~/hooks/use-user";
import { createClient } from "~/lib/supabase/client";
import { cn } from "~/lib/utils";

// SVG heart path (standard heart shape scaled to 24x24 viewBox)
const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

export function LikeButton({ puzzleId }: { puzzleId: string }) {
  const { user, loading: userLoading } = useUser();
  const [liked, setLiked] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const seed = useRef(Math.floor(Math.random() * 2 ** 31));
  const likedRef = useRef(liked);
  likedRef.current = liked;

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setLoaded(true);
      return;
    }
    const supabase = createClient();
    supabase
      .from("puzzle_likes")
      .select("puzzle_id")
      .eq("puzzle_id", puzzleId)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }: { data: { puzzle_id: string } | null }) => {
        setLiked(!!data);
        setLoaded(true);
      });
  }, [puzzleId, user, userLoading]);

  const toggle = useCallback(async () => {
    if (!user) return;
    const next = !likedRef.current;
    setLiked(next);

    const supabase = createClient();
    if (next) {
      await supabase
        .from("puzzle_likes")
        .insert({ user_id: user.id, puzzle_id: puzzleId });
    } else {
      await supabase
        .from("puzzle_likes")
        .delete()
        .eq("user_id", user.id)
        .eq("puzzle_id", puzzleId);
    }
  }, [user, puzzleId]);

  const paths = useMemo(() => {
    const generator = rough.generator();
    const drawable = generator.path(HEART_PATH, {
      roughness: 0.5,
      strokeWidth: 1.5,
      bowing: 1,
      seed: seed.current,
      fill: liked ? "currentColor" : "none",
      fillStyle: liked ? "solid" : "hachure",
    });
    return generator.toPaths(drawable);
  }, [liked]);

  if (!loaded) return null;

  return (
    <button
      aria-label={liked ? "Unlike puzzle" : "Like puzzle"}
      aria-pressed={liked}
      className={cn(
        "flex cursor-pointer items-center gap-2 transition-colors",
        liked ? "text-red-500" : "text-muted-foreground hover:text-foreground",
      )}
      onClick={toggle}
      type="button"
    >
      Favorite this puzzle
      <svg
        aria-hidden="true"
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
      >
        {paths.map((p) => (
          <path
            d={p.d}
            fill={p.fill === "none" ? "none" : (p.fill ?? "none")}
            key={p.d}
            stroke={p.stroke === "none" ? "none" : "currentColor"}
            strokeWidth={p.strokeWidth}
          />
        ))}
      </svg>
    </button>
  );
}
