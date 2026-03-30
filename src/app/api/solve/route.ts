import { generateText, Output } from "ai";
import { z } from "zod";

import { modelFlash } from "~/lib/ai";
import { createClient } from "~/lib/supabase/server";

const requestSchema = z.object({
  puzzleId: z.string(),
  guess: z.string().min(1).max(2000),
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

const solveJudgmentSchema = z.object({
  reasoning: z.string(),
  feedback: z.string(),
  judgment: z.enum(["correct", "incorrect"]),
  closeness: z.enum(["close", "off_track"]),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { puzzleId, guess, turnNumber, previousQuestions } = parsed.data;

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
    output: Output.object({ schema: solveJudgmentSchema }),
    prompt: `You are a judge for a lateral thinking puzzle game. The player is attempting to solve the puzzle by explaining what they think happened.

The full solution to the puzzle is:
"${puzzle.solution}"
${historyBlock}
The player's guess at the solution:
"${guess}"

Judge whether the player has essentially figured out the solution. They don't need to get every detail exactly right, but they must demonstrate understanding of the core insight or mechanism that makes the puzzle work.

For the "judgment" field:
- "correct" if the player has grasped the essential truth of the solution
- "incorrect" if the player is missing the key insight, even if some elements are right

For the "feedback" field, write maximum 1 sentence addressed to the player. It should sound curt. Acknowledge what parts of their guess are correct (if any), and hint at what's missing without giving away the answer. Be specific about what they got right. If nothing is right, say so gently.

For the "closeness" field:
- "close" if the player has identified significant parts of the solution correctly but is missing a key detail or has the wrong framing for an important element
- "off_track" if the player is fundamentally wrong about what happened or is missing the core mechanism entirely

First, write your internal reasoning (maximum 2 sentences) in the "reasoning" field. Then provide the feedback, judgement, and closeness.`,
  });

  if (!output) {
    return Response.json({ error: "Invalid judgment" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const endReason =
      output.judgment === "correct"
        ? "solved"
        : turnNumber >= 20
          ? "exhausted"
          : null;

    const { error: insertError } = await supabase.from("game_turns").insert({
      puzzle_id: puzzleId,
      user_id: user.id,
      turn_number: turnNumber,
      question: guess,
      judgment: output.judgment,
      is_solution_guess: true,
      reasoning: output.reasoning,
      feedback: output.feedback,
      closeness: output.closeness,
      end_reason: endReason,
    });
    if (insertError) {
      console.error("Failed to log game turn:", insertError);
    }
  }

  return Response.json(output);
}
