"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { scrollHomeWafflingsForDeepLinkThen } from "@/lib/scrollHomeWafflings";
import { useButterChickenRecipeModalOptional } from "./ButterChickenRecipeModal";

const WAFFLING_QUERY = "waffling";
const WAFFLING_VALUE = "butter-chicken";

/**
 * Opens the recipe modal when the URL contains `?waffling=butter-chicken` (any path).
 * Keeps the query in the address bar while the modal is open so the link can be copied;
 * closing the modal clears it (see `ButterChickenRecipeModalProvider`).
 */
export function ButterChickenRecipeDeepLink() {
    const searchParams = useSearchParams();
    const recipe = useButterChickenRecipeModalOptional();
    const open = recipe?.open;
    const isOpen = recipe?.isOpen ?? false;
    /** True once the URL has contained `waffling=butter-chicken` while the modal was open — avoids reopening after dismiss while the query is still present for a frame. */
    const hadQueryWhileOpenRef = useRef(false);

    useEffect(() => {
        const has = searchParams.get(WAFFLING_QUERY) === WAFFLING_VALUE;

        if (!has) {
            hadQueryWhileOpenRef.current = false;
            return;
        }
        if (!open) return;

        if (isOpen) {
            hadQueryWhileOpenRef.current = true;
            return;
        }

        // Modal is closed but the URL still shows the recipe query: only auto-open
        // when navigating *into* this state (deeplink / fresh load), not after the
        // user dismissed the modal while the query was already active (e.g. opened from card).
        if (hadQueryWhileOpenRef.current) {
            return;
        }

        scrollHomeWafflingsForDeepLinkThen(() => open("deeplink"));
    }, [searchParams, isOpen, open]);

    return null;
}
