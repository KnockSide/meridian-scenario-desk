import { createFileRoute } from "@tanstack/react-router";
import { DEFAULT_VISIBLE } from "@/lib/engine/data";
import { parseAssetIds } from "@/lib/market/symbols";
import { getSnapshot } from "@/lib/server/market/snapshot";

export const Route = createFileRoute("/api/market/snapshot")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const ids = parseAssetIds(url.searchParams.get("ids"));
        const history = url.searchParams.get("history") !== "0";
        try {
          const body = await getSnapshot(ids.length ? ids : DEFAULT_VISIBLE, { history });
          return Response.json(body, {
            headers: { "cache-control": "public, max-age=15" },
          });
        } catch (err) {
          console.error("[market] snapshot", err);
          return Response.json(
            { error: "Market snapshot unavailable" },
            { status: 502 },
          );
        }
      },
    },
  },
});
