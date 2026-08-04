---
name: unity-cinemachine
description: >-
  Use to audit Cinemachine / camera rigs: package presence, virtual cameras,
  and prefab usage (Unity 6 productivity / storytelling stack).
---
# Cinemachine

## Discovery

1. `list_cinemachine_assets` — package + vcam assets/prefabs
2. `list_timeline_playables` — cinematics often drive CM via Timeline
3. `get_feature_set_inference` — Gameplay & Storytelling feature set
4. `find_scripts_by_content` — `CinemachineBrain`, `CinemachineCamera`

## Checklist

- One Brain per main camera; avoid fighting multiple brains.
- Prefer CM 3.x component names if on Unity 6 packages; note legacy VirtualCamera assets.
- Timeline + Impulse + extensions should be version-aligned with the CM package.
- Mobile: watch post-process volume cost on stacked cameras.

## Related

- `unity-animation-controller-audit`, `unity-urp-hdrp-render-audit`
