"use client";

import { Library, PenLine, UserCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { BrowsePanel } from "./menu-dialog/browse-panel";
import { CreatePanel } from "./menu-dialog/create-panel";
import { MyPuzzlesPanel } from "./menu-dialog/my-puzzles-panel";
import { ProfilePanel } from "./menu-dialog/profile-panel";

export type MenuTab = "browse" | "create" | "my-puzzles" | "profile";

function BrowseIcon({ className }: { className?: string }) {
  return (
    <Image
      alt=""
      aria-hidden
      className={className}
      height={16}
      src="/imgs/magnifying-glass.webp"
      width={16}
    />
  );
}

const tabs = [
  { id: "browse" as const, label: "Browse", icon: BrowseIcon },
  { id: "create" as const, label: "Create", icon: PenLine },
  { id: "my-puzzles" as const, label: "My Puzzles", icon: Library },
  { id: "profile" as const, label: "Profile", icon: UserCircle },
];

function RoughDivider() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { height, width } = canvas.getBoundingClientRect();
    canvas.height = height;
    canvas.width = width;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const rc = rough.canvas(canvas);
    rc.line(width / 2, 0, width / 2, height, {
      roughness: 1.2,
      stroke: "oklch(0.4 0 0)",
      strokeWidth: 1.5,
    });
  }, []);

  return (
    <canvas
      aria-hidden
      className="hidden h-4/5 w-3 shrink-0 self-center sm:block"
      ref={canvasRef}
    />
  );
}

function RoughUnderline() {
  const spanRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const span = spanRef.current;
    const canvas = canvasRef.current;
    if (!span || !canvas) return;
    const w = span.getBoundingClientRect().width;
    canvas.width = w;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, canvas.height);
    const foreground = getComputedStyle(span)
      .getPropertyValue("--color-foreground")
      .trim();
    const rc = rough.canvas(canvas);
    rc.line(2, canvas.height / 2, w - 2, canvas.height / 2, {
      roughness: 1.8,
      stroke: foreground,
      strokeWidth: 1.5,
    });
  }, []);

  return (
    <span aria-hidden className="absolute inset-x-0 bottom-0 h-2" ref={spanRef}>
      <canvas height={8} ref={canvasRef} />
    </span>
  );
}

export function MenuDialog({
  open,
  onOpenChange,
  initialTab = "browse",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: MenuTab;
}) {
  const [activeTab, setActiveTab] = useState<MenuTab>(initialTab);
  const openCountRef = useRef(0);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      openCountRef.current += 1;
    }
  }, [open, initialTab]);

  function handleClose() {
    onOpenChange(false);
  }

  const sessionKey = openCountRef.current;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="max-h-[80dvh] overflow-hidden p-0 sm:max-w-2xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Menu</DialogTitle>
        <DialogDescription className="sr-only">
          Browse puzzles, create a puzzle, or view your profile
        </DialogDescription>

        <div className="flex h-[70dvh] sm:h-[60dvh]">
          {/* Desktop sidebar */}
          <nav className="hidden w-44 shrink-0 flex-col justify-between p-4 sm:flex">
            <div className="flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                    activeTab === tab.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                >
                  <tab.icon className="size-4" />
                  {tab.label}
                  {activeTab === tab.id && <RoughUnderline />}
                </button>
              ))}
            </div>
            <a
              className="px-3 text-muted-foreground hover:text-foreground"
              href="https://x.com/justmaler"
              rel="noopener noreferrer"
              target="_blank"
            >
              made with delight, <br></br>—maler
            </a>
          </nav>

          <RoughDivider />

          {/* Mobile tab bar */}
          <div className="absolute inset-x-0 top-0 z-10 flex border-b bg-background sm:hidden">
            {tabs.map((tab) => (
              <button
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
                  activeTab === tab.id
                    ? "border-foreground border-b-2 text-foreground"
                    : "text-muted-foreground",
                )}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <tab.icon className="size-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto pt-16 sm:pt-0">
            <div className="flex min-h-full flex-col p-6">
              {activeTab === "browse" && (
                <BrowsePanel
                  key={`browse-${sessionKey}`}
                  onClose={handleClose}
                />
              )}
              {activeTab === "create" && (
                <CreatePanel
                  key={`create-${sessionKey}`}
                  onClose={handleClose}
                />
              )}
              {activeTab === "my-puzzles" && (
                <MyPuzzlesPanel
                  key={`my-puzzles-${sessionKey}`}
                  onClose={handleClose}
                />
              )}
              {activeTab === "profile" && (
                <ProfilePanel key={`profile-${sessionKey}`} />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
