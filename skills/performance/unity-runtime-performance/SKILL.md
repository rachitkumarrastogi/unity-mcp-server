---
name: unity-runtime-performance
description: >-
  Use for runtime performance triage from the project filesystem: quality tiers,
  graphics/URP-HDRP settings, lighting, large assets, scene complexity proxies,
  and build-size hotspots (no Editor Profiler required).
---
# Runtime performance (filesystem proxies)

This MCP **cannot** attach to the Unity Profiler. Use these tools as a **static triage** before opening Profiler/Frame Debugger.

## Discovery order

| Step | Tool | What it tells you |
|------|------|-------------------|
| 1 | `get_quality_settings` | Tier count, shadows, AA, soft particles |
| 2 | `get_graphics_settings` / `list_render_pipelines` | Pipeline + SRP batcher-related assets |
| 3 | `get_lighting_scene_info` / `list_lighting_settings_assets` | GI / lighting mode cost |
| 4 | `get_scene_summary` + `get_all_components_by_type` | Cameras, lights, particle proxies per scene |
| 5 | `list_large_assets` / `get_build_size_estimate` | Memory/disk pressure candidates |
| 6 | `list_lod`-N/A — use `search_assets_by_name` `*LOD*` / meshes | LOD presence heuristic |
| 7 | `get_time_settings` | Fixed timestep vs render cost |

## Checklist

- **One main camera** strategy per scene; disable unused cameras.
- Cap realtime lights; prefer baked/mixed where possible.
- URP/HDRP: match quality tier to device; strip unused features.
- Textures: maxSize + compression (`get_texture_meta`).
- Audio: streaming for music (`unity-audio-mixer-fmod-wwise`).
- UI: avoid full-screen overdraw; atlas sprites (`unity-2d-tilemap-sprites`).

## Follow-ups

- Size-focused: `unity-build-size-optimization`
- Memory assets: `unity-memory-asset-pressure`
- Render stack: `unity-urp-hdrp-render-audit`

## Report template

```markdown
## Performance triage (static)
- Quality tiers: ...
- Pipeline: URP/HDRP/...
- Build scenes: N; heavy components: ...
- Largest assets: ...
- Suspected issues: lights / textures / audio / UI
- Next: open Profiler on <scene>
```
