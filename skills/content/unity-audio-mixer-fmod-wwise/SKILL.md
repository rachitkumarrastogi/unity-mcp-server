---
name: unity-audio-mixer-fmod-wwise
description: >-
  Use for Unity audio clips/mixers and middleware: FMOD banks and Wwise
  soundbanks / project paths.
---
# Audio, FMOD & Wwise

## Discovery

1. `list_audio_clips` / `list_audio_mixers`
2. `get_audio_settings` — DSP buffer, global volume
3. `get_fmod_config` — banks path + bank files
4. `get_wwise_config` — soundbanks / `.wproj`
5. `list_large_assets` — uncompressed WAV often dominate size

## Checklist

- Load type: streaming for music, decompress on load sparingly.
- Mixer groups/snapshots for ducking and pause menus.
- Middleware: keep bank build step in CI; don't commit huge intermediate caches.
- Platform sample rates/compression consistent with quality tiers.

## Related

- `unity-build-size-optimization`
