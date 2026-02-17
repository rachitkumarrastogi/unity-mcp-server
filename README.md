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
| [⚡ Speed & productivity](#speed) | [🔍 Meta](#meta) | | |

---

<details open id="project-build">
<summary><strong>📦 Project & build</strong></summary>

| Tool | Description | Example prompt to type |
|------|-------------|-------------------------|
| `get_project_info` | Path, Unity version, build scene count, player/product name | *"What's my project path and Unity version?"* · *"Show build scene count and player name"* |
| `list_build_scenes` | Scenes in EditorBuildSettings (build order) | *"Which scenes are in the build?"* · *"List build scenes in order"* |
| `get_player_settings` | Product name, company, bundle ID, version | *"What are the player settings?"* · *"Show bundle ID and company name"* |
| `list_packages` | Packages from manifest.json | *"List installed Unity packages"* |
| `get_quality_settings` | Quality levels | *"What are the quality settings?"* |
| `get_scripting_defines` | Global and per-assembly defines | *"Show scripting defines"* · *"What defines are set per assembly?"* |
| `get_physics_settings` | Physics / Physics2D settings | *"What are the physics settings?"* |
| `get_graphics_settings` | Graphics settings (GraphicsSettings.asset) | *"Show graphics settings"* |
| `get_time_settings` | Time / fixed timestep (TimeManager.asset) | *"What's the fixed timestep?"* · *"Show time settings"* |
| `get_build_target_info` | Active build target / platform | *"What's the current build target?"* |
| `get_feature_set_inference` | Infer Unity 6 feature sets from packages (2D, ECS, AR, etc.) | *"What feature sets does this project use?"* |
| `get_project_version` | Bundle version | *"What's the bundle version?"* |
| `get_changelog` | CHANGELOG contents | *"Show the changelog"* |
| `get_audio_settings` | AudioManager.asset (global volume, reverb, DSP buffer) | *"What are the audio settings?"* |
| `get_navigation_settings` | NavMesh/agent settings from ProjectSettings | *"Show NavMesh / navigation settings"* |
| `get_xr_settings` | XR/VR project settings | *"What XR or VR settings are configured?"* |
| `get_script_execution_order` | Script execution order (MonoManager) | *"Show script execution order"* |
| `get_version_control_settings` | Serialization mode, visible meta files | *"What's the version control / serialization setup?"* |
| `get_layer_collision_matrix` | Layer collision matrix and layer names | *"Show layer collision matrix"* · *"What layers collide?"* |
| `get_cloud_services_config` | Unity Cloud / Unity Connect config | *"Is Unity Cloud configured?"* |
| `get_package_dependency_graph` | Package dependency graph (manifest + lock) | *"Show package dependency graph"* |
| `list_package_samples` | Samples folders under Packages | *"List package samples"* |
| `list_unity_hub_projects` | List Unity projects from Unity Hub (no project path required) | *"List my Unity Hub projects"* |

</details>

<details id="code-assemblies">
<summary><strong>💻 Code & assemblies</strong></summary>

| Tool | Description | Example prompt to type |
|------|-------------|-------------------------|
| `list_assemblies` | Assembly definitions with references, platforms | *"List assembly definitions"* |
| `get_assembly_for_path` | Assembly that contains a given script or folder path | *"Which assembly contains Assets/Scripts/Player.cs?"* |
| `list_scripts` | C# scripts (optional folder filter) | *"List all C# scripts"* · *"Show scripts in Assets/Scripts"* |
| `find_scripts_by_content` | By type/pattern (e.g. MonoBehaviour) | *"Find scripts that extend MonoBehaviour"* |
| `get_assembly_dependency_graph` | Nodes and edges | *"Show assembly dependency graph"* |
| `list_editor_scripts` | Scripts in Editor folders | *"List editor scripts"* |
| `list_visual_scripting_assets` | Bolt / Unity Visual Scripting .asset files | *"List Visual Scripting assets"* |
| `get_script_public_api` | Parse C# script: class name, base type, public methods/fields | *"What's the public API of PlayerController.cs?"* |

</details>

<details id="scenes-prefabs">
<summary><strong>🎬 Scenes & prefabs</strong></summary>

| Tool | Description | Example prompt to type |
|------|-------------|-------------------------|
| `list_all_scenes` | All .unity files under Assets | *"List all scenes"* |
| `get_scene_summary` | Root GameObjects, component count | *"Summarize MainMenu.unity"* · *"What's in this scene?"* |
| `get_scene_components_by_type` | GameObjects in a scene with a component type (e.g. Camera, Light) | *"Which GameObjects have a Camera in Game.unity?"* |
| `get_scene_objects_by_tag` | GameObjects in a scene with a given tag (e.g. Spawn) | *"Find objects with tag Spawn in this scene"* |
| `get_all_components_by_type` | All Cameras/Lights/etc. across all scenes | *"List all Cameras in the project"* |
| `list_prefabs` | Prefabs (optional path prefix) | *"List all prefabs"* · *"List prefabs in Assets/Prefabs"* |
| `list_prefab_variants` | Prefabs that are variants of another prefab | *"List prefab variants"* |
| `list_prefabs_with_component` | Prefabs that contain a component type (e.g. Animator) | *"Which prefabs have an Animator?"* |
| `get_prefab_script_guids` | Script GUIDs used by a prefab | *"What scripts does Hero.prefab use?"* |
| `list_subscenes` | ECS/DOTS .subscene assets | *"List subscenes"* |

</details>

<details id="assets-references">
<summary><strong>📁 Assets & references</strong></summary>

| Tool | Description | Example prompt to type |
|------|-------------|-------------------------|
| `get_asset_folder_tree` | Folder tree under Assets | *"Show asset folder tree"* |
| `list_assets_by_extension` | By extension (e.g. .png, .fbx) | *"List all .png textures"* · *"List FBX models"* |
| `find_references` | Assets referencing a path or GUID | *"What references this asset?"* · *"Find what uses Assets/Textures/hero.png"* |
| `list_large_assets` | Files over N MB (default 5) | *"List large assets"* · *"What's over 10 MB?"* |
| `list_video_clips` | Video clip assets (.mp4, .mov, .webm, etc.) | *"List video clips"* |
| `list_legacy_font_assets` | Legacy fonts (.fontsettings, .ttf, .otf) — not TMP | *"List legacy fonts"* |
| `list_render_textures` | RenderTexture assets | *"List render textures"* |
| `list_terrain_data` | TerrainData and TerrainLayer assets | *"List terrain data"* |
| `list_lighting_settings_assets` | Lighting-related .asset files | *"List lighting settings assets"* |
| `search_assets_by_name` | Search Assets (and optionally Packages) by name pattern | *"Search assets named 'hero'"* |
| `get_texture_meta` | Texture .meta (maxSize, dimensions, spriteMode, PPU) | *"What's the import settings for hero.png?"* |
| `search_project` | Combined search: name pattern, script pattern, and/or referrers of path | *"Search project for X"* · *"What references this path?"* |
| `get_meta_for_asset` | Read .meta for any asset path (guid, importer keys) | *"Show .meta for Assets/Models/character.fbx"* |
| `get_broken_asset_refs` | Prefabs/scenes/materials with any missing GUID reference | *"Find broken asset references"* |

</details>

<details id="materials-shaders">
<summary><strong>🎨 Materials & shaders</strong></summary>

| Tool | Description | Example prompt to type |
|------|-------------|-------------------------|
| `list_materials` | Materials (optional folder) | *"List all materials"* · *"List materials in Assets/Materials"* |
| `list_shaders` | .shader in Assets and Packages | *"List shaders"* |
| `list_shader_graphs` | Shader Graph assets | *"List Shader Graph assets"* |
| `list_vfx_graphs` | VFX Graph assets | *"List VFX Graph assets"* |

</details>

<details id="animation">
<summary><strong>🎞️ Animation</strong></summary>

| Tool | Description | Example prompt to type |
|------|-------------|-------------------------|
| `list_animator_controllers` | .controller assets | *"List animator controllers"* |
| `list_animation_clips` | .anim assets | *"List animation clips"* |
| `get_animator_states` | State names from a controller | *"What states are in Player.controller?"* |
| `list_timeline_playables` | Timeline .playable assets | *"List Timeline playables"* |
| `list_avatar_masks` | Avatar Mask (.mask) assets | *"List avatar masks"* |
| `list_animator_override_controllers` | AnimatorOverrideController assets | *"List animator override controllers"* |

</details>

<details id="2d-sprites">
<summary><strong>🖼️ 2D & sprites</strong></summary>

| Tool | Description | Example prompt to type |
|------|-------------|-------------------------|
| `list_sprite_atlases` | Sprite Atlas assets | *"List sprite atlases"* |
| `list_tilemap_assets` | Tilemap-related assets | *"List tilemap assets"* |
| `list_sprite_assets` | Textures configured as sprites (spriteMode in .meta) | *"List sprite assets"* |

</details>

<details id="rendering">
<summary><strong>✨ Rendering</strong></summary>

| Tool | Description | Example prompt to type |
|------|-------------|-------------------------|
| `list_render_pipelines` | URP/HDRP pipeline assets, volume profiles | *"List render pipelines"* · *"What URP/HDRP assets are there?"* |

</details>

<details id="textmeshpro-ui">
<summary><strong>📝 TextMeshPro & UI</strong></summary>

| Tool | Description | Example prompt to type |
|------|-------------|-------------------------|
| `list_tmp_fonts` | TMP/font assets | *"List TextMeshPro fonts"* |
| `get_tmp_settings_path` | TMP Settings asset path | *"Where is TMP Settings?"* |
| `list_ui_documents` | .uxml and .uss (UI Toolkit) | *"List UI Toolkit documents"* · *"List UXML and USS files"* |

</details>

<details id="input">
<summary><strong>🎮 Input</strong></summary>

| Tool | Description | Example prompt to type |
|------|-------------|-------------------------|
| `get_input_axes` | InputManager axes | *"What's in the Input Manager?"* · *"Show input axes"* |
| `list_input_action_assets` | New Input System .inputactions | *"List Input System action assets"* |
| `get_input_actions_summary` | Action maps and actions from a file | *"Summarize Player.inputactions"* |

</details>

<details id="tags-layers">
<summary><strong>🏷️ Tags & layers</strong></summary>

| Tool | Description | Example prompt to type |
|------|-------------|-------------------------|
| `get_tags_and_layers` | Tags and layers from TagManager | *"Show tags and layers"* |

</details>

<details id="addressables-localization">
<summary><strong>🌐 Addressables & localization</strong></summary>

| Tool | Description | Example prompt to type |
|------|-------------|-------------------------|
| `get_addressables_info` | Groups and config path | *"What Addressables groups are there?"* |
| `get_localization_tables` | Localization table files | *"List localization tables"* |

</details>

<details id="audio">
<summary><strong>🔊 Audio</strong></summary>

| Tool | Description | Example prompt to type |
|------|-------------|-------------------------|
| `list_audio_clips` | .wav, .mp3, .ogg, .aiff | *"List audio clips"* |
| `list_audio_mixers` | Audio Mixer assets | *"List audio mixers"* |

</details>

<details id="testing-docs">
<summary><strong>🧪 Testing & docs</strong></summary>

| Tool | Description | Example prompt to type |
|------|-------------|-------------------------|
| `list_test_assemblies` | Test assembly definitions | *"List test assemblies"* |
| `get_repo_docs` | README, CONTRIBUTING, .cursorrules, etc. | *"Show repo docs"* · *"What's in the README?"* |
| `read_agent_docs` | .agents/AGENT.md, optional REPO_UNDERSTANDING.md | *"Read agent docs"* · *"Show AGENT.md"* |

</details>

<details id="ci-version-control">
<summary><strong>🔄 CI & version control</strong></summary>

| Tool | Description | Example prompt to type |
|------|-------------|-------------------------|
| `list_ci_configs` | .github/workflows, Jenkinsfile, unity-cloud-build | *"List CI configs"* · *"Show GitHub workflows"* |
| `list_presets` | .preset assets | *"List presets"* |
| `get_git_lfs_tracked` | LFS patterns from .gitattributes | *"What does Git LFS track?"* |
| `get_plastic_config` | Plastic SCM config | *"Show Plastic SCM config"* |

</details>

<details id="integrations">
<summary><strong>🔌 Integrations</strong> (config discovery only)</summary>

| Tool | Description | Example prompt to type |
|------|-------------|-------------------------|
| `get_playfab_config` | Title ID, config paths | *"Is PlayFab configured?"* |
| `list_figma_related_assets` | Figma folder / named assets | *"List Figma-related assets"* |
| `get_firebase_config` | GoogleServices path, project ID | *"Show Firebase config"* |
| `get_steam_config` | steam_appid.txt, Steamworks path | *"Is Steam configured?"* |
| `get_discord_config` | Discord SDK path | *"Show Discord config"* |
| `get_fmod_config` | Banks path, bank files | *"Show FMOD config"* |
| `get_wwise_config` | Sound banks, project paths | *"Show Wwise config"* |
| `list_substance_assets` | .sbsar, .sbs | *"List Substance assets"* |
| `list_speedtree_assets` | .spm, .stm | *"List SpeedTree assets"* |
| `list_lottie_assets` | Lottie JSON assets | *"List Lottie assets"* |
| `get_analytics_or_crash_config` | Sentry, Crashlytics, BugSnag, etc. | *"What analytics or crash reporting is set up?"* |
| `get_ads_config` | Unity Ads, AdMob, ironSource presence | *"Is ads SDK configured?"* |

</details>

<details id="speed">
<summary><strong>⚡ Speed & productivity</strong></summary>

| Tool | Description | Example prompt to type |
|------|-------------|-------------------------|
| `get_project_stats` | One-shot stats: scripts, prefabs, scenes, materials, animations, assemblies, packages | *"Give me project stats"* · *"How many prefabs and scenes?"* |
| `get_scene_referenced_assets` | Asset paths referenced by a scene (build size / impact) | *"What assets does Main.unity reference?"* |
| `detect_assembly_cycles` | Circular refs in assembly definitions (fix compile errors) | *"Detect assembly cycles"* · *"Any circular assembly refs?"* |
| `find_script_references` | C# files that reference a type/class name (refactoring) | *"Find references to PlayerController"* |
| `get_broken_script_refs` | Prefabs/scenes with missing script refs | *"Find prefabs with missing script"* |
| `get_prefab_dependencies` | Asset paths referenced by a prefab (impact analysis) | *"What does Hero.prefab depend on?"* |
| `get_release_readiness` | One-shot: version, build scenes, packages, broken refs, cycles, large assets | *"Is the project release ready?"* · *"Run release readiness check"* |

</details>

<details id="meta">
<summary><strong>🔍 Meta</strong></summary>

| Tool | Description | Example prompt to type |
|------|-------------|-------------------------|
| `search_tools` | Find relevant tools by intent (e.g. find references, missing script). Omit query to list all tools by category. | *"What Unity tools do you have?"* · *"Find tools for references"* · *"List all tools by category"* |

**Using `search_tools`** — Pass an optional `query` to filter tools by name, description, or category. Omit `query` to get the full catalog grouped by category.

| Intent | Example query | Tools you get (conceptually) |
|--------|----------------|------------------------------|
| Find what references an asset | `find references` | `find_references`, `search_project`, … |
| Fix missing script on prefabs | `missing script` | `get_broken_script_refs`, … |
| Work with textures | `texture` | `get_texture_meta`, `list_assets_by_extension`, … |
| List or inspect prefabs | `prefab` | `list_prefabs`, `list_prefabs_with_component`, `get_prefab_dependencies`, … |
| Scenes and build order | `scene` or `build` | `list_all_scenes`, `list_build_scenes`, `get_scene_summary`, … |
| C# scripts and APIs | `script` or `assembly` | `list_scripts`, `get_script_public_api`, `find_scripts_by_content`, … |
| Animation | `animation` or `animator` | `list_animator_controllers`, `list_animation_clips`, … |
| List everything (no filter) | *(omit query)* | All tools, grouped by category |

</details>

*All tools read from the project filesystem only.*

---

## What to type in Claude / Cursor or any other MCP Client

In Claude, Cursor, or any MCP client, ask in **natural language**; the AI picks the right tool. Use the **Example prompt to type** column in each tools table above — those are the phrases to type in chat to get that result.

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
