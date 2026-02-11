import { useRef, useEffect } from "react";
import gsap from "gsap";
import { type StatsBlock as StatsBlockType } from "@/types/content-blocks";
import { EditorialLayout } from "../EditorialLayout";

export function StatsBlock({ block }: { block: StatsBlockType }) {
  const variant = block.variant ?? "dark";

  const bgClass =
    variant === "gradient"
      ? "bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] border-white/[0.06]"
      : variant === "light"
        ? "bg-[var(--surface-card)] border-[var(--border-card)]"
        : "bg-gradient-to-br from-[#525252] to-[#363636] border-[#525252]";

  const textColor = variant === "light" ? "text-[var(--text-primary)]" : "text-white";
  const subColor = variant === "light" ? "text-[var(--text-muted)]" : "text-white/60";

  // Ref for GSAP animation
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Animate numbers
    const ctx = gsap.context(() => {
      const numbers = gsap.utils.toArray<HTMLElement>(".stat-value");
      numbers.forEach((el) => {
        const rawValue = el.innerText;
        // Check if value is numeric or has special chars
        const endValue = parseFloat(rawValue.replace(/[^0-9.]/g, ""));

        if (!isNaN(endValue)) {
          // Basic counter animation
          gsap.from(el, {
            textContent: 0,
            duration: 1.5,
            ease: "power2.out",
            snap: { textContent: 1 },
            stagger: 0.1,
            onUpdate: function () {
              // Re-append suffix if needed, but for now simple counter
              // This is complex with strings like "200+".
              // Simplified: just fade up + slide for now to avoid text parsing issues
            }
          });
        }
      });

      // Simpler animation: Fade up and slide
      gsap.from(".stat-item", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <EditorialLayout width="breakout">
      <div ref={containerRef} className={`${bgClass} p-8 md:p-10 rounded-[20px] md:rounded-[28px] border`}>
        <div className={`grid gap-6 md:gap-8 ${block.stats.length <= 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}>
          {block.stats.map((stat, i) => (
            <div key={i} className="stat-item text-center sm:text-left">
              <p className={`stat-value font-[family-name:var(--font-instrument-serif)] text-[40px] md:text-[56px] ${textColor} leading-none mb-2`}>
                {stat.value}
              </p>
              <p className="font-[family-name:var(--font-dm-sans)] font-semibold text-[12px] text-white/50 uppercase tracking-[0.15em] mb-8 border-b border-white/10 pb-4">
                Outcomes
              </p>
              <p className={`font-[family-name:var(--font-dm-sans)] text-[14px] md:text-[15px] ${subColor} leading-snug`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </EditorialLayout>
  );
}
