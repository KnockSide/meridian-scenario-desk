import type { HistoryBar } from "@/lib/engine/types";
import type { Quote, QuoteCurrency } from "@/lib/market/types";
import { fetchJson } from "../http";

type ChartResponse = {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      meta?: {
        regularMarketPrice?: number;
        regularMarketTime?: number;
        currency?: string;
        chartPreviousClose?: number;
      };
      indicators?: { quote?: Array<{ close?: Array<number | null> }> };
    }>;
  };
};

function currencyOf(raw?: string): QuoteCurrency {
  if (raw === "EUR") return "EUR";
  if (raw === "GBP" || raw === "GBp") return "GBP";
  return "USD";
}

function scaleClose(close: number, rawCurrency?: string): number {
  if (rawCurrency === "GBp") return close / 100;
  return close;
}

export async function yahooChart(
  symbol: string,
  range: "2y" | "5d" = "2y",
): Promise<{ quote: Quote; bars: HistoryBar[] } | null> {
  const interval = range === "2y" ? "1wk" : "1d";
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false`;
  const body = await fetchJson<ChartResponse>(url);
  const result = body.chart?.result?.[0];
  if (!result) return null;
  const meta = result.meta ?? {};
  const rawCcy = meta.currency;
  const price = meta.regularMarketPrice ?? meta.chartPreviousClose;
  if (price == null || !Number.isFinite(price) || price <= 0) return null;
  const last = scaleClose(price, rawCcy);
  const asOf = meta.regularMarketTime
    ? new Date(meta.regularMarketTime * 1000).toISOString()
    : new Date().toISOString();
  const ts = result.timestamp ?? [];
  const closes = result.indicators?.quote?.[0]?.close ?? [];
  const bars: HistoryBar[] = [];
  for (let i = 0; i < ts.length; i++) {
    const c = closes[i];
    const t = ts[i];
    if (c == null || !Number.isFinite(c) || c <= 0 || t == null) continue;
    bars.push({
      iso: new Date(t * 1000).toISOString().slice(0, 10),
      close: scaleClose(c, rawCcy),
    });
  }
  return {
    quote: { last, currency: currencyOf(rawCcy), asOf },
    bars,
  };
}
