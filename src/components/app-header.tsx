"use client";

import { Link } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScenarioEngine } from "@/components/scenario-engine";
import { SavedDesks } from "@/components/saved-desks";
import { MeridianMark } from "@/components/meridian-mark";
import { LiveStatus } from "@/components/live-status";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { signOut } from "@/lib/auth/client";
import { useDesk } from "@/lib/store";
import type { HorizonMonths } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

const HORIZONS: HorizonMonths[] = [6, 12, 18, 24];

export function AppHeader() {
  const horizon = useDesk((s) => s.horizon);
  const setHorizon = useDesk((s) => s.setHorizon);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <MeridianMark className="size-6 sm:size-7" />
          <span className="leading-none">
            <span className="block font-display text-base tracking-[0.14em] sm:text-lg">MERIDIAN</span>
            <span className="hidden text-2xs uppercase tracking-[0.18em] text-muted-foreground sm:block">
              Scenario desk
            </span>
          </span>
        </Link>

        <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-3">
          <div className="flex rounded-sm border border-border p-0.5">
            {HORIZONS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHorizon(h)}
                className={cn(
                  "h-8 min-w-8 px-1.5 font-mono text-2xs tabular transition-colors sm:min-w-10 sm:px-2 sm:text-xs",
                  h === 18 && "hidden sm:inline-flex",
                  horizon === h ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {h}m
              </button>
            ))}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal />
                <span className="sr-only sm:not-sr-only">Engine</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" title="Scenario engine" className="h-[88vh]">
              <ScenarioEngine />
            </SheetContent>
          </Sheet>

          <LiveStatus />
          <SavedDesks />
          <AuthSlot />
        </div>
      </div>
    </header>
  );
}

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="size-8 shrink-0 animate-pulse rounded-full bg-secondary" />;
  }
  if (!user) {
    return (
      <Button asChild size="sm" variant="outline">
        <Link to="/login">Sign in</Link>
      </Button>
    );
  }
  const label = user.displayName ?? user.primaryEmail ?? "Account";
  return (
    <div className="flex items-center gap-2">
      {user.profileImageUrl ? (
        <img src={user.profileImageUrl} alt="" className="size-8 rounded-full object-cover" />
      ) : (
        <span className="grid size-8 place-items-center rounded-full bg-secondary font-mono text-xs">
          {label.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="hidden max-w-28 truncate text-xs sm:inline">{label}</span>
      <button
        type="button"
        onClick={() => void signOut()}
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Sign out
      </button>
    </div>
  );
}
