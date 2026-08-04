---
name: unity-scenes-workflow
description: >-
  Use for Unity scene exploration the way developers work in the Editor:
  build list, all scenes, hierarchy, components, lighting, then broken refs.
---
# Unity scenes workflow

Unity developers live in **Scenes**. Use this order — same mental model as File → Build Settings and the Hierarchy.

## 1. What ships

| Step | Tool |
|------|------|
| Build order | `list_build_scenes` |
| Project snapshot | `get_project_info` |

## 2. Inventory

| Step | Tool |
|------|------|
| Every `.unity` under Assets | `list_all_scenes` |
| ECS/DOTS | `list_subscenes` |

## 3. Open a scene (static)

Pick a path from the lists above (e.g. `Assets/Scenes/Main.unity`).

| Step | Tool | Notes |
|------|------|--------|
| Root objects + component density | `get_scene_summary` | Fast overview |
| Flat hierarchy | `get_scene_hierarchy_flat` | Names + layers |
| Find Cameras / Lights / etc. | `get_scene_components_by_type` | Pass type name |
| By tag | `get_scene_objects_by_tag` | e.g. Spawn |
| Lighting / GI | `get_lighting_scene_info` | |

## 4. Cross-scene checks

| Step | Tool |
|------|------|
| All Cameras/Lights project-wide | `get_all_components_by_type` |
| Missing GUIDs in scenes | `get_broken_asset_refs` |
| QA pass over build scenes | Read skill `unity-qa-scene-coverage` |

## 5. Related domains

- Prefabs used in scenes → `unity-prefab-architecture`
- Addressables / remote content → `unity-addressables-shipping`
- Runtime cost proxies → `unity-runtime-performance`

## Out of scope

No live Hierarchy edit, Play Mode, or Scene view — filesystem YAML only.
