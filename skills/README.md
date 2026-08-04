# Bundled skills

Agent workflow guides for **unity-mcp-server**. Discover at runtime with `list_ai_skills` / `read_ai_skill` (skill **id** = leaf folder name).

## Layout

```text
skills/
  ai-ml/           AI, ML, NavMesh, LLM, model-agnostic inference
  shipping/        Release, refs, Addressables, prefabs, input, CI, assemblies
  content/         Rendering, animation, 2D, UI, audio, QA scenes
  performance/     Runtime triage, build size, memory/asset pressure
  integrations/    PlayFab, Firebase, Steam/Discord, ads/crash
  platform/        DOTS/subscenes, XR
  README.md        This index
```

## By category

### ai-ml
| Id | Focus |
|----|--------|
| `unity-ai-audit` | Full AI/ML inventory |
| `unity-model-agnostic-inference` | Swap models without vendor lock-in |
| `unity-ml-agents` | ML-Agents RL |
| `unity-sentis-inference` | Unity Sentis |
| `unity-navmesh-npc` | NavMesh / NPC AI |
| `unity-llm-integration` | Chat/RAG / HTTP LLMs |

### shipping
| Id | Focus |
|----|--------|
| `unity-release-readiness` | Ship gate |
| `unity-broken-refs-triage` | Missing scripts/GUIDs |
| `unity-addressables-shipping` | Remote/local content |
| `unity-prefab-architecture` | Prefab structure |
| `unity-input-system-setup` | Input |
| `unity-ci-github-actions` | CI / LFS / Plastic |
| `unity-assembly-architecture` | asmdefs / cycles |

### content
| Id | Focus |
|----|--------|
| `unity-urp-hdrp-render-audit` | SRP / shaders / lighting |
| `unity-animation-controller-audit` | Animator / Timeline |
| `unity-2d-tilemap-sprites` | 2D art |
| `unity-ui-toolkit-tmp` | UI Toolkit / TMP |
| `unity-audio-mixer-fmod-wwise` | Audio middleware |
| `unity-qa-scene-coverage` | QA scene pass |

### performance
| Id | Focus |
|----|--------|
| `unity-runtime-performance` | Static FPS/GPU triage proxies |
| `unity-build-size-optimization` | Install / download size |
| `unity-memory-asset-pressure` | Large textures/audio/models |

### integrations
| Id | Focus |
|----|--------|
| `unity-playfab-backend` | PlayFab |
| `unity-firebase-mobile` | Firebase configs |
| `unity-steam-discord-presence` | Steam / Discord |
| `unity-ads-analytics-crash` | Ads + crash SDKs |

### platform
| Id | Focus |
|----|--------|
| `unity-dots-subscenes` | DOTS / ECS |
| `unity-xr-vr-audit` | XR / VR |

## Notes

- Skills are **markdown only**; tools enforce project-root FS confinement.
- Runtime Profiler attachment is **out of scope** — use `unity-runtime-performance` for static triage, then open Unity Profiler.
