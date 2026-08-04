---
name: unity-urp-hdrp-render-audit
description: >-
  Use to audit URP/HDRP: pipeline assets, volume profiles, shaders, Shader Graphs,
  VFX Graphs, and lighting settings assets.
---
# URP / HDRP render audit

## Discovery

1. `list_render_pipelines` — pipeline + volume profile assets
2. `list_shaders` / `list_shader_graphs` / `list_vfx_graphs`
3. `list_materials` / `list_materials_using_shader`
4. `list_lighting_settings_assets` / `get_lighting_scene_info`
5. `get_graphics_settings` / `get_quality_settings`

## Checklist

- One active pipeline asset per platform quality tier.
- Strip unused shader variants; watch mobile shader cost.
- Volume profiles: global vs local; avoid stacking conflicts.
- Confirm lighting mode matches GI workflow in build scenes.

## Related

- `get_feature_set_inference`, `list_large_assets`
