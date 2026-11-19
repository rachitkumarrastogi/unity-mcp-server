---
name: unity-project-settings-audit
description: >-
  Use to audit ProjectSettings in one pass: quality, graphics, time, audio,
  XR, execution order, version control, layers, and cloud config.
  Start here for "is this project configured sanely?"
---
# Project settings audit

## One-shot

1. `get_quality_settings` + `get_graphics_settings` — tiers and RP assets
2. `get_time_settings` — fixed timestep
3. `get_audio_settings` — global volume, DSP buffer
4. `get_xr_settings` + `get_platform_build_hints` — XR and target platforms
5. `get_script_execution_order` + `get_scripting_defines` — order and defines
6. `get_version_control_settings` + `get_git_lfs_tracked` + `get_plastic_config` — VCS setup
7. `get_tags_and_layers` + `get_layer_collision_matrix` — tags, layers, collisions
8. `get_cloud_services_config` — Unity Cloud / Connect

## Checklist

- Quality tiers match target devices; one default per platform.
- Fixed timestep intentional (50Hz default vs 60Hz gameplay).
- Serialization: `Force Text`, visible meta files on.
- LFS tracks binaries (`*.psd`, `*.fbx`, `*.wav`, …); no giant files in git.
- Execution order minimal — prefer explicit initialization over order hacks.

## Report template

```markdown
## Project settings
- Quality/graphics: ...
- Time/XR/platform: ...
- Execution order/defines: ...
- VCS/LFS: ...
- Tags/layers: ...
- Blockers: ...
```
