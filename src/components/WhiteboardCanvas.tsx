"use client";

import { useRef, useCallback, useEffect } from "react";
import gsap from "gsap";

interface WhiteboardImage {
    src: string;
    alt: string;
    x: number;
    y: number;
    rotation: number;
    width: number;
}

const CANVAS_WIDTH = 3000;
const CANVAS_HEIGHT = 2000;

const images: WhiteboardImage[] = [
    { src: "/assets/sides/6wAsYuLd0cQG98mWximXtFTXUUE.webp", alt: "Side project 1", x: 120, y: 150, rotation: -3, width: 280 },
    { src: "/assets/sides/DGnhbvyO0FTyOuyfB2KPUPdZRjQ.webp", alt: "Side project 2", x: 520, y: 80, rotation: 2, width: 320 },
    { src: "/assets/sides/DWCVpkqP0zj1MdDxzT0Eth2NU.webp", alt: "Side project 3", x: 950, y: 200, rotation: -1.5, width: 300 },
    { src: "/assets/sides/IMG_0248.jpg", alt: "Side project 4", x: 1400, y: 100, rotation: 4, width: 340 },
    { src: "/assets/sides/IMG_0264.jpg", alt: "Side project 5", x: 1850, y: 180, rotation: -2, width: 300 },
    { src: "/assets/sides/IMG_0640.jpg", alt: "Side project 6", x: 2300, y: 120, rotation: 1.5, width: 320 },
    { src: "/assets/sides/Mp0l2nKPEnIGo7F8fZxMEXQDl6s.webp", alt: "Side project 7", x: 200, y: 600, rotation: 3, width: 290 },
    { src: "/assets/sides/QjElm5loNobOPNIKAo3adQ7Bk.webp", alt: "Side project 8", x: 650, y: 550, rotation: -4, width: 310 },
    { src: "/assets/sides/WQH9O3bbKUeqne0jDQEp8qJUdE.webp", alt: "Side project 9", x: 1100, y: 650, rotation: 2.5, width: 280 },
    { src: "/assets/sides/XexFdvpgzQtzUMApg3QOHbXRU.webp", alt: "Side project 10", x: 1550, y: 580, rotation: -1, width: 330 },
    { src: "/assets/sides/YTIVI9VRo0O4thf2kXwONVajUI.webp", alt: "Side project 11", x: 2050, y: 620, rotation: 3.5, width: 300 },
    { src: "/assets/sides/z8xFz86ZzqLJMQScw96CyWGEA.webp", alt: "Side project 12", x: 2500, y: 550, rotation: -2.5, width: 310 },
    { src: "/assets/sides/Screenshot 2026-02-09 at 20.42.59.png", alt: "Side project 13", x: 400, y: 1050, rotation: 1, width: 350 },
    { src: "/assets/sides/dog.jpg", alt: "Dog", x: 800, y: 1050, rotation: -2, width: 300 },
    { src: "/assets/ideas/misc 1.png", alt: "Drawing 1", x: 1200, y: 1050, rotation: 2, width: 300 },
    { src: "/assets/ideas/misc 2.png", alt: "Drawing 2", x: 1600, y: 1100, rotation: -3, width: 280 },
    { src: "/assets/ideas/misc 3.png", alt: "Drawing 3", x: 1980, y: 1000, rotation: 1.5, width: 310 },
    { src: "/assets/ideas/misc 4.png", alt: "Drawing 4", x: 2400, y: 1080, rotation: -2, width: 290 },
    { src: "/assets/ideas/misc5.png", alt: "Drawing 5", x: 2780, y: 1020, rotation: 3, width: 300 },
];

