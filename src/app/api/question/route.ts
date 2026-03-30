import { generateText, Output } from "ai";
import { z } from "zod";

import { modelFlash } from "~/lib/ai";
import { createClient } from "~/lib/supabase/server";

const requestSchema = z.object({
  puzzleId: z.string(),
  question: z.string().min(1).max(500),
  turnNumber: z.number().int().min(1).max(20),
  previousQuestions: z
    .array(
      z.object({
        question: z.string(),
        judgment: z.string(),
      }),
    )
    .optional()
    .default([]),
});

export const judgmentSchema = z.object({
  reasoning: z.string(),
  judgment: z.enum([
    "yes",
    "no",
    "not_relevant",
    "not_yes_or_no",
    "more_than_one_question",
  ]),
});

export type Judgment = z.infer<typeof judgmentSchema>["judgment"];

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { puzzleId, question, turnNumber, previousQuestions } = parsed.data;

  const supabase = await createClient();
  const { data: puzzle, error } = await supabase
    .from("puzzles")
    .select("solution")
    .eq("id", puzzleId)
    .single();

  if (error || !puzzle) {
    return Response.json({ error: "Puzzle not found" }, { status: 404 });
  }

  let historyBlock = "";
  if (previousQuestions.length > 0) {
    const lines = previousQuestions
      .map((q) => `Q: "${q.question}" → ${q.judgment}`)
      .join("\n");
    historyBlock = `\nPrevious questions and answers:\n${lines}\n`;
  }

  const { output } = await generateText({
    model: modelFlash,
    output: Output.object({ schema: judgmentSchema }),
    prompt: `You are a judge for a lateral thinking puzzle game.

The full solution to the puzzle is:
"${puzzle.solution}"
${historyBlock}
The player asked this question:
"${question}"

Judge the player's question according to these rules:
- "yes" if the answer to their question is yes based on the solution
- "no" if the answer to their question is no based on the solution
- "not_relevant" if the question is unrelated to solving the puzzle
- "not_yes_or_no" if the question was not a yes or no question (e.g. "Why did ...")
- "more_than_one_question" if they asked more than one question

Use the previous questions and answers for context to better understand what the player is asking about, but judge only the current question.

First, write your reasoning (max. 1-2 sentences) about what the correct judgment should be in the "reasoning" field. Then provide the judgment.`,
  });

  if (!output) {
    return Response.json({ error: "Invalid judgment" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { error: insertError } = await supabase.from("game_turns").insert({
      puzzle_id: puzzleId,
      user_id: user.id,
      turn_number: turnNumber,
      question,
      judgment: output.judgment,
      is_solution_guess: false,
      reasoning: output.reasoning,
      end_reason: turnNumber >= 20 ? "exhausted" : null,
    });
    if (insertError) {
      console.error("Failed to log game turn:", insertError);
    }
  }

  return Response.json(output);
}
