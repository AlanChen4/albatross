"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useEffect } from "react";
import type { IntroPhase } from "~/app/_lib/types";
import { useTypewriter } from "~/hooks/use-typewriter";
import { cn } from "~/lib/utils";

type PuzzleIntroProps = {
  imageUrl: string | null;
  prompt: string;
  introPhase: IntroPhase;
  onPhaseChange: (phase: IntroPhase) => void;
  guessMode?: boolean;
};

export function PuzzleIntro({
  imageUrl,
  prompt,
  introPhase,
  onPhaseChange,
  guessMode,
}: PuzzleIntroProps) {
  const { displayedText, isComplete: typewriterComplete } = useTypewriter({
    text: prompt,
    enabled: introPhase === "typewriter",
  });

  useEffect(() => {
    if (introPhase === "gif") {
      const timer = setTimeout(() => onPhaseChange("typewriter"), 1000);
      return () => clearTimeout(timer);
    }
  }, [introPhase, onPhaseChange]);

  useEffect(() => {
    if (typewriterComplete && introPhase === "typewriter") {
      const timer = setTimeout(() => onPhaseChange("done"), 400);
      return () => clearTimeout(timer);
    }
  }, [typewriterComplete, introPhase, onPhaseChange]);

  return (
    <>
      {imageUrl && (
        <motion.div
          animate={{ opacity: guessMode ? 0 : 1 }}
          className="relative mt-16 mb-3 h-24 w-24 self-center md:mt-0 md:h-32 md:w-32"
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Image
            alt=""
            className="rounded-lg object-cover dark:invert"
            fill
            priority
            sizes="256px"
            src={imageUrl}
            unoptimized
          />
        </motion.div>
      )}

      {introPhase !== "gif" && (
        <motion.p
          animate={{
            opacity: 1,
            fontSize: guessMode ? "1.15em" : "1em",
          }}
          className={cn(
            "mb-4 w-full text-foreground",
            !imageUrl && "mt-16 md:mt-24",
          )}
          initial={{ opacity: 0, fontSize: "1em" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {introPhase !== "done" ? (
            <>
              {displayedText}
              <span className="text-transparent">
                {prompt.slice(displayedText.length)}
              </span>
            </>
          ) : (
            prompt
          )}
        </motion.p>
      )}
    </>
  );
}
