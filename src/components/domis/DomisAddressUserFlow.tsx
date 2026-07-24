"use client";

/**
 * Mermaid source of truth (topology only; renderer is horizontal editorial):
 *
 * graph TD
 *   enter_address(Enter address)
 *   autofill_ok{Autofill looks right?}
 *   choose_autofill(Choose autofill)
 *   type_manually(Type manually)
 *   loads_facts([Domis loads home facts])
 *   useful_data{Useful data returned?}
 *   review(Review what came back)
 *   leave_blanks(Leave blanks, fill later)
 *   empty_form(Empty form, enter manually)
 *   optional_edits(Optional edits / name spaces)
 *   edit_photo(Edit or replace photo)
 *   home_created[Home created]
 *
 *   enter_address --> autofill_ok
 *   autofill_ok -->|Yes| choose_autofill
 *   autofill_ok -->|No| type_manually
 *   choose_autofill --> loads_facts
 *   type_manually --> loads_facts
 *   loads_facts --> useful_data
 *   useful_data -->|Yes| review
 *   useful_data -->|Incomplete| leave_blanks
 *   useful_data -->|Fail| empty_form
 *   review --> optional_edits
 *   leave_blanks --> optional_edits
 *   empty_form --> optional_edits
 *   optional_edits --> edit_photo
 *   edit_photo --> home_created
 *   edit_photo -->|Skip| home_created
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
 * Owner-only user flow: create a home from an address.
 * Happy-path main rail; deviations aside, all rejoining.
 *
 * Geometry (main rail mid Y = 72):
 *   enter 20/43/110 | autofill 155/13 | choose 295/45/130 | type 295/200/130
 *   loads 480/45/150 | useful 660/13 | review 820/45/136
 *   leave 820/185/150 | empty 820/275/150 | optional 1010/45/150
 *   photo 1195/45/140 | home 1365/43/115
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
              viewBox="0 0 1520 380"
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

              {/* Enter → Autofill (right edge 130 → left tip 155) */}
              <path className="duf-line duf-line-arrow" d="M 130 72 H 155" />

              {/* Yes → Choose autofill (right tip 273 → left 295) */}
              <path className="duf-line duf-line-arrow" d="M 273 72 H 295" />

              {/* No → Type manually (bottom tip 214,131 → left mid 295,227) */}
              <path
                className="duf-line duf-line-arrow"
                d="M 214 131 V 227 H 295"
              />

              {/* Choose autofill → merge spine */}
              <path className="duf-line" d="M 425 72 H 452" />

              {/* Type manually → merge spine */}
              <path className="duf-line" d="M 425 227 H 452 V 72" />

              {/* Merge → Domis loads */}
              <path className="duf-line duf-line-arrow" d="M 452 72 H 480" />

              {/* Domis loads → Useful data? */}
              <path className="duf-line duf-line-arrow" d="M 630 72 H 660" />

              {/* Yes → Review (right tip 778 → left 820) */}
              <path className="duf-line duf-line-arrow" d="M 778 72 H 820" />

              {/* Useful-data drop trunk from bottom tip */}
              <path className="duf-line" d="M 719 131 V 212" />

              {/* Incomplete → Leave blanks (trunk → left mid 820,212) */}
              <path
                className="duf-line duf-line-arrow"
                d="M 719 212 H 820"
              />

              {/* Fail → Empty form: continue trunk, then into left mid 820,302 */}
              <path className="duf-line" d="M 719 212 V 302" />
              <path
                className="duf-line duf-line-arrow"
                d="M 719 302 H 820"
              />

              {/* Review → Optional edits */}
              <path className="duf-line duf-line-arrow" d="M 956 72 H 1010" />

              {/* Leave blanks → rejoin spine (right mid 970,212) */}
              <path className="duf-line" d="M 970 212 H 990" />

              {/* Empty form → rejoin spine (right mid 970,302) */}
              <path className="duf-line" d="M 970 302 H 990" />

              {/* Shared rejoin spine into Optional edits left mid */}
              <path
                className="duf-line duf-line-arrow"
                d="M 990 302 V 72 H 1010"
              />

              {/* Optional edits → Edit or replace photo */}
              <path className="duf-line duf-line-arrow" d="M 1160 72 H 1195" />

              {/* Edit photo → Home created */}
              <path className="duf-line duf-line-arrow" d="M 1335 72 H 1365" />

              {/* Skip photo → Home created */}
              <path
                className="duf-line duf-line-arrow duf-line-soft"
                d="M 1265 99 V 160 H 1423 V 101"
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

            <span className="duf-branch-label" style={{ left: 278, top: 52 }}>
              Yes
            </span>
            <span
              className="duf-node duf-node-process"
              style={{ left: 295, top: 45, width: 130 }}
            >
              Choose autofill
            </span>

            <span className="duf-branch-label" style={{ left: 228, top: 168 }}>
              No
            </span>
            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 295, top: 200, width: 130 }}
            >
              Type manually
            </span>

            <span
              className="duf-node duf-node-process duf-node-wait"
              style={{ left: 480, top: 45, width: 150 }}
            >
              Domis loads home facts
            </span>

            <span
              className="duf-node duf-node-decision"
              style={{ left: 660, top: 13 }}
            >
              <span className="duf-decision-mark" aria-hidden />
              <span className="duf-decision-text">
                Useful data returned?
              </span>
            </span>

            <span className="duf-branch-label" style={{ left: 786, top: 58 }}>
              Yes
            </span>
            <span
              className="duf-node duf-node-process"
              style={{ left: 820, top: 45, width: 136 }}
            >
              Review what came back
            </span>

            <span className="duf-branch-label" style={{ left: 728, top: 168 }}>
              Incomplete
            </span>
            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 820, top: 185, width: 150 }}
            >
              Leave blanks, fill later
            </span>

            <span className="duf-branch-label" style={{ left: 728, top: 258 }}>
              Fail
            </span>
            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 820, top: 275, width: 150 }}
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

            <span className="duf-branch-label" style={{ left: 1288, top: 128 }}>
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
