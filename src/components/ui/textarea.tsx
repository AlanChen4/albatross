"use client";

import type * as React from "react";
import { useRoughBorder } from "~/hooks/use-rough-border";
import { cn } from "~/lib/utils";

function Textarea({
  className,
  sketchy = false,
  ...props
}: React.ComponentProps<"textarea"> & { sketchy?: boolean }) {
  const { ref, svgOverlay } = useRoughBorder({
    enabled: !!sketchy,
    shape: "rectangle",
    underline: false,
  });

  const baseClass = cn(
    "flex min-h-[60px] w-full bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
    sketchy
      ? "border-transparent shadow-none focus:outline-none"
      : "rounded-md border shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
    className,
  );

  if (sketchy) {
    return (
      <div className="relative h-full w-full">
        <textarea
          className={baseClass}
          ref={ref as React.Ref<HTMLTextAreaElement>}
          {...props}
        />
        {svgOverlay}
      </div>
    );
  }

  return <textarea className={baseClass} {...props} />;
}

export { Textarea };
