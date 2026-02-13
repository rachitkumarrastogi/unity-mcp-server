# Unity MCP Server – Audit (Feb 2026)

This audit checks that the server covers what Unity developers need as of Feb 2026 (Unity 6, current packages, and common workflows). All tools are **filesystem-only**; no Unity Editor is required.

---

## Summary

| Category | Tool count | Status |
|----------|------------|--------|
| Project & build | 10 | ✅ |
| Code & assemblies | 5 | ✅ |
| Scenes, prefabs, ECS | 6 | ✅ (incl. subscenes) |
| Assets & references | 4 | ✅ |
| Materials, shaders, rendering | 5 | ✅ |
| Animation & Timeline | 4 | ✅ |
| 2D & sprites | 2 | ✅ |
| TextMeshPro & UI Toolkit | 3 | ✅ |
| Input (legacy + new) | 3 | ✅ |
| Physics & graphics & time | 4 | ✅ (graphics, time added) |
| Tags & layers | 1 | ✅ |
| Addressables & localization | 2 | ✅ |
| Audio | 2 | ✅ |
| Testing & docs | 3 | ✅ |
| CI & version control | 4 | ✅ |
| Build target & feature sets | 2 | ✅ (added 2026) |
| Visual Scripting | 1 | ✅ (added 2026) |
| Integrations (config) | 12 | ✅ |
| **Total** | **64** | ✅ (58 existing + 6 added Feb 2026) |

---

## Unity 6 / 2026 alignment

- **Feature sets** — `get_feature_set_inference` infers 2D, ECS, AR, VR, Mobile, Visual Scripting, etc. from `manifest.json`.
- **ECS / DOTS** — `list_subscenes` lists `.subscene` assets.
- **Graphics & time** — `get_graphics_settings`, `get_time_settings` read ProjectSettings.
- **Build target** — `get_build_target_info` reports active platform from ProjectSettings.
- **Visual Scripting** — `list_visual_scripting_assets` lists Bolt/Unity Visual Scripting assets under Ludiq or `com.unity.visualscripting`.
- **Package Manager** — `list_packages` covers manifest and lockfile; feature-set inference uses the same data.

---

## Full tool list

All 64 tools are listed in the README by category. New in this audit: `get_graphics_settings`, `get_time_settings`, `list_subscenes`, `list_visual_scripting_assets`, `get_build_target_info`, `get_feature_set_inference`.

---

## Out of scope (by design)

- **Running the Editor** — No tools execute or depend on the Unity process.
- **API keys / secrets** — Integration tools only discover config paths and non-secret IDs.
- **Real-time build** — No build execution; only build *settings* and scene lists.
- **NavMesh baking** — Data lives in Library; not exposed.

---

## Changelog

- **Feb 2026** — Added: `get_graphics_settings`, `get_time_settings`, `list_subscenes`, `list_visual_scripting_assets`, `get_build_target_info`, `get_feature_set_inference`. Audit doc created.
