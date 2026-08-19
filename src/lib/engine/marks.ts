import type { HistoryBar } from "./types";

export const HISTORY_WEEKS = 78;

export function asOfDay(iso?: string): string | undefined {
  if (!iso) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekGrid(asOf: string, weeks: number): string[] {
  const out: string[] = [];
  for (let i = weeks; i >= 0; i--) out.push(addDays(asOf, -i * 7));
  return out;
}

export function alignHistory(
  bars: HistoryBar[],
  last: number,
  asOf: string,
  weeks: number,
): number[] | null {
  if (!Number.isFinite(last) || last <= 0) return null;
  const usable = bars
    .filter((b) => Number.isFinite(b.close) && b.close > 0 && /^\d{4}-\d{2}-\d{2}/.test(b.iso))
    .map((b) => ({ iso: b.iso.slice(0, 10), close: b.close }))
    .sort((a, b) => a.iso.localeCompare(b.iso));
  if (usable.length < 20) return null;

  const grid = weekGrid(asOf, weeks);
  const closes: number[] = [];
  let j = 0;
  let prev: number | null = null;
  for (const day of grid) {
    while (j + 1 < usable.length && usable[j + 1]!.iso <= day) j += 1;
    const bar = usable[j];
    if (bar && bar.iso <= day) {
      prev = bar.close;
      closes.push(bar.close);
    } else if (prev != null) {
      closes.push(prev);
    } else {
      const next = usable.find((b) => b.iso > day);
      if (!next) return null;
      prev = next.close;
      closes.push(next.close);
    }
  }
  closes[closes.length - 1] = last;
  return closes;
}
