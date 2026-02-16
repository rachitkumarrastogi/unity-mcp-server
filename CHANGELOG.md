# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2026-02-16

### Added

- 18 new tools: `get_audio_settings`, `get_navigation_settings`, `get_xr_settings`, `get_script_execution_order`, `get_version_control_settings`, `get_layer_collision_matrix`, `get_cloud_services_config`, `get_package_dependency_graph`, `list_video_clips`, `list_legacy_font_assets`, `list_render_textures`, `list_terrain_data`, `list_lighting_settings_assets`, `list_sprite_assets`, `get_scene_components_by_type`, `list_prefab_variants`, `list_avatar_masks`, `list_animator_override_controllers` (93 tools total).
- PUBLISH.md with npm and MCP Registry publish steps.
- .npmignore (exclude docs/ and src/ from npm package).

### Changed

- Documentation updated for npm/MCP registry: README, PURPOSE.md, docs (Integration with Unity Editor, professional tone).

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

[1.5.0]: https://github.com/rachitkumarrastogi/unity-mcp-server/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/rachitkumarrastogi/unity-mcp-server/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/rachitkumarrastogi/unity-mcp-server/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/rachitkumarrastogi/unity-mcp-server/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/rachitkumarrastogi/unity-mcp-server/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/rachitkumarrastogi/unity-mcp-server/releases/tag/v1.0.0
