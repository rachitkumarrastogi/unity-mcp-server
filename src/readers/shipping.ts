/**
 * Deep shipping audits: Addressables duplicates, shader variants, Input conflicts,
 * XR origin validation, Netcode RPC scan, NavMesh bake state, LOD/occlusion coverage,
 * texture import heaviness, audio loudness risk, timeline/usability balance.
 * Filesystem + manifest only (no Editor).
 */

import { listFilesRecursive, readFileSafe, readJsonSafe, resolveUnderRoot, ASSETS, PROJECT_SETTINGS } from "./helpers.js";
import { getSceneReferencedAssets } from "./assets.js";
import { getAllScenes } from "./scenes.js";
import { listScripts } from "./code.js";

export function getAddressablesDuplicates(root: string, includeProfiles = false): Record<string, unknown> {
  const groupFiles: string[] = [];
  for (const dir of [ASSETS, "Packages"]) {
    if (!resolveUnderRoot(root, dir)) continue;
    for (const p of listFilesRecursive(root, dir, { ext: ".asset" })) {
      const lower = p.toLowerCase();
      if (lower.includes("addressable") && (lower.includes("group") || p.endsWith("AddressableAssetSettings.asset"))) groupFiles.push(p);
    }
  }
  const addressToGroups = new Map<string, Set<string>>();
  const profileHints: Array<{ group: string; note: string }> = [];
  let scanned = 0;
  for (const g of groupFiles.slice(0, 60)) {
    const content = readFileSafe(root, g);
    if (!content || !content.includes("m_Address")) continue;
    scanned++;
    const guidRe = /m_GUID:\s*([a-f0-9]{32})|guid:\s*([a-f0-9]{32})/g;
    let m: RegExpExecArray | null;
    const guids = new Set<string>();
    while ((m = guidRe.exec(content)) !== null) {
      const guid = m[1] || m[2];
      if (guid) guids.add(guid);
    }
    for (const guid of guids) {
      if (!addressToGroups.has(guid)) addressToGroups.set(guid, new Set());
      addressToGroups.get(guid)!.add(g);
    }
    if (includeProfiles) {
      if (content.includes("m_Profile") || content.includes("BuildPath") || content.includes("LoadPath")) {
        profileHints.push({ group: g, note: "defines custom build/load paths — verify remote vs local catalog URLs" });
      }
    }
  }
  const duplicates = [...addressToGroups.entries()]
    .filter(([, v]) => v.size > 1)
    .map(([guid, groups]) => ({ guid, group_count: groups.size, groups: [...groups].slice(0, 5) }))
    .slice(0, 50);
  const hints: string[] = [];
  if (!scanned) hints.push("No Addressables group content parsed — confirm Addressables package installed and groups exist.");
  if (duplicates.length) hints.push(`${duplicates.length} asset GUIDs appear in multiple groups — duplicates inflate download + memory. Move to a single shared group.`);
  if (profileHints.length && includeProfiles) hints.push("Custom profile paths detected — verify CDN/remote catalog URLs and content-update cadence before shipping.");
  return { group_files_scanned: scanned, duplicate_guids: duplicates, duplicate_count: duplicates.length, profile_notes: profileHints.slice(0, 20), hints };
}

