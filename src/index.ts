#!/usr/bin/env node
/**
 * unity-mcp-server – Lightweight MCP server for any Unity project.
 * Exposes tools: project info, build scenes, agent docs. No Unity Editor required.
 * Set UNITY_PROJECT_PATH to the Unity project root in your MCP client config.
 * Run: node dist/index.js (after npm run build).
 */

import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { z } from "zod";

function getProjectRoot(): string {
  const env = process.env.UNITY_PROJECT_PATH;
  if (env) return resolve(env);
  console.error("UNITY_PROJECT_PATH is required. Set it in your MCP client config (e.g. Cursor) to your Unity project root.");
  process.exit(1);
  return ""; // unreachable
}

function getBuildScenes(projectRoot: string): { index: number; path: string; name: string }[] {
  const path = join(projectRoot, "ProjectSettings", "EditorBuildSettings.asset");
  if (!existsSync(path)) return [];
  const content = readFileSync(path, "utf-8");
  const scenes: { index: number; path: string; name: string }[] = [];
  let index = 0;
  const pathRe = /path: (Assets\/[^\n]+\.unity)/g;
  let m: RegExpExecArray | null;
  while ((m = pathRe.exec(content)) !== null) {
    const fullPath = m[1];
    const name = fullPath.replace(/^.*\//, "").replace(/\.unity$/, "");
    scenes.push({ index, path: fullPath, name });
    index++;
  }
  return scenes;
}

async function main() {
  const projectRoot = getProjectRoot();

  const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");
  const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");

  const server = new McpServer({
    name: "unity-mcp-server",
    version: "1.0.0",
  });

  server.registerTool(
    "get_project_info",
    {
      description: "Get Unity project info (path, Unity version, build scene count).",
      inputSchema: {},
    },
    async () => {
      let unityVersion = "unknown";
      const pvPath = join(projectRoot, "ProjectSettings", "ProjectVersion.txt");
      if (existsSync(pvPath)) {
        const m = readFileSync(pvPath, "utf-8").match(/m_EditorVersion:\s*(.+)/);
        if (m) unityVersion = m[1].trim();
      }
      const scenes = getBuildScenes(projectRoot);
      const text = [
        `Project root: ${projectRoot}`,
        `Unity version: ${unityVersion}`,
        `Build scenes: ${scenes.length}`,
        scenes.map((s) => `  ${s.index}: ${s.name} (${s.path})`).join("\n"),
      ].join("\n");
      return { content: [{ type: "text", text }] };
    }
  );

  server.registerTool(
    "list_build_scenes",
    {
      description: "List all scenes in Unity EditorBuildSettings (build order).",
      inputSchema: {},
    },
    async () => {
      const scenes = getBuildScenes(projectRoot);
      const text = JSON.stringify(scenes, null, 2);
      return { content: [{ type: "text", text }] };
    }
  );

  server.registerTool(
    "read_agent_docs",
    {
      description: "Read the agent development guide (.agents/AGENT.md) and optionally REPO_UNDERSTANDING.md.",
      inputSchema: {
        include_repo_understanding: z.boolean().optional().describe("If true, also return REPO_UNDERSTANDING.md content").default(false),
      },
    },
    async (args: unknown) => {
      const include = (args as { include_repo_understanding?: boolean })?.include_repo_understanding ?? false;
      const agentPath = join(projectRoot, ".agents", "AGENT.md");
      let text = "";
      if (existsSync(agentPath)) {
        text = readFileSync(agentPath, "utf-8");
      } else {
        text = "(No .agents/AGENT.md found)";
      }
      if (include) {
        const repPath = join(projectRoot, "REPO_UNDERSTANDING.md");
        if (existsSync(repPath)) {
          text += "\n\n---\n\n# REPO_UNDERSTANDING.md\n\n" + readFileSync(repPath, "utf-8");
        }
      }
      return { content: [{ type: "text", text }] };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
