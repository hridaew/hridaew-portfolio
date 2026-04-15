"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
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
    const openedForQuery = useRef(false);

    useEffect(() => {
        if (searchParams.get(WAFFLING_QUERY) !== WAFFLING_VALUE) {
            openedForQuery.current = false;
            return;
        }
        if (!recipe) return;
        if (recipe.isOpen) return;
        if (openedForQuery.current) return;
        openedForQuery.current = true;
        recipe.open("deeplink");
    }, [searchParams, recipe]);

    return null;
}
