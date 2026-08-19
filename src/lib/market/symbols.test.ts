import assert from "node:assert/strict";
import test from "node:test";
import { ASSET_IDS } from "../engine/data";
import { SYMBOLS, isAssetId, parseAssetIds, symbolFor } from "./symbols";

test("every AssetId has a symbol row", () => {
  for (const id of ASSET_IDS) {
    const row = SYMBOLS[id];
    assert.ok(row, `${id} missing`);
    assert.ok(row.feed, `${id} feed`);
    assert.ok(row.currency, `${id} currency`);
    if (row.feed !== "static") {
      assert.ok(row.yahoo || row.finnhub || row.coingecko, `${id} has no provider symbol`);
    }
  }
  assert.equal(Object.keys(SYMBOLS).length, ASSET_IDS.length);
});

test("EU and index tickers do not use the raw US id", () => {
  assert.equal(symbolFor("RHM").yahoo, "RHM.DE");
  assert.equal(symbolFor("SIE").yahoo, "SIE.DE");
  assert.equal(symbolFor("ASML").yahoo, "ASML.AS");
  assert.equal(symbolFor("IGLN").yahoo, "IGLN.L");
  assert.equal(symbolFor("SPX").yahoo, "^GSPC");
  assert.equal(symbolFor("FVST").feed, "static");
  assert.equal(symbolFor("BTC").coingecko, "bitcoin");
});

test("parseAssetIds filters unknowns", () => {
  assert.deepEqual(parseAssetIds("AAPL,rhm,NOPE,BTC"), ["AAPL", "RHM", "BTC"]);
  assert.equal(isAssetId("AAPL"), true);
  assert.equal(isAssetId("NOPE"), false);
});
