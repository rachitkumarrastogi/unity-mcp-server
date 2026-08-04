---
name: unity-prefab-architecture
description: >-
  Use to understand prefab structure: variants, dependencies, components,
  scripts, and impact analysis before refactors.
---
# Prefab architecture

## Discovery

1. `list_prefabs` / `list_prefab_variants`
2. `get_prefab_summary` — root name, component types
3. `get_prefab_script_guids` + `get_script_public_api`
4. `get_prefab_dependencies` — outbound asset refs
5. `list_prefabs_with_component` — e.g. Animator, Rigidbody, NetworkIdentity

## Checklist

- Prefer variants over copy-paste prefab trees.
- Keep nested prefabs shallow; document override intent.
- Before deleting an asset, `find_references` + `get_prefab_dependencies`.
- Missing scripts → `unity-broken-refs-triage` skill.

## Prompts

- *"Summarize Player.prefab and its dependencies"*
- *"Which prefabs use Animator?"*
