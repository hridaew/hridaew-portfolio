# Domis UX diagrams (authored)

Drop designer exports here, then point `src/components/domis/domis-ux-diagram-assets.ts` at the file.

Coded React flows stay as fallback until a path is set.

## Recommended filenames

| Diagram | Suggested file |
| --- | --- |
| Address user flow | `address-intelligence-lanes.svg` (live) |
| Appliance task flow | `appliance-task-flow.svg` (live) |

Re-process Figma exports for dark board + node inner shadows:

```bash
node scripts/process-ux-diagrams.mjs
```

## Export from FigJam / Figma

1. Design on a dark board close to `#141416` so it matches the case-study chrome (or export with a transparent background and keep the site’s `.dud-board` frame).
2. Select the frame → **Export** → **SVG** (preferred) or **PNG @2x**.
3. Save into this folder.
4. In `domis-ux-diagram-assets.ts`, set e.g.  
   `addressUserFlow: "/assets/domis/diagrams/address-user-flow.svg"`.
5. Refresh `/domis` — the embed replaces the coded diagram automatically.

### Tips

- Bake titles (“User flow”, “Create a home…”) into the export **or** leave them out and keep the React `type` / `heading` props.
- Wide flows use the journey-map breakout, scroll horizontally with edge fades, and zoom by scaling the diagram width.
- Avoid live Figma/FigJam embeds on the case study (scroll fights, auth, wrong chrome). Static SVG/PNG is the portfolio path.
- Keep node text short; connectors should be drawn in the design tool so nothing “almost connects.”

## Wire-up (already in the case study)

```tsx
<DomisUxDiagramEmbed
  wide
  scrollable
  type="User flow"
  heading="Create a home from an address"
  src={domisUxDiagramAssets.addressUserFlow}
  alt="…"
  fallback={<DomisAddressUserFlow />}
/>
```
