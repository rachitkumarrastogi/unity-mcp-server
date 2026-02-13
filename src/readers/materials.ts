/**
 * Materials & shaders readers.
 */

import { listFilesRecursive, readFileSafe, ASSETS, PACKAGES } from "./helpers.js";
import { join } from "node:path";

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

export function listShaderGraphs(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".shadergraph" });
}

export function listVfxGraphs(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".vfx" });
}

export function listRenderPipelines(root: string): { pipelines: string[]; volumeProfiles: string[] } {
  const pipelines = listFilesRecursive(root, ASSETS, { ext: ".asset" }).filter((p) => p.toLowerCase().includes("pipeline") || p.toLowerCase().includes("render"));
  const settings = join(ASSETS, "Settings");
  const vol = listFilesRecursive(root, settings, { ext: ".asset" }).filter((p) => p.toLowerCase().includes("volume") || p.toLowerCase().includes("profile"));
  return { pipelines: pipelines.slice(0, 50), volumeProfiles: vol.slice(0, 30) };
}
