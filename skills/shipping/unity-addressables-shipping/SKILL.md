---
name: unity-addressables-shipping
description: >-
  Use for Addressables groups, remote vs local content, localization tables,
  and shipping catalogs without bloating the player.
---
# Addressables & localization shipping

## Discovery

1. `get_addressables_info` — groups + settings asset path
2. `get_localization_tables` — table assets/CSV/JSON
3. `get_build_size_estimate` / `list_large_assets` — what must stay local
4. `list_packages` — confirm `com.unity.addressables` / localization packages

## Checklist

- Label remote groups clearly; keep boot/critical path local.
- Version catalogs with the player; avoid stale remote hash mismatches.
- Localization: one table set per locale; verify build includes active locales.
- Test offline vs first-download paths.

## Related

- `get_release_readiness`, `get_package_dependency_graph`
