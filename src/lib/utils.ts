import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  value: number,
  kind: "usd" | "index" | "crypto",
  currency: "USD" | "EUR" | "GBP" = "USD",
): string {
  const ccy = kind === "crypto" ? "USD" : currency;
  if (kind === "crypto" && value >= 1000) {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: ccy,
      maximumFractionDigits: 0,
    });
  }
  if (kind === "crypto" && value < 1) {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: ccy,
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
  }
  if (kind === "crypto" && value < 10) {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: ccy,
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  }
  if (kind === "index") {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: ccy,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPct(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatCompactDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

export function formatAsOfLabel(iso: string): string {
  const day = iso.length >= 10 ? iso.slice(0, 10) : iso;
  const d = new Date(`${day}T00:00:00Z`);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatMarkTime(iso: string): string {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
    timeZoneName: "short",
  });
}
