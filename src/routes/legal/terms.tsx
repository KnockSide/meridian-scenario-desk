import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/legal/terms")({ component: Terms });

function Terms() {
  return (
    <LegalPage title="Terms">
      <p>
        By using Meridian you agree that the desk is provided “as is”, without warranty of any kind. We do not promise
        uninterrupted service, accurate marks, or that the shock model is complete or calibrated to any market.
      </p>
      <p>
        You will not use the desk as the sole basis for investment decisions. You will not scrape, overload, or
        redistribute market data obtained through this app in a way that violates a data vendor’s terms.
      </p>
      <p>
        Saved desks belong to your account on this deployment. We may change or withdraw features, including quote
        coverage, at any time. These terms are governed by the laws applicable to the operator of this deployment.
      </p>
    </LegalPage>
  );
}
