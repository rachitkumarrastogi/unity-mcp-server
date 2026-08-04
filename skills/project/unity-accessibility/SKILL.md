---
name: unity-accessibility
description: >-
  Use when auditing Unity Accessibility: screen readers, AccessibilityNode,
  AssistiveSupport (desktop Narrator/VoiceOver support from Unity 6.3+).
---
# Accessibility

## Discovery

1. `get_accessibility_stack` — module/package + API script hits
2. `list_ui_documents` — UI Toolkit screens that need accessible labels
3. `find_scripts_by_content` — `AccessibilityNode`, `AssistiveSupport`

## Checklist

- Mobile (TalkBack / VoiceOver) and desktop (Narrator / VoiceOver) paths both matter on Unity 6.3+.
- Every interactive control should expose role + label; test with screen reader on.
- Keep hierarchy order matching visual reading order for focus traversal.
- Do not rely on color alone for critical state.

## Related

- `unity-ui-toolkit-tmp`, `unity-qa-scene-coverage`
