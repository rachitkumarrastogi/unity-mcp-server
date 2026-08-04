---
name: unity-build-profiles
description: >-
  Use for Unity 6 Build Profiles: per-profile scenes, scripting defines, and
  Player/Quality overrides instead of a single classic build settings list.
---
# Build Profiles (Unity 6+)

## Discovery

1. `list_build_profiles` — BuildProfile assets under Assets / ProjectSettings
2. `list_build_scenes` — classic EditorBuildSettings (fallback / shared list)
3. `get_scripting_defines` — global + asmdef defines
4. `get_platform_build_hints` — platform PlayerSettings snippets

## Checklist

- Each shippable configuration (dev, staging, store, dedicated server) should be a **named Build Profile**.
- Prefer profile-scoped scene lists and scripting defines over editing one global list by hand.
- Document which profile CI uses (`-activeBuildProfile` / batchmode args).
- If `list_build_profiles` is empty, the project may still be on classic build settings — migrate deliberately.

## Related

- `unity-release-readiness`, `unity-ci-github-actions`, `unity-platform-player-settings`
