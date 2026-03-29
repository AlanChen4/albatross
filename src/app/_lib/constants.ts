import type { Judgment } from "~/lib/judgment";

export const MAX_QUESTIONS = 20;

const questionsLeftMessages: Record<number, string[]> = {
  20: ["false start", "enjoy it", "good luck"],
  19: ["rot begins", "one wasted", "already failing"],
  18: ["still deluded", "burning through", "illusion persists"],
  17: ["slow decline", "comfort lies", "still coasting"],
  16: ["fading gently", "worry now", "gentle decay"],
  15: ["quarter gone", "panic later", "both ends lit"],
  14: ["cracks forming", "entropy wins", "six gone"],
  13: ["bad omen", "unlucky you", "wicked incoming"],
  12: ["lights dimming", "dozen dwindling", "past casual"],
  11: ["barely above", "floor thinning", "wolves circling"],
  10: ["half wasted", "descent begins", "still optimistic?"],
  9: ["air thins", "spiral begins", "not a cat"],
  8: ["tick tock", "shrinking room", "eight fading"],
  7: ["walls closing", "luck's gone", "just seven"],
  6: ["mostly terrible", "you're desperate", "shadows lengthen"],
  5: ["circling drain", "end's visible", "five falling"],
  4: ["panic now", "almost done", "it's a train"],
  3: ["rope fraying", "not fine", "three left"],
  2: ["both wasted", "void waits", "almost over"],
  1: ["just one", "all pressure", "this is it"],
};

export function getQuestionsLeftMessage(remaining: number): string {
  const messages = questionsLeftMessages[remaining];
  if (!messages) return `${remaining} questions left`;
  const quip = messages[Math.floor(Math.random() * messages.length)];
  return `${remaining} question${remaining > 1 ? "s" : ""} left. ${quip}.`;
}

export const judgmentLabels: Record<Judgment, string> = {
  yes: "Yes",
  no: "No",
  not_relevant: "Not relevant",
  not_yes_or_no: "That's not a yes or no question",
  correct: "Correct!",
  incorrect: "Not quite",
};
