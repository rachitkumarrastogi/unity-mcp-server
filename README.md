# Unity MCP Server

**MCP server for Unity** — A lightweight [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server that gives AI assistants structured access to your Unity projects. Use with Cursor, Claude Desktop, or any MCP client. No Unity Editor required.

---

## Overview

Point the server at any Unity project root via `UNITY_PROJECT_PATH`; one installation serves multiple projects. **Editor-free** · **MCP-native** · **Single Node.js server.**

---

## Tools

<div align="center">
<table>
<tr>
<td width="220" valign="top" style="border-right: 1px solid #e1e4e8; padding-right: 16px;">

### Categories

**[Project & build](#project--build)**  
**[Code & assemblies](#code--assemblies)**  
**[Scenes & prefabs](#scenes--prefabs)**  
**[Assets & references](#assets--references)**  
**[Materials & shaders](#materials--shaders)**  
**[Animation](#animation)**  
**[2D & sprites](#2d--sprites)**  
**[Rendering](#rendering)**  
**[TextMeshPro & UI](#textmeshpro--ui)**  
**[Input](#input)**  
**[Tags & layers](#tags--layers)**  
**[Addressables & localization](#addressables--localization)**  
**[Audio](#audio)**  
**[Testing & docs](#testing--docs)**  
**[CI & version control](#ci--version-control)**  
**[Integrations](#integrations)**

</td>
<td valign="top" style="padding-left: 16px;">

### Project & build
- `get_project_info` — Path, Unity version, build scene count, player/product name  
- `list_build_scenes` — Scenes in EditorBuildSettings (build order)  
- `get_player_settings` — Product name, company, bundle ID, version  
- `list_packages` — Packages from manifest.json  
- `get_quality_settings` — Quality levels  
- `get_scripting_defines` — Global and per-assembly defines  
- `get_physics_settings` — Physics / Physics2D settings  
- `get_project_version` — Bundle version  
- `get_changelog` — CHANGELOG contents  

### Code & assemblies
- `list_assemblies` — Assembly definitions with references, platforms  
- `list_scripts` — C# scripts (optional folder filter)  
- `find_scripts_by_content` — By type/pattern (e.g. MonoBehaviour)  
- `get_assembly_dependency_graph` — Nodes and edges  
- `list_editor_scripts` — Scripts in Editor folders  

### Scenes & prefabs
- `list_all_scenes` — All .unity files under Assets  
- `get_scene_summary` — Root GameObjects, component count  
- `list_prefabs` — Prefabs (optional path prefix)  
- `get_prefab_script_guids` — Script GUIDs used by a prefab  

### Assets & references
- `get_asset_folder_tree` — Folder tree under Assets  
- `list_assets_by_extension` — By extension (e.g. .png, .fbx)  
- `find_references` — Assets referencing a path or GUID  
- `list_large_assets` — Files over N MB (default 5)  

### Materials & shaders
- `list_materials` — Materials (optional folder)  
- `list_shaders` — .shader in Assets and Packages  
- `list_shader_graphs` — Shader Graph assets  
- `list_vfx_graphs` — VFX Graph assets  

### Animation
- `list_animator_controllers` — .controller assets  
- `list_animation_clips` — .anim assets  
- `get_animator_states` — State names from a controller  
- `list_timeline_playables` — Timeline .playable assets  

### 2D & sprites
- `list_sprite_atlases` — Sprite Atlas assets  
- `list_tilemap_assets` — Tilemap-related assets  

### Rendering
- `list_render_pipelines` — URP/HDRP pipeline assets, volume profiles  

### TextMeshPro & UI
- `list_tmp_fonts` — TMP/font assets  
- `get_tmp_settings_path` — TMP Settings asset path  
- `list_ui_documents` — .uxml and .uss (UI Toolkit)  

### Input
- `get_input_axes` — InputManager axes  
- `list_input_action_assets` — New Input System .inputactions  
- `get_input_actions_summary` — Action maps and actions from a file  

### Tags & layers
- `get_tags_and_layers` — Tags and layers from TagManager  

### Addressables & localization
- `get_addressables_info` — Groups and config path  
- `get_localization_tables` — Localization table files  

### Audio
- `list_audio_clips` — .wav, .mp3, .ogg, .aiff  
- `list_audio_mixers` — Audio Mixer assets  

### Testing & docs
- `list_test_assemblies` — Test assembly definitions  
- `get_repo_docs` — README, CONTRIBUTING, .cursorrules, etc.  
- `read_agent_docs` — .agents/AGENT.md, optional REPO_UNDERSTANDING.md  

### CI & version control
- `list_ci_configs` — .github/workflows, Jenkinsfile, unity-cloud-build  
- `list_presets` — .preset assets  
- `get_git_lfs_tracked` — LFS patterns from .gitattributes  
- `get_plastic_config` — Plastic SCM config  

### Integrations (config discovery only)
- `get_playfab_config` — Title ID, config paths  
- `list_figma_related_assets` — Figma folder / named assets  
- `get_firebase_config` — GoogleServices path, project ID  
- `get_steam_config` — steam_appid.txt, Steamworks path  
- `get_discord_config` — Discord SDK path  
- `get_fmod_config` — Banks path, bank files  
- `get_wwise_config` — Sound banks, project paths  
- `list_substance_assets` — .sbsar, .sbs  
- `list_speedtree_assets` — .spm, .stm  
- `list_lottie_assets` — Lottie JSON assets  
- `get_analytics_or_crash_config` — Sentry, Crashlytics, BugSnag, etc.  
- `get_ads_config` — Unity Ads, AdMob, ironSource presence  

</td>
</tr>
</table>
</div>

*All tools read from the project filesystem only; no Unity Editor is required.*

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

## Configuration (Cursor)

Add to your MCP settings:

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

Replace both paths with your actual paths. Other MCP clients: same pattern; set `UNITY_PROJECT_PATH` in the environment.

---

## Development

- **Run built:** `node dist/index.js`
- **Run dev:** `npm run dev` or `npx tsx src/index.ts`

---

## Security

No game code, assets, or secrets in this repo. The Unity project path is supplied at runtime by your MCP client. Safe for public or private use. Maintained anonymously.

---

## More

- [PURPOSE.md](./PURPOSE.md) — Why this server exists and when to use it  
- [MCP Registry](https://registry.modelcontextprotocol.io/) — Discover servers (this one is listed)  
- Search: **Unity MCP server**, **MCP Unity**, **Model Context Protocol Unity**
