"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { judgmentLabels } from "~/app/_lib/constants";
import type { QuestionEntry } from "~/app/_lib/types";
import { Button } from "~/components/ui/button";
import { env } from "~/env";
import { useTypewriter } from "~/hooks/use-typewriter";
import { cn } from "~/lib/utils";

type QuestionFormProps = {
  onSubmit: (question: string) => void;
  onReveal?: () => void;
  loading: boolean;
  disabled: boolean;
  lastEntry?: QuestionEntry;
  guessMode?: boolean;
};

export function QuestionForm({
  onSubmit,
  onReveal,
  loading,
  disabled,
  lastEntry,
  guessMode,
}: QuestionFormProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [animatingAnswer, setAnimatingAnswer] = useState(false);
  const prevEntryCount = useRef(lastEntry ? 1 : 0);

  // Detect when a new answer arrives
  const entryCount = lastEntry ? (lastEntry.id ?? 0) : 0;
  if (entryCount !== prevEntryCount.current) {
    prevEntryCount.current = entryCount;
    if (lastEntry) {
      setAnimatingAnswer(true);
    }
  }

  const handleAnimationComplete = useCallback(() => {
    setAnimatingAnswer(false);
  }, []);

  const answerText = lastEntry
    ? lastEntry.isSolutionGuess && lastEntry.feedback
      ? `\u2014 ${lastEntry.feedback}`
      : `\u2014 ${judgmentLabels[lastEntry.judgment]}${env.NEXT_PUBLIC_NODE_ENV === "development" && lastEntry.reasoning ? ` (${lastEntry.reasoning})` : ""}`
    : "";

  const { displayedText: typedAnswer } = useTypewriter({
    text: answerText,
    enabled: animatingAnswer,
    speed: 40,
    initialDelay: 200,
    onComplete: handleAnimationComplete,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading || disabled) return;
    setPendingQuestion(question);
    setInput("");
    onSubmit(question);
  }

  const { displayedText: guessModeplaceholder } = useTypewriter({
    text: "What do you think happened?",
    enabled: !!guessMode,
    speed: 40,
    initialDelay: 0,
  });

  const showAnswer = !loading && lastEntry && !input;
  const placeholder = loading
    ? pendingQuestion
    : guessMode
      ? guessModeplaceholder
      : lastEntry
        ? lastEntry.question
        : "Yes or no questions only...";

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const wasEmpty = !el.value;
    if (wasEmpty) el.value = el.placeholder;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
    if (wasEmpty) el.value = "";
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: resize must re-run when input or placeholder changes
  useEffect(() => {
    resize();
  }, [input, placeholder, resize]);

  return (
    <div className={cn("w-full", guessMode ? "pt-4" : "pt-0")}>
      <motion.form
        animate={{ fontSize: guessMode ? "1.15em" : "1em" }}
        onSubmit={handleSubmit}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <textarea
          className="w-full resize-none overflow-hidden bg-transparent text-foreground placeholder:text-muted-foreground placeholder:opacity-50 focus:outline-none disabled:opacity-50"
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={placeholder}
          ref={textareaRef}
          rows={1}
          value={input}
        />
      </motion.form>
      <AnimatePresence>
        {loading && (
          <motion.div
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              alt="Loading..."
              className="animation-duration-[5s] animate-spin"
              height={32}
              src="/imgs/spinner.webp"
              width={32}
            />
          </motion.div>
        )}
        {showAnswer && !guessMode && (
          <motion.p
            animate={{ opacity: 1 }}
            className="text-foreground"
            exit={{ opacity: 0 }}
            initial={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {animatingAnswer ? typedAnswer : answerText}
          </motion.p>
        )}
      </AnimatePresence>
      {showAnswer &&
        !guessMode &&
        !animatingAnswer &&
        lastEntry?.isSolutionGuess &&
        lastEntry.closeness === "close" &&
        onReveal && (
          <motion.div
            animate={{ opacity: 1 }}
            className="mt-3"
            initial={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              disabled={loading}
              onClick={onReveal}
              rounded="full"
              size="sm"
              sketchy
              variant="outline"
            >
              give up and reveal?
            </Button>
          </motion.div>
        )}
    </div>
  );
}
