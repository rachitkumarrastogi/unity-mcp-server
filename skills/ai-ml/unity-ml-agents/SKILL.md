---
name: unity-ml-agents
description: >-
  Use when working on Unity ML-Agents: training configs, BehaviorParameters,
  sensors, actuators, inference in builds, or com.unity.ml-agents packages.
---
# Unity ML-Agents

## Discovery (unity-mcp-server)

1. `get_ai_stack_summary` — packages, ONNX assets, script hits, training YAMLs
2. `get_ai_ml_package_inventory` — confirm `com.unity.ml-agents` version
3. `list_ml_agents_training_configs` — trainer YAML paths
4. `find_ai_related_scripts` — filter label **ML-Agents**

## Implementation checklist

- **Training**: YAML defines `behaviors`, `trainer_type`, hyperparameters; keep configs in repo root or `config/`.
- **Inference**: Prefabs/scenes need `BehaviorParameters` + trained `.onnx` in `Model` field; verify with `list_prefabs_with_component` for `BehaviorParameters` if serialized as component name.
- **Sensors/Observations**: Stack vector observations consistently between training and runtime.
- **Performance**: Prefer inference on worker thread; cap decision frequency for mobile.

## Common prompts

- *"Does this project use ML-Agents?"*
- *"List ML-Agents training configs and ONNX models"*
- *"Which scripts reference BehaviorParameters?"*
