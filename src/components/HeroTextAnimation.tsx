"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

type AnimationVariant = "wave" | "split-chars" | "slide-up" | "typewriter";

interface HeroTextAnimationProps {
    children: string;
    variant: AnimationVariant;
    className?: string;
    delay?: number;
}

export function HeroTextAnimation({
    children,
    variant,
    className = "",
    delay = 0.2,
}: HeroTextAnimationProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Typewriter animates words, not chars — handle separately
        if (variant === "typewriter") {
            const words = containerRef.current.querySelectorAll<HTMLSpanElement>(".hero-word");
            if (!words.length) return;
            gsap.fromTo(
                words,
                { opacity: 0, y: 8 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay, stagger: 0.08 }
            );
            return;
        }

        const chars = containerRef.current.querySelectorAll<HTMLSpanElement>(".hero-char");
        if (!chars.length) return;

        gsap.set(chars, { opacity: 0 });

        switch (variant) {
            case "wave": {
                // Sine-wave staggered y + slight rotation
                gsap.fromTo(
                    chars,
                    { y: 40, opacity: 0, rotation: 3 },
                    {
                        y: 0,
                        opacity: 1,
                        rotation: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        delay,
                        stagger: {
                            each: 0.04,
                            from: "start",
                        },
                    }
                );
                break;
            }
            case "split-chars": {
                // Random-order reveal with slight x offset
                const indices = Array.from({ length: chars.length }, (_, i) => i);
                // Shuffle
                for (let i = indices.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [indices[i], indices[j]] = [indices[j], indices[i]];
                }
                indices.forEach((charIdx, orderIdx) => {
                    gsap.fromTo(
                        chars[charIdx],
                        { opacity: 0, x: (Math.random() - 0.5) * 20 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: 0.4,
                            ease: "power2.out",
                            delay: delay + orderIdx * 0.03,
                        }
                    );
                });
                break;
            }
            case "slide-up": {
                // Characters slide up from below with elastic easing
                gsap.fromTo(
                    chars,
                    { y: 60, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        ease: "elastic.out(1, 0.5)",
                        delay,
                        stagger: 0.03,
                    }
                );
                break;
            }
        }
    }, [variant, delay]);

    // For typewriter variant, split by words instead of chars
    if (variant === "typewriter") {
        const words = children.split(" ");
        return (
            <div ref={containerRef} className={`overflow-hidden ${className}`}>
                {words.map((word, i) => (
                    <span key={i} className="inline-block hero-word opacity-0 mr-[0.25em]">
                        {word}
                    </span>
                ))}
            </div>
        );
    }

    // Split into characters, preserving spaces
    const chars = children.split("");

    return (
        <div ref={containerRef} className={`overflow-hidden ${className}`}>
            {chars.map((char, i) => (
                <span
                    key={i}
                    className={`inline-block hero-char opacity-0 ${char === " " ? "w-[0.25em]" : ""}`}
                >
                    {char === " " ? "\u00A0" : char}
                </span>
            ))}
        </div>
    );
}
