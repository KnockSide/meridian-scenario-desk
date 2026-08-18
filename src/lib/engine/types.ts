export type AssetId =
  | "AAPL"
  | "MSFT"
  | "NVDA"
  | "TSLA"
  | "ASML"
  | "RHM"
  | "LLY"
  | "MSTR"
  | "CCJ"
  | "AMZN"
  | "CRWD"
  | "WMT"
  | "NVO"
  | "LMT"
  | "SPX"
  | "URTH"
  | "QQQ"
  | "TLT"
  | "SMH"
  | "ARKK"
  | "BOTZ"
  | "IGLN"
  | "VNQ"
  | "DBA"
  | "PIMIX"
  | "FVST"
  | "BTC"
  | "ETH"
  | "XRP"
  | "SOL"
  | "LINK"
  | "RENDER"
  | "TAO"
  | "XMR"
  | "UNI"
  | "DOGE";

export type AssetClass = "equity" | "etf" | "fund" | "crypto";
export type ScenarioCategory = "macro" | "geo" | "sector";
export type ScenarioTone = "bull" | "bear" | "mixed";
export type ShockProfile =
  | "front"
  | "delayed"
  | "immediate"
  | "gradual"
  | "crash_recover"
  | "accelerating";

export type HorizonMonths = 6 | 12 | 18 | 24;

export type ScenarioId =
  | "rate_cut"
  | "rate_hike"
  | "recession"
  | "ai_boom"
  | "taiwan"
  | "crypto_ban"
  | "quantum"
  | "hyperinflation"
  | "spot_etf"
  | "green_energy"
  | "tax_cuts"
  | "web3"
  | "peace"
  | "qe_restart"
  | "cyber_attack"
  | "cre_crash"
  | "ai_reg"
  | "solar_flare"
  | "dedollar"
  | "tether"
  | "hyper_auto"
  | "iot_ransom"
  | "rare_earth"
  | "ubi"
  | "cbdc"
  | "debt_default"
  | "longevity"
  | "crop_fail"
  | "labor_gap"
  | "kessler"
  | "asteroid"
  | "algo_war";

export type ShockMap = Record<AssetId, number>;

export type Asset = {
  id: AssetId;
  ticker: string;
  name: string;
  class: AssetClass;
  last: number;
  kind: "usd" | "index" | "crypto";
  mu: number;
  sigma: number;
  colorVar: string;
};

export type Scenario = {
  id: ScenarioId;
  name: string;
  short: string;
  category: ScenarioCategory;
  tone: ScenarioTone;
  blurb: string;
  profile: ShockProfile;
  shocks: ShockMap;
};

export type Interaction = {
  id: string;
  kind: "compound" | "conflict";
  pair: [ScenarioId, ScenarioId];
  label: string;
  detail: string;
};

export type SeriesPoint = {
  t: number;
  iso: string;
  label: string;
  historical?: number;
  baseline?: number;
  scenario?: number;
  ciLow?: number;
  ciHigh?: number;
};

export type AssetProjection = {
  id: AssetId;
  last: number;
  projected: number;
  baseline: number;
  pct: number;
  vsBaseline: number;
  ciLow: number;
  ciHigh: number;
  series: SeriesPoint[];
};

export type MixInput = {
  active: Partial<Record<ScenarioId, boolean>>;
  weights: Record<ScenarioId, number>;
  horizon: HorizonMonths;
};

export type EngineResult = {
  asOf: string;
  horizon: HorizonMonths;
  conflict: number;
  compound: number;
  regime: "risk-on" | "risk-off" | "stagflation" | "fragmented" | "idle";
  interactions: Interaction[];
  netAnnual: ShockMap;
  assets: Record<AssetId, AssetProjection>;
};
