---
name: unity-input-system-setup
description: >-
  Use for Unity Input: legacy InputManager axes and New Input System
  .inputactions action maps, bindings, and player controls.
---
# Input System setup

## Discovery

1. `get_input_axes` — legacy axes in InputManager
2. `list_input_action_assets` — `.inputed` assets
3. `get_input_actions_summary` — maps/actions for one asset
4. `list_packages` — `com.unity.inputsystem` present?
5. `find_scripts_by_content` — `PlayerInput`, `InputAction`

## Checklist

- Prefer one paradigm (new Input System) for new projects.
- Document Active Input Handling in Player Settings (`get_player_settings`).
- Keep UI Toolkit / EventSystem input modules consistent with that choice.
- Rebindable actions: store overrides outside StreamingAssets carefully.

## Related

- `get_tags_and_layers`, `list_ui_documents`
