/**
 * Designer-authored Domis UX diagrams.
 *
 * Drop exports in `public/assets/domis/diagrams/` then set the path here.
 * Prefer SVG; PNG/WebP @2x is fine for soft shadows. Leave `null` to keep
 * the coded React fallback in the case study.
 *
 * Export notes: see `public/assets/domis/diagrams/README.md`
 */
export const domisUxDiagramAssets = {
  addressUserFlow: "/assets/domis/diagrams/address-intelligence-lanes.svg?v=dark-connectors",
  applianceTaskFlow: "/assets/domis/diagrams/appliance-task-flow.svg?v=dark-connectors",
} as const;
