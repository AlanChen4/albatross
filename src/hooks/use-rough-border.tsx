"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import rough from "roughjs";

type Shape = "rectangle" | "ellipse";

export function useRoughBorder({
  enabled,
  shape,
  underline = true,
}: {
  enabled: boolean;
  shape: Shape;
  underline?: boolean;
}) {
  const internalRef = useRef<HTMLElement>(null);
  const seed = useRef(Math.floor(Math.random() * 2 ** 31));
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );

  const ref = useCallback(
    (node: HTMLElement | null) => {
      (internalRef as React.MutableRefObject<HTMLElement | null>).current =
        node;
      if (!enabled || !node) return;
      setSize({ width: node.offsetWidth, height: node.offsetHeight });
    },
    [enabled],
  );

  useLayoutEffect(() => {
    if (!enabled || !internalRef.current) return;

    const el = internalRef.current;
    const observer = new ResizeObserver(() => {
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      setSize((prev) => {
        if (prev && prev.width === width && prev.height === height) return prev;
        return { width, height };
      });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  const drawings = useMemo(() => {
    if (!enabled || !size || size.width === 0 || size.height === 0) return null;

    const { width, height } = size;
    const generator = rough.generator();
    const options = {
      roughness: 2,
      strokeWidth: 1.5,
      bowing: 1,
      seed: seed.current,
    };

    const padX = width * 0.15;
    const padY = height * 0.2;
    const borderDrawable =
      shape === "ellipse"
        ? generator.ellipse(
            width / 2,
            height / 2,
            width + padX,
            height + padY,
            options,
          )
        : generator.rectangle(1, 1, width - 2, height - 2, options);

    const underlineDrawable = generator.line(
      width * 0.1,
      height * 0.72,
      width * 0.9,
      height * 0.72,
      { ...options, roughness: 1.5, strokeWidth: 1.2 },
    );

    return {
      border: generator.toPaths(borderDrawable),
      underline: generator.toPaths(underlineDrawable),
    };
  }, [enabled, size, shape]);

  const svgOverlay =
    enabled && drawings && size ? (
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
        viewBox={`0 0 ${size.width} ${size.height}`}
      >
        {drawings.border.map((p) => (
          <path
            d={p.d}
            fill={p.fill === "none" ? "none" : (p.fill ?? "none")}
            key={p.d}
            stroke={p.stroke === "none" ? "none" : "currentColor"}
            strokeWidth={p.strokeWidth}
          />
        ))}
        {underline &&
          drawings.underline.map((p) => (
            <path
              className="transition-[stroke-dashoffset] duration-950 ease-out group-hover:[stroke-dashoffset:0]"
              d={p.d}
              fill="none"
              key={p.d}
              stroke="currentColor"
              strokeDasharray={size.width * 2}
              strokeDashoffset={size.width * 2}
              strokeWidth={p.strokeWidth}
            />
          ))}
      </svg>
    ) : null;

  return { ref, svgOverlay };
}
