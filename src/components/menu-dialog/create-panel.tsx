"use client";

import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useRoughBorder } from "~/hooks/use-rough-border";
import { useTypewriter } from "~/hooks/use-typewriter";
import { useUser } from "~/hooks/use-user";
import { isValidTitle, TITLE_VALIDATION_ERROR, titleToSlug } from "~/lib/slug";
import { createClient } from "~/lib/supabase/client";

type GeneratedPuzzle = {
  prompt: string;
  solution: string;
};

type SavedPuzzle = GeneratedPuzzle & {
  id: string;
};

export function CreatePanel({ onClose }: { onClose: () => void }) {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [storyDetails, setStoryDetails] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generated, setGenerated] = useState<GeneratedPuzzle | null>(null);
  const [saved, setSaved] = useState<SavedPuzzle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { ref: roughRef, svgOverlay } = useRoughBorder({
    enabled: true,
    shape: "rectangle",
    underline: false,
  });
  const { ref: titleRef, svgOverlay: titleOverlay } = useRoughBorder({
    enabled: true,
    shape: "rectangle",
    underline: false,
  });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleGenerate() {
    if (!storyDetails.trim() || generating) return;
    setGenerating(true);
    setError(null);
    setGenerated(null);
    setSaved(null);

    try {
      const res = await fetch("/api/create-puzzle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyDetails }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate puzzle");
      }
      const data: GeneratedPuzzle = await res.json();
      setGenerated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!generated || !user || saving) return;
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      let imageUrl: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split(".").pop() || "png";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("puzzle-images")
          .upload(path, imageFile);
        if (uploadError) throw new Error("Failed to upload image");
        const {
          data: { publicUrl },
        } = supabase.storage.from("puzzle-images").getPublicUrl(path);
        imageUrl = publicUrl;
      }

      let slug = titleToSlug(title);
      let insertError: { code?: string } | null = null;
      let data: { id: string } | null = null;

      for (let attempt = 0; attempt < 5; attempt++) {
        const candidateSlug = attempt === 0 ? slug : `${slug}-${attempt + 1}`;
        const result = await supabase
          .from("puzzles")
          .insert({
            title: title.trim(),
            slug: candidateSlug,
            prompt: generated.prompt,
            solution: generated.solution,
            image_url: imageUrl,
            source: "user",
            created_by: user.id,
            status: "draft",
          })
          .select("id")
          .single();

        if (!result.error) {
          data = result.data;
          slug = candidateSlug;
          insertError = null;
          break;
        }
        if (result.error.code !== "23505") {
          insertError = result.error;
          break;
        }
      }

      if (insertError || !data) throw new Error("Failed to save puzzle");
      setSaved({ ...generated, id: data.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!saved || saving) return;
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("puzzles")
        .update({ status: "published" })
        .eq("id", saved.id);
      if (updateError) throw new Error("Failed to publish puzzle");
      onClose();
      resetState();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function resetState() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setTitle("");
    setTitleError(null);
    setStoryDetails("");
    setImageFile(null);
    setImagePreview(null);
    setGenerated(null);
    setSaved(null);
    setError(null);
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {!generated && !saved && (
        <>
          <div>
            <div className="relative w-full">
              <input
                className="w-full border-transparent bg-transparent px-3 py-2 font-medium text-foreground text-sm shadow-none outline-none placeholder:text-muted-foreground"
                disabled={generating}
                maxLength={100}
                onChange={(e) => {
                  const val = e.target.value;
                  setTitle(val);
                  if (val && !isValidTitle(val)) {
                    setTitleError(TITLE_VALIDATION_ERROR);
                  } else {
                    setTitleError(null);
                  }
                }}
                placeholder="Puzzle title..."
                ref={titleRef as React.Ref<HTMLInputElement>}
                value={title}
              />
              {titleOverlay}
            </div>
            {titleError && (
              <p className="mt-1 text-destructive text-xs">{titleError}</p>
            )}
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-4">
            <Textarea
              className="h-full min-h-0 resize-none"
              disabled={generating}
              onChange={(e) => setStoryDetails(e.target.value)}
              placeholder="Describe the story or scenario for your puzzle..."
              sketchy
              value={storyDetails}
            />

            <div className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs">
                Image (optional)
              </span>
              <input
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
                disabled={generating}
                id="puzzle-image"
                onChange={handleImageChange}
                ref={fileInputRef}
                type="file"
              />
              <button
                className="relative flex h-[124px] w-[124px] cursor-pointer items-center justify-center overflow-hidden border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                disabled={generating}
                onClick={() => fileInputRef.current?.click()}
                ref={roughRef as React.Ref<HTMLButtonElement>}
                type="button"
              >
                {svgOverlay}
                {imagePreview ? (
                  <>
                    {/* biome-ignore lint/performance/noImgElement: blob URL preview, not optimizable */}
                    <img
                      alt="Preview"
                      className="h-full w-full object-contain"
                      src={imagePreview}
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                      <span className="text-white text-xs">Change</span>
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground text-xs">
                    Click to upload
                  </span>
                )}
              </button>
            </div>
          </div>

          <Button
            className="mt-auto"
            disabled={
              storyDetails.trim().length < 10 ||
              !title.trim() ||
              !isValidTitle(title) ||
              generating
            }
            onClick={handleGenerate}
            sketchy
            variant="outline"
          >
            {generating ? "Generating..." : "Generate Puzzle"}
          </Button>
        </>
      )}

      {generated && !saved && (
        <>
          <div>
            <p className="mb-1 font-medium text-muted-foreground">
              Prompt (what players see)
            </p>
            <p className="text-sm">{generated.prompt}</p>
          </div>
          <SolutionReveal solution={generated.solution} />
          <div className="mt-auto flex gap-2">
            <Button
              className="flex-1"
              onClick={() => {
                setGenerated(null);
              }}
              variant="ghost"
            >
              Go Back
            </Button>
            <Button
              className="flex-1"
              disabled={saving}
              onClick={handleSave}
              sketchy
              variant="outline"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </>
      )}

      {saved && (
        <>
          <p className="text-sm">
            Puzzle saved as draft. Publish it to make it available for everyone
            to play.
          </p>
          <div className="mt-auto flex gap-2">
            <Button className="flex-1" onClick={onClose} variant="outline">
              Keep as Draft
            </Button>
            <Button
              className="flex-1"
              disabled={saving}
              onClick={handlePublish}
              sketchy
              variant="outline"
            >
              {saving ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </>
      )}

      {error && <p className="text-destructive">{error}</p>}
    </div>
  );
}

function SolutionReveal({ solution }: { solution: string }) {
  const [revealed, setRevealed] = useState(false);
  const { displayedText } = useTypewriter({
    text: solution,
    enabled: revealed,
    speed: 20,
    initialDelay: 0,
  });

  return (
    <div>
      <p className="mb-1 font-medium text-muted-foreground">Solution</p>
      {!revealed ? (
        <button
          className="text-muted-foreground text-sm underline hover:text-foreground"
          onClick={() => setRevealed(true)}
          type="button"
        >
          Show solution
        </button>
      ) : (
        <p className="text-sm">{displayedText}</p>
      )}
    </div>
  );
}
