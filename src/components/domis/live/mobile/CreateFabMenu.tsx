"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { DomisLiveIcon } from "@/components/domis/live/DomisLiveIcon";
import "./create-fab-menu.css";

/**
 * Port of Flutter `FloatingButton`
 * (`vendor/mobile-app-design-combined/lib/views/components/floating_button.dart`
 * from design/fab-create-menu). Figma 19664:26046.
 *
 * Closed: red FAB only (no shell).
 * Open: gray shell cluster (249px) with menu + Add Task + FAB on top.
 */

const MENU_ROWS = [
  { id: "pro", label: "Add Pro", icon: "engineering" },
  { id: "space", label: "Add Space", icon: "add_location_alt" },
  { id: "item", label: "Add Item", icon: "deployed_code" },
] as const;

export type CreateFabMenuProps = {
  className?: string;
  interactive?: boolean;
};

export function CreateFabMenu({
  className,
  interactive = true,
}: CreateFabMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => {
    if (!interactive) return;
    setOpen((v) => !v);
  }, [interactive]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <div
      className={["domis-live", "cfm", className].filter(Boolean).join(" ")}
      data-open={open ? "true" : "false"}
    >
      {open ? (
        <button
          type="button"
          className="cfm-dim"
          aria-label="Close create menu"
          onClick={close}
        />
      ) : null}

      {/* Closed: in-tree FAB holds layout (Flutter build()) */}
      {!open ? (
        <div className="cfm-fab-rest">
          <FabFace
            open={false}
            ariaLabel="Open create menu"
            ariaExpanded={false}
            ariaControls={panelId}
            onClick={toggle}
          />
        </div>
      ) : (
        /* Open: overlay cluster — gray shell + menu + FAB on top */
        <div className="cfm-cluster" id={panelId} role="menu">
          <div className="cfm-shell">
            <div className="cfm-menu">
              <div className="cfm-card">
                {MENU_ROWS.map((row, i) => (
                  <div key={row.id}>
                    {i > 0 ? <div className="cfm-divider" /> : null}
                    <button
                      type="button"
                      className="cfm-row"
                      role="menuitem"
                      onClick={close}
                    >
                      <span>{row.label}</span>
                      <span className="cfm-row-icon">
                        <DomisLiveIcon
                          name={row.icon}
                          size={22}
                          color="#005750"
                        />
                      </span>
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="cfm-add-task"
                role="menuitem"
                onClick={close}
              >
                <span>Add Task</span>
                <DomisLiveIcon name="build" size={22} color="#dcefee" />
              </button>
            </div>

            {/* Reserves FAB corner inside the shell (Flutter SizedBox height: fab) */}
            <div className="cfm-fab-slot" aria-hidden />
          </div>

          <div className="cfm-fab-overlay">
            <FabFace
              open
              ariaLabel="Close create menu"
              ariaExpanded
              ariaControls={panelId}
              onClick={toggle}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FabFace({
  open,
  ariaLabel,
  ariaExpanded,
  ariaControls,
  onClick,
}: {
  open: boolean;
  ariaLabel: string;
  ariaExpanded: boolean;
  ariaControls: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="cfm-fab"
      data-open={open ? "true" : "false"}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {/* Flutter: Icons.add rotated by openT * π/4 — not a close glyph swap */}
      <span className="cfm-fab-icon" data-open={open ? "true" : "false"}>
        <DomisLiveIcon name="add" size={24} color="#ffffff" />
      </span>
    </button>
  );
}