export function getShaderVariantRisk(root: string): Record<string, unknown> {
  const mats = listFilesRecursive(root, ASSETS, { ext: ".mat" });
  const shaderToMats = new Map<string, number>();
  const keywordCounts = new Map<string, number>();
  let multiCompileHits = 0;
  const shaderFiles = listFilesRecursive(root, ASSETS, { ext: ".shader" });
  const graphFiles = listFilesRecursive(root, ASSETS, { ext: ".shadergraph" });
  for (const sh of [...shaderFiles.slice(0, 200), ...graphFiles.slice(0, 200)]) {
    const c = readFileSafe(root, sh);
    if (!c) continue;
    multiCompileHits += (c.match(/#pragma\s+(multi_compile|shader_feature)/g) || []).length;
    const kw = c.match(/"(?:SHADER_API|KEYWORD|_+[A-Z0-9_]+)"/g);
    if (kw) for (const k of kw.slice(0, 20)) keywordCounts.set(k, (keywordCounts.get(k) ?? 0) + 1);
  }
  for (const m of mats.slice(0, 1000)) {
    const c = readFileSafe(root, m);
    const sh = c?.match(/m_Shader:\s*\{fileID:\s*\d+,\s*guid:\s*([a-f0-9]{32})/)?.[1];
    if (sh) shaderToMats.set(sh, (shaderToMats.get(sh) ?? 0) + 1);
  }
  const topShaders = [...shaderToMats.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([guid, count]) => ({ shader_guid: guid, material_count: count }));
  const hints: string[] = [];
  if (multiCompileHits > 50) hints.push(`${multiCompileHits} multi_compile/shader_feature pragmas — high variant count risk. Strip unused variants via shader stripping settings or per-platform keywords.`);
  else if (multiCompileHits > 0) hints.push(`${multiCompileHits} variant pragmas found — keep keyword sets tight; audit per-platform stripping.`);
  else hints.push("No multi_compile/shader_feature pragmas in scanned custom shaders — variant risk likely comes from SRP defaults; confirm stripping settings.");
  if (topShaders.length && topShaders[0].material_count > 50) hints.push(`Top shader GUID ${topShaders[0].shader_guid} used by ${topShaders[0].material_count} materials — keyword changes here explode build size.`);
  return {
    material_count: mats.length,
    custom_shader_count: shaderFiles.length,
    shadergraph_count: graphFiles.length,
    variant_pragma_hits: multiCompileHits,
    top_shaders_by_materials: topShaders,
    top_keywords: [...keywordCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15),
    hints,
  };
}

export function getInputConflicts(root: string): Record<string, unknown> {
  const assets = listFilesRecursive(root, ASSETS, { ext: ".inputactions" });
  const conflicts: Array<Record<string, unknown>> = [];
  const mapsSummary: Array<{ asset: string; maps: number; actions: number }> = [];
  for (const a of assets.slice(0, 20)) {
    const j = readJsonSafe<{ maps?: Array<{ name: string; actions?: Array<{ name: string; bindings?: Array<{ path?: string; action?: string }> }> }> }>(root, a);
    if (!j?.maps) continue;
    let actionCount = 0;
    const bindingToActions = new Map<string, string[]>();
    for (const map of j.maps) {
      for (const act of map.actions || []) {
        actionCount++;
        const label = `${map.name}/${act.name}`;
        for (const b of act.bindings || []) {
          if (!b.path) continue;
          const key = `${map.name}::${b.path.toLowerCase()}`;
          if (!bindingToActions.has(key)) bindingToActions.set(key, []);
          bindingToActions.get(key)!.push(label);
        }
      }
    }
    mapsSummary.push({ asset: a, maps: j.maps.length, actions: actionCount });
    for (const [binding, labels] of bindingToActions) {
      if (labels.length > 1) conflicts.push({ asset: a, binding: binding.split("::")[1], actions: labels.slice(0, 5) });
    }
  }
  const hints: string[] = [];
  if (!assets.length) hints.push("No .inputactions assets — project likely uses legacy InputManager; see get_input_axes.");
  if (conflicts.length) hints.push(`${conflicts.length} duplicate bindings inside the same action map — same key driving multiple actions causes ghost input. Split maps or add modifiers.`);
  return { input_action_assets: assets.length, maps_summary: mapsSummary, conflict_count: conflicts.length, conflicts: conflicts.slice(0, 40), hints };
}

export function getXrOriginValidation(root: string): Record<string, unknown> {
  const scenes = getAllScenes(root);
  const perScene: Array<{ scene: string; xr_rig: number; xr_origin: number; interaction_manager: number; teleport: number; camera: number }> = [];
  let totalRig = 0, totalOrigin = 0, totalIM = 0;
  let scanned = 0;
  for (const s of scenes) {
    const c = readFileSafe(root, s);
    if (!c) continue;
    scanned++;
    const rig = (c.match(/XRRig|XROrigin|XR Origin|CameraOffset/i) || []).length > 0;
    const origin = /XROrigin|XR Origin/i.test(c);
    const im = /InteractionManager|XRInteractionManager/i.test(c);
    const tp = /Teleport|LocomotionProvider|ContinuousMove/i.test(c);
    const cam = /Main Camera|Camera:/.test(c);
    if (rig || origin || im) {
      const row = { scene: s, xr_rig: rig ? 1 : 0, xr_origin: origin ? 1 : 0, interaction_manager: im ? 1 : 0, teleport: tp ? 1 : 0, camera: cam ? 1 : 0 };
      perScene.push(row);
      totalRig += row.xr_rig; totalOrigin += row.xr_origin; totalIM += row.interaction_manager;
    }
    if (perScene.length >= 40) break;
  }
  const hints: string[] = [];
  if (!perScene.length) hints.push("No XR rig/origin markers in scenes — XR is likely settings-only or absent. See get_xr_settings + unity-xr-vr-audit skill.");
  else {
    if (totalOrigin === 0) hints.push("XR content found but no XROrigin — tracking origin may be misconfigured (room-scale vs seated).");
    if (totalIM === 0) hints.push("XR content without InteractionManager — direct/grab interactors will not fire.");
    hints.push("Confirm single-pass instanced rendering + foveated rendering per platform; validate input bindings in the XR Interaction Toolkit sample scene.");
  }
  return { scenes_scanned: scanned, xr_scenes: perScene, totals: { with_rig_markers: totalRig, with_origin: totalOrigin, with_interaction_manager: totalIM }, hints };
}

export function scanNetcodeRpc(root: string, maxFiles = 400): Record<string, unknown> {
  const scripts = listScripts(root).slice(0, maxFiles);
  let serverRpc = 0, clientRpc = 0, networkVar = 0, unreliable = 0;
  const samples: Array<{ path: string; labels: string[] }> = [];
  const totals = { scanned: 0, rpc_scripts: 0 };
  for (const rel of scripts) {
    const c = readFileSafe(root, rel);
    if (!c) continue;
    totals.scanned++;
    const labels: string[] = [];
    if (/\bServerRpc\b/.test(c)) { serverRpc++; labels.push("ServerRpc"); }
    if (/\bClientRpc\b/.test(c)) { clientRpc++; labels.push("ClientRpc"); }
    if (/NetworkVariable|NetworkList|NetworkDictionary/.test(c)) { networkVar++; labels.push("NetworkVariable"); }
    if (/RpcSend\.(Unreliable|UnreliableFragmented)|RpcParams.*Unreliable|Delivery\.Unreliable/i.test(c)) { unreliable++; labels.push("Unreliable"); }
    if (labels.length) {
      totals.rpc_scripts++;
      if (samples.length < 25) samples.push({ path: rel, labels });
    }
  }
  const hints: string[] = [];
  if (!totals.rpc_scripts) hints.push("No ServerRpc/ClientRpc markers — multiplayer is config-only or uses another stack (Mirror/Photon). See get_multiplayer_stack.");
  else {
    hints.push(`${serverRpc} ServerRpc / ${clientRpc} ClientRpc markers across ${totals.rpc_scripts} scripts.`);
    if (unreliable === 0 && totals.rpc_scripts > 0) hints.push("No unreliable RPC markers — high-frequency state (movement) should use unreliable delivery; confirm NetworkTransform settings.");
    hints.push("Verify every RPC has RequireOwnership set intentionally; default ownership bugs are the #1 Netcode authority issue.");
  }
  return { server_rpc_markers: serverRpc, client_rpc_markers: clientRpc, network_variable_markers: networkVar, unreliable_markers: unreliable, ...totals, sample_scripts: samples, hints };
}

export function getNavMeshBakeState(root: string): Record<string, unknown> {
  const navSettings = readFileSafe(root, PROJECT_SETTINGS, "NavMeshAreas.asset") || readFileSafe(root, PROJECT_SETTINGS, "NavMeshProjectSettings.asset");
  const scenes = getAllScenes(root);
  const withNavMesh = scenes.filter((s) => {
    const c = readFileSafe(root, s);
    return !!c && /NavMesh|NavMeshSurface|NavMeshAgent|OffMeshLink/i.test(c);
  });
  const agentScripts = listScripts(root).filter((p) => /navmesh/i.test(p.toLowerCase())).slice(0, 20);
  const hints: string[] = [];
  if (!withNavMesh.length) hints.push("No NavMesh markers in scenes — navigation is unset or uses a custom/AI-navigation solution.");
  else hints.push(`${withNavMesh.length}/${scenes.length} scenes reference NavMesh — open each in Editor and confirm blue bake overlay exists; rebake after static-geometry changes.`);
  if (!navSettings) hints.push("No NavMeshAreas/ProjectSettings asset — agent radius/height/cost config is default or missing.");
  return {
    has_navmesh_settings: !!navSettings,
    navmesh_scenes: withNavMesh.slice(0, 40),
    navmesh_scene_count: withNavMesh.length,
    scene_count: scenes.length,
    navmesh_related_scripts: agentScripts,
    hints,
  };
}

export function getLodOcclusionCoverage(root: string): Record<string, unknown> {
  const scenes = getAllScenes(root);
  let lod = 0, lodGroup = 0, occlusion = 0, culling = 0, impostor = 0;
  const perScene: Array<{ scene: string; lod: number; occlusion: number }> = [];
  for (const s of scenes.slice(0, 60)) {
    const c = readFileSafe(root, s);
    if (!c) continue;
    const lodHits = (c.match(/LODGroup|LOD:/g) || []).length;
    const occHits = (c.match(/OcclusionCulling|OcclusionPortal|OcclusionArea/g) || []).length;
    if (lodHits) { lod++; lodGroup += lodHits; }
    if (occHits) { occlusion++; culling += occHits; }
    if (/impostor|Impostor/i.test(c)) impostor++;
    if (lodHits || occHits) perScene.push({ scene: s, lod: lodHits, occlusion: occHits });
  }
  const hints: string[] = [];
  if (!lod) hints.push("No LODGroup markers in scanned scenes — distant meshes render full-poly. Add LODs for hero/environment assets.");
  if (!occlusion) hints.push("No occlusion markers — consider Occlusion Culling bake for interior/urban scenes; overdraw is a silent mobile killer.");
  return { scenes_scanned: Math.min(scenes.length, 60), scenes_with_lod: lod, lod_markers: lodGroup, scenes_with_occlusion: occlusion, occlusion_markers: culling, impostor_markers: impostor, per_scene: perScene.slice(0, 30), hints };
}

export function getTextureImportHeaviness(root: string, topN = 20): Record<string, unknown> {
  const exts = [".png", ".jpg", ".jpeg", ".tga", ".psd", ".exr"];
  let all: string[] = [];
  for (const e of exts) all.push(...listFilesRecursive(root, ASSETS, { ext: e }));
  all = [...new Set(all)];
  const rows: Array<{ path: string; maxSize: number | null; sprite: boolean; readable: boolean; crunch: boolean }> = [];
  let noMip = 0;
  for (const p of all.slice(0, 1500)) {
    const meta = readFileSafe(root, p + ".meta");
    if (!meta) continue;
    const maxSize = parseInt(meta.match(/maxTextureSize:\s*(\d+)/)?.[1] || "", 10);
    const sprite = /spriteMode:\s*[1-9]/i.test(meta);
    const readable = /m_IsReadable:\s*1/.test(meta);
    const noMipmap = /m_EnableMipMap:\s*0|mipmaps?:\s*(false|0)/i.test(meta);
    if (noMipmap && !sprite) noMip++;
    const crunch = /m_TextureFormat:\s*\d+.*[Cc]runch|Crunch/i.test(meta) || /m_UseCrunchCompression:\s*1/.test(meta);
    const heavy = (!isNaN(maxSize) && maxSize >= 2048) || readable;
    if (heavy && rows.length < 400) rows.push({ path: p, maxSize: isNaN(maxSize) ? null : maxSize, sprite, readable, crunch });
  }
  rows.sort((a, b) => (b.maxSize ?? 0) - (a.maxSize ?? 0));
  const hints: string[] = [];
  if (rows.filter((r) => r.readable).length) hints.push(`${rows.filter((r) => r.readable).length} heavy textures are CPU-readable — disable Read/Write unless you sample pixels at runtime (doubles memory).`);
  if (noMip) hints.push(`${noMip} non-sprite textures with mipmaps disabled — causes shimmer/aliasing + slower sampling on mobile.`);
  if (!rows.length) hints.push("No heavyweight texture imports detected in scan window — spot-check hero textures for 2048+ caps.");
  return { textures_scanned: Math.min(all.length, 1500), heavy_count: rows.length, no_mipmap_non_sprite: noMip, heaviest: rows.slice(0, topN), hints };
}

export function getAudioLoudnessRisk(root: string): Record<string, unknown> {
  const exts = [".wav", ".mp3", ".ogg", ".aiff", ".aif"];
  let clips: string[] = [];
  for (const e of exts) clips.push(...listFilesRecursive(root, ASSETS, { ext: e }));
  clips = [...new Set(clips)];
  let vorbis = 0, pcm = 0, streaming = 0, compressedInMem = 0;
  const longCandidates: string[] = [];
  for (const p of clips.slice(0, 800)) {
    const meta = readFileSafe(root, p + ".meta");
    if (!meta) continue;
    if (/Vorbis|vorbis/i.test(meta)) vorbis++;
    if (/PCM|pcm/i.test(meta)) pcm++;
    if (/m_LoadType:\s*2|Streaming/i.test(meta)) streaming++;
    if (/m_LoadType:\s*1|CompressedInMemory/i.test(meta)) compressedInMem++;
    if (/music|bgm|ambient|soundtrack/i.test(p.toLowerCase())) longCandidates.push(p);
  }
  const hints: string[] = [];
  if (pcm > vorbis && clips.length > 10) hints.push(`PCM-heavy mix (${pcm} PCM vs ${vorbis} Vorbis) — music/ambience should be Vorbis/Streaming, short SFX can stay PCM/Decompress-on-load.`);
  if (longCandidates.length > streaming) hints.push(`${longCandidates.length} music-like clips vs ${streaming} streaming loads — long tracks should Stream from disk, not Decompress on load.`);
  if (!clips.length) hints.push("No audio clips found under Assets.");
  return { clip_count: clips.length, vorbis, pcm, streaming_loads: streaming, compressed_in_memory: compressedInMem, music_like_clips: longCandidates.slice(0, 30), hints };
}

export function getTimelineBalance(root: string): Record<string, unknown> {
  const playables = listFilesRecursive(root, ASSETS, { ext: ".playable" });
  const scenes = getAllScenes(root);
  let directorScenes = 0;
  const directorSceneList: string[] = [];
  for (const s of scenes.slice(0, 60)) {
    const c = readFileSafe(root, s);
    if (c && /PlayableDirector|TimelineAsset/i.test(c)) {
      directorScenes++;
      if (directorSceneList.length < 20) directorSceneList.push(s);
    }
  }
  const scripts = listScripts(root);
  let signalHits = 0, markerHits = 0;
  for (const rel of scripts.slice(0, 500)) {
    const c = readFileSafe(root, rel);
    if (!c) continue;
    if (/SignalReceiver|SignalEmitter|SignalAsset/i.test(c)) signalHits++;
    if (/IMarker|MarkerTrack|TimelineClip.*marker/i.test(c)) markerHits++;
  }
  const hints: string[] = [];
  if (playables.length && directorScenes === 0) hints.push(`${playables.length} Timeline assets but no PlayableDirector in scanned scenes — timelines may be unbound or instantiated at runtime; confirm bindings.`);
  if (directorScenes > 0 && signalHits === 0) hints.push("Directors present but no Signal handlers — gameplay sync (damage, VFX triggers) may be missing; prefer Signals over polling time.");
  return { playable_assets: playables.length, scenes_with_director: directorScenes, director_scenes: directorSceneList, scripts_with_signals: signalHits, scripts_with_markers: markerHits, hints };
}

export function getUnusedAssetsEstimate(root: string, topN = 30): Record<string, unknown> {
  const buildScenes = getAllScenes(root).filter((s) => {
    const c = readFileSafe(root, PROJECT_SETTINGS, "EditorBuildSettings.asset");
    return !!c && c.includes(s.replace(/^Assets\//, ""));
  });
  const referenced = new Set<string>();
  for (const s of buildScenes.slice(0, 40)) {
    const { resolved } = getSceneReferencedAssets(root, s);
    for (const r of resolved) referenced.add(r);
  }
  const exts = [".png", ".fbx", ".wav", ".mp3", ".mat", ".prefab", ".anim", ".controller", ".asset"];
  let all: string[] = [];
  for (const e of exts) all.push(...listFilesRecursive(root, ASSETS, { ext: e }));
  all = [...new Set(all)];
  const unused = all.filter((p) => !referenced.has(p)).slice(0, 500);
  const hints: string[] = [];
  if (!buildScenes.length) hints.push("No build-scene match — unused estimate is scene-reference-only; add EditorBuildSettings for accuracy.");
  else hints.push(`${unused.length} assets (capped sample) not referenced by build scenes — candidates for Addressables, Resources cleanup, or deletion review. Never auto-delete; confirm via find_references first.`);
  return { build_scene_count: buildScenes.length, referenced_count: referenced.size, scanned_asset_count: all.length, unused_sample: unused.slice(0, topN), unused_sample_count: Math.min(unused.length, topN), hints };
}
