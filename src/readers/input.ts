/**
 * Input system readers.
 */

import { readFileSafe, readJsonSafe, parseUnityKeyValue, PROJECT_SETTINGS } from "./helpers.js";
import { listFilesRecursive, ASSETS } from "./helpers.js";

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
