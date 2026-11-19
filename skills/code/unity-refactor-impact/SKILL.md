---
name: unity-refactor-impact
description: >-
  Use before renaming, moving, or deleting C# types, scripts, prefabs, or
  assets: find references, dependents, and assembly cycles first.
---
# Refactor impact analysis

## One-shot

1. `find_script_references` — C# files referencing the type/class name
2. `find_references` — assets referencing the path or GUID
3. `get_prefab_dependencies` / `get_scene_referenced_assets` — downstream assets
4. `detect_assembly_cycles` — cycles that block safe moves

## Deep dive

| Step | Tool | Why |
|------|------|-----|
| Who depends on this assembly | `list_asmdef_references` | Reverse dependents |
| Owning assembly | `get_assembly_for_path` | Move target asmdef |
| Public API surface | `get_script_public_api` | What callers actually use |
| Prefab script GUIDs | `get_prefab_script_guids` | GUID churn risk on move |
| Broken refs after move | `get_broken_script_refs` / `get_broken_asset_refs` | Verify clean |

## Checklist

- Move via GUID-preserving operations; never hand-edit `.meta` GUIDs.
- Update asmdef references before moving cross-assembly scripts.
- Re-run `get_release_readiness` after the change.

## Report template

```markdown
## Refactor impact
- Type/asset: ...
- C# referrers: N files
- Asset referrers: N assets
- Assembly: ... (cycles: yes/no)
- Risk: low/medium/high + owner
```
