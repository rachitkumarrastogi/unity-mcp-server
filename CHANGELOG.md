# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.4] - 2026-08-04

### Security

- **Path confinement:** `readFileSafe` / `listFilesRecursive` and all FS walks now reject `../`, absolute segments, and symlink escapes outside `UNITY_PROJECT_PATH` (`resolveUnderRoot` + `realpath`).
- **ReDoS:** search/pattern tools use escaped literal / wildcard compilers (`literalRegExp` / `wildcardRegExp`) with length caps.
- **Hub disclosure:** `list_unity_hub_projects` redacts absolute paths unless `UNITY_MCP_ALLOW_HUB_PATHS=1`.
- **Size caps:** agent docs, repo docs, changelog, and bundled skills truncated at 200KB.

---

## [1.6.3] - 2026-08-04

### Security

- Reverted Socket Registry (`@socketregistry/*`) overrides from 1.6.2. Those cleared “optimized override available” alerts but introduced **Unpopular package** quality hits (e.g. `@socketregistry/es-define-property`) and lowered Supply Chain / Quality scores. CVE patches from 1.6.1 remain.

---

## [1.6.2] - 2026-08-04

### Security

- Applied Socket Registry overrides for the 8 remaining “Socket optimized override available” supply-chain alerts: `es-define-property`, `function-bind`, `gopd`, `has-symbols`, `hasown`, `object-assign`, `safer-buffer`, `side-channel`.

---

## [1.6.1] - 2026-08-04

### Security

- Cleared Socket.dev Dependency Alerts Report (45 CVE rows, 0.1–0.45): bumped `@modelcontextprotocol/sdk` to `^1.30.0` and pinned patched transitive overrides (`hono@4.13.0`, `@hono/node-server@2.1.0`, `express-rate-limit@8.6.2`, `path-to-regexp@8.4.2`, `body-parser@2.3.0`, `qs@6.15.3`, `fast-uri@4.1.2`, `ip-address@10.4.0`, `ajv@8.20.0`, `esbuild@0.28.1`). See [docs/release-notes/v1.6.1.md](./docs/release-notes/v1.6.1.md).
- `npm audit` reports **0 vulnerabilities**.
- Runtime path unchanged: this server uses **stdio only**; HTTP/SSE demo code inside the MCP SDK is not loaded.

---

## [1.6.0] - 2026-06-21

### Added

- **AI & ML tools (8):** `get_ai_ml_package_inventory`, `list_ml_model_assets`, `find_ai_related_scripts`, `list_ai_prompt_or_config_assets`, `list_ml_agents_training_configs`, `get_ai_stack_summary`, `list_ai_skills`, `read_ai_skill`.
- **Bundled agent skills:** `unity-ml-agents`, `unity-sentis-inference`, `unity-navmesh-npc`, `unity-llm-integration`, `unity-ai-audit` (under `skills/` in the npm package).
- **110 tools total** (was 101).

---

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
