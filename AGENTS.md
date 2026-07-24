# Agent notes

## Subagents

Always use a Grok model for `Task` / subagent calls (e.g. `cursor-grok-4.5-high` or `cursor-grok-4.5-high-fast`). Do not spawn Claude, GPT, Composer, or other non-Grok subagents unless the user explicitly overrides this rule.

## User flow diagrams

Prefer designer-authored embeds for Domis address/appliance flows:
1. Export SVG/PNG into `public/assets/domis/diagrams/` (see that folder’s README).
2. Set the path in `src/components/domis/domis-ux-diagram-assets.ts`.
3. `DomisUxDiagramEmbed` swaps in the asset; coded React flows are fallbacks only.

If you must rebuild a flow in code, follow `docs/skills/user-flow-diagramming.md` (Mermaid `graph TD` as topology, then translate into the case-study renderer).
