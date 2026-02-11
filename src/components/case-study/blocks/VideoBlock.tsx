import { type VideoBlock as VideoBlockType } from "@/types/content-blocks";
import { EditorialLayout } from "../EditorialLayout";

const layoutToWidth = {
  "text-width": "text",
  breakout: "breakout",
  "full-width": "full",
} as const;

export function VideoBlock({ block }: { block: VideoBlockType }) {
  const width = layoutToWidth[block.layout];
  const isPlaceholder = !block.src || block.src.startsWith("/videos/placeholder");

  return (
    <EditorialLayout width={width}>
      {isPlaceholder ? (
        <div className="aspect-[16/9] bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-[16px] md:rounded-[24px] border border-white/[0.06] flex items-center justify-center">
          <div className="text-center">
            <svg className="w-14 h-14 text-white/25 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-white/40">
              Video
            </p>
          </div>
        </div>
      ) : (
        <video
          className="w-full rounded-[16px] md:rounded-[24px] shadow-lg"
          controls
          poster={block.poster}
          preload="metadata"
        >
          <source src={block.src} type="video/mp4" />
        </video>
      )}
      {block.caption && (
        <p className="font-[family-name:var(--font-dm-sans)] font-semibold text-[13px] text-[var(--text-subtle)] uppercase tracking-wider text-center">
          {block.caption}
        </p>
      )}
    </EditorialLayout>
  );
}
