import { ASSET_IDS } from "@/lib/engine/data";
import type { AssetId } from "@/lib/engine/types";
import type { QuoteCurrency, QuoteFeed, SymbolRow } from "./types";

function us(id: string): SymbolRow {
  return { yahoo: id, finnhub: id, currency: "USD", feed: "us" };
}

function row(
  yahoo: string | null,
  finnhub: string | null,
  currency: QuoteCurrency,
  feed: QuoteFeed,
  coingecko?: string,
): SymbolRow {
  return { yahoo, finnhub, currency, feed, coingecko };
}

const US: AssetId[] = [
  "AAPL", "MSFT", "NVDA", "TSLA", "LLY", "MSTR", "CCJ", "AMZN", "CRWD", "WMT",
  "NVO", "LMT", "PLTR", "GOOGL", "META", "ORCL", "SNOW", "NOW", "NET", "AVGO",
  "AMD", "TSM", "ARM", "MU", "AMAT", "LRCX", "SNPS", "MRVL", "ANET", "KLAC",
  "PANW", "FTNT", "ZS", "RTX", "NOC", "BA", "GD", "AVAV", "RKLB", "CEG",
  "VST", "OKLO", "SMR", "FSLR", "BE", "MP", "ALB", "ISRG", "VRTX", "TMO",
  "ROK", "ABB", "DE", "CAT", "HON", "EMR", "IONQ", "RGTI", "COIN", "HOOD",
  "UBER", "RIVN", "URTH", "QQQ", "TLT", "SMH", "ARKK", "BOTZ", "VNQ", "DBA",
  "PIMIX",
];

const OVERRIDES: Partial<Record<AssetId, SymbolRow>> = {
  ASML: row("ASML.AS", "ASML.AS", "EUR", "eu"),
  RHM: row("RHM.DE", "RHM.DE", "EUR", "eu"),
  SIE: row("SIE.DE", "SIE.DE", "EUR", "eu"),
  IGLN: row("IGLN.L", "IGLN.L", "USD", "eu"),
  SPX: row("^GSPC", "^GSPC", "USD", "index"),
  FVST: row(null, null, "EUR", "static"),
  BTC: row("BTC-USD", "BINANCE:BTCUSDT", "USD", "crypto", "bitcoin"),
  ETH: row("ETH-USD", "BINANCE:ETHUSDT", "USD", "crypto", "ethereum"),
  XRP: row("XRP-USD", "BINANCE:XRPUSDT", "USD", "crypto", "ripple"),
  SOL: row("SOL-USD", "BINANCE:SOLUSDT", "USD", "crypto", "solana"),
  LINK: row("LINK-USD", "BINANCE:LINKUSDT", "USD", "crypto", "chainlink"),
  RENDER: row("RENDER-USD", "BINANCE:RENDERUSDT", "USD", "crypto", "render-token"),
  TAO: row("TAO-USD", "BINANCE:TAOUSDT", "USD", "crypto", "bittensor"),
  XMR: row("XMR-USD", null, "USD", "crypto", "monero"),
  UNI: row("UNI-USD", "BINANCE:UNIUSDT", "USD", "crypto", "uniswap"),
  DOGE: row("DOGE-USD", "BINANCE:DOGEUSDT", "USD", "crypto", "dogecoin"),
};

export const SYMBOLS: Record<AssetId, SymbolRow> = Object.fromEntries(
  ASSET_IDS.map((id) => [id, OVERRIDES[id] ?? us(id)]),
) as Record<AssetId, SymbolRow>;

export function symbolFor(id: AssetId): SymbolRow {
  return SYMBOLS[id];
}

export function isAssetId(value: string): value is AssetId {
  return Object.hasOwn(SYMBOLS, value);
}

export function parseAssetIds(raw: string | null | undefined): AssetId[] {
  if (!raw) return [];
  const out: AssetId[] = [];
  const seen = new Set<AssetId>();
  for (const part of raw.split(",")) {
    const id = part.trim().toUpperCase();
    if (!isAssetId(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}
