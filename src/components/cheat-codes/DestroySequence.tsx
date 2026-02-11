"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { playAlarm } from "@/lib/audio";

export function DestroySequence() {
    const [countdown, setCountdown] = useState(5);
    const [phase, setPhase] = useState<"shake" | "flash" | "done">("shake");
    const overlayRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        mainRef.current = document.querySelector("main");
        playAlarm();

        // Shake the page
        if (mainRef.current) {
            gsap.to(mainRef.current, {
                x: () => (Math.random() - 0.5) * 20,
                y: () => (Math.random() - 0.5) * 10,
                duration: 0.05,
                repeat: -1,
                yoyo: true,
            });
        }

        // Countdown
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setPhase("flash");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(interval);
            if (mainRef.current) {
                gsap.killTweensOf(mainRef.current);
                gsap.set(mainRef.current, { x: 0, y: 0 });
            }
        };
    }, []);

    // Flash then show sad hamster
    useEffect(() => {
        if (phase === "flash") {
            // Play boom sound
            try {
                const boom = new Audio("/assets/cheat-codes/boom.mp3");
                boom.play();
            } catch {}

            // Stop shake
            if (mainRef.current) {
                gsap.killTweensOf(mainRef.current);
                gsap.set(mainRef.current, { x: 0, y: 0, opacity: 0 });
            }

            // Flash white
            if (overlayRef.current) {
                gsap.fromTo(
                    overlayRef.current,
                    { backgroundColor: "#ffffff" },
                    {
                        backgroundColor: "#ffffff",
                        duration: 0.3,
                        onComplete: () => setPhase("done"),
                    }
                );
            }
        }
    }, [phase]);

    if (phase === "done") {
        return (
            <div className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center gap-6">
                <img
                    src="/assets/cheat-codes/sad-hamster.gif"
                    alt="Sad hamster"
                    className="w-48 h-48 object-contain"
                />
                <p className="font-[family-name:var(--font-dm-sans)] text-neutral-600 text-lg">
                    why would you do that
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 rounded-full border border-neutral-300 text-sm font-[family-name:var(--font-dm-sans)] text-neutral-500 hover:bg-neutral-100 transition-colors opacity-0 animate-[fadeIn_0.3s_ease_3s_forwards]"
                >
                    reload
                </button>
                <style>{`
                    @keyframes fadeIn {
                        to { opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div ref={overlayRef} className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none">
            {phase === "shake" && (
                <div className="bg-red-600/90 text-white px-8 py-4 rounded-xl">
                    <p className="font-mono text-6xl md:text-8xl font-bold tabular-nums">
                        {countdown}
                    </p>
                </div>
            )}
        </div>
    );
}
