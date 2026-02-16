# Publish to npm and MCP Registry

Use this checklist to publish **unity-mcp-server** to npm and to the MCP Registry.

## Prerequisites

- npm account ([sign up](https://www.npmjs.com/signup) if needed)
- GitHub account (for MCP Registry; must own the repo)
- Version in `package.json` and `server.json` (top-level and `packages[0].version`) already set

## Steps

### 1. Build

```bash
npm run build
```

### 2. Publish to npm

```bash
npm login
npm publish --access public
```

If the package name is already taken, use a scoped name in `package.json` (e.g. `@your-username/unity-mcp-server`) and set the same in `server.json` → `packages[0].identifier`. Keep `mcpName` unchanged.

### 3. Publish to MCP Registry

Install the MCP Publisher if needed ([docs/REGISTRY.md](./docs/REGISTRY.md)):

```bash
# macOS/Linux example
curl -L "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_$(uname -s | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/').tar.gz" | tar xz mcp-publisher && sudo mv mcp-publisher /usr/local/bin/
```

Log in (once per machine):

```bash
mcp-publisher login github
```

Publish from the repo root:

```bash
mcp-publisher publish
```

### 4. Confirm

- npm: [npmjs.com/package/unity-mcp-server](https://www.npmjs.com/package/unity-mcp-server)
- MCP Registry: [registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io/?q=unity-mcp-server)

## Updating a later version

1. Bump `version` in `package.json` and in `server.json` (top-level and `packages[0].version`).
2. Run `npm run build`, then `npm publish --access public`, then `mcp-publisher publish`.
