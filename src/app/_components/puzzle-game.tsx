"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getQuestionsLeftMessage, MAX_QUESTIONS } from "~/app/_lib/constants";
import type { IntroPhase, Puzzle } from "~/app/_lib/types";
import { TopBar } from "~/components/top-bar";
import { Button } from "~/components/ui/button";
import { useEnsureSession } from "~/hooks/use-ensure-session";
import { useGameState } from "~/hooks/use-game-state";
import { useTransferProgress } from "~/hooks/use-transfer-progress";
import { useTypewriter } from "~/hooks/use-typewriter";
import type { Judgment } from "~/lib/judgment";
import { createClient } from "~/lib/supabase/client";
import { cn } from "~/lib/utils";
import { GameOver } from "./game-over";
import { PuzzleIntro } from "./puzzle-intro";
import { QuestionForm } from "./question-form";

export function PuzzleGame({ puzzle }: { puzzle: Puzzle }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { gameState, setGameState, mounted, hasExistingQuestions } =
    useGameState(puzzle.id, refreshKey);
  const [introPhase, setIntroPhase] = useState<IntroPhase>("gif");
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [guessMode, setGuessMode] = useState(false);

  const ensureSession = useEnsureSession();
  useTransferProgress(useCallback(() => setRefreshKey((k) => k + 1), []));

  const isSolved = gameState.questions.some((q) => q.judgment === "correct");
  const isRevealed = gameState.questions.some((q) => q.revealed);
  const questionsLeft = MAX_QUESTIONS - gameState.questions.length;
  const isGameOver =
    gameState.questions.length >= MAX_QUESTIONS || isSolved || isRevealed;
  const endReason = isSolved
    ? "solved"
    : isRevealed
      ? "revealed"
      : ("exhausted" as const);

  const counterText = useMemo(
    () => getQuestionsLeftMessage(questionsLeft),
    [questionsLeft],
  );

  const { displayedText: guessesLeftDisplay } = useTypewriter({
    text: counterText,
    enabled: introPhase === "done" && !isGameOver,
    speed: 40,
    initialDelay: 200,
  });

  const fetchSolution = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("puzzles")
        .select("solution")
        .eq("id", puzzle.id)
        .single();
      if (data?.solution) setSolution(data.solution);
    } catch {}
  }, [puzzle.id]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs only on mount
  useEffect(() => {
    if (!mounted) return;
    if (hasExistingQuestions) {
      setIntroPhase("done");
    } else if (!puzzle.image_url) {
      setIntroPhase("typewriter");
    }
    if (
      gameState.questions.length >= MAX_QUESTIONS ||
      gameState.questions.some((q) => q.judgment === "correct") ||
      gameState.questions.some((q) => q.revealed)
    ) {
      fetchSolution();
    }
  }, [mounted]);

  const skipIntro = useCallback(() => {
    if (introPhase !== "done") {
      setIntroPhase("done");
    }
  }, [introPhase]);

  useEffect(() => {
    if (introPhase === "done") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        skipIntro();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [introPhase, skipIntro]);

  const handleSubmit = useCallback(
    async (question: string) => {
      if (loading || isGameOver) return;

      setLoading(true);

      // Create anonymous session on first interaction if not logged in
      await ensureSession();

      const isSolveAttempt = guessMode;
      let judgment: Judgment = isSolveAttempt ? "incorrect" : "no";
      let reasoning: string | undefined;
      let feedback: string | undefined;
      let closeness: "close" | "off_track" | undefined;

      try {
        const endpoint = isSolveAttempt ? "/api/solve" : "/api/question";
        const turnNumber = gameState.questions.length + 1;
        const body = isSolveAttempt
          ? { puzzleId: puzzle.id, guess: question, turnNumber }
          : { puzzleId: puzzle.id, question, turnNumber };
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...body,
            previousQuestions: gameState.questions.map(
              ({ question, judgment }) => ({
                question,
                judgment,
              }),
            ),
          }),
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        judgment = data.judgment;
        reasoning = data.reasoning;
        if (isSolveAttempt) {
          feedback = data.feedback;
          closeness = data.closeness;
        }
      } catch {
        // Fall through with default judgment
      }

      const newQuestions = [
        ...gameState.questions,
        {
          id: Date.now(),
          question,
          judgment,
          reasoning,
          ...(isSolveAttempt && { isSolutionGuess: true }),
          ...(feedback && { feedback }),
          ...(closeness && { closeness }),
        },
      ];
      setGameState({ questions: newQuestions });
      setLoading(false);
      setGuessMode(false);

      if (newQuestions.length >= MAX_QUESTIONS || judgment === "correct") {
        fetchSolution();
      }
    },
    [
      loading,
      isGameOver,
      guessMode,
      gameState.questions,
      puzzle.id,
      setGameState,
      fetchSolution,
      ensureSession,
    ],
  );

  const handleReveal = useCallback(async () => {
    const closeEntry = gameState.questions.findLast(
      (q) => q.isSolutionGuess && q.closeness === "close",
    );
    if (!closeEntry) return;

    setLoading(true);
    try {
      const supabase = createClient();
      await supabase
        .from("game_turns")
        .update({ revealed: true, end_reason: "revealed" })
        .eq("id", closeEntry.id);

      setGameState({
        questions: gameState.questions.map((q) =>
          q.id === closeEntry.id
            ? { ...q, revealed: true, endReason: "revealed" as const }
            : q,
        ),
      });
      await fetchSolution();
    } catch {}
    setLoading(false);
  }, [gameState.questions, setGameState, fetchSolution]);

  if (!mounted) {
    return (
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center p-8" />
    );
  }

  const isIntro = introPhase !== "done";

  return (
    <main className="relative flex min-h-0 flex-1 flex-col items-center px-4 pt-4 pb-4 md:pt-10">
      <AnimatePresence>
        {isIntro && (
          <motion.button
            animate={{ opacity: 1 }}
            className="absolute top-4 text-muted-foreground text-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={skipIntro}
            transition={{ duration: 0.3 }}
            type="button"
          >
            <span className="hidden md:inline">
              press tab or click here to skip
            </span>
            <span className="md:hidden">tap here to skip</span>
          </motion.button>
        )}
      </AnimatePresence>
      {!isIntro && !guessMode && <TopBar puzzleId={puzzle.id} />}
      <div
        className={cn(
          "flex w-full max-w-md flex-col items-center",
          !isIntro && "flex-1",
        )}
      >
        <PuzzleIntro
          guessMode={guessMode}
          imageUrl={puzzle.image_url}
          introPhase={introPhase}
          onPhaseChange={setIntroPhase}
          prompt={puzzle.prompt}
        />

        {introPhase === "done" && (
          <motion.div
            animate={{ opacity: 1 }}
            className="w-full flex-1"
            initial={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {isGameOver && solution && (
              <GameOver endReason={endReason} solution={solution} />
            )}

            {!isGameOver && (
              <QuestionForm
                disabled={isGameOver}
                guessMode={guessMode}
                lastEntry={gameState.questions[gameState.questions.length - 1]}
                loading={loading}
                onReveal={handleReveal}
                onSubmit={handleSubmit}
              />
            )}
          </motion.div>
        )}
      </div>
      {!isGameOver && introPhase === "done" && (
        <motion.div
          animate={{ opacity: 1 }}
          className="w-full max-w-md pt-4 pb-2 md:px-0"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <span className="text-muted-foreground">{guessesLeftDisplay}</span>
            {gameState.questions.length > 0 && (
              <Button
                className="mx-4 px-2"
                disabled={loading}
                onClick={() => setGuessMode(!guessMode)}
                rounded={"full"}
                size="sm"
                sketchy
                variant={"outline"}
              >
                {guessMode ? "never mind" : "Think you know? Guess now..."}
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </main>
  );
}
