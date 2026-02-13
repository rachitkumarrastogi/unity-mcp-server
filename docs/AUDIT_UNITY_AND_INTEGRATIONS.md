# Unity MCP Server – Audit: Day-to-Day Tools & Connected Integrations

This doc lists (1) additional Unity project tools developers use daily that we could add, and (2) connected interfaces (PlayFab, Figma, etc.) and what tooling is feasible.

---

## Part 1: Unity project tools (filesystem-only, no Editor)

### Already implemented (v1.1.0)

Project/build, packages, quality, scripting defines, version, changelog · Assemblies, scripts, find by content · Scenes (all + summary), prefabs · Asset tree, list by extension, find references · Materials, shaders · Animator controllers, clips, states · Audio clips, mixers · Addressables, localization · Input axes, tags & layers · Test assemblies · Repo docs, agent docs.

---

### High value – day-to-day (can add with current approach)

| Area | Tool idea | What it would do |
|------|-----------|-------------------|
| **Physics** | `get_physics_settings` | Read Physics / Physics2D settings (layers, collision matrix, gravity). |
| **Graphics / URP/HDRP** | `list_render_pipelines` | List pipeline assets (.asset under Settings), volume profiles. |
| **Timeline** | `list_timeline_playables` | List .playable assets (Timeline). |
| **Sprites / 2D** | `list_sprite_atlases`, `list_tilemap_assets` | List sprite atlases, tilemap assets. |
| **Shader Graph / VFX** | `list_shader_graphs`, `list_vfx_graphs` | List .shadergraph, .vfx assets. |
| **TextMeshPro** | `list_tmp_fonts`, `get_tmp_settings` | List TMP fonts, read TMP Settings. |
| **UI Toolkit** | `list_ui_documents` | List .uxml, .uss under Assets. |
| **Input System (new)** | `list_input_action_assets` | List .inputactions (JSON) and summarize actions/maps. |
| **Presets** | `list_presets` | List .preset files. |
| **Editor scripts** | `list_editor_scripts` | List scripts under Editor/ (or *Editor*.cs). |
| **Prefab → script refs** | `get_prefab_scripts` | For a prefab, list MonoBehaviour script GUIDs (from YAML). |
| **Assembly graph** | `get_assembly_dependency_graph` | Which asmdef references which (we have list; add “depends on” graph). |
| **CI / build config** | `list_ci_configs` | List GitHub Actions, Jenkinsfile, Unity Cloud Build configs in repo. |
| **Large assets** | `list_large_assets` | List files over N MB under Assets (from filesystem). |
| **Package vulnerabilities** | *(stretch)* | Run `npm audit`-style for Packages (Unity doesn’t expose this the same way; could parse manifest only). |

---

### Medium value – nice to have

| Area | Tool idea | Notes |
|------|-----------|--------|
| **NavMesh** | List NavMesh data | Often in Library/; optional or path-only. |
| **ScriptableObjects** | List .asset by importer type | Possible via .meta; fuzzy. |
| **DOTween / other packages** | `list_animation_packages` | Already covered by `list_packages`; could add “known middleware” filter. |
| **Version control** | `get_vcs_status` | Would need `git`; list modified/untracked (optional). |
| **Layers collision matrix** | `get_physics_layer_collision_matrix` | Parse Physics2DSettings / Physics settings. |

---

## Part 2: Connected interfaces (PlayFab, Figma, etc.)

These are external services or tools that Unity projects often connect to. We list what’s feasible **without** running the Unity Editor and without storing API keys in the MCP server (config discovery only, or optional read-only APIs with user-supplied keys).

### PlayFab (Microsoft)

| What | Feasible tooling |
|------|-------------------|
| **In Unity project** | `get_playfab_config` – Find PlayFab title ID, paths (e.g. from ScriptableObject/config, or common paths like `Resources/PlayFab`, `Plugins/PlayFab`). Read title ID and comment if secret key path is present (do not read secret). |
| **PlayFab API** | Optional separate tool: “list titles”, “get economy config” – would require user to supply API key in env; MCP server calls PlayFab REST API. Prefer keeping server key-agnostic and documenting “use env for key”. |

### Figma

| What | Feasible tooling |
|------|-------------------|
| **In Unity project** | `list_figma_related_assets` – List assets in a folder like `Figma/` or named by convention (e.g. `*_figma*`), or read a manifest if a Figma→Unity plugin writes one. No Figma API in core server (would need Figma token). |
| **Figma API** | Optional: “list Figma files”, “get frame” – needs FIGMA_TOKEN in env; could be a separate MCP server (Figma MCP) that this server doesn’t implement. |

### Analytics & crash reporting

