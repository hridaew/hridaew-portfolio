"use client";

import { useEffect, useRef, useState } from "react";
import "./domis-ux-diagrams.css";

function useDufScrollFade() {
  const ref = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState({ left: false, right: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const max = scrollWidth - clientWidth;
      setFade({
        left: scrollLeft > 2,
        right: max > 2 && scrollLeft < max - 2,
      });
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const className = [
    "duf-scroll",
    fade.left ? "duf-scroll-fade-left" : "",
    fade.right ? "duf-scroll-fade-right" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return { ref, className };
}

/**
 * Owner-only user flow: create a home from an address.
 * Main rail + lower deviation rail (manual entry, incomplete/fail load, skip photo).
 */
export function DomisAddressUserFlow() {
  const { ref, className } = useDufScrollFade();

  return (
    <div
      className="dud dud-board"
      role="img"
      aria-label="User flow: enter address, choose autofill or type manually, Domis loads home facts, review or leave blanks, optional edits and photo, home created"
    >
      <p className="dud-type">User flow</p>
      <p className="dud-heading">Create a home from an address</p>

      <div className="duf duf-address">
        <p className="duf-scroll-hint" aria-hidden>
          scroll -&gt;
        </p>

        <div ref={ref} className={className}>
          <div className="duf-canvas duf-canvas-address">
            <svg
              className="duf-connectors"
              viewBox="0 0 1520 290"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="duf-arrow-address"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
              </defs>

              {/* Enter → Autofill decision */}
              <path className="duf-line duf-line-arrow" d="M 130 72 H 155" />

              {/* Yes → Choose autofill */}
              <path
                className="duf-line duf-line-arrow"
                d="M 214 13 V 4 H 300 V 39 H 315"
              />

              {/* No → Type manually */}
              <path
                className="duf-line duf-line-arrow"
                d="M 214 131 V 145 H 315"
              />

              {/* Choose autofill → merge point */}
              <path className="duf-line" d="M 445 39 H 462 V 72" />

              {/* Type manually → merge point */}
              <path className="duf-line" d="M 445 145 H 462 V 72" />

              {/* Merge → Domis loads */}
              <path className="duf-line duf-line-arrow" d="M 462 72 H 490" />

              {/* Domis loads → Useful data? */}
              <path className="duf-line duf-line-arrow" d="M 640 72 H 675" />

              {/* Useful → Review */}
              <path className="duf-line duf-line-arrow" d="M 793 72 H 835" />

              {/* Incomplete → Leave blanks */}
              <path
                className="duf-line duf-line-arrow"
                d="M 734 131 V 200 H 820"
              />

              {/* Fail → Empty form (route below leave-blanks) */}
              <path
                className="duf-line duf-line-arrow"
                d="M 793 110 V 240 H 1065 V 227"
              />

              {/* Review → Optional edits */}
              <path className="duf-line duf-line-arrow" d="M 971 72 H 1010" />

              {/* Leave blanks → Optional edits */}
              <path
                className="duf-line duf-line-arrow"
                d="M 970 200 H 985 V 99 H 1010"
              />

              {/* Empty form → Optional edits */}
              <path className="duf-line duf-line-arrow" d="M 1065 173 V 99" />

              {/* Optional edits → Edit or replace photo */}
              <path className="duf-line duf-line-arrow" d="M 1160 72 H 1195" />

              {/* Edit photo → Home created */}
              <path className="duf-line duf-line-arrow" d="M 1335 72 H 1365" />

              {/* Skip photo → Home created (enter at bottom of end node) */}
              <path
                className="duf-line duf-line-arrow duf-line-soft"
                d="M 1265 99 V 200 H 1422 V 101"
              />
            </svg>

            <span
              className="duf-node duf-node-start"
              style={{ left: 20, top: 43, width: 110 }}
            >
              Enter address
            </span>

            <span
              className="duf-node duf-node-decision"
              style={{ left: 155, top: 13 }}
            >
              <span className="duf-decision-mark" aria-hidden />
              <span className="duf-decision-text">
                Autofill looks right?
              </span>
            </span>

            <span className="duf-branch-label" style={{ left: 268, top: 2 }}>
              Yes
            </span>
            <span
              className="duf-node duf-node-process"
              style={{ left: 315, top: 12, width: 130 }}
            >
              Choose autofill
            </span>

            <span className="duf-branch-label" style={{ left: 268, top: 148 }}>
              No
            </span>
            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 315, top: 118, width: 130 }}
            >
              Type manually
            </span>

            <span
              className="duf-node duf-node-process duf-node-wait"
              style={{ left: 490, top: 45, width: 150 }}
            >
              Domis loads home facts
            </span>

            <span
              className="duf-node duf-node-decision"
              style={{ left: 675, top: 13 }}
            >
              <span className="duf-decision-mark" aria-hidden />
              <span className="duf-decision-text">
                Useful data returned?
              </span>
            </span>

            <span className="duf-branch-label" style={{ left: 800, top: 58 }}>
              Yes
            </span>
            <span
              className="duf-node duf-node-process"
              style={{ left: 835, top: 45, width: 136 }}
            >
              Review what came back
            </span>

            <span className="duf-branch-label" style={{ left: 735, top: 168 }}>
              Incomplete
            </span>
            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 820, top: 173, width: 150 }}
            >
              Leave blanks, fill later
            </span>

            <span className="duf-branch-label" style={{ left: 800, top: 148 }}>
              Fail
            </span>
            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 990, top: 173, width: 150 }}
            >
              Empty form, enter manually
            </span>

            <span
              className="duf-node duf-node-process"
              style={{ left: 1010, top: 45, width: 150 }}
            >
              Optional edits / name spaces
            </span>

            <span
              className="duf-node duf-node-process"
              style={{ left: 1195, top: 45, width: 140 }}
            >
              Edit or replace photo
            </span>

            <span className="duf-branch-label" style={{ left: 1280, top: 168 }}>
              Skip
            </span>

            <span
              className="duf-node duf-node-end"
              style={{ left: 1365, top: 43, width: 115 }}
            >
              Home created
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
