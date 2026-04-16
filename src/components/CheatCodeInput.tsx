"use client";

import { useState, useCallback } from "react";
import { SkeuomorphicRim } from "@/components/shared/SkeuomorphicRim";

interface CheatCodeInputProps {
    onActivate: (code: string) => void;
}

export function CheatCodeInput({ onActivate }: CheatCodeInputProps) {
    const [value, setValue] = useState("");

    const handleSubmit = useCallback(() => {
        if (!value.trim()) return;
        const code = value.trim().toLowerCase();
        onActivate(code);
        setValue("");
    }, [value, onActivate]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            // Stop the activating Enter from reaching a deferred global "skip intro" listener.
            if (value.trim()) e.stopPropagation();
            handleSubmit();
        },
        [handleSubmit, value]
    );

    return (
        <div className="flex w-full flex-wrap items-center justify-start gap-8 py-8">
            {/* Input field */}
            <div className="relative w-[280px] h-11 rounded-3xl bg-white/10 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex items-center justify-between px-4">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="ENTER CHEAT CODE:"
                    className="bg-transparent font-[family-name:var(--font-geist-mono)] text-xs text-white placeholder:text-white/50 focus:outline-none w-full uppercase"
                    autoComplete="off"
                    spellCheck={false}
                />

                {/* Tooltip "?" */}
                <div className="relative group shrink-0 ml-2">
                    <span className="font-[family-name:var(--font-geist-mono)] text-xs text-white underline decoration-solid cursor-default">
                        ?
                    </span>
                    <div className="absolute bottom-full right-0 mb-2 w-[240px] px-3 py-2.5 rounded-lg bg-[#1d1d1d] border border-white/10 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 text-left z-10">
                        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] text-white/60 space-y-1 text-left">
                            <span className="block">Clue 1: The greatest food on the planet</span>
                            <span className="block">Clue 2: Slang word for &ldquo;friend&rdquo; in the year 2077</span>
                            <span className="block">Clue 3: Year of the Invincibles</span>
                            <span className="block">Clue 4: &ldquo;Destroy&rdquo;</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Confirm button */}
            <button
                type="button"
                onClick={handleSubmit}
                className="relative flex h-11 w-[72px] cursor-pointer items-center justify-center overflow-hidden rounded-3xl bg-white/10 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] transition-colors hover:bg-white/[0.15]"
            >
                <SkeuomorphicRim className="z-0" />
                <span className="relative z-[1] font-[family-name:var(--font-geist-mono)] text-xs uppercase whitespace-nowrap text-white">
                    Confirm
                </span>
            </button>
        </div>
    );
}
