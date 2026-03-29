import type { Judgment } from "~/lib/judgment";

export type QuestionEntry = {
  id: number;
  question: string;
  judgment: Judgment;
  reasoning?: string;
  isSolutionGuess?: boolean;
  feedback?: string;
  closeness?: "close" | "off_track";
  revealed?: boolean;
  endReason?: "solved" | "revealed" | "exhausted";
};

export type GameState = {
  questions: QuestionEntry[];
};

export type Puzzle = {
  id: string;
  prompt: string;
  image_url: string | null;
};

export type IntroPhase = "gif" | "typewriter" | "done";
