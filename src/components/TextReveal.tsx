"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface TextRevealProps {
    children: string;
    className?: string;
    delay?: number;
    duration?: number;
    stagger?: number;
}

export function TextReveal({
    children,
    className = "",
    delay = 0,
    duration = 0.8,
    stagger = 0.02,
}: TextRevealProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const words = children.split(" ");

    useEffect(() => {
        if (!containerRef.current) return;

        const els = containerRef.current.querySelectorAll(".word");

        gsap.fromTo(
            els,
            { y: 20, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration,
                stagger,
                delay,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 90%",
                    once: true,
                },
            }
        );
    }, [delay, duration, stagger]);

    return (
        <div ref={containerRef} className={`overflow-hidden ${className}`}>
            {words.map((word, i) => (
                <span key={i} className="inline-block mr-[0.25em] word opacity-0">
                    {word}
                </span>
            ))}
        </div>
    );
}
