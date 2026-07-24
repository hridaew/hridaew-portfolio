"use client";

import classified from "./flow-classified.json";
import type { FlowLayout } from "./flow-layouts";
import "./flow-reference.css";

type Shape = "start_end" | "decision" | "process" | "data" | "input";
type Lane = "owner" | "backend";
type EdgeKind = "default" | "yes" | "no" | "soft" | "cross";

type ClassifiedNode = {
  id: string;
  label: string;
  labelLines?: string[];
  shape: Shape;
  lane: Lane;
  note?: string;
};

type ClassifiedEdge = {
  from: string;
  to: string;
  label: string | null;
  kind: EdgeKind;
};

type ClassifiedFlow = {
  title: string;
  nodes: ClassifiedNode[];
  edges: ClassifiedEdge[];
};

type Box = {
  id: string;
  shape: Shape;
  lane: Lane;
  label: string;
  lines: string[];
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
};

const DECISION_SIZE = 90;

function defaultSize(shape: Shape): { w: number; h: number } {
  switch (shape) {
    case "start_end":
      return { w: 120, h: 56 };
    case "decision":
      return { w: DECISION_SIZE, h: DECISION_SIZE };
    case "data":
      return { w: 150, h: 80 };
    case "input":
      return { w: 140, h: 60 };
    default:
      return { w: 140, h: 56 };
  }
}

function resolveBoxes(
  flow: ClassifiedFlow,
  layout: FlowLayout,
): Map<string, Box> {
  const byId = new Map(flow.nodes.map((n) => [n.id, n]));
  const boxes = new Map<string, Box>();

  for (const pos of layout.nodes) {
    const node = byId.get(pos.id);
    if (!node) continue;
    const fallback = defaultSize(node.shape);
    const w = pos.w ?? fallback.w;
    const h = pos.h ?? fallback.h;
    boxes.set(pos.id, {
      id: pos.id,
      shape: node.shape,
      lane: node.lane,
      label: node.label,
      lines: node.labelLines ?? [node.label],
      x: pos.x,
      y: pos.y,
      w,
      h,
      cx: pos.x + w / 2,
      cy: pos.y + h / 2,
    });
  }

  return boxes;
}

function MarkerDefs({ prefix }: { prefix: string }) {
  return (
    <defs>
      <marker
        id={`${prefix}-arrow`}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#9a9aa8" />
      </marker>
      <marker
        id={`${prefix}-arrow-yes`}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3d9a5f" />
      </marker>
      <marker
        id={`${prefix}-arrow-no`}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#c45c5c" />
      </marker>
      <marker
        id={`${prefix}-arrow-cross`}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#7a8faf" />
      </marker>
    </defs>
  );
}

