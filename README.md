# Unity MCP Server

**MCP server for Unity** — A lightweight [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server that gives AI assistants structured access to your Unity projects. Use with Cursor, Claude Desktop, or any MCP client. Query project metadata, build settings, and agent documentation from any MCP-capable client—without running the Unity Editor.

---

## Overview

Unity MCP Server runs as a separate process and reads your Unity project from disk. Point it at any project root via `UNITY_PROJECT_PATH`; one installation can serve multiple projects by changing the environment variable in your client config.

**Key points:**

- **Editor-free** — Uses only the project filesystem. No Unity process or Editor dependency.
- **Single binary** — One Node.js server for all your Unity projects.
- **MCP-native** — Built on the official MCP SDK; works with Cursor, Claude Desktop, Windsurf, and other MCP clients.

---

## Tools (by category)

**Project & build** — `get_project_info`, `list_build_scenes`, `get_player_settings`, `list_packages`, `get_quality_settings`, `get_scripting_defines`, `get_physics_settings`, `get_project_version`, `get_changelog`

**Code & assemblies** — `list_assemblies`, `list_scripts`, `find_scripts_by_content`, `get_assembly_dependency_graph`, `list_editor_scripts`

**Scenes & prefabs** — `list_all_scenes`, `get_scene_summary`, `list_prefabs`, `get_prefab_script_guids`

**Assets & references** — `get_asset_folder_tree`, `list_assets_by_extension`, `find_references`, `list_large_assets`

**Materials & shaders** — `list_materials`, `list_shaders`, `list_shader_graphs`, `list_vfx_graphs`

**Animation** — `list_animator_controllers`, `list_animation_clips`, `get_animator_states`, `list_timeline_playables`

**2D & sprites** — `list_sprite_atlases`, `list_tilemap_assets`

**Rendering** — `list_render_pipelines` (URP/HDRP, volume profiles)

**TextMeshPro & UI** — `list_tmp_fonts`, `get_tmp_settings_path`, `list_ui_documents` (UXML, USS)

**Input** — `get_input_axes`, `list_input_action_assets`, `get_input_actions_summary`

**Tags & layers** — `get_tags_and_layers`

**Addressables & localization** — `get_addressables_info`, `get_localization_tables`

**Audio** — `list_audio_clips`, `list_audio_mixers`

**Testing & docs** — `list_test_assemblies`, `get_repo_docs`, `read_agent_docs`

**CI & version control** — `list_ci_configs`, `list_presets`, `get_git_lfs_tracked`, `get_plastic_config`

**Integrations (config discovery)** — `get_playfab_config`, `list_figma_related_assets`, `get_firebase_config`, `get_steam_config`, `get_discord_config`, `get_fmod_config`, `get_wwise_config`, `list_substance_assets`, `list_speedtree_assets`, `list_lottie_assets`, `get_analytics_or_crash_config`, `get_ads_config`

All tools read from the project filesystem only; no Unity Editor is required.

---

## Prerequisites

- **Node.js** 18 or later
- **UNITY_PROJECT_PATH** — Absolute path to your Unity project root (set in your MCP client configuration)

---

## Installation

```bash
git clone https://github.com/YOUR_USERNAME/unity-mcp-server.git
cd unity-mcp-server
npm install
npm run build
```

The server is invoked via **stdio**. Your MCP client starts it; you do not run it manually in production.

---

## Configuration

### Cursor

Add the following to your MCP settings (project or user):

```json
{
  "mcpServers": {
    "unity": {
      "command": "node",
      "args": ["/absolute/path/to/unity-mcp-server/dist/index.js"],
      "env": {
        "UNITY_PROJECT_PATH": "/absolute/path/to/YourUnityProject"
      }
    }
  }
}
```

Replace:

1. `/absolute/path/to/unity-mcp-server/dist/index.js` with the path to this repository’s built entry point.
2. `/absolute/path/to/YourUnityProject` with the absolute path to your Unity project root.

### Other MCP clients

Use the same pattern: run `node` with `dist/index.js` as the argument and set `UNITY_PROJECT_PATH` in the environment. Refer to your client’s documentation for where to configure MCP servers.

---

## Development

- **Production:** `node dist/index.js` (after `npm run build`)
- **Development:** `npm run dev` or `npx tsx src/index.ts`

---

## Security and public use

This repository contains only generic tooling: no game code, assets, API keys, or secrets. The Unity project path is provided at runtime by your MCP client and is not stored in this repo. Safe to use in public or private contexts. The project is maintained anonymously; no author attribution is required.

---

## Further reading

See [PURPOSE.md](./PURPOSE.md) for the rationale behind this server and when it is useful for your workflow.

---

## Discoverability

Search for **Unity MCP server**, **MCP Unity**, or **Model Context Protocol Unity** to find this repo. You can also browse the [MCP Registry](https://registry.modelcontextprotocol.io/) for published servers (this server may be listed there once submitted).
