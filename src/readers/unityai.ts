/**
 * Unity AI native stack: Muse / Assistant / Inference Engine / Building Blocks / LLM runtime.
 * Filesystem + manifest only (no Editor).
 */

import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { listFilesRecursive, readFileSafe, resolveUnderRoot, ASSETS, PROJECT_SETTINGS } from "./helpers.js";
import { getPackages } from "./project.js";
import { listScripts } from "./code.js";
import { listAssetsByExtension } from "./assets.js";

function packageHits(root: string, test: (n: string) => boolean): Array<{ package: string; version: string }> {
  return getPackages(root)
    .dependencies.filter((d) => test(d.name.toLowerCase()))
    .map((d) => ({ package: d.name, version: d.version }));
}

export function getUnityAiStack(root: string): Record<string, unknown> {
  const muse = packageHits(root, (n) => n.includes("muse"));
  const assistant = packageHits(root, (n) => n.includes("assistant") && n.includes("unity"));
  const inference = packageHits(root, (n) => n.includes("inference") || n.includes("sentis") || n.includes("barracuda"));
  const navigation = packageHits(root, (n) => n.includes("ai.navigation") || n.includes("ml-agents"));
  const buildingBlocks = packageHits(root, (n) => n.includes("building-block") || n.includes("buildingblock"));

  const settingsHits: string[] = [];
  if (resolveUnderRoot(root, PROJECT_SETTINGS)) {
    for (const f of listFilesRecursive(root, PROJECT_SETTINGS, { ext: ".asset" })) {
      const lower = f.toLowerCase();
      if (lower.includes("muse") || lower.includes("assistant") || lower.includes("inference") || lower.includes("unityai")) {
        settingsHits.push(f);
        if (settingsHits.length >= 30) break;
      }
    }
  }

  const hints: string[] = [];
  if (!muse.length && !assistant.length) hints.push("No Muse/Assistant packages — in-Editor AI help is an Editor install, not project state; confirm Editor version supports Unity AI.");
  if (!inference.length) hints.push("No on-device inference packages (Sentis/Inference Engine) — runtime NPC/vision AI needs one or an external service.");
  if (!buildingBlocks.length) hints.push("No Building Blocks packages detected (Unity 6.3 LTS samples) — consider them for production-ready gameplay scaffolding.");

  return {
    muse_packages: muse,
    assistant_packages: assistant,
    inference_packages: inference,
    navigation_or_rl_packages: navigation,
    building_block_packages: buildingBlocks,
    ai_related_project_settings: settingsHits,
    hints,
  };
}

export function listBuildingBlocks(root: string): Record<string, unknown> {
  const packages = packageHits(root, (n) => n.includes("building-block") || n.includes("buildingblock"));
  const found = searchBuildingBlocks(root);
  return { packages, assets: found.slice(0, 60), count: found.length };
}

function searchBuildingBlocks(root: string): Array<{ path: string; why: string }> {
  const out: Array<{ path: string; why: string }> = [];
  for (const dir of [ASSETS, "Packages"]) {
    if (!resolveUnderRoot(root, dir)) continue;
    const stack: string[] = [dir];
    let scanned = 0;
    while (stack.length && out.length < 60 && scanned < 6000) {
      const d = stack.pop()!;
      const fullD = resolveUnderRoot(root, d);
      if (!fullD) continue;
      let entries: string[];
      try {
        entries = readdirSync(fullD);
      } catch {
        continue;
      }
      for (const e of entries) {
        if (out.length >= 60 || scanned >= 6000) break;
        scanned++;
        const rel = join(d, e);
        const fullPath = resolveUnderRoot(root, rel);
        if (!fullPath) continue;
        let isDir = false;
        try {
          isDir = statSync(fullPath).isDirectory();
        } catch {
          continue;
        }
        const low = e.toLowerCase();
        const relNorm = rel.split(/[/\\]/).join("/");
        if (isDir) {
          if (e.startsWith(".") || e === "node_modules" || low === "library") continue;
          if (low.includes("building-block") || low.includes("buildingblock")) out.push({ path: relNorm + "/", why: "building-blocks folder" });
          else stack.push(rel);
        } else if (low.includes("building-block") || low.includes("buildingblock")) {
          out.push({ path: relNorm, why: "building-blocks asset" });
        }
      }
    }
  }
  return out;
}

