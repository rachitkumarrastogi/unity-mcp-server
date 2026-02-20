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

/** Avatar Mask assets (.mask used by Animator). */
export function listAvatarMasks(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".mask" });
}

/** Animator override controller assets (AnimatorOverrideController in YAML). */
export function listAnimatorOverrideControllers(root: string): string[] {
  const controllers = listFilesRecursive(root, ASSETS, { ext: ".controller" });
  return controllers.filter((path) => {
    const content = readFileSafe(root, path);
    return content?.includes("AnimatorOverrideController") ?? false;
  });
}

/** Animator controller transitions: state names and from/to pairs where parseable. */
export function getAnimatorTransitions(root: string, controllerPath: string): { states: string[]; transitions: { fromState: string; toState: string }[] } {
  const content = readFileSafe(root, controllerPath);
  if (!content) return { states: [], transitions: [] };
  const states = getAnimatorStates(root, controllerPath);
  const transitions: { fromState: string; toState: string }[] = [];
  const idToName = new Map<number, string>();
  const stateBlockRe = /AnimatorState:\s*\n\s+m_Name:\s*([^\n]+)\s*\n[\s\S]*?m_FileID:\s*(\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = stateBlockRe.exec(content)) !== null) {
    const name = m[1].trim();
    const id = parseInt(m[2], 10);
    if (name && !/^\d+$/.test(name)) idToName.set(id, name);
  }
  const transRe = /AnimatorStateTransition:[\s\S]*?m_DstState:\s*\{\s*fileID:\s*(\d+)[\s\S]*?m_SrcState:\s*\{\s*fileID:\s*(\d+)/g;
  while ((m = transRe.exec(content)) !== null) {
    const dstId = parseInt(m[1], 10);
    const srcId = parseInt(m[2], 10);
    const fromState = idToName.get(srcId) ?? `State${srcId}`;
    const toState = idToName.get(dstId) ?? `State${dstId}`;
    transitions.push({ fromState, toState });
  }
  return { states, transitions: transitions.slice(0, 200) };
}
