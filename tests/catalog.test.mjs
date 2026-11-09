import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { TOOLS_CATALOG, searchToolsCatalog } from "../dist/tools-catalog.js";

const INDEX_SRC = readFileSync(new URL("../src/index.ts", import.meta.url), "utf8");
const registered = [...INDEX_SRC.matchAll(/registerTool\(\s*["']([^"']+)["']/g)].map((m) => m[1]);

describe("tools catalog", () => {
  it("stays in sync with tools registered in src/index.ts", () => {
    const catalogNames = TOOLS_CATALOG.map((t) => t.name);
    assert.deepEqual([...catalogNames].sort(), [...registered].sort());
  });

  it("has unique names and non-empty fields", () => {
    const names = TOOLS_CATALOG.map((t) => t.name);
    assert.equal(new Set(names).size, names.length);
    for (const t of TOOLS_CATALOG) {
      assert.ok(t.name && t.description && t.category, `incomplete entry: ${t.name}`);
    }
  });

  it("searchToolsCatalog finds tools by intent and lists all on empty query", () => {
    const hits = searchToolsCatalog("netcode").flatMap((g) => g.tools);
    assert.ok(hits.length > 0);
    assert.ok(hits.every((t) => `${t.name} ${t.description} ${t.category}`.toLowerCase().includes("netcode")));

    const total = searchToolsCatalog(undefined).flatMap((g) => g.tools).length;
    assert.equal(total, TOOLS_CATALOG.length);

    assert.deepEqual(searchToolsCatalog("zzz-no-such-tool-xyz"), []);
  });
});
