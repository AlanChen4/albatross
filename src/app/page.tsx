import Image from "next/image";
import { getTodaysPuzzle } from "~/lib/puzzles";
import { PuzzleGame } from "./_components/puzzle-game";

export default async function Home() {
  const puzzle = await getTodaysPuzzle();

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
          No puzzle today. Check back tomorrow!
        </p>
      </div>
    );
  }

  return <PuzzleGame puzzle={puzzle} />;
}
