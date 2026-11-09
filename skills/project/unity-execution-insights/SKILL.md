---
name: unity-execution-insights
description: >-
  Use to read execution truth without opening the Editor: Test Runner XML,
  Editor.log errors, and saved build reports.
---
# Unity execution insights

## One-shot

1. `get_test_results_summary`
2. `get_editor_log_errors`
3. `get_build_report_summary`

## Deep dive

| Step | Tool | Why |
|------|------|-----|
| 1 | `list_test_result_files` | NUnit/JUnit XML presence; wire `-testResults` if empty |
| 2 | `get_test_results_summary` | P/F/S totals + failing names |
| 3 | `get_editor_log_errors` | Compile (CS codes), NREs, build failures from local log |
| 4 | `list_build_reports` | Saved BuildReport JSON/text + build logs |
| 5 | `get_build_report_summary` | Size breakdown, scenes, errors/warnings |
| 6 | `get_release_readiness` | Classic static gate to pair with execution data |

## Notes

- Editor.log is machine-local (this Mac/PC only) — it reflects *your* last Editor run, not CI.
- Missing reports is itself a finding: no XML = no test evidence; no build report = no size accountability.
- Pair `get_build_report_summary` (real report) with `get_build_size_estimate` (filesystem heuristic) — when they disagree, trust the report and investigate unpacked/duplicate assets.

## Report template

```markdown
## Execution insights
- Tests: P/F/S, failing names
- Editor.log: kinds, top errors
- Build report: size, top assets, errors/warnings
- Gaps: missing XML / missing reports
- Next: owner + fix per failing item
```
