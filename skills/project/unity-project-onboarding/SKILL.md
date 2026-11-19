---
name: unity-project-onboarding
description: >-
  Use for first-look onboarding to an unfamiliar Unity project: stats,
  layout, build list, docs, and where the code lives.
  Start here for "what is this project?"
---
# Project onboarding

## One-shot (in order)

1. `get_project_stats` — scripts, prefabs, scenes, materials, assemblies, packages
2. `get_project_info` + `list_build_scenes` — version, build order, player name
3. `get_asset_folder_tree` — layout under Assets
4. `get_repo_docs` + `read_agent_docs` — README, conventions, AGENT.md
5. `list_packages` + `get_package_dependency_graph` — stack and weight

## Deep dive

| Step | Tool | Why |
|------|------|-----|
| Assemblies | `list_assemblies` / `get_assembly_dependency_graph` | Code ownership |
| Entry scenes | `get_scene_summary` on first build scene | Player entry point |
| Key prefabs | `list_prefabs` | Reusable content |
| CI / VCS | `list_ci_configs`, `get_git_lfs_tracked` | How it ships |
| Release gate | `get_release_readiness` | Current health |

## Report template

```markdown
## Onboarding
- What it is: ... (version, scenes, stack)
- Layout: ... (folders, assemblies)
- Entry points: ... (first scene, key prefabs)
- Docs/conventions: ...
- Health: ... (release readiness verdict)
```
