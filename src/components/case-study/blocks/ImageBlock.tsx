import Image from "next/image";
import { type ImageBlock as ImageBlockType } from "@/types/content-blocks";
import { EditorialLayout } from "../EditorialLayout";

const layoutToWidth = {
  "text-width": "text",
  breakout: "breakout",
  "full-width": "full",
} as const;

const aspectClasses = {
  "16/10": "aspect-[16/10]",
  "16/9": "aspect-[16/9]",
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "1/1": "aspect-square",
  "21/9": "aspect-[21/9]",
} as const;

export function ImageBlock({ block }: { block: ImageBlockType }) {
  const width = layoutToWidth[block.layout];
  const aspect = block.aspectRatio ? aspectClasses[block.aspectRatio] : "aspect-[16/10]";
  const isPlaceholder = !block.src || block.src.startsWith("/images/placeholder");

  return (
    <EditorialLayout width={width}>
      {isPlaceholder ? (
        <div
          className={`${aspect} bg-gradient-to-br from-[var(--surface-card)] to-[var(--border-card)] rounded-[16px] md:rounded-[24px] border border-[var(--border-card)] flex items-center justify-center relative overflow-hidden group`}
        >
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
          <div className="text-center px-6 relative z-10">
            <div className="w-12 h-12 rounded-full bg-[var(--surface-modal)] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="text-2xl">🖼️</span>
            </div>
            <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[var(--text-secondary)] font-medium mb-1">
              Image Coming Soon
            </p>
            <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[var(--text-muted)]">
              {block.alt}
            </p>
          </div>
        </div>
      ) : (
        <div className={`${aspect} relative rounded-[16px] md:rounded-[24px] overflow-hidden shadow-sm`}>
          <Image
            alt={block.alt}
            className="object-cover"
            src={block.src}
            fill
            sizes={width === "full" ? "100vw" : width === "breakout" ? "(max-width: 768px) 100vw, 920px" : "(max-width: 768px) 100vw, 680px"}
          />
        </div>
      )}
      {block.caption && (
        <p className="font-[family-name:var(--font-dm-sans)] font-semibold text-[13px] text-[var(--text-subtle)] uppercase tracking-wider text-center">
          {block.caption}
        </p>
      )}
    </EditorialLayout>
  );
}
