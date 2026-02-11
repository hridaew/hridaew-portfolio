import { type CalloutBlock as CalloutBlockType } from "@/types/content-blocks";
import { EditorialLayout } from "../EditorialLayout";

export function CalloutBlock({ block }: { block: CalloutBlockType }) {
  const variant = block.variant ?? "info";

  const styles = {
    awards: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border-amber-200 dark:border-amber-800/40",
    info: "bg-[var(--surface-card)] border-[var(--border-card)]",
    highlight: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800/40",
  } as const;

  const icons = {
    awards: "🏆",
    info: "💡",
    highlight: "✨",
  };

  return (
    <EditorialLayout width="text">
      <div className={`${styles[variant]} p-6 md:p-8 rounded-2xl border flex gap-5`}>
        <div className="text-2xl mt-0.5 select-none shrink-0">
          {icons[variant]}
        </div>
        <div className="space-y-3">
          {block.items.map((item, i) => (
            <p
              key={i}
              className="font-[family-name:var(--font-dm-sans)] text-[16px] md:text-[17px] text-[var(--text-secondary)] leading-relaxed"
            >
              {item}
            </p>
          ))}
        </div>
      </div>
    </EditorialLayout>
  );
}
