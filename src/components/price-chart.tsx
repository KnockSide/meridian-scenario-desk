"use client";

import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ASSET_BY_ID } from "@/lib/engine/data";
import { symbolFor } from "@/lib/market/symbols";
import { useDesk } from "@/lib/store";
import type { AssetId } from "@/lib/engine/types";
import { formatAsOfLabel, formatPrice } from "@/lib/utils";

type Row = {
  t: number;
  iso: string;
  label: string;
  historical: number | null;
  baseline: number | null;
  scenario: number | null;
  ciLow: number | null;
  ciHigh: number | null;
  [key: string]: number | string | null;
};

function nums(rows: Row[], keys: string[]) {
  const vals: number[] = [];
  for (const row of rows) {
    for (const key of keys) {
      const v = row[key];
      if (typeof v === "number" && Number.isFinite(v)) vals.push(v);
    }
  }
  return vals;
}

function pathDomain(rows: Row[], keys: string[], indexed: boolean): [number, number] {
  const vals = nums(rows, keys);
  if (!vals.length) return indexed ? [80, 120] : [0, 1];
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = Math.max(max - min, indexed ? 8 : min < 10 ? 0.15 : 1);
  const pad = span * 0.16;
  const lo = min - pad;
  return [indexed ? lo : Math.max(0, lo), max + pad];
}

