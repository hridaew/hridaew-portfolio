# Agent notes

## Subagents

Always use a Grok model for `Task` / subagent calls (e.g. `cursor-grok-4.5-high` or `cursor-grok-4.5-high-fast`). Do not spawn Claude, GPT, Composer, or other non-Grok subagents unless the user explicitly overrides this rule.
