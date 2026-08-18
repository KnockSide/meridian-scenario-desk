import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { HorizonMonths, ScenarioId } from "@/lib/engine/types";

export type SavedDesk = {
  id: number;
  name: string;
  active: Partial<Record<ScenarioId, boolean>>;
  weights: Record<ScenarioId, number>;
  horizon: HorizonMonths;
  createdAt: string;
};

export const listDesks = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      name: string;
      active: unknown;
      weights: unknown;
      horizon_months: number;
      created_at: string;
    }>`
      select id, name, active, weights, horizon_months, created_at
      from saved_desks
      where user_id = ${context.userId}
      order by id desc
    `;
    return rows.map(
      (r): SavedDesk => ({
        id: r.id,
        name: r.name,
        active: (typeof r.active === "string" ? JSON.parse(r.active) : r.active) ?? {},
        weights: (typeof r.weights === "string" ? JSON.parse(r.weights) : r.weights) ?? {},
        horizon: r.horizon_months as HorizonMonths,
        createdAt: r.created_at,
      }),
    );
  });

export const saveDesk = createServerFn({ method: "POST" })
  .validator((input: { name: string; active: SavedDesk["active"]; weights: SavedDesk["weights"]; horizon: HorizonMonths }) => ({
    name: input.name.trim().slice(0, 64),
    active: input.active,
    weights: input.weights,
    horizon: input.horizon,
  }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    if (!data.name) return { ok: false as const, error: "Name required" };
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      insert into saved_desks (user_id, name, active, weights, horizon_months)
      values (
        ${context.userId},
        ${data.name},
        ${JSON.stringify(data.active)}::jsonb,
        ${JSON.stringify(data.weights)}::jsonb,
        ${data.horizon}
      )
      returning id
    `;
    return { ok: true as const, id: rows[0]?.id ?? 0 };
  });

export const deleteDesk = createServerFn({ method: "POST" })
  .validator((id: number) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`delete from saved_desks where id = ${id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });
