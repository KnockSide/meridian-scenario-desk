import {
  AS_OF,
  ASSET_BY_ID,
  ASSET_IDS,
  CRYPTO,
  HARDWARE,
  INTERACTIONS,
  SCENARIO_BY_ID,
  SEMI,
  TECH,
} from "./data";
import type {
  AssetId,
  AssetProjection,
  EngineResult,
  HorizonMonths,
  Interaction,
  MixInput,
  ScenarioId,
  SeriesPoint,
  ShockMap,
  ShockProfile,
} from "./types";

const WEEK = 7 / 365.25;
const HISTORY_WEEKS = 78;

const CRYPTO_SET = new Set<AssetId>(CRYPTO);
const TECH_SET = new Set<AssetId>(TECH);
const HARDWARE_SET = new Set<AssetId>(HARDWARE);
const SEMI_SET = new Set<AssetId>(SEMI);

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rng: () => number) {
  const u = Math.max(rng(), 1e-9);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function labelFor(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
}

export function profileAt(profile: ShockProfile, u: number): number {
  const x = Math.min(1, Math.max(0, u));
  switch (profile) {
    case "front":
      return 1 - Math.exp(-4.2 * x);
    case "delayed":
      return 1 / (1 + Math.exp(-10 * (x - 0.42)));
    case "immediate":
      return 1 - Math.exp(-9 * x);
    case "gradual":
      return x ** 0.82;
    case "crash_recover": {
      const crash = 1 - Math.exp(-11 * x);
      const recover = 0.28 * Math.max(0, x - 0.22) ** 1.1;
      return Math.min(1, crash - recover);
    }
    case "accelerating":
      return x ** 1.55;
  }
}

function blendedProfile(ids: ScenarioId[], weights: Record<ScenarioId, number>, u: number) {
  let num = 0;
  let den = 0;
  for (const id of ids) {
    const w = (weights[id] ?? 100) / 100;
    num += w * profileAt(SCENARIO_BY_ID[id].profile, u);
    den += w;
  }
  return den === 0 ? u : num / den;
}

export function activeIds(active: MixInput["active"]): ScenarioId[] {
  return (Object.keys(active) as ScenarioId[]).filter((id) => active[id]);
}

function pairLive(ids: ScenarioId[], pair: [ScenarioId, ScenarioId]) {
  return ids.includes(pair[0]) && ids.includes(pair[1]);
}

export function combineShocks(input: MixInput): {
  net: ShockMap;
  conflict: number;
  compound: number;
  interactions: Interaction[];
} {
  const ids = activeIds(input.active);
  const net = {} as ShockMap;
  for (const asset of ASSET_IDS) net[asset] = 0;

  if (ids.length === 0) {
    return { net, conflict: 0, compound: 0, interactions: [] };
  }

  for (const asset of ASSET_IDS) {
    let factor = 1;
    for (const id of ids) {
      const w = (input.weights[id] ?? 100) / 100;
      factor *= 1 + SCENARIO_BY_ID[id].shocks[asset] * w;
    }
    net[asset] = factor - 1;
  }

  const live = INTERACTIONS.filter((ix) => pairLive(ids, ix.pair));
  let conflict = 0;
  let compound = 0;

  for (const ix of live) {
    const w0 = (input.weights[ix.pair[0]] ?? 100) / 100;
    const w1 = (input.weights[ix.pair[1]] ?? 100) / 100;
    const amp = Math.min(w0, w1);

    if (ix.kind === "compound") compound += amp;
    else conflict += amp;

    for (const asset of ASSET_IDS) {
      const extra = interactionDelta(ix.id, asset, amp, net[asset]);
      net[asset] += extra;
    }
  }

  for (const asset of ASSET_IDS) {
    net[asset] = Math.max(-0.88, Math.min(2.1, net[asset]));
  }

  return { net, conflict, compound, interactions: live };
}

function isCrypto(asset: AssetId) {
  return CRYPTO_SET.has(asset);
}
function isTech(asset: AssetId) {
  return TECH_SET.has(asset);
}
function isHardware(asset: AssetId) {
  return HARDWARE_SET.has(asset);
}
function isSemi(asset: AssetId) {
  return SEMI_SET.has(asset);
}

function interactionDelta(id: string, asset: AssetId, amp: number, current: number): number {
  switch (id) {
    case "cheap-ai":
      if (asset === "NVDA" || asset === "SMH") return 0.14 * amp;
      if (asset === "ASML" || asset === "MSFT") return 0.08 * amp;
      if (isTech(asset)) return 0.06 * amp;
      return 0.02 * amp;
    case "volcker-recession":
      if (asset === "ARKK" || asset === "MSTR") return -0.14 * amp;
      return (isCrypto(asset) ? -0.12 : isTech(asset) ? -0.09 : -0.07) * amp;
    case "liq-vs-cashflow":
      return -0.45 * current * amp;
    case "ease-into-fiat":
      if (asset === "IGLN" || asset === "BTC") return 0.1 * amp;
      if (isCrypto(asset)) return 0.08 * amp;
      return -0.5 * Math.max(0, current) * amp;
    case "stagflation":
      if (asset === "TLT" || asset === "PIMIX") return -0.08 * amp;
      if (asset === "BTC" || asset === "IGLN") return -0.06 * amp;
      if (isCrypto(asset)) return -0.06 * amp;
      return (isTech(asset) ? -0.07 : -0.05) * amp;
    case "wafers-vs-models":
      if (asset === "NVDA" || asset === "ASML") return -0.28 * amp;
      if (asset === "SMH") return -0.2 * amp;
      if (isHardware(asset)) return -0.1 * amp;
      if (asset === "MSFT") return 0.03 * amp;
      return 0;
    case "supply-into-hole":
      return (isHardware(asset) ? -0.1 : -0.05) * amp;
    case "outlawed-hedge":
      if (asset === "IGLN") return 0.1 * amp;
      if (!isCrypto(asset) && asset !== "MSTR") return 0;
      return -0.55 * current * amp;
    case "liq-out-legal-out":
      return isCrypto(asset) || asset === "MSTR" ? -0.12 * amp : 0;
    case "protocol-plus-ban":
      return isCrypto(asset) || asset === "MSTR" ? -0.1 * amp : 0;
    case "second-s-curve":
      if (asset === "MSFT") return 0.09 * amp;
      if (asset === "NVDA" || asset === "SMH") return 0.08 * amp;
      if (asset === "QQQ") return 0.04 * amp;
      return 0;
    case "algos-need-fabs":
      if (asset === "NVDA" || asset === "ASML") return -0.12 * amp;
      if (asset === "SMH") return -0.08 * amp;
      if (asset === "MSFT") return -0.04 * amp;
      return 0;
    case "etf-plus-qe":
      if (asset === "BTC" || asset === "ETH" || asset === "SOL" || asset === "MSTR") return 0.1 * amp;
      if (isCrypto(asset)) return 0.05 * amp;
      return 0;
    case "etf-vs-ban":
      if (!isCrypto(asset) && asset !== "MSTR") return 0;
      return -0.6 * current * amp;
    case "etf-vs-tether":
      if (!isCrypto(asset) && asset !== "MSTR") return 0;
      return -0.35 * Math.max(0, current) * amp;
    case "tax-plus-cut":
      if (asset === "AAPL" || asset === "MSFT" || asset === "QQQ" || asset === "SPX") return 0.06 * amp;
      if (isTech(asset)) return 0.04 * amp;
      return 0.01 * amp;
    case "qe-vs-hike":
      if (asset === "TLT") return -0.12 * amp;
      if (asset === "IGLN" || asset === "BTC") return 0.05 * amp;
      return -0.4 * current * amp;
    case "qe-plus-fiat":
      if (asset === "IGLN" || asset === "BTC" || asset === "MSTR") return 0.1 * amp;
      if (asset === "TLT" || asset === "PIMIX") return -0.08 * amp;
      return 0;
    case "web3-plus-etf":
      if (asset === "ETH" || asset === "SOL" || asset === "LINK") return 0.1 * amp;
      if (asset === "AAPL" || asset === "UNI") return 0.05 * amp;
      return 0;
    case "web3-vs-ban":
      if (asset === "AAPL") return -0.08 * amp;
      if (isCrypto(asset)) return -0.5 * Math.max(0, current) * amp;
      return 0;
    case "ai-vs-clamp":
      if (asset === "NVDA" || asset === "MSFT") return -0.16 * amp;
      if (asset === "TAO" || asset === "RENDER") return 0.12 * amp;
      if (isSemi(asset) || asset === "QQQ") return -0.08 * amp;
      return 0;
    case "taiwan-plus-clamp":
      if (asset === "NVDA" || asset === "ASML" || asset === "SMH") return -0.1 * amp;
      return 0;
    case "cre-plus-hike":
      if (asset === "VNQ") return -0.12 * amp;
      if (asset === "PIMIX" || asset === "SPX") return -0.05 * amp;
      return 0;
    case "cre-vs-cut":
      if (asset === "VNQ") return -0.45 * current * amp;
      return 0;
    case "peace-vs-taiwan":
      if (asset === "ASML" || asset === "NVDA" || asset === "SMH") return -0.08 * amp;
      if (asset === "URTH") return 0.03 * amp;
      return 0;
    case "flare-plus-tether":
      if (asset === "IGLN") return 0.08 * amp;
      if (isCrypto(asset) || asset === "MSTR") return -0.08 * amp;
      return 0;
    case "dedollar-plus-fiat":
      if (asset === "IGLN" || asset === "BTC") return 0.1 * amp;
      if (asset === "TLT" || asset === "SPX") return -0.06 * amp;
      return 0;
    case "green-vs-flare":
      if (asset === "TSLA" || asset === "CCJ") return -0.5 * Math.max(0, current) * amp;
      return 0;
    case "ban-plus-tether":
      if (isCrypto(asset) || asset === "MSTR") return -0.08 * amp;
      return 0;
    default:
      return 0;
  }
}

function historicalPath(assetId: AssetId): number[] {
  const asset = ASSET_BY_ID[assetId];
  const rng = mulberry32(hashCode(assetId) ^ 0x51ed);
  const n = HISTORY_WEEKS;
  const values: number[] = new Array(n + 1);
  values[n] = asset.last;
  let s = asset.last;
  for (let i = n - 1; i >= 0; i--) {
    const u = i / n;
    let mu = asset.mu;
    if (u < 0.18) mu += 0.04;
    else if (u < 0.42) mu += 0.16;
    else if (u < 0.55) mu -= 0.28;
    else mu += 0.06;
    if (asset.class === "crypto") {
      if (u > 0.3 && u < 0.48) mu -= 0.2;
    }
    if (assetId === "NVDA" || assetId === "ASML" || assetId === "SMH") {
      if (u > 0.2 && u < 0.5) mu += 0.12;
    }
    if (assetId === "RHM" && u < 0.45) mu += 0.18;
    if (assetId === "MSTR" && u > 0.3 && u < 0.55) mu -= 0.35;
    if (assetId === "IGLN" && u < 0.4) mu += 0.08;
    const z = gauss(rng);
    const step = (mu - 0.5 * asset.sigma ** 2) * WEEK + asset.sigma * Math.sqrt(WEEK) * z;
    s = s / Math.exp(step);
    values[i] = s;
  }
  const scale = asset.last / values[n];
  return values.map((v) => v * scale);
}

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

const historyCache = new Map<AssetId, number[]>();

export function getHistory(assetId: AssetId) {
  let h = historyCache.get(assetId);
  if (!h) {
    h = historicalPath(assetId);
    historyCache.set(assetId, h);
  }
  return h;
}

function projectAsset(
  assetId: AssetId,
  netAnnual: number,
  horizon: HorizonMonths,
  easedAt: (u: number) => number,
  conflict: number,
): AssetProjection {
  const asset = ASSET_BY_ID[assetId];
  const hist = getHistory(assetId);
  const futureWeeks = Math.round((horizon * 52) / 12);
  const T = futureWeeks * WEEK;
  const series: SeriesPoint[] = [];

  for (let i = 0; i <= HISTORY_WEEKS; i++) {
    const weeksAgo = HISTORY_WEEKS - i;
    const iso = addDays(AS_OF, -weeksAgo * 7);
    const px = hist[i] ?? asset.last;
    series.push({
      t: i,
      iso,
      label: labelFor(iso),
      historical: px,
      baseline: px,
      scenario: px,
    });
  }

  const last = asset.last;
  for (let k = 1; k <= futureWeeks; k++) {
    const t = k * WEEK;
    const u = k / futureWeeks;
    const eased = easedAt(u);
    const baseline = last * Math.exp(asset.mu * t);
    const scenario = last * Math.exp(asset.mu * t + netAnnual * T * eased);
    const vol = asset.sigma * Math.sqrt(t) * (1 + 0.55 * conflict + 0.08 * Math.min(3, Math.abs(netAnnual) * 4));
    const z = 1.64;
    series.push({
      t: HISTORY_WEEKS + k,
      iso: addDays(AS_OF, k * 7),
      label: labelFor(addDays(AS_OF, k * 7)),
      baseline,
      scenario,
      ciLow: scenario * Math.exp(-z * vol),
      ciHigh: scenario * Math.exp(z * vol),
    });
  }

  const end = series[series.length - 1];
  const projected = end?.scenario ?? last;
  const baselineEnd = end?.baseline ?? last;
  return {
    id: assetId,
    last,
    projected,
    baseline: baselineEnd,
    pct: (projected / last - 1) * 100,
    vsBaseline: (projected / baselineEnd - 1) * 100,
    ciLow: end?.ciLow ?? projected,
    ciHigh: end?.ciHigh ?? projected,
    series,
  };
}

function detectRegime(
  ids: ScenarioId[],
  assets: Record<AssetId, AssetProjection>,
  conflict: number,
  compound: number,
): EngineResult["regime"] {
  if (ids.length === 0) return "idle";
  if (conflict > compound + 0.35) return "fragmented";
  const hike = ids.includes("rate_hike");
  const fiat = ids.includes("hyperinflation") || ids.includes("dedollar");
  if (hike && fiat) return "stagflation";
  const eq = (assets.AAPL.pct + assets.MSFT.pct + assets.NVDA.pct + assets.SPX.pct + assets.QQQ.pct) / 5;
  const cr = (assets.BTC.pct + assets.ETH.pct) / 2;
  if (eq < -4 && cr < -4) return "risk-off";
  if (eq > 3 && cr > 0) return "risk-on";
  if (conflict > 0.45) return "fragmented";
  return eq >= 0 ? "risk-on" : "risk-off";
}

export function runEngine(input: MixInput): EngineResult {
  const ids = activeIds(input.active);
  const { net, conflict, compound, interactions } = combineShocks(input);
  const easedAt = (u: number) => (ids.length ? blendedProfile(ids, input.weights, u) : u);
  const assets = {} as Record<AssetId, AssetProjection>;
  for (const id of ASSET_IDS) {
    assets[id] = projectAsset(id, net[id], input.horizon, easedAt, conflict);
  }
  return {
    asOf: AS_OF,
    horizon: input.horizon,
    conflict,
    compound,
    regime: detectRegime(ids, assets, conflict, compound),
    interactions,
    netAnnual: net,
    assets,
  };
}

export function impactIso() {
  return AS_OF;
}
