---
name: unity-ads-analytics-crash
description: >-
  Use to inventory ads and crash/analytics SDKs: Unity Ads, AdMob, ironSource,
  Sentry, Crashlytics, BugSnag, Unity Analytics.
---
# Ads, analytics & crash reporting

## Discovery

1. `get_ads_config` — Unity Ads / AdMob / ironSource package presence
2. `get_analytics_or_crash_config` — Sentry, Crashlytics, BugSnag, Analytics
3. `list_packages` — confirm versions
4. `find_scripts_by_content` — `Advertisement`, `SentrySdk`, `Firebase.Crashlytics`

## Checklist

- One crash reporter primary; avoid duplicate symbolication noise.
- Ad consent / ATT flows documented for mobile stores.
- DSN/API keys via secure config, not hardcoded in scripts.

## Related

- `unity-firebase-mobile`, `get_cloud_services_config`
