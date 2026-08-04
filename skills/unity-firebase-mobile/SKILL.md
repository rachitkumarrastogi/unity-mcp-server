---
name: unity-firebase-mobile
description: >-
  Use for Firebase on Unity mobile: google-services.json, GoogleService-Info.plist,
  project ID discovery (paths only; no secret dumping).
---
# Firebase mobile

## Discovery

1. `get_firebase_config` — config file paths + project ID
2. `list_packages` — Firebase Unity SDKs
3. `get_analytics_or_crash_config` — Crashlytics overlap
4. `list_ci_configs` — whether configs are injected in CI

## Checklist

- Keep plist/json out of public forks when possible; use CI secrets + templating.
- Separate Firebase projects per environment.
- Confirm iOS/Android bundle IDs match `get_player_settings`.

## Security note

This server returns **paths and project IDs**, not private keys. Still treat config files as sensitive in VCS policy.
