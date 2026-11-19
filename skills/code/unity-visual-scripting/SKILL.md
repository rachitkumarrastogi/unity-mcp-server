---
name: unity-visual-scripting
description: >-
  Use for Bolt / Unity Visual Scripting assets: discovery, package presence,
  and related C# / assembly checks.
---
# Visual Scripting

## Discovery

1. `list_visual_scripting_assets` — `.asset` files in Ludiq / `com.unity.visualscripting`
2. `list_packages` — confirm `com.unity.visualscripting` installed
3. `find_scripts_by_content` — custom nodes (`Unit`, `EventUnit`, `CodeBase`)
4. `list_editor_scripts` — custom inspectors / node editors

## Checklist

- Prefer one paradigm per system (Visual Scripting vs C#) to keep ownership clear.
- Custom C# nodes live in runtime assemblies, editors in Editor-only asmdefs.
- Large graphs: check `get_script_public_api` on backing types for public API drift.

## Related

- `unity-assembly-architecture`, `unity-scenes-workflow`
