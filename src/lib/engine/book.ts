import type { Asset, AssetId, EquityTheme, ScenarioId, ShockMap } from "./types";

function ink(ticker: string): string {
  let h = 0;
  for (let i = 0; i < ticker.length; i++) h = (h * 33 + ticker.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360} 16% 62%)`;
}

function eq(
  id: AssetId,
  name: string,
  last: number,
  theme: EquityTheme,
  mu: number,
  sigma: number,
): Asset {
  return { id, ticker: id, name, class: "equity", theme, last, kind: "usd", mu, sigma, colorVar: ink(id) };
}

export const BOOK_ASSETS: Asset[] = [
  eq("PLTR", "Palantir", 171.54, "ai", 0.2, 0.55),
  eq("GOOGL", "Alphabet", 204.2, "ai", 0.12, 0.26),
  eq("META", "Meta", 590, "ai", 0.12, 0.32),
  eq("ORCL", "Oracle", 144, "ai", 0.11, 0.28),
  eq("SNOW", "Snowflake", 196, "ai", 0.1, 0.42),
  eq("NOW", "ServiceNow", 119.47, "ai", 0.12, 0.32),
  eq("NET", "Cloudflare", 198, "ai", 0.14, 0.44),
  eq("AVGO", "Broadcom", 368, "semi", 0.16, 0.36),
  eq("AMD", "AMD", 422, "semi", 0.18, 0.44),
  eq("TSM", "TSMC", 248, "semi", 0.14, 0.32),
  eq("ARM", "Arm", 239, "semi", 0.16, 0.42),
  eq("MU", "Micron", 176, "semi", 0.14, 0.4),
  eq("AMAT", "Applied Materials", 505, "semi", 0.14, 0.34),
  eq("LRCX", "Lam Research", 328, "semi", 0.15, 0.36),
  eq("SNPS", "Synopsys", 472, "semi", 0.12, 0.3),
  eq("MRVL", "Marvell", 213, "semi", 0.16, 0.42),
  eq("ANET", "Arista", 128, "semi", 0.14, 0.34),
  eq("KLAC", "KLA", 1088, "semi", 0.13, 0.32),
  eq("PANW", "Palo Alto", 376, "cyber", 0.14, 0.36),
  eq("FTNT", "Fortinet", 98, "cyber", 0.12, 0.32),
  eq("ZS", "Zscaler", 232, "cyber", 0.14, 0.42),
  eq("RTX", "RTX", 224, "defense", 0.08, 0.22),
  eq("NOC", "Northrop Grumman", 589, "defense", 0.08, 0.22),
  eq("BA", "Boeing", 218, "defense", 0.07, 0.34),
  eq("GD", "General Dynamics", 396, "defense", 0.08, 0.2),
  eq("AVAV", "AeroVironment", 268, "defense", 0.12, 0.48),
  eq("RKLB", "Rocket Lab", 79.16, "space", 0.16, 0.7),
  eq("CEG", "Constellation", 312, "energy", 0.1, 0.32),
  eq("VST", "Vistra", 188, "energy", 0.12, 0.38),
  eq("OKLO", "Oklo", 92, "energy", 0.18, 0.85),
  eq("SMR", "NuScale", 38.4, "energy", 0.16, 0.8),
  eq("FSLR", "First Solar", 196, "energy", 0.12, 0.46),
  eq("BE", "Bloom Energy", 28.6, "energy", 0.14, 0.62),
  eq("MP", "MP Materials", 58.2, "materials", 0.14, 0.58),
  eq("ALB", "Albemarle", 84, "materials", 0.1, 0.48),
  eq("ISRG", "Intuitive Surgical", 528, "bio", 0.12, 0.28),
  eq("VRTX", "Vertex", 418, "bio", 0.11, 0.3),
  eq("TMO", "Thermo Fisher", 498, "bio", 0.09, 0.22),
  eq("SIE", "Siemens", 228, "industrial", 0.09, 0.24),
  eq("ROK", "Rockwell", 336, "industrial", 0.08, 0.26),
  eq("ABB", "ABB", 62.4, "industrial", 0.09, 0.24),
  eq("DE", "Deere", 468, "industrial", 0.08, 0.28),
  eq("CAT", "Caterpillar", 412, "industrial", 0.08, 0.26),
  eq("HON", "Honeywell", 216, "industrial", 0.07, 0.2),
  eq("EMR", "Emerson", 134, "industrial", 0.08, 0.24),
  eq("IONQ", "IonQ", 48.2, "quantum", 0.16, 0.85),
  eq("RGTI", "Rigetti", 16.8, "quantum", 0.14, 0.95),
  eq("COIN", "Coinbase", 274, "rails", 0.16, 0.7),
  eq("HOOD", "Robinhood", 92, "rails", 0.14, 0.65),
  eq("UBER", "Uber", 88.4, "mobility", 0.1, 0.38),
  eq("RIVN", "Rivian", 13.6, "mobility", 0.12, 0.72),
];

export const THEME_GROUPS: Record<EquityTheme, AssetId[]> = {
  ai: ["PLTR", "GOOGL", "META", "ORCL", "SNOW", "NOW", "NET"],
  semi: ["AVGO", "AMD", "TSM", "ARM", "MU", "AMAT", "LRCX", "SNPS", "MRVL", "ANET", "KLAC"],
  cyber: ["PANW", "FTNT", "ZS"],
  defense: ["RTX", "NOC", "BA", "GD", "AVAV"],
  space: ["RKLB"],
  energy: ["CEG", "VST", "OKLO", "SMR", "FSLR", "BE"],
  materials: ["MP", "ALB"],
  bio: ["ISRG", "VRTX", "TMO"],
  industrial: ["SIE", "ROK", "ABB", "DE", "CAT", "HON", "EMR"],
  quantum: ["IONQ", "RGTI"],
  rails: ["COIN", "HOOD"],
  mobility: ["UBER", "RIVN"],
  consumer: [],
};

export const THEME_LABEL: Record<EquityTheme, string> = {
  ai: "AI",
  semi: "Semi",
  cyber: "Cyber",
  defense: "Defense",
  energy: "Energy",
  bio: "Bio",
  industrial: "Industry",
  space: "Space",
  materials: "Materials",
  quantum: "Quantum",
  rails: "Rails",
  mobility: "Mobility",
  consumer: "Consumer",
};

type ThemeShock = Partial<Record<EquityTheme, number>>;

const TEMPLATES: Record<ScenarioId, ThemeShock> = {
  rate_cut: { ai: 0.1, semi: 0.12, cyber: 0.08, defense: 0.02, space: 0.1, energy: 0.04, materials: 0.04, bio: 0.06, industrial: 0.06, quantum: 0.12, rails: 0.16, mobility: 0.1 },
  rate_hike: { ai: -0.1, semi: -0.14, cyber: -0.1, defense: 0.01, space: -0.16, energy: -0.06, materials: -0.08, bio: -0.06, industrial: -0.08, quantum: -0.18, rails: -0.2, mobility: -0.14 },
  recession: { ai: -0.14, semi: -0.16, cyber: -0.1, defense: -0.04, space: -0.22, energy: -0.08, materials: -0.1, bio: -0.08, industrial: -0.12, quantum: -0.24, rails: -0.22, mobility: -0.2 },
  ai_boom: { ai: 0.24, semi: 0.2, cyber: 0.08, defense: 0.03, space: 0.04, energy: 0.08, materials: 0.04, bio: 0.03, industrial: 0.06, quantum: 0.14, rails: 0.06, mobility: 0.04 },
  taiwan: { ai: -0.08, semi: -0.28, cyber: -0.03, defense: 0.04, space: -0.04, energy: -0.02, materials: 0.02, bio: -0.01, industrial: -0.05, quantum: -0.06, rails: -0.04, mobility: -0.04 },
  crypto_ban: { rails: -0.48, ai: -0.01, mobility: -0.01 },
  quantum: { quantum: 0.58, semi: 0.1, ai: 0.08, cyber: 0.04, industrial: 0.03, space: 0.04 },
  hyperinflation: { materials: 0.12, energy: 0.1, rails: 0.14, industrial: 0.04, ai: 0.06, bio: 0.04, mobility: 0.06, defense: 0.03, space: 0.04 },
  spot_etf: { rails: 0.36, ai: 0.02 },
  green_energy: { energy: 0.32, materials: 0.14, mobility: 0.18, industrial: 0.06, ai: 0.03, semi: 0.04, defense: -0.02 },
  tax_cuts: { ai: 0.14, semi: 0.12, cyber: 0.1, industrial: 0.1, rails: 0.1, bio: 0.08, energy: 0.06, mobility: 0.08, defense: 0.04, space: 0.08, quantum: 0.1 },
  web3: { rails: 0.14, ai: 0.06, mobility: 0.08, cyber: 0.03 },
  peace: { defense: -0.2, space: -0.1, ai: 0.05, industrial: 0.05, bio: 0.03, mobility: 0.04, rails: 0.04 },
  qe_restart: { ai: 0.12, semi: 0.1, rails: 0.16, energy: 0.06, space: 0.1, quantum: 0.12, mobility: 0.08, industrial: 0.05 },
  cyber_attack: { cyber: 0.4, ai: -0.1, industrial: -0.08, rails: -0.12, semi: -0.06, space: -0.08, mobility: -0.08 },
  cre_crash: { industrial: -0.03, ai: -0.02, rails: -0.04 },
  ai_reg: { ai: -0.14, semi: -0.08, quantum: 0.1, rails: -0.04 },
  solar_flare: { energy: 0.08, industrial: -0.1, ai: -0.16, space: -0.22, cyber: -0.06, rails: -0.14, semi: -0.08, mobility: -0.1 },
  dedollar: { materials: 0.08, energy: 0.06, rails: 0.04, ai: -0.08, semi: -0.06, industrial: -0.04 },
  tether: { rails: -0.42 },
  hyper_auto: { industrial: 0.3, ai: 0.1, semi: 0.08, mobility: 0.08, energy: 0.03, cyber: 0.04 },
  iot_ransom: { cyber: 0.44, industrial: -0.16, ai: -0.08, semi: -0.06, mobility: -0.08, energy: -0.06 },
  rare_earth: { materials: 0.58, mobility: -0.24, semi: -0.1, industrial: -0.12, energy: -0.06, ai: -0.05, defense: 0.06 },
  ubi: { mobility: 0.08, rails: 0.12, ai: 0.04, industrial: 0.03, bio: 0.04 },
  cbdc: { rails: 0.2, cyber: 0.05, ai: -0.02 },
  debt_default: { ai: -0.2, semi: -0.22, cyber: -0.12, defense: 0.04, space: -0.16, energy: -0.08, materials: 0.08, bio: -0.1, industrial: -0.14, quantum: -0.2, rails: -0.18, mobility: -0.16 },
  longevity: { bio: 0.38, industrial: -0.02, ai: 0.03, defense: -0.03 },
  crop_fail: { industrial: 0.04, materials: 0.04, bio: 0.05, ai: -0.07, rails: -0.06, mobility: -0.08, semi: -0.06 },
  labor_gap: { industrial: 0.2, ai: 0.1, bio: 0.04, semi: 0.08, mobility: -0.04, defense: -0.05 },
  kessler: { space: 0.38, defense: 0.16, ai: -0.12, rails: -0.1, semi: -0.08, mobility: -0.1, industrial: -0.06 },
  asteroid: { materials: -0.22, space: 0.16, rails: 0.08, energy: -0.04, industrial: 0.03 },
  algo_war: { rails: -0.34, ai: -0.26, semi: -0.28, quantum: -0.22, cyber: -0.12, industrial: -0.16, space: -0.2, mobility: -0.22, bio: -0.14, energy: -0.1 },
};

export function applyBookShocks(scenarios: Array<{ id: ScenarioId; shocks: ShockMap }>) {
  for (const s of scenarios) {
    const t = TEMPLATES[s.id];
    if (!t) continue;
    for (const [theme, v] of Object.entries(t) as Array<[EquityTheme, number]>) {
      for (const id of THEME_GROUPS[theme]) s.shocks[id] = v;
    }
    if (s.id === "taiwan") {
      s.shocks.TSM = -0.36;
      s.shocks.AMAT = -0.3;
      s.shocks.LRCX = -0.3;
      s.shocks.ASML = s.shocks.ASML ?? -0.32;
    }
    if (s.id === "ai_boom") s.shocks.PLTR = 0.32;
    if (s.id === "quantum") {
      s.shocks.IONQ = 0.62;
      s.shocks.RGTI = 0.58;
    }
    if (s.id === "green_energy") {
      s.shocks.OKLO = 0.42;
      s.shocks.SMR = 0.38;
      s.shocks.FSLR = 0.36;
      s.shocks.RIVN = 0.28;
    }
    if (s.id === "rare_earth") s.shocks.MP = 0.7;
    if (s.id === "kessler") s.shocks.RKLB = 0.46;
    if (s.id === "peace") {
      s.shocks.RTX = -0.22;
      s.shocks.NOC = -0.2;
      s.shocks.AVAV = -0.24;
    }
    if (s.id === "crop_fail") s.shocks.DE = 0.16;
  }
}
