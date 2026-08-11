"use client";

/**
 * Light-mode Pixar-style 3D marks in `/public/tool-icons/light/`.
 */
import { CHOOM } from "@/lib/homeChoomCopy";
import { useChoomLingo } from "@/components/home/HomeChoomLingoContext";

const TOOLKIT_ITEMS = [
  { name: "Pencil", file: "pencil.webp" },
  { name: "Paper", file: "paper.webp" },
  { name: "Figma", file: "figma.webp" },
  { name: "Cursor", file: "cursor.webp" },
  { name: "Claude Code", file: "claude.webp" },
  { name: "XCode", file: "xcode.webp" },
  { name: "Origami", file: "origami.webp" },
  { name: "ProtoPie", file: "protopie.webp" },
  { name: "Notion", file: "notion.webp" },
] as const;

function iconSrc(file: string) {
  return `/tool-icons/light/fill/${encodeURIComponent(file)}`;
}

export function ToolkitSection() {
  const choom = useChoomLingo();
  return (
    <div className="flex w-full flex-col items-start gap-[16px] overflow-visible">
      <p className="font-[family-name:var(--font-geist-mono)] text-xs leading-6 uppercase text-ink-muted">
        {choom ? CHOOM.toolkitLabel : "Current Toolkit"}
      </p>
      <div
        role="toolbar"
        aria-label="Current toolkit"
        className="flex items-end gap-1.5 overflow-visible"
      >
        {TOOLKIT_ITEMS.map((item) => (
          <div
            key={item.file}
            className="group relative flex flex-col items-center justify-end overflow-visible"
          >
            <span
              className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap font-[family-name:var(--font-geist-mono)] text-[10px] uppercase leading-none tracking-wide text-ink-secondary opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              aria-hidden
            >
              {item.name}
            </span>
            <div
              data-toolkit-icon-tile
              className="size-9 shrink-0 overflow-hidden rounded-[10px] bg-white shadow-[0_1px_2px_rgb(var(--ink-rgb)/0.06),0_2px_6px_rgb(var(--ink-rgb)/0.04)]"
            >
              <img
                src={iconSrc(item.file)}
                alt={item.name}
                draggable={false}
                className="size-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
