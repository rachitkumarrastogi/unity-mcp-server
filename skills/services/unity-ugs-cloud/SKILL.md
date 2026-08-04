---
name: unity-ugs-cloud
description: >-
  Use when auditing Unity Gaming Services: Authentication, Cloud Code, Economy,
  Cloud Save, Remote Config, and Unity Connect project linkage.
---
# Unity Gaming Services / Cloud Code

## Discovery

1. `get_ugs_cloud_stack` — `com.unity.services.*` packages + script hits
2. `get_cloud_services_config` — Unity Connect / dashboard linkage
3. `get_multiplayer_stack` — Relay / Lobby / Vivox often co-installed
4. `get_analytics_or_crash_config` — avoid double-instrumentation with third-party SDKs

## Checklist

- Initialize `UnityServices` once; gate gameplay until Auth completes when required.
- Cloud Code is authoritative for economy mutations — do not trust client balances.
- Environments (dev/prod) must not share the same secrets in source control.
- Prefer Remote Config for tunables; keep defaults offline-safe.

## Related

- `unity-multiplayer-netcode`, `unity-playfab-backend`, `unity-firebase-mobile`
