import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import {
  truncateText,
  escapeRegExp,
  literalRegExp,
  wildcardRegExp,
  resolveUnderRoot,
  readFileSafe,
  readJsonSafe,
  listFilesRecursive,
  parseUnityKeyValue,
  getGuidFromMeta,
  findReferencesToGuid,
} from "../dist/readers/index.js";

const FIXTURE = fileURLToPath(new URL("./fixtures/minimal-unity-project", import.meta.url));

describe("truncateText", () => {
  it("returns short strings unchanged", () => {
    assert.equal(truncateText("hello"), "hello");
  });

  it("truncates long strings with a marker", () => {
    const out = truncateText("a".repeat(200_050));
    assert.ok(out.startsWith("a".repeat(200_000)));
    assert.match(out, /truncated 50 chars/);
  });
});

describe("pattern helpers", () => {
  it("escapeRegExp neutralizes metacharacters", () => {
    assert.equal(escapeRegExp("a.b*c"), "a\\.b\\*c");
    assert.ok(!new RegExp(escapeRegExp("a.c")).test("abc"));
  });

  it("literalRegExp rejects empty and oversized patterns", () => {
    assert.equal(literalRegExp(""), null);
    assert.equal(literalRegExp("x".repeat(201)), null);
    assert.ok(literalRegExp("Player (1)") instanceof RegExp);
  });

  it("wildcardRegExp treats * as any-chars and anchors the match", () => {
    const re = wildcardRegExp("Player*");
    assert.ok(re.test("PlayerController"));
    assert.ok(!re.test("EnemyPlayer"));
    assert.ok(wildcardRegExp("*.prefab").test("Hero.prefab"));
  });
});

describe("resolveUnderRoot", () => {
  it("resolves paths inside the root", () => {
    const p = resolveUnderRoot(FIXTURE, "ProjectSettings", "ProjectVersion.txt");
    assert.ok(p && p.endsWith("ProjectVersion.txt"));
  });

  it("blocks traversal, absolute segments, and empty roots", () => {
    assert.equal(resolveUnderRoot(FIXTURE, "..", "secret.txt"), null);
    assert.equal(resolveUnderRoot(FIXTURE, "/etc/passwd"), null);
    assert.equal(resolveUnderRoot("", "Assets"), null);
  });

  it("allows not-yet-existing paths under the root", () => {
    const p = resolveUnderRoot(FIXTURE, "Assets", "NewFolder", "thing.asset");
    assert.ok(p && p.includes("NewFolder"));
  });
});

describe("safe readers against the fixture project", () => {
  it("readFileSafe reads existing files and returns null for missing ones", () => {
    const s = readFileSafe(FIXTURE, "ProjectSettings", "ProjectVersion.txt");
    assert.match(s, /m_EditorVersion/);
    assert.equal(readFileSafe(FIXTURE, "Nope", "missing.txt"), null);
  });

  it("readJsonSafe parses valid JSON and returns null for invalid JSON", () => {
    const manifest = readJsonSafe(FIXTURE, "Packages", "manifest.json");
    assert.ok(manifest.dependencies["com.unity.netcode.gameobjects"]);
    assert.equal(readJsonSafe(FIXTURE, "Assets", "Scripts", "Player.cs"), null);
  });

  it("listFilesRecursive finds scripts and handles missing dirs", () => {
    const scripts = listFilesRecursive(FIXTURE, "Assets", { ext: ".cs" });
    assert.deepEqual(scripts, ["Assets/Scripts/Player.cs"]);
    assert.deepEqual(listFilesRecursive(FIXTURE, "DoesNotExist"), []);
  });

  it("parseUnityKeyValue parses pairs and skips braces/empties", () => {
    const kv = parseUnityKeyValue("m_Foo: bar\nm_Obj: {x: 1}\nplain: value");
    assert.deepEqual(kv, { m_Foo: "bar", plain: "value" });
  });

  it("parseUnityKeyValue ignores YAML block headers, keeping nested keys", () => {
    const kv = parseUnityKeyValue("--- !u!129 &1\nPlayerSettings:\n  m_ProductName: Test Game\n  m_CompanyName: TestCo");
    assert.equal(kv.m_ProductName, "Test Game");
    assert.equal(kv.m_CompanyName, "TestCo");
    assert.ok(!("PlayerSettings" in kv));
  });

  it("getGuidFromMeta reads sibling .meta guids", () => {
    assert.equal(getGuidFromMeta(FIXTURE, "Assets/Scripts/Player.cs"), "a1b2c3d4e5f60718293a4b5c6d7e8f90");
    assert.equal(getGuidFromMeta(FIXTURE, "Assets/Scripts/Missing.cs"), null);
  });

  it("findReferencesToGuid finds the referencing prefab", () => {
    const refs = findReferencesToGuid(FIXTURE, "a1b2c3d4e5f60718293a4b5c6d7e8f90");
    assert.deepEqual(refs, ["Assets/Prefabs/Player.prefab"]);
    assert.deepEqual(findReferencesToGuid(FIXTURE, "0".repeat(32)), []);
  });
});
