/**
 * TextMeshPro & UI Toolkit readers.
 */

import { listFilesRecursive, ASSETS } from "./helpers.js";
import { existsSync } from "node:fs";
import { join } from "node:path";

export function listTmpFonts(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".asset" }).filter((p) => p.toLowerCase().includes("tmp") || p.toLowerCase().includes("font"));
}

export function getTmpSettingsPath(root: string): string | null {
  const paths = ["Assets/Resources/TMP Settings.asset", "Assets/TextMesh Pro/Resources/TMP Settings.asset"];
  for (const p of paths) if (existsSync(join(root, p))) return p;
  return null;
}

export function listUiDocuments(root: string): { uxml: string[]; uss: string[] } {
  const uxml = listFilesRecursive(root, ASSETS, { ext: ".uxml" });
  const uss = listFilesRecursive(root, ASSETS, { ext: ".uss" });
  return { uxml, uss };
}
