# How This MCP Server Helps Unity Developers

This document walks through how **unity-mcp-server** fits into your workflow and what the AI can do for you—without opening the Unity Editor.

---

## 1. How it works (30 seconds)

- You use an **MCP-capable IDE** (Cursor, VS Code with an MCP extension, Claude Desktop, Windsurf).
- You point the MCP client at this server and set **`UNITY_PROJECT_PATH`** to your Unity project root.
- The **AI** (in the IDE) can call **101 read-only tools** on that folder: project settings, scenes, prefabs, scripts, assemblies, assets, and more.
- You keep working in code and chat; the AI uses the server to **inspect** the project and give accurate, context-aware answers and suggestions.
- **Unity Editor** is separate: you run it when you need to hit Play, build, or edit in the Editor. The server does not start or control the Editor.

So: **you code and ask questions in the IDE → the server reads the project → the AI uses that data to help you.**

---

## 2. What the AI can do for you (by task)

### “What’s in this project?”

- **One-line overview**  
  AI calls `get_project_info` → Unity version, path, build scene count, product name.  
  Or `get_project_stats` → script count, prefabs, scenes, materials, animations, assemblies, packages.

- **Release readiness**  
  AI calls `get_release_readiness` → version, build scene count, package count, broken script refs, assembly cycles, large assets.  
  Good for: “Can we ship?”, “What’s blocking release?”

- **Project layout**  
  AI uses `get_asset_folder_tree`, `list_packages`, `get_package_dependency_graph`, `list_package_samples` to explain structure and dependencies.

---

### “Where is X?” and “What uses X?”

- **Find by name**  
  You: “Where’s the Player prefab?”  
  AI calls `search_assets_by_name` with a pattern (e.g. `Player` or `*Player*`) → gets paths under Assets (and optionally Packages).  
  Same for scripts, scenes, textures, etc.

- **What references this asset?**  
  You: “What uses this texture / script / prefab?”  
  AI calls `find_references` with the asset path or GUID → list of scenes, prefabs, materials, etc. that reference it.  
  Helps with safe renames, deletions, and impact analysis.

- **Which assembly is this script in?**  
  You: “Which assembly contains `Assets/Scripts/Player/PlayerController.cs`?”  
  AI calls `get_assembly_for_path` → assembly name and asmdef path.  
  Useful for refactors and understanding boundaries.

---

### “What’s in the build?” and “What’s in this scene?”

- **Build content**  
  AI uses `list_build_scenes` → scenes in build order.  
  Plus `get_scene_referenced_assets` per scene to reason about build size and what’s included.

- **Scene structure**  
  You: “What’s in Main.unity?”  
  AI calls `get_scene_summary` → root GameObjects and component count.  
  Then `get_scene_components_by_type` (e.g. Camera, Light) → which objects have those components.  
  Or `get_scene_objects_by_tag` (e.g. tag `Spawn`) → spawn points for level design.

- **Cameras / lights across the whole project**  
  AI calls `get_all_components_by_type` (e.g. Camera or Light) → every scene path + GameObject name.  
  Good for: “Where are all the cameras?”, “Which scenes have lights?”

---

### “Help me with code and assemblies”

- **Find scripts by type or pattern**  
  You: “Find all MonoBehaviours” or “Scripts that use GameManager.”  
  AI uses `find_scripts_by_content` (pattern + optional namespace) and `find_script_references` (type/class name).

- **Assembly health**  
  AI uses `get_assembly_dependency_graph` and `detect_assembly_cycles` → dependency graph and circular refs.  
  Then `get_broken_script_refs` → prefabs/scenes with missing script references.  
  Helps fix compile and reference issues quickly.

- **Script execution order**  
  AI calls `get_script_execution_order` → which scripts run in which order (MonoManager).  
  Useful when debugging “who runs first?”

- **Defines and settings**  
  AI uses `get_scripting_defines`, `get_player_settings`, `get_quality_settings`, etc. to answer questions about platform, quality, and build config.

