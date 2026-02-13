/**
 * CI & version control readers.
 */

import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { listFilesRecursive, readFileSafe, ASSETS } from "./helpers.js";

export function listCiConfigs(root: string): string[] {
  const out: string[] = [];
  const gh = join(root, ".github", "workflows");
  if (existsSync(gh)) readdirSync(gh).filter((e) => e.endsWith(".yml") || e.endsWith(".yaml")).forEach((e) => out.push(`.github/workflows/${e}`));
  if (existsSync(join(root, "Jenkinsfile"))) out.push("Jenkinsfile");
  if (existsSync(join(root, "unity-cloud-build.json"))) out.push("unity-cloud-build.json");
  return out;
}

export function listPresets(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".preset" });
}

export function getGitLfsTracked(root: string): string[] {
  const content = readFileSafe(root, ".gitattributes");
  if (!content) return [];
  return content.split("\n").filter((l) => l.includes("lfs") || l.includes("filter=lfs"));
}

export function getPlasticConfig(root: string): { plasticDir: boolean; workspaceName?: string } {
  const plasticDir = existsSync(join(root, ".plastic"));
  let workspaceName: string | undefined;
  const conf = readFileSafe(root, ".plastic", "plastic.workspace");
  if (conf) workspaceName = conf.match(/workspace\s+([^\n]+)/)?.[1]?.trim();
  return { plasticDir, workspaceName };
}
