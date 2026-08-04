---
name: unity-steam-discord-presence
description: >-
  Use for Steamworks and Discord SDK presence in a Unity project: app ID file,
  plugin folders, and related scripts.
---
# Steam & Discord presence

## Discovery

1. `get_steam_config` — `steam_appid.txt` + Steamworks plugin path
2. `get_discord_config` — Discord SDK under Plugins
3. `find_scripts_by_content` — `Steamworks`, `Discord`
4. `get_player_settings` — product/company naming consistency

## Checklist

- `steam_appid.txt` is for local/dev; shipping uses steam_api correctly.
- Don't commit partner secrets; keep depot scripts outside the game repo if needed.
- Discord social SDK: match SDK binary to CPU architecture per platform.

## Related

- `unity-playfab-backend`, `unity-ci-github-actions`
