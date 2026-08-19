"use client";

import { AppHeader } from "@/components/app-header";
import { AssetCards } from "@/components/asset-cards";
import { LegalLinks } from "@/components/legal-links";
import { Onboarding } from "@/components/onboarding";
import { PriceChart } from "@/components/price-chart";
import { ScenarioEngine } from "@/components/scenario-engine";
import { SynthesisPanel } from "@/components/synthesis-panel";
import { useLiveMarks } from "@/lib/market/use-live-marks";
import { useDesk } from "@/lib/store";
import { formatAsOfLabel } from "@/lib/utils";

export function Desk() {
  useLiveMarks();
  const asOf = useDesk((s) => s.result.asOf);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto grid max-w-[1440px] grid-cols-1 gap-4 px-3 py-4 sm:px-6 sm:py-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-5">
        <aside className="hidden min-h-0 rounded-xl border border-border bg-card lg:sticky lg:top-20 lg:block lg:max-h-[calc(100dvh-6.5rem)] lg:overflow-hidden">
          <ScenarioEngine className="max-h-[calc(100dvh-6.5rem)]" />
        </aside>
        <div className="flex min-w-0 flex-col gap-4">
          <Onboarding />
          <PriceChart />
          <AssetCards />
          <SynthesisPanel />
          <p className="pb-6 text-2xs leading-relaxed text-muted-foreground">
            Theoretical paths from a house shock model, rebased to delayed marks as of {formatAsOfLabel(asOf)}.
            Not a forecast, offer, or advice. Compounding is multiplicative; conflict widens the cone. Marks may be
            incomplete. <LegalLinks />
          </p>
        </div>
      </main>
    </div>
  );
}