export function WhiteboardCanvas() {
    const viewportRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const scrollStart = useRef({ x: 0, y: 0 });
    const didDrag = useRef(false);
    const scaleRef = useRef(1);

    // Momentum/inertia refs
    const velocity = useRef({ x: 0, y: 0 });
    const lastPointerPos = useRef({ x: 0, y: 0 });
    const lastPointerTime = useRef(0);
    const inertiaRaf = useRef<number | null>(null);

    // Center the canvas on mount
    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        el.scrollLeft = (CANVAS_WIDTH - el.clientWidth) / 2;
        el.scrollTop = (CANVAS_HEIGHT - el.clientHeight) / 2;
    }, []);

    const cancelInertia = useCallback(() => {
        if (inertiaRaf.current !== null) {
            cancelAnimationFrame(inertiaRaf.current);
            inertiaRaf.current = null;
        }
    }, []);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (e.button !== 0) return;
        const el = viewportRef.current;
        if (!el) return;
        cancelInertia();
        isDragging.current = true;
        didDrag.current = false;
        dragStart.current = { x: e.clientX, y: e.clientY };
        scrollStart.current = { x: el.scrollLeft, y: el.scrollTop };
        lastPointerPos.current = { x: e.clientX, y: e.clientY };
        lastPointerTime.current = performance.now();
        velocity.current = { x: 0, y: 0 };
        el.style.cursor = "grabbing";
    }, [cancelInertia]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDragging.current) return;
        const el = viewportRef.current;
        if (!el) return;
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            didDrag.current = true;
        }
        el.scrollLeft = scrollStart.current.x - dx;
        el.scrollTop = scrollStart.current.y - dy;

        // Track velocity
        const now = performance.now();
        const dt = now - lastPointerTime.current;
        if (dt > 0) {
            velocity.current = {
                x: (lastPointerPos.current.x - e.clientX) / dt * 16,
                y: (lastPointerPos.current.y - e.clientY) / dt * 16,
            };
        }
        lastPointerPos.current = { x: e.clientX, y: e.clientY };
        lastPointerTime.current = now;
    }, []);

    const handlePointerUp = useCallback(() => {
        if (!isDragging.current) return;
        isDragging.current = false;
        const el = viewportRef.current;
        if (el) el.style.cursor = "grab";

        // Start inertia
        const decay = 0.95;
        const startInertia = () => {
            const vx = velocity.current.x;
            const vy = velocity.current.y;
            if (Math.abs(vx) < 0.5 && Math.abs(vy) < 0.5) {
                inertiaRaf.current = null;
                return;
            }
            if (el) {
                el.scrollLeft += vx;
                el.scrollTop += vy;
            }
            velocity.current.x *= decay;
            velocity.current.y *= decay;
            inertiaRaf.current = requestAnimationFrame(startInertia);
        };
        startInertia();
    }, []);

    // Apply scale transform to inner canvas
    const applyScale = useCallback((scale: number, originX?: number, originY?: number) => {
        const el = viewportRef.current;
        const inner = innerRef.current;
        if (!el || !inner) return;

        const prevScale = scaleRef.current;
        scaleRef.current = scale;

        inner.style.transformOrigin = "0 0";

        gsap.to(inner, {
            scale,
            duration: 0.3,
            ease: "power3.out",
            onUpdate() {
                if (originX !== undefined && originY !== undefined) {
                    const currentScale = gsap.getProperty(inner, "scaleX") as number;
                    const ratio = currentScale / prevScale;
                    el.scrollLeft = originX * ratio - (originX - el.scrollLeft);
                    el.scrollTop = originY * ratio - (originY - el.scrollTop);
                }
            },
        });
    }, []);

    // Double-click to toggle 1x ↔ 2x
    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        const el = viewportRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const originX = e.clientX - rect.left + el.scrollLeft;
        const originY = e.clientY - rect.top + el.scrollTop;

        const newScale = scaleRef.current === 1 ? 2 : 1;
        applyScale(newScale, originX, originY);
    }, [applyScale]);

    // Pinch/trackpad zoom
    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            if (!e.ctrlKey) return;
            e.preventDefault();

            const rect = el.getBoundingClientRect();
            const originX = e.clientX - rect.left + el.scrollLeft;
            const originY = e.clientY - rect.top + el.scrollTop;

            const delta = 1 - e.deltaY * 0.01;
            const newScale = Math.min(3, Math.max(0.5, scaleRef.current * delta));

            applyScale(newScale, originX, originY);
        };

        el.addEventListener("wheel", handleWheel, { passive: false });
        return () => el.removeEventListener("wheel", handleWheel);
    }, [applyScale]);

    // Cleanup inertia on unmount
    useEffect(() => {
        return () => cancelInertia();
    }, [cancelInertia]);

    return (
        <section className="py-16 md:py-24 border-t border-[var(--border-card)]">
            <div className="max-w-[1200px] mx-auto px-6 md:px-12 mb-8">
                <p className="font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] text-base">
                    Things
                </p>
            </div>

                <div className="max-w-[1200px] mx-auto px-6 md:px-12">
                    <div
                        ref={viewportRef}
                        className="relative w-full h-[500px] md:h-[600px] overflow-hidden cursor-grab select-none rounded-2xl border border-[var(--border-card)]"
                        style={{
                            touchAction: "none",
                            backgroundColor: "#f5f5f5",
                            backgroundImage: "radial-gradient(circle, #d0d0d0 1px, transparent 1px)",
                            backgroundSize: "24px 24px",
                        }}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        onDoubleClick={handleDoubleClick}
                    >
                        <div
                            ref={innerRef}
                            className="absolute"
                            style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
                        >
                            {images.map((img, i) => (
                                <div
                                    key={i}
                                    className="absolute group"
                                    style={{
                                        left: img.x,
                                        top: img.y,
                                        width: img.width,
                                        transform: `rotate(${img.rotation}deg)`,
                                    }}
                                >
                                    <div
                                        className="bg-white p-2 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition-shadow duration-200"
                                    >
                                        <img
                                            src={img.src}
                                            alt={img.alt}
                                            className="w-full h-auto rounded"
                                            draggable={false}
                                            loading="lazy"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
        </section>
    );
}
