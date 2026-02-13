/**
 * Unity project filesystem readers. No Unity Editor required.
 * All paths are relative to project root.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ASSETS = "Assets";
const PROJECT_SETTINGS = "ProjectSettings";
const PACKAGES = "Packages";

// --- Helpers ---

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

// --- 1. Project & package info ---

export function getUnityVersion(root: string): string {
  const s = readFileSafe(root, PROJECT_SETTINGS, "ProjectVersion.txt");
  if (!s) return "unknown";
  const m = s.match(/m_EditorVersion:\s*(.+)/);
  return m ? m[1].trim() : "unknown";
}

export function getBuildScenes(root: string): { index: number; path: string; name: string }[] {
  const content = readFileSafe(root, PROJECT_SETTINGS, "EditorBuildSettings.asset");
  if (!content) return [];
  const scenes: { index: number; path: string; name: string }[] = [];
  let index = 0;
  const pathRe = /path: (Assets\/[^\n]+\.unity)/g;
  let m: RegExpExecArray | null;
  while ((m = pathRe.exec(content)) !== null) {
    const fullPath = m[1];
    const name = fullPath.replace(/^.*\//, "").replace(/\.unity$/, "");
    scenes.push({ index, path: fullPath, name });
    index++;
  }
  return scenes;
}

export interface PackageInfo {
  name: string;
  version: string;
  type?: string;
}

export function getPackages(root: string): { dependencies: PackageInfo[]; lock?: Record<string, string> } {
  const manifest = readJsonSafe<{ dependencies?: Record<string, string> }>(root, PACKAGES, "manifest.json");
  if (!manifest?.dependencies) return { dependencies: [] };
  const dependencies: PackageInfo[] = Object.entries(manifest.dependencies).map(([name, version]) => ({
    name,
    version,
    type: version.startsWith("file:") ? "local" : "registry",
  }));
  const lock = readJsonSafe<Record<string, string>>(root, PACKAGES, "packages-lock.json");
  return { dependencies, lock: lock || undefined };
}

export function getPlayerSettings(root: string): Record<string, string> {
  const content = readFileSafe(root, PROJECT_SETTINGS, "ProjectSettings.asset");
  if (!content) return {};
  const kv = parseUnityKeyValue(content);
  const out: Record<string, string> = {};
  if (kv.productGUID) out.productGUID = kv.productGUID;
  const ps = content.match(/PlayerSettings:/s) ? parseUnityKeyValue(content) : kv;
  ["m_ProductName", "m_CompanyName", "m_ApplicationIdentifier", "bundleVersion", "AndroidBundleVersionCode", "iOSBuildNumber"].forEach((k) => {
    if (ps[k] !== undefined) out[k] = ps[k];
  });
  return Object.keys(out).length ? out : kv;
}

export function getQualitySettings(root: string): Record<string, string>[] {
  const content = readFileSafe(root, PROJECT_SETTINGS, "QualitySettings.asset");
  if (!content) return [];
  const levels: Record<string, string>[] = [];
  const blockRe = /m_QualitySettings:\s*\n(\s+-\s+\n(?:\s+[\w:]+\s*\n)+)/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(content)) !== null) {
    levels.push(parseUnityKeyValue(m[1]));
  }
  if (levels.length === 0) levels.push(parseUnityKeyValue(content));
  return levels;
}

export function getScriptingDefines(root: string): { global: string[]; perAssembly: Record<string, string[]> } {
  const content = readFileSafe(root, PROJECT_SETTINGS, "ProjectSettings.asset");
  const global: string[] = [];
  if (content) {
    const m = content.match(/m_ScriptingDefineSymbols:\s*\n\s+(\w+):\s*([^\n]+)/);
    if (m) global.push(...m[2].split(",").map((s) => s.trim()).filter(Boolean));
  }
  const perAssembly: Record<string, string[]> = {};
  const asmDefs = listFilesRecursive(root, ASSETS, { ext: ".asmdef" });
  for (const rel of asmDefs) {
    const j = readJsonSafe<{ name: string; defineConstraints?: string[]; versionDefines?: Array<{ name: string; define: string }> }>(root, rel);
    if (j?.name) {
      const defs: string[] = [];
      j.defineConstraints?.forEach((c) => defs.push(`constraint:${c}`));
      j.versionDefines?.forEach((v) => defs.push(`${v.name}=${v.define}`));
      if (defs.length) perAssembly[j.name] = defs;
    }
  }
  return { global, perAssembly };
}

// --- 2. Code & assemblies ---

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

// --- 3. Scenes & build ---

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

// --- 4. Prefabs ---

export function getPrefabs(root: string, pathPrefix?: string): string[] {
  let files = listFilesRecursive(root, ASSETS, { ext: ".prefab" });
  if (pathPrefix) {
    const prefix = pathPrefix.startsWith("Assets/") ? pathPrefix : join(ASSETS, pathPrefix);
    files = files.filter((f) => f.startsWith(prefix + "/") || f.startsWith(prefix + "\\"));
  }
  return files;
}

// --- 5. Assets & references ---

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

// --- 6. Materials & shaders ---

export function getMaterials(root: string, folder?: string): { path: string; shader?: string }[] {
  let files = listFilesRecursive(root, ASSETS, { ext: ".mat" });
  if (folder) {
    const prefix = folder.startsWith("Assets/") ? folder : join(ASSETS, folder);
    files = files.filter((f) => f.startsWith(prefix + "/") || f.startsWith(prefix + "\\"));
  }
  return files.map((path) => {
    const content = readFileSafe(root, path);
    const shader = content?.match(/m_Shader:\s*\{fileID:\s*\d+,\s*guid:\s*([a-f0-9]+)/);
    return { path, shader: shader ? shader[1] : undefined };
  });
}

export function getShaders(root: string): string[] {
  const inAssets = listFilesRecursive(root, ASSETS, { ext: ".shader" });
  const inPackages = listFilesRecursive(root, PACKAGES, { ext: ".shader" });
  return [...inAssets, ...inPackages.map((p) => p.startsWith("Packages/") ? p : `Packages/${p}`)];
}

// --- 7. Animation ---

export function getAnimatorControllers(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".controller" });
}

export function getAnimationClips(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".anim" });
}

/** High-level state names from .controller (m_StateMachine -> states). */
export function getAnimatorStates(root: string, controllerPath: string): string[] {
  const content = readFileSafe(root, controllerPath);
  if (!content) return [];
  const names: string[] = [];
  const re = /m_Name:\s*([^\n]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) names.push(m[1].trim());
  return [...new Set(names)].filter((n) => n && n !== "Base Layer" && !/^\d+$/.test(n));
}

