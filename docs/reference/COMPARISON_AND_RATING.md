# Comparison with Other Unity MCP Servers

This document compares **unity-mcp-server** with other Unity-related MCP servers and summarizes what (if anything) might be added to this package.

---

## Package comparison

| Criterion | **unity-mcp-server** (this package) | **@akiojin/unity-mcp-server** | **@iflow-mcp/unity-mcp-server** |
|-----------|--------------------------------------|-------------------------------|----------------------------------|
| **Editor required** | No | Yes (TCP) | Yes (HTTP) |
| **Mode** | Read-only (filesystem) | Read + Write (Editor automation) | Read + Write (script/folder creation) |
| **Tool count** | **93** | 100+ | Smaller set (script/shader/organize) |
| **Setup** | Set `UNITY_PROJECT_PATH` only | Unity + Node + TCP/port | Unity + Node + HTTP + Unity-side plugin |
| **Use case** | Inspect project, answer questions, refactor guidance | Automate Editor (create objects, run actions) | Create scripts/shaders, organize folders from AI |
| **CI / headless** | Yes (no Editor) | No | No |
| **Multiple projects** | Yes (change env per client) | One Editor instance | One Editor instance |
| **Dependencies** | MCP SDK + zod | MCP SDK + Editor bridge | MCP + Unity-side HTTP server |

---

## Relative fit (by design goal)

Ratings below are relative to each package’s intended design (editor-free, read-only, multi-project, CI-friendly for this package; Editor automation for the others).

| Package | Score | Notes |
|---------|--------|--------|
| **unity-mcp-server** (this package) | **5/5** for inspect-and-advise | No Editor required, read-only, 93 tools, single config variable, works in CI and with multiple projects. |
| **@akiojin/unity-mcp-server** | **4/5** for Editor automation | Suited to Editor automation (create GameObjects, run Editor actions). Not intended for headless or read-only use. |
| **@iflow-mcp/unity-mcp-server** | **3/5** for AI-driven creation | Supports script/shader creation and folder organization via Claude; requires the Editor and Unity-side setup. |

For “AI reads the project and suggests changes,” this package is the best fit. For “AI drives the Unity Editor,” one of the other servers (or both: this one for inspection, another for automation) may be more appropriate.

---

## Advantages of this package

- **No Unity Editor required** — Usable in CI, on servers, and with multiple project paths.
- **Read-only** — No modification of project assets; lower risk of accidental changes.
- **93 focused tools** — Project settings, assemblies, scenes, prefabs, assets, materials, animation, 2D, UI, input, audio, third-party integrations, and refactoring helpers.
- **Single environment variable** — `UNITY_PROJECT_PATH`; no TCP/HTTP or Unity plugin.
- **Listed on the MCP Registry** — Discoverable and installable from the official registry.

---

## Features of other servers (out of scope by design)

- **Write/create** — Creating scripts, shaders, folders, or GameObjects via the Editor.
- **Live Editor control** — Executing actions inside the running Editor.

This package intentionally does not provide these; they require the Editor and conflict with the editor-free, read-only design.

---

## Optional future addition

| Addition | Description | Recommendation |
|----------|-------------|-----------------|
| **Tool search / discovery** | A meta-tool (e.g. `search_tools` or `list_tools`) that returns tool names and short descriptions, optionally filtered by keyword or category. | Optional. Would help users and the AI choose among the 93 tools; not required for correct behavior. |

No other features from the compared packages align with this package’s design without introducing Editor dependency or write capabilities.

---

## Summary

- **This package** is optimized for inspect-and-advise, editor-free, read-only use. The other packages are optimized for Editor automation.
- **Adopting their features** is not recommended; their value is in Editor connection and write operations, which this package deliberately avoids.
- **The only addition under consideration** is a tool search/list meta-tool; all other capabilities are either already covered or intentionally out of scope.
