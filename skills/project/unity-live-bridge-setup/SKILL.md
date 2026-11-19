---
name: unity-live-bridge-setup
description: >-
  Use to enable and verify the opt-in localhost Editor bridge: companion
  listener, UNITY_MCP_BRIDGE_URL/PORT, status checks, and live fetches.
  Start here for "how do I see live hierarchy/console?"
---
# Unity live bridge setup

Default install is **Editor-free** (filesystem only). The bridge is opt-in,
localhost-only, and read-first.

## Enable

1. Install the optional UnityBridge companion package in the Editor.
2. Enable its HTTP listener on `127.0.0.1` (e.g. port `8091`).
3. Set `UNITY_MCP_BRIDGE_URL=http://127.0.0.1:8091` (or `UNITY_MCP_BRIDGE_PORT=8091`)
   in your MCP client env, alongside `UNITY_PROJECT_PATH`.
4. Restart the MCP client so the server picks up the env.

## Verify

| Step | Tool | Notes |
|------|------|-------|
| Bridge on/off | `get_bridge_status` | Disabled unless URL/PORT points at 127.0.0.1 |
| Live hierarchy | `bridge_live_fetch` with `/hierarchy` | Refused when bridge disabled |
| Live console | `bridge_live_fetch` with `/console?limit=50` | Machine-local, never uploads |

## Rules

- Bridge is `http://127.0.0.1` only — never expose it beyond localhost.
- Read-first: filesystem tools stay the source of truth for audits.
- When disabled, use static fallbacks: `get_scene_summary`,
  `get_scene_hierarchy_flat`, `get_editor_log_errors`.

## Report template

```markdown
## Live bridge
- Enabled: yes/no (base URL or how-to-enable)
- Hierarchy: N root objects (or refusal reason)
- Console: top errors (or refusal reason)
```
