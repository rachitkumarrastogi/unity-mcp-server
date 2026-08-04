---
name: unity-platform-player-settings
description: >-
  Use for a Unity 6 platform pass: Android/WebGL/iOS PlayerSettings snippets,
  scripting backends, and platform packages (foldables, Web threads, etc.).
---
# Platform / Player Settings

## Discovery

1. `get_platform_build_hints` — Android/WebGL snippets, build target, hints
2. `get_player_settings` / `get_build_target_info` — identity + active target
3. `list_build_profiles` — per-platform profiles
4. `get_xr_settings` — if XR/mobile XR relevant

## Checklist

- Confirm **min SDK / Web memory / threads** against the Unity version’s platform notes.
- Unity 6.4+ Web can enable Burst multithreading — only if `webGLThreadsSupport` and job safety allow it.
- Android 6.5 notes (foldables, LTO, edge-to-edge) need matching Player/Gradle settings in Editor.
- Dedicated server / headless: separate build profile and stripped packages.

## Related

- `unity-build-profiles`, `unity-xr-vr-audit`, `unity-release-readiness`