function formatTick(v: number, indexed: boolean, last: number) {
  if (!Number.isFinite(v)) return "";
  if (indexed) return `${Math.round(v)}`;
  if (last < 1) return v.toFixed(3);
  if (last < 10) return v.toFixed(2);
  if (last >= 10000) return `${(v / 1000).toFixed(0)}k`;
  if (last >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return v >= 100 ? v.toFixed(0) : v.toFixed(1);
}

function n(v?: number) {
  return v == null || !Number.isFinite(v) ? null : v;
}

export function PriceChart() {
  const { result, focused, visible, currencies } = useDesk();
  const solo = focused && result.assets[focused] ? focused : visible.length === 1 ? visible[0] : null;
  const [indexMode, setIndexMode] = useState(false);
  const useIndex = indexMode || !solo;

  const { data, lines, domain } = useMemo(() => {
    if (solo) {
      const asset = result.assets[solo];
      const last = asset.last;
      const scale = (v?: number) => {
        const x = n(v);
        if (x == null) return null;
        return useIndex ? (x / last) * 100 : x;
      };
      const rows: Row[] = asset.series.map((p) => ({
        t: p.t,
        iso: p.iso,
        label: p.label,
        historical: scale(p.historical),
        baseline: scale(p.baseline),
        scenario: scale(p.scenario),
        ciLow: scale(p.ciLow),
        ciHigh: scale(p.ciHigh),
      }));
      return {
        data: rows,
        lines: [{ id: solo, color: ASSET_BY_ID[solo].colorVar }],
        domain: pathDomain(rows, ["historical", "baseline", "scenario"], useIndex),
      };
    }

    const ids = visible.filter((id) => result.assets[id]);
    const primary = result.assets[ids[0] ?? "AAPL"];
    const rows: Row[] = primary.series.map((p, i) => {
      const row: Row = {
        t: p.t,
        iso: p.iso,
        label: p.label,
        historical: null,
        baseline: null,
        scenario: null,
        ciLow: null,
        ciHigh: null,
      };
      for (const id of ids) {
        const pt = result.assets[id].series[i];
        const last = result.assets[id].last;
        const val = pt?.scenario ?? pt?.historical;
        row[id] = val != null && Number.isFinite(val) ? (val / last) * 100 : null;
      }
      return row;
    });
    return {
      data: rows,
      lines: ids.map((id) => ({ id, color: ASSET_BY_ID[id].colorVar })),
      domain: pathDomain(rows, ids, true),
    };
  }, [result, solo, visible, useIndex]);

  const nowIso = result.asOf;
  const impactLabel = data.find((d) => d.iso === nowIso)?.iso ?? nowIso;
  const last = solo ? (result.assets[solo]?.last ?? ASSET_BY_ID[solo].last) : 100;
  const chartKey = `${solo ?? "book"}-${useIndex ? "i" : "p"}-${visible.join(",")}`;
  const ccy = solo ? (currencies[solo] ?? symbolFor(solo).currency) : undefined;

  return (
    <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-3 py-3 sm:px-4">
        <div className="min-w-0">
          <p className="text-2xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Path · marks {formatAsOfLabel(result.asOf)}
            {ccy && ccy !== "USD" ? ` · ${ccy}` : ""}
          </p>
          <h2 className="truncate font-display text-xl tracking-tight">
            {solo ? `${ASSET_BY_ID[solo].name} · ${ASSET_BY_ID[solo].ticker}` : "Indexed book"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {solo ? (
            <button
              type="button"
              onClick={() => setIndexMode((v) => !v)}
              className="rounded-sm border border-border px-2.5 py-1.5 text-2xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              {useIndex ? "Indexed 100" : "Price"}
            </button>
          ) : (
            <span className="text-2xs uppercase tracking-wider text-muted-foreground">
              Rebased 100
            </span>
          )}
        </div>
      </header>

      <div className="h-[220px] w-full min-w-0 overflow-hidden px-1 pt-3 sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <ComposedChart key={chartKey} data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-hairline)" vertical={false} />
            <XAxis
              dataKey="iso"
              tickFormatter={(v: string) => {
                const d = new Date(`${v}T00:00:00Z`);
                return d.toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                  timeZone: "UTC",
                });
              }}
              minTickGap={36}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11, fontFamily: "IBM Plex Mono" }}
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={false}
            />
            <YAxis
              domain={domain}
              allowDataOverflow
              allowDecimals
              width={solo && !useIndex && last < 10 ? 56 : 48}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11, fontFamily: "IBM Plex Mono" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => formatTick(v, useIndex || !solo, last)}
            />
            <ReTooltip content={<ChartTip solo={solo} indexed={useIndex || !solo} currency={ccy} />} />
            <ReferenceLine
              x={impactLabel}
              stroke="var(--color-accent)"
              strokeDasharray="3 4"
              strokeOpacity={0.55}
              label={{
                value: "Now",
                fill: "var(--color-muted-foreground)",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />
            {solo ? (
              [
                <Area
                  key="ciHigh"
                  type="monotone"
                  dataKey="ciHigh"
                  stroke="none"
                  fill="var(--color-accent)"
                  fillOpacity={0.14}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />,
                <Area
                  key="ciLow"
                  type="monotone"
                  dataKey="ciLow"
                  stroke="none"
                  fill="var(--color-card)"
                  fillOpacity={1}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />,
                <Line
                  key="historical"
                  type="monotone"
                  dataKey="historical"
                  stroke="var(--color-muted-foreground)"
                  strokeWidth={1.4}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />,
                <Line
                  key="baseline"
                  type="monotone"
                  dataKey="baseline"
                  stroke="var(--color-muted-foreground)"
                  strokeWidth={1.1}
                  strokeDasharray="4 4"
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />,
                <Line
                  key="scenario"
                  type="monotone"
                  dataKey="scenario"
                  stroke={ASSET_BY_ID[solo].colorVar}
                  strokeWidth={2.2}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />,
              ]
            ) : (
              lines.map((l) => (
                <Line
                  key={l.id}
                  type="monotone"
                  dataKey={l.id}
                  stroke={l.color}
                  strokeWidth={1.7}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />
              ))
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <footer className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border px-3 py-2 text-2xs text-muted-foreground sm:px-4">
        {solo ? (
          <>
            <LegendDot color="var(--color-muted-foreground)" label="History" />
            <LegendDot color="var(--color-muted-foreground)" dashed label="Unshocked baseline" />
            <LegendDot color={ASSET_BY_ID[solo].colorVar} label="Scenario path" />
            <LegendDot color="var(--color-accent)" label="90% cone" />
          </>
        ) : (
          visible.map((id) => <LegendDot key={id} color={ASSET_BY_ID[id].colorVar} label={id} />)
        )}
      </footer>
    </section>
  );
}

function LegendDot({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block w-3.5"
        style={{
          height: dashed ? 0 : 1,
          background: dashed ? "transparent" : color,
          borderTop: dashed ? `1px dashed ${color}` : undefined,
        }}
      />
      {label}
    </span>
  );
}

function ChartTip({
  active,
  payload,
  label,
  solo,
  indexed,
  currency,
}: {
  active?: boolean;
  payload?: { dataKey?: string | number; value?: number; color?: string }[];
  label?: string;
  solo: AssetId | null;
  indexed: boolean;
  currency?: "USD" | "EUR" | "GBP";
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-mono text-2xs text-muted-foreground">{String(label ?? "")}</p>
      {payload
        .filter((p) => p.value != null && p.dataKey !== "ciLow" && p.dataKey !== "ciHigh")
        .map((p) => {
          const key = String(p.dataKey);
          const v = Number(p.value);
          const text = indexed
            ? v.toFixed(1)
            : solo
              ? formatPrice(v, ASSET_BY_ID[solo].kind, currency)
              : v.toFixed(2);
          return (
            <p key={key} className="tabular" style={{ color: p.color }}>
              {key} {text}
            </p>
          );
        })}
    </div>
  );
}
