/**
 * Unity 6.x coverage readers — multiplayer, build profiles, physics, UGS,
 * Adaptive Performance, accessibility, Cinemachine, platform hints, BIRP migration.
 * Filesystem / manifest only (no Editor).
 */

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  ASSETS,
  PROJECT_SETTINGS,
  PACKAGES,
  listFilesRecursive,
  readFileSafe,
  readJsonSafe,
  resolveUnderRoot,
} from "./helpers.js";
import { getPackages, getUnityVersion, getBuildTargetInfo, getGraphicsSettings, getPhysicsSettings } from "./project.js";

function packageHits(
  root: string,
  test: (name: string) => boolean
): Array<{ package: string; version: string }> {
  return getPackages(root)
    .dependencies.filter((d) => test(d.name))
    .map((d) => ({ package: d.name, version: d.version }));
}

function scanScripts(root: string, rules: Array<{ label: string; re: RegExp }>, maxFiles = 400) {
  const scripts = listFilesRecursive(root, ASSETS, { ext: ".cs" }).slice(0, maxFiles);
  const byLabel: Record<string, number> = {};
  const samples: Array<{ path: string; labels: string[] }> = [];
  for (const rule of rules) byLabel[rule.label] = 0;

  for (const path of scripts) {
    const content = readFileSafe(root, path);
    if (!content) continue;
    const labels: string[] = [];
    for (const rule of rules) {
      if (rule.re.test(content)) {
        byLabel[rule.label]++;
        labels.push(rule.label);
      }
    }
    if (labels.length) samples.push({ path, labels });
  }
  return {
    by_label: Object.entries(byLabel).map(([label, count]) => ({ label, count })),
    sample_scripts: samples.slice(0, 25),
  };
}

/** Netcode for GameObjects, Unity Multiplayer, Relay/Lobby/Vivox, Mirror/FishNet, etc. */
export function getMultiplayerStack(root: string) {
  const packages = packageHits(
    root,
    (n) =>
      n.includes("netcode") ||
      n.includes("multiplayer") ||
      n.includes("transport") ||
      n.includes("relay") ||
      n.includes("lobby") ||
      n.includes("vivox") ||
      n.includes("dedicated-server") ||
      n.includes("services.multiplayer") ||
      n.includes("mirror") ||
      n.includes("fishnet") ||
      n.includes("photon")
  );

  const scripts = scanScripts(root, [
    { label: "Netcode for GameObjects", re: /Unity\.Netcode|NetworkBehaviour|NetworkObject|NetworkManager/i },
    { label: "Unity Transport / UTP", re: /Unity\.Networking\.Transport|NetworkDriver/i },
    { label: "Relay / Lobby", re: /Unity\.Services\.Relay|Unity\.Services\.Lobby/i },
    { label: "Mirror / FishNet / Photon", re: /\bMirror\.|FishNet\.|Photon\.Pun|PhotonNetwork/i },
  ]);

  const hints: string[] = [];
  if (!packages.length && !scripts.sample_scripts.length) {
    hints.push(
      "No multiplayer packages or Netcode scripts detected. If this is an online game, add com.unity.netcode.gameobjects or confirm a custom stack."
    );
  }

  return { packages, ...scripts, hints };
}

