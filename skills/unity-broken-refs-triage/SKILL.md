---
name: unity-broken-refs-triage
description: >-
  Use when prefabs/scenes show Missing Script or pink materials: triage broken
  script and asset GUID references and decide fix order.
---
# Broken references triage

## Discovery

1. `get_broken_script_refs` — Missing Script on prefabs/scenes
2. `get_broken_asset_refs` — any missing GUID refs (mats, controllers, …)
3. `find_references` — who still points at a deleted asset GUID/path
4. `get_meta_for_asset` — confirm GUID still exists for survivors

## Fix order

1. Restore or reassign scripts (GUID in `.meta` must match YAML `m_Script`).
2. Fix materials/shaders (`list_materials_using_shader`).
3. Fix Animator/Timeline refs (`list_animator_controllers`, `list_timeline_playables`).
4. Re-run both broken-ref tools until empty.

## Prompts

- *"Which prefabs have missing scripts?"*
- *"List broken asset GUID references"*
