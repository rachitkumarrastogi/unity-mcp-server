---
name: unity-ci-github-actions
description: >-
  Use to inspect Unity CI: GitHub Actions workflows, Jenkins, Unity Cloud Build,
  Git LFS, and Plastic SCM project config.
---
# Unity CI & version control

## Discovery

1. `list_ci_configs` — workflows / Jenkinsfile / cloud build JSON
2. `get_git_lfs_tracked` — LFS patterns from `.gitattributes`
3. `get_plastic_config` — Plastic workspace if used
4. `get_version_control_settings` — Force Text / meta visibility
5. `get_release_readiness` — gate merges on health

## Checklist

- Track `.meta` files; match `Visible Meta Files`.
- LFS for large binaries (textures, audio, models).
- Cache Library carefully; never commit Library/.
- License activation secrets stay in CI vaults, not the repo.

## Prompts

- *"What CI workflows exist?"*
- *"Which paths are Git LFS?"*
