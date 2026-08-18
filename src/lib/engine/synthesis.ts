import { ASSET_BY_ID, SCENARIO_BY_ID } from "./data";
import type { AssetId, EngineResult, MixInput, ScenarioId } from "./types";
import { activeIds } from "./simulate";

const RANK: AssetId[] = [
  "NVDA",
  "ASML",
  "TSLA",
  "AAPL",
  "MSFT",
  "AMZN",
  "CRWD",
  "MSTR",
  "RHM",
  "LMT",
  "LLY",
  "NVO",
  "WMT",
  "QQQ",
  "SMH",
  "ARKK",
  "BOTZ",
  "IGLN",
  "DBA",
  "VNQ",
  "TLT",
  "BTC",
  "ETH",
  "SOL",
  "XMR",
  "TAO",
  "DOGE",
  "SPX",
  "URTH",
];

function namedList(ids: ScenarioId[], weights: MixInput["weights"]) {
  return ids
    .map((id) => {
      const w = Math.round(weights[id] ?? 100);
      return w === 100 ? SCENARIO_BY_ID[id].short : `${SCENARIO_BY_ID[id].short} (${w}%)`;
    })
    .join(", ");
}

export function localSynthesis(input: MixInput, result: EngineResult): string {
  const ids = activeIds(input.active);
  if (ids.length === 0) {
    return "No events are armed. The cone is the unshocked baseline — historical drift with no stacked macro, geo, or sector impulse. Toggle a scenario, or load a desk preset, to bend the path.";
  }

  const ranked = RANK.map((id) => result.assets[id]).sort((a, b) => b.pct - a.pct);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  const nvda = result.assets.NVDA;
  const btc = result.assets.BTC;
  const qqq = result.assets.QQQ;
  const igln = result.assets.IGLN;
  const vnq = result.assets.VNQ;
  const tao = result.assets.TAO;

  const parts: string[] = [];
  parts.push(
    `Stacking ${namedList(ids, input.weights)} over ${result.horizon} months produces a ${regimePhrase(result.regime)} book.`,
  );

  if (result.interactions.length) {
    const compounds = result.interactions.filter((i) => i.kind === "compound");
    const conflicts = result.interactions.filter((i) => i.kind === "conflict");
    if (compounds.length && conflicts.length) {
      parts.push(
        `${compounds[0].label}, but ${conflicts[0].label.toLowerCase()} — the two do not add linearly, so the cone widens.`,
      );
    } else if (compounds.length) {
      parts.push(`${compounds[0].detail}`);
    } else if (conflicts.length) {
      parts.push(`${conflicts[0].detail}`);
    }
  }

  if (best && worst) {
    parts.push(
      `${ASSET_BY_ID[best.id].name} leads at ${fmt(best.pct)} from the 18 Aug mark, while ${ASSET_BY_ID[worst.id].name} prints ${fmt(worst.pct)}.`,
    );
  }

  if (ids.includes("taiwan") && ids.includes("ai_boom")) {
    parts.push(
      `Model demand wants more silicon than a Taiwan shock can ship — NVIDIA (${fmt(nvda.pct)}) and ASML lag the software complex even as QQQ still clears ${fmt(qqq.pct)}.`,
    );
  } else if (ids.includes("ai_boom") && ids.includes("ai_reg")) {
    parts.push(
      `The capex cycle is real and the copyright bar is real. Listed AI is capped; Bittensor at ${fmt(tao.pct)} is the overflow valve.`,
    );
  } else if (ids.includes("rate_cut") && ids.includes("ai_boom")) {
    parts.push(
      `Duration and capex rhyme: the cut cheapens the AI spend cycle, which is why hardware and cloud pull away from the cash-flow-weighted S&P.`,
    );
  } else if (ids.includes("crypto_ban") && ids.includes("hyperinflation")) {
    parts.push(
      `The unit of account is failing at the same moment the hedge is outlawed. Bitcoin’s residual ${fmt(btc.pct)} is a black-market premium; gold at ${fmt(igln.pct)} takes the clean bid.`,
    );
  } else if (ids.length === 1 && ids[0] === "tether") {
    parts.push(
      `A USDT gap is a crypto-liquidity event, not an equity event. Coins print the hole; the listed book barely moves.`,
    );
  } else if (ids.includes("tether")) {
    parts.push(
      `Tether’s break empties the quote for coins while leaving the listed book almost uncorrelated. Treat MSTR as the equity expression of that hole.`,
    );
  } else if (ids.includes("cre_crash")) {
    parts.push(
      `Office values, not the AI tape, set the REIT path — VNQ at ${fmt(vnq.pct)} is the vacancy, not the discount rate.`,
    );
  } else if (ids.includes("dedollar") || (ids.includes("hyperinflation") && ids.includes("qe_restart"))) {
    parts.push(
      `When the reserve unit is in doubt, IGLN at ${fmt(igln.pct)} is the clean refuge. BTC tags along as neutral money, not as a tech proxy.`,
    );
  } else if (ids.includes("rate_hike") && ids.includes("recession")) {
    parts.push(
      `A hike into contracting demand is the hard-landing tape — multiples and earnings compress together, and high-beta names take the first bid.`,
    );
  } else if (ids.includes("solar_flare")) {
    parts.push(
      `A dark grid is not a multiple story. Anything that lives on electricity is marked down; gold keeps a bid because it does not need a socket.`,
    );
  } else if (ids.includes("spot_etf") && ids.includes("qe_restart")) {
    parts.push(
      `New pipes meet printed money. BTC at ${fmt(btc.pct)} is the institutional bid, not a retail squeeze.`,
    );
  } else if (ids.includes("quantum")) {
    parts.push(
      `A fault-tolerant milestone re-rates the compute stack and simultaneously reprices cryptographic trust. Coins and cloud do not travel together.`,
    );
  } else if (ids.includes("peace")) {
    parts.push(
      `A settlement takes the fear premium out of gold and defense. World equities recover; Rheinmetall gives the war bid back.`,
    );
  } else if (ids.includes("hyper_auto") && ids.includes("labor_gap")) {
    parts.push(
      `The shop floor is empty and the warehouse no longer needs hands. Amazon and BOTZ are the substitute; Walmart is the wage bill.`,
    );
  } else if (ids.includes("rare_earth") && ids.includes("green_energy")) {
    parts.push(
      `A battery leap still needs oxides the embargo will not ship. Tesla’s green bid is bound; Cameco is not the magnet, but it is the domestic-resource bid.`,
    );
  } else if (ids.includes("cbdc")) {
    parts.push(
      `Cash dies on a timetable. Monero is the exit; XRP, closer to the rail, does not travel with it.`,
    );
  } else if (ids.includes("debt_default")) {
    parts.push(
      `A G7 miss is not a multiple story. The S&P and MSCI World gap; gold is the bid that still clears.`,
    );
  } else if (ids.includes("asteroid")) {
    parts.push(
      `The metal is no longer scarce. Gold gives up the store-of-value seat; Bitcoin is what remains absolutely finite.`,
    );
  } else if (ids.includes("algo_war")) {
    parts.push(
      `The print is a close, not a valuation. Treat the median as a halt and the cone as the reopen.`,
    );
  } else if (ids.includes("kessler")) {
    parts.push(
      `GPS is an input to the tape. Lockheed is the rebuild; anything that prices off a satellite clock is marked down.`,
    );
  } else if (ids.includes("longevity")) {
    parts.push(
      `The actuarial book is the short. Lilly and Novo re-rate; duration that assumed a shorter life is offered.`,
    );
  } else if (ids.includes("crop_fail")) {
    parts.push(
      `Calories clear first. DBA is the harvest; discretionary tech is what does not get bought.`,
    );
  }

  if (result.conflict > 0.6) {
    parts.push("Conflict is high: treat the median as a sketch and the band as the honest output.");
  } else if (result.compound > 0.6 && result.conflict < 0.25) {
    parts.push("The live pair compounds in the same direction, so the median is more decisive than the band.");
  }

  return parts.join(" ");
}

