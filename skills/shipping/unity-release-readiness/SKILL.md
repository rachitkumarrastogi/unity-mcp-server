---
name: unity-release-readiness
description: >-
  Use before shipping a Unity build: version, build scenes, broken refs,
  assembly cycles, large assets, changelog, and package health.
---
# Unity release readiness

## One-shot

1. `get_release_readiness`
2. `get_project_version` + `get_changelog`
3. `list_build_scenes`

## Deep dive

| Step | Tool | Why |
|------|------|-----|
| 1 | `get_broken_script_refs` / `get_broken_asset_refs` | Missing scripts/GUIDs block QA |
| 2 | `detect_assembly_cycles` | Compile-time landmines |
| 3 | `list_large_assets` | Unexpected install/download size |
| 4 | `get_package_dependency_graph` | Accidental heavy packages |
| 5 | `list_ci_configs` | Confirm release pipeline exists |

## Report template

```markdown
## Release readiness
- Version: ...
- Build scenes: N
- Broken script refs: N
- Broken asset refs: N
- Assembly cycles: yes/no
- Largest assets: ...
- Blockers: ...
```
