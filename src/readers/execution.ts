import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, sep } from "node:path";
import { homedir, platform } from "node:os";
import { listFilesRecursive, readFileSafe, resolveUnderRoot, ASSETS } from "./helpers.js";

const SKIP_DIRS = new Set(["library", "temp", "logs", "obj", ".git", "node_modules", ".vs", ".idea", "logs"]);

function walkExt(root: string, startRel: string, exts: string[], maxFiles: number, allowLibraryBuildReports: boolean): string[] {
  const out: string[] = [];
  const startAbs = resolveUnderRoot(root, startRel);
  if (!startAbs || !existsSync(startAbs)) return out;
  const stack: string[] = [startRel];
  while (stack.length && out.length < maxFiles) {
    const d = stack.pop()!;
    const fullD = resolveUnderRoot(root, d);
    if (!fullD) continue;
    let entries: string[];
    try {
      entries = readdirSync(fullD);
    } catch {
      continue;
    }
    for (const e of entries) {
      if (out.length >= maxFiles) break;
      if (e === "." || e === "..") continue;
      const rel = join(d, e);
      const fullPath = resolveUnderRoot(root, rel);
      if (!fullPath) continue;
      let isDir = false;
      try {
        isDir = statSync(fullPath).isDirectory();
      } catch {
        continue;
      }
      if (isDir) {
        const lower = e.toLowerCase();
        const relLower = rel.toLowerCase();
        if (SKIP_DIRS.has(lower)) {
          if (!(allowLibraryBuildReports && (relLower === "library/buildreports" || relLower.startsWith("library/buildreports/")))) continue;
        }
        if (e.startsWith(".")) continue;
        stack.push(rel);
      } else {
        const low = e.toLowerCase();
        if (exts.some((x) => low.endsWith(x))) out.push(rel.split(/[/\\]/).join("/"));
      }
    }
  }
  return out;
}

