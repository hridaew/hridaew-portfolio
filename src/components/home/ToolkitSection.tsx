"use client";

/**
 * Icons live in `/public/tool-icons` (copied from repo `tool-icons/`).
 */
const TOOLKIT_ITEMS = [
  { name: "Figma", file: "Frame 16256.png" },
  { name: "Figma Make", file: "9dd7913d750d5e2519330ccdbdbc0e24ba58c93e-24x24 1.png" },
  { name: "Claude Code", file: "Frame 16257.png" },
  { name: "Cursor", file: "APP_ICON_3D_DARK 1.png" },
  { name: "XCode", file: "Frame 16260.png" },
  { name: "Origami Studio", file: "Frame 16262.png" },
  { name: "ProtoPie", file: "Frame 16261.png" },
  { name: "Spatial.app", file: "Frame 16258.png" },
] as const;

function iconSrc(file: string) {
  return `/tool-icons/${encodeURIComponent(file)}`;
}

export function ToolkitSection() {
  return (
    <div className="flex w-full flex-col items-start gap-[16px] overflow-visible">
      <p className="font-[family-name:var(--font-geist-mono)] text-xs leading-6 uppercase text-white/50">
        Current Toolkit
      </p>
      <div
        role="toolbar"
        aria-label="Current toolkit"
        className="flex items-end gap-1 overflow-visible"
      >
        {TOOLKIT_ITEMS.map((item) => (
          <div
            key={item.file}
            data-toolkit-icon-tile
            className="group relative flex flex-col items-center justify-end overflow-visible"
          >
            <span
              className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap font-[family-name:var(--font-geist-mono)] text-[10px] uppercase leading-none tracking-wide text-white/75 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              aria-hidden
            >
              {item.name}
            </span>
            <img
              src={iconSrc(item.file)}
              alt={item.name}
              draggable={false}
              className="size-8 shrink-0 object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
