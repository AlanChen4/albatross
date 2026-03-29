import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.\n" +
    "Set them in .env.local or pass as environment variables.",
  );
  process.exit(1);
}

type PuzzleInput = {
  prompt: string;
  solution: string;
  source_url?: string;
  image_url?: string;
};

function contentHash(prompt: string, solution: string): string {
  const normalized = `${prompt.trim().toLowerCase()}||${solution.trim().toLowerCase()}`;
  return createHash("md5").update(normalized).digest("hex");
}

function validate(puzzle: unknown, index: number): puzzle is PuzzleInput {
  if (typeof puzzle !== "object" || puzzle === null) {
    console.warn(`  [${index}] skipped: not an object`);
    return false;
  }
  const p = puzzle as Record<string, unknown>;
  if (typeof p.prompt !== "string" || p.prompt.trim().length === 0) {
    console.warn(`  [${index}] skipped: missing or empty prompt`);
    return false;
  }
  if (typeof p.solution !== "string" || p.solution.trim().length === 0) {
    console.warn(`  [${index}] skipped: missing or empty solution`);
    return false;
  }
  return true;
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: pnpm import-puzzles <file.json>");
    process.exit(1);
  }

  const raw = await readFile(filePath, "utf-8");
  const puzzles: unknown[] = JSON.parse(raw);

  if (!Array.isArray(puzzles)) {
    console.error("JSON file must contain an array of puzzles.");
    process.exit(1);
  }

  console.log(`Found ${puzzles.length} puzzle(s) in ${filePath}`);

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  let inserted = 0;
  let skipped = 0;
  let invalid = 0;

  for (let i = 0; i < puzzles.length; i++) {
    const entry = puzzles[i];
    if (!validate(entry, i)) {
      invalid++;
      continue;
    }

    const hash = contentHash(entry.prompt, entry.solution);

    const { error } = await supabase.from("puzzles").insert({
      prompt: entry.prompt.trim(),
      solution: entry.solution.trim(),
      image_url: entry.image_url?.trim() || null,
      source: "import",
      source_url: entry.source_url?.trim() || null,
      status: "published",
      content_hash: hash,
    });

    if (error) {
      if (error.code === "23505") {
        // Unique violation on content_hash — duplicate
        skipped++;
      } else {
        console.warn(`  [${i}] insert error: ${error.message}`);
        skipped++;
      }
    } else {
      inserted++;
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped (duplicate), ${invalid} invalid`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
