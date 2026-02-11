import { type SectionBlock as SectionBlockType } from "@/types/content-blocks";
import { EditorialLayout } from "../EditorialLayout";

export function SectionBlock({ block }: { block: SectionBlockType }) {
  return (
    <EditorialLayout width="text">
      <div className="pt-8 md:pt-12">
        <div className="h-px w-full bg-[var(--border-card)] mb-8 md:mb-12 opacity-50" />

        {block.number && (
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[var(--text-primary)] flex items-center justify-center shadow-lg">
              <span className="font-[family-name:var(--font-dm-sans)] font-bold text-[16px] text-[var(--surface-modal)]">
                {block.number}
              </span>
            </div>
            <div className="h-px flex-1 bg-[var(--border-card)] opacity-0" /> {/* Spacer removed visually but kept for flex structure if needed, or just remove */}
          </div>
        )}
        <h2 className="font-[family-name:var(--font-instrument-serif)] text-[36px] md:text-[42px] lg:text-[48px] leading-[1.1] text-[var(--text-primary)] tracking-tight">
          {block.title}
        </h2>
        {block.subtitle && (
          <p className="font-[family-name:var(--font-dm-sans)] text-[18px] md:text-[20px] text-[var(--text-muted)] leading-[1.6] mt-4 font-light">
            {block.subtitle}
          </p>
        )}
      </div>
    </EditorialLayout>
  );
}
