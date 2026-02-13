/**
 * Addressables & localization readers.
 */

import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ASSETS } from "./helpers.js";

export function getAddressablesInfo(root: string): { groups: string[]; configPath: string | null } {
  const path = join(ASSETS, "AddressableAssetsData");
  const full = join(root, path);
  if (!existsSync(full)) return { groups: [], configPath: null };
  let entries: string[];
  try {
    entries = readdirSync(full);
  } catch {
    return { groups: [], configPath: null };
  }
  const groups: string[] = [];
  let configPath: string | null = null;
  for (const e of entries) {
    if (e.endsWith(".asset")) groups.push(e.replace(/\.asset$/, ""));
    if (e === "AddressableAssetSettings.asset") configPath = join(path, e);
  }
  return { groups, configPath };
}

export function getLocalizationTables(root: string): string[] {
  const tables: string[] = [];
  const locDir = join(ASSETS, "Localization");
  const full = join(root, locDir);
  if (!existsSync(full)) return [];
  try {
    for (const e of readdirSync(full)) {
      if (e.endsWith(".asset") || e.endsWith(".csv") || e.endsWith(".json")) tables.push(join(locDir, e));
    }
  } catch {
    /* */
  }
  return tables;
}