export function listTestResultFiles(root: string): { path: string; sizeKb: number }[] {
  const xmls = [
    ...walkExt(root, ".", [".xml"], 400, false),
    ...walkExt(root, ASSETS, [".xml"], 200, false),
  ];
  const uniq = [...new Set(xmls)];
  const out: { path: string; sizeKb: number }[] = [];
  for (const p of uniq) {
    const full = resolveUnderRoot(root, p);
    if (!full) continue;
    try {
      const st = statSync(full);
      if (st.size > 8 * 1024 * 1024) continue;
      const head = readFileSync(full, "utf-8").slice(0, 4000);
      if (head.includes("<test-run") || head.includes("<testsuite") || head.includes("<testsuites") || head.includes("test-results") || (head.includes("nunit") && head.includes("test"))) {
        out.push({ path: p, sizeKb: Math.round((st.size / 1024) * 10) / 10 });
      }
    } catch {
      continue;
    }
    if (out.length >= 50) break;
  }
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

function parseNunit(content: string): { total: number; passed: number; failed: number; skipped: number } | null {
  const m = content.match(/<test-run[^>]*testcasecount="(\d+)"[^>]*passed="(\d+)"[^>]*failed="(\d+)"[^>]*skipped="(\d+)"/i)
    || content.match(/<test-run[^>]*total="(\d+)"[^>]*passed="(\d+)"[^>]*failed="(\d+)"[^>]*skipped="(\d+)"/i);
  if (m) return { total: parseInt(m[1], 10), passed: parseInt(m[2], 10), failed: parseInt(m[3], 10), skipped: parseInt(m[4], 10) };
  const cases = (content.match(/<test-case\b/g) || []).length;
  if (cases > 0) {
    const passed = (content.match(/<test-case[^>]*result="Passed"/g) || []).length;
    const failed = (content.match(/<test-case[^>]*result="Failed"/g) || []).length;
    const skipped = (content.match(/<test-case[^>]*result="(Skipped|Ignored)"/g) || []).length;
    return { total: cases, passed, failed, skipped };
  }
  return null;
}

function parseJunit(content: string): { total: number; passed: number; failed: number; skipped: number } | null {
  const suites = [...content.matchAll(/<testsuite\b[^>]*>/g)];
  if (!suites.length) return null;
  let total = 0, failed = 0, errors = 0, skipped = 0;
  for (const s of suites) {
    const tag = s[0];
    total += parseInt(tag.match(/tests="(\d+)"/)?.[1] || "0", 10);
    failed += parseInt(tag.match(/failures="(\d+)"/)?.[1] || "0", 10);
    errors += parseInt(tag.match(/errors="(\d+)"/)?.[1] || "0", 10);
    skipped += parseInt(tag.match(/skipped="(\d+)"/)?.[1] || "0", 10);
  }
  if (!total) return null;
  return { total, passed: Math.max(0, total - failed - errors - skipped), failed: failed + errors, skipped };
}

export function getTestResultsSummary(root: string, maxFiles = 10): Record<string, unknown> {
  const files = listTestResultFiles(root).slice(0, maxFiles);
  const perFile: Array<Record<string, unknown>> = [];
  let tTotal = 0, tPassed = 0, tFailed = 0, tSkipped = 0;
  for (const f of files) {
    const content = readFileSafe(root, f.path);
    if (!content) continue;
    const sliced = content.length > 2_000_000 ? content.slice(0, 2_000_000) : content;
    let parsed = parseNunit(sliced) || parseJunit(sliced);
    const failures: string[] = [];
    if (parsed && parsed.failed > 0) {
      const re = /<test-case[^>]*result="Failed"[^>]*fullname="([^"]+)"|<testcase[^>]*classname="([^"]+)"[^>]*name="([^"]+)"[^>]*>[\s\S]{0,200}?<failure/mg;
      let m: RegExpExecArray | null;
      let n = 0;
      while ((m = re.exec(sliced)) !== null && n < 10) {
        failures.push(m[1] || `${m[2] || ""}.${m[3] || ""}`);
        n++;
      }
    }
    if (parsed) {
      tTotal += parsed.total; tPassed += parsed.passed; tFailed += parsed.failed; tSkipped += parsed.skipped;
      perFile.push({ path: f.path, sizeKb: f.sizeKb, ...parsed, sample_failures: failures.slice(0, 10) });
    } else {
      perFile.push({ path: f.path, sizeKb: f.sizeKb, note: "unrecognized test xml format" });
    }
  }
  const hints: string[] = [];
  if (!files.length) hints.push("No Test Runner XML found. Run EditMode/PlayMode tests with XML output (e.g. -testResults TestResults/results.xml) or set TestResults folder.");
  if (tFailed > 0) hints.push(`${tFailed} failing tests — fix before shipping; use sample_failures to locate.`);
  return { file_count: files.length, totals: { total: tTotal, passed: tPassed, failed: tFailed, skipped: tSkipped }, files: perFile, hints };
}

function editorLogPath(): string | null {
  const p = platform();
  const home = homedir();
  if (p === "darwin") return join(home, "Library", "Logs", "Unity", "Editor.log");
  if (p === "win32") {
    const base = process.env.LOCALAPPDATA || process.env.USERPROFILE || home;
    return join(base, "Unity", "Editor", "Editor.log");
  }
  return join(home, ".config", "unity3d", "Editor.log");
}

