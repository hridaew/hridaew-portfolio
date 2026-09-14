import type { Metadata } from "next";
import { ButterChickenRecipeBody } from "@/components/butter-chicken/ButterChickenRecipeBody";
import { WafflingEntrance } from "@/components/shared/WafflingEntrance";
import { PostPill } from "@/components/shared/PostPill";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd, webPageJsonLd } from "@/lib/seo";
import { OTHER_PAGES } from "@/lib/site-identity";

const recipePage = OTHER_PAGES.find((p) => p.path === "/butter-chicken")!;

export const metadata: Metadata = {
    title: "Butter Chicken Recipe · Hridae Walia",
    description:
        "A vibes-based butter chicken recipe — the ingredients are correct, the amounts may vary, and taste scales linearly with butter.",
};

export default function ButterChickenPage() {
    return (
        <main className="relative min-h-[100dvh] w-full overflow-x-hidden bg-paper text-ink">
            <JsonLd data={webPageJsonLd(recipePage)} />
            <JsonLd data={articleJsonLd(recipePage)} />
            <WafflingEntrance>
                <ButterChickenRecipeBody />
            </WafflingEntrance>
            <PostPill title="Butter Chicken Recipe" />
        </main>
    );
}
