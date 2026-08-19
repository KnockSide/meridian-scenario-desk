# Meridian — Scenario Desk

Theoretical price paths for tech, ETFs, funds, and crypto under stacked macro, geo, and sector events.

**Repo:** [github.com/KnockSide/meridian-scenario-desk](https://github.com/KnockSide/meridian-scenario-desk)

## Run locally

```bash
git clone https://github.com/KnockSide/meridian-scenario-desk.git
cd meridian-scenario-desk
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:8080`).

## Use

- Toggle events in the **Scenario engine**. Weights stack; conflicting pairs widen the cone.
- Tap an asset card to solo the path. The pip adds it to the indexed book.
- Filter events (Bull / Bear / Macro / Geo / Sector) and marks (Equity / ETF / Fund / Crypto).
- Sign in to save named desks.

Marks are delayed quotes (Yahoo by default; set `FINNHUB_API_KEY` to prefer Finnhub). Paths are a house shock model — not a forecast, offer, or advice.

## Public site (Vercel)

The build target is Vercel (`nitro` preset). From the repo root:

```bash
npx vercel login
npx vercel --prod -b VITE_AUTH_ENABLED=false -e VITE_AUTH_ENABLED=false
```

Set `VITE_AUTH_ENABLED=false` so Grok-preview OAuth is not shown. The desk, live marks, and legal pages stay public. Optional: `FINNHUB_API_KEY` if Yahoo is blocked from Vercel IPs.

## Build

```bash
npm run build
npm run typecheck
```
