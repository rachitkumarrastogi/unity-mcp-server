---
name: unity-ai-native
description: >-
  Use for Unity's AI platform: Muse/Assistant packages, Inference Engine
  runtime, Building Blocks samples, and in-game LLM call patterns.
---
# Unity AI native

## One-shot

1. `get_unity_ai_stack`
2. `list_inference_models`
3. `get_llm_runtime_inventory`

## Deep dive

| Step | Tool | Why |
|------|------|-----|
| 1 | `get_unity_ai_stack` | Muse/Assistant/Inference packages + AI ProjectSettings |
| 2 | `list_building_blocks` | Unity 6.3 LTS samples for gameplay scaffolding |
| 3 | `list_inference_models` | `.onnx`/`.nn`/`.sentis`/`.bytes` weights shipping in build |
| 4 | `get_llm_runtime_inventory` | HTTP/SSE/WebSocket, key handling, chat memory, retry |
| 5 | `list_ml_model_assets` | Legacy model extensions (`.pt`, `.tflite`, `.pb`) |
| 6 | `find_ai_related_scripts` | Sentis/ML-Agents/NavMesh/ONNX code hits |
| 7 | `get_build_size_estimate` | Model weight inside shipping size |

## Rules

- Never print secret values. This toolset reports code *patterns* only (e.g. "API-key handling found"), never key contents.
- Keys belong in env/remote config — flag hardcoded or PlayerPrefs keys as blockers.
- Streaming needs cancellation + timeouts, especially on mobile networks.
- Prefer on-device inference (Sentis/Inference Engine) for latency-sensitive NPC/vision; reserve HTTP LLMs for async/creative tasks.

## Report template

```markdown
## Unity AI native
- Platform: Muse/Assistant/Inference packages (versions)
- Building Blocks: present/absent
- Models: counts by extension + bytes markers
- LLM runtime: HTTP/SSE/WS hits, key handling, streaming, retry
- Risks: ...
```
