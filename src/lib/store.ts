import { create } from "zustand";
import { DEFAULT_VISIBLE, DEFAULT_WEIGHTS, SCENARIO_IDS } from "@/lib/engine/data";
import { runEngine } from "@/lib/engine/simulate";
import type { AssetId, BookMarks, EngineResult, HorizonMonths, ScenarioId } from "@/lib/engine/types";
import type { QuoteCurrency, QuotesSource, QuotesStatus } from "@/lib/market/types";

type DeskState = {
  active: Partial<Record<ScenarioId, boolean>>;
  weights: Record<ScenarioId, number>;
  visible: AssetId[];
  focused: AssetId | null;
  horizon: HorizonMonths;
  result: EngineResult;
  marks: BookMarks | null;
  quotesStatus: QuotesStatus;
  quotesSource: QuotesSource;
  quotesUpdatedAt: string | null;
  currencies: Partial<Record<AssetId, QuoteCurrency>>;
  toggle: (id: ScenarioId) => void;
  setWeight: (id: ScenarioId, weight: number) => void;
  setHorizon: (h: HorizonMonths) => void;
  toggleVisible: (id: AssetId) => void;
  setFocused: (id: AssetId | null) => void;
  applyPreset: (set: Partial<Record<ScenarioId, number>>) => void;
  clear: () => void;
  loadMix: (
    active: Partial<Record<ScenarioId, boolean>>,
    weights: Record<ScenarioId, number>,
    horizon: HorizonMonths,
  ) => void;
  applyMarks: (
    incoming: BookMarks,
    meta: { status: QuotesStatus; source: QuotesSource; currencies?: Partial<Record<AssetId, QuoteCurrency>> },
  ) => void;
  setQuotesStatus: (status: QuotesStatus) => void;
};

const INITIAL_ACTIVE: Partial<Record<ScenarioId, boolean>> = {
  taiwan: true,
  ai_boom: true,
};
const INITIAL_WEIGHTS: Record<ScenarioId, number> = {
  ...DEFAULT_WEIGHTS,
  taiwan: 100,
  ai_boom: 80,
};

function compute(
  active: Partial<Record<ScenarioId, boolean>>,
  weights: Record<ScenarioId, number>,
  horizon: HorizonMonths,
  marks: BookMarks | null,
) {
  return runEngine({ active, weights, horizon }, marks ?? undefined);
}

export const useDesk = create<DeskState>((set, get) => ({
  active: { ...INITIAL_ACTIVE },
  weights: { ...INITIAL_WEIGHTS },
  visible: [...DEFAULT_VISIBLE],
  focused: null,
  horizon: 12,
  result: compute(INITIAL_ACTIVE, INITIAL_WEIGHTS, 12, null),
  marks: null,
  quotesStatus: "idle",
  quotesSource: "static",
  quotesUpdatedAt: null,
  currencies: {},
  toggle: (id) => {
    const active = { ...get().active, [id]: !get().active[id] };
    if (!active[id]) delete active[id];
    set({ active, result: compute(active, get().weights, get().horizon, get().marks) });
  },
  setWeight: (id, weight) => {
    const weights = { ...get().weights, [id]: weight };
    const active = { ...get().active };
    if (weight > 0 && !active[id]) active[id] = true;
    set({ weights, active, result: compute(active, weights, get().horizon, get().marks) });
  },
  setHorizon: (horizon) => {
    set({ horizon, result: compute(get().active, get().weights, horizon, get().marks) });
  },
  toggleVisible: (id) => {
    const visible = get().visible.includes(id)
      ? get().visible.filter((x) => x !== id)
      : [...get().visible, id];
    const focused = get().focused === id && !visible.includes(id) ? null : get().focused;
    set({ visible: visible.length ? visible : [id], focused });
  },
  setFocused: (id) => {
    if (id && !get().visible.includes(id)) {
      set({ focused: id, visible: [...get().visible, id] });
      return;
    }
    set({ focused: id });
  },
  applyPreset: (mix) => {
    const active: Partial<Record<ScenarioId, boolean>> = {};
    const weights = { ...DEFAULT_WEIGHTS };
    for (const sid of SCENARIO_IDS) {
      const w = mix[sid];
      if (w && w > 0) {
        active[sid] = true;
        weights[sid] = w;
      }
    }
    set({ active, weights, result: compute(active, weights, get().horizon, get().marks) });
  },
  clear: () => {
    set({
      active: {},
      weights: { ...DEFAULT_WEIGHTS },
      result: compute({}, DEFAULT_WEIGHTS, get().horizon, get().marks),
    });
  },
  loadMix: (active, weights, horizon) => {
    set({ active, weights, horizon, result: compute(active, weights, horizon, get().marks) });
  },
  applyMarks: (incoming, meta) => {
    const prev = get().marks;
    const marks: BookMarks = {
      asOf: incoming.asOf || prev?.asOf || new Date().toISOString(),
      last: { ...prev?.last, ...incoming.last },
      history: { ...prev?.history, ...incoming.history },
    };
    if (!Object.keys(marks.last).length) return;
    set({
      marks,
      result: compute(get().active, get().weights, get().horizon, marks),
      quotesStatus: meta.status,
      quotesSource: meta.source,
      quotesUpdatedAt: marks.asOf,
      currencies: { ...get().currencies, ...meta.currencies },
    });
  },
  setQuotesStatus: (quotesStatus) => set({ quotesStatus }),
}));
