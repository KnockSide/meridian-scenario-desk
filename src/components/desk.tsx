"use client";

import { AppHeader } from "@/components/app-header";
import { AssetCards } from "@/components/asset-cards";
import { PriceChart } from "@/components/price-chart";
import { ScenarioEngine } from "@/components/scenario-engine";
import { SynthesisPanel } from "@/components/synthesis-panel";
import { AS_OF_LABEL } from "@/lib/engine/data";

export function Desk() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto grid max-w-[1440px] grid-cols-1 gap-4 px-3 py-4 sm:px-6 sm:py-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-5">
        <aside className="hidden min-h-0 rounded-xl border border-border bg-card lg:sticky lg:top-20 lg:block lg:max-h-[calc(100dvh-6.5rem)] lg:overflow-hidden">
          <ScenarioEngine className="max-h-[calc(100dvh-6.5rem)]" />
        </aside>
        <div className="flex min-w-0 flex-col gap-4">
          <PriceChart />
          <AssetCards />
          <SynthesisPanel />
          <p className="pb-6 text-2xs leading-relaxed text-muted-foreground">
            Theoretical paths from reconstructed history and a house shock model. Marks as of {AS_OF_LABEL}.
            Not a forecast, offer, or advice. Compounding is multiplicative; conflict widens the cone.
          </p>
        </div>
      </main>
    </div>
  );
}
