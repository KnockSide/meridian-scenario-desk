import { useEffect, useRef } from "react";
import { ASSET_IDS } from "@/lib/engine/data";
import { useDesk } from "@/lib/store";
import type { AssetId } from "@/lib/engine/types";
import type { MarketSnapshot } from "./types";

const HOT_MS = 30_000;
const FULL_MS = 240_000;

function hotIds(visible: AssetId[], focused: AssetId | null): AssetId[] {
  const set = new Set(visible);
  if (focused) set.add(focused);
  return [...set];
}

async function pull(ids: AssetId[], history: boolean): Promise<MarketSnapshot> {
  const params = new URLSearchParams({
    ids: ids.join(","),
    history: history ? "1" : "0",
  });
  const res = await fetch(`/api/market/snapshot?${params}`);
  if (!res.ok) throw new Error(`snapshot ${res.status}`);
  return (await res.json()) as MarketSnapshot;
}

export function useLiveMarks() {
  const visible = useDesk((s) => s.visible);
  const focused = useDesk((s) => s.focused);
  const applyMarks = useDesk((s) => s.applyMarks);
  const setQuotesStatus = useDesk((s) => s.setQuotesStatus);
  const visibleRef = useRef(visible);
  const focusedRef = useRef(focused);
  const hasMarks = useRef(false);
  visibleRef.current = visible;
  focusedRef.current = focused;

  useEffect(() => {
    let cancelled = false;

    async function tick(kind: "hot" | "full") {
      if (typeof document !== "undefined" && document.hidden) return;
      const ids = kind === "full" ? [...ASSET_IDS] : hotIds(visibleRef.current, focusedRef.current);
      if (!ids.length) return;
      if (!hasMarks.current) setQuotesStatus("loading");
      try {
        const snap = await pull(ids, kind === "hot");
        if (cancelled) return;
        if (!Object.keys(snap.last).length) {
          setQuotesStatus(hasMarks.current ? "stale" : "fallback");
          return;
        }
        hasMarks.current = true;
        applyMarks(snap, {
          status: snap.source === "static" ? "fallback" : "live",
          source: snap.source,
          currencies: snap.currencies,
        });
      } catch {
        if (cancelled) return;
        setQuotesStatus(hasMarks.current ? "stale" : "fallback");
      }
    }

    void tick("hot");
    const later = window.setTimeout(() => void tick("full"), 1200);
    const hot = window.setInterval(() => void tick("hot"), HOT_MS);
    const full = window.setInterval(() => void tick("full"), FULL_MS);
    const onVis = () => {
      if (!document.hidden) void tick("hot");
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      window.clearTimeout(later);
      window.clearInterval(hot);
      window.clearInterval(full);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [applyMarks, setQuotesStatus]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const snap = await pull(hotIds(visible, focused), true);
        if (cancelled || !Object.keys(snap.last).length) return;
        hasMarks.current = true;
        applyMarks(snap, {
          status: snap.source === "static" ? "fallback" : "live",
          source: snap.source,
          currencies: snap.currencies,
        });
      } catch {
        if (!cancelled && hasMarks.current) setQuotesStatus("stale");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, focused, applyMarks, setQuotesStatus]);
}
