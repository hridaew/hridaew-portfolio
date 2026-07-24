"use client";

import "./flow-reference.css";

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

function Squircle({
  x,
  y,
  w,
  h,
  label,
  lines,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  lines?: string[];
}) {
  const cx = x + w / 2;
  const cy = y + h / 2;
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
      {label ? (
        <text className="dfr-node-label" x={cx} y={cy}>
          {label}
        </text>
      ) : null}
      {lines?.map((line, i) => (
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

function Process({
  x,
  y,
  w,
  h,
  label,
  lines,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  lines?: string[];
}) {
  const cx = x + w / 2;
  const cy = y + h / 2;
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
      {label ? (
        <text className="dfr-node-label" x={cx} y={cy}>
          {label}
        </text>
      ) : null}
      {lines?.map((line, i) => (
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

function Decision({
  cx,
  cy,
  size = 90,
  lines,
}: {
  cx: number;
  cy: number;
  size?: number;
  lines: string[];
}) {
  const half = size / 2;
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

function InputPara({
  x,
  y,
  w,
  h,
  lines,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  lines: string[];
}) {
  const skew = 16;
  const cx = x + w / 2;
  const cy = y + h / 2;
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

function Cylinder({
  x,
  y,
  w,
  h,
  lines,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  lines: string[];
}) {
  const rx = w / 2;
  const ry = Math.min(12, h * 0.18);
  const cx = x + w / 2;
  const top = y + ry;
  const bot = y + h - ry;
  const textCy = y + h / 2 + 2;
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
          y={textCy - ((lines.length - 1) * 7) / 2 + i * 14}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function LaneBands({
  width,
  ownerY,
  ownerH,
  backY,
  backH,
}: {
  width: number;
  ownerY: number;
  ownerH: number;
  backY: number;
  backH: number;
}) {
  return (
    <g aria-hidden>
      <rect
        className="dfr-lane-band"
        x={0}
        y={ownerY}
        width={width}
        height={ownerH}
      />
      <rect
        className="dfr-lane-band-back"
        x={0}
        y={backY}
        width={width}
        height={backH}
      />
      <text className="dfr-lane-label" x={18} y={ownerY + 22}>
        Owner
      </text>
      <text className="dfr-lane-label" x={18} y={backY + 22}>
        Backend / AI
      </text>
    </g>
  );
}

function AddressLaneDiagram() {
  const W = 1760;
  const H = 620;
  const ownerY = 8;
  const ownerH = 320;
  const backY = 328;
  const backH = 284;
  const oy = 120;
  const by = 460;
  const m = "addr";

  // Useful-data decision
  const ud = { cx: 820, cy: oy, half: 45 };
  // Outcome column
  const ox = 920;
  const reviewY = oy - 28;
  const leaveY = 195;
  const emptyY = 265;

  return (
    <div className="dfr-board">
      <svg
        className="dfr-svg"
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        role="img"
        aria-label="Address intelligence user flow with owner and backend AI lanes"
      >
        <MarkerDefs prefix={m} />
        <LaneBands
          width={W}
          ownerY={ownerY}
          ownerH={ownerH}
          backY={backY}
          backH={backH}
        />

        {/* Start → Enter */}
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d="M 118 120 H 150"
        />
        {/* Enter → Autofill? */}
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d="M 290 120 H 330"
        />
        {/* Yes → Choose autofill */}
        <path
          className="dfr-edge dfr-edge-yes"
          markerEnd={`url(#${m}-arrow-yes)`}
          d="M 420 120 H 460"
        />
        {/* No → Type manually */}
        <path
          className="dfr-edge dfr-edge-no"
          markerEnd={`url(#${m}-arrow-no)`}
          d="M 375 165 V 230 H 460"
        />
        {/* Merge into backend */}
        <path className="dfr-edge dfr-edge-cross" d="M 600 120 H 630 V 300" />
        <path className="dfr-edge dfr-edge-cross" d="M 600 230 H 630" />
        <path
          className="dfr-edge dfr-edge-cross"
          markerEnd={`url(#${m}-arrow-cross)`}
          d="M 630 300 V 428"
        />

        {/* Backend chain */}
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d="M 790 460 H 820"
        />
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d="M 970 460 H 1000"
        />
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d="M 1160 460 H 1190"
        />
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d="M 1350 460 H 1380"
        />

        {/* Consensus → Useful data? (bottom tip) */}
        <path
          className="dfr-edge dfr-edge-cross"
          markerEnd={`url(#${m}-arrow-cross)`}
          d={`M 1460 428 V 300 H ${ud.cx} V ${ud.cy + ud.half}`}
        />

        {/* Yes → Review */}
        <path
          className="dfr-edge dfr-edge-yes"
          markerEnd={`url(#${m}-arrow-yes)`}
          d={`M ${ud.cx + ud.half} ${oy} H ${ox}`}
        />
        {/* Drop trunk + Incomplete / Fail */}
        <path
          className="dfr-edge"
          d={`M ${ud.cx} ${ud.cy + ud.half} V 223`}
        />
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d={`M ${ud.cx} 223 H ${ox}`}
        />
        <path className="dfr-edge dfr-edge-no" d={`M ${ud.cx} 223 V 293`} />
        <path
          className="dfr-edge dfr-edge-no"
          markerEnd={`url(#${m}-arrow-no)`}
          d={`M ${ud.cx} 293 H ${ox}`}
        />

        {/* Rejoin → Optional edits */}
        <path className="dfr-edge" d="M 1060 120 H 1095" />
        <path className="dfr-edge" d="M 1060 223 H 1095 V 120" />
        <path className="dfr-edge" d="M 1060 293 H 1095" />
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d="M 1095 120 H 1130"
        />

        {/* Optional → Photo → End */}
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d="M 1270 120 H 1310"
        />
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d="M 1450 120 H 1490"
        />
        <path
          className="dfr-edge dfr-edge-soft"
          markerEnd={`url(#${m}-arrow)`}
          d="M 1380 148 V 175 H 1555 V 148"
        />

        <text className="dfr-branch dfr-branch-yes" x="432" y="108">
          Yes
        </text>
        <text className="dfr-branch dfr-branch-no" x="388" y="205">
          No
        </text>
        <text className="dfr-branch dfr-branch-yes" x="870" y="108">
          Yes
        </text>
        <text className="dfr-branch" x="835" y="212">
          Incomplete
        </text>
        <text className="dfr-branch dfr-branch-no" x="850" y="282">
          Fail
        </text>
        <text className="dfr-branch" x="1395" y="168">
          Skip
        </text>
        <text className="dfr-branch" x="1140" y="318" textAnchor="middle">
          consensus returns to owner
        </text>

        <circle className="dfr-dot" cx="630" cy="300" r="3.2" />
        <circle className="dfr-dot" cx="1095" cy="120" r="3.2" />
        <circle className="dfr-dot" cx={ud.cx} cy="223" r="3.2" />

        {/* Owner */}
        <Squircle x={20} y={oy - 28} w={98} h={56} label="Start" />
        <InputPara x={150} y={oy - 30} w={140} h={60} lines={["Enter address"]} />
        <Decision
          cx={375}
          cy={oy}
          size={90}
          lines={["Autofill", "looks right?"]}
        />
        <Process x={460} y={oy - 28} w={140} h={56} label="Choose autofill" />
        <Process x={460} y={202} w={140} h={56} label="Type manually" />

        <Decision
          cx={ud.cx}
          cy={ud.cy}
          size={90}
          lines={["Useful data", "returned?"]}
        />
        <Process
          x={ox}
          y={reviewY}
          w={140}
          h={56}
          lines={["Review what", "came back"]}
        />
        <Process
          x={ox}
          y={leaveY}
          w={140}
          h={56}
          lines={["Leave blanks,", "fill later"]}
        />
        <Process
          x={ox}
          y={emptyY}
          w={140}
          h={56}
          lines={["Empty form,", "enter manually"]}
        />

        <Process
          x={1130}
          y={oy - 28}
          w={140}
          h={56}
          lines={["Optional edits /", "name spaces"]}
        />
        <Process
          x={1310}
          y={oy - 28}
          w={140}
          h={56}
          lines={["Edit or replace", "photo"]}
        />
        <Squircle x={1490} y={oy - 28} w={130} h={56} label="Home created" />

        {/* Backend / AI */}
        <Process
          x={560}
          y={by - 32}
          w={230}
          h={64}
          lines={["Resolve address", "+ property context"]}
        />
        <Process
          x={820}
          y={by - 32}
          w={150}
          h={64}
          lines={["Run 3 home-fact", "searches"]}
        />
        <Cylinder
          x={1000}
          y={by - 40}
          w={160}
          h={80}
          lines={["Source results", "(3 runs)"]}
        />
        <Process
          x={1190}
          y={by - 32}
          w={160}
          h={64}
          lines={["Review agent", "cross-references"]}
        />
        <Cylinder
          x={1380}
          y={by - 40}
          w={170}
          h={80}
          lines={["Consensus fields", "or blanks"]}
        />
      </svg>
    </div>
  );
}

function ApplianceLaneDiagram() {
  const W = 1760;
  const H = 600;
  const ownerY = 8;
  const ownerH = 300;
  const backY = 308;
  const backH = 284;
  const oy = 120;
  const by = 440;
  const m = "app";
  const rd = { cx: 600, cy: oy, half: 45 };

  return (
    <div className="dfr-board">
      <svg
        className="dfr-svg"
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        role="img"
        aria-label="Appliance intelligence task flow with owner and backend AI lanes"
      >
        <MarkerDefs prefix={m} />
        <LaneBands
          width={W}
          ownerY={ownerY}
          ownerH={ownerH}
          backY={backY}
          backH={backH}
        />

        {/* Start → Open → Photo */}
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d="M 118 120 H 150"
        />
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d="M 290 120 H 330"
        />
        {/* Skip → Manual */}
        <path
          className="dfr-edge dfr-edge-no"
          markerEnd={`url(#${m}-arrow-no)`}
          d="M 220 148 V 230 H 330"
        />
        {/* Photo → vision extract */}
        <path
          className="dfr-edge dfr-edge-cross"
          markerEnd={`url(#${m}-arrow-cross)`}
          d="M 400 148 V 290 H 520 V 408"
        />

        {/* Backend extract → candidates */}
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d="M 680 440 H 720"
        />
        {/* Candidates → Readable? */}
        <path
          className="dfr-edge dfr-edge-cross"
          markerEnd={`url(#${m}-arrow-cross)`}
          d={`M 800 408 V 290 H ${rd.cx} V ${rd.cy + rd.half}`}
        />

        {/* Yes → Confirm */}
        <path
          className="dfr-edge dfr-edge-yes"
          markerEnd={`url(#${m}-arrow-yes)`}
          d={`M ${rd.cx + rd.half} ${oy} H 700`}
        />
        {/* Incomplete over top → Confirm */}
        <path
          className="dfr-edge dfr-edge-soft"
          markerEnd={`url(#${m}-arrow)`}
          d={`M ${rd.cx} ${rd.cy - rd.half} H 770 V 92`}
        />
        {/* No → Retake */}
        <path
          className="dfr-edge dfr-edge-no"
          markerEnd={`url(#${m}-arrow-no)`}
          d={`M ${rd.cx} ${rd.cy + rd.half} V 202`}
        />
        {/* Retake → Photo */}
        <path
          className="dfr-edge dfr-edge-soft"
          markerEnd={`url(#${m}-arrow)`}
          d="M 600 258 H 400 V 148"
        />
        {/* Retake → Manual */}
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d="M 530 230 H 470"
        />
        {/* Manual → Confirm */}
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d="M 400 258 V 280 H 770 V 148"
        />

        {/* Confirm → Attach */}
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d="M 840 120 H 900"
        />
        {/* Confirm also kicks link search */}
        <path
          className="dfr-edge dfr-edge-cross"
          markerEnd={`url(#${m}-arrow-cross)`}
          d="M 770 148 V 290 H 980 V 408"
        />

        {/* Backend link chain */}
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d="M 1140 440 H 1180"
        />
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d="M 1330 440 H 1360"
        />
        {/* Ranked links → Attach */}
        <path
          className="dfr-edge dfr-edge-cross"
          markerEnd={`url(#${m}-arrow-cross)`}
          d="M 1440 408 V 290 H 970 V 148"
        />

        {/* Attach → End */}
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d="M 1040 120 H 1200"
        />
        {/* Not found → Save without */}
        <path
          className="dfr-edge dfr-edge-no"
          markerEnd={`url(#${m}-arrow-no)`}
          d="M 970 148 V 202"
        />
        {/* Save without → End */}
        <path
          className="dfr-edge"
          markerEnd={`url(#${m}-arrow)`}
          d="M 1040 230 H 1280 V 148"
        />

        <text className="dfr-branch dfr-branch-no" x="232" y="195">
          Skip / no camera
        </text>
        <text className="dfr-branch dfr-branch-yes" x="655" y="108">
          Yes
        </text>
        <text className="dfr-branch" x="615" y="68">
          Incomplete
        </text>
        <text className="dfr-branch dfr-branch-no" x="545" y="188">
          No
        </text>
        <text className="dfr-branch" x="480" y="250">
          Retake
        </text>
        <text className="dfr-branch" x="485" y="220">
          Manual
        </text>
        <text className="dfr-branch dfr-branch-no" x="985" y="185">
          Not found
        </text>
        <text className="dfr-branch" x="460" y="312" textAnchor="middle">
          vision extract
        </text>
        <text className="dfr-branch" x="1210" y="312" textAnchor="middle">
          manuals / parts links
        </text>

        <circle className="dfr-dot" cx="400" cy="290" r="3.2" />
        <circle className="dfr-dot" cx="980" cy="290" r="3.2" />

        {/* Owner */}
        <Squircle x={20} y={oy - 28} w={98} h={56} label="Start" />
        <Process x={150} y={oy - 28} w={140} h={56} label="Open capture" />
        <Process
          x={330}
          y={oy - 28}
          w={140}
          h={56}
          lines={["Photograph", "the label"]}
        />
        <Process x={330} y={202} w={140} h={56} label="Manual entry" />

        <Decision
          cx={rd.cx}
          cy={rd.cy}
          size={90}
          lines={["Extract", "readable?"]}
        />
        <Process x={530} y={202} w={140} h={56} label="Retake photo" />

        <Process x={700} y={oy - 28} w={140} h={56} label="Confirm identity" />
        <Process
          x={900}
          y={oy - 28}
          w={140}
          h={56}
          lines={["Attach useful", "links"]}
        />
        <Process
          x={900}
          y={202}
          w={140}
          h={56}
          lines={["Save without", "links"]}
        />
        <Squircle
          x={1200}
          y={oy - 28}
          w={170}
          h={56}
          lines={["Appliance", "on home"]}
        />

        {/* Backend / AI */}
        <Process
          x={520}
          y={by - 32}
          w={160}
          h={64}
          lines={["Vision model", "reads label"]}
        />
        <Cylinder
          x={720}
          y={by - 40}
          w={160}
          h={80}
          lines={["Brand / model", "candidates"]}
        />
        <Process
          x={980}
          y={by - 32}
          w={160}
          h={64}
          lines={["Search manuals", "+ parts links"]}
        />
        <Cylinder
          x={1180}
          y={by - 40}
          w={150}
          h={80}
          lines={["Link results", "or none"]}
        />
        <Process
          x={1360}
          y={by - 32}
          w={160}
          h={64}
          lines={["Rank useful", "attachments"]}
        />
      </svg>
    </div>
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

/**
 * Standalone reference: both Domis flows with Owner + Backend/AI lanes.
 * Open /domis/flow-reference — not linked from the case study.
 */
export function DomisFlowReference() {
  return (
    <div className="dfr-page">
      <div className="dfr-inner">
        <p className="dfr-kicker">Domis · UX reference</p>
        <h1 className="dfr-title">Address + appliance flows</h1>
        <p className="dfr-lede">
          One-off reference board. Same owner journeys as the case study, plus a
          Backend / AI lane for searches, vision extract, consensus, and link
          lookup. Cross-lane connectors are blue-grey; green is Yes; red is No /
          fail.
        </p>

        <section className="dfr-section">
          <h2 className="dfr-section-title">1. Address intelligence</h2>
          <AddressLaneDiagram />
        </section>

        <section className="dfr-section">
          <h2 className="dfr-section-title">2. Appliance intelligence</h2>
          <ApplianceLaneDiagram />
        </section>

        <Legend />

        <p className="dfr-note">
          Reference only — not used on the case study page. For polished embeds
          on /domis, export from FigJam into{" "}
          <code>public/assets/domis/diagrams/</code>.{" "}
          <a href="/domis">Back to Domis case study</a>
        </p>
      </div>
    </div>
  );
}
