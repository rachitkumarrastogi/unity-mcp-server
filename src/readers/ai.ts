/**
 * AI / ML / inference discovery for Unity projects (manifest + assets + code heuristics).
 * No Unity Editor required.
 */

import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { readFileSafe, listFilesRecursive, ASSETS } from "./helpers.js";
import { getPackages } from "./project.js";
import { listScripts } from "./code.js";
import { listAssetsByExtension } from "./assets.js";

export interface AiPackageMatch {
  package: string;
  version: string;
  category: string;
  description: string;
}

const PACKAGE_RULES: Array<{
  test: (name: string) => boolean;
  category: string;
  description: string;
}> = [
  {
    test: (n) => n === "com.unity.ml-agents" || n.startsWith("com.unity.ml-agents."),
    category: "RL / agents",
    description: "Unity ML-Agents (training & inference)",
  },
  {
    test: (n) => n.startsWith("com.unity.sentis"),
    category: "ML inference",
    description: "Unity Sentis (ONNX / neural networks in player builds)",
  },
  {
    test: (n) => n.startsWith("com.unity.barracuda"),
    category: "ML inference",
    description: "Barracuda (legacy NN inference)",
  },
  {
    test: (n) => n.startsWith("com.unity.ai.navigation"),
    category: "Navigation AI",
    description: "AI Navigation (NavMesh, agents)",
  },
  { test: (n) => n.startsWith("com.unity.muse"), category: "Generative AI", description: "Unity Muse" },
  {
    test: (n) => n.startsWith("com.unity.ai.inference"),
    category: "ML inference",
    description: "Unity AI Inference",
  },
  { test: (n) => n.startsWith("com.unity.ai."), category: "Unity AI", description: "Unity AI-related package" },
];

function matchAiPackage(name: string): { category: string; description: string } | null {
  for (const r of PACKAGE_RULES) {
    if (r.test(name)) return { category: r.category, description: r.description };
  }
  return null;
}

export function getAiMlPackageInventory(root: string): { packages: AiPackageMatch[]; hints: string[] } {
  const { dependencies } = getPackages(root);
  const packages: AiPackageMatch[] = [];
  const seen = new Set<string>();

  for (const d of dependencies) {
    const meta = matchAiPackage(d.name);
    if (meta) {
      packages.push({
        package: d.name,
        version: d.version,
        category: meta.category,
        description: meta.description,
      });
      seen.add(d.name);
    }
  }

  const hints: string[] = [];
  if (![...seen].some((n) => n.startsWith("com.unity.sentis") || n.startsWith("com.unity.barracuda"))) {
    hints.push("No Sentis or Barracuda in manifest; inference may be custom, external, or ONNX-only assets.");
  }
  if (![...seen].some((n) => n.includes("ml-agents"))) {
    hints.push("No ML-Agents packages; if you use RL, add com.unity.ml-agents or confirm a custom stack.");
  }

  return { packages, hints };
}

export function listMlModelAssets(root: string) {
  const onnx = listAssetsByExtension(root, ".onnx");
  const nn = listAssetsByExtension(root, ".nn");
  const pt = listAssetsByExtension(root, ".pt");
  const tflite = listAssetsByExtension(root, ".tflite");
  const pb = listAssetsByExtension(root, ".pb");

  return {
    onnx,
    nn,
    pt,
    tflite,
    pb,
    counts: {
      onnx: onnx.length,
      nn: nn.length,
      pt: pt.length,
      tflite: tflite.length,
      pb: pb.length,
    },
  };
}

const SCRIPT_AI_RULES: Array<{ label: string; re: RegExp }> = [
  { label: "Unity Sentis / InferenceEngine", re: /Unity\.Sentis|Unity\.InferenceEngine|\bIWorker\b|\bModelAsset\b/i },
  { label: "Barracuda", re: /Barracuda\.|Unity\.Barracuda/i },
  {
    label: "ML-Agents",
    re: /Unity\.MLAgents|MLAgents\.|BehaviorParameters|ObservableAttribute|DiscreteAction|ContinuousAction/i,
  },
  { label: "NavMesh / AI navigation", re: /NavMeshAgent|UnityEngine\.AI|NavMesh\.|OffMeshLink/i },
  { label: "Behavior trees / FSM", re: /BehaviorTree|NodeCanvas|PlayMakerFSM|StateMachineBehaviour/i },
  { label: "ONNX / model runtime", re: /\bonnx\b|Onnx|RuntimeModel|ModelLoader/i },
  { label: "LLM / chat APIs (strings)", re: /OpenAI|Anthropic|api\.openai|ChatCompletion|LLM|langchain/i },
];

const MAX_PATHS_PER_LABEL = 45;

