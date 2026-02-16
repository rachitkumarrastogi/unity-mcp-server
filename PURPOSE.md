# Purpose and Use Cases

## What this server does

This server exposes **tools** that an MCP client (such as Cursor, Claude Desktop, or Windsurf) can call when you work on a Unity project. Each tool performs a single, well-defined operation. Examples:

- **get_project_info** — Unity version, project path, and number of scenes in the build.
- **list_build_scenes** — Ordered list of build scenes (from EditorBuildSettings).
- **read_agent_docs** — Contents of `.agents/AGENT.md` and optionally `REPO_UNDERSTANDING.md`.

The client starts this process and invokes these tools over stdio. **No Unity Editor is required** — the server reads only from the project filesystem.

## When to use it

**Recommended when:**

- You use an MCP-capable IDE and want the AI to have structured access to project metadata and agent documentation.
- You prefer to keep the Unity project repository free of Node or other tooling, with this server in a separate repository and pointed at any project via `UNITY_PROJECT_PATH`.
- You plan to add more agent-facing tools (for example, listing Addressables, inspecting scenes, or validating references) without adding tooling into the game repository.

**Optional when:**

- You occasionally use MCP or only sometimes need the AI to use build order or agent docs. The server remains optional; the game project works without it.
- You are comfortable opening `.agents/AGENT.md` and `ProjectSettings/EditorBuildSettings.asset` manually; the server then provides the same information in a structured form and reduces manual steps.

**Not necessary when:**

- You do not use MCP or an AI agent that can call tools. In that case this server is not required.

## Design goals

1. **Structured project context for the agent** — The agent can query build order, agent documentation, and other project data via tools instead of parsing raw YAML or Markdown.
2. **Separation of concerns** — The game repository contains Unity and game code; this repository is a separate Node application that knows how to read that project. The server can be versioned and updated independently of the Unity project.
3. **Single place to extend tools** — New capabilities (for example, listing Addressables, validating scene references, or triggering builds) can be added here; consumers continue to point their MCP client at the same server.
4. **Reusability** — The same server works for any Unity project; you switch projects by changing `UNITY_PROJECT_PATH` in the client configuration.

In summary: this server is intended for teams that use MCP and want the AI to have reliable, structured access to project information and agent documentation, without running or depending on the Unity Editor.
