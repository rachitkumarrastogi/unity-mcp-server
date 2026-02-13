/**
 * Code & assemblies readers.
 */

import { readJsonSafe, readFileSafe, listFilesRecursive, ASSETS } from "./helpers.js";
import { join } from "node:path";
import { existsSync } from "node:fs";

export interface AsmDefInfo {
  path: string;
  name: string;
  references: string[];
  defineConstraints?: string[];
  optionalUnityReferences?: string[];
  includePlatforms?: string[];
}

export function getAssemblyDefinitions(root: string): AsmDefInfo[] {
  const files = listFilesRecursive(root, ASSETS, { ext: ".asmdef" });
  const out: AsmDefInfo[] = [];
  for (const rel of files) {
    const j = readJsonSafe<{ name: string; references?: string[]; defineConstraints?: string[]; optionalUnityReferences?: string[]; includePlatforms?: string[] }>(root, rel);
    if (j?.name)
      out.push({
        path: rel,
        name: j.name,
        references: j.references || [],
        defineConstraints: j.defineConstraints,
        optionalUnityReferences: j.optionalUnityReferences,
        includePlatforms: j.includePlatforms,
      });
  }
  return out;
}

export function listScripts(root: string, folderPrefix?: string): string[] {
  let files = listFilesRecursive(root, ASSETS, { ext: ".cs", excludeMeta: true });
  if (folderPrefix) {
    const prefix = folderPrefix.startsWith("Assets/") ? folderPrefix : join(ASSETS, folderPrefix);
    files = files.filter((f) => f.startsWith(prefix + "/") || f.startsWith(prefix + "\\"));
  }
  return files;
}

/** Simple grep for type/namespace in .cs file content. */
export function findScriptsByContent(root: string, pattern: "MonoBehaviour" | "ScriptableObject" | string, namespaceFilter?: string): string[] {
  const files = listScripts(root);
  const re = new RegExp(pattern, "i");
  const nsRe = namespaceFilter ? new RegExp(namespaceFilter.replace(/\*/g, ".*"), "i") : null;
  const out: string[] = [];
  for (const rel of files) {
    const content = readFileSafe(root, rel);
    if (!content || !re.test(content)) continue;
    if (nsRe && !nsRe.test(content)) continue;
    out.push(rel);
  }
  return out;
}

export function listEditorScripts(root: string): string[] {
  const all = listScripts(root);
  return all.filter((p) => p.includes("Editor") || p.toLowerCase().includes("/editor/"));
}

export function getAssemblyDependencyGraph(root: string): { nodes: string[]; edges: [string, string][] } {
  const asms = getAssemblyDefinitions(root);
  const nodes = asms.map((a) => a.name);
  const edges: [string, string][] = [];
  for (const a of asms) for (const ref of a.references) edges.push([a.name, ref]);
  return { nodes, edges };
}


export function listVisualScriptingAssets(root: string): string[] {
  const vsPaths = ["Assets/Ludiq", "Assets/Unity.VisualScripting", "Packages/com.unity.visualscripting"];
  const out: string[] = [];
  for (const dir of vsPaths) {
    if (existsSync(join(root, dir))) out.push(...listFilesRecursive(root, dir, { ext: ".asset" }));
  }
  return [...new Set(out)].slice(0, 100);
}
