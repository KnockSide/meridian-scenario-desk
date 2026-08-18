"use client";

import { useMemo, useState } from "react";
import { PRESETS, SCENARIOS } from "@/lib/engine/data";
import { useDesk } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { ScenarioCategory, ScenarioTone } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

type Filter = "all" | "bull" | "bear" | ScenarioCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "bull", label: "Bull" },
  { id: "bear", label: "Bear" },
  { id: "macro", label: "Macro" },
  { id: "geo", label: "Geo" },
  { id: "sector", label: "Sector" },
];

function matches(filter: Filter, tone: ScenarioTone, category: ScenarioCategory) {
  if (filter === "all") return true;
  if (filter === "bull" || filter === "bear") return tone === filter;
  return category === filter;
}

export function ScenarioEngine({ className }: { className?: string }) {
  const { active, weights, toggle, setWeight, applyPreset, clear, result } = useDesk();
  const [filter, setFilter] = useState<Filter>("all");
  const live = SCENARIOS.filter((s) => active[s.id]).length;
  const rows = useMemo(
    () => SCENARIOS.filter((s) => matches(filter, s.tone, s.category)),
    [filter],
  );

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex items-end justify-between gap-3 px-4 pb-2 pt-4">
        <div>
          <p className="text-2xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Scenario engine
          </p>
          <h2 className="font-display text-xl tracking-tight">Stack events</h2>
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Clear
        </button>
      </div>

      <div className="px-4 pb-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              title={p.desc}
              onClick={() => applyPreset(p.set)}
              className="shrink-0 rounded-sm border border-border bg-secondary/60 px-2 py-1 text-2xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-1 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "shrink-0 rounded-sm px-2 py-1 text-2xs uppercase tracking-wider",
                filter === f.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 pb-3">
        {rows.map((s) => {
          const on = Boolean(active[s.id]);
          const w = weights[s.id] ?? 100;
          return (
            <div
              key={s.id}
              className={cn(
                "rounded-md border bg-panel px-3 py-2.5 transition-colors",
                on ? "border-accent/30" : "border-hairline",
              )}
            >
              <div className="flex items-center gap-2.5">
                <Switch checked={on} onCheckedChange={() => toggle(s.id)} aria-label={s.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <span className={cn("font-mono text-xs tabular", on ? "text-foreground" : "text-muted-foreground")}>
                      {w}
                    </span>
                  </div>
                  <p className="text-2xs uppercase tracking-wider text-muted-foreground">
                    {s.tone === "bull" ? "+" : s.tone === "bear" ? "−" : "±"} {s.category}
                  </p>
                </div>
              </div>
              {on ? (
                <div className="mt-2 pl-11">
                  <Slider
                    min={10}
                    max={100}
                    step={5}
                    value={[w]}
                    onValueChange={(v) => setWeight(s.id, v[0] ?? w)}
                    aria-label={`${s.short} weight`}
                  />
                  <p className="mt-1.5 text-2xs leading-relaxed text-muted-foreground">{s.blurb}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{live} live · net effects</span>
          <div className="flex gap-2">
            <Badge variant={result.compound > 0.2 ? "up" : "outline"}>
              Compound {result.compound.toFixed(2)}
            </Badge>
            <Badge variant={result.conflict > 0.2 ? "warn" : "outline"}>
              Conflict {result.conflict.toFixed(2)}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
