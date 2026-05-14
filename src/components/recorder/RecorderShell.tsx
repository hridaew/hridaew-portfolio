"use client";

import { useEffect } from "react";
import { VoiceRecorder } from "./VoiceRecorder";
import { WafflingEntrance } from "@/components/shared/WafflingEntrance";

type LenisApi = { start: () => void; stop: () => void };

function getLenis(): LenisApi | undefined {
    if (typeof window === "undefined") return undefined;
    return (window as unknown as { __lenis?: LenisApi }).__lenis;
}

/**
 * Wraps the prototype in a fixed full-viewport container so the portfolio's
 * Lenis smooth-scroll and PageTransition shell don't interfere with the
 * recorder's own `100vw / 100dvh` layout. Body scroll is locked for the
 * lifetime of this page and restored on unmount.
 *
 * Navigation back to home is handled by the prototype's own inline back button
 * (bottom-left of the phone frame) — no extra portfolio chrome on this route.
 */
export function RecorderShell() {
    useEffect(() => {
        const lenis = getLenis();
        lenis?.stop();
        const prevBodyOverflow = document.body.style.overflow;
        const prevHtmlOverflow = document.documentElement.style.overflow;
        const prevOverscroll = document.body.style.overscrollBehavior;
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.body.style.overscrollBehavior = "none";
        return () => {
            document.body.style.overflow = prevBodyOverflow;
            document.documentElement.style.overflow = prevHtmlOverflow;
            document.body.style.overscrollBehavior = prevOverscroll;
            lenis?.start();
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[60] bg-[#1a1a1a]">
            <WafflingEntrance className="size-full">
                <VoiceRecorder />
            </WafflingEntrance>
        </div>
    );
}
