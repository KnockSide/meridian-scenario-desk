"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { localSynthesis } from "@/lib/engine/synthesis";
import { askDeskGrok } from "@/lib/server/grok-synthesis";
import { useDesk } from "@/lib/store";

const REGIME: Record<string, string> = {
  "risk-on": "Risk-on",
  "risk-off": "Risk-off",
  stagflation: "Stagflation",
  fragmented: "Fragmented",
  idle: "Unshocked",
};

export function SynthesisPanel() {
  const { active, weights, horizon, result } = useDesk();
  const local = useMemo(
    () => localSynthesis({ active, weights, horizon }, result),
    [active, weights, horizon, result],
  );
  const [ai, setAi] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastKey, setLastKey] = useState("");

  const key = JSON.stringify({ active, weights, horizon });
  const shown = ai && lastKey === key ? ai : local;

  async function deepen() {
    setPending(true);
    setError(null);
    try {
      const res = await askDeskGrok({ data: { active, weights, horizon } });
      if (res.ok) {
        setAi(res.text);
        setLastKey(key);
      } else {
        setError(res.error);
      }
    } catch {
      setError("Could not reach the desk model.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-2xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Combined impact
          </p>
          <h2 className="font-display text-xl tracking-tight">AI synthesis</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={
              result.regime === "risk-off" || result.regime === "stagflation"
                ? "down"
                : result.regime === "fragmented"
                  ? "warn"
                  : "outline"
            }
          >
            {REGIME[result.regime]}
          </Badge>
          {result.interactions.slice(0, 2).map((ix) => (
            <Badge key={ix.id} variant={ix.kind === "compound" ? "up" : "warn"}>
              {ix.kind === "compound" ? "Compounds" : "Conflicts"}
            </Badge>
          ))}
        </div>
      </div>

      {result.interactions.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {result.interactions.map((ix) => (
            <li key={ix.id} className="text-xs leading-relaxed text-muted-foreground">
              <span className={ix.kind === "compound" ? "text-up" : "text-warning"}>
                {ix.kind === "compound" ? "Compound" : "Conflict"}
              </span>
              {" · "}
              {ix.label}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/90">{shown}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" variant="secondary" onClick={() => void deepen()} disabled={pending}>
          {pending ? "Reading the book…" : "Deepen with Grok"}
        </Button>
        {error ? <p className="text-xs text-down">{error}</p> : null}
        {ai && lastKey === key ? (
          <p className="text-2xs uppercase tracking-wider text-muted-foreground">House model</p>
        ) : (
          <p className="text-2xs uppercase tracking-wider text-muted-foreground">Desk note · live</p>
        )}
      </div>
    </section>
  );
}
