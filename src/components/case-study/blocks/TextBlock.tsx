import { type TextBlock as TextBlockType } from "@/types/content-blocks";
import { EditorialLayout } from "../EditorialLayout";

const variantClasses = {
  body: "text-[17px] md:text-[18px] lg:text-[19px] leading-[1.65] text-[var(--text-secondary)]",
  lead: "text-[21px] md:text-[23px] lg:text-[24px] leading-[1.6] text-[var(--text-primary)] font-medium",
  caption: "text-[14px] md:text-[15px] leading-[1.5] text-[var(--text-muted)]",
  emphasis: "text-[19px] md:text-[20px] lg:text-[21px] leading-[1.5] text-[var(--text-primary)] font-medium font-[family-name:var(--font-instrument-serif)] italic",
} as const;

export function TextBlock({ block }: { block: TextBlockType }) {
  const variant = block.variant ?? "body";

  return (
    <EditorialLayout width="text">
      <div>
        {block.label && (
          <p className="font-[family-name:var(--font-dm-sans)] font-semibold text-[12px] text-[var(--text-subtle)] uppercase tracking-[0.1em] mb-2">
            {block.label}
          </p>
        )}
        <p className={`font-[family-name:var(--font-dm-sans)] ${variantClasses[variant]} whitespace-pre-line`}>
          {block.content}
        </p>
      </div>
    </EditorialLayout>
  );
}
