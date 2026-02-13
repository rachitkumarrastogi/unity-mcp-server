# Why This MCP Server Exists and When It Makes Sense

## What it does

This server exposes **tools** that an MCP client (e.g. Cursor) can call when you’re working on **any Unity project**. Each tool does one thing:

- **get_project_info** – Unity version, project path, how many scenes are in the build.
- **list_build_scenes** – Full list of build scenes in order (from `EditorBuildSettings`).
- **read_agent_docs** – Contents of `.agents/AGENT.md` (and optionally `REPO_UNDERSTANDING.md`).

So the agent (or you, via the agent) can ask “what’s the build order?” or “what’s in the agent guide?” without you opening files by hand. The client starts this process and calls these tools over stdio. **No Unity Editor is required** — it reads only from the project filesystem.

## Does it make sense to have it?

**Yes, if:**

- You use an **MCP-aware IDE** (Cursor, Claude Desktop, Windsurf, etc.) and want the AI to have structured access to project metadata and agent docs.
- You want the **Unity project repo to stay clean** (no Node/tooling inside it), and the **tooling to live in a separate repo** that you clone once and point at any Unity project via `UNITY_PROJECT_PATH`.
- You’re building toward **more agent-facing tools** later (e.g. “list Addressables,” “run Unity CLI build,” “inspect scene list”) without bloating the game repo.

**Optional / nice-to-have if:**

- You mostly work without MCP or without asking the AI about build order / agent docs. Then the server is optional; the game still works without it.
- You’re fine opening `.agents/AGENT.md` and `ProjectSettings/EditorBuildSettings.asset` yourself. Then the server saves you a few clicks and gives the agent the same info in a structured way.

**Probably overkill if:**

- You never use MCP or an AI agent that can call tools. Then you don’t need this repo at all.

## What purpose it serves

1. **Structured project context for the agent** – The agent can ask “what scenes are in the build?” or “what’s the agent guide?” and get exact answers via tools instead of guessing or reading raw YAML/markdown without context.
2. **Separation of concerns** – Game repo = Unity + game code. This repo = one small Node app that knows how to read that project. You can version and change the server without touching the Unity project.
3. **Single place to add more tools** – When you want “trigger a build” or “list Addressables” or “validate scene refs,” you add a tool here and the consumer just points Cursor at the same server.
4. **Reusability** – Same server works for **any** Unity project; switch projects by changing `UNITY_PROJECT_PATH` in the client config.

In short: **it makes sense if you use MCP and want the AI to have reliable, structured access to project info and agent docs; it serves the purpose of a small, separate tool layer that sits next to any Unity project and exposes that context as MCP tools.**
