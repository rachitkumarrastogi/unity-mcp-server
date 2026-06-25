---
name: unity-sentis-inference
description: >-
  Use when integrating ONNX/Sentis/Unity Inference in Unity: model assets,
  IWorker, runtime performance, or com.unity.sentis packages.
---
# Unity Sentis / ONNX inference

## Discovery

1. `list_ml_model_assets` — `.onnx`, `.nn`, `.pt` under Assets
2. `get_ai_ml_package_inventory` — Sentis, Barracuda, or `com.unity.ai.inference`
3. `find_ai_related_scripts` — labels **Sentis / InferenceEngine** or **ONNX**

## Implementation checklist

- Import ONNX to `ModelAsset`; use `WorkerFactory` / `IWorker` pattern for Sentis 2.x.
- Match input tensor names/shapes to training export metadata.
- Test on target platform (GPU vs CPU backend); mobile often needs quantized models.
- Barracuda is legacy — prefer Sentis for new work unless project is locked to Barracuda.

## Tools for impact analysis

- `find_references` on model asset path — who loads this ONNX?
- `get_prefab_dependencies` — prefabs pulling large models into builds
- `get_build_size_estimate` — ONNX size in player build
