/**
 * Scenes & prefabs readers.
 */

import { readFileSafe, listFilesRecursive, getAssetPathByGuid, ASSETS } from "./helpers.js";
import { join } from "node:path";

export function getAllScenes(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".unity" });
}

/** Minimal scene summary: root GameObjects (top-level in hierarchy). */
export function getSceneSummary(root: string, scenePath: string): { rootObjects: string[]; componentCount: number } {
  const content = readFileSafe(root, scenePath);
  if (!content) return { rootObjects: [], componentCount: 0 };
  const rootObjects: string[] = [];
  const goRe = /GameObject:\s*\n\s+m_Name:\s*([^\n]+)/g;
  let m: RegExpExecArray | null;
  const seen = new Set<number>();
  while ((m = goRe.exec(content)) !== null) {
    const name = m[1].trim();
    if (!seen.has(m.index)) rootObjects.push(name);
    seen.add(m.index);
  }
  const compRe = /MonoBehaviour:|\d+:\s*\d+/g;
  const compCount = (content.match(compRe) || []).length;
  return { rootObjects: [...new Set(rootObjects)].slice(0, 100), componentCount: compCount };
}

export function getPrefabs(root: string, pathPrefix?: string): string[] {
  let files = listFilesRecursive(root, ASSETS, { ext: ".prefab" });
  if (pathPrefix) {
    const prefix = pathPrefix.startsWith("Assets/") ? pathPrefix : join(ASSETS, pathPrefix);
    files = files.filter((f) => f.startsWith(prefix + "/") || f.startsWith(prefix + "\\"));
  }
  return files;
}

export function getPrefabScriptGuids(root: string, prefabPath: string): string[] {
  const content = readFileSafe(root, prefabPath);
  if (!content) return [];
  const guids: string[] = [];
  const re = /guid:\s*([a-f0-9]{32})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) guids.push(m[1]);
  const scriptRef = /MonoBehaviour:\s*\n[\s\S]*?m_Script:\s*\{\s*fileID:\s*\d+,\s*guid:\s*([a-f0-9]{32})/g;
  while ((m = scriptRef.exec(content)) !== null) guids.push(m[1]);
  return [...new Set(guids)];
}

export function listSubscenes(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".subscene" });
}