// --- 8. Audio ---

export function getAudioClips(root: string): string[] {
  const exts = [".wav", ".mp3", ".ogg", ".aiff"];
  const out: string[] = [];
  for (const ext of exts) out.push(...listFilesRecursive(root, ASSETS, { ext }));
  return out.sort();
}

export function getAudioMixers(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".mixer" });
}

// --- 9. Addressables ---

export function getAddressablesInfo(root: string): { groups: string[]; configPath: string | null } {
  const path = join(ASSETS, "AddressableAssetsData");
  const full = join(root, path);
  if (!existsSync(full)) return { groups: [], configPath: null };
  let entries: string[];
  try {
    entries = readdirSync(full);
  } catch {
    return { groups: [], configPath: null };
  }
  const groups: string[] = [];
  let configPath: string | null = null;
  for (const e of entries) {
    if (e.endsWith(".asset")) groups.push(e.replace(/\.asset$/, ""));
    if (e === "AddressableAssetSettings.asset") configPath = join(path, e);
  }
  return { groups, configPath };
}

// --- 10. Localization ---

export function getLocalizationTables(root: string): string[] {
  const tables: string[] = [];
  const locDir = join(ASSETS, "Localization");
  const full = join(root, locDir);
  if (!existsSync(full)) return [];
  try {
    for (const e of readdirSync(full)) {
      if (e.endsWith(".asset") || e.endsWith(".csv") || e.endsWith(".json")) tables.push(join(locDir, e));
    }
  } catch {
    /* */
  }
  return tables;
}

// --- 11. Input ---

export function getInputAxes(root: string): { name: string; descriptiveName?: string; positiveButton?: string }[] {
  const content = readFileSafe(root, PROJECT_SETTINGS, "InputManager.asset");
  if (!content) return [];
  const axes: { name: string; descriptiveName?: string; positiveButton?: string }[] = [];
  const blockRe = /-\s+serializedVersion:\s*\d+\s+m_Name:\s*([^\n]+)\s+m_DescriptiveName:\s*([^\n]*)\s+m_PositiveButton:\s*([^\n]*)/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(content)) !== null) axes.push({ name: m[1].trim(), descriptiveName: m[2].trim() || undefined, positiveButton: m[3].trim() || undefined });
  if (axes.length === 0) {
    const kv = parseUnityKeyValue(content);
    if (kv.m_Name) axes.push({ name: kv.m_Name });
  }
  return axes;
}

// --- 12. Tags & layers ---