function fmt(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

function regimePhrase(regime: EngineResult["regime"]) {
  switch (regime) {
    case "risk-on":
      return "risk-on";
    case "risk-off":
      return "risk-off";
    case "stagflation":
      return "stagflationary";
    case "fragmented":
      return "fragmented, wide-cone";
    case "idle":
      return "unchanged";
  }
}

export function grokPrompt(input: MixInput, result: EngineResult): string {
  const ids = activeIds(input.active);
  const rows = RANK.map((id) => {
    const a = result.assets[id];
    return `${id} ${a.pct.toFixed(1)}% (vs baseline ${a.vsBaseline.toFixed(1)}%)`;
  }).join("; ");
  const ixs = result.interactions.map((i) => `${i.kind}: ${i.label}`).join(" | ");
  return `You are the house strategist on an institutional scenario desk called Meridian. Write 2–3 tight sentences (max 80 words) explaining why this combination of events produces these projected moves. Voice: dry, specific, no greeting, no emoji, no "as an AI", no advice disclaimer, no exclamation marks. Mention compounding or conflict if present.

Events: ${ids.map((id) => `${SCENARIO_BY_ID[id].name} @ ${Math.round(input.weights[id] ?? 100)}%`).join("; ")}
Horizon: ${result.horizon} months
Regime: ${result.regime}
Interactions: ${ixs || "none"}
Projected total return vs today: ${rows}`;
}
