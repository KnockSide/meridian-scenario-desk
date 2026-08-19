import type { AssetId, BookMarks, HistoryBar } from "@/lib/engine/types";
import { symbolFor } from "@/lib/market/symbols";
import type { MarketSnapshot, Quote, QuoteCurrency, QuotesSource } from "@/lib/market/types";
import { cached } from "./cache";
import { mapPool } from "./http";
import { coingeckoQuotes, coingeckoWeekly } from "./providers/coingecko";
import { finnhubEnabled, finnhubQuote, finnhubWeekly } from "./providers/finnhub";
import { yahooChart } from "./providers/yahoo";

const QUOTE_TTL = 30_000;
const HISTORY_TTL = 6 * 60 * 60 * 1000;

type Packed = { quote: Quote; bars?: HistoryBar[]; source: Exclude<QuotesSource, "mixed" | "static"> };

async function fetchPacked(id: AssetId, wantHistory: boolean): Promise<Packed | null> {
  const row = symbolFor(id);
  if (row.feed === "static") return null;

  const quoteKey = `q:${id}`;
  const histKey = `h:${id}`;

  return cached(`pack:${id}:${wantHistory ? "h" : "q"}`, QUOTE_TTL, async () => {
    const errors: string[] = [];

    if (finnhubEnabled() && row.finnhub) {
      try {
        const quote = await cached(quoteKey, QUOTE_TTL, () => finnhubQuote(row.finnhub!));
        if (quote) {
          let bars: HistoryBar[] | undefined;
          if (wantHistory) {
            bars =
              (await cached(histKey, HISTORY_TTL, async () => {
                const h = await finnhubWeekly(row.finnhub!, row.feed === "crypto");
                return h ?? [];
              })) ?? undefined;
            if (bars && bars.length < 20) bars = undefined;
          }
          return { quote: { ...quote, currency: row.currency }, bars, source: "finnhub" as const };
        }
      } catch (err) {
        errors.push(String(err));
      }
    }

    if (row.yahoo) {
      try {
        const chart = await cached(`yh:${id}:${wantHistory ? "2y" : "5d"}`, wantHistory ? HISTORY_TTL : QUOTE_TTL, () =>
          yahooChart(row.yahoo!, wantHistory ? "2y" : "5d"),
        );
        if (chart) {
          return {
            quote: chart.quote,
            bars: wantHistory && chart.bars.length >= 20 ? chart.bars : undefined,
            source: "yahoo" as const,
          };
        }
      } catch (err) {
        errors.push(String(err));
      }
    }

    if (row.coingecko) {
      try {
        const quotes = await cached(`cgq:${row.coingecko}`, QUOTE_TTL, () => coingeckoQuotes([row.coingecko!]));
        const quote = quotes[row.coingecko];
        if (quote) {
          let bars: HistoryBar[] | undefined;
          if (wantHistory) {
            bars = await cached(histKey, HISTORY_TTL, async () => {
              const h = await coingeckoWeekly(row.coingecko!);
              return h ?? [];
            });
            if (bars && bars.length < 20) bars = undefined;
          }
          return { quote, bars, source: "coingecko" as const };
        }
      } catch (err) {
        errors.push(String(err));
      }
    }

    if (errors.length) console.warn(`[market] ${id} failed`, errors[0]);
    return null;
  });
}

export async function getSnapshot(ids: AssetId[], opts: { history: boolean }): Promise<MarketSnapshot> {
  const unique = [...new Set(ids)];
  const packed = await mapPool(unique, 4, (id) => fetchPacked(id, opts.history));

  const last: BookMarks["last"] = {};
  const history: NonNullable<BookMarks["history"]> = {};
  const currencies: Partial<Record<AssetId, QuoteCurrency>> = {};
  const missing: AssetId[] = [];
  const sources = new Set<QuotesSource>();
  let asOf: string | null = null;

  for (let i = 0; i < unique.length; i++) {
    const id = unique[i]!;
    const row = packed[i];
    if (!row) {
      missing.push(id);
      continue;
    }
    last[id] = row.quote.last;
    currencies[id] = row.quote.currency;
    sources.add(row.source);
    if (!asOf || row.quote.asOf > asOf) asOf = row.quote.asOf;
    if (row.bars?.length) history[id] = row.bars;
  }

  let source: QuotesSource = "static";
  if (sources.size === 1) source = [...sources][0]!;
  else if (sources.size > 1) source = "mixed";
  else if (missing.length === unique.length) source = "static";

  return {
    asOf: asOf ?? new Date().toISOString(),
    last,
    history: Object.keys(history).length ? history : undefined,
    source,
    delayed: true,
    currencies,
    missing,
  };
}
