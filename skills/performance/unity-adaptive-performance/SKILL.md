---
name: unity-adaptive-performance
description: >-
  Use for Adaptive Performance and Project Auditor: thermal/bottleneck scalers
  and static project health (Unity 6.4–6.5 optimization story).
---
# Adaptive Performance & Project Auditor

## Discovery

1. `get_optimization_package_inventory` — AP + Auditor packages/assets/scripts
2. `get_quality_settings` / `get_graphics_settings` — scaler targets
3. `unity-runtime-performance` skill — static FPS/GPU proxies
4. `get_platform_build_hints` — mobile/console thermal-relevant platforms

## Checklist

- Adaptive Performance needs a **provider** (device/simulator/Apple/Basic) for the target platform.
- Custom scalers should live in scaler profiles — verify assets exist under Assets.
- Project Auditor (Editor-integrated in 6.4+) finds obsolete APIs between Unity versions — run before upgrades.
- Pair with Addressables/build-size skills; AP does not fix oversized downloads.

## Related

- `unity-runtime-performance`, `unity-memory-asset-pressure`, `unity-build-size-optimization`
