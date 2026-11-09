/**
 * Shared helper utilities for Unity project filesystem readers.
 * All project-relative FS access is confined under the Unity project root.
 */

import { readFileSync, existsSync, readdirSync, statSync, realpathSync } from "node:fs";
import { join, extname, resolve, relative, isAbsolute, dirname, sep } from "node:path";

export const ASSETS = "Assets";
export const PROJECT_SETTINGS = "ProjectSettings";
export const PACKAGES = "Packages";

/** Soft cap for docs/skills/agent markdown returned to the MCP client. */
export const MAX_TEXT_CHARS = 200_000;

/** Soft cap for user-supplied search / regex-like patterns. */
export const MAX_PATTERN_CHARS = 200;

export function truncateText(s: string, max: number = MAX_TEXT_CHARS): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}\n\n… [truncated ${s.length - max} chars for safety]`;
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Compile a literal pattern (all metacharacters escaped). Returns null if too long/empty. */
export function literalRegExp(pattern: string, flags: string = "i"): RegExp | null {
  if (!pattern || pattern.length > MAX_PATTERN_CHARS) return null;
  return new RegExp(escapeRegExp(pattern), flags);
}

/**
 * Compile a wildcard pattern where `*` means "any chars".
 * All other regex metacharacters are escaped (ReDoS-safe).
 */
export function wildcardRegExp(pattern: string, flags: string = "i"): RegExp | null {
  if (!pattern || pattern.length > MAX_PATTERN_CHARS) return null;
  const escaped = escapeRegExp(pattern).replace(/\\\*/g, ".*");
  return new RegExp(`^${escaped}$`, flags);
}

function realRoot(root: string): string | null {
  try {
    const abs = resolve(root);
    return existsSync(abs) ? realpathSync(abs) : abs;
  } catch {
    return null;
  }
}

/**
 * Resolve path segments under `root`. Returns absolute path only if the result
 * stays inside the project root (symlink-aware via realpath).
 */
export function resolveUnderRoot(root: string, ...segments: string[]): string | null {
  if (!root) return null;
  for (const s of segments) {
    if (typeof s !== "string" || s.includes("\0") || isAbsolute(s)) return null;
  }

  const rootAbs = realRoot(root);
  if (!rootAbs) return null;

  const candidate = resolve(rootAbs, ...segments);
  const relLogical = relative(rootAbs, candidate);
  if (relLogical.startsWith("..") || isAbsolute(relLogical)) return null;

  try {
    if (existsSync(candidate)) {
      const realCand = realpathSync(candidate);
      const relReal = relative(rootAbs, realCand);
      if (relReal.startsWith("..") || isAbsolute(relReal)) return null;
      return realCand;
    }

    // Missing path: ensure every existing ancestor stays inside root (blocks symlink hops).
    let cur = dirname(candidate);
    for (;;) {
      if (existsSync(cur)) {
        const realCur = realpathSync(cur);
        const relCur = relative(rootAbs, realCur);
        if (relCur.startsWith("..") || isAbsolute(relCur)) return null;
        break;
      }
      if (cur === rootAbs || !cur.startsWith(rootAbs + sep)) break;
      const parent = dirname(cur);
      if (parent === cur) break;
      cur = parent;
    }
  } catch {
    return null;
  }

  return candidate;
}

/** True if absolutePath resolves inside root (symlink-aware). */
export function isInsideRoot(root: string, absolutePath: string): boolean {
  const rootAbs = realRoot(root);
  if (!rootAbs) return false;
  try {
    const cand = resolve(absolutePath);
    const rel = relative(rootAbs, cand);
    if (rel.startsWith("..") || isAbsolute(rel)) return false;
    if (!existsSync(cand)) return true;
    const realCand = realpathSync(cand);
    const rel2 = relative(rootAbs, realCand);
    return !(rel2.startsWith("..") || isAbsolute(rel2));
  } catch {
    return false;
  }
}

export function readFileSafe(root: string, ...pathSegments: string[]): string | null {
  const p = resolveUnderRoot(root, ...pathSegments);
  if (!p || !existsSync(p)) return null;
  try {
    if (!statSync(p).isFile()) return null;
    return readFileSync(p, "utf-8");
  } catch {
    return null;
  }
}

/** Like readFileSafe but truncates large text (docs / skills / agent markdown). */
export function readTextCapped(root: string, ...pathSegments: string[]): string | null {
  const s = readFileSafe(root, ...pathSegments);
  return s == null ? null : truncateText(s);
}

export function readJsonSafe<T>(root: string, ...pathSegments: string[]): T | null {
  const s = readFileSafe(root, ...pathSegments);
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
  const startAbs = resolveUnderRoot(root, dir);
  if (!startAbs || !existsSync(startAbs) || !statSync(startAbs).isDirectory()) return [];

  const out: string[] = [];
  const stack: string[] = [dir.split(/[/\\]/).filter(Boolean).join(sep) || dir];
  while (stack.length) {
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
      if (e === "." || e === "..") continue;
      const rel = join(d, e);
      const fullPath = resolveUnderRoot(root, rel);
      if (!fullPath) continue;
      try {
        if (statSync(fullPath).isDirectory()) {
          if (e !== "node_modules" && e !== ".git" && !e.startsWith(".")) stack.push(rel);
        } else {
          if (opts.excludeMeta && e.endsWith(".meta")) continue;
          if (opts.ext && extname(e).toLowerCase() !== opts.ext) continue;
          out.push(rel.split(/[/\\]/).join("/"));
        }
      } catch {
        continue;
      }
    }
  }
  return out.sort();
}

/** Parse Unity YAML-like key-value (m_Key: value) from content. Bare block
 * headers (e.g. `PlayerSettings:`) are skipped so they never swallow a key.
 * Same-line indentation is tolerated since Unity indents block contents;
 * spacing never crosses newlines. */
export function parseUnityKeyValue(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /^[ \t]*(\w+):[ \t]*(.*?)[ \t]*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const v = m[2].trim();
    if (!v || v.startsWith("{") || v.startsWith("[") || v.endsWith(":")) continue;
    out[m[1]] = v;
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
  if (!resolveUnderRoot(root, ASSETS)) return null;
  const stack: string[] = [ASSETS];
  while (stack.length) {
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
      if (e === "." || e === "..") continue;
      const rel = join(d, e);
      const fullPath = resolveUnderRoot(root, rel);
      if (!fullPath) continue;
      try {
        if (statSync(fullPath).isDirectory()) {
          if (!e.startsWith(".")) stack.push(rel);
        } else if (e.endsWith(".meta")) {
          const content = readFileSync(fullPath, "utf-8");
          const m = content.match(/^guid:\s*([a-f0-9]{32})/m);
          if (m && m[1] === guid) return rel.replace(/\.meta$/, "").split(/[/\\]/).join("/");
        }
      } catch {
        continue;
      }
    }
  }
  return null;
}

/** Find all Asset/Scene/Prefab files that reference this GUID (fileRef or guid:). */
export function findReferencesToGuid(root: string, guid: string): string[] {
  const found: string[] = [];
  const exts = [".unity", ".prefab", ".asset", ".mat", ".controller", ".anim", ".mixer", ".overrideController"];
  if (!resolveUnderRoot(root, ASSETS)) return found;
  const stack: string[] = [ASSETS];
  while (stack.length) {
    const d = stack.pop()!;
    const fullD = resolveUnderRoot(root, d);
    if (!fullD) continue;
    try {
      for (const e of readdirSync(fullD)) {
        if (e === "." || e === "..") continue;
        const rel = join(d, e);
        const fullPath = resolveUnderRoot(root, rel);
        if (!fullPath) continue;
        if (statSync(fullPath).isDirectory()) {
          if (!e.startsWith(".")) stack.push(rel);
        } else if (exts.some((x) => rel.endsWith(x))) {
          const content = readFileSync(fullPath, "utf-8");
          if (content.includes(guid)) found.push(rel.split(/[/\\]/).join("/"));
        }
      }
    } catch {
      /* skip */
    }
  }
  return found;
}
