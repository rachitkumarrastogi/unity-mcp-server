---
name: unity-llm-integration
description: >-
  Use when adding LLM/chat/RAG features to a Unity game or tool: API keys,
  prompt assets, safety, latency, and server-side vs client-side calls.
---
# Unity LLM integration

## Discovery

1. `find_ai_related_scripts` — label **LLM / chat APIs**
2. `list_ai_prompt_or_config_assets` — JSON/MD with prompt-like keys under Assets
3. `get_ai_stack_summary` with `include_prompt_assets: true`

## Security & architecture

- **Never** commit API keys; use environment variables, Unity Cloud Code, or your backend proxy.
- Prefer **server-mediated** LLM calls for shipping titles (rate limits, moderation, cost).
- For editor-only tools, ScriptableObject prompts are OK if no secrets are embedded.

## UX patterns

- Stream responses to UI (TMP) with cancellation tokens.
- Cache embeddings locally only when license/privacy allows.
- Cap token usage per session for live games.

## Audit workflow

1. `find_ai_related_scripts` for hardcoded endpoints
2. `search_project` with `script_pattern: OpenAI` or `Anthropic`
3. Review `list_ai_prompt_or_config_assets` for PII in prompts