function NodeShape({ box }: { box: Box }) {
  const { x, y, w, h, cx, cy, shape, lines } = box;

  if (shape === "start_end") {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={h * 0.42}
          ry={h * 0.42}
          fill="#d9d9e2"
          stroke="#8e8e9a"
          strokeWidth={1.4}
        />
        {lines.map((line, i) => (
          <text
            key={line}
            className="dfr-node-label dfr-node-label-sm"
            x={cx}
            y={cy - ((lines.length - 1) * 7) / 2 + i * 14}
          >
            {line}
          </text>
        ))}
      </g>
    );
  }

  if (shape === "decision") {
    const half = w / 2;
    return (
      <g>
        <polygon
          points={`${cx},${cy - half} ${cx + half},${cy} ${cx},${cy + half} ${cx - half},${cy}`}
          fill="#eaf6ee"
          stroke="#6fb889"
          strokeWidth={1.5}
        />
        {lines.map((line, i) => (
          <text
            key={line}
            className="dfr-node-label dfr-node-label-sm"
            x={cx}
            y={cy - ((lines.length - 1) * 6.5) / 2 + i * 13}
          >
            {line}
          </text>
        ))}
      </g>
    );
  }

  if (shape === "input") {
    const skew = 16;
    const points = `${x + skew},${y} ${x + w},${y} ${x + w - skew},${y + h} ${x},${y + h}`;
    return (
      <g>
        <polygon
          points={points}
          fill="#d7eaf8"
          stroke="#6ea0c8"
          strokeWidth={1.4}
        />
        {lines.map((line, i) => (
          <text
            key={line}
            className="dfr-node-label dfr-node-label-sm"
            x={cx}
            y={cy - ((lines.length - 1) * 7) / 2 + i * 14}
          >
            {line}
          </text>
        ))}
      </g>
    );
  }

  if (shape === "data") {
    const rx = w / 2;
    const ry = Math.min(12, h * 0.18);
    const top = y + ry;
    const bot = y + h - ry;
    return (
      <g>
        <path
          d={`M ${x} ${top}
              L ${x} ${bot}
              A ${rx} ${ry} 0 0 0 ${x + w} ${bot}
              L ${x + w} ${top}
              A ${rx} ${ry} 0 0 0 ${x} ${top}
              Z`}
          fill="#f7e7a6"
          stroke="#c9a84a"
          strokeWidth={1.4}
        />
        <ellipse
          cx={cx}
          cy={top}
          rx={rx}
          ry={ry}
          fill="#fbefc2"
          stroke="#c9a84a"
          strokeWidth={1.4}
        />
        {lines.map((line, i) => (
          <text
            key={line}
            className="dfr-node-label dfr-node-label-sm"
            x={cx}
            y={cy + 2 - ((lines.length - 1) * 7) / 2 + i * 14}
          >
            {line}
          </text>
        ))}
      </g>
    );
  }

  // process
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        ry={8}
        fill="#ebe4f7"
        stroke="#9b8fc4"
        strokeWidth={1.4}
      />
      {lines.map((line, i) => (
        <text
          key={line}
          className="dfr-node-label dfr-node-label-sm"
          x={cx}
          y={cy - ((lines.length - 1) * 7) / 2 + i * 14}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function edgeKey(e: ClassifiedEdge) {
  return `${e.from}>${e.to}>${e.label ?? ""}`;
}

function autoPath(from: Box, to: Box, kind: EdgeKind): string {
  // Cross-lane: drop/rise via a mid rail then into target
  if (kind === "cross" || from.lane !== to.lane) {
    const midY = from.lane === "owner" ? Math.max(from.y + from.h + 24, 300) : 300;
    if (from.cy < to.cy) {
      // owner → backend
      return `M ${from.cx} ${from.y + from.h} V ${midY} H ${to.cx} V ${to.y}`;
    }
    // backend → owner
    return `M ${from.cx} ${from.y} V ${midY} H ${to.cx} V ${to.y + to.h}`;
  }

  // Same lane, mostly left → right
  if (Math.abs(from.cy - to.cy) < 18) {
    return `M ${from.x + from.w} ${from.cy} H ${to.x}`;
  }

  // Branch down/up then into side
  if (to.cy > from.cy) {
    return `M ${from.cx} ${from.y + from.h} V ${to.cy} H ${to.x}`;
  }
  return `M ${from.cx} ${from.y} V ${to.cy} H ${to.x}`;
}

function markerFor(prefix: string, kind: EdgeKind) {
  if (kind === "yes") return `url(#${prefix}-arrow-yes)`;
  if (kind === "no") return `url(#${prefix}-arrow-no)`;
  if (kind === "cross") return `url(#${prefix}-arrow-cross)`;
  return `url(#${prefix}-arrow)`;
}

function classFor(kind: EdgeKind) {
  if (kind === "yes") return "dfr-edge dfr-edge-yes";
  if (kind === "no") return "dfr-edge dfr-edge-no";
  if (kind === "soft") return "dfr-edge dfr-edge-soft";
  if (kind === "cross") return "dfr-edge dfr-edge-cross";
  return "dfr-edge";
}

function labelClass(kind: EdgeKind) {
  if (kind === "yes") return "dfr-branch dfr-branch-yes";
  if (kind === "no") return "dfr-branch dfr-branch-no";
  return "dfr-branch";
}

function FlowBoard({
  flow,
  layout,
  prefix,
}: {
  flow: ClassifiedFlow;
  layout: FlowLayout;
  prefix: string;
}) {
  const boxes = resolveBoxes(flow, layout);
  const missing = flow.nodes.filter((n) => !boxes.has(n.id));

  return (
    <div className="dfr-board">
      {missing.length > 0 ? (
        <p className="dfr-note" style={{ padding: "0.75rem 1rem 0" }}>
          Layout missing nodes: {missing.map((n) => n.id).join(", ")}
        </p>
      ) : null}
      <svg
        className="dfr-svg"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        width={layout.width}
        height={layout.height}
        role="img"
        aria-label={`${flow.title} flow with owner and backend AI lanes`}
      >
        <MarkerDefs prefix={prefix} />

        <rect
          className="dfr-lane-band"
          x={0}
          y={layout.ownerY}
          width={layout.width}
          height={layout.ownerH}
        />
        <rect
          className="dfr-lane-band-back"
          x={0}
          y={layout.backY}
          width={layout.width}
          height={layout.backH}
        />
        <text className="dfr-lane-label" x={18} y={layout.ownerY + 22}>
          Owner
        </text>
        <text className="dfr-lane-label" x={18} y={layout.backY + 22}>
          Backend / AI
        </text>

        {flow.edges.map((edge) => {
          const from = boxes.get(edge.from);
          const to = boxes.get(edge.to);
          if (!from || !to) return null;
          const key = edgeKey(edge);
          const d = layout.edgePaths?.[key] ?? autoPath(from, to, edge.kind);
          // Place branch labels near the source node so they stay readable
          let labelX = from.cx + 18;
          let labelY = from.cy - 14;
          if (edge.kind === "no" || to.cy > from.cy + 20) {
            labelX = from.cx + 10;
            labelY = from.y + from.h + 14;
          }
          if (edge.label === "Incomplete") {
            labelX = from.cx + 8;
            labelY = from.y - 8;
          }
          if (edge.label === "Skip" || edge.label === "Not found") {
            labelX = from.cx - 10;
            labelY = from.y + from.h + 16;
          }
          return (
            <g key={key}>
              <path
                className={classFor(edge.kind)}
                markerEnd={markerFor(prefix, edge.kind)}
                d={d}
              />
              {edge.label ? (
                <text className={labelClass(edge.kind)} x={labelX} y={labelY}>
                  {edge.label}
                </text>
              ) : null}
            </g>
          );
        })}

        {[...boxes.values()].map((box) => (
          <NodeShape key={box.id} box={box} />
        ))}
      </svg>
    </div>
  );
}

function ShapeCounts({ flow }: { flow: ClassifiedFlow }) {
  const counts: Record<Shape, number> = {
    start_end: 0,
    decision: 0,
    process: 0,
    data: 0,
    input: 0,
  };
  for (const n of flow.nodes) counts[n.shape] += 1;

  return (
    <p className="dfr-counts">
      Shapes used:{" "}
      <strong>{counts.start_end}</strong> start/end ·{" "}
      <strong>{counts.decision}</strong> decision ·{" "}
      <strong>{counts.process}</strong> process ·{" "}
      <strong>{counts.data}</strong> data ·{" "}
      <strong>{counts.input}</strong> input
    </p>
  );
}

function Legend() {
  return (
    <section className="dfr-legend" aria-label="Shape legend">
      <h2 className="dfr-legend-title">Legend</h2>

      <div className="dfr-legend-item">
        <svg className="dfr-legend-swatch" viewBox="0 0 52 34">
          <rect
            x="2"
            y="4"
            width="48"
            height="26"
            rx="13"
            fill="#d9d9e2"
            stroke="#8e8e9a"
          />
        </svg>
        Start / End
      </div>

      <div className="dfr-legend-item">
        <svg className="dfr-legend-swatch" viewBox="0 0 52 34">
          <polygon
            points="26,3 48,17 26,31 4,17"
            fill="#eaf6ee"
            stroke="#6fb889"
          />
        </svg>
        Decision
      </div>

      <div className="dfr-legend-item">
        <svg className="dfr-legend-swatch" viewBox="0 0 52 34">
          <rect
            x="4"
            y="6"
            width="44"
            height="22"
            rx="5"
            fill="#ebe4f7"
            stroke="#9b8fc4"
          />
        </svg>
        Process
      </div>

      <div className="dfr-legend-item">
        <svg className="dfr-legend-swatch" viewBox="0 0 52 34">
          <path
            d="M6 10 V24 A20 6 0 0 0 46 24 V10 A20 6 0 0 0 6 10 Z"
            fill="#f7e7a6"
            stroke="#c9a84a"
          />
          <ellipse
            cx="26"
            cy="10"
            rx="20"
            ry="6"
            fill="#fbefc2"
            stroke="#c9a84a"
          />
        </svg>
        Data
      </div>

      <div className="dfr-legend-item">
        <svg className="dfr-legend-swatch" viewBox="0 0 52 34">
          <polygon
            points="12,6 48,6 40,28 4,28"
            fill="#d7eaf8"
            stroke="#6ea0c8"
          />
        </svg>
        Input
      </div>
    </section>
  );
}

const ADDRESS_AUTHORED_SRC =
  "/assets/domis/diagrams/address-intelligence-lanes.svg";
const APPLIANCE_AUTHORED_SRC =
  "/assets/domis/diagrams/appliance-task-flow.svg";

/**
 * Standalone reference built from classified flow JSON.
 * Pipeline: narrative → shape classification → this board.
 * Both boards prefer the Figma-authored SVG when present.
 * Open /domis/flow-reference
 */
export function DomisFlowReference() {
  const address = classified.address as ClassifiedFlow;
  const appliance = classified.appliance as ClassifiedFlow;

  return (
    <div className="dfr-page">
      <div className="dfr-inner">
        <p className="dfr-kicker">Domis · UX reference</p>
        <h1 className="dfr-title">Address + appliance flows</h1>
        <p className="dfr-lede">
          Figma exports with dark-board colors and start/stop-style inner-shadow
          FX on every node. Green = Yes, red = No / fail.
        </p>

        <section className="dfr-section">
          <h2 className="dfr-section-title">1. {address.title}</h2>
          <p className="dfr-counts">
            <strong>Figma authored</strong> · Owner + Backend / AI lanes ·
            start/end, decision, process, data, input
          </p>
          <div className="dfr-authored-frame">
            <img
              className="dfr-authored-img"
              src={ADDRESS_AUTHORED_SRC}
              alt="Address intelligence dual-lane user flow"
              width={3987}
              height={1112}
            />
          </div>
        </section>

        <section className="dfr-section">
          <h2 className="dfr-section-title">2. {appliance.title}</h2>
          <p className="dfr-counts">
            <strong>Figma authored</strong> · Task flow · start/end, decision,
            process, data, input
          </p>
          <div className="dfr-authored-frame">
            <img
              className="dfr-authored-img"
              src={APPLIANCE_AUTHORED_SRC}
              alt="Appliance intelligence task flow"
              width={4716}
              height={909}
            />
          </div>
        </section>

        <Legend />

        <p className="dfr-note">
          Address SVG:{" "}
          <code>public/assets/domis/diagrams/address-intelligence-lanes.svg</code>
          {" · "}
          Appliance SVG:{" "}
          <code>public/assets/domis/diagrams/appliance-task-flow.svg</code>.{" "}
          <a href="/domis">Back to Domis case study</a>
          {" · "}
          <a href="/domis/flow-reference">Permalink</a>
        </p>
      </div>
    </div>
  );
}
