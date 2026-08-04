---
name: unity-ai-audit
description: >-
  Use to audit a Unity project's AI/ML stack: packages, models, scripts,
  configs, and release risks. Start here for "what AI does this game use?"
---
# Unity AI stack audit

## One-shot

Run `get_ai_stack_summary` with `include_prompt_assets: true`.

## Deep dive order

| Step | Tool | Why |
|------|------|-----|
| 1 | `get_ai_ml_package_inventory` | Official Unity AI packages & versions |
| 2 | `list_ml_model_assets` | ONNX and other models in repo |
| 3 | `list_ml_agents_training_configs` | RL training YAMLs |
| 4 | `find_ai_related_scripts` | Code-level AI APIs |
| 5 | `list_ai_prompt_or_config_assets` | Prompt/RAG JSON or docs |
| 6 | `get_build_size_estimate` | Model weight in shipping build |
| 7 | `get_release_readiness` | Broken refs + cycles + large assets |

## Bundled skills

Call `list_ai_skills` then `read_ai_skill` for focused workflows.

### AI / ML
- `unity-ml-agents`
- `unity-sentis-inference`
- `unity-navmesh-npc`
- `unity-llm-integration`

### Shipping / eng
- `unity-release-readiness`
- `unity-build-size-optimization`
- `unity-broken-refs-triage`
- `unity-addressables-shipping`
- `unity-prefab-architecture`
- `unity-input-system-setup`
- `unity-ci-github-actions`
- `unity-assembly-architecture`

### Content / QA
- `unity-urp-hdrp-render-audit`
- `unity-animation-controller-audit`
- `unity-2d-tilemap-sprites`
- `unity-ui-toolkit-tmp`
- `unity-audio-mixer-fmod-wwise`
- `unity-qa-scene-coverage`

### Platforms / integrations
- `unity-playfab-backend`
- `unity-firebase-mobile`
- `unity-steam-discord-presence`
- `unity-ads-analytics-crash`
- `unity-dots-subscenes`
- `unity-xr-vr-audit`

## Report template

```markdown
## AI stack summary
- Packages: ...
- Models: N ONNX, ...
- Scripts: N files (top labels: ...)
```
