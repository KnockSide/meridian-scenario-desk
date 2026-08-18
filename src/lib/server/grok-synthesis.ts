import { createServerFn } from "@tanstack/react-start";
import { grokPrompt } from "@/lib/engine/synthesis";
import { runEngine } from "@/lib/engine/simulate";
import { DEFAULT_WEIGHTS } from "@/lib/engine/data";
import type { HorizonMonths, ScenarioId } from "@/lib/engine/types";

const cache = new Map<string, string>();

type Input = {
  active: Partial<Record<ScenarioId, boolean>>;
  weights: Record<ScenarioId, number>;
  horizon: HorizonMonths;
};

export const askDeskGrok = createServerFn({ method: "POST" })
  .validator((input: Input) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Grok is not available in this environment." };

    const weights = { ...DEFAULT_WEIGHTS, ...data.weights };
    const result = runEngine({ active: data.active, weights, horizon: data.horizon });
    const key = JSON.stringify({ a: data.active, w: data.weights, h: data.horizon });
    const hit = cache.get(key);
    if (hit) return { ok: true as const, text: hit };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 180,
        temperature: 0.5,
        messages: [{ role: "user", content: grokPrompt({ ...data, weights }, result) }],
      }),
    });
    if (!res.ok) return { ok: false as const, error: `Desk model unavailable (${res.status}).` };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false as const, error: "Empty synthesis." };
    cache.set(key, text);
    return { ok: true as const, text };
  });
