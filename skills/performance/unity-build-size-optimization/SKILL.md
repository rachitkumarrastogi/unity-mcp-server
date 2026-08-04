---
name: unity-build-size-optimization
description: >-
  Use to shrink player/install size: estimate build weight, find large assets,
  textures, Addressables, and unused or oversized content.
---
# Unity build size optimization

## Discovery

1. `get_build_size_estimate` — weight implied by build scenes
2. `list_large_assets` — files over N MB (default 5)
3. `get_texture_meta` — maxSize / compression hints per texture
4. `get_addressables_info` — whether content is remote vs local
5. `list_ml_model_assets` — ONNX/weights often dominate size

## Checklist

- Cap texture `maxTextureSize`; prefer ASTC/ETC2 on mobile.
- Move DLC/optional content to Addressables remote groups.
- Drop unused scenes from `EditorBuildSettings`.
- Compress audio; streaming for long music.
- Keep ML models out of the main Data folder when possible.

## Related

- `list_build_scenes`, `get_scene_referenced_assets`, `list_video_clips`
