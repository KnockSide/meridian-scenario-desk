import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_WEIGHTS } from "./data";
import { HISTORY_WEEKS, alignHistory } from "./marks";
import { runEngine } from "./simulate";
import type { BookMarks, HistoryBar } from "./types";

function bars(n: number, start = "2025-01-03", step = 7, px0 = 100): HistoryBar[] {
  const out: HistoryBar[] = [];
  const d = new Date(`${start}T00:00:00Z`);
  for (let i = 0; i < n; i++) {
    out.push({ iso: d.toISOString().slice(0, 10), close: px0 + i });
    d.setUTCDate(d.getUTCDate() + step);
  }
  return out;
}

test("alignHistory pins the last grid point to live last", () => {
  const hist = bars(90, "2024-01-05", 7, 80);
  const aligned = alignHistory(hist, 110, "2026-08-19", HISTORY_WEEKS);
  assert.ok(aligned);
  assert.equal(aligned!.length, HISTORY_WEEKS + 1);
  assert.equal(aligned![aligned!.length - 1], 110);
  const again = alignHistory(hist, 125, "2026-08-19", HISTORY_WEEKS);
  assert.ok(again);
  assert.equal(again![again!.length - 1], 125);
  for (let i = 0; i < HISTORY_WEEKS; i++) assert.equal(again![i], aligned![i]);
});

test("alignHistory rejects thin series", () => {
  assert.equal(alignHistory(bars(10), 100, "2026-08-19", HISTORY_WEEKS), null);
});

test("runEngine rebases future path on live last without changing history length", () => {
  const mix = { active: { ai_boom: true } as const, weights: { ...DEFAULT_WEIGHTS, ai_boom: 100 }, horizon: 12 as const };
  const hist = bars(90, "2024-01-05", 7, 200);
  const a: BookMarks = { asOf: "2026-08-19T14:00:00.000Z", last: { AAPL: 100 }, history: { AAPL: hist } };
  const b: BookMarks = { asOf: "2026-08-19T14:30:00.000Z", last: { AAPL: 110 }, history: { AAPL: hist } };
  const ra = runEngine(mix, a);
  const rb = runEngine(mix, b);
  assert.equal(ra.asOf, "2026-08-19");
  assert.equal(ra.assets.AAPL.series.length, rb.assets.AAPL.series.length);
  assert.equal(ra.assets.AAPL.last, 100);
  assert.equal(rb.assets.AAPL.last, 110);
  const lastHistA = ra.assets.AAPL.series[HISTORY_WEEKS];
  const lastHistB = rb.assets.AAPL.series[HISTORY_WEEKS];
  assert.equal(lastHistA?.historical, 100);
  assert.equal(lastHistB?.historical, 110);
  const futureA = ra.assets.AAPL.series[HISTORY_WEEKS + 1]?.scenario ?? 0;
  const futureB = rb.assets.AAPL.series[HISTORY_WEEKS + 1]?.scenario ?? 0;
  assert.ok(futureB > futureA);
  assert.ok(Math.abs(futureB / futureA - 1.1) < 0.02);
});

test("runEngine without marks matches static last", () => {
  const mix = { active: {}, weights: { ...DEFAULT_WEIGHTS }, horizon: 12 as const };
  const r = runEngine(mix);
  assert.ok(r.assets.AAPL.last > 0);
  assert.equal(r.assets.AAPL.series.filter((p) => p.historical != null).length, HISTORY_WEEKS + 1);
});
