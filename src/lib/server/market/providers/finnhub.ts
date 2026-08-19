import type { HistoryBar } from "@/lib/engine/types";
import type { Quote } from "@/lib/market/types";
import { fetchJson } from "../http";

type QuoteBody = { c?: number; t?: number };
type CandleBody = { s?: string; t?: number[]; c?: number[] };

function token() {
  return process.env.FINNHUB_API_KEY ?? "";
}

export function finnhubEnabled() {
  return token().length > 0;
}

export async function finnhubQuote(symbol: string): Promise<Quote | null> {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token()}`;
  const body = await fetchJson<QuoteBody>(url);
  const last = body.c;
  if (last == null || !Number.isFinite(last) || last <= 0) return null;
  const asOf = body.t && body.t > 0 ? new Date(body.t * 1000).toISOString() : new Date().toISOString();
  return { last, currency: "USD", asOf };
}

export async function finnhubWeekly(symbol: string, crypto: boolean): Promise<HistoryBar[] | null> {
  const to = Math.floor(Date.now() / 1000);
  const from = to - 60 * 60 * 24 * 400;
  const path = crypto ? "crypto/candle" : "stock/candle";
  const url = `https://finnhub.io/api/v1/${path}?symbol=${encodeURIComponent(symbol)}&resolution=W&from=${from}&to=${to}&token=${token()}`;
  const body = await fetchJson<CandleBody>(url);
  if (body.s !== "ok" || !body.t?.length || !body.c?.length) return null;
  const bars: HistoryBar[] = [];
  for (let i = 0; i < body.t.length; i++) {
    const c = body.c[i];
    const t = body.t[i];
    if (c == null || t == null || !Number.isFinite(c) || c <= 0) continue;
    bars.push({ iso: new Date(t * 1000).toISOString().slice(0, 10), close: c });
  }
  return bars.length ? bars : null;
}