export function getTagsAndLayers(root: string): { tags: string[]; layers: string[] } {
  const content = readFileSafe(root, PROJECT_SETTINGS, "TagManager.asset");
  if (!content) return { tags: [], layers: [] };
  const tags: string[] = [];
  const tagBlock = content.match(/m_Tags:\s*\n([\s\S]*?)(?=\n\w|\n---|$)/);
  if (tagBlock) tagBlock[1].replace(/-\s+([^\n]+)/g, (_, name) => { tags.push(name.trim()); return ""; });
  const layers: string[] = [];
  for (let i = 0; i < 32; i++) {
    const m = content.match(new RegExp(`m_Layer${i}:\\s*([^\\s\n]+)`));
    if (m?.[1]) layers.push(`${i}: ${m[1]}`);
  }
  return { tags, layers };
}

// --- 13. Testing ---

export function getTestAssemblies(root: string): AsmDefInfo[] {
  const all = getAssemblyDefinitions(root);
  return all.filter((a) => a.path.toLowerCase().includes("test") || a.path.toLowerCase().includes("editor") && a.path.toLowerCase().includes("test"));
}

// --- 14. Docs & conventions ---

const DOC_FILES = ["README.md", "CONTRIBUTING.md", ".cursorrules", "CODING_STANDARDS.md", "STYLE.md"];

export function getRepoDocs(root: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of DOC_FILES) {
    const s = readFileSafe(root, name);
    if (s) out[name] = s;
  }
  return out;
}

// --- 15. CI / versioning ---

export function getProjectVersion(root: string): string {
  const ps = getPlayerSettings(root);
  return ps.bundleVersion || ps.m_ApplicationVersion || "unknown";
}

export function getChangelog(root: string): string | null {
  return readFileSafe(root, "CHANGELOG.md") || readFileSafe(root, "CHANGELOG") || readFileSafe(root, "changelog.md");
}

// --- 16. Physics ---
export function getPhysicsSettings(root: string): { dynamics?: Record<string, string>; physics2d?: Record<string, string> } {
  const dynamicsContent = readFileSafe(root, PROJECT_SETTINGS, "DynamicsManager.asset");
  const physics2dContent = readFileSafe(root, PROJECT_SETTINGS, "Physics2DSettings.asset");
  const out: { dynamics?: Record<string, string>; physics2d?: Record<string, string> } = {};
  if (dynamicsContent) out.dynamics = parseUnityKeyValue(dynamicsContent);
  if (physics2dContent) out.physics2d = parseUnityKeyValue(physics2dContent);
  return out;
}

// --- 17. Render pipelines (URP/HDRP) ---
export function listRenderPipelines(root: string): { pipelines: string[]; volumeProfiles: string[] } {
  const pipelines = listFilesRecursive(root, ASSETS, { ext: ".asset" }).filter((p) => p.toLowerCase().includes("pipeline") || p.toLowerCase().includes("render"));
  const settings = join(ASSETS, "Settings");
  const vol = listFilesRecursive(root, settings, { ext: ".asset" }).filter((p) => p.toLowerCase().includes("volume") || p.toLowerCase().includes("profile"));
  return { pipelines: pipelines.slice(0, 50), volumeProfiles: vol.slice(0, 30) };
}

// --- 18. Timeline ---
export function listTimelinePlayables(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".playable" });
}

// --- 19. Sprites / 2D ---
export function listSpriteAtlases(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".spriteatlas" });
}

export function listTilemapAssets(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".asset" }).filter((p) => p.toLowerCase().includes("tilemap") || p.toLowerCase().includes("tile"));
}

// --- 20. Shader Graph / VFX ---
export function listShaderGraphs(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".shadergraph" });
}

export function listVfxGraphs(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".vfx" });
}

// --- 21. TextMeshPro ---
export function listTmpFonts(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".asset" }).filter((p) => p.toLowerCase().includes("tmp") || p.toLowerCase().includes("font"));
}

export function getTmpSettingsPath(root: string): string | null {
  const paths = ["Assets/Resources/TMP Settings.asset", "Assets/TextMesh Pro/Resources/TMP Settings.asset"];
  for (const p of paths) if (existsSync(join(root, p))) return p;
  return null;
}

// --- 22. UI Toolkit ---
export function listUiDocuments(root: string): { uxml: string[]; uss: string[] } {
  const uxml = listFilesRecursive(root, ASSETS, { ext: ".uxml" });
  const uss = listFilesRecursive(root, ASSETS, { ext: ".uss" });
  return { uxml, uss };
}

// --- 23. New Input System (.inputactions) ---
export function listInputActionAssets(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".inputactions" });
}

