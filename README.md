# Meridian — Scenario Desk

Theoretical price paths for tech, ETFs, funds, and crypto under stacked macro, geo, and sector events.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:8080`).

## Use

- Toggle events in the **Scenario engine**. Weights stack; conflicting pairs widen the cone.
- Tap an asset card to solo the path. The pip adds it to the indexed book.
- Filter events (Bull / Bear / Macro / Geo / Sector) and marks (Equity / ETF / Fund / Crypto).
- Sign in to save named desks.

Marks as of 18 Aug 2026. Paths are a house shock model — not a forecast, offer, or advice.

## Build

```bash
npm run build
npm run typecheck
```
