"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const KEY = "meridian.onboarded";

export function Onboarding() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  function dismiss() {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <p className="text-2xs font-medium uppercase tracking-[0.16em] text-muted-foreground">How this desk works</p>
      <h2 className="mt-1 font-display text-xl tracking-tight">Stack events. Paths rebase from delayed last.</h2>
      <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
        <li>Toggle macro, geo, and sector events. Weights stack; conflicts widen the cone.</li>
        <li>The chart uses delayed market marks and real weekly history. Scenario paths start from the latest last.</li>
        <li>This is a house shock model — not a forecast, offer, or advice.</li>
      </ul>
      <Button type="button" size="sm" className="mt-4" onClick={dismiss}>
        Got it
      </Button>
    </div>
  );
}
