/**
 * Speed & productivity tools.
 */

import { listScripts, getAssemblyDefinitions, getAssemblyDependencyGraph } from "./code.js";
import { getPrefabs, getAllScenes } from "./scenes.js";
import { getMaterials } from "./materials.js";
import { getAnimatorControllers, getAnimationClips } from "./animation.js";
import { getPackages, getBuildScenes, getProjectVersion } from "./project.js";
import { getSceneReferencedAssets, getBrokenScriptRefs, getPrefabDependencies, listLargeAssets } from "./assets.js";
import { readFileSafe } from "./helpers.js";

/** Project stats in one call (script count, prefab count, etc.). */
export function getProjectStats(root: string): Record<string, number> {
  return {
    scripts: listScripts(root).length,
    prefabs: getPrefabs(root).length,
    scenes: getAllScenes(root).length,
    materials: getMaterials(root).length,
    animatorControllers: getAnimatorControllers(root).length,
    animationClips: getAnimationClips(root).length,
    assemblies: getAssemblyDefinitions(root).length,
    packages: getPackages(root).dependencies.length,
  };
}

export { getSceneReferencedAssets, getBrokenScriptRefs, getPrefabDependencies } from "./assets.js";

/** Detect circular references in assembly definition graph. */
export function detectAssemblyCycles(root: string): string[][] {
  const { nodes, edges } = getAssemblyDependencyGraph(root);
  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n, []);
  for (const [a, b] of edges) adj.get(a)?.push(b);
  const cycles: string[][] = [];
  const stack: string[] = [];
  const index = new Map<string, number>();
  const lowlink = new Map<string, number>();
  let idx = 0;
  const scc: string[] = [];
  function strongConnect(v: string) {
    index.set(v, idx);
    lowlink.set(v, idx);
    idx++;
    stack.push(v);
    for (const w of adj.get(v) || []) {
      if (!index.has(w)) {
        strongConnect(w);
        lowlink.set(v, Math.min(lowlink.get(v)!, lowlink.get(w)!));
      } else if (stack.includes(w)) lowlink.set(v, Math.min(lowlink.get(v)!, index.get(w)!));
    }
    if (lowlink.get(v) === index.get(v)) {
      const comp: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        comp.push(w);
      } while (w !== v);
      if (comp.length > 1) cycles.push(comp);
    }
  }
  for (const n of nodes) if (!index.has(n)) strongConnect(n);
  return cycles;
}

/** Find .cs files that reference a given type/class name (grep). */
export function findScriptReferences(root: string, typeOrClassName: string): string[] {
  const files = listScripts(root);
  const re = new RegExp(typeOrClassName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const out: string[] = [];
  for (const rel of files) {
    const content = readFileSafe(root, rel);
    if (content && re.test(content)) out.push(rel);
  }
  return out;
}

/** One-shot release readiness: version, build scenes, packages, broken refs, assembly cycles, large assets. */
export function getReleaseReadiness(root: string): {
  version: string;
  buildSceneCount: number;
  packageCount: number;
  brokenScriptRefCount: number;
  hasAssemblyCycles: boolean;
  largeAssetCount: number;
} {
  const buildScenes = getBuildScenes(root);
  const packages = getPackages(root);
  const broken = getBrokenScriptRefs(root);
  const cycles = detectAssemblyCycles(root);
  const large = listLargeAssets(root, 5);
  return {
    version: getProjectVersion(root),
    buildSceneCount: buildScenes.length,
    packageCount: packages.dependencies.length,
    brokenScriptRefCount: broken.length,
    hasAssemblyCycles: cycles.length > 0,
    largeAssetCount: large.length,
  };
}
