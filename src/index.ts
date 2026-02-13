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
    version: "1.0.0",
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

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
