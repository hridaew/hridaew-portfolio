import type { Metadata } from "next";
import { ButterChickenRecipeBody } from "@/components/butter-chicken/ButterChickenRecipeBody";
import { WafflingEntrance } from "@/components/shared/WafflingEntrance";
import { PostPill } from "@/components/shared/PostPill";

export const metadata: Metadata = {
    title: "Butter Chicken Recipe · Hridae Walia",
    description:
        "A vibes-based butter chicken recipe — the ingredients are correct, the amounts may vary, and taste scales linearly with butter.",
};

export default function ButterChickenPage() {
    return (
        <main className="relative min-h-[100dvh] w-full overflow-x-hidden bg-paper text-ink">
            <WafflingEntrance>
                <ButterChickenRecipeBody />
            </WafflingEntrance>
            <PostPill title="Butter Chicken Recipe" />
        </main>
    );
}
