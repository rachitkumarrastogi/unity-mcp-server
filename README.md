# Unity MCP Server

**MCP server for Unity** — Gives AI assistants structured access to your Unity project from any MCP-capable IDE or app. No Unity Editor required.

[![npm version](https://img.shields.io/npm/v/unity-mcp-server.svg)](https://www.npmjs.com/package/unity-mcp-server) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-View_this_server-6e7681?style=flat-square&labelColor=24292f)](https://registry.modelcontextprotocol.io/?q=unity-mcp-server)

<p align="center">
  <img src="assets/unity-mcp-server-diagram.png" alt="Cursor / IDE → Unity MCP Server → Unity Project" width="720">
</p>

Your IDE talks to this server; the server reads your Unity project folder and answers with project info, build scenes, scripts, prefabs, and more — so the AI can help without opening the Editor.

---

## Overview

- **Editor-free** — Reads only from the project filesystem.
- **One server, many projects** — Set `UNITY_PROJECT_PATH` per project in your MCP config.
- **MCP-native** — Works with any client that supports the [Model Context Protocol](https://modelcontextprotocol.io/) (tools over stdio).

---

## Supported IDEs and clients

This server uses the standard **MCP protocol over stdio** and exposes **tools**. Any IDE or app that can run an MCP server and pass environment variables will work. Commonly used clients include:

| Client | Notes |
|--------|--------|
| **Cursor** | Add server to MCP settings; set `UNITY_PROJECT_PATH` in `env`. |
| **Claude Desktop** | Add to `claude_desktop_config.json`; same command + env pattern. |
| **Claude Code** | MCP support including tools. |
| **VS Code** | Use an MCP extension (e.g. GenAI / Copilot MCP); configure server and `UNITY_PROJECT_PATH`. |
| **Windsurf** | Add MCP server with command and env. |
| **Continue** | Configure MCP server in Continue settings. |
| **Cline** | MCP tools and resources. |
| **Other** | Any client that supports MCP tools over stdio (e.g. Zed, Roo Code, LibreChat, custom agents). |

Configuration is the same everywhere: **command** = `node`, **args** = path to `dist/index.js`, **env** = `UNITY_PROJECT_PATH` = your Unity project root. See [Configuration](#configuration-cursor) below for a Cursor example; other clients use the same structure in their own config format.

---

## Tools

Expand a category below to see the tools it includes.

| | | | |
|:--|:--|:--|:--|
| [📦 Project & build](#project-build) | [💻 Code & assemblies](#code-assemblies) | [🎬 Scenes & prefabs](#scenes-prefabs) | [📁 Assets & references](#assets-references) |
| [🎨 Materials & shaders](#materials-shaders) | [🎞️ Animation](#animation) | [🖼️ 2D & sprites](#2d-sprites) | [✨ Rendering](#rendering) |
| [📝 TextMeshPro & UI](#textmeshpro-ui) | [🎮 Input](#input) | [🏷️ Tags & layers](#tags-layers) | [🌐 Addressables & localization](#addressables-localization) |
| [🔊 Audio](#audio) | [🧪 Testing & docs](#testing-docs) | [🔄 CI & version control](#ci-version-control) | [🔌 Integrations](#integrations) |
| [⚡ Speed & productivity](#speed) | | | |

---

<details open id="project-build">
<summary><strong>📦 Project & build</strong></summary>

| Tool | Description |
|------|-------------|
| `get_project_info` | Path, Unity version, build scene count, player/product name |
| `list_build_scenes` | Scenes in EditorBuildSettings (build order) |
| `get_player_settings` | Product name, company, bundle ID, version |
| `list_packages` | Packages from manifest.json |
| `get_quality_settings` | Quality levels |
| `get_scripting_defines` | Global and per-assembly defines |
| `get_physics_settings` | Physics / Physics2D settings |
| `get_graphics_settings` | Graphics settings (GraphicsSettings.asset) |
| `get_time_settings` | Time / fixed timestep (TimeManager.asset) |
| `get_build_target_info` | Active build target / platform |
| `get_feature_set_inference` | Infer Unity 6 feature sets from packages (2D, ECS, AR, etc.) |
| `get_project_version` | Bundle version |
| `get_changelog` | CHANGELOG contents |
| `get_audio_settings` | AudioManager.asset (global volume, reverb, DSP buffer) |
| `get_navigation_settings` | NavMesh/agent settings from ProjectSettings |
| `get_xr_settings` | XR/VR project settings |
| `get_script_execution_order` | Script execution order (MonoManager) |
| `get_version_control_settings` | Serialization mode, visible meta files |
| `get_layer_collision_matrix` | Layer collision matrix and layer names |
| `get_cloud_services_config` | Unity Cloud / Unity Connect config |
| `get_package_dependency_graph` | Package dependency graph (manifest + lock) |
| `list_package_samples` | Samples folders under Packages |

</details>

<details id="code-assemblies">
<summary><strong>💻 Code & assemblies</strong></summary>

| Tool | Description |
|------|-------------|
| `list_assemblies` | Assembly definitions with references, platforms |
| `get_assembly_for_path` | Assembly that contains a given script or folder path |
| `list_scripts` | C# scripts (optional folder filter) |
| `find_scripts_by_content` | By type/pattern (e.g. MonoBehaviour) |
| `get_assembly_dependency_graph` | Nodes and edges |
| `list_editor_scripts` | Scripts in Editor folders |
| `list_visual_scripting_assets` | Bolt / Unity Visual Scripting .asset files |

</details>

<details id="scenes-prefabs">
<summary><strong>🎬 Scenes & prefabs</strong></summary>

| Tool | Description |
|------|-------------|
| `list_all_scenes` | All .unity files under Assets |
| `get_scene_summary` | Root GameObjects, component count |
| `get_scene_components_by_type` | GameObjects in a scene with a component type (e.g. Camera, Light) |
| `get_scene_objects_by_tag` | GameObjects in a scene with a given tag (e.g. Spawn) |
| `get_all_components_by_type` | All Cameras/Lights/etc. across all scenes |
| `list_prefabs` | Prefabs (optional path prefix) |
| `list_prefab_variants` | Prefabs that are variants of another prefab |
| `list_prefabs_with_component` | Prefabs that contain a component type (e.g. Animator) |
| `get_prefab_script_guids` | Script GUIDs used by a prefab |
| `list_subscenes` | ECS/DOTS .subscene assets |

</details>

<details id="assets-references">
<summary><strong>📁 Assets & references</strong></summary>

| Tool | Description |
|------|-------------|
| `get_asset_folder_tree` | Folder tree under Assets |
| `list_assets_by_extension` | By extension (e.g. .png, .fbx) |
| `find_references` | Assets referencing a path or GUID |
| `list_large_assets` | Files over N MB (default 5) |
| `list_video_clips` | Video clip assets (.mp4, .mov, .webm, etc.) |
| `list_legacy_font_assets` | Legacy fonts (.fontsettings, .ttf, .otf) — not TMP |
| `list_render_textures` | RenderTexture assets |
| `list_terrain_data` | TerrainData and TerrainLayer assets |
| `list_lighting_settings_assets` | Lighting-related .asset files |
| `search_assets_by_name` | Search Assets (and optionally Packages) by name pattern |
| `get_texture_meta` | Texture .meta (maxSize, dimensions, spriteMode, PPU) |

</details>

<details id="materials-shaders">
<summary><strong>🎨 Materials & shaders</strong></summary>

| Tool | Description |
|------|-------------|
| `list_materials` | Materials (optional folder) |
| `list_shaders` | .shader in Assets and Packages |
| `list_shader_graphs` | Shader Graph assets |
| `list_vfx_graphs` | VFX Graph assets |

</details>

<details id="animation">
<summary><strong>🎞️ Animation</strong></summary>

| Tool | Description |
|------|-------------|
| `list_animator_controllers` | .controller assets |
| `list_animation_clips` | .anim assets |
| `get_animator_states` | State names from a controller |
| `list_timeline_playables` | Timeline .playable assets |
| `list_avatar_masks` | Avatar Mask (.mask) assets |
| `list_animator_override_controllers` | AnimatorOverrideController assets |

</details>

<details id="2d-sprites">
<summary><strong>🖼️ 2D & sprites</strong></summary>

| Tool | Description |
|------|-------------|
| `list_sprite_atlases` | Sprite Atlas assets |
| `list_tilemap_assets` | Tilemap-related assets |
| `list_sprite_assets` | Textures configured as sprites (spriteMode in .meta) |

</details>

<details id="rendering">
<summary><strong>✨ Rendering</strong></summary>

| Tool | Description |
|------|-------------|
| `list_render_pipelines` | URP/HDRP pipeline assets, volume profiles |

</details>

<details id="textmeshpro-ui">
<summary><strong>📝 TextMeshPro & UI</strong></summary>

| Tool | Description |
|------|-------------|
| `list_tmp_fonts` | TMP/font assets |
| `get_tmp_settings_path` | TMP Settings asset path |
| `list_ui_documents` | .uxml and .uss (UI Toolkit) |

</details>

<details id="input">
<summary><strong>🎮 Input</strong></summary>

| Tool | Description |
|------|-------------|
| `get_input_axes` | InputManager axes |
| `list_input_action_assets` | New Input System .inputactions |
| `get_input_actions_summary` | Action maps and actions from a file |

</details>

<details id="tags-layers">
<summary><strong>🏷️ Tags & layers</strong></summary>

| Tool | Description |
|------|-------------|
| `get_tags_and_layers` | Tags and layers from TagManager |

</details>

<details id="addressables-localization">
<summary><strong>🌐 Addressables & localization</strong></summary>

| Tool | Description |
|------|-------------|
| `get_addressables_info` | Groups and config path |
| `get_localization_tables` | Localization table files |

</details>

<details id="audio">
<summary><strong>🔊 Audio</strong></summary>

| Tool | Description |
|------|-------------|
| `list_audio_clips` | .wav, .mp3, .ogg, .aiff |
| `list_audio_mixers` | Audio Mixer assets |

</details>

<details id="testing-docs">
<summary><strong>🧪 Testing & docs</strong></summary>

| Tool | Description |
|------|-------------|
| `list_test_assemblies` | Test assembly definitions |
| `get_repo_docs` | README, CONTRIBUTING, .cursorrules, etc. |
| `read_agent_docs` | .agents/AGENT.md, optional REPO_UNDERSTANDING.md |

</details>

<details id="ci-version-control">
<summary><strong>🔄 CI & version control</strong></summary>

| Tool | Description |
|------|-------------|
| `list_ci_configs` | .github/workflows, Jenkinsfile, unity-cloud-build |
| `list_presets` | .preset assets |
| `get_git_lfs_tracked` | LFS patterns from .gitattributes |
| `get_plastic_config` | Plastic SCM config |

</details>

<details id="integrations">
<summary><strong>🔌 Integrations</strong> (config discovery only)</summary>

| Tool | Description |
|------|-------------|
| `get_playfab_config` | Title ID, config paths |
| `list_figma_related_assets` | Figma folder / named assets |
| `get_firebase_config` | GoogleServices path, project ID |
| `get_steam_config` | steam_appid.txt, Steamworks path |
| `get_discord_config` | Discord SDK path |
| `get_fmod_config` | Banks path, bank files |
| `get_wwise_config` | Sound banks, project paths |
| `list_substance_assets` | .sbsar, .sbs |
| `list_speedtree_assets` | .spm, .stm |
| `list_lottie_assets` | Lottie JSON assets |
| `get_analytics_or_crash_config` | Sentry, Crashlytics, BugSnag, etc. |
| `get_ads_config` | Unity Ads, AdMob, ironSource presence |

</details>

<details id="speed">
<summary><strong>⚡ Speed & productivity</strong></summary>

| Tool | Description |
|------|-------------|
| `get_project_stats` | One-shot stats: scripts, prefabs, scenes, materials, animations, assemblies, packages |
| `get_scene_referenced_assets` | Asset paths referenced by a scene (build size / impact) |
| `detect_assembly_cycles` | Circular refs in assembly definitions (fix compile errors) |
| `find_script_references` | C# files that reference a type/class name (refactoring) |
| `get_broken_script_refs` | Prefabs/scenes with missing script refs |
| `get_prefab_dependencies` | Asset paths referenced by a prefab (impact analysis) |
| `get_release_readiness` | One-shot: version, build scenes, packages, broken refs, cycles, large assets |

</details>

*All tools read from the project filesystem only.*

---

## Prerequisites

- **Node.js** 18+
- **UNITY_PROJECT_PATH** — Absolute path to your Unity project root (set in your MCP client)

---

## Installation

```bash
git clone https://github.com/rachitkumarrastogi/unity-mcp-server.git
cd unity-mcp-server
npm install
npm run build
```

The server uses **stdio**; your MCP client starts it automatically.

---

## Configuration

Example for **Cursor** (same idea for Claude Desktop, VS Code + MCP, Windsurf, etc.):

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

Replace the paths with your actual paths. For **Claude Desktop**, add an entry under `mcpServers` in `claude_desktop_config.json` with the same `command`, `args`, and `env`. For **VS Code**, use your MCP extension’s config to add the server and `UNITY_PROJECT_PATH`. Other clients follow the same pattern in their own config files.

---

## Development

- **Run built:** `node dist/index.js`
- **Run dev:** `npm run dev` or `npx tsx src/index.ts`

---

## Integration with Unity Editor

- **Current workflow:** The AI runs inside your IDE (Cursor, VS Code with MCP, Claude Desktop, Windsurf, or another MCP-capable client). This server provides the AI with read-only access to your project (scenes, scripts, settings, and related assets). You run Unity Editor separately to open scenes, enter Play mode, and build. The AI uses the server to inspect the project and to suggest changes, answer questions, and assist with refactoring.

- **Future compatibility:** This server implements the standard MCP protocol over stdio and requires a single environment variable (`UNITY_PROJECT_PATH`). If Unity Editor gains built-in MCP client support, you could connect it to this server using the same configuration: command `node`, arguments pointing to `dist/index.js`, and `UNITY_PROJECT_PATH` set in the environment. No changes to this codebase would be required.

---

## Security

This repository does not include game code, assets, or secrets. The Unity project path is supplied at runtime by your MCP client. The server is suitable for public and private use.

---

## Documentation

- [**MCP Registry**](https://registry.modelcontextprotocol.io/?q=unity-mcp-server) — Discover and install this server from the official registry.
- **Guides:** [Purpose and use cases](./docs/guides/PURPOSE.md) · [Publish to npm and MCP Registry](./docs/guides/PUBLISH.md) · [How it helps Unity developers](./docs/guides/HOW_IT_HELPS_UNITY_DEVELOPERS.md)
- **Reference:** [Registry details](./docs/reference/REGISTRY.md) · [Comparison and rating](./docs/reference/COMPARISON_AND_RATING.md) · [Audits and gap analysis](./docs/reference/README.md)
- **Release notes:** [All versions](./docs/release-notes/README.md)
