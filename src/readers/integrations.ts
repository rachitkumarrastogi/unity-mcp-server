/**
 * Third-party integrations readers.
 */

import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { listFilesRecursive, readFileSafe, ASSETS } from "./helpers.js";
import { getPackages } from "./project.js";

export function getPlayFabConfig(root: string): { titleId?: string; configPaths: string[] } {
  const configPaths: string[] = [];
  const candidates = listFilesRecursive(root, ASSETS, { ext: ".asset" }).filter((p) => p.toLowerCase().includes("playfab"));
  const res = listFilesRecursive(root, join(ASSETS, "Resources"), { ext: ".json" });
  candidates.forEach((p) => configPaths.push(p));
  res.filter((p) => p.toLowerCase().includes("playfab")).forEach((p) => configPaths.push(p));
  let titleId: string | undefined;
  for (const p of configPaths) {
    const content = readFileSafe(root, p);
    const m = content?.match(/titleId|TitleId|title_id["\s:]+([a-f0-9]{5,})/i);
    if (m?.[1]) titleId = m[1];
  }
  return { titleId, configPaths };
}

export function listFigmaRelatedAssets(root: string): string[] {
  const figmaDir = join(ASSETS, "Figma");
  if (existsSync(join(root, figmaDir))) return listFilesRecursive(root, figmaDir);
  return listFilesRecursive(root, ASSETS).filter((p) => p.toLowerCase().includes("figma"));
}

export function getFirebaseConfig(root: string): { googleServicesJson?: string; plist?: string; projectId?: string } {
  const plist = "GoogleService-Info.plist";
  const json = "google-services.json";
  const paths = [join(ASSETS, json), join(ASSETS, plist), json, plist];
  let content: string | null = null;
  let found: string | undefined;
  for (const p of paths) {
    content = readFileSafe(root, p);
    if (content) { found = p; break; }
  }
  if (!content) return {};
  const projectId = content.match(/project_id["\s:]+["']?([^"'\s]+)/i)?.[1];
  return { googleServicesJson: found?.includes(".json") ? found : undefined, plist: found?.includes(".plist") ? found : undefined, projectId };
}

export function getSteamConfig(root: string): { steamAppIdTxt?: string; steamworksPath?: string } {
  const appId = readFileSafe(root, "steam_appid.txt");
  let steamworksPath: string | undefined;
  const plug = join(ASSETS, "Plugins");
  if (existsSync(join(root, plug))) {
    const entries = readdirSync(join(root, plug));
    if (entries.some((e) => e.toLowerCase().includes("steam"))) steamworksPath = join(plug, entries.find((e) => e.toLowerCase().includes("steam"))!);
  }
  return { steamAppIdTxt: appId ? "steam_appid.txt" : undefined, steamworksPath };
}

export function getDiscordConfig(root: string): { sdkPath?: string } {
  const plug = join(ASSETS, "Plugins");
  const full = join(root, plug);
  if (!existsSync(full)) return {};
  const entries = readdirSync(full);
  const discord = entries.find((e) => e.toLowerCase().includes("discord"));
  return discord ? { sdkPath: join(plug, discord) } : {};
}

export function getFmodConfig(root: string): { banksPath?: string; projectPath?: string; bankFiles: string[] } {
  const bankFiles = listFilesRecursive(root, ASSETS, { ext: ".bank" });
  const meta = listFilesRecursive(root, ASSETS, { ext: ".meta" }).filter((p) => p.includes("FMOD") || p.includes("fmod"));
  let banksPath: string | undefined;
  let projectPath: string | undefined;
  for (const m of meta) {
    const content = readFileSafe(root, m);
    if (content?.includes("bank")) banksPath = m.replace(/\.meta$/, "").replace(/[^/]+$/, "");
    if (content?.includes("project")) projectPath = m.replace(/\.meta$/, "");
  }
  return { banksPath, projectPath, bankFiles };
}

export function getWwiseConfig(root: string): { soundBanksPath?: string; projectPaths: string[] } {
  const wproj = listFilesRecursive(root, ASSETS).filter((p) => p.endsWith(".wproj") || p.endsWith(".wwise"));
  const banks = listFilesRecursive(root, ASSETS).filter((p) => p.toLowerCase().includes("soundbank") || p.toLowerCase().includes("audiobank"));
  return { soundBanksPath: banks[0]?.replace(/[^/]+$/, "") || undefined, projectPaths: wproj };
}

export function listSubstanceAssets(root: string): string[] {
  const sbsar = listFilesRecursive(root, ASSETS, { ext: ".sbsar" });
  const sbs = listFilesRecursive(root, ASSETS, { ext: ".sbs" });
  return [...sbsar, ...sbs];
}

export function listSpeedTreeAssets(root: string): string[] {
  return listFilesRecursive(root, ASSETS, { ext: ".spm" }).concat(listFilesRecursive(root, ASSETS, { ext: ".stm" }));
}

export function listLottieAssets(root: string): string[] {
  const lottieDir = join(ASSETS, "Lottie");
  if (existsSync(join(root, lottieDir))) return listFilesRecursive(root, lottieDir, { ext: ".json" });
  return listFilesRecursive(root, ASSETS, { ext: ".json" }).filter((p) => p.toLowerCase().includes("lottie"));
}

export function getAnalyticsOrCrashConfig(root: string): { services: string[] } {
  const services: string[] = [];
  const packages = getPackages(root).dependencies.map((d) => d.name.toLowerCase());
  if (packages.some((p) => p.includes("analytics"))) services.push("Unity Analytics");
  if (packages.some((p) => p.includes("sentry"))) services.push("Sentry");
  if (packages.some((p) => p.includes("crashlytics"))) services.push("Crashlytics");
  if (packages.some((p) => p.includes("bugsnag"))) services.push("BugSnag");
  const assets = listFilesRecursive(root, ASSETS).filter((p) => p.toLowerCase().includes("sentry") || p.toLowerCase().includes("crashlytics"));
  if (assets.length && !services.length) services.push("Crash/Analytics (asset detected)");
  return { services };
}

export function getAdsConfig(root: string): { sdkPresence: string[] } {
  const packages = getPackages(root).dependencies.map((d) => d.name.toLowerCase());
  const sdkPresence: string[] = [];
  if (packages.some((p) => p.includes("advertisement") || p.includes("unity-ads"))) sdkPresence.push("Unity Ads");
  if (packages.some((p) => p.includes("admob") || p.includes("google-mobile-ads"))) sdkPresence.push("AdMob");
  if (packages.some((p) => p.includes("ironsource"))) sdkPresence.push("ironSource");
  return { sdkPresence };
}
