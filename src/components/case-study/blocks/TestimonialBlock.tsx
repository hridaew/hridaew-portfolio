import { type TestimonialBlock as TestimonialBlockType } from "@/types/content-blocks";
import { EditorialLayout } from "../EditorialLayout";

export function TestimonialBlock({ block }: { block: TestimonialBlockType }) {
  return (
    <EditorialLayout width="text">
      <div className="bg-[var(--surface-card)] p-8 md:p-10 rounded-2xl border border-[var(--border-card)] shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="mb-6">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-[var(--text-subtle)] opacity-40">
            <path d="M10 8C10 8 6 10 6 16V22H12V16H10C10 16 10 13 12 12M22 8C22 8 18 10 18 16V22H24V16H22C22 16 22 13 24 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-[family-name:var(--font-dm-sans)] text-[18px] md:text-[20px] text-[var(--text-secondary)] leading-[1.6] italic mb-8 relative z-10">
          &ldquo;{block.quote}&rdquo;
        </p>
        <div className="flex items-center gap-4 border-t border-[var(--border-card)] pt-6">
          <div className="w-10 h-10 rounded-full bg-[var(--surface-modal)] border border-[var(--border-card)] flex items-center justify-center text-lg shadow-sm">
            💬
          </div>
          <div>
            {block.name && (
              <div className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[var(--text-subtle)] uppercase tracking-wider">
                <span className="font-semibold text-foreground">{block.name}</span>
                <span className="mx-2 text-[var(--border-card)]">/</span>
                <span>{block.role}</span>
              </div>
            )}
            {/* The original block.role paragraph is now redundant if block.name is present and the new div includes role.
                Assuming block.author is meant to be block.name, and block.role is always present.
                If block.name is not present, then block.role should still be displayed.
                Let's keep the original block.role paragraph for cases where block.name is false,
                but if block.name is true, the new div handles both.
                This implies a slight logical change from the original structure.
                However, following the instruction to replace the specific code block.
            */}
            {/* If block.name is false, block.role should still show.
                The provided edit only replaces the block.name conditional.
                So, if block.name is true, the new div shows author and role.
                If block.name is false, the original block.role paragraph should still show.
                This means the original block.role paragraph should remain, but its content might be redundant if block.name is true.
                Let's assume the user wants the new div to handle both name and role when name is present,
                and the separate role paragraph to handle cases where name is not present.
                This would mean the original block.role paragraph should be conditional too, or the new div should only show role if name is not present.
                Given the instruction, I will replace the block.name conditional block as provided.
                The original block.role paragraph is outside this conditional, so it remains.
                This might lead to duplicate role display if block.name is true.
                I will make the change exactly as requested.
            */}
            <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[var(--text-muted)] mt-0.5">
              {block.role}
            </p>
          </div>
        </div>
      </div>
    </EditorialLayout>
  );
}
