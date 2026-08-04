---
name: unity-multiplayer-netcode
description: >-
  Use to audit Unity multiplayer: Netcode for GameObjects, Transport, Relay/Lobby,
  or third-party stacks (Mirror, FishNet, Photon).
---
# Multiplayer / Netcode

Unity 6 treats multiplayer as a first-class pillar. Start with discovery, then architecture.

## Discovery

1. `get_multiplayer_stack` — packages + NetworkBehaviour / Relay / Lobby / Photon hits
2. `list_packages` — confirm `com.unity.netcode.gameobjects`, transport, multiplayer tools
3. `get_ugs_cloud_stack` — Relay/Lobby often sit beside UGS Auth
4. `list_build_profiles` / `list_build_scenes` — dedicated server vs client scenes

## Checklist

- One authority model (server/host/client); document who owns player state.
- NetworkVariables / RPCs only for replicated state — keep large assets on Addressables.
- Separate **client** and **server** (or host) build profiles with scripting defines.
- Never commit Relay/allocation secrets; use environment configs.
- If no NGO packages but custom sockets exist, note that in the audit report.

## Related

- `unity-ugs-cloud`, `unity-build-profiles`, `unity-platform-player-settings`
