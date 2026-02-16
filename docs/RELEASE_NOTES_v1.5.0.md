# Release v1.5.0

**Release date:** 2026-02-16

This release brings the Unity MCP server to **101 tools**, with new capabilities for project settings, scenes, prefabs, assets, and release readiness. Documentation has been updated for npm and the MCP Registry, and new guides explain how the server helps Unity developers and which tools suit different roles.

## Summary of changes

- **26 new tools** in 1.5.0 (75 → 101 total).
- **Project & build:** Audio, navigation, XR, script execution order, version control, layer collision matrix, cloud services, package dependency graph, package samples.
- **Code & assemblies:** Resolve assembly for a given script/folder path.
- **Scenes & prefabs:** Scene components by type, scene objects by tag, all components by type across scenes, prefab variants, prefabs with a given component.
- **Assets & references:** Video clips, legacy fonts, render textures, terrain data, lighting assets, sprite assets, search by name, texture meta.
- **Animation:** Avatar masks, animator override controllers.
- **Speed & productivity:** One-shot release readiness (version, build scenes, packages, broken refs, cycles, large assets).
- **Docs:** PURPOSE and PUBLISH moved to `docs/`; new HOW_IT_HELPS_UNITY_DEVELOPERS.md, ROLE_BASED_GAP_ANALYSIS.md; README updated with supported IDEs and integration with Unity Editor.
- **Packaging:** `.npmignore` added (exclude `docs/` and `src/` from npm).

---

## All 101 tools (by category)

### Project & build (22)

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

### Code & assemblies (7)

| Tool | Description |
|------|-------------|
| `list_assemblies` | Assembly definitions with references, platforms |
| `get_assembly_for_path` | Assembly that contains a given script or folder path |
| `list_scripts` | C# scripts (optional folder filter) |
| `find_scripts_by_content` | By type/pattern (e.g. MonoBehaviour) |
| `get_assembly_dependency_graph` | Nodes and edges |
| `list_editor_scripts` | Scripts in Editor folders |
| `list_visual_scripting_assets` | Bolt / Unity Visual Scripting .asset files |

### Scenes & prefabs (10)

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

### Assets & references (11)

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

### Materials & shaders (4)

| Tool | Description |
|------|-------------|
| `list_materials` | Materials (optional folder) |
| `list_shaders` | .shader in Assets and Packages |
| `list_shader_graphs` | Shader Graph assets |
| `list_vfx_graphs` | VFX Graph assets |

### Animation (6)

| Tool | Description |
|------|-------------|
| `list_animator_controllers` | .controller assets |
| `list_animation_clips` | .anim assets |
| `get_animator_states` | State names from a controller |
| `list_timeline_playables` | Timeline .playable assets |
| `list_avatar_masks` | Avatar Mask (.mask) assets |
| `list_animator_override_controllers` | AnimatorOverrideController assets |

### 2D & sprites (3)

| Tool | Description |
|------|-------------|
| `list_sprite_atlases` | Sprite Atlas assets |
| `list_tilemap_assets` | Tilemap-related assets |
| `list_sprite_assets` | Textures configured as sprites (spriteMode in .meta) |

### Rendering (1)

| Tool | Description |
|------|-------------|
| `list_render_pipelines` | URP/HDRP pipeline assets, volume profiles |

### TextMeshPro & UI (3)

| Tool | Description |
|------|-------------|
| `list_tmp_fonts` | TMP/font assets |
| `get_tmp_settings_path` | TMP Settings asset path |
| `list_ui_documents` | .uxml and .uss (UI Toolkit) |

### Input (3)

| Tool | Description |
|------|-------------|
| `get_input_axes` | InputManager axes |
| `list_input_action_assets` | New Input System .inputactions |
| `get_input_actions_summary` | Action maps and actions from a file |

### Tags & layers (1)

| Tool | Description |
|------|-------------|
| `get_tags_and_layers` | Tags and layers from TagManager |

### Addressables & localization (2)

| Tool | Description |
|------|-------------|
| `get_addressables_info` | Groups and config path |
| `get_localization_tables` | Localization table files |

### Audio (2)

| Tool | Description |
|------|-------------|
| `list_audio_clips` | .wav, .mp3, .ogg, .aiff |
| `list_audio_mixers` | Audio Mixer assets |

### Testing & docs (3)

| Tool | Description |
|------|-------------|
| `list_test_assemblies` | Test assembly definitions |
| `get_repo_docs` | README, CONTRIBUTING, .cursorrules, etc. |
| `read_agent_docs` | .agents/AGENT.md, optional REPO_UNDERSTANDING.md |

### CI & version control (4)

| Tool | Description |
|------|-------------|
| `list_ci_configs` | .github/workflows, Jenkinsfile, unity-cloud-build |
| `list_presets` | .preset assets |
| `get_git_lfs_tracked` | LFS patterns from .gitattributes |
| `get_plastic_config` | Plastic SCM config |

### Integrations (14)

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

### Speed & productivity (7)

| Tool | Description |
|------|-------------|
| `get_project_stats` | One-shot stats: scripts, prefabs, scenes, materials, animations, assemblies, packages |
| `get_scene_referenced_assets` | Asset paths referenced by a scene (build size / impact) |
| `detect_assembly_cycles` | Circular refs in assembly definitions (fix compile errors) |
| `find_script_references` | C# files that reference a type/class name (refactoring) |
| `get_broken_script_refs` | Prefabs/scenes with missing script refs |
| `get_prefab_dependencies` | Asset paths referenced by a prefab (impact analysis) |
| `get_release_readiness` | One-shot: version, build scenes, packages, broken refs, cycles, large assets |

---

**Install:** `npx @rachitkumarrastogi/unity-mcp-server` or from [npm](https://www.npmjs.com/package/@rachitkumarrastogi/unity-mcp-server) / [MCP Registry](https://registry.modelcontextprotocol.io/?q=unity-mcp-server).
