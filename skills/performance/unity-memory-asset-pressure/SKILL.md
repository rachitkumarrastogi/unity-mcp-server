---
name: unity-memory-asset-pressure
description: >-
  Use to find memory/disk pressure from assets: large files, textures, audio,
  video, ML models, and Addressables that should be remote.
---
# Memory & asset pressure

## Discovery

1. `list_large_assets` (try 2MB and 5MB thresholds)
2. `get_build_size_estimate` — what build scenes pull in
3. `get_texture_meta` on top offenders
4. `list_audio_clips` / `list_video_clips` / `list_ml_model_assets`
5. `get_addressables_info` — candidates to move remote

## Checklist

- Textures: lower maxSize; crunch/ASTC; no uncompressed UI atlases on mobile.
- Audio: Vorbis/ADPCM; load type streaming for long clips.
- Video: keep out of first scene; stream or Addressables.
- ML models: don't embed large ONNX in boot scene.
- Duplicate fonts/TMP assets (`list_tmp_fonts`, `list_legacy_font_assets`).

## Related

- `unity-runtime-performance`, `unity-build-size-optimization`, `unity-addressables-shipping`
