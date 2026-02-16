/**
 * 2D & sprites readers.
 */

import { listFilesRecursive, readFileSafe, ASSETS } from "./helpers.js";

export function listSpriteAtlases(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".spriteatlas" });
}

export function listTilemapAssets(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".asset" }).filter((p) => p.toLowerCase().includes("tilemap") || p.toLowerCase().includes("tile"));
}

/** Textures configured as sprites (TextureImporter spriteMode in .meta). */
export function listSpriteAssets(root: string): string[] {
  const textures = listFilesRecursive(root, ASSETS, { ext: ".png" })
    .concat(listFilesRecursive(root, ASSETS, { ext: ".jpg" }))
    .concat(listFilesRecursive(root, ASSETS, { ext: ".jpeg" }));
  return textures.filter((path) => {
    const meta = readFileSafe(root, path + ".meta");
    return (meta?.includes("spriteMode: 1") || meta?.includes("spriteMode: 2")) ?? false;
  });
}
