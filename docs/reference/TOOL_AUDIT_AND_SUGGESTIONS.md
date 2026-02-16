# Tool Audit and Suggestions

This document audits **all existing tools** (so we don’t duplicate or confuse users) and suggests **new, unique tools** we can add. Each suggestion has a clear purpose and is explicitly non-overlapping.

---

## Part 1: Existing tools (do not duplicate)

### 📦 Project & build
| Tool | Purpose |
|------|--------|
| `get_project_info` | Path, Unity version, build scene count, player/product name |
| `list_build_scenes` | Scenes in EditorBuildSettings (build order) |
| `get_player_settings` | Product name, company, bundle ID, version (ProjectSettings.asset) |
| `list_packages` | Packages from manifest.json (flat list) |
| `get_quality_settings` | Quality levels |
| `get_scripting_defines` | Global and per-assembly defines |
| `get_physics_settings` | DynamicsManager + Physics2DSettings |
| `get_graphics_settings` | GraphicsSettings.asset |
| `get_time_settings` | TimeManager.asset |
| `get_build_target_info` | Active build target / platform |
| `get_feature_set_inference` | Infer feature sets from packages (2D, ECS, AR, etc.) |
| `get_project_version` | Bundle version |
| `get_changelog` | CHANGELOG contents |

### 💻 Code & assemblies
| Tool | Purpose |
|------|--------|
| `list_assemblies` | Assembly definitions with references, platforms |
| `list_scripts` | C# scripts (optional folder filter) |
| `find_scripts_by_content` | Scripts containing a type/pattern (e.g. MonoBehaviour) |
| `get_assembly_dependency_graph` | Assembly dependency nodes/edges |
| `list_editor_scripts` | Scripts in Editor folders |
| `list_visual_scripting_assets` | Bolt / Unity Visual Scripting .asset files |

### 🎬 Scenes & prefabs
| Tool | Purpose |
|------|--------|
| `list_all_scenes` | All .unity files under Assets |
| `get_scene_summary` | Root GameObjects, component count |
| `get_scene_referenced_assets` | Asset paths referenced by a scene (GUIDs resolved) |
| `list_prefabs` | Prefabs (optional path prefix) |
| `get_prefab_script_guids` | Script GUIDs used by a prefab |
| `get_prefab_dependencies` | Asset paths referenced by a prefab |
| `list_subscenes` | ECS/DOTS .subscene assets |

### 📁 Assets & references
| Tool | Purpose |
|------|--------|
| `get_asset_folder_tree` | Folder tree under Assets |
| `list_assets_by_extension` | By extension (e.g. .png, .fbx) |
| `find_references` | Assets that reference a given path or GUID |
| `list_large_assets` | Files over N MB |

### 🎨 Materials & shaders
| Tool | Purpose |
|------|--------|
| `list_materials` | Materials (optional folder), shader GUID |
| `list_shaders` | .shader in Assets and Packages |
| `list_shader_graphs` | Shader Graph assets |
| `list_vfx_graphs` | VFX Graph assets |
| `list_render_pipelines` | URP/HDRP pipeline assets, volume profiles |

### 🎞️ Animation
| Tool | Purpose |
|------|--------|
| `list_animator_controllers` | .controller assets |
| `list_animation_clips` | .anim assets |
| `get_animator_states` | State names from a controller |
| `list_timeline_playables` | Timeline .playable assets |

### 🖼️ 2D & sprites
| Tool | Purpose |
|------|--------|
| `list_sprite_atlases` | Sprite Atlas assets |
| `list_tilemap_assets` | Tilemap-related .asset files |

### 📝 TextMeshPro & UI
| Tool | Purpose |
|------|--------|
| `list_tmp_fonts` | TMP/font-related assets |
| `get_tmp_settings_path` | TMP Settings asset path |
| `list_ui_documents` | UI Toolkit .uxml and .uss |