export function getInputActionsSummary(root: string, path: string): { maps: string[]; actions: string[] } {
  const j = readJsonSafe<{ maps?: Array<{ name: string }>; actions?: Array<{ name: string }> }>(root, path);
  if (!j) return { maps: [], actions: [] };
  return {
    maps: (j.maps || []).map((m) => m.name),
    actions: (j.actions || []).map((a) => a.name),
  };
}

// --- 24. Presets ---
export function listPresets(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".preset" });
}

// --- 25. Editor scripts ---
export function listEditorScripts(root: string): string[] {
  const all = listScripts(root);
  return all.filter((p) => p.includes("Editor") || p.toLowerCase().includes("/editor/"));
}

// --- 26. Prefab → script refs ---
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

// --- 27. Assembly dependency graph ---
export function getAssemblyDependencyGraph(root: string): { nodes: string[]; edges: [string, string][] } {
  const asms = getAssemblyDefinitions(root);
  const nodes = asms.map((a) => a.name);
  const edges: [string, string][] = [];
  for (const a of asms) for (const ref of a.references) edges.push([a.name, ref]);
  return { nodes, edges };
}

// --- 28. CI configs ---
export function listCiConfigs(root: string): string[] {
  const out: string[] = [];
  const gh = join(root, ".github", "workflows");
  if (existsSync(gh)) readdirSync(gh).filter((e) => e.endsWith(".yml") || e.endsWith(".yaml")).forEach((e) => out.push(`.github/workflows/${e}`));
  if (existsSync(join(root, "Jenkinsfile"))) out.push("Jenkinsfile");
  if (existsSync(join(root, "unity-cloud-build.json"))) out.push("unity-cloud-build.json");
  return out;
}

// --- 29. Large assets ---
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

// --- 30. PlayFab ---
export function getPlayFabConfig(root: string): { titleId?: string; configPaths: string[] } {
  const configPaths: string[] = [];
  const candidates = listFilesRecursive(root, ASSETS, { ext: ".asset" }).filter((p) => p.toLowerCase().includes("playfab"));
  const res = listFilesRecursive(root, join(ASSETS, "Resources"), { ext: ".json" });
  candidates.forEach((p) => configPaths.push(p));
  res.filter((p) => p.toLowerCase().includes("playfab")).forEach((p) => configPaths.push(p));
  let titleId: string | undefined;
  for (const p of configPaths) {
    const content = readFileSafe(root, p);
    const m = content?.match(/titleId|TitleId|title_id["\s:]+([a-f0-9]{5,})/i);
    if (m?.[1]) titleId = m[1];
  }
  return { titleId, configPaths };
}

// --- 31. Figma-related assets ---
export function listFigmaRelatedAssets(root: string): string[] {
  const figmaDir = join(ASSETS, "Figma");
  if (existsSync(join(root, figmaDir))) return listFilesRecursive(root, figmaDir);
  return listFilesRecursive(root, ASSETS).filter((p) => p.toLowerCase().includes("figma"));
}

// --- 32. Firebase ---
export function getFirebaseConfig(root: string): { googleServicesJson?: string; plist?: string; projectId?: string } {
  const plist = "GoogleService-Info.plist";
  const json = "google-services.json";
  const paths = [join(ASSETS, json), join(ASSETS, plist), json, plist];
  let content: string | null = null;
  let found: string | undefined;
  for (const p of paths) {
    content = readFileSafe(root, p);
    if (content) { found = p; break; }
  }
  if (!content) return {};
  const projectId = content.match(/project_id["\s:]+["']?([^"'\s]+)/i)?.[1];
  return { googleServicesJson: found?.includes(".json") ? found : undefined, plist: found?.includes(".plist") ? found : undefined, projectId };
}

// --- 33. Steam ---
export function getSteamConfig(root: string): { steamAppIdTxt?: string; steamworksPath?: string } {
  const appId = readFileSafe(root, "steam_appid.txt");
  let steamworksPath: string | undefined;
  const plug = join(ASSETS, "Plugins");
  if (existsSync(join(root, plug))) {
    const entries = readdirSync(join(root, plug));
    if (entries.some((e) => e.toLowerCase().includes("steam"))) steamworksPath = join(plug, entries.find((e) => e.toLowerCase().includes("steam"))!);
  }
  return { steamAppIdTxt: appId ? "steam_appid.txt" : undefined, steamworksPath };
}

// --- 34. Discord ---
export function getDiscordConfig(root: string): { sdkPath?: string } {
  const plug = join(ASSETS, "Plugins");
  const full = join(root, plug);
  if (!existsSync(full)) return {};
  const entries = readdirSync(full);
  const discord = entries.find((e) => e.toLowerCase().includes("discord"));
  return discord ? { sdkPath: join(plug, discord) } : {};
}

// --- 35. FMOD ---
export function getFmodConfig(root: string): { banksPath?: string; projectPath?: string; bankFiles: string[] } {
  const bankFiles = listFilesRecursive(root, ASSETS, { ext: ".bank" });
  const meta = listFilesRecursive(root, ASSETS, { ext: ".meta" }).filter((p) => p.includes("FMOD") || p.includes("fmod"));
  let banksPath: string | undefined;
  let projectPath: string | undefined;
  for (const m of meta) {
    const content = readFileSafe(root, m);
    if (content?.includes("bank")) banksPath = m.replace(/\.meta$/, "").replace(/[^/]+$/, "");
    if (content?.includes("project")) projectPath = m.replace(/\.meta$/, "");
  }
  return { banksPath, projectPath, bankFiles };
}

// --- 36. Wwise ---
export function getWwiseConfig(root: string): { soundBanksPath?: string; projectPaths: string[] } {
  const wproj = listFilesRecursive(root, ASSETS).filter((p) => p.endsWith(".wproj") || p.endsWith(".wwise"));
  const banks = listFilesRecursive(root, ASSETS).filter((p) => p.toLowerCase().includes("soundbank") || p.toLowerCase().includes("audiobank"));
  return { soundBanksPath: banks[0]?.replace(/[^/]+$/, "") || undefined, projectPaths: wproj };
}

// --- 37. Substance ---
export function listSubstanceAssets(root: string): string[] {
  const sbsar = listFilesRecursive(root, ASSETS, { ext: ".sbsar" });
  const sbs = listFilesRecursive(root, ASSETS, { ext: ".sbs" });
  return [...sbsar, ...sbs];
}

// --- 38. SpeedTree ---
export function listSpeedTreeAssets(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".spm" }).concat(listFilesRecursive(root, ASSETS, { ext: ".stm" }));
}

