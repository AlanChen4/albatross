"use client";

import { useEffect, useRef, useState } from "react";

type TypewriterOptions = {
  text: string;
  enabled: boolean;
  speed?: number;
  pauseDuration?: number;
  initialDelay?: number;
  onComplete?: () => void;
};

export function useTypewriter({
  text,
  enabled,
  speed = 40,
  pauseDuration = 400,
  initialDelay = 600,
  onComplete,
}: TypewriterOptions): { displayedText: string; isComplete: boolean } {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!enabled) return;

    setDisplayedText("");
    setIsComplete(false);

    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;

    function tick() {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        setIsComplete(true);
        onCompleteRef.current?.();
        return;
      }
      const delay = text[i - 1] === "." ? pauseDuration : speed;
      timeout = setTimeout(tick, delay);
    }

    timeout = setTimeout(tick, initialDelay);

    return () => clearTimeout(timeout);
  }, [text, enabled, speed, pauseDuration, initialDelay]);

  return { displayedText, isComplete };
}