export function findAiRelatedScripts(root: string) {
  const scripts = listScripts(root);
  const labelToPaths = new Map<string, Set<string>>();
  for (const { label } of SCRIPT_AI_RULES) labelToPaths.set(label, new Set());

  for (const rel of scripts) {
    const content = readFileSafe(root, rel);
    if (!content) continue;
    for (const { label, re } of SCRIPT_AI_RULES) {
      if (re.test(content)) labelToPaths.get(label)!.add(rel);
    }
  }

  const by_label: Array<{ label: string; script_paths: string[]; count: number }> = [];
  const allUnique = new Set<string>();

  for (const { label } of SCRIPT_AI_RULES) {
    const paths = [...labelToPaths.get(label)!].sort();
    for (const p of paths) allUnique.add(p);
    by_label.push({
      label,
      script_paths: paths.slice(0, MAX_PATHS_PER_LABEL),
      count: paths.length,
    });
  }

  return {
    by_label,
    unique_script_count: allUnique.size,
    scanned_script_count: scripts.length,
  };
}

export function listAiPromptOrConfigAssets(root: string) {
  const jsonFiles = listFilesRecursive(root, ASSETS, { ext: ".json", excludeMeta: true });
  const mdFiles = listFilesRecursive(root, ASSETS, { ext: ".md", excludeMeta: true });
  const json_with_ai_keys: string[] = [];
  const md_prompt_docs: string[] = [];
  const jsonRe = /"(system|prompt|messages|openai|anthropic|model|completion)"/i;
  const mdRe = /#+\s*(prompt|system|LLM|RAG|embedding)/i;

  for (const p of jsonFiles.slice(0, 800)) {
    const c = readFileSafe(root, p);
    if (c && jsonRe.test(c)) json_with_ai_keys.push(p);
  }
  for (const p of mdFiles.slice(0, 400)) {
    const c = readFileSafe(root, p);
    if (c && mdRe.test(c)) md_prompt_docs.push(p);
  }

  return {
    json_with_ai_keys: json_with_ai_keys.slice(0, 80),
    md_prompt_docs: md_prompt_docs.slice(0, 80),
    note: "Heuristic scan only; capped file reads for performance.",
  };
}

export function listMlAgentsTrainingConfigs(root: string): string[] {
  const candidates: string[] = [];
  for (const rel of [".", "config", "ml-agents", "Assets/ML-Agents"]) {
    const dir = join(root, rel);
    if (!existsSync(dir)) continue;
    try {
      for (const e of readdirSync(dir)) {
        if (e.endsWith(".yaml") || e.endsWith(".yml")) {
          const path = join(rel === "." ? "" : rel, e).replace(/^\//, "") || e;
          const content = readFileSafe(root, path);
          if (content && /behaviors:|trainer_type:|mlagents/i.test(content)) {
            candidates.push(path);
          }
        }
      }
    } catch {
      // skip unreadable dirs
    }
  }
  return [...new Set(candidates)].sort();
}

export function getAiStackSummary(root: string, includePromptAssets: boolean): Record<string, unknown> {
  const inventory = getAiMlPackageInventory(root);
  const models = listMlModelAssets(root);
  const scripts = findAiRelatedScripts(root);
  const mlAgentsConfigs = listMlAgentsTrainingConfigs(root);

  const out: Record<string, unknown> = {
    packages: inventory.packages,
    hints: inventory.hints,
    ml_agents_training_configs: mlAgentsConfigs,
    model_assets: {
      counts: models.counts,
      sample_onnx: models.onnx.slice(0, 15),
      sample_nn: models.nn.slice(0, 15),
    },
    scripts: {
      unique_script_count: scripts.unique_script_count,
      scanned_script_count: scripts.scanned_script_count,
      by_label: scripts.by_label.filter((b) => b.count > 0),
    },
  };

  if (includePromptAssets) {
    out.prompt_or_config_assets = listAiPromptOrConfigAssets(root);
  }

  return out;
}

const SERVER_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SKILLS_DIR = join(SERVER_ROOT, "skills");

export function listBundledAiSkills(): Array<{ id: string; name: string; description: string }> {
  if (!existsSync(SKILLS_DIR)) return [];
  const entries = readdirSync(SKILLS_DIR, { withFileTypes: true });
  const skills: Array<{ id: string; name: string; description: string }> = [];

  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const skillPath = join(SKILLS_DIR, ent.name, "SKILL.md");
    if (!existsSync(skillPath)) continue;
    const raw = readFileSync(skillPath, "utf8");
    const nameMatch = raw.match(/^name:\s*(.+)$/m);
    const descMatch = raw.match(/^description:\s*>?-?\s*(.+)$/m);
    skills.push({
      id: ent.name,
      name: nameMatch?.[1]?.trim() ?? ent.name,
      description: descMatch?.[1]?.trim() ?? "Unity AI workflow skill",
    });
  }

  return skills.sort((a, b) => a.id.localeCompare(b.id));
}

export function readBundledAiSkill(skillId: string): { id: string; content: string } | null {
  const safe = skillId.replace(/[^a-z0-9-]/gi, "");
  const skillPath = join(SKILLS_DIR, safe, "SKILL.md");
  if (!existsSync(skillPath)) return null;
  return { id: safe, content: readFileSync(skillPath, "utf8") };
}
