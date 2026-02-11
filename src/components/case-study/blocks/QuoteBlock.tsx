import { type QuoteBlock as QuoteBlockType } from "@/types/content-blocks";
import { EditorialLayout } from "../EditorialLayout";

export function QuoteBlock({ block }: { block: QuoteBlockType }) {
  const variant = block.variant ?? "default";

  if (variant === "large") {
    return (
      <EditorialLayout width="breakout">
        <div className="relative py-8 md:py-12">
          <div className="absolute top-0 left-0 font-[family-name:var(--font-instrument-serif)] text-[120px] md:text-[160px] text-[var(--border-card)] leading-none pointer-events-none select-none">
            &ldquo;
          </div>
          <div className="relative z-10 pl-2 md:pl-4">
            <p className="font-[family-name:var(--font-instrument-serif)] text-[24px] md:text-[28px] lg:text-[32px] text-[var(--text-secondary)] leading-[1.4] italic">
              {block.content}
            </p>
            {block.attribution && (
              <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[var(--text-muted)] mt-4">
                &mdash; {block.attribution}
              </p>
            )}
          </div>
        </div>
      </EditorialLayout>
    );
  }

  if (variant === "inline") {
    return (
      <EditorialLayout width="text">
        <div className="pl-5 border-l-[3px] border-[var(--text-subtle)] py-1">
          <p className="font-[family-name:var(--font-dm-sans)] text-[17px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6] italic">
            &ldquo;{block.content}&rdquo;
          </p>
          {block.attribution && (
            <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[var(--text-muted)] mt-2">
              &mdash; {block.attribution}
            </p>
          )}
        </div>
      </EditorialLayout>
    );
  }

  // Default variant
  return (
    <EditorialLayout width="text">
      <div className="relative bg-[var(--surface-card)] rounded-2xl p-8 md:p-10 border border-[var(--border-card)] overflow-hidden shadow-sm">
        <div className="absolute top-4 left-6 font-[family-name:var(--font-instrument-serif)] text-[120px] text-[var(--border-card)] leading-none pointer-events-none select-none opacity-60">
          &ldquo;
        </div>
        <div className="relative z-10">
          <p className="font-[family-name:var(--font-instrument-serif)] text-[24px] md:text-[28px] lg:text-[32px] text-[var(--text-secondary)] leading-[1.35] tracking-tight italic">
            {block.content}
          </p>
          {block.attribution && (
            <div className="flex items-center gap-3 mt-6">
              <div className="w-8 h-px bg-[var(--text-subtle)] opacity-50" />
              <cite className="font-[family-name:var(--font-dm-sans)] font-semibold text-[13px] text-[var(--text-subtle)] uppercase tracking-wider not-italic">
                — {block.attribution}
              </cite>
            </div>
          )}
        </div>
      </div>
    </EditorialLayout>
  );
}
