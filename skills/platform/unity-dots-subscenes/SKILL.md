---
name: unity-dots-subscenes
description: >-
  Use for DOTS/ECS packaging: .subscene assets, related packages, and how
  content splits from classic scenes.
---
# DOTS / subscenes

## Discovery

1. `list_subscenes` — `.subscene` assets under Assets
2. `get_feature_set_inference` / `list_packages` — Entities, Netcode, Baking
3. `list_build_scenes` — which classic scenes host subscenes
4. `find_scripts_by_content` — `ISystem`, `IComponentData`, `SubScene`

## Checklist

- Bake in CI or editor; commit/bake artifacts per team policy.
- Keep conversion/baking assemblies Editor-only where appropriate.
- Netcode: ghost prefabs vs subscene static content boundaries clear.

## Related

- `unity-assembly-architecture`, `get_assembly_dependency_graph`
