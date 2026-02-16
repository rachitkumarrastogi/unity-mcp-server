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

/** Video clip assets (.mp4, .mov, .webm under Assets). */
export function listVideoClips(root: string): string[] {
  const exts = [".mp4", ".mov", ".webm", ".avi", ".asf"];
  const out: string[] = [];
  for (const ext of exts) {
    out.push(...listFilesRecursive(root, ASSETS, { ext }));
  }
  return out.sort();
}

/** Legacy font assets (.fontsettings, .ttf, .otf) — excludes TMP which has list_tmp_fonts. */
export function listLegacyFontAssets(root: string): string[] {
  const fontsettings = listFilesRecursive(root, ASSETS, { ext: ".fontsettings" });
  const ttf = listFilesRecursive(root, ASSETS, { ext: ".ttf" });
  const otf = listFilesRecursive(root, ASSETS, { ext: ".otf" });
  return [...new Set([...fontsettings, ...ttf, ...otf])].sort();
}

/** RenderTexture assets. */
export function listRenderTextures(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".renderTexture" });
}

/** TerrainData and TerrainLayer .asset files (path or content hint). */
export function listTerrainData(root: string): { path: string; kind: "TerrainData" | "TerrainLayer" }[] {
  const assets = listFilesRecursive(root, ASSETS, { ext: ".asset" });
  const out: { path: string; kind: "TerrainData" | "TerrainLayer" }[] = [];
  for (const path of assets) {
    const lower = path.toLowerCase();
    if (lower.includes("terrain") && (lower.includes("layer") || lower.includes("data"))) {
      const content = readFileSafe(root, path);
      if (content?.includes("TerrainData")) out.push({ path, kind: "TerrainData" });
      else if (content?.includes("TerrainLayer") || lower.includes("layer")) out.push({ path, kind: "TerrainLayer" });
      else if (lower.includes("terrain") && !lower.includes("layer")) out.push({ path, kind: "TerrainData" });
    }
  }
  if (out.length === 0) {
    for (const path of assets) {
      const content = readFileSafe(root, path);
      if (content?.includes("TerrainData")) out.push({ path, kind: "TerrainData" });
      else if (content?.includes("TerrainLayer")) out.push({ path, kind: "TerrainLayer" });
    }
  }
  return out;
}

/** Lighting-related .asset files (LightingSettings, lightmap, etc.). */
export function listLightingSettingsAssets(root: string): string[] {
  const assets = listFilesRecursive(root, ASSETS, { ext: ".asset" });
  return assets.filter((p) => {
    const lower = p.toLowerCase();
    return lower.includes("light") || lower.includes("lighting") || lower.includes("lightmap") || lower.includes("reflection");
  });
}

/** Search Assets (and optionally Packages) by file or folder name pattern (e.g. "Player", "*Menu*"). */
export function searchAssetsByName(root: string, namePattern: string, includePackages?: boolean): string[] {
  const pattern = namePattern.replace(/\*/g, ".*").toLowerCase();
  const re = new RegExp(pattern, "i");
  const out: string[] = [];
  const dirs = includePackages ? [ASSETS, "Packages"] : [ASSETS];
  for (const dir of dirs) {
    const full = join(root, dir);
    if (!existsSync(full) || !statSync(full).isDirectory()) continue;
    const stack: string[] = [dir];
    while (stack.length) {
      const d = stack.pop()!;
      const fullD = join(root, d);
      try {
        for (const e of readdirSync(fullD)) {
          const rel = join(d, e);
          const fullPath = join(root, rel);
          if (statSync(fullPath).isDirectory()) {
            if (!e.startsWith(".") && e !== "node_modules") stack.push(rel);
            if (re.test(e)) out.push(rel + "/");
          } else {
            const nameWithoutMeta = e.endsWith(".meta") ? e.slice(0, -5) : e;
            if (re.test(nameWithoutMeta) || re.test(rel)) out.push(rel);
          }
        }
      } catch {
        /* */
      }
    }
  }
  return [...new Set(out)].sort().slice(0, 500);
}

/** Get texture .meta info (maxSize, width/height if present, spriteMode, spritePixelsToUnits). */
export function getTextureMeta(root: string, texturePath: string): Record<string, string | number> | null {
  const metaPath = texturePath.endsWith(".meta") ? texturePath : texturePath + ".meta";
  const content = readFileSafe(root, metaPath);
  if (!content) return null;
  const out: Record<string, string | number> = {};
  const mGuid = content.match(/^guid:\s*([a-f0-9]{32})/m);
  if (mGuid) out.guid = mGuid[1];
  const mMax = content.match(/maxTextureSize:\s*(\d+)/);
  if (mMax) out.maxTextureSize = parseInt(mMax[1], 10);
  const mW = content.match(/m_Width:\s*(\d+)/);
  if (mW) out.width = parseInt(mW[1], 10);
  const mH = content.match(/m_Height:\s*(\d+)/);
  if (mH) out.height = parseInt(mH[1], 10);
  const mSprite = content.match(/spriteMode:\s*(\d+)/);
  if (mSprite) out.spriteMode = parseInt(mSprite[1], 10);
  const mPpu = content.match(/spritePixelsToUnits:\s*([\d.]+)/);
  if (mPpu) out.spritePixelsToUnits = parseFloat(mPpu[1]);
  return Object.keys(out).length ? out : null;
}
