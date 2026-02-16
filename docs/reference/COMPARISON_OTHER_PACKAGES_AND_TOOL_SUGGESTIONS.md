# Comparison with Other Unity MCP Packages & Tool Suggestions

This document compares **unity-mcp-server** with two other npm packages, explains what queries we support, and what Unity developers commonly search for. **Suggested tools below are implemented.** Future doc changes should update this file (and other existing docs) rather than adding new MD files, to avoid bloat.

---

## 1. Do We Support Queries Like These Packages?

### [unity-mcp](https://www.npmjs.com/package/unity-mcp) (Artmann, ~28 weekly downloads)

| Their feature | Our support | Notes |
|---------------|-------------|--------|
| **List all Unity projects** | ✅ Yes | We have `list_unity_hub_projects` (reads Unity Hub’s projects list). We also support a single project via `UNITY_PROJECT_PATH`. |
| **Get detailed project information** | ✅ Yes | We have `get_project_info`, `get_player_settings`, `get_project_stats`, `get_release_readiness`, `list_build_scenes`, `list_packages`, etc. |
| **Access project structure and files** | ✅ Yes | `get_asset_folder_tree`, `list_assets_by_extension`, `get_asset_folder_tree`, `list_scripts`, etc. |

**Summary:** We support “detailed project info,” “project structure and files,” and “list all Unity projects” via `list_unity_hub_projects`.

---

### [@nurture-tech/unity-mcp-runner](https://www.npmjs.com/package/@nurture-tech/unity-mcp-runner) (Union, ~24 weekly downloads)

Union runs **inside the Unity Editor** (C# MCP SDK, Node runner). It supports write operations, Editor state, and vision. We are **read-only and filesystem-only** (no Editor).

| Their tool / area | Our support | Notes |
|-------------------|-------------|--------|
| **Assets** | | |
| `get_asset_contents` | ⚠️ Partial | We don’t “get full contents” of binary assets. We have `find_references`, `get_texture_meta`, and can read .meta; we could add a generic “read .meta for any asset.” |
| `copy_asset` / `import_asset` | ❌ No | We are read-only; no copy/import. |
| `get_asset_importer` | ⚠️ Partial | We have `get_texture_meta` and `get_meta_for_asset` (any asset .meta). |
| **Scenes** | | |
| `open_scene` / `close_scene` / `save_scene` | ❌ No | Editor-only; we don’t control the Editor. |
| `get_game_object` (by hierarchy path) | ❌ No | Requires a loaded scene in Unity; we only parse .unity files (e.g. `get_scene_summary`, `get_scene_components_by_type`). |
| **Prefabs** | | |
| `open_prefab` | ❌ No | Editor-only. |
| **Scripting** | | |
| `create_script` / `execute_code` | ❌ No | Write/execute; we don’t run Unity. |
| `get_type_info` (Unity reflection) | ⚠️ Partial | We have `get_script_public_api`: parse C# for class name, base type, public methods/fields (no Unity). |
| **Search** | | |
| `search` (assets + hierarchy) | ⚠️ Partial | We have `search_project` (name + script content + referrers of path). We cannot search **hierarchy** without the Editor. |
| **Editor state / Vision** | | |
| `get_state` / `get_selection` / `focus_game_object` / `screenshot` | ❌ No | Editor and vision; we have no Editor connection. |

**Summary:** We support **read-only** analogues for project/asset/script/prefab **inspection** and **search over the filesystem**. We do **not** support Editor-only features (open/save scene, play mode, screenshot, create_script, execute_code, get_game_object by path).

---

## 2. What Unity Developers Mostly Search For (and How We Cover It)

From pain-point reports and common workflows:

| What developers search for | Our tools | Covered? |
|----------------------------|-----------|----------|
| **Find all references to an asset** | `find_references` (path or GUID) | ✅ |
| **Missing script / broken script refs** | `get_broken_script_refs` | ✅ |
| **Assembly circular refs** | `detect_assembly_cycles` | ✅ |
| **Which assembly is this script in?** | `get_assembly_for_path` | ✅ |
| **Prefabs with a given component** | `list_prefabs_with_component` | ✅ |
| **What’s in the build?** | `list_build_scenes`, `get_scene_referenced_assets` | ✅ |
| **Release readiness / “can we ship?”** | `get_release_readiness` | ✅ |
| **Large assets / bundle size** | `list_large_assets`, `get_prefab_dependencies`, `get_scene_referenced_assets` | ✅ |
| **Search by name** | `search_assets_by_name` | ✅ |
| **Texture size / PPU** | `get_texture_meta` | ✅ |
| **Script execution order** | `get_script_execution_order` | ✅ |
| **Efficiency / tooling** (pain point) | 101 read-only tools, no Editor required, CI-friendly | ✅ Design fit |

We already cover the main “find references,” “missing script,” “assembly,” and “release readiness” queries that Unity developers use.

---

## 3. Implemented Additions

The following are now implemented:

| Tool | Purpose |
|------|---------|
| **`list_unity_hub_projects`** | List projects from Unity Hub’s projects-v1.json (macOS/Windows/Linux paths). |
| **`search_project`** | Combined search: name pattern, script content pattern, and/or referrers of path (assets + scripts + referrers). |
| **`get_meta_for_asset`** | Read .meta for any asset path (GUID, importer keys). |
| **`get_script_public_api`** | Parse C# for class name, base type, public methods/fields (no Unity). |
| **`get_broken_asset_refs`** | Prefabs/scenes/materials with any missing GUID (not only script refs). |
| **`search_tools`** | Meta-tool: find relevant tools by intent (e.g. “find references”, “missing script”). Omit query to list all tools by category. Helps the AI pick the right tool. |

---

## 4. Summary

- **unity-mcp:** We support “detailed project info” and “project structure/files” for one project; we do **not** support “list all Unity projects” unless we add `list_unity_hub_projects`.
- **@nurture-tech/unity-mcp-runner (Union):** We support read-only inspection and filesystem search; we do **not** support Editor-only or write features (open scene, play mode, screenshot, create_script, execute_code, get_game_object).
- **What Unity devs search for:** “Find references,” “missing script,” “assembly cycles,” “release readiness,” “large assets” are well covered by our current tools.
- **Added:** `list_unity_hub_projects`, `search_project`, `get_meta_for_asset`, `get_script_public_api`, `get_broken_asset_refs`, and `search_tools` (AI tool discovery).
