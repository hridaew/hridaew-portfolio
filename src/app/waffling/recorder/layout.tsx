import type { Metadata } from "next";
import { Pixelify_Sans } from "next/font/google";

/**
 * Pixelify Sans is only used inside the recorder prototype, so we scope the
 * `next/font` load to this route's layout. It mounts as a global `@font-face`,
 * which is what the inline `font-['Pixelify_Sans']` selectors in
 * `VoiceRecorder.tsx` reference.
 */
const pixelifySans = Pixelify_Sans({
    subsets: ["latin"],
    weight: ["400", "500"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Recorder-Proto · Hridae Walia",
    description:
        "A skeuomorphic mobile voice recorder prototype — turntable scrub, audio-reactive center, cassette-eject SFX.",
};

export default function RecorderLayout({ children }: { children: React.ReactNode }) {
    return <div className={pixelifySans.className}>{children}</div>;
}
