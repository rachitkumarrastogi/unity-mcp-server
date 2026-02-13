# Unity MCP Server

A lightweight [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server that gives AI assistants structured access to your Unity projects. Query project metadata, build settings, and agent documentation from any MCP-capable client—without running the Unity Editor.

---

## Overview

Unity MCP Server runs as a separate process and reads your Unity project from disk. Point it at any project root via `UNITY_PROJECT_PATH`; one installation can serve multiple projects by changing the environment variable in your client config.

**Key points:**

- **Editor-free** — Uses only the project filesystem. No Unity process or Editor dependency.
- **Single binary** — One Node.js server for all your Unity projects.
- **MCP-native** — Built on the official MCP SDK; works with Cursor, Claude Desktop, Windsurf, and other MCP clients.

---

## Features

| Tool | Description |
|------|-------------|
| `get_project_info` | Returns project root path, Unity version, and build scene count. |
| `list_build_scenes` | Returns scenes in `EditorBuildSettings` in build order (JSON). |
| `read_agent_docs` | Returns contents of `.agents/AGENT.md`; optionally includes `REPO_UNDERSTANDING.md`. |

---

## Prerequisites

- **Node.js** 18 or later
- **UNITY_PROJECT_PATH** — Absolute path to your Unity project root (set in your MCP client configuration)

---

## Installation

```bash
git clone https://github.com/YOUR_USERNAME/unity-mcp-server.git
cd unity-mcp-server
npm install
npm run build
```

The server is invoked via **stdio**. Your MCP client starts it; you do not run it manually in production.

---

## Configuration

### Cursor

Add the following to your MCP settings (project or user):

```json
{
  "mcpServers": {
    "unity": {
      "command": "node",
      "args": ["/absolute/path/to/unity-mcp-server/dist/index.js"],
      "env": {
        "UNITY_PROJECT_PATH": "/absolute/path/to/YourUnityProject"
      }
    }
  }
}
```

Replace:

1. `/absolute/path/to/unity-mcp-server/dist/index.js` with the path to this repository’s built entry point.
2. `/absolute/path/to/YourUnityProject` with the absolute path to your Unity project root.

### Other MCP clients

Use the same pattern: run `node` with `dist/index.js` as the argument and set `UNITY_PROJECT_PATH` in the environment. Refer to your client’s documentation for where to configure MCP servers.

---

## Development

- **Production:** `node dist/index.js` (after `npm run build`)
- **Development:** `npm run dev` or `npx tsx src/index.ts`

---

## Security and public use

This repository contains only generic tooling: no game code, assets, API keys, or secrets. The Unity project path is provided at runtime by your MCP client and is not stored in this repo. Safe to use in public or private contexts. The project is maintained anonymously; no author attribution is required.

---

## Further reading

See [PURPOSE.md](./PURPOSE.md) for the rationale behind this server and when it is useful for your workflow.
