"use client";

/**
 * Mermaid source of truth:
 *
 * graph TD
 *   open_capture(Open capture)
 *   photograph(Photograph label)
 *   extract_brand([Extract brand/model])
 *   extract_ok{Extract readable?}
 *   confirm_identity(Confirm identity)
 *   attach_links(Attach useful links)
 *   appliance_on_home[Appliance on home]
 *   manual_entry(Manual entry)
 *   retake_photo(Retake)
 *   save_no_links(Save without links)
 *
 *   open_capture --> photograph
 *   open_capture -->|Skip / no camera| manual_entry
 *   photograph --> extract_brand
 *   extract_brand --> extract_ok
 *   extract_ok -->|Yes| confirm_identity
 *   extract_ok -->|Incomplete| confirm_identity
 *   extract_ok -->|No| retake_photo
 *   retake_photo -->|Retake| photograph
 *   retake_photo -->|Manual| manual_entry
 *   manual_entry --> confirm_identity
 *   confirm_identity --> attach_links
 *   attach_links --> appliance_on_home
 *   attach_links -->|Not found| save_no_links
 *   save_no_links --> appliance_on_home
 */

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
 * Happy-path main rail; deviations aside, all rejoining.
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
              viewBox="0 0 1340 340"
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
                d="M 77 101 V 227 H 170"
              />

              {/* Photograph → Extract */}
              <path className="duf-line duf-line-arrow" d="M 300 72 H 330" />

              {/* Extract → Readable? */}
              <path className="duf-line duf-line-arrow" d="M 475 72 H 505" />

              {/* Yes → Confirm */}
              <path className="duf-line duf-line-arrow" d="M 623 72 H 655" />

              {/* Incomplete → Confirm (over the top) */}
              <path
                className="duf-line duf-line-arrow duf-line-soft"
                d="M 564 13 V 2 H 720 V 45"
              />

              {/* No → Retake */}
              <path
                className="duf-line duf-line-arrow"
                d="M 564 131 V 200"
              />

              {/* Retake → Photograph (loop) */}
              <path
                className="duf-line duf-line-arrow duf-line-soft"
                d="M 565 254 H 235 V 99"
              />

              {/* Retake → Manual entry */}
              <path
                className="duf-line duf-line-arrow"
                d="M 505 227 H 340"
              />

              {/* Manual entry → Confirm */}
              <path
                className="duf-line duf-line-arrow"
                d="M 310 254 V 290 H 720 V 99"
              />

              {/* Confirm → Attach links */}
              <path className="duf-line duf-line-arrow" d="M 785 72 H 820" />

              {/* Attach → Appliance on home */}
              <path className="duf-line duf-line-arrow" d="M 960 72 H 1100" />

              {/* Links not found → Save without links */}
              <path
                className="duf-line duf-line-arrow duf-line-soft"
                d="M 890 99 V 200"
              />

              {/* Save without links → Appliance on home */}
              <path
                className="duf-line duf-line-arrow"
                d="M 965 227 H 1180 V 101"
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
              style={{ left: 330, top: 45, width: 145 }}
            >
              Extract brand / model
            </span>

            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 170, top: 200, width: 140 }}
            >
              Manual entry
            </span>

            <span
              className="duf-node duf-node-decision"
              style={{ left: 505, top: 13 }}
            >
              <span className="duf-decision-mark" aria-hidden />
              <span className="duf-decision-text">
                Extract readable?
              </span>
            </span>

            <span className="duf-branch-label" style={{ left: 628, top: 58 }}>
              Yes
            </span>
            <span className="duf-branch-label" style={{ left: 628, top: 8 }}>
              Incomplete
            </span>

            <span
              className="duf-node duf-node-process"
              style={{ left: 655, top: 45, width: 130 }}
            >
              Confirm identity
            </span>

            <span className="duf-branch-label" style={{ left: 500, top: 148 }}>
              No
            </span>
            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 505, top: 200, width: 120 }}
            >
              Retake photo
            </span>

            <span className="duf-branch-label" style={{ left: 360, top: 208 }}>
              or manual
            </span>

            <span
              className="duf-node duf-node-process"
              style={{ left: 820, top: 45, width: 140 }}
            >
              Attach useful links
            </span>

            <span className="duf-branch-label" style={{ left: 900, top: 148 }}>
              Not found
            </span>
            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 820, top: 200, width: 145 }}
            >
              Save without links
            </span>

            <span
              className="duf-node duf-node-end"
              style={{ left: 1100, top: 43, width: 160 }}
            >
              Appliance on home
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
