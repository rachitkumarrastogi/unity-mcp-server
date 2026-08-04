---
name: unity-model-agnostic-inference
description: >-
  Use for on-device or server inference that is not tied to one vendor model:
  ONNX Runtime, Sentis, Barracuda legacy, custom .onnx/.tflite/.pb assets,
  and swapping models without rewriting gameplay code.
---
# Model-agnostic inference

Vendor models change fast (OpenAI, Gemini, Claude, local GGUF, etc.). For **in-Unity inference**, keep the **runtime + tensor I/O** stable and treat the **weights file** as a swappable asset.

## Discovery (any backend)

1. `get_ai_stack_summary` — packages + model files + script labels
2. `list_ml_model_assets` — `.onnx`, `.nn`, `.tflite`, `.pb`, `.pt`
3. `get_ai_ml_package_inventory` — Sentis / Barracuda / ML-Agents / Muse
4. `find_ai_related_scripts` — labels for Sentis, Barracuda, ONNX, LLM strings
5. `list_ai_prompt_or_config_assets` — prompts/configs (no secrets)

## Architecture checklist (model-agnostic)

- **Interface**: `IInferencer` / `Run(input) -> output` — hide Sentis vs ORT vs HTTP LLM behind one API.
- **Asset**: store only model **files + metadata** (input names, shapes, labels JSON); not hard-coded vendor SDKs in gameplay.
- **Pre/post**: normalize tensors once; keep tokenization/image resize outside the model wrapper.
- **Swap**: change Addressables model key or ScriptableObject reference — no scene rewrite.
- **Cloud LLMs**: never call vendors from the client with long-lived keys; proxy via your backend (see `unity-llm-integration`).

## When to use which skill

| Need | Skill |
|------|--------|
| Inventory everything AI | `unity-ai-audit` |
| Unity Sentis specifically | `unity-sentis-inference` |
| ML-Agents RL | `unity-ml-agents` |
| Chat/RAG / HTTP LLMs | `unity-llm-integration` |
| This skill | Swappable local models + clean boundaries |

## Prompts

- *"List all ML model files and which packages can run them"*
- *"How do we keep inference model-agnostic in this project?"*
