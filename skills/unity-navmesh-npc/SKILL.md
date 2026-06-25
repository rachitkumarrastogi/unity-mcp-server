---
name: unity-navmesh-npc
description: >-
  Use for NavMesh, AI Navigation package, NavMeshAgent, NPC pathfinding,
  off-mesh links, or gameplay AI movement (non-ML).
---
# Unity NavMesh & NPC AI

## Discovery

1. `get_navigation_settings` — agent radius, height, areas from ProjectSettings
2. `get_ai_ml_package_inventory` — `com.unity.ai.navigation` vs legacy built-in
3. `find_ai_related_scripts` — label **NavMesh / AI navigation**
4. `list_prefabs_with_component` with `NavMeshAgent`
5. `get_scene_components_by_type` with `NavMeshAgent` per scene

## Implementation checklist

- Bake NavMesh for each playable scene; store `NavMeshData` assets in version control.
- Tune agent avoidance priority and obstacle carving for crowds.
- Off-mesh links for jumps/doors — grep scenes for `OffMeshLink` usage via script scan.
- Separate **locomotion** (NavMeshAgent) from **decision** (state machine / behavior tree).

## Related tools

- `get_tags_and_layers` — AI layers vs player/environment collision
- `get_layer_collision_matrix` — agent vs projectile layers