| Service | In-project / tool idea |
|---------|-------------------------|
| **Unity Analytics** | Detect from ProjectSettings or Packages; `get_analytics_config` (project/org IDs if present). |
| **Firebase** | `get_firebase_config` – Read `GoogleServices-Info.plist` / `google-services.json` (project IDs, no secrets). |
| **Sentry / Crashlytics / BugSnag** | `get_crash_reporting_config` – Find DSN or config paths; list which service is used (no keys in output). |

### Ads & monetization

| Service | In-project / tool idea |
|---------|-------------------------|
| **Unity Ads, AdMob, ironSource** | `get_ads_config` – Detect SDK presence (Packages/Assets), list ad network names; do not read app IDs/keys. |
| **Unity IAP, RevenueCat** | `get_iap_config` – Presence of IAP package or RevenueCat config path. |

### Platform SDKs & distribution

| Service | In-project / tool idea |
|---------|-------------------------|
| **Steam / Steamworks** | `get_steam_config` – Find `steam_appid.txt`, Steamworks SDK path, list presence. |
| **Discord** | `get_discord_config` – Detect Discord SDK or Rich Presence config path. |
| **Epic / Consoles** | Usually binary SDKs; `list_platform_plugins` – list known plugin folders (e.g. Xbox, PlayStation) by name. |

### Audio middleware

| Service | In-project / tool idea |
|---------|-------------------------|
| **FMOD** | `get_fmod_config` – Banks path, .bank list, project path from common locations. |
| **Wwise** | `get_wwise_config` – Project path, SoundBanks path if present. |

### Design & art pipelines

| Service | In-project / tool idea |
|---------|-------------------------|
| **Substance** | `list_substance_assets` – List .sbsar, .sbs. |
| **SpeedTree** | `list_speedtree_assets` – List .spm, .stm. |
| **Blender** | No direct config; we already have `list_assets_by_extension` (.fbx, .blend). |
| **Lottie** | `list_lottie_assets` – List .json in Lottie folder or known paths. |

### Version control & CI

| Service | In-project / tool idea |
|---------|-------------------------|
| **Git / Git LFS** | `get_git_lfs_tracked` – List .gitattributes and LFS patterns; optional `get_git_status` (if git in path). |
| **Plastic SCM** | `get_plastic_config` – .plastic folder, workspace name. |
| **GitHub Actions / Jenkins / Unity Cloud** | `list_ci_configs` – List .github/workflows, Jenkinsfile, Unity Cloud config files. |

### Task & collaboration (outside repo)

| Service | Note |
|---------|------|
| **Jira, Trello, Shortcut, Asana** | No standard Unity project files; integration is usually API keys in env or CI. Could document “use env + separate MCP” for those. |
| **Slack / Discord** | Webhooks or bots; not stored in Unity project. |

---

## Part 3: Summary list – “all of them”

**Unity day-to-day (candidates to add)**  
Physics settings · Render pipelines (URP/HDRP) · Timeline playables · Sprite atlases, tilemaps · Shader Graph, VFX Graph · TextMeshPro fonts & settings · UI Toolkit (UXML, USS) · New Input System (.inputactions) · Presets · Editor scripts · Prefab→script refs · Assembly dependency graph · CI configs · Large assets · (Optional) VCS status, layer collision matrix.

**Connected interfaces we can add tooling for (config / discovery only)**  
PlayFab (project config, title ID) · Figma (related assets in project) · Firebase · Unity Analytics · Sentry/Crashlytics/BugSnag (config presence) · Unity Ads / AdMob / ironSource (SDK presence) · Unity IAP / RevenueCat · Steam/Steamworks · Discord · FMOD · Wwise · Substance · SpeedTree · Lottie · Git LFS · Plastic SCM · GitHub Actions / Jenkins / Unity Cloud (list configs).

**Connected interfaces that need API keys (document or separate MCP)**  
PlayFab API · Figma API · Jira/Trello/Shortcut · Slack/Discord (webhooks). Prefer: user supplies keys in env and uses a dedicated MCP for that service, rather than baking into this server.

---

## Recommendation

1. **Phase 1 (Unity-only):** Add the “high value” Unity tools (physics, pipelines, Timeline, 2D, Input System, TMP, UI Docs, presets, editor scripts, prefab scripts, assembly graph, CI configs, large assets).
2. **Phase 2 (connected – discovery only):** Add config/discovery tools for PlayFab, Figma-related assets, Firebase, Steam, FMOD/Wwise, Substance, SpeedTree, Git LFS, Plastic, CI configs. No API keys in server; only read files.
3. **Phase 3 (optional):** Separate MCP servers or optional tools that call external APIs (PlayFab, Figma) with user-supplied env keys; keep this server focused on “Unity project + safe config discovery.”

If you want, next step can be: pick 5–10 of the “high value” + “connected discovery” items and implement them as new tools in this repo.
