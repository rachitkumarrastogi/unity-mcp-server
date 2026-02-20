# Quick Start: Use unity-mcp-server in Your Unity Codebase (End-to-End)

This guide walks you through **installing the MCP server and using it with your Unity project** in Cursor (or another MCP client), from zero to asking the AI questions about your project.

---

## Step 1: Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org/) or `brew install node`
- **An MCP-capable client** — e.g. Cursor, Claude Desktop, VS Code with an MCP extension
- **Your Unity project** — any Unity project on disk (the server only reads files; it does not run the Editor)

---

## Step 2: Install the server

**Option A — From npm (recommended)**

```bash
npm install -g unity-mcp-server
```

Then find the path to the runner (e.g. `which unity-mcp-server` or the path npm reports). Many clients need the full path to `node` and the path to the server’s `dist/index.js` inside the global install (e.g. `$(npm root -g)/unity-mcp-server/dist/index.js`).

**Option B — From the repo**

```bash
git clone https://github.com/rachitkumarrastogi/unity-mcp-server.git
cd unity-mcp-server
npm install
npm run build
```

Remember the **absolute path** to the project root (e.g. `/Users/you/unity-mcp-server`) and the path to **`dist/index.js`** (e.g. `/Users/you/unity-mcp-server/dist/index.js`).

**Option C — MCP Registry (Cursor / clients that support it)**

Add the server from the registry: search for **unity-mcp-server** or **io.github.rachitkumarrastogi/unity-mcp-server** and add it. You will still need to set `UNITY_PROJECT_PATH` (Step 4).

---

## Step 3: Choose your Unity project

Pick the **absolute path** to your Unity project root (the folder that contains `Assets`, `ProjectSettings`, `Packages`). Examples:

- macOS: `/Users/you/MyGame`
- Windows: `C:\Users\you\MyGame`

The server will read only from this path; it never writes or runs Unity.

---

## Step 4: Configure your MCP client

Set **two things**: (1) how to run the server, (2) the environment variable **`UNITY_PROJECT_PATH`** pointing at your Unity project.

### Cursor

1. Open **Cursor Settings** → **MCP** (or edit the config file directly).
2. Add a server entry, for example:

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

- `/absolute/path/to/unity-mcp-server/dist/index.js` with your server path from Step 2.
- `/absolute/path/to/YourUnityProject` with your Unity project path from Step 3.

3. Restart Cursor or reload MCP so it picks up the config.

### Claude Desktop

In `claude_desktop_config.json` (see [Claude docs](https://docs.anthropic.com/en/docs/build-with-claude/mcp)), add the same structure under `mcpServers`: `command`, `args`, and `env` with `UNITY_PROJECT_PATH`.

### Other clients (VS Code, Windsurf, etc.)

Use your client’s MCP configuration to add a server with:

- **Command:** `node`
- **Args:** `["/path/to/unity-mcp-server/dist/index.js"]`
- **Env:** `UNITY_PROJECT_PATH` = your Unity project root

---

## Step 5: Open your Unity project (or its repo) in the IDE

- In Cursor (or your client), **open the folder of your Unity project** (or the repo that contains it).  
- So the AI has access to your code and the MCP server has access to the same project via `UNITY_PROJECT_PATH`.

---

## Step 6: Verify the server is running

- In Cursor, you can check MCP status in settings or in the UI (e.g. “Unity” or “unity” server connected).
- If the client shows tool lists, you should see tools like `get_project_info`, `list_build_scenes`, `search_tools`, etc.

---

## Step 7: Ask the AI (example prompts)

Once the server is connected and `UNITY_PROJECT_PATH` is set, you can ask in **natural language**. The AI will call the right tools under the hood.

**Project overview**

- *"What's my Unity project path and version?"*
- *"Which scenes are in the build?"*
- *"Give me project stats."*

**Code and refactoring**

- *"Which assembly contains PlayerController.cs?"*
- *"Find references to GameManager."*
- *"Do we have assembly cycles?"*
- *"What's the public API of PlayerController.cs?"*

**Scenes and prefabs**

- *"What's in MainMenu.unity?"*
- *"Which prefabs have an Animator?"*
- *"Find objects with tag Spawn in Level01."*
- *"Where are all the cameras in the project?"*

**Assets and references**

- *"What references Assets/Textures/Logo.png?"*
- *"Search assets named 'hero'."*
- *"What's the import settings for hero.png?"*

**Release and health**

- *"Is the project release ready?"*
- *"Find prefabs with missing script."*

**Discover tools**

- *"What Unity tools do you have?"* — the AI can use `search_tools` to list or filter tools.

More examples: see the README [“Example prompt to type”](https://github.com/rachitkumarrastogi/unity-mcp-server#what-to-type-in-claude--cursor-or-any-other-mcp-client) column and [How it helps Unity developers](./HOW_IT_HELPS_UNITY_DEVELOPERS.md).

---

## Step 8: What the server does *not* do

- **Does not open or run the Unity Editor** — You run the Editor yourself to hit Play, build, or edit scenes.
- **Does not create or edit files** — It only reads. The AI suggests changes; you (or the Editor) apply them.
- **Does not run builds** — It can read build settings and scene lists; it does not execute `Unity -batchmode -build`.

So: the server gives the AI **read-only** project context; you and the Editor remain in charge of **running and changing** the project.

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| "Tool not found" or no Unity tools | MCP server added and enabled; `args` points to `dist/index.js`; client restarted after config change. |
| Empty or wrong project data | `UNITY_PROJECT_PATH` is set in `env` and is the **absolute** path to the Unity project root (folder containing `Assets`, `ProjectSettings`). |
| Server won’t start | Node.js 18+ installed; path in `args` exists; no typos in JSON. |
| AI doesn’t use tools | Ask explicitly (e.g. "Use the Unity tools to list build scenes") or ask "What Unity tools do you have?" first. |

---

## Next steps

- **[Tools by role](./TOOLS_BY_ROLE.md)** — See which tools suit developers, testers, game developers, and designers.
- **[How it helps Unity developers](./HOW_IT_HELPS_UNITY_DEVELOPERS.md)** — Task-based examples and conversation patterns.
- **Main [README](../../README.md)** — Full tool list with example prompts and configuration.
