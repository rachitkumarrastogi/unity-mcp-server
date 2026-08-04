---
name: unity-localization
description: >-
  Use when auditing Unity Localization: Locale assets, string tables, and
  package setup for multi-language shipping.
---
# Localization

## Discovery

1. `get_localization_stack` — package + Locale / StringTable assets
2. `get_localization_tables` — files under Assets/Localization
3. `list_tmp_fonts` — per-locale font assets / fallbacks
4. `get_addressables_info` — localized content often remote

## Checklist

- Default locale + fallbacks must exist offline.
- Smart strings / variables need QA for each grammar-heavy language.
- Font atlases and TMP fallbacks must cover shipping locales.
- Keep table assets Addressable if large; avoid embedding all languages in first download when possible.

## Related

- `unity-addressables-shipping`, `unity-ui-toolkit-tmp`, `unity-build-size-optimization`
