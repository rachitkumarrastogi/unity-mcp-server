/**
 * Catalog of all tools for search_tools. Update when adding new tools.
 */
export interface ToolEntry {
  name: string;
  description: string;
  category: string;
}

export const TOOLS_CATALOG: ToolEntry[] = [
  { name: "get_project_info", description: "Path, Unity version, build scene count, player/product name", category: "Project & build" },
  { name: "list_build_scenes", description: "Scenes in EditorBuildSettings (build order)", category: "Project & build" },
  { name: "get_player_settings", description: "Product name, company, bundle ID, version", category: "Project & build" },
  { name: "list_packages", description: "Packages from manifest.json", category: "Project & build" },
  { name: "get_quality_settings", description: "Quality levels", category: "Project & build" },
  { name: "get_scripting_defines", description: "Global and per-assembly defines", category: "Project & build" },
  { name: "get_physics_settings", description: "Physics / Physics2D settings", category: "Project & build" },
  { name: "get_graphics_settings", description: "Graphics settings (GraphicsSettings.asset)", category: "Project & build" },
  { name: "get_time_settings", description: "Time / fixed timestep (TimeManager.asset)", category: "Project & build" },
  { name: "get_build_target_info", description: "Active build target / platform", category: "Project & build" },
  { name: "get_feature_set_inference", description: "Infer Unity 6 feature sets from packages (2D, ECS, AR, etc.)", category: "Project & build" },
  { name: "get_project_version", description: "Bundle version", category: "Project & build" },
  { name: "get_changelog", description: "CHANGELOG contents", category: "Project & build" },
  { name: "get_audio_settings", description: "AudioManager.asset (global volume, reverb, DSP buffer)", category: "Project & build" },
  { name: "get_navigation_settings", description: "NavMesh/agent settings from ProjectSettings", category: "Project & build" },
  { name: "get_xr_settings", description: "XR/VR project settings", category: "Project & build" },
  { name: "get_script_execution_order", description: "Script execution order (MonoManager)", category: "Project & build" },
  { name: "get_version_control_settings", description: "Serialization mode, visible meta files", category: "Project & build" },
  { name: "get_layer_collision_matrix", description: "Layer collision matrix and layer names", category: "Project & build" },
  { name: "get_cloud_services_config", description: "Unity Cloud / Unity Connect config", category: "Project & build" },
  { name: "get_package_dependency_graph", description: "Package dependency graph (manifest + lock)", category: "Project & build" },
  { name: "list_package_samples", description: "Samples folders under Packages", category: "Project & build" },
  { name: "list_unity_hub_projects", description: "List Unity projects from Unity Hub (projects-v1.json)", category: "Project & build" },
  { name: "list_assemblies", description: "Assembly definitions with references, platforms", category: "Code & assemblies" },
  { name: "get_assembly_for_path", description: "Assembly that contains a given script or folder path", category: "Code & assemblies" },
  { name: "list_scripts_by_assembly", description: "C# script paths in a given assembly (by name or asmdef path)", category: "Code & assemblies" },
  { name: "list_asmdef_references", description: "Assembly names that reference a given assembly (reverse deps)", category: "Code & assemblies" },
  { name: "list_scripts", description: "C# scripts (optional folder filter)", category: "Code & assemblies" },
  { name: "find_scripts_by_content", description: "By type/pattern (e.g. MonoBehaviour)", category: "Code & assemblies" },
  { name: "get_assembly_dependency_graph", description: "Nodes and edges", category: "Code & assemblies" },
  { name: "list_editor_scripts", description: "Scripts in Editor folders", category: "Code & assemblies" },
  { name: "list_visual_scripting_assets", description: "Bolt / Unity Visual Scripting .asset files", category: "Code & assemblies" },
  { name: "get_script_public_api", description: "Parse C# script: class name, base type, public methods/fields", category: "Code & assemblies" },
  { name: "list_all_scenes", description: "All .unity files under Assets", category: "Scenes & prefabs" },
  { name: "get_scene_summary", description: "Root GameObjects, component count", category: "Scenes & prefabs" },
  { name: "get_scene_components_by_type", description: "GameObjects in a scene with a component type (e.g. Camera, Light)", category: "Scenes & prefabs" },
  { name: "get_scene_objects_by_tag", description: "GameObjects in a scene with a given tag (e.g. Spawn)", category: "Scenes & prefabs" },
  { name: "get_all_components_by_type", description: "All Cameras/Lights/etc. across all scenes", category: "Scenes & prefabs" },
  { name: "get_scene_hierarchy_flat", description: "Flat list of GameObjects in a scene (name and layer)", category: "Scenes & prefabs" },
  { name: "get_lighting_scene_info", description: "Lighting assets and GI workflow mode for a scene", category: "Scenes & prefabs" },
  { name: "list_prefabs", description: "Prefabs (optional path prefix)", category: "Scenes & prefabs" },
  { name: "list_prefab_variants", description: "Prefabs that are variants of another prefab", category: "Scenes & prefabs" },
  { name: "list_prefabs_with_component", description: "Prefabs that contain a component type (e.g. Animator)", category: "Scenes & prefabs" },
  { name: "get_prefab_summary", description: "Prefab summary: root name, component count, component types", category: "Scenes & prefabs" },
  { name: "get_prefab_script_guids", description: "Script GUIDs used by a prefab", category: "Scenes & prefabs" },
  { name: "list_subscenes", description: "ECS/DOTS .subscene assets", category: "Scenes & prefabs" },
  { name: "get_asset_folder_tree", description: "Folder tree under Assets", category: "Assets & references" },
  { name: "list_assets_by_extension", description: "By extension (e.g. .png, .fbx)", category: "Assets & references" },
  { name: "find_references", description: "Assets referencing a path or GUID", category: "Assets & references" },
  { name: "list_large_assets", description: "Files over N MB (default 5)", category: "Assets & references" },
  { name: "list_video_clips", description: "Video clip assets (.mp4, .mov, .webm, etc.)", category: "Assets & references" },
  { name: "list_legacy_font_assets", description: "Legacy fonts (.fontsettings, .ttf, .otf) — not TMP", category: "Assets & references" },
  { name: "list_render_textures", description: "RenderTexture assets", category: "Assets & references" },
  { name: "list_terrain_data", description: "TerrainData and TerrainLayer assets", category: "Assets & references" },
  { name: "list_lighting_settings_assets", description: "Lighting-related .asset files", category: "Assets & references" },
  { name: "search_assets_by_name", description: "Search Assets (and optionally Packages) by name pattern", category: "Assets & references" },
  { name: "get_texture_meta", description: "Texture .meta (maxSize, dimensions, spriteMode, PPU)", category: "Assets & references" },
  { name: "search_project", description: "Combined search: name pattern, script content pattern, and/or referrers of path", category: "Assets & references" },
  { name: "get_meta_for_asset", description: "Read .meta for any asset path (guid, importer keys)", category: "Assets & references" },
  { name: "get_broken_asset_refs", description: "Prefabs/scenes/materials with any missing GUID reference", category: "Assets & references" },
  { name: "list_scriptable_objects", description: ".asset files that are ScriptableObject instances", category: "Assets & references" },
  { name: "list_materials", description: "Materials (optional folder)", category: "Materials & shaders" },
  { name: "list_materials_using_shader", description: "Materials that use a given shader (GUID or path)", category: "Materials & shaders" },
  { name: "list_shaders", description: ".shader in Assets and Packages", category: "Materials & shaders" },
  { name: "list_shader_graphs", description: "Shader Graph assets", category: "Materials & shaders" },
  { name: "list_vfx_graphs", description: "VFX Graph assets", category: "Materials & shaders" },
  { name: "list_animator_controllers", description: ".controller assets", category: "Animation" },
  { name: "list_animation_clips", description: ".anim assets", category: "Animation" },
  { name: "get_animator_states", description: "State names from a controller", category: "Animation" },
  { name: "get_animator_transitions", description: "State names and from/to transitions from a controller", category: "Animation" },
  { name: "list_timeline_playables", description: "Timeline .playable assets", category: "Animation" },
  { name: "list_avatar_masks", description: "Avatar Mask (.mask) assets", category: "Animation" },
  { name: "list_animator_override_controllers", description: "AnimatorOverrideController assets", category: "Animation" },
  { name: "list_sprite_atlases", description: "Sprite Atlas assets", category: "2D & sprites" },
  { name: "list_tilemap_assets", description: "Tilemap-related assets", category: "2D & sprites" },
  { name: "list_sprite_assets", description: "Textures configured as sprites (spriteMode in .meta)", category: "2D & sprites" },
  { name: "list_render_pipelines", description: "URP/HDRP pipeline assets, volume profiles", category: "Rendering" },
  { name: "list_tmp_fonts", description: "TMP/font assets", category: "TextMeshPro & UI" },
  { name: "get_tmp_settings_path", description: "TMP Settings asset path", category: "TextMeshPro & UI" },
  { name: "list_ui_documents", description: ".uxml and .uss (UI Toolkit)", category: "TextMeshPro & UI" },
  { name: "get_input_axes", description: "InputManager axes", category: "Input" },
  { name: "list_input_action_assets", description: "New Input System .inputactions", category: "Input" },
  { name: "get_input_actions_summary", description: "Action maps and actions from a file", category: "Input" },
  { name: "get_tags_and_layers", description: "Tags and layers from TagManager", category: "Tags & layers" },
  { name: "get_addressables_info", description: "Groups and config path", category: "Addressables & localization" },
  { name: "get_localization_tables", description: "Localization table files", category: "Addressables & localization" },
  { name: "list_audio_clips", description: ".wav, .mp3, .ogg, .aiff", category: "Audio" },
  { name: "list_audio_mixers", description: "Audio Mixer assets", category: "Audio" },
  { name: "list_test_assemblies", description: "Test assembly definitions", category: "Testing & docs" },
  { name: "get_repo_docs", description: "README, CONTRIBUTING, .cursorrules, etc.", category: "Testing & docs" },
  { name: "read_agent_docs", description: ".agents/AGENT.md, optional REPO_UNDERSTANDING.md", category: "Testing & docs" },
  { name: "list_ci_configs", description: ".github/workflows, Jenkinsfile, unity-cloud-build", category: "CI & version control" },
  { name: "list_presets", description: ".preset assets", category: "CI & version control" },
  { name: "get_git_lfs_tracked", description: "LFS patterns from .gitattributes", category: "CI & version control" },
  { name: "get_plastic_config", description: "Plastic SCM config", category: "CI & version control" },
  { name: "get_playfab_config", description: "Title ID, config paths", category: "Integrations" },
  { name: "list_figma_related_assets", description: "Figma folder / named assets", category: "Integrations" },
  { name: "get_firebase_config", description: "GoogleServices path, project ID", category: "Integrations" },
  { name: "get_steam_config", description: "steam_appid.txt, Steamworks path", category: "Integrations" },
  { name: "get_discord_config", description: "Discord SDK path", category: "Integrations" },
  { name: "get_fmod_config", description: "Banks path, bank files", category: "Integrations" },
  { name: "get_wwise_config", description: "Sound banks, project paths", category: "Integrations" },
  { name: "list_substance_assets", description: ".sbsar, .sbs", category: "Integrations" },
  { name: "list_speedtree_assets", description: ".spm, .stm", category: "Integrations" },
  { name: "list_lottie_assets", description: "Lottie JSON assets", category: "Integrations" },
  { name: "get_analytics_or_crash_config", description: "Sentry, Crashlytics, BugSnag, etc.", category: "Integrations" },
  { name: "get_ads_config", description: "Unity Ads, AdMob, ironSource presence", category: "Integrations" },
  { name: "get_project_stats", description: "One-shot stats: scripts, prefabs, scenes, materials, animations, assemblies, packages", category: "Speed & productivity" },
  { name: "get_scene_referenced_assets", description: "Asset paths referenced by a scene (build size / impact)", category: "Speed & productivity" },
  { name: "detect_assembly_cycles", description: "Circular refs in assembly definitions (fix compile errors)", category: "Speed & productivity" },
  { name: "find_script_references", description: "C# files that reference a type/class name (refactoring)", category: "Speed & productivity" },
  { name: "get_broken_script_refs", description: "Prefabs/scenes with missing script refs", category: "Speed & productivity" },
  { name: "get_prefab_dependencies", description: "Asset paths referenced by a prefab (impact analysis)", category: "Speed & productivity" },
  { name: "get_release_readiness", description: "One-shot: version, build scenes, packages, broken refs, cycles, large assets", category: "Speed & productivity" },
  { name: "get_build_size_estimate", description: "Build size estimate: total size and largest assets from build scenes", category: "Speed & productivity" },
  { name: "search_tools", description: "Find the most relevant tools by intent (e.g. find references, missing script). Call with no query to list all tools.", category: "Meta" },
];

export function searchToolsCatalog(query: string | undefined): { category: string; tools: ToolEntry[] }[] {
  const q = query?.trim().toLowerCase();
  let list = TOOLS_CATALOG;
  if (q) {
    list = TOOLS_CATALOG.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );
  }
  const byCategory = new Map<string, ToolEntry[]>();
  for (const t of list) {
    const arr = byCategory.get(t.category) ?? [];
    arr.push(t);
    byCategory.set(t.category, arr);
  }
  return [...byCategory.entries()].map(([category, tools]) => ({ category, tools })).sort((a, b) => a.category.localeCompare(b.category));
}
