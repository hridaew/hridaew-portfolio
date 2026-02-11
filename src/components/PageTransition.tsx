"use client";

import {
    createContext,
    useContext,
    useRef,
    useCallback,
    useEffect,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";

interface PageTransitionContextValue {
    transitionTo: (href: string) => void;
}

const PageTransitionContext = createContext<PageTransitionContextValue>({
    transitionTo: () => {},
});

export function usePageTransition() {
    return useContext(PageTransitionContext);
}

export function PageTransitionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const curtainRef = useRef<HTMLDivElement>(null);
    const isTransitioning = useRef(false);
    const pendingHref = useRef<string | null>(null);
    const prevPathname = useRef(pathname);

    // When pathname changes, play the curtain exit animation
    useEffect(() => {
        if (prevPathname.current === pathname) return;
        prevPathname.current = pathname;

        const curtain = curtainRef.current;
        if (!curtain || !isTransitioning.current) return;

        // Small delay to let the new page paint
        const timer = setTimeout(() => {
            const isGoingHome = pathname === "/";

            // Curtain exits: slides out in the same direction it entered
            gsap.to(curtain, {
                yPercent: isGoingHome ? 100 : -100,
                duration: 0.45,
                ease: "power3.inOut",
                onComplete() {
                    curtain.style.display = "none";
                    isTransitioning.current = false;
                    // Resume smooth scroll
                    (window as any).__lenis?.start();
                },
            });
        }, 50);

        return () => clearTimeout(timer);
    }, [pathname]);

    const transitionTo = useCallback(
        (href: string) => {
            if (isTransitioning.current) return;
            isTransitioning.current = true;
            pendingHref.current = href;

            const curtain = curtainRef.current;
            if (!curtain) {
                router.push(href);
                isTransitioning.current = false;
                return;
            }

            // Pause smooth scroll during transition
            (window as any).__lenis?.stop();

            const isGoingHome = href === "/";

            // Position curtain off-screen, then slide in
            curtain.style.display = "block";
            gsap.set(curtain, {
                yPercent: isGoingHome ? -100 : 100,
            });

            gsap.to(curtain, {
                yPercent: 0,
                duration: 0.4,
                ease: "power3.inOut",
                onComplete() {
                    // Navigate while curtain covers the screen
                    router.push(href);
                },
            });
        },
        [router]
    );

    return (
        <PageTransitionContext.Provider value={{ transitionTo }}>
            {children}
            <div
                ref={curtainRef}
                className="fixed inset-0 z-[100] bg-background"
                style={{ display: "none" }}
            />
        </PageTransitionContext.Provider>
    );
}
