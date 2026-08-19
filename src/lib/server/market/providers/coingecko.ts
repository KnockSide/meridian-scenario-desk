import type { HistoryBar } from "@/lib/engine/types";
import type { Quote } from "@/lib/market/types";
import { fetchJson } from "../http";

type PriceBody = Record<string, { usd?: number }>;
type ChartBody = { prices?: Array<[number, number]> };

export async function coingeckoQuotes(ids: string[]): Promise<Record<string, Quote>> {
  if (!ids.length) return {};
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids.join(","))}&vs_currencies=usd`;
  const body = await fetchJson<PriceBody>(url);
  const now = new Date().toISOString();
  const out: Record<string, Quote> = {};
  for (const id of ids) {
    const last = body[id]?.usd;
    if (last == null || !Number.isFinite(last) || last <= 0) continue;
    out[id] = { last, currency: "USD", asOf: now };
  }
  return out;
}

export async function coingeckoWeekly(id: string): Promise<HistoryBar[] | null> {
  const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=548&interval=daily`;
  const body = await fetchJson<ChartBody>(url);
  const prices = body.prices ?? [];
  if (prices.length < 20) return null;
  const byWeek = new Map<string, number>();
  for (const pair of prices) {
    const t = pair[0];
    const px = pair[1];
    if (t == null || px == null || !Number.isFinite(px) || px <= 0) continue;
    const iso = new Date(t).toISOString().slice(0, 10);
    const d = new Date(`${iso}T00:00:00Z`);
    const day = d.getUTCDay();
    d.setUTCDate(d.getUTCDate() - day);
    byWeek.set(d.toISOString().slice(0, 10), px);
  }
  return [...byWeek.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([iso, close]) => ({ iso, close }));
}
