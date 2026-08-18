"use client";

import { useMemo, useState } from "react";
import { ASSETS, ASSET_BY_ID, CLASS_LABEL } from "@/lib/engine/data";
import { THEME_LABEL } from "@/lib/engine/book";
import { useDesk } from "@/lib/store";
import type { AssetClass, AssetId, EquityTheme } from "@/lib/engine/types";
import { cn, formatPct, formatPrice } from "@/lib/utils";

const FILTERS: { id: "all" | AssetClass; label: string }[] = [
  { id: "all", label: "All" },
  { id: "equity", label: "Equity" },
  { id: "etf", label: "ETF" },
  { id: "fund", label: "Fund" },
  { id: "crypto", label: "Crypto" },
];

const THEMES: EquityTheme[] = [
  "ai",
  "semi",
  "cyber",
  "defense",
  "energy",
  "bio",
  "industrial",
  "space",
  "materials",
  "quantum",
  "rails",
  "mobility",
  "consumer",
];

export function AssetCards() {
  const { result, visible, focused, toggleVisible, setFocused } = useDesk();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("equity");
  const [theme, setTheme] = useState<EquityTheme | "all">("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ASSETS.filter((a) => {
      if (filter !== "all" && a.class !== filter) return false;
      if (theme !== "all" && a.theme !== theme) return false;
      if (!needle) return true;
      return a.ticker.toLowerCase().includes(needle) || a.name.toLowerCase().includes(needle);
    });
  }, [filter, theme, q]);

  const showThemes = filter === "all" || filter === "equity";

  return (
    <section className="min-w-0">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-0.5">
        <p className="text-2xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Marks · theoretical · {rows.length}
        </p>
        <div className="flex min-w-0 flex-wrap items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setFilter(f.id);
                if (f.id !== "all" && f.id !== "equity") setTheme("all");
              }}
              className={cn(
                "rounded-sm px-2 py-1 text-2xs uppercase tracking-wider",
                filter === f.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find ticker"
            aria-label="Find ticker"
            className="ml-1 h-7 w-28 rounded-sm border border-border bg-transparent px-2 font-mono text-2xs text-foreground placeholder:text-muted-foreground sm:w-36"
          />
        </div>
      </div>
      {showThemes ? (
        <div className="mb-3 flex gap-1 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setTheme("all")}
            className={cn(
              "shrink-0 rounded-sm px-2 py-1 text-2xs uppercase tracking-wider",
              theme === "all" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Book
          </button>
          {THEMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={cn(
                "shrink-0 rounded-sm px-2 py-1 text-2xs uppercase tracking-wider",
                theme === t ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {THEME_LABEL[t]}
            </button>
          ))}
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {rows.map((asset) => {
          const row = result.assets[asset.id];
          if (!row) return null;
          const on = visible.includes(asset.id);
          const isFocus = focused === asset.id;
          const up = row.pct >= 0;
          return (
            <div
              key={asset.id}
              data-ticker={asset.id}
              className={cn(
                "min-w-0 rounded-lg border bg-card p-3 text-left transition-colors",
                isFocus ? "border-accent/50" : on ? "border-border" : "border-hairline",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  className="min-w-0 text-left"
                  onClick={() => setFocused(isFocus ? null : asset.id)}
                >
                  <p className="font-mono text-xs tracking-wide" style={{ color: asset.colorVar }}>
                    {asset.ticker}
                  </p>
                  <p className="truncate text-2xs text-muted-foreground">{asset.name}</p>
                </button>
                <div className="flex items-center gap-1.5">
                  <span className={cn("font-mono text-sm tabular", up ? "text-up" : "text-down")}>
                    {formatPct(row.pct)}
                  </span>
                  <button
                    type="button"
                    aria-label={on ? `Hide ${asset.ticker} from chart` : `Show ${asset.ticker} on chart`}
                    onClick={() => toggleVisible(asset.id)}
                    className={cn(
                      "mt-0.5 size-2.5 rounded-full border",
                      on ? "border-accent bg-accent" : "border-muted-foreground/50 bg-transparent",
                    )}
                  />
                </div>
              </div>
              <button
                type="button"
                className="mt-2 w-full min-w-0 text-left"
                onClick={() => setFocused(isFocus ? null : asset.id)}
              >
                <p className="truncate font-mono text-sm tabular text-foreground">
                  {formatPrice(row.projected, asset.kind)}
                </p>
                <p className="truncate font-mono text-2xs tabular text-muted-foreground">
                  last {formatPrice(row.last, asset.kind)} · {CLASS_LABEL[asset.class]}
                </p>
                <Spark id={asset.id} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Spark({ id }: { id: AssetId }) {
  const series = useDesk((s) => s.result.assets[id]?.series);
  const last = ASSET_BY_ID[id].last;
  const color = ASSET_BY_ID[id].colorVar;
  if (!series) return null;
  const pts = series.filter((p) => p.scenario != null).slice(-36);
  if (pts.length < 2) return null;
  const vals = pts.map((p) => p.scenario ?? last);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const w = 120;
  const h = 22;
  const d = vals
    .map((v, i) => {
      const x = (i / (vals.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 2) - 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-1.5 h-5 w-full" aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth="1.4" />
    </svg>
  );
}
