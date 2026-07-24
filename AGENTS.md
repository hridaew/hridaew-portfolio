# Agent notes

## Subagents

Always use a Grok model for `Task` / subagent calls (e.g. `cursor-grok-4.5-high` or `cursor-grok-4.5-high-fast`). Do not spawn Claude, GPT, Composer, or other non-Grok subagents unless the user explicitly overrides this rule.

## User flow diagrams

When creating or updating user/task flow diagrams, follow `docs/skills/user-flow-diagramming.md` (Mermaid `graph TD` as source of truth, then translate into the case-study renderer).