### 🎮 Input
| Tool | Purpose |
|------|--------|
| `get_input_axes` | InputManager axes |
| `list_input_action_assets` | New Input System .inputactions |
| `get_input_actions_summary` | Action maps/actions from a file |

### 🏷️ Tags & layers
| Tool | Purpose |
|------|--------|
| `get_tags_and_layers` | Tags and layers from TagManager |

### 🌐 Addressables & localization
| Tool | Purpose |
|------|--------|
| `get_addressables_info` | Addressables groups and config path |
| `get_localization_tables` | Localization table files |

### 🔊 Audio
| Tool | Purpose |
|------|--------|
| `list_audio_clips` | .wav, .mp3, .ogg, .aiff |
| `list_audio_mixers` | Audio Mixer assets |

### 🧪 Testing & docs
| Tool | Purpose |
|------|--------|
| `list_test_assemblies` | Test assembly definitions |
| `get_repo_docs` | README, CONTRIBUTING, .cursorrules, etc. |
| `read_agent_docs` | .agents/AGENT.md, optional REPO_UNDERSTANDING.md |

### 🔄 CI & version control
| Tool | Purpose |
|------|--------|
| `list_ci_configs` | .github/workflows, Jenkinsfile, unity-cloud-build |
| `list_presets` | .preset assets |
| `get_git_lfs_tracked` | LFS patterns from .gitattributes |
| `get_plastic_config` | Plastic SCM config |

### 🔌 Integrations (config discovery)
| Tool | Purpose |
|------|--------|
| `get_playfab_config` | PlayFab title ID, config paths |
| `list_figma_related_assets` | Figma folder / named assets |
| `get_firebase_config` | GoogleServices path, project ID |
| `get_steam_config` | steam_appid.txt, Steamworks path |
| `get_discord_config` | Discord SDK path |
| `get_fmod_config` | FMOD banks path, bank files |
| `get_wwise_config` | Wwise sound banks, project paths |
| `list_substance_assets` | .sbsar, .sbs |
| `list_speedtree_assets` | .spm, .stm |
| `list_lottie_assets` | Lottie JSON assets |
| `get_analytics_or_crash_config` | Sentry, Crashlytics, BugSnag, etc. |
| `get_ads_config` | Unity Ads, AdMob, ironSource presence |

### ⚡ Speed & productivity
| Tool | Purpose |
|------|--------|
| `get_project_stats` | One-shot stats (scripts, prefabs, scenes, materials, etc.) |
| `detect_assembly_cycles` | Circular refs in assembly definitions |
| `find_script_references` | C# files that reference a type/class name |
| `get_broken_script_refs` | Prefabs/scenes with missing script refs |

---

## Part 2: Suggested new tools (unique, non-overlapping)

Each suggestion is **one clear tool**, so the AI and the user are not confused with “which one do I use?”

### Project settings (we don’t read these yet)

| Suggested tool | Purpose | Why unique |
|----------------|--------|------------|
| **`get_audio_settings`** | Read **AudioManager.asset** (global volume, reverb zones, DSP buffer, etc.). | We list audio *assets* (clips, mixers) but not project-level *audio settings*. |
| **`get_navigation_settings`** | Read NavMesh/agent settings from ProjectSettings if present (e.g. NavMeshAreas, agent types). | No current tool for AI/navigation config. |
| **`get_xr_settings`** | Read XR/VR-related ProjectSettings (e.g. XR Plug-in Management, XRSettings). | Distinct from build target and feature inference. |
| **`get_script_execution_order`** | Which scripts run in which order (from ProjectSettings / MonoManager). | Helps debug “script A vs B run order” without opening Editor. |
| **`get_version_control_settings`** | Read VersionControlSettings (Visible Meta Files, Asset Serialization mode). | Different from Git LFS / Plastic; this is Unity’s own VC settings. |

### Asset types (we don’t list these yet)

