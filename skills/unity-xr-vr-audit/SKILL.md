---
name: unity-xr-vr-audit
description: >-
  Use to audit XR/VR setup: XR settings assets, related packages, scenes, and
  input/action assets for headsets.
---
# XR / VR audit

## Discovery

1. `get_xr_settings` — XR project settings assets
2. `list_packages` / `get_feature_set_inference` — XR Interaction, OpenXR, provider packages
3. `list_input_action_assets` + `get_input_actions_summary` — XR controllers
4. `list_build_scenes` — XR rigs in shipping scenes
5. `list_prefabs_with_component` — common XR origin / interactor names via script search

## Checklist

- Single XR loader stack per platform (OpenXR preferred when possible).
- Performance: target frame time, foveation, pass-through costs.
- Interaction: teleport vs continuous locomotion documented.

## Related

- `unity-input-system-setup`, `unity-qa-scene-coverage`
