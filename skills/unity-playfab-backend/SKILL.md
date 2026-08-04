---
name: unity-playfab-backend
description: >-
  Use when integrating or auditing PlayFab: title ID, config assets, and
  related package presence.
---
# PlayFab backend

## Discovery

1. `get_playfab_config` — title ID + config paths
2. `list_packages` — PlayFab / Azure packages
3. `find_scripts_by_content` — `PlayFabClientAPI`, `PlayFabSettings`
4. `get_analytics_or_crash_config` — overlapping telemetry

## Checklist

- Title ID is environment-specific (dev/stage/prod); never commit secret keys.
- Prefer economy/catalog data from server; keep client authoritative checks minimal.
- Align player identity with Steam/mobile SDKs if multi-platform.

## Related

- `unity-steam-discord-presence`, `unity-ads-analytics-crash`
