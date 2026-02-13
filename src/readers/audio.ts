/**
 * Audio readers.
 */

import { listFilesRecursive, ASSETS } from "./helpers.js";

export function getAudioClips(root: string): string[] {
  const exts = [".wav", ".mp3", ".ogg", ".aiff"];
  const out: string[] = [];
  for (const ext of exts) out.push(...listFilesRecursive(root, ASSETS, { ext }));
  return out.sort();
}

export function getAudioMixers(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".mixer" });
}
