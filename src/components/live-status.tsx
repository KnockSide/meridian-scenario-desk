"use client";

import { useDesk } from "@/lib/store";
import { cn, formatMarkTime } from "@/lib/utils";

const LABEL: Record<string, string> = {
  idle: "Marks",
  loading: "Marks · loading",
  live: "Delayed",
  stale: "Stale",
  fallback: "Fallback",
};

export function LiveStatus({ className }: { className?: string }) {
  const status = useDesk((s) => s.quotesStatus);
  const source = useDesk((s) => s.quotesSource);
  const updated = useDesk((s) => s.quotesUpdatedAt);
  const tone =
    status === "live" ? "text-up" : status === "stale" || status === "fallback" ? "text-warning" : "text-muted-foreground";
  const time = updated ? formatMarkTime(updated) : null;
  const src = status === "live" && source !== "static" ? source : null;

  return (
    <span
      className={cn(
        "hidden items-center gap-1.5 font-mono text-2xs uppercase tracking-wider sm:inline-flex",
        tone,
        className,
      )}
      title={src ? `Source: ${src}` : undefined}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "live"
            ? "bg-up"
            : status === "loading"
              ? "animate-pulse bg-muted-foreground"
              : status === "idle"
                ? "bg-muted-foreground"
                : "bg-warning",
        )}
      />
      {LABEL[status] ?? "Marks"}
      {time && status !== "loading" ? <span className="normal-case tracking-normal text-muted-foreground">· {time}</span> : null}
    </span>
  );
}
