# Tools by Role: Developer, Tester, Game Developer, Game Designer

This document maps the **101 tools** in unity-mcp-server to four roles so you can see what’s available for your job.

---

## 1. Developer (engineer, programmer)

**Typical needs:** Code structure, assemblies, refactoring, build/config, dependencies, scripts.

| Category | Tools |
|----------|--------|
| **Project & build** | `get_project_info`, `list_build_scenes`, `get_player_settings`, `list_packages`, `get_scripting_defines`, `get_physics_settings`, `get_graphics_settings`, `get_time_settings`, `get_build_target_info`, `get_feature_set_inference`, `get_project_version`, `get_changelog`, `get_script_execution_order`, `get_version_control_settings`, `get_package_dependency_graph`, `list_package_samples`, `list_unity_hub_projects` |
| **Code & assemblies** | `list_assemblies`, `get_assembly_for_path`, `list_scripts`, `find_scripts_by_content`, `get_assembly_dependency_graph`, `list_editor_scripts`, `list_visual_scripting_assets`, `get_script_public_api` |
| **Speed & productivity** | `get_project_stats`, `detect_assembly_cycles`, `find_script_references`, `get_broken_script_refs`, `get_release_readiness` |
| **Assets & references** | `find_references`, `search_project`, `get_meta_for_asset`, `get_broken_asset_refs` |
| **CI & version control** | `list_ci_configs`, `list_presets`, `get_git_lfs_tracked`, `get_plastic_config` |
| **Testing & docs** | `list_test_assemblies`, `get_repo_docs`, `read_agent_docs` |

**Example prompts:** *"Which assembly contains PlayerController.cs?"* · *"Find references to GameManager"* · *"Do we have assembly cycles?"* · *"What's the script execution order?"* · *"List all C# scripts in Assets/Scripts"* · *"Is the project release ready?"*

---

## 2. Tester (QA, test engineer)

**Typical needs:** Test layout, build content, config, what’s in scenes, release readiness.

| Category | Tools |
|----------|--------|
| **Project & build** | `get_project_info`, `list_build_scenes`, `get_player_settings`, `get_quality_settings`, `get_build_target_info`, `get_project_version`, `get_changelog` |
| **Testing & docs** | `list_test_assemblies`, `get_repo_docs`, `read_agent_docs` |
| **Scenes & prefabs** | `list_all_scenes`, `get_scene_summary`, `get_scene_components_by_type`, `get_scene_objects_by_tag`, `list_prefabs`, `list_prefabs_with_component` |
| **Speed & productivity** | `get_project_stats`, `get_broken_script_refs`, `get_release_readiness` |
| **CI & version control** | `list_ci_configs` |
| **Input** | `get_input_axes`, `list_input_action_assets`, `get_input_actions_summary` |
| **Tags & layers** | `get_tags_and_layers` |

**Example prompts:** *"Which scenes are in the build?"* · *"List test assemblies"* · *"What's in MainMenu.unity?"* · *"Find prefabs with missing script"* · *"Run release readiness check"* · *"What input actions are defined?"*

---

## 3. Game developer (gameplay, systems, integration)

**Typical needs:** Scenes, prefabs, components, scripts, input, animation, physics, integrations.

| Category | Tools |
|----------|--------|
| **Scenes & prefabs** | `list_all_scenes`, `get_scene_summary`, `get_scene_components_by_type`, `get_scene_objects_by_tag`, `get_all_components_by_type`, `list_prefabs`, `list_prefab_variants`, `list_prefabs_with_component`, `get_prefab_script_guids`, `get_prefab_dependencies`, `list_subscenes` |
| **Code & assemblies** | `list_scripts`, `find_scripts_by_content`, `get_script_public_api`, `get_assembly_for_path` |
| **Animation** | `list_animator_controllers`, `list_animation_clips`, `get_animator_states`, `list_timeline_playables`, `list_avatar_masks`, `list_animator_override_controllers` |
| **Input** | `get_input_axes`, `list_input_action_assets`, `get_input_actions_summary` |
| **Project & build** | `get_project_info`, `list_build_scenes`, `get_physics_settings`, `get_time_settings`, `get_navigation_settings`, `get_xr_settings` |
| **Assets & references** | `find_references`, `search_assets_by_name`, `search_project` |
| **Tags & layers** | `get_tags_and_layers`, `get_layer_collision_matrix` |
| **Integrations** | `get_playfab_config`, `get_firebase_config`, `get_steam_config`, `get_discord_config`, `get_analytics_or_crash_config`, `get_ads_config` |
| **Speed & productivity** | `get_broken_script_refs`, `find_script_references` |

**Example prompts:** *"Which prefabs have an Animator?"* · *"What states are in Player.controller?"* · *"Find objects with tag Spawn in Level01"* · *"What does Hero.prefab depend on?"* · *"List Input System action assets"* · *"Where are all the cameras?"*

---

## 4. Game designer (content, levels, UI, narrative)

**Typical needs:** Scenes, prefabs, assets, UI, animation, audio, 2D/art, localization.

| Category | Tools |
|----------|--------|
| **Scenes & prefabs** | `list_all_scenes`, `get_scene_summary`, `get_scene_components_by_type`, `get_scene_objects_by_tag`, `get_all_components_by_type`, `list_prefabs`, `list_prefab_variants`, `list_prefabs_with_component` |
| **Assets & references** | `get_asset_folder_tree`, `list_assets_by_extension`, `find_references`, `search_assets_by_name`, `get_texture_meta`, `list_large_assets`, `list_video_clips` |
| **Materials & shaders** | `list_materials`, `list_shaders`, `list_shader_graphs`, `list_vfx_graphs` |
| **2D & sprites** | `list_sprite_atlases`, `list_tilemap_assets`, `list_sprite_assets` |
| **Rendering** | `list_render_pipelines` |
| **TextMeshPro & UI** | `list_tmp_fonts`, `get_tmp_settings_path`, `list_ui_documents` |
| **Animation** | `list_animator_controllers`, `list_animation_clips`, `get_animator_states`, `list_timeline_playables` |
| **Audio** | `list_audio_clips`, `list_audio_mixers` |
| **Tags & layers** | `get_tags_and_layers` |
| **Addressables & localization** | `get_addressables_info`, `get_localization_tables` |
| **Integrations** | `list_figma_related_assets` |

**Example prompts:** *"List all materials"* · *"What's the import settings for hero.png?"* · *"Which prefabs have an Animator?"* · *"List sprite atlases"* · *"List localization tables"* · *"What references this texture?"*

---

## Meta: all roles

| Tool | Purpose |
|------|--------|
| `search_tools` | Find tools by intent (e.g. "find references", "missing script"). Omit query to list all tools by category. |

---

## Summary

- **Developer:** ~35 tools (assemblies, scripts, refs, cycles, release readiness, CI, docs).
- **Tester:** ~25 tools (build, test assemblies, scenes, prefabs, release readiness, input, tags).
- **Game developer:** ~40 tools (scenes, prefabs, animation, input, physics, navigation, integrations).
- **Game designer:** ~35 tools (scenes, assets, materials, 2D, UI, animation, audio, localization).

Many tools are shared across roles. Use the [README](../../README.md) “Example prompt to type” column and [How it helps Unity developers](./HOW_IT_HELPS_UNITY_DEVELOPERS.md) for concrete prompts.
