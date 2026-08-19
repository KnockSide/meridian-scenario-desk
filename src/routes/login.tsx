import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { MeridianMark } from "@/components/meridian-mark";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-6 text-foreground">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center gap-2.5">
          <MeridianMark />
          <span>
            <span className="block font-display text-xl tracking-[0.14em]">MERIDIAN</span>
            <span className="text-2xs uppercase tracking-[0.18em] text-muted-foreground">
              Scenario desk
            </span>
          </span>
        </Link>
        <h1 className="font-display text-3xl tracking-tight">Sign in to save desks</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The simulator is open. An account keeps named scenario mixes on this book.
        </p>
        <div className="mt-8 space-y-2">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                Continue with {p.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Sign-in is disabled.</p>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="underline-offset-4 hover:text-foreground hover:underline">
            Back to the desk
          </Link>
          <span className="mx-2">·</span>
          <Link to="/legal/disclaimer" className="underline-offset-4 hover:text-foreground hover:underline">
            Disclaimer
          </Link>
        </p>
      </div>
    </main>
  );
}
