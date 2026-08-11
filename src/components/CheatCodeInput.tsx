"use client";

import { useState, useCallback } from "react";
import { SkeuomorphicRim } from "@/components/shared/SkeuomorphicRim";
import { CHOOM } from "@/lib/homeChoomCopy";
import { useChoomLingo } from "@/components/home/HomeChoomLingoContext";

interface CheatCodeInputProps {
    onActivate: (code: string) => void;
}

export function CheatCodeInput({ onActivate }: CheatCodeInputProps) {
    const choom = useChoomLingo();
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
        <div className="flex w-auto shrink-0 items-center justify-start gap-2.5">
            {/* Input field */}
            <div className="relative flex h-9 w-[240px] items-center justify-between rounded-2xl bg-ink/[0.05] px-3">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        choom ? CHOOM.cheatPlaceholder : "ENTER CHEAT CODE:"
                    }
                    className="w-full bg-transparent font-[family-name:var(--font-geist-mono)] text-[11px] uppercase text-ink placeholder:text-ink-muted focus:outline-none"
                    autoComplete="off"
                    spellCheck={false}
                />

                {/* Tooltip "?" */}
                <div className="group relative ml-2 shrink-0">
                    <span className="cursor-default font-[family-name:var(--font-geist-mono)] text-[11px] text-ink-muted underline decoration-solid">
                        ?
                    </span>
                    <div className="pointer-events-none absolute bottom-full right-0 z-10 mb-2 w-[240px] rounded-lg border border-ink/[0.08] bg-paper-raised px-3 py-2.5 text-left opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                        <p className="space-y-1 text-left font-[family-name:var(--font-geist-mono)] text-[10px] text-ink-muted">
                            <span className="block">
                                {choom ? CHOOM.cheatClue1 : "Clue 1: Slang word for \u201cfriend\u201d in the year 2077"}
                            </span>
                            <span className="block">
                                {choom ? CHOOM.cheatClue2 : "Clue 2: Year of the Invincibles"}
                            </span>
                            <span className="block">
                                {choom ? CHOOM.cheatClue3 : "Clue 3: The greatest food on the planet"}
                            </span>
                            <span className="block">
                                {choom ? CHOOM.cheatClue4 : "Clue 4: \u201cDestroy\u201d"}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Submit — Enter key icon */}
            <button
                type="button"
                onClick={handleSubmit}
                aria-label={choom ? CHOOM.cheatConfirm : "Enter"}
                className="relative flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-ink/[0.05] transition-colors hover:bg-ink/[0.075]"
            >
                <SkeuomorphicRim className="z-0" />
                <svg
                    className="relative z-[1] size-4 text-ink-muted"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden
                >
                    <path
                        d="M3 3.5h7.5A2.5 2.5 0 0 1 13 6v5.5M13 11.5H5.5M7.25 9.25 5.5 11.5l1.75 2.25"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </div>
    );
}
