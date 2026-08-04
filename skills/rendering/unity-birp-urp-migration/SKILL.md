---
name: unity-birp-urp-migration
description: >-
  Use when assessing Built-in Render Pipeline vs URP/HDRP. BIRP is deprecated
  in Unity 6.5 and will be obsolete after 6.7 LTS.
---
# BIRP → URP/HDRP migration

## Discovery

1. `get_render_pipeline_migration_hints` — likely pipeline + deprecation hints
2. `list_render_pipelines` — URP/HDRP assets and volumes
3. `list_materials` / `list_shaders` / `list_shader_graphs` — conversion surface area
4. `unity-urp-hdrp-render-audit` skill — deep SRP inventory

## Checklist

- If likely **birp**, plan Render Pipeline Converter (Editor) and material/shader conversion time.
- URP Compatibility Mode was **removed** in Unity 6.4 — custom passes need Render Graph.
- Prefer one pipeline per product; dual URP+HDRP packages are a red flag unless intentional.
- Re-bake lighting and verify Shader Graph targets after conversion.

## Related

- `unity-urp-hdrp-render-audit`, `unity-runtime-performance`
