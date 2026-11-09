import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import {
  getUnityVersion,
  getBuildScenes,
  getPackages,
  getPlayerSettings,
} from "../dist/readers/index.js";

const FIXTURE = fileURLToPath(new URL("./fixtures/minimal-unity-project", import.meta.url));
const MISSING = fileURLToPath(new URL("./fixtures/does-not-exist", import.meta.url));

describe("project readers against the fixture project", () => {
  it("getUnityVersion parses ProjectVersion.txt", () => {
    assert.equal(getUnityVersion(FIXTURE), "6000.0.23f1");
    assert.equal(getUnityVersion(MISSING), "unknown");
  });

  it("getBuildScenes returns scenes in build order", () => {
    assert.deepEqual(getBuildScenes(FIXTURE), [
      { index: 0, path: "Assets/Scenes/Main.unity", name: "Main" },
      { index: 1, path: "Assets/Scenes/Menu.unity", name: "Menu" },
    ]);
    assert.deepEqual(getBuildScenes(MISSING), []);
  });

  it("getPackages classifies registry vs local dependencies", () => {
    const { dependencies } = getPackages(FIXTURE);
    assert.equal(dependencies.length, 2);
    assert.deepEqual(
      dependencies.find((d) => d.name === "com.unity.netcode.gameobjects"),
      { name: "com.unity.netcode.gameobjects", version: "1.8.0", type: "registry" }
    );
    assert.equal(dependencies.find((d) => d.name === "com.testco.local-tools").type, "local");
    assert.deepEqual(getPackages(MISSING), { dependencies: [] });
  });

  it("getPlayerSettings returns product metadata", () => {
    const ps = getPlayerSettings(FIXTURE);
    assert.equal(ps.m_ProductName, "Minimal Test Game");
    assert.equal(ps.m_CompanyName, "TestCo");
    assert.equal(ps.bundleVersion, "0.1.0");
    assert.deepEqual(getPlayerSettings(MISSING), {});
  });
});