export function getEditorLogErrors(root: string, maxLines = 600, maxErrors = 50): Record<string, unknown> {
  void root;
  const logPath = editorLogPath();
  if (!logPath || !existsSync(logPath)) {
    return { logPath, exists: false, errors: [], hints: ["Editor.log not found — Unity may not have run on this machine, or logs are in a custom location. Run Unity once to generate it."] };
  }
  let text = "";
  try {
    const st = statSync(logPath);
    const fd = readFileSync(logPath, "utf-8");
    const lines = fd.split("\n");
    text = lines.slice(-maxLines).join("\n");
    void st;
  } catch {
    return { logPath, exists: true, errors: [], hints: ["Could not read Editor.log (permissions or rotation)."] };
  }
  const errors: Array<{ kind: string; line: string }> = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    let kind: string | null = null;
    if (/error CS\d+/i.test(t)) kind = "compile";
    else if (/Assertion failed|NullReferenceException|MissingReferenceException/i.test(t)) kind = "runtime";
    else if (/Test (Failed|failed)|FAILED.*test/i.test(t)) kind = "test";
    else if (/Build (Failed|failed)/i.test(t)) kind = "build";
    else if (/^(error|failed):/i.test(t)) kind = "error";
    if (kind) errors.push({ kind, line: t.slice(0, 500) });
    if (errors.length >= maxErrors * 2) break;
  }
  const tail = errors.slice(-maxErrors);
  const kinds = [...new Set(tail.map((e) => e.kind))];
  const hints: string[] = [];
  if (kinds.includes("compile")) hints.push("Compile errors present — fix CS errors before Playmode/build; check detect_assembly_cycles + get_broken_script_refs.");
  if (kinds.includes("build")) hints.push("Build failures in log — see list_build_reports for structured size/errors.");
  if (!tail.length) hints.push("No error lines in last log tail — project looks clean at Editor level.");
  return { logPath, exists: true, platform: platform(), error_count_in_tail: tail.length, kinds, errors: tail, hints };
}

export function listBuildReports(root: string): { path: string; sizeMb: number; modifiedMs: number }[] {
  const jsons = walkExt(root, ".", [".buildreport.json", ".json"], 300, true).filter((p) => /build.?report/i.test(p));
  const bins = walkExt(root, ".", [".buildreport"], 100, true);
  const logs = walkExt(root, ".", [".log"], 200, false).filter((p) => /buildplayer|build.*player|unity.*build/i.test(p.toLowerCase()));
  const all = [...new Set([...jsons, ...bins, ...logs])];
  const out: { path: string; sizeMb: number; modifiedMs: number }[] = [];
  for (const p of all) {
    const full = resolveUnderRoot(root, p);
    if (!full) continue;
    try {
      const st = statSync(full);
      if (st.size > 50 * 1024 * 1024) continue;
      out.push({ path: p, sizeMb: Math.round((st.size / 1024 / 1024) * 100) / 100, modifiedMs: st.mtimeMs });
    } catch {
      continue;
    }
  }
  return out.sort((a, b) => b.modifiedMs - a.modifiedMs).slice(0, 30);
}

export function getBuildReportSummary(root: string, reportPath?: string, topN = 20): Record<string, unknown> {
  let target = reportPath;
  if (!target) {
    const list = listBuildReports(root);
    if (!list.length) return { found: false, hints: ["No build reports found. Build once (or save BuildReport JSON to project) to enable size/error breakdown."] };
    target = list[0].path;
  }
  const content = readFileSafe(root, target);
  if (!content) return { found: false, path: target, hints: ["Could not read report file."] };
  if (target.toLowerCase().endsWith(".json") || content.trim().startsWith("{")) {
    try {
      const j = JSON.parse(content.length > 2_000_000 ? content.slice(0, 2_000_000) : content) as Record<string, unknown>;
      const out: Record<string, unknown> = { found: true, path: target, format: "json" };
      for (const k of ["totalSize", "buildSize", "totalSizeBytes", "summary", "scenes", "platform", "buildTarget", "errors", "warnings", "files", "assets"]) {
        if (j[k] !== undefined) out[k] = Array.isArray(j[k]) ? (j[k] as unknown[]).slice(0, topN) : j[k];
      }
      if (!out.summary && !out.totalSize) {
        out.preview_keys = Object.keys(j).slice(0, 25);
        out.note = "Unrecognized build-report JSON shape; showing top-level keys.";
      }
      return out;
    } catch {
      return { found: true, path: target, format: "json_parse_failed", preview: content.slice(0, 2000) };
    }
  }
  const lines = content.split("\n");
  const errLines = lines.filter((l) => /error|failed/i.test(l)).slice(-30).map((l) => l.slice(0, 400));
  const sizeLines = lines.filter((l) => /mb|kb|size|assets\//i.test(l)).slice(0, topN);
  return { found: true, path: target, format: "text", total_lines: lines.length, error_lines: errLines, size_hint_lines: sizeLines.slice(0, topN) };
}
