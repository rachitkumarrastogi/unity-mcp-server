# How to register this server in the MCP Registry

The [MCP Registry](https://registry.modelcontextprotocol.io/) lists MCP servers so users can discover and install them. To list **Unity MCP Server** there, follow these steps.

## Prerequisites

- **npm account** — [Sign up](https://www.npmjs.com/signup) if needed. The registry verifies ownership via the published npm package.
- **GitHub account** — You’ll authenticate with GitHub so the registry can verify `io.github.rachitkumarrastogi/unity-mcp-server`.

## Step 1: Publish the package to npm

The registry only stores metadata; the actual package must be published to npm first.

```bash
cd /path/to/unity-mcp-server
npm install
npm run build
npm login          # if not already logged in
npm publish --access public
```

If the name `unity-mcp-server` is already taken on npm, use a scoped name in `package.json` (e.g. `"name": "@rachitkumarrastogi/unity-mcp-server"`) and set the same value in `server.json` → `packages[0].identifier`. Keep `mcpName` in `package.json` as `io.github.rachitkumarrastogi/unity-mcp-server`.

## Step 2: Install the MCP Publisher CLI

**macOS / Linux:**

```bash
curl -L "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_$(uname -s | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/').tar.gz" | tar xz mcp-publisher && sudo mv mcp-publisher /usr/local/bin/
```

**Homebrew:**

```bash
brew install mcp-publisher
```

**Windows:** See [Registry releases](https://github.com/modelcontextprotocol/registry/releases/latest) for the Windows binary.

Verify:

```bash
mcp-publisher --help
```

## Step 3: Log in to the registry (GitHub)

You must authenticate as the GitHub user that owns the repo (`rachitkumarrastogi`):

```bash
mcp-publisher login github
```

Follow the prompts (open the URL, enter the code, authorize). When it says “Successfully logged in”, you’re done.

## Step 4: Publish to the MCP Registry

From the repo root (where `server.json` lives):

```bash
mcp-publisher publish
```

You should see something like:

```text
Publishing to https://registry.modelcontextprotocol.io...
✓ Successfully published
✓ Server io.github.rachitkumarrastogi/unity-mcp-server version 1.0.0
```

## Step 5: Confirm it’s listed

- Browse [registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io/) and search for “Unity” or “unity-mcp-server”.
- Or call the API:

  ```bash
  curl "https://registry.modelcontextprotocol.io/v0.1/servers?search=unity-mcp-server"
  ```

## Updating the listing later

After you release a new version:

1. Bump `version` in `package.json` and in `server.json` (top-level and `packages[0].version`).
2. Run `npm run build` and `npm publish`.
3. Run `mcp-publisher publish` again.

## Troubleshooting

| Issue | What to do |
|-------|------------|
| “Registry validation failed for package” | Ensure `package.json` has `mcpName` exactly matching `server.json` → `name` (e.g. `io.github.rachitkumarrastogi/unity-mcp-server`). |
| “You do not have permission to publish this server” | With GitHub login, the server `name` must start with `io.github.<your-github-username>/`. Use the same GitHub account that owns the repo. |
| “Invalid or expired Registry JWT token” | Run `mcp-publisher login github` again. |

## Official docs

- [Quickstart: Publish an MCP Server](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/quickstart.mdx)
- [Package types (npm, PyPI, etc.)](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/package-types.mdx)
- [Authentication options](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/authentication.mdx)
