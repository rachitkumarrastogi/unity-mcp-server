import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const FIXTURE = fileURLToPath(new URL("./fixtures/minimal-unity-project", import.meta.url));
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

function rpc(child, msg) {
  child.stdin.write(`${JSON.stringify(msg)}\n`);
}

function collectResponses(child, ids, timeoutMs = 10_000) {
  return new Promise((resolve, reject) => {
    const got = new Map();
    let buf = "";
    const timer = setTimeout(() => {
      reject(new Error(`timed out waiting for ids: ${ids.filter((i) => !got.has(i))}`));
    }, timeoutMs);
    child.stdout.on("data", (d) => {
      buf += d.toString();
      let idx;
      while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line) continue;
        try {
          const msg = JSON.parse(line);
          if (msg && ids.includes(msg.id)) {
            got.set(msg.id, msg);
            if (ids.every((i) => got.has(i))) {
              clearTimeout(timer);
              resolve(got);
            }
          }
        } catch {
          /* ignore non-JSON log lines */
        }
      }
    });
    child.on("error", reject);
  });
}

describe("server smoke (compiled dist over stdio)", () => {
  it("answers initialize, lists tools, and runs get_project_info", async () => {
    const child = spawn(process.execPath, ["dist/index.js"], {
      cwd: ROOT,
      env: { ...process.env, UNITY_PROJECT_PATH: FIXTURE },
      stdio: ["pipe", "pipe", "pipe"],
    });
    try {
      const waiting = collectResponses(child, [1, 3, 4]);
      rpc(child, {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "smoke", version: "0" } },
      });
      rpc(child, { jsonrpc: "2.0", method: "notifications/initialized" });
      rpc(child, { jsonrpc: "2.0", id: 3, method: "tools/list", params: {} });
      rpc(child, { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "get_project_info", arguments: {} } });
      const got = await waiting;

      const init = got.get(1).result;
      assert.equal(init.serverInfo.name, "unity-mcp-server");
      assert.equal(init.serverInfo.version, pkg.version);

      const names = got.get(3).result.tools.map((t) => t.name);
      assert.ok(names.includes("get_project_info"));

      const text = got.get(4).result.content[0].text;
      assert.match(text, /6000\.0\.23f1/);
      assert.match(text, /Main/);
    } finally {
      child.kill();
    }
  });

  it("exits 1 with a helpful error when UNITY_PROJECT_PATH is missing", async () => {
    const env = { ...process.env };
    delete env.UNITY_PROJECT_PATH;
    const child = spawn(process.execPath, ["dist/index.js"], {
      cwd: ROOT,
      env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    const code = await new Promise((resolve) => child.on("close", resolve));
    assert.equal(code, 1);
    assert.match(stderr, /UNITY_PROJECT_PATH/);
  });
});
