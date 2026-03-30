import Image from "next/image";
import { getNextPuzzle } from "~/lib/puzzles";
import { PuzzleGame } from "./_components/puzzle-game";

export default async function Home() {
  const puzzle = await getNextPuzzle();

  if (!puzzle) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <Image
          alt="A bowl of soup"
          className="w-72 dark:invert"
          height={256}
          loading="eager"
          src="/imgs/soup.png"
          unoptimized
          width={256}
        />
        <p className="text-foreground text-lg">
          You've played all the puzzles! Check back later for new ones.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      <PuzzleGame puzzle={puzzle} />
    </div>
  );
}
