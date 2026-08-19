import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/legal/disclaimer")({ component: Disclaimer });

function Disclaimer() {
  return (
    <LegalPage title="Disclaimer">
      <p>
        Meridian is an educational scenario desk. Paths are produced by a house shock model applied to delayed market
        marks. They are theoretical, not a forecast of any asset, index, fund, or coin.
      </p>
      <p>
        Nothing on this site is an offer, solicitation, or recommendation to buy or sell anything. Nothing here is
        investment, legal, or tax advice. Marks may be delayed, incomplete, or wrong. History may be interpolated onto a
        weekly grid.
      </p>
      <p>
        Past prices and simulated paths do not predict future results. You are solely responsible for any decision you
        make.
      </p>
    </LegalPage>
  );
}
