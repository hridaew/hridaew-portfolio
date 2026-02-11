"use client";

import { useState, useCallback } from "react";

interface CheatCodeInputProps {
    onActivate: (code: string) => void;
}

export function CheatCodeInput({ onActivate }: CheatCodeInputProps) {
    const [value, setValue] = useState("");

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && value.trim()) {
                const code = value.trim().toLowerCase();
                onActivate(code);
                setValue("");
            }
        },
        [value, onActivate]
    );

    return (
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-8">
            <div className="flex items-center justify-center gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="enter cheat code"
                    className="w-full max-w-[280px] bg-transparent border-b border-[var(--border-card)] py-2 text-sm font-[family-name:var(--font-dm-sans)] text-[var(--text-subtle)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--text-muted)] transition-colors text-center"
                    autoComplete="off"
                    spellCheck={false}
                />
                <div className="relative group">
                    <div className="w-[18px] h-[18px] rounded-full border border-[var(--border-card)] flex items-center justify-center cursor-default text-[10px] font-[family-name:var(--font-dm-sans)] text-[var(--text-subtle)] hover:border-[var(--text-muted)] hover:text-[var(--text-muted)] transition-colors shrink-0">
                        ?
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[240px] px-3 py-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 text-left">
                        <p className="text-[11px] font-[family-name:var(--font-dm-sans)] text-[var(--text-subtle)] leading-relaxed space-y-1">
                            <span className="block">Clue 1: The greatest food on the planet</span>
                            <span className="block">Clue 2: Slang word for &ldquo;friend&rdquo; in the year 2077</span>
                            <span className="block">Clue 3: Year of the Invincibles</span>
                            <span className="block">Clue 4: &ldquo;Destroy&rdquo;</span>
                        </p>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--bg-card)] border-b border-r border-[var(--border-card)] rotate-45 -mt-1" />
                    </div>
                </div>
            </div>
        </div>
    );
}
