import { getTodaysPuzzle } from "~/lib/puzzles";
import { PuzzleGame } from "./_components/puzzle-game";

export default async function Home() {
  const puzzle = await getTodaysPuzzle();
  return <PuzzleGame puzzle={puzzle} />;
}
