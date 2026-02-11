"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    strength?: number; // How strong the magnetic pull is
}

export function MagneticButton({
    children,
    className = "",
    strength = 30, // Default strength
}: MagneticButtonProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const xTo = gsap.quickTo(el, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
        const yTo = gsap.quickTo(el, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { left, top, width, height } = el.getBoundingClientRect();
            const x = clientX - (left + width / 2);
            const y = clientY - (top + height / 2);

            xTo(x * (strength / 100)); // Scale down the movement based on strength
            yTo(y * (strength / 100));
        };

        const handleMouseLeave = () => {
            xTo(0);
            yTo(0);
        };

        el.addEventListener("mousemove", handleMouseMove);
        el.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            el.removeEventListener("mousemove", handleMouseMove);
            el.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [strength]);

    return (
        <div ref={ref} className={`inline-block ${className}`}>
            {children}
        </div>
    );
}
