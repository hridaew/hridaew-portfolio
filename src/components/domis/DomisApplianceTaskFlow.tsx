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
 * Task flow: photograph a label, confirm identity, attach useful links.
 * Main rail + lower deviation rail (manual entry, retake, save without links).
 */
export function DomisApplianceTaskFlow() {
  const { ref, className } = useDufScrollFade();

  return (
    <div
      className="dud dud-board"
      role="img"
      aria-label="Task flow: open capture, photograph label or enter manually, extract brand and model, confirm, attach links or save without them, appliance on home"
    >
      <p className="dud-type">Task flow</p>
      <p className="dud-heading">
        Add an appliance so it can be tagged later
      </p>

      <div className="duf duf-appliance">
        <p className="duf-scroll-hint" aria-hidden>
          scroll -&gt;
        </p>

        <div ref={ref} className={className}>
          <div className="duf-canvas duf-canvas-appliance">
            <svg
              className="duf-connectors"
              viewBox="0 0 1340 300"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="duf-arrow-appliance"
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

              {/* Open → Photograph */}
              <path className="duf-line duf-line-arrow" d="M 135 72 H 170" />

              {/* Skip / no camera → Manual entry */}
              <path
                className="duf-line duf-line-arrow duf-line-soft"
                d="M 77 101 V 200 H 200"
              />

              {/* Photograph → Extract */}
              <path className="duf-line duf-line-arrow" d="M 300 72 H 340" />

              {/* Extract → Readable? */}
              <path className="duf-line duf-line-arrow" d="M 480 72 H 515" />

              {/* Yes → Confirm */}
              <path className="duf-line duf-line-arrow" d="M 633 72 H 675" />

              {/* Incomplete → Confirm (distinct upper arc) */}
              <path
                className="duf-line duf-line-arrow duf-line-soft"
                d="M 574 20 H 740 V 45 H 675"
              />

              {/* No → Retake */}
              <path className="duf-line duf-line-arrow" d="M 574 131 V 173" />

              {/* Retake → Photograph (loop under branch row) */}
              <path
                className="duf-line duf-line-arrow duf-line-soft"
                d="M 570 227 V 255 H 235 V 99"
              />

              {/* or manual → Manual entry */}
              <path
                className="duf-line duf-line-arrow"
                d="M 633 110 V 255 H 270 V 227"
              />

              {/* Manual entry → Confirm (rejoin under branch row) */}
              <path
                className="duf-line duf-line-arrow"
                d="M 340 227 V 255 H 740 V 99"
              />

              {/* Confirm → Attach links */}
              <path className="duf-line duf-line-arrow" d="M 805 72 H 850" />

              {/* Attach → Appliance on home */}
              <path className="duf-line duf-line-arrow" d="M 990 72 H 1140" />

              {/* Links not found → Save without links */}
              <path
                className="duf-line duf-line-arrow duf-line-soft"
                d="M 920 99 V 200 H 1000"
              />

              {/* Save without links → Appliance on home (enter at bottom) */}
              <path
                className="duf-line duf-line-arrow"
                d="M 1145 200 H 1220 V 101"
              />
            </svg>

            <span
              className="duf-node duf-node-start"
              style={{ left: 20, top: 43, width: 115 }}
            >
              Open capture
            </span>

            <span className="duf-branch-label" style={{ left: 88, top: 148 }}>
              Skip / no camera
            </span>

            <span
              className="duf-node duf-node-process"
              style={{ left: 170, top: 45, width: 130 }}
            >
              Photograph the label
            </span>

            <span
              className="duf-node duf-node-process"
              style={{ left: 340, top: 45, width: 140 }}
            >
              Extract brand / model
            </span>

            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 200, top: 173, width: 140 }}
            >
              Manual entry
            </span>

            <span
              className="duf-node duf-node-decision"
              style={{ left: 515, top: 13 }}
            >
              <span className="duf-decision-mark" aria-hidden />
              <span className="duf-decision-text">
                Extract readable?
              </span>
            </span>

            <span className="duf-branch-label" style={{ left: 638, top: 58 }}>
              Yes
            </span>
            <span className="duf-branch-label" style={{ left: 638, top: 22 }}>
              Incomplete
            </span>

            <span
              className="duf-node duf-node-process"
              style={{ left: 675, top: 45, width: 130 }}
            >
              Confirm identity
            </span>

            <span className="duf-branch-label" style={{ left: 500, top: 148 }}>
              No
            </span>
            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 510, top: 173, width: 120 }}
            >
              Retake photo
            </span>

            <span className="duf-branch-label" style={{ left: 350, top: 248 }}>
              or manual
            </span>

            <span
              className="duf-node duf-node-process"
              style={{ left: 850, top: 45, width: 140 }}
            >
              Attach useful links
            </span>

            <span className="duf-branch-label" style={{ left: 930, top: 148 }}>
              Not found
            </span>
            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 1000, top: 173, width: 145 }}
            >
              Save without links
            </span>

            <span
              className="duf-node duf-node-end"
              style={{ left: 1140, top: 43, width: 160 }}
            >
              Appliance on home
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
