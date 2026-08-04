---
name: unity-2d-tilemap-sprites
description: >-
  Use for 2D art pipelines: sprite atlases, sprite-mode textures, tilemaps,
  and import settings (PPU, maxSize).
---
# 2D tilemaps & sprites

## Discovery

1. `list_sprite_atlases`
2. `list_sprite_assets` — textures with spriteMode
3. `list_tilemap_assets`
4. `get_texture_meta` — PPU, maxSize, spriteMode
5. `get_feature_set_inference` — 2D feature set packages

## Checklist

- Pack atlases by frequency of co-draw; watch padding/bleeding.
- Consistent PPU across characters/tiles.
- Compress atlases per platform; avoid uncompressed RGBA on mobile.
- Tilemaps: separate collision/decoration layers.

## Related

- `list_materials`, `unity-build-size-optimization`
