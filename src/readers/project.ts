/**
 * Project & build information readers.
 */

import { readJsonSafe, readFileSafe, parseUnityKeyValue, listFilesRecursive, ASSETS, PROJECT_SETTINGS, PACKAGES } from "./helpers.js";

export interface PackageInfo {
  name: string;
  version: string;
  type?: string;
}

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

export function getProjectVersion(root: string): string {
  const ps = getPlayerSettings(root);
  return ps.bundleVersion || ps.m_ApplicationVersion || "unknown";
}

export function getChangelog(root: string): string | null {
  return readFileSafe(root, "CHANGELOG.md") || readFileSafe(root, "CHANGELOG") || readFileSafe(root, "changelog.md");
}

export function getPhysicsSettings(root: string): { dynamics?: Record<string, string>; physics2d?: Record<string, string> } {
  const dynamicsContent = readFileSafe(root, PROJECT_SETTINGS, "DynamicsManager.asset");
  const physics2dContent = readFileSafe(root, PROJECT_SETTINGS, "Physics2DSettings.asset");
  const out: { dynamics?: Record<string, string>; physics2d?: Record<string, string> } = {};
  if (dynamicsContent) out.dynamics = parseUnityKeyValue(dynamicsContent);
  if (physics2dContent) out.physics2d = parseUnityKeyValue(physics2dContent);
  return out;
}

export function getGraphicsSettings(root: string): Record<string, string> {
  const content = readFileSafe(root, PROJECT_SETTINGS, "GraphicsSettings.asset");
  return content ? parseUnityKeyValue(content) : {};
}

export function getTimeSettings(root: string): Record<string, string> {
  const content = readFileSafe(root, PROJECT_SETTINGS, "TimeManager.asset");
  return content ? parseUnityKeyValue(content) : {};
}

export function getBuildTargetInfo(root: string): { activeBuildTarget?: string; activeBuildTargetId?: string } {
  const content = readFileSafe(root, PROJECT_SETTINGS, "ProjectSettings.asset");
  if (!content) return {};
  const m = content.match(/m_ActiveBuildTarget:\s*(\d+)/);
  const id = m?.[1];
  const names: Record<string, string> = { "0": "Unknown", "1": "Standalone", "2": "iOS", "4": "Android", "5": "WebGL", "6": "Windows Store Apps", "9": "PS4", "10": "XboxOne", "13": "tvOS", "19": "Switch", "20": "Lumin", "21": "Stadia", "22": "CloudRendering", "23": "GameCoreScarlett", "24": "GameCoreXboxOne", "25": "PS5" };
  return { activeBuildTarget: id ? names[id] || id : undefined, activeBuildTargetId: id };
}

export function getFeatureSetInference(root: string): { detected: string[]; packageCount: number } {
  const { dependencies } = getPackages(root);
  const names = dependencies.map((d) => d.name.toLowerCase());
  const detected: string[] = [];
  if (names.some((n) => n.includes("2d") && (n.includes("sprite") || n.includes("tilemap")))) detected.push("2D");
  if (names.some((n) => n.includes("entities") || n.includes("dots") || n.includes("ecs"))) detected.push("ECS");
  if (names.some((n) => n.includes("animation") || n.includes("timeline"))) detected.push("3D Characters & Animation");
  if (names.some((n) => n.includes("terrain") || n.includes("world"))) detected.push("3D World Building");
  if (names.some((n) => n.includes("ar") || n.includes("xr") || n.includes("augmented"))) detected.push("AR");
  if (names.some((n) => n.includes("visualscripting") || n.includes("bolt"))) detected.push("Visual Scripting");
  if (names.some((n) => n.includes("cinemachine") || n.includes("timeline"))) detected.push("Gameplay & Storytelling");
  if (names.some((n) => n.includes("mobile") || n.includes("android") || n.includes("ios"))) detected.push("Mobile");
  if (names.some((n) => n.includes("vr") || n.includes("xr"))) detected.push("VR");
  return { detected: [...new Set(detected)], packageCount: dependencies.length };
}
