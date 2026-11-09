/**
 * Optional live Editor bridge (opt-in, localhost only).
 * Enabled via UNITY_MCP_BRIDGE_URL=http://127.0.0.1:PORT (or UNITY_MCP_BRIDGE_PORT).
 * Default: disabled. Reads-only; never writes to the project.
 */

const DEFAULT_TIMEOUT_MS = 4000;

function bridgeBase(): string | null {
  const url = process.env.UNITY_MCP_BRIDGE_URL;
  if (url && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i.test(url.trim())) return url.trim().replace(/\/$/, "");
  const port = process.env.UNITY_MCP_BRIDGE_PORT;
  if (port && /^\d{2,5}$/.test(port.trim())) return `http://127.0.0.1:${port.trim()}`;
  return null;
}

export function getBridgeStatus(): { enabled: boolean; baseUrl: string | null; howToEnable: string } {
  const base = bridgeBase();
  return {
    enabled: !!base,
    baseUrl: base,
    howToEnable:
      "Install the optional UnityBridge companion package in the Editor, enable its HTTP listener on 127.0.0.1, then set UNITY_MCP_BRIDGE_URL (e.g. http://127.0.0.1:8091) or UNITY_MCP_BRIDGE_PORT. Bridge is localhost-only and read-first.",
  };
}

async function bridgeGet<T>(path: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<{ ok: boolean; data?: T; error?: string }> {
  const base = bridgeBase();
  if (!base) return { ok: false, error: "Bridge disabled. Set UNITY_MCP_BRIDGE_URL or UNITY_MCP_BRIDGE_PORT (localhost only)." };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${base}${path}`, { signal: ctrl.signal });
    const text = await res.text();
    if (!res.ok) return { ok: false, error: `Bridge HTTP ${res.status}: ${text.slice(0, 500)}` };
    try {
      return { ok: true, data: JSON.parse(text) as T };
    } catch {
      return { ok: true, data: text as unknown as T };
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(t);
  }
}

export function bridgeFetch(path: string): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  return bridgeGet<unknown>(path.startsWith("/") ? path : `/${path}`);
}