---

### “Help me with prefabs and assets”

- **Prefabs**  
  AI can:  
  - `list_prefabs` (optionally with path prefix).  
  - `list_prefab_variants` → which prefabs are variants.  
  - `list_prefabs_with_component` (e.g. Animator) → prefabs that have that component.  
  - `get_prefab_script_guids` / `get_prefab_dependencies` for a given prefab → scripts and assets it uses.

- **Textures and sprites**  
  AI uses `list_assets_by_extension` (.png, etc.), `list_sprite_assets`, `list_sprite_atlases`, and `get_texture_meta` (size, PPU, sprite mode) to help with art and optimization.

- **Materials and shaders**  
  AI uses `list_materials`, `list_shaders`, `list_shader_graphs`, `list_vfx_graphs`, `list_render_pipelines` to reason about rendering setup.

- **Large assets**  
  AI calls `list_large_assets` (e.g. over 5 MB) to help with bundle size and what to optimize.

---

### “What’s configured?” (audio, input, physics, etc.)

- **Settings in one place**  
  AI can read:  
  - `get_player_settings`, `get_quality_settings`, `get_physics_settings`, `get_graphics_settings`, `get_time_settings`  
  - `get_audio_settings`, `get_navigation_settings`, `get_xr_settings`  
  - `get_input_axes`, `list_input_action_assets`, `get_input_actions_summary`  
  - `get_tags_and_layers`, `get_layer_collision_matrix`  
  So you can ask: “What’s the fixed timestep?”, “What input axes exist?”, “What tags and layers do we have?”

---

### “Docs and conventions”

- **Repo and agent docs**  
  AI uses `get_repo_docs` (README, CONTRIBUTING, .cursorrules, etc.) and `read_agent_docs` (.agents/AGENT.md, REPO_UNDERSTANDING.md) to follow your conventions and answer questions about the repo.

- **Changelog and version**  
  AI uses `get_changelog` and `get_project_version` for release and version questions.

---

## 3. Example conversations (what you say → what the AI does)

| You say | AI typically uses |
|--------|---------------------|
| “What Unity version is this project?” | `get_project_info` or `get_player_settings` |
| “List scenes in the build.” | `list_build_scenes` |
| “Find everything named ‘Player’.” | `search_assets_by_name` |
| “What references Assets/Textures/Logo.png?” | `find_references` |
| “Which assembly is PlayerController.cs in?” | `get_assembly_for_path` |
| “Do we have assembly cycles?” | `detect_assembly_cycles` or `get_release_readiness` |
| “Which prefabs have an Animator?” | `list_prefabs_with_component` |
| “Where are all the cameras in the project?” | `get_all_components_by_type` (Camera) |
| “What spawn points are in Level01.unity?” | `get_scene_objects_by_tag` (tag e.g. Spawn) |
| “What’s the texture size of our main icon?” | `get_texture_meta` |
| “Are we ready to ship? Any broken refs?” | `get_release_readiness`, `get_broken_script_refs` |

---

## 4. What the server does *not* do

- **Does not run or control the Unity Editor** — You open Unity and run scenes/builds yourself.
- **Does not create or edit assets** — It only reads. The AI suggests changes; you (or the Editor) apply them.
- **Does not execute builds** — It can read build settings and scene lists, not run `Unity -batchMode -build`.

So: the server makes the AI **informed** about your project; you (and the Editor) remain in charge of **running and changing** it.

---

## 5. Quick setup reminder

1. Install the server (clone + `npm install` + `npm run build`), or use it via your MCP client’s config.
2. In your MCP client config, set **`UNITY_PROJECT_PATH`** to your Unity project root (e.g. `/Users/you/MyGame`).
3. In the IDE, ask questions or give tasks; the AI will call the right tools under the hood.

Once that’s set, you can use natural language (“where is X?”, “what uses Y?”, “are we ready to ship?”) and get answers based on real project data.
