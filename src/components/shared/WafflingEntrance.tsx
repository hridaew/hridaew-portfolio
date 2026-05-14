import { cn } from "@/lib/utils";

/**
 * Wraps a waffling page's body so the content blurs + fades + lifts in on
 * mount, dovetailing with the `PageTransition` curtain wipe. Implementation
 * lives in `globals.css` (`.waffling-page-entrance`) so the initial paint —
 * including the SSR-rendered HTML — starts in the blurred state and the
 * animation runs without depending on hydration.
 */
export function WafflingEntrance({
    children,
    className,
    as: As = "div",
}: {
    children: React.ReactNode;
    className?: string;
    as?: "div" | "main" | "section" | "article";
}) {
    return <As className={cn("waffling-page-entrance", className)}>{children}</As>;
}
