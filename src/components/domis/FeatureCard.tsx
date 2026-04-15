"use client";

import { motion } from "framer-motion";

interface FeatureCardProps {
    title: string;
    description: string;
    imageSrc?: string;
    imageAlt?: string;
    imageClassName?: string;
    accent?: string;
    variant?: "light" | "dark";
}

export function FeatureCard({
    title,
    description,
    imageSrc,
    imageAlt,
    imageClassName,
    accent = "#ff4c5c",
    variant = "light",
}: FeatureCardProps) {
    const hasImage = !!imageSrc;
    const isDark = variant === "dark";

    return (
        <motion.div
            className={
                isDark
                    ? "w-full min-w-0 rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex flex-col"
                    : "w-full min-w-0 rounded-2xl overflow-hidden border border-neutral-100 bg-neutral-50 flex flex-col"
            }
            whileHover={{
                scale: 1.02,
                boxShadow: isDark
                    ? "0 12px 46px rgba(0,0,0,0.55)"
                    : "0 8px 32px rgba(0,0,0,0.08)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            {/* Image area — full-bleed width; vertical artwork scales to card width */}
            <div
                className={
                    isDark
                        ? "relative flex w-full shrink-0 flex-[0_0_auto] items-stretch justify-center bg-white/5 p-0 border-b border-white/10"
                        : "relative flex w-full shrink-0 flex-[0_0_auto] items-stretch justify-center bg-white p-0 border-b border-neutral-200"
                }
            >
                {hasImage ? (
                    <img
                        src={imageSrc}
                        alt={imageAlt || title}
                        className={
                            imageClassName ??
                            "block h-auto w-full max-w-none shrink-0 align-middle"
                        }
                        draggable={false}
                        loading="lazy"
                    />
                ) : (
                    <div className={isDark ? "absolute inset-0 flex items-center justify-center border-b border-dashed border-white/10" : "absolute inset-0 flex items-center justify-center border-b border-dashed border-neutral-200"}>
                        <span className={isDark ? "site-body text-white/25 text-left" : "site-body text-neutral-300 text-left"}>
                            Screenshot coming
                        </span>
                    </div>
                )}
            </div>

            {/* Text */}
            <div className="p-5 md:p-6 flex flex-col flex-1">
                <h3 className={isDark ? "site-subheading text-white mb-2 text-left" : "site-subheading text-neutral-900 mb-2 text-left"}>
                    {title}
                </h3>
                <p className={isDark ? "site-body text-white/65 text-left" : "site-body text-neutral-500 text-left"}>
                    {description}
                </p>
            </div>
        </motion.div>
    );
}