| Suggested tool | Purpose | Why unique |
|----------------|--------|------------|
| **`list_video_clips`** | List video clip assets (.mp4, .mov, .webm under Assets used as VideoClip). | We have audio clips; video is a separate media type. |
| **`list_legacy_font_assets`** | List legacy font assets (.fontsettings, .ttf, .otf under Assets, excluding TMP). | We have `list_tmp_fonts`; this is explicitly non-TMP fonts. |
| **`list_avatar_masks`** | List Avatar Mask assets (.mask used by Animator). | We have animator controllers/clips; masks are a distinct asset type. |
| **`list_render_textures`** | List RenderTexture assets (.renderTexture). | Distinct from materials/shaders and from “assets by extension.” |
| **`list_terrain_data`** | List TerrainData (and optionally TerrainLayer) assets. | We don’t cover terrain at all yet. |
| **`list_lighting_settings_assets`** | List .asset files that are lighting-related (e.g. LightingSettings, lightmaps). | Distinct from render pipelines and materials. |

### Scene/prefab depth (same assets, deeper insight)

| Suggested tool | Purpose | Why unique |
|----------------|--------|------------|
| **`get_scene_components_by_type`** | Given a scene path and component type (e.g. `Camera`, `Light`), return GameObjects that have that component. | `get_scene_summary` is high-level; this answers “where are all cameras/lights in this scene?” without overlapping. |
| **`list_prefab_variants`** | List prefabs that are variants of another prefab (parse prefab YAML for parent prefab reference). | We list prefabs and dependencies; this is “which prefabs are variants?” only. |

### Animation (more granular, no overlap)

| Suggested tool | Purpose | Why unique |
|----------------|--------|------------|
| **`list_animator_override_controllers`** | List .controller assets that are AnimatorOverrideController (detect via YAML). | We have animator controllers and states; override controllers are a subset with a different role. |

### Packages & dependencies

| Suggested tool | Purpose | Why unique |
|----------------|--------|------------|
| **`get_package_dependency_graph`** | Which package depends on which (from manifest + lock). Nodes and edges, like assembly graph but for packages. | `list_packages` is a flat list; this is explicit dependency *structure*. |

### 2D / sprites (more specific)

| Suggested tool | Purpose | Why unique |
|----------------|--------|------------|
| **`list_sprite_assets`** | List textures configured as sprites (TextureImporter spriteMode in .meta). | We have sprite *atlases* and tilemaps; this is “individual sprite assets.” |

### Optional / lower priority

| Suggested tool | Purpose | Why unique |
|----------------|--------|------------|
| **`get_layer_collision_matrix`** | Layer collision matrix (which layers collide). May live in TagManager/DynamicsManager; expose if not already in `get_physics_settings` / `get_tags_and_layers`. | Only add if we confirm it’s not already covered. |
| **`get_cloud_services_config`** | Unity Cloud / UnityConnect-related config (e.g. project ID) if present. | Distinct from analytics/crash/ads; this is Unity’s own cloud. |

---

## Part 3: What we intentionally don’t add (to avoid overlap)

- **“List all .asset”** — Too broad; we already have targeted lists (tilemap, preset, render pipeline, etc.). Use `list_assets_by_extension` for raw listing.
- **“Find scenes that use asset X”** — Already covered by `find_references` (pass asset path or GUID; results include scenes).
- **“Get more player settings”** — Already under `get_player_settings`; extend that reader rather than adding another tool.
- **“List meshes”** — Meshes are inside .fbx/.obj or generated; listing “mesh assets” is fuzzy. Prefer `list_assets_by_extension` (.fbx, .obj) + scene/prefab dependencies.
- **Duplicate “list fonts”** — We have `list_tmp_fonts`. New one is explicitly `list_legacy_font_assets` so names don’t overlap.

---

## Summary

- **Existing:** All current tools are listed in Part 1 so that new additions remain non-overlapping.
- **Suggested:** Part 2 lists high-value, unique tools. Each has a single responsibility and a clear name for both users and the AI.
- **Out of scope:** Part 3 clarifies what is intentionally not added so the tool set remains consistent and unambiguous.
