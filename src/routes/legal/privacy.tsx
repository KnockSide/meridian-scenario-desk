import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/legal/privacy")({ component: Privacy });

function Privacy() {
  return (
    <LegalPage title="Privacy">
      <p>
        If you sign in, we store your account identity (name, email, avatar from the auth provider) and any desks you
        save. Saved desks are the scenario mix, weights, and horizon you choose — not your brokerage holdings.
      </p>
      <p>
        Market marks are fetched from third-party quote providers. Those requests do not include your account.
        Onboarding dismissal is stored in your browser (localStorage).
      </p>
      <p>
        We do not sell personal data. Session cookies (or a bearer token in preview) keep you signed in. You can sign
        out at any time. To delete an account or saved desks, contact the operator of this deployment.
      </p>
    </LegalPage>
  );
}
