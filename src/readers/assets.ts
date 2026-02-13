/**
 * Assets & references readers.
 */

import { existsSync, readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { listFilesRecursive, readFileSafe, getAssetPathByGuid, ASSETS } from "./helpers.js";

export function getAssetFolderTree(root: string, maxDepth: number = 4): Record<string, string[]> {
  const assetsDir = join(root, ASSETS);
  if (!existsSync(assetsDir)) return {};
  const result: Record<string, string[]> = {};
  function walk(dir: string, depth: number): string[] {
    if (depth > maxDepth) return [];
    const full = join(root, dir);
    let entries: string[];
    try {
      entries = readdirSync(full);
    } catch {
      return [];
    }
    const children: string[] = [];
    for (const e of entries) {
      if (e.startsWith(".")) continue;
      const rel = join(dir, e);
      const fullPath = join(root, rel);
      if (statSync(fullPath).isDirectory()) {
        children.push(rel + "/");
        if (depth < maxDepth) walk(rel, depth + 1);
      } else {
        children.push(e);
      }
    }
    result[dir] = children.slice(0, 200);
    return children;
  }
  walk(ASSETS, 0);
  return result;
}

export function listAssetsByExtension(root: string, ext: string, folder?: string): string[] {
  const dir = folder ? join(ASSETS, folder) : ASSETS;
  return listFilesRecursive(root, dir, { ext: ext.toLowerCase() });
}

export function listLargeAssets(root: string, minSizeMb: number = 5): { path: string; sizeMb: number }[] {
  const out: { path: string; sizeMb: number }[] = [];
  const threshold = minSizeMb * 1024 * 1024;
  const stack: string[] = [ASSETS];
  while (stack.length) {
    const d = stack.pop()!;
    const fullD = join(root, d);
    try {
      for (const e of readdirSync(fullD)) {
        const rel = join(d, e);
        const fullPath = join(root, rel);
        if (statSync(fullPath).isDirectory()) {
          if (!e.startsWith(".")) stack.push(rel);
        } else {
          const size = statSync(fullPath).size;
          if (size >= threshold) out.push({ path: rel, sizeMb: Math.round((size / 1024 / 1024) * 100) / 100 });
        }
      }
    } catch {
      /* */
    }
  }
  return out.sort((a, b) => b.sizeMb - a.sizeMb);
}

export function getSceneReferencedAssets(root: string, scenePath: string): { resolved: string[]; unresolvedGuids: string[] } {
  const content = readFileSafe(root, scenePath);
  if (!content) return { resolved: [], unresolvedGuids: [] };
  const guidRe = /guid:\s*([a-f0-9]{32})/g;
  const guids = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = guidRe.exec(content)) !== null) guids.add(m[1]);
  const resolved: string[] = [];
  const unresolved: string[] = [];
  for (const g of guids) {
    const path = getAssetPathByGuid(root, g);
    if (path) resolved.push(path);
    else unresolved.push(g);
  }
  return { resolved: [...new Set(resolved)], unresolvedGuids: unresolved };
}

export function getPrefabDependencies(root: string, prefabPath: string): string[] {
  const content = readFileSafe(root, prefabPath);
  if (!content) return [];
  const guidRe = /guid:\s*([a-f0-9]{32})/g;
  const guids = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = guidRe.exec(content)) !== null) guids.add(m[1]);
  const paths: string[] = [];
  for (const g of guids) {
    const p = getAssetPathByGuid(root, g);
    if (p && p !== prefabPath) paths.push(p);
  }
  return [...new Set(paths)];
}

export function getBrokenScriptRefs(root: string): { assetPath: string; missingScriptGuid: string }[] {
  const exts = [".prefab", ".unity"];
  const scriptGuids = new Set<string>();
  const stack: string[] = [ASSETS];
  while (stack.length) {
    const d = stack.pop()!;
    const fullD = join(root, d);
    try {
      for (const e of readdirSync(fullD)) {
        const rel = join(d, e);
        const fullPath = join(root, rel);
        if (statSync(fullPath).isDirectory()) {
          if (!e.startsWith(".")) stack.push(rel);
        } else if (e.endsWith(".meta")) {
          const content = readFileSync(fullPath, "utf-8");
          const guid = content.match(/^guid:\s*([a-f0-9]{32})/m)?.[1];
          const assetExt = rel.replace(/\.meta$/, "").split(".").pop()?.toLowerCase();
          if (guid && assetExt === "cs") scriptGuids.add(guid);
        }
      }
    } catch {
      /* */
    }
  }
  const broken: { assetPath: string; missingScriptGuid: string }[] = [];
  for (const rel of listFilesRecursive(root, ASSETS).filter((p) => exts.some((x) => p.endsWith(x)))) {
    const content = readFileSafe(root, rel);
    if (!content) continue;
    const scriptRefRe = /m_Script:\s*\{\s*fileID:\s*\d+,\s*guid:\s*([a-f0-9]{32})/g;
    let m: RegExpExecArray | null;
    while ((m = scriptRefRe.exec(content)) !== null) {
      const guid = m[1];
      if (!scriptGuids.has(guid)) broken.push({ assetPath: rel, missingScriptGuid: guid });
    }
  }
  return broken;
}
