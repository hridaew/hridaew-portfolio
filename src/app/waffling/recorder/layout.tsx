import type { Metadata } from "next";
// Pixelify Sans, bundled (Fontsource, OFL): declared as "Pixelify Sans", the name VoiceRecorder.tsx uses.
import "@fontsource/pixelify-sans/400.css";
import "@fontsource/pixelify-sans/500.css";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd, webPageJsonLd } from "@/lib/seo";
import { OTHER_PAGES } from "@/lib/site-identity";

const recorderPage = OTHER_PAGES.find((p) => p.path === "/waffling/recorder")!;

export const metadata: Metadata = {
    title: "Recorder-Proto · Hridae Walia",
    description:
        "A skeuomorphic mobile voice recorder prototype — turntable scrub, audio-reactive center, cassette-eject SFX.",
};

export default function RecorderLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="font-['Pixelify_Sans',sans-serif]">
            <JsonLd data={webPageJsonLd(recorderPage)} />
            <JsonLd data={articleJsonLd(recorderPage)} />
            {children}
        </div>
    );
}
