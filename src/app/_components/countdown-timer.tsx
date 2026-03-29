"use client";

import { useEffect, useState } from "react";

function getTimeUntilMidnightET() {
  const now = new Date();
  // Get the current Eastern date parts
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);

  // Get the Eastern offset to convert Eastern midnight to a UTC instant
  const utcStr = now.toLocaleString("en-US", { timeZone: "UTC" });
  const etStr = now.toLocaleString("en-US", { timeZone: "America/New_York" });
  const offsetMs = new Date(utcStr).getTime() - new Date(etStr).getTime();

  // Midnight ET in UTC = midnight local date components + Eastern offset
  const midnightETasUTC = new Date(
    Date.UTC(year, month - 1, day + 1) + offsetMs,
  );

  return Math.max(
    0,
    Math.floor((midnightETasUTC.getTime() - now.getTime()) / 1000),
  );
}

function formatCountdown(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function CountdownTimer() {
  const [secondsLeft, setSecondsLeft] = useState(getTimeUntilMidnightET);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(getTimeUntilMidnightET());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-muted-foreground tabular-nums">
      new puzzle in {formatCountdown(secondsLeft)}
    </span>
  );
}
