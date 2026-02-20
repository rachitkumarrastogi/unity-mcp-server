/**
 * Scenes & prefabs readers.
 */

import { readFileSafe, listFilesRecursive, getAssetPathByGuid, ASSETS } from "./helpers.js";
import { getSceneReferencedAssets } from "./assets.js";
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

/** GameObjects in a scene that have a given component type (e.g. Camera, Light). */
export function getSceneComponentsByType(root: string, scenePath: string, componentType: string): { gameObjectName: string; componentType: string }[] {
  const content = readFileSafe(root, scenePath);
  if (!content) return [];
  const out: { gameObjectName: string; componentType: string }[] = [];
  const blocks = content.split(/---\s*(?=\d+:\s*\d+|!\w+)/);
  const typeNorm = componentType.trim();
  for (const block of blocks) {
    const hasComponent = block.includes(`${typeNorm}:`) || (typeNorm === "Camera" && block.includes("Camera:")) || (typeNorm === "Light" && block.includes("Light:"));
    if (!hasComponent) continue;
    const nameMatch = block.match(/m_Name:\s*([^\n]+)/);
    const goName = nameMatch?.[1]?.trim() ?? "?";
    if (goName && goName !== "?") out.push({ gameObjectName: goName, componentType: typeNorm });
  }
  return out.slice(0, 100);
}

/** Prefabs that are variants (reference a parent prefab). */
export function listPrefabVariants(root: string): string[] {
  const prefabs = listFilesRecursive(root, ASSETS, { ext: ".prefab" });
  return prefabs.filter((path) => {
    const content = readFileSafe(root, path);
    return (content?.includes("m_ParentPrefab:") && content?.includes("m_Modification")) ?? false;
  });
}

/** GameObjects in a scene that have a given tag (e.g. Spawn, Respawn). */
export function getSceneObjectsByTag(root: string, scenePath: string, tagName: string): { gameObjectName: string; tag: string }[] {
  const content = readFileSafe(root, scenePath);
  if (!content) return [];
  const out: { gameObjectName: string; tag: string }[] = [];
  const tagNorm = tagName.trim();
  const blocks = content.split(/---\s*(?=\d+:\s*\d+|!\w+)/);
  for (const block of blocks) {
    const tagMatch = block.match(/m_Tag:\s*([^\n]+)/);
    if (!tagMatch || tagMatch[1].trim() !== tagNorm) continue;
    const nameMatch = block.match(/m_Name:\s*([^\n]+)/);
    const goName = nameMatch?.[1]?.trim() ?? "?";
    if (goName && goName !== "?") out.push({ gameObjectName: goName, tag: tagNorm });
  }
  return out.slice(0, 200);
}

/** All occurrences of a component type across all scenes (scene path + GameObject name). */
export function getAllComponentsByType(root: string, componentType: string): { scenePath: string; gameObjectName: string; componentType: string }[] {
  const scenes = getAllScenes(root);
  const out: { scenePath: string; gameObjectName: string; componentType: string }[] = [];
  const typeNorm = componentType.trim();
  for (const scenePath of scenes) {
    const items = getSceneComponentsByType(root, scenePath, typeNorm);
    for (const item of items) out.push({ scenePath, gameObjectName: item.gameObjectName, componentType: typeNorm });
  }
  return out.slice(0, 300);
}

/** Prefabs that contain a given component type (e.g. Animator, Rigidbody). */
export function listPrefabsWithComponent(root: string, componentType: string): string[] {
  const prefabs = listFilesRecursive(root, ASSETS, { ext: ".prefab" });
  const typeNorm = componentType.trim();
  return prefabs.filter((path) => {
    const content = readFileSafe(root, path);
    return content?.includes(`${typeNorm}:`) ?? false;
  });
}

/** Flat list of GameObjects in a scene: name and layer. */
export function getSceneHierarchyFlat(root: string, scenePath: string): { name: string; layer: number }[] {
  const content = readFileSafe(root, scenePath);
  if (!content) return [];
  const out: { name: string; layer: number }[] = [];
  const blocks = content.split(/---\s*(?=\d+:\s*\d+|!\w+)/);
  for (const block of blocks) {
    if (!block.includes("GameObject:")) continue;
    const nameMatch = block.match(/m_Name:\s*([^\n]+)/);
    const layerMatch = block.match(/m_Layer:\s*(\d+)/);
    const name = nameMatch?.[1]?.trim() ?? "?";
    const layer = layerMatch ? parseInt(layerMatch[1], 10) : 0;
    out.push({ name, layer });
  }
  return out.slice(0, 500);
}

/** Prefab summary: root name, component count, component type names. */
export function getPrefabSummary(root: string, prefabPath: string): { rootName: string; componentCount: number; componentTypes: string[] } | null {
  const content = readFileSafe(root, prefabPath);
  if (!content) return null;
  const componentTypes: string[] = [];
  const typeRe = /^(\d+:\s*\d+\s+|\!)(\w+):/gm;
  let m: RegExpExecArray | null;
  while ((m = typeRe.exec(content)) !== null) {
    const typeName = m[2];
    if (typeName && !componentTypes.includes(typeName)) componentTypes.push(typeName);
  }
  const firstGo = content.match(/GameObject:\s*\n\s+m_Name:\s*([^\n]+)/);
  const rootName = firstGo?.[1]?.trim() ?? "?";
  const compCount = (content.match(/MonoBehaviour:|Transform:|Animator:|RectTransform:/g) || []).length;
  return { rootName, componentCount: compCount, componentTypes: componentTypes.slice(0, 50) };
}

/** Lighting info for a scene: referenced lighting assets and GI workflow mode if present. */
export function getLightingSceneInfo(root: string, scenePath: string): { scenePath: string; referencedLightingAssets: string[]; giWorkflowMode?: number } {
  const { resolved } = getSceneReferencedAssets(root, scenePath);
  const lighting = resolved.filter((p) => /light|lighting|lightmap|reflection|reflectionprobe/i.test(p));
  const content = readFileSafe(root, scenePath);
  let giWorkflowMode: number | undefined;
  const m = content?.match(/m_GIWorkflowMode:\s*(\d+)/);
  if (m) giWorkflowMode = parseInt(m[1], 10);
  return { scenePath, referencedLightingAssets: lighting, giWorkflowMode };
}