// --- 39. Lottie ---
export function listLottieAssets(root: string): string[] {
  const lottieDir = join(ASSETS, "Lottie");
  if (existsSync(join(root, lottieDir))) return listFilesRecursive(root, lottieDir, { ext: ".json" });
  return listFilesRecursive(root, ASSETS, { ext: ".json" }).filter((p) => p.toLowerCase().includes("lottie"));
}

// --- 40. Analytics / crash reporting ---
export function getAnalyticsOrCrashConfig(root: string): { services: string[] } {
  const services: string[] = [];
  const packages = getPackages(root).dependencies.map((d) => d.name.toLowerCase());
  if (packages.some((p) => p.includes("analytics"))) services.push("Unity Analytics");
  if (packages.some((p) => p.includes("sentry"))) services.push("Sentry");
  if (packages.some((p) => p.includes("crashlytics"))) services.push("Crashlytics");
  if (packages.some((p) => p.includes("bugsnag"))) services.push("BugSnag");
  const assets = listFilesRecursive(root, ASSETS).filter((p) => p.toLowerCase().includes("sentry") || p.toLowerCase().includes("crashlytics"));
  if (assets.length && !services.length) services.push("Crash/Analytics (asset detected)");
  return { services };
}

// --- 41. Ads ---
export function getAdsConfig(root: string): { sdkPresence: string[] } {
  const packages = getPackages(root).dependencies.map((d) => d.name.toLowerCase());
  const sdkPresence: string[] = [];
  if (packages.some((p) => p.includes("advertisement") || p.includes("unity-ads"))) sdkPresence.push("Unity Ads");
  if (packages.some((p) => p.includes("admob") || p.includes("google-mobile-ads"))) sdkPresence.push("AdMob");
  if (packages.some((p) => p.includes("ironsource"))) sdkPresence.push("ironSource");
  return { sdkPresence };
}

// --- 42. Git LFS ---
export function getGitLfsTracked(root: string): string[] {
  const content = readFileSafe(root, ".gitattributes");
  if (!content) return [];
  return content.split("\n").filter((l) => l.includes("lfs") || l.includes("filter=lfs"));
}

// --- 43. Plastic SCM ---
export function getPlasticConfig(root: string): { plasticDir: boolean; workspaceName?: string } {
  const plasticDir = existsSync(join(root, ".plastic"));
  let workspaceName: string | undefined;
  const conf = readFileSafe(root, ".plastic", "plastic.workspace");
  if (conf) workspaceName = conf.match(/workspace\s+([^\n]+)/)?.[1]?.trim();
  return { plasticDir, workspaceName };
}
