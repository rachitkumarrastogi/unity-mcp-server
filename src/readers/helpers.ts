/**
 * Shared helper utilities for Unity project filesystem readers.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

export const ASSETS = "Assets";
export const PROJECT_SETTINGS = "ProjectSettings";
export const PACKAGES = "Packages";

export function readFileSafe(root: string, ...path: string[]): string | null {
  const p = join(root, ...path);
  if (!existsSync(p)) return null;
  try {
    return readFileSync(p, "utf-8");
  } catch {
    return null;
  }
}

export function readJsonSafe<T>(root: string, ...path: string[]): T | null {
  const s = readFileSafe(root, ...path);
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

/** Recursively list files under dir, relative to root. Optional extension filter (e.g. ".cs"). */
export function listFilesRecursive(
  root: string,
  dir: string,
  opts: { ext?: string; excludeMeta?: boolean } = {}
): string[] {
  const full = join(root, dir);
  if (!existsSync(full) || !statSync(full).isDirectory()) return [];
  const out: string[] = [];
  const stack: string[] = [dir];
  while (stack.length) {
    const d = stack.pop()!;
    const fullD = join(root, d);
    let entries: string[];
    try {
      entries = readdirSync(fullD);
    } catch {
      continue;
    }
    for (const e of entries) {
      const rel = join(d, e);
      const fullPath = join(root, rel);
      if (statSync(fullPath).isDirectory()) {
        if (e !== "node_modules" && e !== ".git" && !e.startsWith(".")) stack.push(rel);
      } else {
        if (opts.excludeMeta && e.endsWith(".meta")) continue;
        if (opts.ext && extname(e).toLowerCase() !== opts.ext) continue;
        out.push(rel);
      }
    }
  }
  return out.sort();
}

/** Parse Unity YAML-like key-value (m_Key: value) from content. */
export function parseUnityKeyValue(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /^(\w+):\s*(.*)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const v = m[2].trim();
    if (v && !v.startsWith("{") && !v.startsWith("[")) out[m[1]] = v;
  }
  return out;
}

/** Get GUID from a .meta file path (reads sibling .meta of asset). */
export function getGuidFromMeta(root: string, assetPath: string): string | null {
  const metaPath = assetPath.endsWith(".meta") ? assetPath : assetPath + ".meta";
  const s = readFileSafe(root, metaPath);
  if (!s) return null;
  const m = s.match(/^guid:\s*([a-f0-9]{32})/m);
  return m ? m[1] : null;
}

/** Get asset path by GUID (scan Assets for .meta with this guid). */
export function getAssetPathByGuid(root: string, guid: string): string | null {
  const assetsDir = join(root, ASSETS);
  if (!existsSync(assetsDir)) return null;
  const stack: string[] = [ASSETS];
  while (stack.length) {
    const d = stack.pop()!;
    const fullD = join(root, d);
    let entries: string[];
    try {
      entries = readdirSync(fullD);
    } catch {
      continue;
    }
    for (const e of entries) {
      const rel = join(d, e);
      const fullPath = join(root, rel);
      if (statSync(fullPath).isDirectory()) {
        if (!e.startsWith(".")) stack.push(rel);
      } else if (e.endsWith(".meta")) {
        const content = readFileSync(fullPath, "utf-8");
        const m = content.match(/^guid:\s*([a-f0-9]{32})/m);
        if (m && m[1] === guid) return rel.replace(/\.meta$/, "");
      }
    }
  }
  return null;
}

/** Find all Asset/Scene/Prefab files that reference this GUID (fileRef or guid:). */
export function findReferencesToGuid(root: string, guid: string): string[] {
  const found: string[] = [];
  const exts = [".unity", ".prefab", ".asset", ".mat", ".controller", ".anim", ".mixer", ".overrideController"];
  const assetsDir = join(root, ASSETS);
  if (!existsSync(assetsDir)) return found;
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
        } else if (exts.some((x) => rel.endsWith(x))) {
          const content = readFileSync(fullPath, "utf-8");
          if (content.includes(guid)) found.push(rel);
        }
      }
    } catch {
      /* skip */
    }
  }
  return found;
}
