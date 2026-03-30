"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { useUser } from "~/hooks/use-user";
import { createClient } from "~/lib/supabase/client";
import { cn } from "~/lib/utils";

type GameSummary = {
  puzzleId: string;
  prompt: string;
  imageUrl: string | null;
  turns: number;
  outcome: "solved" | "revealed" | "exhausted" | "in-progress";
};

type FavoritePuzzle = {
  puzzleId: string;
  prompt: string;
  imageUrl: string | null;
};

type ProfileTab = "favorites" | "recent";

export function ProfilePanel() {
  const { user } = useUser();
  const [tab, setTab] = useState<ProfileTab>("favorites");
  const [games, setGames] = useState<GameSummary[]>([]);
  const [favorites, setFavorites] = useState<FavoritePuzzle[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function fetchGames() {
      setLoadingGames(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("game_turns")
        .select(
          "puzzle_id, turn_number, judgment, end_reason, is_solution_guess, puzzles(prompt, image_url)",
        )
        .eq("user_id", user?.id as string)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!data) {
        setLoadingGames(false);
        return;
      }

      const grouped = new Map<
        string,
        {
          prompt: string;
          imageUrl: string | null;
          turns: number;
          outcome: GameSummary["outcome"];
        }
      >();

      for (const turn of data) {
        const puzzleId = turn.puzzle_id;
        const puzzle = turn.puzzles as unknown as {
          prompt: string;
          image_url: string | null;
        } | null;

        if (!grouped.has(puzzleId)) {
          grouped.set(puzzleId, {
            prompt: puzzle?.prompt ?? "Unknown puzzle",
            imageUrl: puzzle?.image_url ?? null,
            turns: 0,
            outcome: "in-progress",
          });
        }

        const entry = grouped.get(puzzleId);
        if (!entry) continue;
        entry.turns = Math.max(entry.turns, turn.turn_number);

        if (turn.end_reason === "solved") entry.outcome = "solved";
        else if (turn.end_reason === "revealed") entry.outcome = "revealed";
        else if (turn.end_reason === "exhausted") entry.outcome = "exhausted";
      }

      setGames(
        Array.from(grouped.entries())
          .slice(0, 5)
          .map(([puzzleId, g]) => ({
            puzzleId,
            ...g,
          })),
      );
      setLoadingGames(false);
    }

    async function fetchFavorites() {
      setLoadingFavorites(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("puzzle_likes")
        .select("puzzle_id, puzzles(prompt, image_url)")
        .eq("user_id", user?.id as string)
        .order("created_at", { ascending: false });

      if (!data) {
        setLoadingFavorites(false);
        return;
      }

      setFavorites(
        data.map(
          (row: {
            puzzle_id: string;
            puzzles: { prompt: string; image_url: string | null } | null;
          }) => {
            const puzzle = row.puzzles as unknown as {
              prompt: string;
              image_url: string | null;
            } | null;
            return {
              puzzleId: row.puzzle_id,
              prompt: puzzle?.prompt ?? "Unknown puzzle",
              imageUrl: puzzle?.image_url ?? null,
            };
          },
        ),
      );
      setLoadingFavorites(false);
    }

    fetchGames();
    fetchFavorites();
  }, [user]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  }

  const name = user?.user_metadata?.full_name;
  const email = user?.email;
  const avatar = user?.user_metadata?.avatar_url;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-3">
        {avatar && (
          // biome-ignore lint/performance/noImgElement: external avatar URL from Google OAuth
          <img
            alt=""
            className="size-10 rounded-full"
            referrerPolicy="no-referrer"
            src={avatar}
          />
        )}
        <div className="min-w-0">
          {name && <p className="truncate font-medium text-sm">{name}</p>}
          {email && (
            <p className="truncate text-muted-foreground text-xs">{email}</p>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex gap-4">
          <button
            className={cn(
              "font-medium text-sm transition-colors",
              tab === "favorites"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setTab("favorites")}
            type="button"
          >
            Favorites
          </button>
          <button
            className={cn(
              "font-medium text-sm transition-colors",
              tab === "recent"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setTab("recent")}
            type="button"
          >
            Recent Games
          </button>
        </div>

        {tab === "favorites" && (
          <>
            {loadingFavorites && (
              <p className="text-muted-foreground text-sm">Loading...</p>
            )}
            {!loadingFavorites && favorites.length === 0 && (
              <p className="text-muted-foreground text-sm">No favorites yet.</p>
            )}
            {!loadingFavorites &&
              favorites.map((fav) => (
                <Link
                  className="flex items-center rounded-md py-1 transition-colors"
                  href={`/puzzle/${fav.puzzleId}`}
                  key={fav.puzzleId}
                >
                  <p className="line-clamp-1 flex-1">{fav.prompt}</p>
                </Link>
              ))}
          </>
        )}

        {tab === "recent" && (
          <>
            {loadingGames && (
              <p className="text-muted-foreground text-sm">Loading...</p>
            )}
            {!loadingGames && games.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No games played yet.
              </p>
            )}
            {!loadingGames &&
              games.map((game) => (
                <Link
                  className="flex items-center justify-between rounded-md py-1 transition-colors"
                  href={`/puzzle/${game.puzzleId}`}
                  key={game.puzzleId}
                >
                  <p className="line-clamp-1 flex-1">{game.prompt}</p>
                  <span className="ml-2 shrink-0 text-muted-foreground">
                    {game.outcome === "solved"
                      ? `Solved in ${game.turns}`
                      : game.outcome === "revealed"
                        ? "Revealed"
                        : game.outcome === "exhausted"
                          ? "Exhausted"
                          : `${game.turns}/20`}
                  </span>
                </Link>
              ))}
          </>
        )}
      </div>

      <Button onClick={handleSignOut} variant="outline">
        Sign Out
      </Button>
    </div>
  );
}
