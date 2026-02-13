/**
 * Animation & Timeline readers.
 */

import { listFilesRecursive, readFileSafe, ASSETS } from "./helpers.js";

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

export function listTimelinePlayables(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".playable" });
}
