/**
 * 2D & sprites readers.
 */

import { listFilesRecursive, ASSETS } from "./helpers.js";

export function listSpriteAtlases(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".spriteatlas" });
}

export function listTilemapAssets(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".asset" }).filter((p) => p.toLowerCase().includes("tilemap") || p.toLowerCase().includes("tile"));
}
