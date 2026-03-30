"use client";

import { Check, Globe, Link2, Lock, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useRoughBorder } from "~/hooks/use-rough-border";
import { useUser } from "~/hooks/use-user";
import { isValidTitle, TITLE_VALIDATION_ERROR, titleToSlug } from "~/lib/slug";
import { createClient } from "~/lib/supabase/client";

type MyPuzzle = {
  id: string;
  title: string;
  slug: string;
  prompt: string;
  solution: string;
  status: "draft" | "published";
  created_at: string;
  like_count: number;
};

function PuzzleRow({
  puzzle,
  index,
  onToggleStatus,
  onCopyLink,
  onDelete,
  onSave,
}: {
  puzzle: MyPuzzle;
  index: number;
  onToggleStatus: (puzzle: MyPuzzle) => void;
  onCopyLink: (puzzle: MyPuzzle) => void;
  onDelete: (puzzle: MyPuzzle) => void;
  onSave: (
    puzzle: MyPuzzle,
    title: string,
    prompt: string,
    solution: string,
  ) => Promise<void>;
}) {
  const { ref, svgOverlay } = useRoughBorder({
    enabled: true,
    shape: "rectangle",
    underline: false,
  });
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(puzzle.title);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState(puzzle.prompt);
  const [editSolution, setEditSolution] = useState(puzzle.solution);
  const [saving, setSaving] = useState(false);

  function handleCopy() {
    onCopyLink(puzzle);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleStartEdit() {
    setEditTitle(puzzle.title);
    setTitleError(null);
    setEditPrompt(puzzle.prompt);
    setEditSolution(puzzle.solution);
    setEditing(true);
  }

  async function handleSave() {
    if (saving || !isValidTitle(editTitle)) return;
    setSaving(true);
    await onSave(puzzle, editTitle, editPrompt, editSolution);
    setSaving(false);
    setEditing(false);
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="relative p-4"
      initial={{ opacity: 0, y: 12 }}
      ref={ref}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      {svgOverlay}

      {editing ? (
        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-1 text-muted-foreground text-xs">Title</p>
            <input
              className="w-full border-none bg-transparent font-medium text-foreground text-sm outline-none placeholder:text-muted-foreground"
              maxLength={100}
              onChange={(e) => {
                const val = e.target.value;
                setEditTitle(val);
                if (val && !isValidTitle(val)) {
                  setTitleError(TITLE_VALIDATION_ERROR);
                } else {
                  setTitleError(null);
                }
              }}
              placeholder="Puzzle title..."
              value={editTitle}
            />
            {titleError && (
              <p className="mt-1 text-destructive text-xs">{titleError}</p>
            )}
          </div>
          <div>
            <p className="mb-1 text-muted-foreground text-xs">Prompt</p>
            <Textarea
              className="min-h-[60px] resize-none"
              onChange={(e) => setEditPrompt(e.target.value)}
              sketchy
              value={editPrompt}
            />
          </div>
          <div>
            <p className="mb-1 text-muted-foreground text-xs">Solution</p>
            <Textarea
              className="min-h-[60px] resize-none"
              onChange={(e) => setEditSolution(e.target.value)}
              sketchy
              value={editSolution}
            />
          </div>
          <div className="flex gap-2">
            <Button
              disabled={
                saving ||
                !editTitle.trim() ||
                !isValidTitle(editTitle) ||
                !editPrompt.trim() ||
                !editSolution.trim() ||
                (editTitle === puzzle.title &&
                  editPrompt === puzzle.prompt &&
                  editSolution === puzzle.solution)
              }
              onClick={handleSave}
              size="xs"
              sketchy
              variant="outline"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={() => setEditing(false)}
              size="xs"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="font-medium text-sm">{puzzle.title}</h3>
          <p className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-snug">
            {puzzle.prompt}
          </p>
          <div className="mt-2 flex items-center gap-2 text-muted-foreground text-xs">
            {puzzle.status === "published" ? (
              <span className="flex items-center gap-1">
                <Globe className="size-3" /> Published
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Lock className="size-3" /> Draft
              </span>
            )}
            <span>·</span>
            <span>
              {puzzle.like_count} {puzzle.like_count === 1 ? "like" : "likes"}
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={handleStartEdit} size="xs" variant="outline">
              <Pencil className="size-3" />
              Edit
            </Button>
            <Button
              onClick={() => onToggleStatus(puzzle)}
              size="xs"
              variant="outline"
            >
              {puzzle.status === "draft" ? "Publish" : "Unpublish"}
            </Button>
            <Button onClick={handleCopy} size="xs" variant="outline">
              {copied ? (
                <Check className="size-3" />
              ) : (
                <Link2 className="size-3" />
              )}
              {copied ? "Copied" : "Copy Link"}
            </Button>
            <Button
              className="ml-auto"
              onClick={() => onDelete(puzzle)}
              size="xs"
              variant="outline"
            >
              <Trash2 className="size-3" />
              Delete
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
}

export function MyPuzzlesPanel(_props: { onClose: () => void }) {
  const { user, isAnonymous } = useUser();
  const [puzzles, setPuzzles] = useState<MyPuzzle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || isAnonymous) {
      setLoading(false);
      return;
    }

    async function fetchPuzzles() {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("puzzles")
        .select(
          "id, title, slug, prompt, solution, status, created_at, puzzle_likes(count)",
        )
        .eq("created_by", user?.id)
        .order("created_at", { ascending: false });

      setPuzzles(
        (data ?? []).map(
          (p: {
            id: string;
            title: string;
            slug: string;
            prompt: string;
            solution: string;
            status: string;
            created_at: string;
            puzzle_likes: { count: number }[];
          }) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            prompt: p.prompt,
            solution: p.solution,
            status: p.status as "draft" | "published",
            created_at: p.created_at,
            like_count: p.puzzle_likes[0]?.count ?? 0,
          }),
        ),
      );
      setLoading(false);
    }

    fetchPuzzles();
  }, [user, isAnonymous]);

  async function handleToggleStatus(puzzle: MyPuzzle) {
    const newStatus = puzzle.status === "draft" ? "published" : "draft";
    const supabase = createClient();
    const { error } = await supabase
      .from("puzzles")
      .update({ status: newStatus })
      .eq("id", puzzle.id);

    if (!error) {
      setPuzzles((prev) =>
        prev.map((p) => (p.id === puzzle.id ? { ...p, status: newStatus } : p)),
      );
    }
  }

  async function handleSave(
    puzzle: MyPuzzle,
    title: string,
    prompt: string,
    solution: string,
  ) {
    const supabase = createClient();
    const baseSlug = titleToSlug(title);

    for (let attempt = 0; attempt < 5; attempt++) {
      const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
      const { error } = await supabase
        .from("puzzles")
        .update({ title: title.trim(), slug, prompt, solution })
        .eq("id", puzzle.id);

      if (!error) {
        setPuzzles((prev) =>
          prev.map((p) =>
            p.id === puzzle.id
              ? { ...p, title: title.trim(), slug, prompt, solution }
              : p,
          ),
        );
        return;
      }
      if (error.code !== "23505") return;
    }
  }

  function handleCopyLink(puzzle: MyPuzzle) {
    const url = `${window.location.origin}/puzzle/${puzzle.slug}`;
    navigator.clipboard.writeText(url);
  }

  async function handleDelete(puzzle: MyPuzzle) {
    const confirmed = confirm(
      `Delete "${puzzle.title}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("puzzles")
      .delete()
      .eq("id", puzzle.id);

    if (!error) {
      setPuzzles((prev) => prev.filter((p) => p.id !== puzzle.id));
    }
  }

  if (isAnonymous) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        Sign in to see your puzzles.
      </p>
    );
  }

  if (loading) {
    return (
      <p className="text-muted-foreground text-xs">Loading your puzzles...</p>
    );
  }

  if (puzzles.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        You haven't created any puzzles yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {puzzles.map((puzzle, i) => (
        <PuzzleRow
          index={i}
          key={puzzle.id}
          onCopyLink={handleCopyLink}
          onDelete={handleDelete}
          onSave={handleSave}
          onToggleStatus={handleToggleStatus}
          puzzle={puzzle}
        />
      ))}
    </div>
  );
}