/** Unity 6 Build Profile assets (and classic EditorBuildSettings as fallback context). */
export function listBuildProfiles(root: string) {
  const candidates = [
    ...listFilesRecursive(root, ASSETS, { ext: ".asset" }),
    ...listFilesRecursive(root, PROJECT_SETTINGS, { ext: ".asset" }),
  ];

  const profiles: Array<{ path: string; name: string; hints: string[] }> = [];
  for (const path of candidates) {
    const lower = path.toLowerCase();
    const content = readFileSafe(root, path);
    if (!content) continue;
    const looksLike =
      content.includes("BuildProfile:") ||
      (lower.includes("buildprofile") && (content.includes("m_BuildTarget:") || content.includes("m_Name:")));
    if (!looksLike) continue;

    const name =
      content.match(/m_Name:\s*([^\n]+)/)?.[1]?.trim() ??
      path.replace(/^.*\//, "").replace(/\.asset$/, "");
    const hints: string[] = [];
    if (content.includes("m_ScriptingDefines") || content.includes("scriptingDefines")) hints.push("has_scripting_defines");
    if (content.includes(".unity")) hints.push("may_embed_scene_list");
    if (content.includes("m_PlayerSettings") || content.includes("PlayerSettings")) hints.push("has_player_settings_override");
    profiles.push({ path, name, hints });
  }

  const seen = new Set<string>();
  const unique = profiles.filter((p) => (seen.has(p.path) ? false : (seen.add(p.path), true)));

  return {
    profiles: unique.slice(0, 50),
    count: unique.length,
    classic_editor_build_settings: existsSync(join(root, PROJECT_SETTINGS, "EditorBuildSettings.asset")),
    hints:
      unique.length === 0
        ? [
            "No BuildProfile assets found. Project may still use classic EditorBuildSettings only (pre–Unity 6 Build Profiles workflow).",
          ]
        : [],
  };
}

/** Physics modules + Unity Physics / Physics Core 2D package presence. */
export function getPhysicsStack(root: string) {
  const packages = packageHits(
    root,
    (n) =>
      n.includes("physics") ||
      n.includes("havok") ||
      n.includes("u2d.physics") ||
      n.includes("lowlevelphysics")
  );

  const modulesManifest = readJsonSafe<{ dependencies?: Record<string, string> }>(root, PACKAGES, "manifest.json");
  const deps = modulesManifest?.dependencies ?? {};
  const settings = getPhysicsSettings(root);
  const scripts = scanScripts(root, [
    { label: "Unity Physics / ECS physics", re: /Unity\.Physics|ICollisionEventsJob/i },
    { label: "Physics Core 2D / LowLevelPhysics2D", re: /Unity\.U2D\.Physics|LowLevelPhysics2D|PhysicsCore2D/i },
    { label: "Classic Rigidbody / Collider", re: /\bRigidbody\b|\bCollider\b|Physics\.Raycast/i },
  ]);

  return {
    packages,
    project_physics_settings: {
      dynamics_keys: Object.keys(settings.dynamics ?? {}).slice(0, 25),
      physics2d_keys: Object.keys(settings.physics2d ?? {}).slice(0, 25),
    },
    modules_hint: {
      physics3d_in_manifest: "com.unity.modules.physics" in deps,
      physics2d_in_manifest: "com.unity.modules.physics2d" in deps,
      note: "Built-in modules may be enabled without appearing in manifest; check Package Manager → Built-in for disables (Unity 6.4+ build-size tip).",
    },
    ...scripts,
  };
}

/** Adaptive Performance + Project Auditor packages and assets. */
export function getOptimizationPackageInventory(root: string) {
  const packages = packageHits(
    root,
    (n) =>
      n.includes("adaptiveperformance") ||
      n.includes("adaptive-performance") ||
      n.includes("project-auditor") ||
      n.includes("projectauditor")
  );

  const apSettings = listFilesRecursive(root, ASSETS, { ext: ".asset" })
    .filter((p) => {
      const lower = p.toLowerCase();
      if (!lower.includes("adaptive") && !lower.includes("auditor")) return false;
      const c = readFileSafe(root, p);
      return !!(c && (c.includes("AdaptivePerformance") || c.includes("ProjectAuditor") || c.includes("Scaler")));
    })
    .slice(0, 30);

  const scripts = scanScripts(root, [
    { label: "Adaptive Performance", re: /UnityEngine\.AdaptivePerformance|IAdaptivePerformance|AdaptivePerformanceManager/i },
    { label: "Project Auditor APIs", re: /Unity\.ProjectAuditor|ProjectAuditor/i },
  ]);

  return { packages, settings_or_assets: apSettings, ...scripts };
}

/** Unity Gaming Services / Cloud Code / Authentication / Economy / etc. */
export function getUgsCloudStack(root: string) {
  const packages = packageHits(
    root,
    (n) => n.startsWith("com.unity.services.") || n.includes("cloud-code") || n.includes("cloudcode")
  );

  const scripts = scanScripts(root, [
    { label: "Unity Services Core / Auth", re: /Unity\.Services\.Core|Unity\.Services\.Authentication|UnityServices\.InitializeAsync/i },
    { label: "Cloud Code", re: /Unity\.Services\.CloudCode|CloudCodeService/i },
    { label: "Economy / Remote Config / Friends", re: /Unity\.Services\.Economy|Unity\.Services\.RemoteConfig|Unity\.Services\.Friends/i },
    { label: "Cloud Save / Leaderboards", re: /Unity\.Services\.CloudSave|Unity\.Services\.Leaderboards/i },
  ]);

  const projectIdHints: string[] = [];
  const cloud = readFileSafe(root, PROJECT_SETTINGS, "UnityConnectSettings.asset");
  if (cloud) {
    const org = cloud.match(/m_OrganizationId:\s*([^\n]+)/)?.[1]?.trim();
    const pid = cloud.match(/m_ProjectId:\s*([^\n]+)/)?.[1]?.trim();
    if (org) projectIdHints.push(`organization:${org}`);
    if (pid) projectIdHints.push(`project:${pid}`);
  }

  return { packages, unity_connect_hints: projectIdHints, ...scripts };
}

/** Accessibility module / package + script usage. */
export function getAccessibilityStack(root: string) {
  const packages = packageHits(
    root,
    (n) => n.includes("accessibility") || n === "com.unity.modules.accessibility"
  );

  const scripts = scanScripts(root, [
    { label: "Accessibility APIs", re: /UnityEngine\.Accessibility|AccessibilityNode|AssistiveSupport|AccessibilityRole/i },
  ]);

  return { packages, ...scripts };
}

/** Cinemachine virtual cameras and related assets. */
export function listCinemachineAssets(root: string) {
  const packages = packageHits(root, (n) => n.includes("cinemachine"));
  const assets = listFilesRecursive(root, ASSETS, { ext: ".asset" })
    .filter((p) => {
      const lower = p.toLowerCase();
      if (lower.includes("cinemachine") || lower.includes("vcam") || lower.includes("virtualcamera")) return true;
      const c = readFileSafe(root, p);
      return !!(c && (c.includes("CinemachineCamera") || c.includes("CinemachineVirtualCamera") || c.includes("CinemachineBrain")));
    })
    .slice(0, 40);

  const prefabs = listFilesRecursive(root, ASSETS, { ext: ".prefab" })
    .filter((p) => {
      const c = readFileSafe(root, p);
      return !!(c && c.includes("Cinemachine"));
    })
    .slice(0, 30);

  return { packages, assets, prefabs_with_cinemachine: prefabs, count: assets.length + prefabs.length };
}

/** Platform / PlayerSettings hints for Web, Android, DirectStorage-era Windows, etc. */
export function getPlatformBuildHints(root: string) {
  const unityVersion = getUnityVersion(root);
  const buildTarget = getBuildTargetInfo(root);
  const ps = readFileSafe(root, PROJECT_SETTINGS, "ProjectSettings.asset") ?? "";
  const kv: Record<string, string> = {};

  const pick = (key: string, re: RegExp) => {
    const m = ps.match(re);
    if (m?.[1]) kv[key] = m[1].trim();
  };

  pick("activeInputHandler", /activeInputHandler:\s*(\d+)/);
  pick("androidMinSdkVersion", /AndroidMinSdkVersion:\s*(\d+)/);
  pick("androidTargetSdkVersion", /AndroidTargetSdkVersion:\s*(\d+)/);
  pick("webGLMemorySize", /webGLMemorySize:\s*(\d+)/);
  pick("webGLExceptionSupport", /webGLExceptionSupport:\s*(\d+)/);
  pick("webGLThreadsSupport", /webGLThreadsSupport:\s*(\d+)/);
  pick("runInBackground", /runInBackground:\s*(\d+)/);
  pick("fullscreenMode", /fullscreenMode:\s*(\d+)/);

  const backendBlock = ps.match(/scriptingBackend:[\s\S]{0,400}/);
  const packages = packageHits(
    root,
    (n) =>
      n.includes("webgl") ||
      n.includes("mobile") ||
      n.includes("android") ||
      n.includes("ios") ||
      n.includes("visionos") ||
      n.includes("dedicated-server")
  );

  const hints: string[] = [];
  if (kv.webGLThreadsSupport === "1") {
    hints.push("WebGL threads support enabled (Burst jobs on Web possible in Unity 6.4+).");
  }
  if (kv.androidMinSdkVersion && Number(kv.androidMinSdkVersion) > 0) {
    hints.push(`Android min SDK ${kv.androidMinSdkVersion} — confirm against Unity 6.x platform requirements.`);
  }

  return {
    unity_version: unityVersion,
    build_target: buildTarget,
    player_settings_snippets: kv,
    scripting_backend_snippet: backendBlock?.[0]?.slice(0, 300) ?? null,
    related_packages: packages,
    hints,
  };
}

/** Detect Built-in RP vs URP/HDRP for migration risk (BIRP deprecated in 6.5). */
export function getRenderPipelineMigrationHints(root: string) {
  const packages = getPackages(root).dependencies;
  const hasUrp = packages.some((p) => p.name.includes("render-pipelines.universal"));
  const hasHdrp = packages.some((p) => p.name.includes("render-pipelines.high-definition"));
  const hasCoreRp = packages.some((p) => p.name.includes("render-pipelines.core"));

  const graphics = getGraphicsSettings(root);
  const graphicsRaw = readFileSafe(root, PROJECT_SETTINGS, "GraphicsSettings.asset") ?? "";
  const customRp = graphicsRaw.match(/m_CustomRenderPipeline:\s*\{[^}]*guid:\s*([a-f0-9]{32})/i)?.[1];
  const hasCustomPipelineRef = !!customRp && customRp !== "00000000000000000000000000000000";

  let likely: "urp" | "hdrp" | "birp" | "mixed_or_unknown" = "mixed_or_unknown";
  if (hasHdrp && !hasUrp) likely = "hdrp";
  else if (hasUrp && !hasHdrp) likely = "urp";
  else if (hasUrp && hasHdrp) likely = "mixed_or_unknown";
  else if (!hasCustomPipelineRef && !hasCoreRp) likely = "birp";
  else if (hasCustomPipelineRef) likely = "mixed_or_unknown";

  const hints: string[] = [];
  if (likely === "birp") {
    hints.push(
      "Likely Built-in Render Pipeline. BIRP is deprecated in Unity 6.5 and will be obsolete after 6.7 LTS — plan URP/HDRP migration."
    );
  }
  if (hasUrp && hasHdrp) hints.push("Both URP and HDRP packages present — confirm intentional dual-pipeline setup.");

  const pipelineAssets = listFilesRecursive(root, ASSETS, { ext: ".asset" })
    .filter((p) => {
      const c = readFileSafe(root, p);
      return !!(
        c &&
        (c.includes("UniversalRenderPipelineAsset") ||
          c.includes("HDRenderPipelineAsset") ||
          c.includes("RenderPipelineAsset"))
      );
    })
    .slice(0, 20);

  return {
    likely_pipeline: likely,
    packages: packages
      .filter(
        (p) =>
          p.name.includes("render-pipelines") || p.name.includes("shadergraph") || p.name.includes("visualeffect")
      )
      .map((p) => ({ package: p.name, version: p.version })),
    custom_render_pipeline_guid: customRp ?? null,
    pipeline_assets: pipelineAssets,
    graphics_settings_sample_keys: Object.keys(graphics).slice(0, 20),
    hints,
  };
}

/** Localization package + tables. */
export function getLocalizationStack(root: string) {
  const packages = packageHits(root, (n) => n.includes("localization"));
  const tablesDir = join(ASSETS, "Localization");
  const tableFiles: string[] = [];
  const full = resolveUnderRoot(root, tablesDir);
  if (full) {
    try {
      for (const e of readdirSync(full)) {
        if (/\.(asset|csv|json)$/i.test(e)) tableFiles.push(join(tablesDir, e).split(/[/\\]/).join("/"));
      }
    } catch {
      /* */
    }
  }
  const localeAssets = listFilesRecursive(root, ASSETS, { ext: ".asset" })
    .filter((p) => {
      const lower = p.toLowerCase();
      if (lower.includes("locale") || lower.includes("localization") || lower.includes("stringtable")) return true;
      const c = readFileSafe(root, p);
      return !!(c && (c.includes("Locale:") || c.includes("StringTable") || c.includes("LocalizationSettings")));
    })
    .slice(0, 40);

  return { packages, tables_dir_files: tableFiles, locale_related_assets: localeAssets };
}