export function listInferenceModels(root: string): Record<string, unknown> {
  const onnx = listAssetsByExtension(root, ".onnx");
  const nn = listAssetsByExtension(root, ".nn");
  const sentis = listAssetsByExtension(root, ".sentis");
  const pt = listAssetsByExtension(root, ".pt");
  const tflite = listAssetsByExtension(root, ".tflite");
  const pb = listAssetsByExtension(root, ".pb");
  const bytesHints = listAssetsByExtension(root, ".bytes")
    .filter((p) => {
      const c = readFileSafe(root, p);
      return !!c && (c.includes("SENTIS") || c.includes("ONNX") || c.includes("onnx"));
    })
    .slice(0, 30);
  return {
    onnx: onnx.slice(0, 60),
    nn: nn.slice(0, 60),
    sentis: sentis.slice(0, 60),
    pt: pt.slice(0, 30),
    tflite: tflite.slice(0, 30),
    pb: pb.slice(0, 30),
    bytes_with_model_markers: bytesHints,
    counts: { onnx: onnx.length, nn: nn.length, sentis: sentis.length, pt: pt.length, tflite: tflite.length, pb: pb.length, bytes_hits: bytesHints.length },
  };
}

const LLM_RULES: Array<{ label: string; re: RegExp }> = [
  { label: "LLM HTTP calls", re: /openai|anthropic|api\.openai|generativelanguage|cohere|mistral|llama|ChatCompletion/i },
  { label: "UnityWebRequest POST/JSON", re: /UnityWebRequest\.(Post|Put)|UploadHandlerRaw|SetRequestHeader.*(Bearer|api-key|apikey)/i },
  { label: "SSE / streaming", re: /text\/event-stream|event-source|StreamReader.*DownloadHandler|downloadHandler\.text.*stream/i },
  { label: "WebSocket", re: /ClientWebSocket|System\.Net\.WebSockets|NativeWebSocket|websocket/i },
  { label: "API key handling", re: /api[_-]?key|BEARER|Authorization.*Bearer|PlayerPrefs.*[Kk]ey/i },
  { label: "Chat history / memory", re: /conversation|chatHistory|ChatMessage|messages\.Add.*(user|assistant|system)/i },
  { label: "Timeout / retry", re: /timeout.*\d+|Retry|Polly|CancellationToken.*(Send|Request)/i },
];

export function getLlmRuntimeInventory(root: string): Record<string, unknown> {
  const scripts = listScripts(root);
  const byLabel: Array<{ label: string; count: number; sample_scripts: string[] }> = LLM_RULES.map((r) => ({ label: r.label, count: 0, sample_scripts: [] }));
  let scanned = 0;
  for (const rel of scripts) {
    const content = readFileSafe(root, rel);
    if (!content) continue;
    scanned++;
    LLM_RULES.forEach((rule, i) => {
      if (rule.re.test(content)) {
        byLabel[i].count++;
        if (byLabel[i].sample_scripts.length < 10) byLabel[i].sample_scripts.push(rel);
      }
    });
  }
  const active = byLabel.filter((b) => b.count > 0);
  const hints: string[] = [];
  if (!active.length) hints.push("No in-game LLM call patterns detected — AI is likely Editor-side or absent.");
  if (byLabel.find((b) => b.label === "API key handling")?.count) hints.push("API-key handling code found — verify keys come from env/remote config, never hardcoded or in PlayerPrefs. No secret values are read by this tool.");
  if (byLabel.find((b) => b.label === "SSE / streaming")?.count) hints.push("Streaming detected — confirm cancellation + timeout handling for mobile networks.");
  return { scanned_script_count: scanned, by_label: active, hints };
}
