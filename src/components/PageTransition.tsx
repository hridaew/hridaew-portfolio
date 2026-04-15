"use client";

import {
    Children,
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

type LenisApi = { start: () => void; stop: () => void };

function getLenis(): LenisApi | undefined {
    if (typeof window === "undefined") return undefined;
    return (window as unknown as { __lenis?: LenisApi }).__lenis;
}

function prefersReducedMotion(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Zoom + blur of page shell before wipe (seconds) */
const PRE_WIPE = 0.18;
/** How much the curtain wipe overlaps the end of the blur (larger = wipe starts sooner) */
const PRE_WIPE_OVERLAP = 0.14;
/** Curtain covers viewport */
const WIPE_IN = 0.34;
const WIPE_OUT = 0.36;
const EASE_PRE = "power2.out";
const EASE_IN = "power3.inOut";
const EASE_OUT = "power3.inOut";

/** Solid shell color — avoids white flashes from `bg-background` on mixed light/dark routes */
const CURTAIN_CLASS =
    "fixed inset-0 z-[100] bg-[#0c0c0e] will-change-transform";

export function PageTransitionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const curtainRef = useRef<HTMLDivElement>(null);
    const shellRef = useRef<HTMLDivElement>(null);
    const isTransitioning = useRef(false);
    const prevPathname = useRef(pathname);

    const childList = Children.toArray(children);
    const pageChild = childList[0] ?? null;
    const chromeAfterPage = childList.slice(1);

    useEffect(() => {
        if (prevPathname.current === pathname) return;
        prevPathname.current = pathname;

        const curtain = curtainRef.current;
        const shell = shellRef.current;
        if (!curtain || !isTransitioning.current) return;

        const reduced = prefersReducedMotion();

        const timer = setTimeout(() => {
            const isGoingHome = pathname === "/";

            if (reduced) {
                gsap.set(curtain, { clearProps: "transform,transformOrigin" });
                curtain.style.display = "none";
                if (shell) gsap.set(shell, { clearProps: "transform,filter" });
                isTransitioning.current = false;
                getLenis()?.start();
                return;
            }

            gsap.killTweensOf([curtain, shell].filter(Boolean));

            const exitOrigin = isGoingHome ? "50% 100%" : "50% 0%";
            gsap.set(curtain, { transformOrigin: exitOrigin });

            const tl = gsap.timeline({
                onComplete() {
                    curtain.style.display = "none";
                    gsap.set(curtain, {
                        scaleY: 0,
                        pointerEvents: "none",
                        clearProps: "transformOrigin",
                    });
                    if (shell) {
                        gsap.set(shell, { clearProps: "transform,filter" });
                    }
                    isTransitioning.current = false;
                    getLenis()?.start();
                },
            });

            if (shell) {
                tl.to(
                    shell,
                    {
                        scale: 1,
                        filter: "blur(0px)",
                        duration: 0.2,
                        ease: EASE_OUT,
                    },
                    0
                );
            }

            tl.to(
                curtain,
                {
                    scaleY: 0,
                    duration: WIPE_OUT,
                    ease: EASE_OUT,
                },
                shell ? 0.04 : 0
            );
        }, 50);

        return () => clearTimeout(timer);
    }, [pathname]);

    const transitionTo = useCallback(
        (href: string) => {
            if (isTransitioning.current) return;
            isTransitioning.current = true;

            const curtain = curtainRef.current;
            const shell = shellRef.current;
            const reduced = prefersReducedMotion();

            if (!curtain) {
                router.push(href);
                isTransitioning.current = false;
                return;
            }

            if (reduced) {
                getLenis()?.stop();
                router.push(href);
                isTransitioning.current = false;
                getLenis()?.start();
                return;
            }

            getLenis()?.stop();

            const isGoingHome = href === "/";
            const originEnter = isGoingHome ? "50% 0%" : "50% 100%";

            gsap.killTweensOf([curtain, shell].filter(Boolean));
            if (shell) {
                gsap.set(shell, { clearProps: "transform,filter" });
                gsap.set(shell, {
                    scale: 1,
                    filter: "blur(0px)",
                    transformOrigin: "50% 50%",
                });
            }

            curtain.style.display = "block";

            const tl = gsap.timeline({
                onComplete: () => {
                    router.push(href);
                },
            });

            tl.set(curtain, {
                autoAlpha: 1,
                pointerEvents: "auto",
                transformOrigin: originEnter,
                scaleY: 0,
            });

            if (shell) {
                tl.to(
                    shell,
                    {
                        scale: 0.97,
                        filter: "blur(14px)",
                        duration: PRE_WIPE,
                        ease: EASE_PRE,
                    },
                    0
                );
            }

            tl.to(
                curtain,
                {
                    scaleY: 1,
                    duration: WIPE_IN,
                    ease: EASE_IN,
                },
                shell ? `-=${PRE_WIPE_OVERLAP}` : 0
            );
        },
        [router]
    );

    return (
        <PageTransitionContext.Provider value={{ transitionTo }}>
            {/* Letterboxing during shell scale/blur shows behind the transformed layer; keep it #0c0c0e (not :root body #fafafa). */}
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-0 bg-[#0c0c0e]"
            />
            <div
                ref={shellRef}
                data-page-transition-shell
                className="relative z-[1] min-h-screen w-full overflow-x-hidden origin-center"
            >
                {pageChild}
            </div>
            {chromeAfterPage}
            <div
                ref={curtainRef}
                aria-hidden
                className={CURTAIN_CLASS}
                style={{ display: "none", transform: "scaleY(0)" }}
            />
        </PageTransitionContext.Provider>
    );
}
