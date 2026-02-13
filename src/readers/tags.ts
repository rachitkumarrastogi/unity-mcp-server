/**
 * Tags & layers readers.
 */

import { readFileSafe, PROJECT_SETTINGS } from "./helpers.js";

export function getTagsAndLayers(root: string): { tags: string[]; layers: string[] } {
  const content = readFileSafe(root, PROJECT_SETTINGS, "TagManager.asset");
  if (!content) return { tags: [], layers: [] };
  const tags: string[] = [];
  const tagBlock = content.match(/m_Tags:\s*\n([\s\S]*?)(?=\n\w|\n---|$)/);
  if (tagBlock) tagBlock[1].replace(/-\s+([^\n]+)/g, (_, name) => { tags.push(name.trim()); return ""; });
  const layers: string[] = [];
  for (let i = 0; i < 32; i++) {
    const m = content.match(new RegExp(`m_Layer${i}:\\s*([^\\s\n]+)`));
    if (m?.[1]) layers.push(`${i}: ${m[1]}`);
  }
  return { tags, layers };
}
