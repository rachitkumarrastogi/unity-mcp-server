---
name: unity-next-level-shipping
description: >-
  Use to run the next-level shipping pass: execution insights (tests, Editor.log,
  build reports), Unity AI native, and deep per-domain audits. Start here for
  "are we actually shippable?"
---
# Unity next-level shipping

## One-shot (in order)

1. `get_test_results_summary` — failing tests first; nothing else matters if red.
2. `get_editor_log_errors` — compile/runtime blockers from the local Editor.log.
3. `get_build_report_summary` — size + errors from the newest saved report.
4. `get_unity_ai_stack` + `get_llm_runtime_inventory` — platform AI + in-game LLM risks.
5. `get_release_readiness` — classic gate (version, scenes, broken refs, cycles, large assets).

## Deep dive

| Step | Tool | Why |
|------|------|-----|
| 1 | `list_test_result_files` | Confirm XML exists; if empty, wire `-testResults` output |
| 2 | `get_test_results_summary` | Failing test names → fix before perf work |
| 3 | `get_editor_log_errors` | Compile errors (CS codes), NREs, build failures |
| 4 | `list_build_reports` / `get_build_report_summary` | Real size breakdown vs `get_build_size_estimate` heuristic |
| 5 | `get_addressables_duplicates` | Same GUID in 2+ groups = double download |
| 6 | `get_shader_variant_risk` | `multi_compile` sprawl + top shaders by material count |
| 7 | `get_texture_import_heaviness` | 2048+ caps, Read/Write, missing mipmaps, Crunch |
| 8 | `get_audio_loudness_risk` | PCM vs Vorbis, streaming for music-length clips |
| 9 | `get_input_conflicts` | Same binding driving 2 actions in one map |
| 10 | `get_xr_origin_validation` | Missing XROrigin / InteractionManager |
| 11 | `scan_netcode_rpc` | Ownership defaults, unreliable for movement |
| 12 | `get_navmesh_bake_state` | Unbaked or stale NavMesh after static changes |
| 13 | `get_lod_occlusion_coverage` | No LODs = full-poly at distance; no occlusion = overdraw |
| 14 | `get_timeline_balance` | Unbound directors, missing Signal handlers |
| 15 | `get_unused_assets_estimate` | Addressables/Resources cleanup candidates (never auto-delete) |
| 16 | `get_unity_ai_stack` | Muse/Assistant/Inference/Building Blocks gaps |
| 17 | `list_inference_models` | On-device weights shipping in build |
| 18 | `get_llm_runtime_inventory` | Key handling, streaming, timeouts (no secrets read) |
| 19 | `get_bridge_status` | Only if Editor is open: opt-in live `/hierarchy`, `/console` |

## Report template

```markdown
## Shipping pass
- Tests: P/F/S + failing names
- Editor.log: kinds + top errors
- Build report: size, top assets, errors
- Duplicates: N GUIDs in 2+ groups
- Shader variants: N pragmas, top shader GUID
- Textures: N heavy, N readable, N no-mipmap
- Audio: PCM/Vorbis split, streaming count
- Input conflicts: N
- XR/Netcode/NavMesh/LOD: blockers or clean
- AI: platform gaps, model weight, LLM risks
- Unused estimate: N candidates (verify via find_references)
- Verdict: ship / ship-with-fixes / blocked + owner per item
```
