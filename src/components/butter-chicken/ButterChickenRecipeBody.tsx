"use client";

import type { ParsedButterChicken } from "@/lib/butter-chicken-recipe";
import { HOME_COLUMN } from "@/components/home/homeGrid";
import { cn } from "@/lib/utils";

export function ButterChickenRecipeBody({ parsed }: { parsed: ParsedButterChicken }) {
    const intro = parsed.intro.join(" ").trim();

    return (
        <div className={cn(HOME_COLUMN, "pt-24 pb-24 md:pt-32 md:pb-28")}>
            <header className="flex flex-col items-start">
                <h3 id="butter-chicken-modal-title" className="type-h3 text-left text-white">
                    Butter Chicken Recipe
                </h3>

                <img
                    src="/assets/home/waffling-butterchicken.png"
                    alt=""
                    className="mt-8 h-auto w-full max-w-[min(100%,520px)] object-cover"
                    draggable={false}
                    loading="eager"
                />

                {intro ? (
                    <p className="site-body mt-8 text-left text-white/65">{intro}</p>
                ) : null}
            </header>

            <div className="mt-14 space-y-2 md:mt-16">
                {parsed.ingredients.map((item, idx) => (
                    <p key={`s-${idx}`} className="site-body text-left text-white/75">
                        {item}
                    </p>
                ))}
            </div>

            {(parsed.tandooriIngredients.length > 0 || parsed.tandooriSteps.length > 0) && (
                <section className="mt-12">
                    <p className="type-body-lg font-semibold tracking-tight text-white/95">Tandoori chicken</p>
                    {parsed.tandooriIngredients.length > 0 ? (
                        <div className="mt-4 space-y-2">
                            {parsed.tandooriIngredients.map((item, idx) => (
                                <p key={`ti-${idx}`} className="site-body text-left text-white/75">
                                    {item}
                                </p>
                            ))}
                        </div>
                    ) : null}
                    {parsed.tandooriSteps.length > 0 ? (
                        <div className={cn("space-y-3", parsed.tandooriIngredients.length > 0 ? "mt-8" : "mt-4")}>
                            {parsed.tandooriSteps.map((item, idx) => (
                                <p key={`ts-${idx}`} className="site-body text-left text-white/75">
                                    {item}
                                </p>
                            ))}
                        </div>
                    ) : null}
                </section>
            )}

            {parsed.butterChickenSteps.length > 0 ? (
                <section className="mt-12">
                    <p className="type-body-lg font-semibold tracking-tight text-white/95">Butter Chicken</p>
                    <div className="mt-4 space-y-3">
                        {parsed.butterChickenSteps.map((item, idx) => (
                            <p key={`b-${idx}`} className="site-body text-left text-white/75">
                                {item}
                            </p>
                        ))}
                    </div>
                </section>
            ) : null}

            <div className="h-12" />
        </div>
    );
}
