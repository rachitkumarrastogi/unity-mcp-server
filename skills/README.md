# Bundled skills

Workflow guides for **unity-mcp-server**, organized like the Unity Editor / Project window.
Discover with `list_ai_skills` / `read_ai_skill` (skill **id** = leaf folder name).

## Layout

```text
skills/
  project/       Project Settings, packages, ship gate, physics, a11y, build profiles
  scenes/        Build scenes, hierarchy, lighting, QA
  prefabs/       Prefab structure & variants
  assets/        References, Addressables, localization, missing GUIDs
  code/          Assemblies, Input System, CI
  rendering/     URP / HDRP / BIRP migration
  animation/     Animator / Timeline / Cinemachine
  2d/            Sprites / tilemaps
  ui/            UI Toolkit / TMP
  audio/         Mixer / FMOD / Wwise
  ai-ml/         AI, ML, NavMesh, LLM, model-agnostic
  performance/   Runtime, build size, memory, Adaptive Performance
  services/      PlayFab, Firebase, Steam, ads, multiplayer, UGS
  platform/      DOTS, XR, PlayerSettings / platforms
  README.md
```

## By category

### project
| Id | Focus |
|----|--------|
| `unity-release-readiness` | Ship gate |
| `unity-build-profiles` | Unity 6 Build Profiles |
| `unity-physics-audit` | Classic + Unity Physics + Physics Core 2D |
| `unity-accessibility` | Screen readers / Accessibility APIs |

### scenes
| Id | Focus |
|----|--------|
| `unity-scenes-workflow` | Build list → summary → hierarchy → components |
| `unity-qa-scene-coverage` | QA pass over build / all scenes |

### prefabs
| Id | Focus |
|----|--------|
| `unity-prefab-architecture` | Prefabs / variants / script GUIDs |

### assets
| Id | Focus |
|----|--------|
| `unity-broken-refs-triage` | Missing scripts & GUIDs |
| `unity-addressables-shipping` | Local / remote content |
| `unity-localization` | Locales / string tables |

### code
| Id | Focus |
|----|--------|
| `unity-assembly-architecture` | asmdefs / cycles |
| `unity-input-system-setup` | Input System |
| `unity-ci-github-actions` | CI / LFS / Plastic |

### rendering · animation · 2d · ui · audio
| Id | Focus |
|----|--------|
| `unity-urp-hdrp-render-audit` | SRP / shaders / lighting |
| `unity-birp-urp-migration` | Built-in RP deprecation → URP/HDRP |
| `unity-animation-controller-audit` | Animator / Timeline |
| `unity-cinemachine` | Cinemachine cameras |
| `unity-2d-tilemap-sprites` | 2D art |
| `unity-ui-toolkit-tmp` | UI Toolkit / TMP |
| `unity-audio-mixer-fmod-wwise` | Audio middleware |

### ai-ml
| Id | Focus |
|----|--------|
| `unity-ai-audit` | Full AI/ML inventory |
| `unity-model-agnostic-inference` | Swap models without vendor lock-in |
| `unity-ml-agents` | ML-Agents RL |
| `unity-sentis-inference` | Unity Sentis |
| `unity-navmesh-npc` | NavMesh / NPC AI |
| `unity-llm-integration` | Chat/RAG / HTTP LLMs |

### performance
| Id | Focus |
|----|--------|
| `unity-runtime-performance` | Static FPS/GPU triage proxies |
| `unity-build-size-optimization` | Install / download size |
| `unity-memory-asset-pressure` | Large textures/audio/models |
| `unity-adaptive-performance` | Adaptive Performance + Project Auditor |

### services
| Id | Focus |
|----|--------|
| `unity-multiplayer-netcode` | NGO / Relay / Lobby / third-party netcode |
| `unity-ugs-cloud` | Unity Gaming Services / Cloud Code |
| `unity-playfab-backend` | PlayFab |
| `unity-firebase-mobile` | Firebase |
| `unity-steam-discord-presence` | Steam / Discord |
| `unity-ads-analytics-crash` | Ads + crash SDKs |

### platform
| Id | Focus |
|----|--------|
| `unity-dots-subscenes` | DOTS / ECS |
| `unity-xr-vr-audit` | XR / VR |
| `unity-platform-player-settings` | Android / WebGL / platform PlayerSettings |

## Notes

- Skills are **markdown only**; tools enforce project-root FS confinement.
- Runtime Profiler attachment is out of scope — use `unity-runtime-performance` then open Unity Profiler.
