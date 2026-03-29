import { useTypewriter } from "~/hooks/use-typewriter";

type GameOverProps = {
  solution: string;
  endReason: "solved" | "revealed" | "exhausted";
};

const headerText = {
  solved: "You got it!",
  revealed: "The answer:",
  exhausted: "Out of questions. The answer:",
} as const;

export function GameOver({ solution, endReason }: GameOverProps) {
  const { displayedText } = useTypewriter({
    text: solution,
    enabled: true,
    speed: 40,
    initialDelay: 200,
  });

  return (
    <div className="mb-4 w-full text-left">
      <p className="mb-2 text-muted-foreground">{headerText[endReason]}</p>
      <p className="text-foreground">{displayedText}</p>
    </div>
  );
}
