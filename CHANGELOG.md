# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.2] - 2026-02-16

### Changed

- Version bump (1.5.1 already published to npm/MCP Registry).

---

## [1.5.1] - 2026-02-16

### Changed

- README: added **Example prompt to type** column to every tools table so developers know what to ask in Claude/Cursor for each tool. Added query examples for `search_tools` and a short "What to type in Claude/Cursor" section.

---

## [1.5.0] - 2026-02-16

### Added

- **101 tools total.** New in this release:
  - **Project & build:** `get_audio_settings`, `get_navigation_settings`, `get_xr_settings`, `get_script_execution_order`, `get_version_control_settings`, `get_layer_collision_matrix`, `get_cloud_services_config`, `get_package_dependency_graph`, `list_package_samples`.
  - **Code & assemblies:** `get_assembly_for_path`.
  - **Scenes & prefabs:** `get_scene_components_by_type`, `get_scene_objects_by_tag`, `get_all_components_by_type`, `list_prefab_variants`, `list_prefabs_with_component`.
  - **Assets & references:** `list_video_clips`, `list_legacy_font_assets`, `list_render_textures`, `list_terrain_data`, `list_lighting_settings_assets`, `search_assets_by_name`, `get_texture_meta`.
  - **Animation:** `list_avatar_masks`, `list_animator_override_controllers`.
  - **2D:** `list_sprite_assets`.
  - **Speed & productivity:** `get_release_readiness`.
- docs/PUBLISH.md, docs/PURPOSE.md (publish and purpose docs in docs/).
- .npmignore (exclude docs/ and src/ from npm package).
- docs/HOW_IT_HELPS_UNITY_DEVELOPERS.md, docs/ROLE_BASED_GAP_ANALYSIS.md.
- README: Supported IDEs and clients (Cursor, Claude Desktop, VS Code, Windsurf, etc.).

### Changed

- Documentation updated for npm/MCP registry: README, PURPOSE, docs (Integration with Unity Editor, professional tone).
- PURPOSE.md and PUBLISH.md moved to docs/.

---

## [1.4.0] - 2025-02-15

### Changed

- Tools reorganized by category in README (Project & build, Code & assemblies, Scenes & prefabs, etc.).
- Unity package sync and metadata updates.

### Fixed

- `package-lock.json` and MCP `server.json` version aligned with npm package (1.4.0).

---

## [1.3.0] - 2025-01-xx

### Added

- Speed/productivity tools: `get_project_stats`, `get_scene_referenced_assets`, `detect_assembly_cycles`, `find_script_references`, `get_broken_script_refs`, `get_prefab_dependencies`.
- README Speed section; AUDIT_2026.

---

## [1.2.0]

### Added

- 28 tools: physics, pipelines, Timeline, 2D, TMP, UI Toolkit, Input System, presets, editor scripts, prefab refs, assembly graph, CI, large assets; PlayFab, Figma, Firebase, Steam, Discord, FMOD, Wwise, Substance, SpeedTree, Lottie, analytics, ads, Git LFS, Plastic.

## [1.1.0]

### Added

- 27 tools: packages, assemblies, scenes, prefabs, assets, materials, animation, audio, Addressables, input, tags, tests, docs, changelog.

## [1.0.0]

### Added

- Initial release: Unity MCP server (project info, build scenes, agent docs).

[1.5.2]: https://github.com/rachitkumarrastogi/unity-mcp-server/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/rachitkumarrastogi/unity-mcp-server/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/rachitkumarrastogi/unity-mcp-server/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/rachitkumarrastogi/unity-mcp-server/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/rachitkumarrastogi/unity-mcp-server/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/rachitkumarrastogi/unity-mcp-server/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/rachitkumarrastogi/unity-mcp-server/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/rachitkumarrastogi/unity-mcp-server/releases/tag/v1.0.0
