import { cn } from "@/lib/utils";

export function MeridianMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={cn("size-7", className)} aria-hidden>
      <circle cx="14" cy="14" r="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <line x1="14" y1="3" x2="14" y2="25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}
