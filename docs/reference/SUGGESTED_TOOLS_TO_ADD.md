# Suggested Tools to Add

This document lists **potential new tools** that would help developers, testers, game developers, and designers. All stay **read-only** and **editor-free**. Existing tools are not duplicated here; see [tools-catalog](../../src/tools-catalog.ts) and the [README](../../README.md) for the current 101 tools.

---

## Already implemented (previously suggested)

The following were in earlier gap analyses and are **now implemented**:

- `get_assembly_for_path` — Which assembly contains a script/folder path
- `list_package_samples` — Samples folders under Packages
- `get_texture_meta` — Texture .meta (maxSize, dimensions, spriteMode, PPU)
- `list_prefabs_with_component` — Prefabs that contain a component type
- `get_scene_objects_by_tag` — GameObjects in a scene with a given tag
- `get_all_components_by_type` — All components of a type across all scenes
- `get_release_readiness` — One-shot release health (version, build, broken refs, cycles, large assets)
- `search_assets_by_name` — Search Assets (and optionally Packages) by name pattern
- Plus many project/build and asset tools (audio, navigation, XR, video, terrain, lighting, etc.)

---

## High value (recommended to consider)

| Suggested tool | Primary role(s) | Purpose |
|----------------|------------------|--------|
| **`get_scene_hierarchy_flat`** (or extend `get_scene_summary`) | Game dev, Designer | Return a flat or tree list of all GameObjects in a scene (name, parent path, layer) so the AI can reason about hierarchy without parsing YAML by hand. |
| **`list_scripts_by_assembly`** | Developer | Given an assembly name (or asmdef path), return all C# script paths in that assembly. Complements `get_assembly_for_path`. |
| **`get_prefab_summary`** | Game dev, Designer | For a prefab path: root name, component count, list of component type names (no full YAML). Quick “what’s in this prefab?” without heavy parsing. |
| **`list_materials_using_shader`** | Designer | Given a shader name or GUID, list materials that reference it. “Which materials use this shader?” |
| **`get_animator_transitions`** (or extend `get_animator_states`) | Game dev | State names plus transitions (from/to, conditions) from a .controller. Helps reason about state flow. |

---

## Medium value (nice to have)

| Suggested tool | Primary role(s) | Purpose |
|----------------|------------------|--------|
| **`list_scriptable_objects`** | Developer, Game dev | List .asset files that are ScriptableObject instances (e.g. by detecting script reference in YAML). Common for data-driven design. |
| **`get_build_size_estimate`** (or extend `get_scene_referenced_assets`) | All | Aggregate referenced assets for all build scenes and optionally report total size / largest assets. “What’s driving build size?” |
| **`list_asmdef_references`** | Developer | For an asmdef path, list which other assemblies reference it (reverse of current assembly graph). “Who depends on Assembly-CSharp?” |
| **`get_lighting_scene_info`** | Designer | Per-scene: whether lighting is baked, mixed, or realtime (from scene YAML or LightingSettings). Complements `list_lighting_settings_assets`. |

---

## Lower priority / edge cases

| Suggested tool | Primary role(s) | Purpose |
|----------------|------------------|--------|
| **`list_embedded_fonts_in_tmp`** | Designer | Font assets referenced by TMP Settings or TMP fonts (already have `list_tmp_fonts`; this adds “where is this font used?”). |
| **`get_custom_editor_scripts`** | Developer | List Editor scripts that use `[CustomEditor(...)]` and the type they target. Refactoring and tooling awareness. |
| **`list_addressables_entries`** | Game dev | Per-group or full list of addressable keys and asset paths (if Addressables config is parseable without Unity). Depends on schema. |

---

## Out of scope (intentionally not added)

- **Run Unity Editor / Play / Build** — Server is read-only; no process control.
- **Create or edit assets** — AI suggests; user or Editor applies.
- **“List every .asset”** — Too broad; use `list_assets_by_extension` or existing category-specific tools.
- **Duplicate tools** — e.g. another “list fonts” when we have `list_tmp_fonts` and `list_legacy_font_assets`.

---

## Summary

- **Already implemented:** Previous gap items (assembly for path, package samples, texture meta, prefabs with component, scene objects by tag, all components by type, release readiness, search assets by name) and many project/asset tools.
- **Recommended next:** Scene hierarchy (flat/tree), scripts by assembly, prefab summary, materials by shader, animator transitions.
- **Nice to have:** ScriptableObjects list, build size estimate, asmdef reverse refs, lighting scene info.
- **Lower priority:** TMP font usage, custom editor list, Addressables entries if feasible.

When adding a new tool, update [tools-catalog.ts](../../src/tools-catalog.ts), the [README](../../README.md) tool tables, and [TOOLS_BY_ROLE.md](../guides/TOOLS_BY_ROLE.md) if it fits a specific role.
