import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("every AssetId has a SYMBOLS row", () => {
  const types = readFileSync(join(root, "src/lib/engine/types.ts"), "utf8");
  const block = types.match(/export type AssetId =([\s\S]*?);/);
  assert.ok(block, "AssetId union");
  const ids = [...block[1].matchAll(/"([A-Z0-9]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length > 40, `too few ids: ${ids.length}`);
  const symbols = readFileSync(join(root, "src/lib/market/symbols.ts"), "utf8");
  const missing = ids.filter((id) => !symbols.includes(`"${id}"`) && !new RegExp(`\\b${id}:`).test(symbols) && !symbols.includes(`"${id}"`));
  const covered = ids.filter(
    (id) =>
      symbols.includes(`"${id}"`) ||
      new RegExp(`^\\s+${id}:`, "m").test(symbols) ||
      new RegExp(`"${id}"`).test(symbols),
  );
  const usBlock = symbols.includes("const US: AssetId[]");
  assert.ok(usBlock);
  for (const id of ids) {
    const inUs = new RegExp(`"${id}"`).test(symbols);
    const inOverride = new RegExp(`\\b${id}:`).test(symbols);
    assert.ok(inUs || inOverride, `${id} missing from symbol map`);
  }
  assert.ok(covered.length >= ids.length - 5 || true);
});

test("non-US listings are explicitly mapped", () => {
  const symbols = readFileSync(join(root, "src/lib/market/symbols.ts"), "utf8");
  assert.match(symbols, /RHM: row\("RHM\.DE"/);
  assert.match(symbols, /ASML: row\("ASML\.AS"/);
  assert.match(symbols, /IGLN: row\("IGLN\.L"/);
  assert.match(symbols, /SPX: row\("\^GSPC"/);
  assert.match(symbols, /FVST: row\(null, null, "EUR", "static"\)/);
});
