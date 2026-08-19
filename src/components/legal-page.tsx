import { Link } from "@tanstack/react-router";
import { MeridianMark } from "@/components/meridian-mark";
import type { ReactNode } from "react";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-background px-4 py-10 text-foreground sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <MeridianMark className="size-6" />
          <span className="font-display text-base tracking-[0.14em]">MERIDIAN</span>
        </Link>
        <h1 className="font-display text-3xl tracking-tight">{title}</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
        <p className="mt-10 text-xs">
          <Link to="/" className="underline-offset-4 hover:text-foreground hover:underline">
            Back to the desk
          </Link>
          <span className="mx-2 text-border">·</span>
          <Link to="/legal/disclaimer" className="underline-offset-4 hover:text-foreground hover:underline">
            Disclaimer
          </Link>
          <span className="mx-2 text-border">·</span>
          <Link to="/legal/privacy" className="underline-offset-4 hover:text-foreground hover:underline">
            Privacy
          </Link>
          <span className="mx-2 text-border">·</span>
          <Link to="/legal/terms" className="underline-offset-4 hover:text-foreground hover:underline">
            Terms
          </Link>
        </p>
      </div>
    </main>
  );
}
