#!/usr/bin/env node
/**
 * unity-mcp-server – Lightweight MCP server for any Unity project.
 * Exposes tools for project info, build scenes, agent docs, packages, code, assets, and more. No Unity Editor required.
 */

import { resolve } from "node:path";
import { z } from "zod";
import * as R from "./readers.js";

function getProjectRoot(): string {
  const env = process.env.UNITY_PROJECT_PATH;
  if (env) return resolve(env);
  console.error("UNITY_PROJECT_PATH is required. Set it in your MCP client config (e.g. Cursor) to your Unity project root.");
  process.exit(1);
  return "";
}

async function main() {
  const projectRoot = getProjectRoot();

  const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");
  const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");

  const server = new McpServer({
    name: "unity-mcp-server",
    version: "1.2.0",
  });

  const text = (s: string) => ({ content: [{ type: "text" as const, text: s }] });
  const json = (o: unknown) => text(JSON.stringify(o, null, 2));

  // --- Existing + expanded project info ---
  server.registerTool(
    "get_project_info",
    {
      description: "Get Unity project info: path, Unity version, build scene count, player/product name.",
      inputSchema: {},
    },
    async () => {
      const unityVersion = R.getUnityVersion(projectRoot);
      const scenes = R.getBuildScenes(projectRoot);
      const player = R.getPlayerSettings(projectRoot);
      const lines = [
        `Project root: ${projectRoot}`,
        `Unity version: ${unityVersion}`,
        `Build scenes: ${scenes.length}`,
        ...scenes.map((s) => `  ${s.index}: ${s.name} (${s.path})`),
        "",
        "Player / product (if available):",
        ...Object.entries(player).map(([k, v]) => `  ${k}: ${v}`),
      ];
      return text(lines.join("\n"));
    }
  );

  server.registerTool(
    "list_build_scenes",
    { description: "List scenes in EditorBuildSettings (build order) as JSON.", inputSchema: {} },
    async () => json(R.getBuildScenes(projectRoot))
  );

  server.registerTool(
    "read_agent_docs",
    {
      description: "Read .agents/AGENT.md and optionally REPO_UNDERSTANDING.md.",
      inputSchema: {
        include_repo_understanding: z.boolean().optional().describe("If true, also return REPO_UNDERSTANDING.md").default(false),
      },
    },
    async (args: unknown) => {
      const include = (args as { include_repo_understanding?: boolean })?.include_repo_understanding ?? false;
      let content = R.readFileSafe(projectRoot, ".agents", "AGENT.md") ?? "(No .agents/AGENT.md found)";
      if (include) {
        const rep = R.readFileSafe(projectRoot, "REPO_UNDERSTANDING.md");
        if (rep) content += "\n\n---\n\n# REPO_UNDERSTANDING.md\n\n" + rep;
      }
      return text(content);
    }
  );

  // --- 1. Project & package info ---
  server.registerTool(
    "get_player_settings",
    { description: "Get Player/ProjectSettings (product name, company, bundle ID, version, etc.).", inputSchema: {} },
    async () => json(R.getPlayerSettings(projectRoot))
  );

  server.registerTool(
    "list_packages",
    { description: "List Unity packages from Packages/manifest.json (and optional packages-lock.json).", inputSchema: {} },
    async () => json(R.getPackages(projectRoot))
  );

  server.registerTool(
    "get_quality_settings",
    { description: "Get QualitySettings (quality levels) from ProjectSettings.", inputSchema: {} },
    async () => json(R.getQualitySettings(projectRoot))
  );

  server.registerTool(
    "get_scripting_defines",
    { description: "Get global and per-assembly scripting define symbols.", inputSchema: {} },
    async () => json(R.getScriptingDefines(projectRoot))
  );

  // --- 2. Code & assemblies ---
  server.registerTool(
    "list_assemblies",
    {
      description: "List assembly definitions (.asmdef) with path, name, references, platforms.",
      inputSchema: {},
    },
    async () => json(R.getAssemblyDefinitions(projectRoot))
  );

  server.registerTool(
    "list_scripts",
    {
      description: "List all C# scripts under Assets. Optionally filter by folder prefix (e.g. Scripts).",
      inputSchema: {
        folder: z.string().optional().describe("Optional folder under Assets, e.g. Scripts/Runtime"),
      },
    },
    async (args: unknown) => json(R.listScripts(projectRoot, (args as { folder?: string })?.folder))
  );

  server.registerTool(
    "find_scripts_by_content",
    {
      description: "Find C# scripts that contain a type or pattern (e.g. MonoBehaviour, ScriptableObject, or custom). Optionally filter by namespace.",
      inputSchema: {
        pattern: z.string().describe("Pattern to search for, e.g. MonoBehaviour or a type name"),
        namespace_filter: z.string().optional().describe("Optional namespace pattern, e.g. Game.*"),
      },
    },
    async (args: unknown) => {
      const a = args as { pattern: string; namespace_filter?: string };
      return json(R.findScriptsByContent(projectRoot, a.pattern, a.namespace_filter));
    }
  );

  // --- 3. Scenes ---
  server.registerTool(
    "list_all_scenes",
    { description: "List all .unity scene files under Assets (not only build-indexed).", inputSchema: {} },
    async () => json(R.getAllScenes(projectRoot))
  );

  server.registerTool(
    "get_scene_summary",
    {
      description: "Get a short summary of a scene: root GameObject names and approximate component count.",
      inputSchema: { scene_path: z.string().describe("Path relative to project, e.g. Assets/Scenes/Main.unity") },
    },
    async (args: unknown) => json(R.getSceneSummary(projectRoot, (args as { scene_path: string }).scene_path))
  );

  // --- 4. Prefabs ---
  server.registerTool(
    "list_prefabs",
    {
      description: "List all .prefab files. Optionally filter by path prefix under Assets.",
      inputSchema: { path_prefix: z.string().optional().describe("e.g. Prefabs/Characters") },
    },
    async (args: unknown) => json(R.getPrefabs(projectRoot, (args as { path_prefix?: string })?.path_prefix))
  );

  // --- 5. Assets & references ---
  server.registerTool(
    "find_references",
    {
      description: "Find all assets (scenes, prefabs, materials, etc.) that reference the given asset. Pass asset path (e.g. Assets/Texture.png) or GUID.",
      inputSchema: {
        asset_path_or_guid: z.string().describe("Asset path relative to project (e.g. Assets/My.asset) or 32-char GUID"),
      },
    },
    async (args: unknown) => {
      const input = (args as { asset_path_or_guid: string }).asset_path_or_guid.trim();
      let guid: string;
      if (/^[a-f0-9]{32}$/i.test(input)) {
        guid = input;
      } else {
        guid = R.getGuidFromMeta(projectRoot, input) ?? "";
        if (!guid) return text(`No .meta found for ${input}; cannot resolve GUID.`);
      }
      const refs = R.findReferencesToGuid(projectRoot, guid);
      return json({ guid, references: refs });
    }
  );

  server.registerTool(
    "get_asset_folder_tree",
    {
      description: "Get a tree of Assets folder (directories and file names). Useful for understanding project layout.",
      inputSchema: { max_depth: z.number().optional().describe("Max folder depth, default 4").default(4) },
    },
    async (args: unknown) => json(R.getAssetFolderTree(projectRoot, (args as { max_depth?: number })?.max_depth ?? 4))
  );

  server.registerTool(
    "list_assets_by_extension",
    {
      description: "List assets by file extension (e.g. .png, .fbx, .mp3). Optionally under a folder.",
      inputSchema: {
        extension: z.string().describe("e.g. .png, .fbx, .mp3"),
        folder: z.string().optional().describe("Optional folder under Assets"),
      },
    },
    async (args: unknown) => {
      const a = args as { extension: string; folder?: string };
      const ext = a.extension.startsWith(".") ? a.extension : `.${a.extension}`;
      return json(R.listAssetsByExtension(projectRoot, ext, a.folder));
    }
  );

  // --- 6. Materials & shaders ---
  server.registerTool(
    "list_materials",
    {
      description: "List .mat materials; optionally under a folder. Includes shader GUID when readable.",
      inputSchema: { folder: z.string().optional() },
    },
    async (args: unknown) => json(R.getMaterials(projectRoot, (args as { folder?: string })?.folder))
  );

  server.registerTool(
    "list_shaders",
    { description: "List all .shader files in Assets and Packages.", inputSchema: {} },
    async () => json(R.getShaders(projectRoot))
  );

  // --- 7. Animation ---
  server.registerTool(
    "list_animator_controllers",
    { description: "List all Animator Controller (.controller) assets.", inputSchema: {} },
    async () => json(R.getAnimatorControllers(projectRoot))
  );

  server.registerTool(
    "list_animation_clips",
    { description: "List all Animation Clip (.anim) assets.", inputSchema: {} },
    async () => json(R.getAnimationClips(projectRoot))
  );

  server.registerTool(
    "get_animator_states",
    {
      description: "Get state names from an Animator Controller (.controller) file.",
      inputSchema: { controller_path: z.string().describe("e.g. Assets/Animations/Player.controller") },
    },
    async (args: unknown) => json(R.getAnimatorStates(projectRoot, (args as { controller_path: string }).controller_path))
  );

  // --- 8. Audio ---
  server.registerTool(
    "list_audio_clips",
    { description: "List audio clip files (.wav, .mp3, .ogg, .aiff) under Assets.", inputSchema: {} },
    async () => json(R.getAudioClips(projectRoot))
  );

  server.registerTool(
    "list_audio_mixers",
    { description: "List Audio Mixer (.mixer) assets.", inputSchema: {} },
    async () => json(R.getAudioMixers(projectRoot))
  );

  // --- 9. Addressables ---
  server.registerTool(
    "get_addressables_info",
    { description: "Get Addressables groups and config path if the project uses Addressables.", inputSchema: {} },
    async () => json(R.getAddressablesInfo(projectRoot))
  );

  // --- 10. Localization ---
  server.registerTool(
    "get_localization_tables",
    { description: "List localization table files under Assets/Localization if present.", inputSchema: {} },
    async () => json(R.getLocalizationTables(projectRoot))
  );

  // --- 11. Input ---
  server.registerTool(
    "get_input_axes",
    { description: "Get input axes from InputManager (name, descriptive name, positive button).", inputSchema: {} },
    async () => json(R.getInputAxes(projectRoot))
  );

  // --- 12. Tags & layers ---
  server.registerTool(
    "get_tags_and_layers",
    { description: "Get Tags and Layers from TagManager.", inputSchema: {} },
    async () => json(R.getTagsAndLayers(projectRoot))
  );

  // --- 13. Testing ---
  server.registerTool(
    "list_test_assemblies",
    { description: "List assembly definitions that look like test assemblies (path contains test/editor).", inputSchema: {} },
    async () => json(R.getTestAssemblies(projectRoot))
  );

  // --- 14. Docs & conventions ---
  server.registerTool(
    "get_repo_docs",
    {
      description: "Read README, CONTRIBUTING, .cursorrules, CODING_STANDARDS, STYLE if present at project root.",
      inputSchema: {},
    },
    async () => json(R.getRepoDocs(projectRoot))
  );

  // --- 15. CI / versioning ---
  server.registerTool(
    "get_project_version",
    { description: "Get project/bundle version from PlayerSettings.", inputSchema: {} },
    async () => text(R.getProjectVersion(projectRoot))
  );

  server.registerTool(
    "get_changelog",
    { description: "Read CHANGELOG.md or CHANGELOG if present.", inputSchema: {} },
    async () => {
      const content = R.getChangelog(projectRoot);
      return text(content ?? "(No CHANGELOG found)");
    }
  );

  // --- 16. Physics ---
  server.registerTool("get_physics_settings", { description: "Get Physics/DynamicsManager or Physics2D settings (key-value).", inputSchema: {} }, async () => json(R.getPhysicsSettings(projectRoot)));

  // --- 17. Render pipelines ---
  server.registerTool("list_render_pipelines", { description: "List render pipeline assets and volume profiles (URP/HDRP).", inputSchema: {} }, async () => json(R.listRenderPipelines(projectRoot)));

  // --- 18. Timeline ---
  server.registerTool("list_timeline_playables", { description: "List Timeline .playable assets.", inputSchema: {} }, async () => json(R.listTimelinePlayables(projectRoot)));

  // --- 19. Sprites / 2D ---
  server.registerTool("list_sprite_atlases", { description: "List Sprite Atlas (.spriteatlas) assets.", inputSchema: {} }, async () => json(R.listSpriteAtlases(projectRoot)));
  server.registerTool("list_tilemap_assets", { description: "List tilemap-related .asset files.", inputSchema: {} }, async () => json(R.listTilemapAssets(projectRoot)));

  // --- 20. Shader Graph / VFX ---
  server.registerTool("list_shader_graphs", { description: "List Shader Graph (.shadergraph) assets.", inputSchema: {} }, async () => json(R.listShaderGraphs(projectRoot)));
  server.registerTool("list_vfx_graphs", { description: "List VFX Graph (.vfx) assets.", inputSchema: {} }, async () => json(R.listVfxGraphs(projectRoot)));

  // --- 21. TextMeshPro ---
  server.registerTool("list_tmp_fonts", { description: "List TMP/font-related assets.", inputSchema: {} }, async () => json(R.listTmpFonts(projectRoot)));
  server.registerTool("get_tmp_settings_path", { description: "Get path to TMP Settings asset if present.", inputSchema: {} }, async () => json(R.getTmpSettingsPath(projectRoot)));

  // --- 22. UI Toolkit ---
  server.registerTool("list_ui_documents", { description: "List UI Toolkit .uxml and .uss files.", inputSchema: {} }, async () => json(R.listUiDocuments(projectRoot)));

  // --- 23. New Input System ---
  server.registerTool("list_input_action_assets", { description: "List New Input System .inputactions assets.", inputSchema: {} }, async () => json(R.listInputActionAssets(projectRoot)));
  server.registerTool(
    "get_input_actions_summary",
    { description: "Get action maps and actions from an .inputactions file.", inputSchema: { path: z.string().describe("e.g. Assets/Input/Player.inputactions") } },
    async (args: unknown) => json(R.getInputActionsSummary(projectRoot, (args as { path: string }).path))
  );

  // --- 24. Presets ---
  server.registerTool("list_presets", { description: "List .preset assets.", inputSchema: {} }, async () => json(R.listPresets(projectRoot)));

  // --- 25. Editor scripts ---
  server.registerTool("list_editor_scripts", { description: "List C# scripts in Editor folders or with Editor in path.", inputSchema: {} }, async () => json(R.listEditorScripts(projectRoot)));

  // --- 26. Prefab script refs ---
  server.registerTool(
    "get_prefab_script_guids",
    { description: "Get script GUIDs (MonoBehaviour) referenced by a prefab.", inputSchema: { prefab_path: z.string().describe("e.g. Assets/Prefabs/Player.prefab") } },
    async (args: unknown) => json(R.getPrefabScriptGuids(projectRoot, (args as { prefab_path: string }).prefab_path))
  );

  // --- 27. Assembly dependency graph ---
  server.registerTool("get_assembly_dependency_graph", { description: "Get assembly definition dependency graph (nodes and edges).", inputSchema: {} }, async () => json(R.getAssemblyDependencyGraph(projectRoot)));

  // --- 28. CI configs ---
  server.registerTool("list_ci_configs", { description: "List CI config files (.github/workflows, Jenkinsfile, unity-cloud-build).", inputSchema: {} }, async () => json(R.listCiConfigs(projectRoot)));

  // --- 29. Large assets ---
  server.registerTool(
    "list_large_assets",
    { description: "List assets over a size threshold (default 5 MB).", inputSchema: { min_size_mb: z.number().optional().default(5) } },
    async (args: unknown) => json(R.listLargeAssets(projectRoot, (args as { min_size_mb?: number })?.min_size_mb ?? 5))
  );

  // --- 30. PlayFab ---
  server.registerTool("get_playfab_config", { description: "Get PlayFab config (title ID, config paths) from project. No secrets.", inputSchema: {} }, async () => json(R.getPlayFabConfig(projectRoot)));

  // --- 31. Figma ---
  server.registerTool("list_figma_related_assets", { description: "List assets in Figma folder or with figma in path.", inputSchema: {} }, async () => json(R.listFigmaRelatedAssets(projectRoot)));

  // --- 32. Firebase ---
  server.registerTool("get_firebase_config", { description: "Get Firebase config (GoogleServices path, project ID). No secrets.", inputSchema: {} }, async () => json(R.getFirebaseConfig(projectRoot)));

  // --- 33. Steam ---
  server.registerTool("get_steam_config", { description: "Get Steam config (steam_appid.txt, Steamworks path).", inputSchema: {} }, async () => json(R.getSteamConfig(projectRoot)));

  // --- 34. Discord ---
  server.registerTool("get_discord_config", { description: "Detect Discord SDK path in Plugins.", inputSchema: {} }, async () => json(R.getDiscordConfig(projectRoot)));

  // --- 35. FMOD ---
  server.registerTool("get_fmod_config", { description: "Get FMOD config (banks path, bank files).", inputSchema: {} }, async () => json(R.getFmodConfig(projectRoot)));

  // --- 36. Wwise ---
  server.registerTool("get_wwise_config", { description: "Get Wwise config (sound banks, project paths).", inputSchema: {} }, async () => json(R.getWwiseConfig(projectRoot)));

  // --- 37. Substance ---
  server.registerTool("list_substance_assets", { description: "List Substance .sbsar and .sbs assets.", inputSchema: {} }, async () => json(R.listSubstanceAssets(projectRoot)));

  // --- 38. SpeedTree ---
  server.registerTool("list_speedtree_assets", { description: "List SpeedTree .spm and .stm assets.", inputSchema: {} }, async () => json(R.listSpeedTreeAssets(projectRoot)));

  // --- 39. Lottie ---
  server.registerTool("list_lottie_assets", { description: "List Lottie-related JSON assets.", inputSchema: {} }, async () => json(R.listLottieAssets(projectRoot)));

  // --- 40. Analytics / crash ---
  server.registerTool("get_analytics_or_crash_config", { description: "Detect analytics/crash reporting services (Unity, Sentry, Crashlytics, BugSnag).", inputSchema: {} }, async () => json(R.getAnalyticsOrCrashConfig(projectRoot)));

  // --- 41. Ads ---
  server.registerTool("get_ads_config", { description: "Detect ad SDK presence (Unity Ads, AdMob, ironSource).", inputSchema: {} }, async () => json(R.getAdsConfig(projectRoot)));

  // --- 42. Git LFS ---
  server.registerTool("get_git_lfs_tracked", { description: "Get Git LFS patterns from .gitattributes.", inputSchema: {} }, async () => json(R.getGitLfsTracked(projectRoot)));

  // --- 43. Plastic SCM ---
  server.registerTool("get_plastic_config", { description: "Get Plastic SCM config (.plastic, workspace name).", inputSchema: {} }, async () => json(R.getPlasticConfig(projectRoot)));

  // --- 44–49. Unity 6 / Feb 2026 audit additions ---
  server.registerTool("get_graphics_settings", { description: "Get Graphics settings (ProjectSettings/GraphicsSettings.asset).", inputSchema: {} }, async () => json(R.getGraphicsSettings(projectRoot)));
  server.registerTool("get_time_settings", { description: "Get Time/Fixed timestep settings (TimeManager.asset).", inputSchema: {} }, async () => json(R.getTimeSettings(projectRoot)));
  server.registerTool("list_subscenes", { description: "List ECS/DOTS .subscene assets.", inputSchema: {} }, async () => json(R.listSubscenes(projectRoot)));
  server.registerTool("list_visual_scripting_assets", { description: "List Visual Scripting (Bolt/Unity) .asset files in Ludiq or com.unity.visualscripting.", inputSchema: {} }, async () => json(R.listVisualScriptingAssets(projectRoot)));
  server.registerTool("get_build_target_info", { description: "Get active build target / platform from ProjectSettings.", inputSchema: {} }, async () => json(R.getBuildTargetInfo(projectRoot)));
  server.registerTool("get_feature_set_inference", { description: "Infer which Unity 6 feature sets (2D, ECS, AR, etc.) are used from package manifest.", inputSchema: {} }, async () => json(R.getFeatureSetInference(projectRoot)));

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
