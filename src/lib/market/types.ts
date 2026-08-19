import type { AssetId, BookMarks, HistoryBar } from "@/lib/engine/types";

export type QuoteCurrency = "USD" | "EUR" | "GBP";
export type QuoteFeed = "us" | "eu" | "crypto" | "index" | "static";
export type QuotesStatus = "idle" | "loading" | "live" | "stale" | "fallback";
export type QuotesSource = "finnhub" | "yahoo" | "coingecko" | "mixed" | "static";

export type SymbolRow = {
  yahoo: string | null;
  finnhub: string | null;
  coingecko?: string;
  currency: QuoteCurrency;
  feed: QuoteFeed;
};

export type Quote = {
  last: number;
  currency: QuoteCurrency;
  asOf: string;
};

export type MarketSnapshot = BookMarks & {
  source: QuotesSource;
  delayed: true;
  currencies: Partial<Record<AssetId, QuoteCurrency>>;
  missing: AssetId[];
};

export type { HistoryBar, BookMarks };
