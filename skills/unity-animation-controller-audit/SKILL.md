---
name: unity-animation-controller-audit
description: >-
  Use for Animator Controllers: states, transitions, clips, avatar masks,
  override controllers, and Timeline playables.
---
# Animation controller audit

## Discovery

1. `list_animator_controllers` / `list_animation_clips`
2. `get_animator_states` / `get_animator_transitions`
3. `list_avatar_masks` / `list_animator_override_controllers`
4. `list_timeline_playables`
5. `list_prefabs_with_component` — `Animator`

## Checklist

- Avoid any-state spam; prefer explicit transitions.
- Blend trees: document parameters; cap motion set size.
- Override controllers for character skins, not full duplicates.
- Timeline: keep playables referenced by Addressables if optional cinematics.

## Prompts

- *"List states and transitions in Player.controller"*
- *"Which prefabs have an Animator?"*
