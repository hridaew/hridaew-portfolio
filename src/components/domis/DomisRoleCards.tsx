/** Four animated responsibility cards (moved from the overview block). */
export function DomisRoleCards() {
  return (
    <ul className="dcs-roles">
      <li className="dcs-role-card">
        <span className="dcs-role-icon dcs-role-icon-layers" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              className="dcs-role-layer dcs-role-layer-1"
              d="M14 3.5 L24.5 9 L14 14.5 L3.5 9 Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              className="dcs-role-layer dcs-role-layer-2"
              d="M3.5 14 L14 19.5 L24.5 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              className="dcs-role-layer dcs-role-layer-3"
              d="M3.5 18.5 L14 24 L24.5 18.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="site-body text-ink-muted">
          Own product design end to end, along with the design system it
          ships on.
        </span>
      </li>
      <li className="dcs-role-card">
        <span className="dcs-role-icon dcs-role-icon-phases" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              className="dcs-role-axis"
              d="M4 24 V4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <rect
              className="dcs-role-bar dcs-role-bar-1"
              x="8"
              y="5"
              width="7"
              height="5.5"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <rect
              className="dcs-role-bar dcs-role-bar-2"
              x="14"
              y="15.5"
              width="10"
              height="5.5"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              className="dcs-role-tick dcs-role-tick-1"
              d="M15 7.75 H24"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              className="dcs-role-tick dcs-role-tick-2"
              d="M4 18.25 H14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="site-body text-ink-muted">
          Define the phases of design and development, and what gets built
          when.
        </span>
      </li>
      <li className="dcs-role-card">
        <span className="dcs-role-icon dcs-role-icon-collab" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle
              className="dcs-role-node dcs-role-node-1"
              cx="14"
              cy="6"
              r="3"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              className="dcs-role-node dcs-role-node-2"
              cx="6"
              cy="21"
              r="3"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              className="dcs-role-node dcs-role-node-3"
              cx="22"
              cy="21"
              r="3"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              className="dcs-role-link dcs-role-link-1"
              d="M11.8 8.4 L7.8 18.2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              className="dcs-role-link dcs-role-link-2"
              d="M16.2 8.4 L20.2 18.2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              className="dcs-role-link dcs-role-link-3"
              d="M9 21 H19"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="site-body text-ink-muted">
          Work directly with leadership and engineering on how the product
          takes shape.
        </span>
      </li>
      <li className="dcs-role-card">
        <span className="dcs-role-icon dcs-role-icon-spark" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              className="dcs-role-spark dcs-role-spark-1"
              d="M10.5 3.5 L12.4 9 L17.5 10.9 L12.4 12.8 L10.5 18.3 L8.6 12.8 L3.5 10.9 L8.6 9 Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              className="dcs-role-spark dcs-role-spark-2"
              d="M20.5 15 L21.7 18.2 L25 19.4 L21.7 20.6 L20.5 23.8 L19.3 20.6 L16 19.4 L19.3 18.2 Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="site-body text-ink-muted">
          Define how Domis uses AI, and design and prototype those
          implementations myself.
        </span>
      </li>
    </ul>
  );
}
