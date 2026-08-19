import { Link } from "@tanstack/react-router";

export function LegalLinks({ className }: { className?: string }) {
  return (
    <span className={className}>
      <Link to="/legal/disclaimer" className="underline-offset-4 hover:text-foreground hover:underline">
        Disclaimer
      </Link>
      <span className="mx-2">·</span>
      <Link to="/legal/privacy" className="underline-offset-4 hover:text-foreground hover:underline">
        Privacy
      </Link>
      <span className="mx-2">·</span>
      <Link to="/legal/terms" className="underline-offset-4 hover:text-foreground hover:underline">
        Terms
      </Link>
    </span>
  );
}
