# Role-Based Gap Analysis

This document maps **Unity developers**, **designers**, **scene/level creators**, and **product owners** to their typical needs and what the current tools cover.

**Current status (101 tools):** The “missing” tools listed below were **subsequently implemented**. Today we have: `get_assembly_for_path`, `list_package_samples`, `get_texture_meta`, `list_prefabs_with_component`, `get_scene_objects_by_tag`, `get_all_components_by_type`, `get_release_readiness`, `search_assets_by_name`, plus audio/navigation/XR/video/terrain/lighting and other project/asset tools. For an up-to-date **tools-by-role** view see [TOOLS_BY_ROLE.md](../guides/TOOLS_BY_ROLE.md). For **suggested new tools** to add next see [SUGGESTED_TOOLS_TO_ADD.md](./SUGGESTED_TOOLS_TO_ADD.md).

---

## 1. Unity developers

| Need | Current tool(s) | Gap? |
|------|------------------|------|
| Assembly definitions, references, platforms | `list_assemblies`, `get_assembly_dependency_graph` | No |
| Find scripts by type/pattern, namespace | `find_scripts_by_content`, `list_scripts` | No |
| Which assembly a script belongs to | — | **Yes** — No “assembly for path” or “scripts per assembly”. |
| Circular assembly refs, broken script refs | `detect_assembly_cycles`, `get_broken_script_refs` | No |
| Script execution order, defines | `get_script_execution_order`, `get_scripting_defines` | No |
| Find C# files that use a type | `find_script_references` | No |
| Editor vs runtime scripts | `list_editor_scripts` | No |
| Package samples (e.g. in Packages) | — | **Yes** — No “list package samples” or Samples folders. |
| Test assemblies | `list_test_assemblies` | No |

**Missing for developers**

- **`get_assembly_for_path`** (or **`list_scripts_by_assembly`**) — Given a path (e.g. script or folder), return which .asmdef (assembly) contains it; or list scripts grouped by assembly. Needed for “which assembly is this in?” and refactors.
- **`list_package_samples`** — List Samples folders (or sample paths) under Packages so devs can see what’s installed and where.

---

## 2. Designers (art, UI, assets)

| Need | Current tool(s) | Gap? |
|------|------------------|------|
| Materials, shaders, shader graphs, VFX | `list_materials`, `list_shaders`, `list_shader_graphs`, `list_vfx_graphs` | No |
| Textures, sprites, atlases, PPU | `list_assets_by_extension`, `list_sprite_assets`, `list_sprite_atlases`, `get_texture_meta` | No (implemented) |
| Fonts (TMP + legacy) | `list_tmp_fonts`, `list_legacy_font_assets` | No |
| UI (UXML/USS), render pipelines | `list_ui_documents`, `list_render_pipelines` | No |
| Who uses a texture/material | `find_references` | No |
| Prefabs with Animator / specific component | — | **Yes** — No “prefabs that have component X”. |
| Large textures / size awareness | `list_large_assets` | Partial — No “textures with dimensions”. |

**Missing for designers**

- **`get_texture_meta`** (or **`list_textures_with_meta`**) — For given texture path(s), or list of textures, return key .meta (e.g. maxSize, width/height if present, spriteMode, PixelsPerUnit for sprites). Helps with “what resolution are our UI sprites?” and optimization.
- **`list_prefabs_with_component`** — List prefabs that contain a given component type (e.g. Animator, Rigidbody). Helps “which prefabs are animated?” or “which use physics?”.

---

## 3. Scene / level creators

| Need | Current tool(s) | Gap? |
|------|------------------|------|
| All scenes, build order | `list_all_scenes`, `list_build_scenes` | No |
| What’s in a scene (roots, component count) | `get_scene_summary` | No |
| Cameras, lights, etc. in a scene | `get_scene_components_by_type` | No |
| Assets referenced by a scene | `get_scene_referenced_assets` | No |
| Lighting, terrain | `list_lighting_settings_assets`, `list_terrain_data` | No |
| Objects with a specific tag (e.g. Spawn) | — | **Yes** — No “GameObjects with tag X in scene”. |
| All cameras/lights across all scenes | — | **Yes** — Only per-scene today; no project-wide “all Cameras/Lights”. |
| Scenes that use a prefab | `find_references` (prefab GUID) | No |

**Missing for scene creators**

- **`get_scene_objects_by_tag`** — Given scene path and tag name, return GameObjects that have that tag (e.g. “Spawn”, “Respawn”). Needed for level design and spawn logic.
- **`get_all_components_by_type`** — Given component type (e.g. Camera, Light), scan all .unity scenes and return list of `{ scenePath, gameObjectName }`. Answers “where are all cameras in the project?”.

---

## 4. Product owners

| Need | Current tool(s) | Gap? |
|------|------------------|------|
| Version, build scenes, player settings | `get_project_version`, `list_build_scenes`, `get_player_settings` | No |
| Package count, dependency graph | `list_packages`, `get_package_dependency_graph` | No |
| Broken refs, assembly cycles | `get_broken_script_refs`, `detect_assembly_cycles` | No |
| Large assets, scene refs | `list_large_assets`, `get_scene_referenced_assets` | No |
| Changelog, CI configs, integrations | `get_changelog`, `list_ci_configs`, get_*_config | No |
| One-shot “project health” / release readiness | `get_project_stats` (counts only) | **Yes** — No single “release readiness” that includes broken refs, cycles, version. |

**Missing for product owners**

- **`get_release_readiness`** (or extend **`get_project_stats`**) — Aggregate: project version, build scene count, package count, number of broken script refs, whether assembly cycles exist, optionally large-asset count. One call for “can we ship?” overview.

---

## 5. Cross-role: search by name

| Need | Current tool(s) | Gap? |
|------|------------------|------|
| “Find everything named X” (assets, prefabs, scenes) | — | **Yes** — We have list by type/folder/extension, but no generic “search by name/pattern”. |

**Missing for everyone**

- **`search_assets_by_name`** — Search Assets (and optionally Packages) by file or folder name pattern (e.g. “Player”, “*Menu*”). Return matching paths. Useful for all roles (“where is the Player prefab?”, “all assets with ‘Enemy’ in the name”).

---

## Summary: suggested new tools (no overlap)

| # | Tool | Primary role(s) | Purpose |
|---|------|------------------|--------|
| 1 | **`search_assets_by_name`** | All | Search Assets (and optionally Packages) by name/pattern; return paths. |
| 2 | **`get_assembly_for_path`** | Developer | Given asset path (script or folder), return containing assembly name/path (from .asmdef). |
| 3 | **`list_package_samples`** | Developer | List Samples folders or sample asset paths under Packages. |
| 4 | **`get_texture_meta`** | Designer | For texture path(s), return .meta info (maxSize, width/height if in meta, spriteMode, PixelsPerUnit). |
| 5 | **`list_prefabs_with_component`** | Designer | List prefabs that contain a given component type (e.g. Animator, Rigidbody). |
| 6 | **`get_scene_objects_by_tag`** | Scene creator | Given scene path and tag, return GameObjects that have that tag. |
| 7 | **`get_all_components_by_type`** | Scene creator | Given component type, return all occurrences across all scenes (scene path + GameObject name). |
| 8 | **`get_release_readiness`** | Product owner | One-shot: version, build scene count, package count, broken ref count, has assembly cycles, optional large-asset count. |

All of these stay **read-only** and **editor-free**, and each has a distinct role so they don’t overlap with existing tools.
