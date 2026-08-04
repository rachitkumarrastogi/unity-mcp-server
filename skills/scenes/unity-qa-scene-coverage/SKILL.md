---
name: unity-qa-scene-coverage
description: >-
  Use for QA scene coverage: build scenes, tags, components, prefabs, test
  assemblies, and release blockers.
---
# QA scene coverage

## Discovery

1. `list_build_scenes` vs `list_all_scenes` — what's shipping
2. `get_scene_summary` / `get_scene_hierarchy_flat` per build scene
3. `get_scene_objects_by_tag` — Spawn, Player, Checkpoint, …
4. `get_all_components_by_type` — cameras, lights, audio listeners
5. `list_test_assemblies` + `get_release_readiness`

## Checklist

- Every build scene has exactly one AudioListener / main Camera strategy.
- Critical tags exist (`get_tags_and_layers`).
- Smoke: missing scripts zero (`get_broken_script_refs`).
- Input/actions covered (`list_input_action_assets`).

## Prompts

- *"Which scenes are in the build and what's tagged Spawn?"*
- *"List test assemblies and release readiness"*
