"use client";

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import type { GameState, QuestionEntry } from "~/app/_lib/types";
import type { Judgment } from "~/lib/judgment";
import { createClient } from "~/lib/supabase/client";

export function useGameState(
  puzzleId: string,
  refreshKey = 0,
): {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  mounted: boolean;
  hasExistingQuestions: boolean;
} {
  const [gameState, setGameState] = useState<GameState>({ questions: [] });
  const [mounted, setMounted] = useState(false);
  const [hasExistingQuestions, setHasExistingQuestions] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey triggers a re-fetch after anonymous progress transfer
  useEffect(() => {
    async function loadFromDB() {
      const supabase = createClient();
      const { data } = await supabase
        .from("game_turns")
        .select(
          "id, question, judgment, reasoning, is_solution_guess, turn_number, feedback, closeness, revealed, end_reason",
        )
        .eq("puzzle_id", puzzleId)
        .order("turn_number", { ascending: true });

      if (data && data.length > 0) {
        const questions: QuestionEntry[] = data.map(
          (row: {
            id: number;
            question: string;
            judgment: string;
            reasoning: string | null;
            is_solution_guess: boolean;
            feedback: string | null;
            closeness: string | null;
            revealed: boolean;
            end_reason: string | null;
          }) => ({
            id: row.id,
            question: row.question,
            judgment: row.judgment as Judgment,
            reasoning: row.reasoning ?? undefined,
            ...(row.is_solution_guess && { isSolutionGuess: true }),
            feedback: row.feedback ?? undefined,
            closeness: (row.closeness as "close" | "off_track") ?? undefined,
            revealed: row.revealed || undefined,
            endReason:
              (row.end_reason as "solved" | "revealed" | "exhausted") ??
              undefined,
          }),
        );
        setGameState({ questions });
        setHasExistingQuestions(true);
      }
      setMounted(true);
    }
    loadFromDB();
  }, [puzzleId, refreshKey]);

  return { gameState, setGameState, mounted, hasExistingQuestions };
}
