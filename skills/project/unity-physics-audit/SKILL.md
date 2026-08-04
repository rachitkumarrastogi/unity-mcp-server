---
name: unity-physics-audit
description: >-
  Use to audit Unity physics: classic 3D/2D modules, Unity Physics (ECS), and
  Physics Core 2D (Unity 6.3–6.5).
---
# Physics audit

## Discovery

1. `get_physics_stack` — packages, module hints, script labels
2. `get_physics_settings` — DynamicsManager / Physics2D settings
3. `get_layer_collision_matrix` — layer collision matrix
4. `list_packages` — `com.unity.physics`, Havok, U2D Physics

## Checklist

- Know which backend ships: classic PhysX / Box2D vs Unity Physics vs Physics Core 2D.
- Unity 6.4+ allows **disabling** built-in physics modules to shrink builds — only if unused.
- Physics Core 2D was renamed from LowLevelPhysics2D (`Unity.U2D.Physics`) in 6.5.
- For ECS projects, confirm baking/authoring components and no accidental dual simulation.

## Related

- `unity-dots-subscenes`, `unity-2d-tilemap-sprites`, `unity-build-size-optimization`
