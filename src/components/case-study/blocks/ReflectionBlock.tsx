import { type ReflectionBlock as ReflectionBlockType } from "@/types/content-blocks";
import { EditorialLayout } from "../EditorialLayout";

export function ReflectionBlock({ block }: { block: ReflectionBlockType }) {
  return (
    <EditorialLayout width="text">
      <div className="border-t border-[var(--border-card)] pt-10 space-y-6">
        {block.title && (
          <p className="font-[family-name:var(--font-dm-sans)] font-semibold text-[12px] text-[var(--text-subtle)] uppercase tracking-[0.12em]">
            {block.title}
          </p>
        )}

        {block.outcome && (
          <p className="font-[family-name:var(--font-dm-sans)] text-[18px] md:text-[20px] lg:text-[21px] text-[var(--text-primary)] leading-[1.6] font-medium">
            {block.outcome}
          </p>
        )}

        {block.keyLesson && (
          <div className="relative bg-gradient-to-br from-[var(--surface-card)] to-[var(--background)] rounded-2xl p-6 md:p-8 border border-[var(--border-card)] shadow-sm overflow-hidden">
            <div className="absolute top-2 left-4 font-[family-name:var(--font-instrument-serif)] text-[120px] text-[var(--border-card)] leading-none pointer-events-none select-none opacity-50">
              &ldquo;
            </div>
            <div className="relative z-10">
              <p className="font-[family-name:var(--font-dm-sans)] font-semibold text-[12px] text-[var(--text-subtle)] uppercase tracking-[0.15em] mb-6">
                Reflection
              </p>
              <p className="font-[family-name:var(--font-instrument-serif)] text-[22px] md:text-[24px] text-[var(--text-secondary)] leading-[1.4] italic">
                {block.keyLesson}
              </p>
            </div>
          </div>
        )}
      </div>
    </EditorialLayout>
  );
}
