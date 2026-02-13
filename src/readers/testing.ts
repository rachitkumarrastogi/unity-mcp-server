/**
 * Testing & docs readers.
 */

import { readFileSafe } from "./helpers.js";
import { getAssemblyDefinitions, type AsmDefInfo } from "./code.js";

const DOC_FILES = ["README.md", "CONTRIBUTING.md", ".cursorrules", "CODING_STANDARDS.md", "STYLE.md"];

export function getRepoDocs(root: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of DOC_FILES) {
    const s = readFileSafe(root, name);
    if (s) out[name] = s;
  }
  return out;
}

export { AsmDefInfo };
export function getTestAssemblies(root: string): AsmDefInfo[] {
  const all = getAssemblyDefinitions(root);
  return all.filter((a) => a.path.toLowerCase().includes("test") || a.path.toLowerCase().includes("editor") && a.path.toLowerCase().includes("test"));
}
