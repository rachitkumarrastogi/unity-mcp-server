---
name: unity-ui-toolkit-tmp
description: >-
  Use for UI Toolkit (UXML/USS) and TextMeshPro: documents, fonts, TMP settings,
  and UI-related assets.
---
# UI Toolkit & TextMeshPro

## Discovery

1. `list_ui_documents` — `.uxml` / `.uss`
2. `list_tmp_fonts` / `get_tmp_settings_path`
3. `list_legacy_font_assets` — migration leftovers
4. `find_scripts_by_content` — `UIDocument`, `TextMeshPro`
5. `get_input_actions_summary` — UI action maps if using Input System

## Checklist

- Prefer UI Toolkit for editor-like / runtime panels; TMP for rich text in world/canvas hybrids as needed.
- One TMP Settings asset; shared font assets to cut duplicates.
- Theme via USS variables; avoid one-off inline styles at scale.
- Remove legacy `.ttf` UI fonts once migrated.

## Related

- `unity-input-system-setup`, `list_prefabs_with_component`
