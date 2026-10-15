"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE_COLUMN } from "@/components/home/homeGrid";
import { ParallaxHero } from "@/components/virdio/ParallaxHero";
import { ScrollRevealFlow } from "@/components/virdio/ScrollRevealFlow";
import { ConePlayground } from "@/components/virdio/ConePlayground";
import { LightboxProvider, LightboxImage } from "@/components/virdio/Lightbox";
import { ARMosaic } from "@/components/virdio/ARMosaic";
import { PunchBag } from "@/components/virdio/PunchBag";
import { Reveal } from "@/components/Reveal";
import { MarketComparison } from "@/components/virdio/MarketComparison";
import { PlatformSpectrum } from "@/components/virdio/PlatformSpectrum";
import { DecisionCards } from "@/components/virdio/DecisionCards";
import { DeferredVideo } from "@/components/DeferredVideo";
import {
    VirdioBridge,
    VirdioCardRow,
    VirdioChapterHead,
    VirdioGlance,
    VirdioPrinciple,
    VirdioShotRow,
} from "@/components/virdio/VirdioStory";

function Prose({ children }: { children: React.ReactNode }) {
    return <div className="w-full min-w-0 case-study-prose-stack case-study-block-gap flex flex-col">{children}</div>;
}

function P({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <Reveal delay={delay}>
            <p className="site-body text-ink-muted">{children}</p>
        </Reveal>
    );
}

function SubHead({ children }: { children: React.ReactNode }) {
    return (
        <Reveal>
            <h3 className="site-subheading case-study-heading-trail-mb text-ink">{children}</h3>
        </Reveal>
    );
}

export function VirdioCaseStudyBody() {
    return (
        <LightboxProvider>
            {/* ═══ HERO + AT A GLANCE + VIDEO ═══ */}
            <div className="relative">
                <ParallaxHero />
            </div>

            <section className={cn("relative z-20 -mt-16 bg-paper md:-mt-20 case-study-subsection-gap", SITE_COLUMN)}>
                <Reveal>
                    <VirdioGlance />
                </Reveal>
            </section>

            <section className={cn("relative z-20 case-study-section-gap", SITE_COLUMN)}>
                <Reveal>
                    <div className="aspect-video overflow-hidden rounded-2xl border border-ink/[0.08] shadow-e3">
                        <DeferredVideo
                            src="/assets/home/virdio-hero-crop.mp4"
                            poster="/assets/home/virdio-ar-desktop.webp"
                            className="work-gallery-card-video h-full w-full select-none object-cover outline-none"
                            loop
                            muted
                            tabIndex={-1}
                            controls={false}
                            controlsList="nodownload nofullscreen noremoteplayback"
                            disablePictureInPicture
                            disableRemotePlayback
                            aria-label="Virdio AR desktop hero video"
                            draggable={false}
                            onContextMenu={(e) => e.preventDefault()}
                        />
                    </div>
                </Reveal>
            </section>

            {/* ═══ 01 THE BET ═══ */}
            <div className={SITE_COLUMN}>
                <section id="bet" className="case-study-section-y border-t border-ink/[0.08]">
                    <VirdioChapterHead
                        number="01"
                        eyebrow="The bet"
                        title="Peloton-grade classes, without the $1,500 hardware"
                    />
                    <Prose>
                        <P>
                            In 2021, the most engaging home fitness was gated by equipment. Peloton needed a bike,
                            Mirror needed a screen, and everyone else had passive videos with no feedback.
                        </P>
                        <P delay={0.05}>
                            Virdio&rsquo;s machine vision could read body poses through a standard camera and simulate
                            equipment in AR. If any laptop or phone could be the equipment, the barrier to entry was
                            gone. That also made the user&rsquo;s room, their distance from the screen and the device
                            they picked part of my design problem.
                        </P>
                    </Prose>

                    <Reveal>
                        <MarketComparison className="case-study-block-gap px-0" />
                    </Reveal>

                    <div className="w-full min-w-0 case-study-block-gap">
                        <SubHead>The only designer, six surfaces, a team 12 hours ahead</SubHead>
                        <div className="case-study-prose-stack flex flex-col">
                            <P delay={0.05}>
                                Virdio had been licensing its tech to gyms for remote classes. I joined as the sole
                                full-time product designer to turn it into a direct-to-consumer subscription: the app,
                                the AR overlays, setup, the design system and some marketing.
                            </P>
                            <P delay={0.1}>
                                It had to ship on iOS, Android, web, Mac and Windows desktop, Apple Watch and smart TV,
                                on a startup timeline, with engineering working async twelve hours ahead of me.
                            </P>
                        </div>
                    </div>

                    <Reveal>
                        <div className="flex flex-col items-start case-study-grid-gap md:flex-row">
                            <div className="rounded-2xl overflow-hidden border border-ink/[0.08]">
                                <LightboxImage
                                    src="/assets/virdio/desktop_mockup.png"
                                    alt="Desktop app showing room calibration: Diagonal cones step with walk-to-zone instruction"
                                    className="w-full h-auto object-contain"
                                    draggable={false}
                                    hoverScale={1.03}
                                />
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-ink/[0.08] md:self-stretch flex items-center">
                                <LightboxImage
                                    src="/assets/virdio/mobile_mockup.png"
                                    alt="Mobile app: class browsing with Live and On-demand tabs and category filters"
                                    className="h-full w-auto object-contain max-h-[500px] md:max-h-none"
                                    draggable={false}
                                    hoverScale={1.03}
                                />
                            </div>
                        </div>
                    </Reveal>
                </section>
            </div>

            {/* ═══ 02 THE CATCH ═══ */}
            <div className={SITE_COLUMN}>
                <section id="catch" className="case-study-section-y border-t border-ink/[0.08]">
                    <VirdioChapterHead
                        number="02"
                        eyebrow="The catch"
                        title="The device everyone owns was the worst one for the product"
                    />
                    <Prose>
                        <P>
                            I tested prototypes with trainers and our advisory board of fitness experts and
                            physicians. The phone, our easiest way in, was the weakest device for the core AR workout.
                        </P>
                        <P delay={0.05}>
                            Pose detection needs distance from the camera, and people prop phones close or on
                            unstable surfaces. On a small screen, every overlay competes with the trainer. If the
                            phone was the front door, most first classes would be the lowest-quality version of our
                            differentiator.
                        </P>
                    </Prose>

                    <Reveal>
                        <PlatformSpectrum className="case-study-section-gap" />
                    </Reveal>

                    <div className="w-full min-w-0 case-study-block-gap">
                        <SubHead>I argued for desktop first. We launched everywhere.</SubHead>
                        <div className="case-study-prose-stack flex flex-col">
                            <P delay={0.05}>
                                I pushed to focus our small team on making the larger-screen class exceptional, then
                                bring mobile up to it.
                            </P>
                            <P delay={0.1}>
                                The CEO was adamant about launching everywhere at once, and he had a real argument:
                                availability anywhere set us apart from hardware-locked competitors, and the phone was
                                still the easiest place to browse and book. So I designed the compromise.
                            </P>
                        </div>
                    </div>

                    <Reveal>
                        <DecisionCards />
                    </Reveal>

                    <div className="w-full min-w-0 case-study-block-gap pt-16 md:pt-24">
                        <SubHead>On a phone, setup says so out loud</SubHead>
                        <div className="case-study-prose-stack flex flex-col">
                            <P delay={0.05}>
                                Starting a class on a phone lists what you need, a stand and a clear area, and says
                                plainly that a computer or tablet gives the better class. The next step asks you to turn
                                the phone to landscape and set it down in front of you. We were honest at the moment it
                                mattered, instead of letting people find out mid-workout.
                            </P>
                        </div>
                    </div>

                    <Reveal>
                        <div className="grid grid-cols-1 items-center case-study-grid-gap md:grid-cols-[1fr_2.4fr]">
                            <div className="mx-auto w-full max-w-[280px] overflow-hidden rounded-[28px] border border-ink/[0.08] bg-paper-sunken">
                                <LightboxImage
                                    src="/assets/virdio/figma/mobile_setup_start.jpg"
                                    alt="Mobile Class Setup: Starting Class Setup, requirements of a stand for your phone and a clear workout area, and a recommendation to attend on the computer or tablet app"
                                    className="h-auto w-full object-contain"
                                    draggable={false}
                                    loading="lazy"
                                />
                            </div>
                            <figure className="m-0 flex min-w-0 flex-col gap-3">
                                <div className="overflow-hidden rounded-2xl border border-ink/[0.08] bg-paper-sunken">
                                    <LightboxImage
                                        src="/assets/virdio/figma/mobile_room_setup.jpg"
                                        alt="Mobile Room Setup step: rotate the phone to landscape and set it on a surface in front of you, with Skip and Continue"
                                        className="h-auto w-full object-contain"
                                        draggable={false}
                                        loading="lazy"
                                    />
                                </div>
                                <figcaption className="site-gallery-caption text-left text-ink-subtle">
                                    &ldquo;For the best experience, we recommend attending this class on the computer or
                                    tablet app.&rdquo; The compromise, written into the first screen.
                                </figcaption>
                            </figure>
                        </div>
                    </Reveal>

                    <div className="pt-16 md:pt-24">
                        <Reveal>
                            <VirdioPrinciple
                                eyebrow="The design problem"
                                statement="Once class starts, the user is across the room, mid-rep."
                                note="Whatever device people picked, nothing in a class could depend on a tap. The body had to be the input. Every chapter below applies that test."
                            />
                        </Reveal>
                    </div>
                </section>
            </div>

            {/* ═══ 03 SET UP THE ROOM ═══ */}
            <section id="setup" className="case-study-section-y-t border-t border-ink/[0.08]">
                <div className={SITE_COLUMN}>
                    <VirdioChapterHead
                        number="03"
                        eyebrow="Set up the room"
                        title="The camera has to understand the room before the class can start"
                        lede="The system needed two things it had no control over: where the camera pointed, and how much floor the user had. I started by sketching what the camera sees, not what the screen shows."
                    />

                    <Reveal>
                        <VirdioShotRow
                            cols={3}
                            contain
                            className="case-study-block-gap"
                            shots={[
                                {
                                    src: "/assets/virdio/sketch_setup.jpg",
                                    alt: "Pencil sketch: a stick figure standing in front of a laptop on a stand, as the camera sees the room",
                                    caption: "Framing the whole body",
                                },
                                {
                                    src: "/assets/virdio/sketch_angle_calibration.jpg",
                                    alt: "Sketch of a figure between two green bands marking the top and bottom of the frame, for angle calibration",
                                    caption: "Checking the camera angle",
                                },
                                {
                                    src: "/assets/virdio/sketch_box_jump.jpg",
                                    alt: "Sketch of a figure jumping onto a small virtual box with a height note beside it",
                                    caption: "Sizing a virtual box jump",
                                },
                            ]}
                        />
                    </Reveal>

                    <div className="w-full min-w-0 case-study-block-gap">
                        <SubHead>Setup happens in the minutes before class starts</SubHead>
                        <div className="case-study-prose-stack flex flex-col">
                            <P delay={0.05}>
                                Class setup is a six-step lobby that runs while you wait for the class, with a
                                &ldquo;starts in&rdquo; countdown always in the corner. Device settings come first, with
                                a live camera preview. Equipment is set per class, because a box jump that suits one
                                person is wrong for another. Pairing a watch is optional and takes a four-digit code.
                            </P>
                        </div>
                    </div>

                    <Reveal>
                        <VirdioShotRow
                            cols={3}
                            className="case-study-block-gap"
                            shots={[
                                {
                                    src: "/assets/virdio/figma/class_setup_device.jpg",
                                    alt: "Class Setup step 1 of 6, Device Settings: camera, resolution, speaker and mic pickers with a live camera preview",
                                    strong: "1/6.",
                                    caption: "Camera, speaker and mic, with a live preview.",
                                },
                                {
                                    src: "/assets/virdio/figma/class_setup_equipment.jpg",
                                    alt: "Class Setup step 4 of 6, Equipment Setup: box jump size and preferred boxing hand, with a virtual box previewed beside a trainer",
                                    strong: "4/6.",
                                    caption: "Virtual equipment for this class.",
                                },
                                {
                                    src: "/assets/virdio/figma/class_setup_watch.jpg",
                                    alt: "Setup Watch App dialog: launch the watch app and enter a 4-digit code to track calories",
                                    strong: "Optional.",
                                    caption: "Pair a watch with a four-digit code.",
                                },
                            ]}
                        />
                    </Reveal>

                    <div className="w-full min-w-0 case-study-block-gap">
                        <SubHead>Stand on the spot, then walk to the cones</SubHead>
                        <div className="case-study-prose-stack flex flex-col">
                            <P delay={0.05}>
                                Camera alignment only needed the user centered and the camera angled to see feet to
                                shoulders. You stand on a glowing target and the frame does the instructing: the edge
                                that&rsquo;s wrong glows red, and when both edges turn green it captures. Every state is
                                one phrase in big type, readable from where you stand.
                            </P>
                            <P delay={0.1}>
                                For the play space, virtual cones appear and you walk to each corner. The system
                                already tracks your body, so standing at a cone is the confirmation.{" "}
                                <strong className="text-ink">Walking is the input.</strong> It ends with the floor
                                filled in and a check mark.
                            </P>
                        </div>
                    </div>

                    <Reveal>
                        <VirdioShotRow
                            cols={3}
                            className="case-study-block-gap"
                            shots={[
                                {
                                    src: "/assets/virdio/figma/tilt_down.jpg",
                                    alt: "Tilt camera down: the top edge of the frame glows red and the bottom edge green",
                                    strong: "Red edge.",
                                    caption: "Tilt away from it.",
                                },
                                {
                                    src: "/assets/virdio/figma/tilt_up.jpg",
                                    alt: "Tilt camera up: the bottom edge of the frame glows red and the top edge green",
                                    strong: "Other way.",
                                    caption: "The red moves to the edge that’s off.",
                                },
                                {
                                    src: "/assets/virdio/figma/tilt_capturing.jpg",
                                    alt: "Capturing: both the top and bottom edges glow green",
                                    strong: "Green on both.",
                                    caption: "Hold still while it captures.",
                                },
                            ]}
                        />
                    </Reveal>
                </div>

                {/* ScrollRevealFlow — full width (must stay outside max-w container for GSAP pin) */}
                <div className="case-study-block-gap">
                    <ScrollRevealFlow />
                </div>

                <div className={SITE_COLUMN}>
                    <Reveal>
                        <VirdioShotRow
                            className="case-study-block-gap"
                            shots={[
                                {
                                    src: "/assets/virdio/phone_setup_mid.png",
                                    alt: "Move to the other cone: directional arrows guide the user between calibration cones",
                                    caption: "Mobile setup uses bigger text and UI, so it reads on a small screen from a distance.",
                                },
                                {
                                    src: "/assets/virdio/phone_setup_end.png",
                                    alt: "Room Setup Complete: four purple cones define the workout space",
                                    caption: "Four cones, and the space is defined.",
                                },
                            ]}
                        />
                    </Reveal>

                    <div className="case-study-block-gap">
                        <Reveal>
                            <div className="flex w-full flex-col gap-6 md:gap-8">
                                <div className="mx-auto w-full min-w-0 text-left">
                                    <p className="site-label case-study-tight-trail-mb text-left text-ink-subtle">Interactive</p>
                                    <h3 className="site-subheading case-study-heading-trail-mb text-ink">Try it: calibrate your space</h3>
                                </div>
                                <div className="mx-auto w-full min-w-0">
                                    <ConePlayground />
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    <div className="w-full min-w-0 case-study-block-gap">
                        <SubHead>Every failure ends in a class, not an error</SubHead>
                        <div className="case-study-prose-stack flex flex-col">
                            <P delay={0.05}>
                                Living rooms are messy: a dog walks through, someone sits on the couch, the light
                                changes. I mapped every way setup could fail, including tracking lost mid-class and
                                people skipping setup entirely, and gave each one a way back to the workout. If
                                tracking can&rsquo;t recover, the class continues with reduced AR instead of stopping.
                            </P>
                        </div>
                    </div>

                    <Reveal>
                        <div className="mx-auto flex w-full min-w-0 flex-col gap-4 md:gap-5 case-study-block-gap">
                            <div className="overflow-hidden rounded-2xl border border-ink/[0.08] bg-paper-sunken">
                                <LightboxImage
                                    src="/assets/virdio/calibration_flow.png"
                                    alt="Calibration flow: recovery paths when tracking is lost, skip setup, and in-class failure"
                                    className="block h-auto w-full object-contain"
                                    draggable={false}
                                    hoverScale={1.02}
                                />
                            </div>
                            <p className="site-gallery-caption text-left text-ink-subtle">
                                Recovery paths for lost tracking, skipped setup and failure during a class. Each one
                                lands back in the workout.
                            </p>
                        </div>
                    </Reveal>

                    <div className="w-full min-w-0 case-study-block-gap">
                        <SubHead>Three takes on losing tracking mid-class</SubHead>
                        <div className="case-study-prose-stack flex flex-col">
                            <P delay={0.05}>
                                The hardest moment is mid-set, when someone steps out of frame to grab water. I explored
                                a few ways to handle it. All of them frame the prompt as a system state, never the
                                user&rsquo;s mistake.
                            </P>
                        </div>
                    </div>

                    <Reveal>
                        <VirdioShotRow
                            cols={3}
                            className="case-study-block-gap"
                            shots={[
                                {
                                    src: "/assets/virdio/figma/active_calibrating.jpg",
                                    alt: "Class HUD replaced by a Calibrating AR panel asking Did you step out of frame, with a Don’t show this again link",
                                    strong: "Recalibrate on its own.",
                                    caption: "It explains itself, with a way to stop the prompt.",
                                },
                                {
                                    src: "/assets/virdio/figma/active_disable_recal.jpg",
                                    alt: "Disable Recalibration dialog warning that virtual equipment won’t work if you move out of frame, with a Recalibration toggle in the class controls",
                                    strong: "A switch, with its cost.",
                                    caption: "Turn recalibration off, knowing the equipment stops working.",
                                },
                                {
                                    src: "/assets/virdio/step_out_of_frame.png",
                                    alt: "Did you step out of frame: non-judgmental prompt with Ignore and Remind options",
                                    strong: "Ask, then let them choose when.",
                                    caption: "Ignore for this session, or be reminded after this exercise.",
                                },
                            ]}
                        />
                    </Reveal>

                    <div className="case-study-block-gap">
                        <VirdioBridge>
                            Setup earns the class. Inside the class the rule was the same: nothing to tap, and
                            nothing that needs reading up close.
                        </VirdioBridge>
                    </div>
                </div>
            </section>

            {/* ═══ 04 RUN THE CLASS ═══ */}
            <section id="class" className="case-study-section-y-t border-t border-ink/[0.08]">
                <div className={SITE_COLUMN}>
                    <VirdioChapterHead
                        number="04"
                        eyebrow="Run the class"
                        title="The AR equipment shows the move, then counts the rep"
                    />
                    <Prose>
                        <P>
                            Machine vision counted squats, punches and jumps in real time. Instead of a tutorial or a
                            wall of numbers, I gave every AR object two jobs. Before the rep it is the instruction: the
                            pad shows where your foot goes. During the rep it is the hit box: touch it, it turns green,
                            and the count goes up.
                        </P>
                        <P delay={0.05}>
                            You learn the move and get feedback from the same object, with nothing to read. It is
                            closer to game design than app design.
                        </P>
                    </Prose>

                    <Reveal>
                        <VirdioShotRow
                            className="case-study-block-gap"
                            shots={[
                                {
                                    src: "/assets/virdio/are_bss1.png",
                                    alt: "Split squat with a purple AR pad on the floor where the back foot should land",
                                    strong: "Affordance.",
                                    caption: "Purple marks where your body should go.",
                                },
                                {
                                    src: "/assets/virdio/are_bss2.png",
                                    alt: "The same split squat at the bottom of the rep, the AR pad now green to confirm it counted",
                                    strong: "Hit box.",
                                    caption: "Green confirms the rep counted.",
                                },
                            ]}
                        />
                    </Reveal>

                    <div className="w-full min-w-0 case-study-block-gap">
                        <SubHead>One class, two HUDs</SubHead>
                        <div className="case-study-prose-stack flex flex-col">
                            <P delay={0.05}>
                                To the team, cross-platform meant the same screen at different sizes. I pushed to design
                                the class HUD per device. Desktop uses the landscape canvas to show metrics, class info
                                and participants at once.
                            </P>
                            <P delay={0.1}>
                                Mobile took the most iterations, because every number I added took space from the
                                trainer. It became a dynamic HUD that collapses to the current exercise and core stats,
                                and expands only when asked.
                            </P>
                        </div>
                    </div>

                    <Reveal>
                        <div className="case-study-hero-bump-mb flex flex-col gap-4 md:gap-5">
                            <div className="overflow-hidden rounded-2xl border border-ink/[0.08] bg-paper-sunken">
                                <LightboxImage
                                    src="/assets/virdio/hero_ui.png"
                                    alt="Desktop AR HUD: split squat with metrics panel, timer, and AR floor track"
                                    className="h-auto w-full object-contain"
                                    draggable={false}
                                    hoverScale={1.02}
                                />
                            </div>
                            <p className="site-gallery-caption text-left text-ink-subtle">
                                The desktop class at its best: metrics, timer and the AR track visible at once.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal>
                        <div className="case-study-block-gap flex flex-col gap-4 md:gap-5">
                            <div className="grid grid-cols-1 items-center case-study-grid-gap md:grid-cols-[3fr_2fr]">
                                <div className="overflow-hidden rounded-2xl border border-ink/[0.08] bg-paper-sunken">
                                    <LightboxImage
                                        src="/assets/virdio/ar_class_live.png"
                                        alt="Desktop HUD: full toolbar, participant buttons, Show stream controls"
                                        className="h-auto w-full object-contain"
                                        draggable={false}
                                    />
                                </div>
                                <div className="overflow-hidden rounded-2xl border border-ink/[0.08] bg-paper-sunken">
                                    <LightboxImage
                                        src="/assets/virdio/mobile_ui.png"
                                        alt="Mobile HUD: condensed metrics, hamburger menu, maximized video"
                                        className="h-auto w-full object-contain"
                                        draggable={false}
                                    />
                                </div>
                            </div>
                            <p className="site-gallery-caption text-left text-ink-subtle">
                                Desktop shows everything at once. Mobile collapses to keep the trainer in view.
                            </p>
                        </div>
                    </Reveal>
                </div>

                <ARMosaic className="case-study-block-gap" />

                <div className={SITE_COLUMN}>
                    <div className="case-study-block-gap">
                        <VirdioBridge>
                            Each surface got its own HUD. The harder job was keeping six surfaces feeling like one
                            product.
                        </VirdioBridge>
                    </div>
                </div>
            </section>

            {/* ═══ 05 ONE SYSTEM, SIX SURFACES ═══ */}
            <section id="system" className="case-study-section-y-t border-t border-ink/[0.08]">
                <div className={SITE_COLUMN}>
                    <VirdioChapterHead
                        number="05"
                        eyebrow="One system, six surfaces"
                        title="Light to browse. Dark to work out."
                    />
                    <Prose>
                        <P>
                            I built the design system early, governing color, type, buttons and component behavior so
                            every platform felt like the same app.
                        </P>
                        <P delay={0.05}>
                            One rule did a lot of work. Browsing, booking and your schedule live in light mode.
                            Anything to do with attending a class is dark, so entering a class feels like stepping into
                            a different room, and the trainer and the purple AR read clearly against it.
                        </P>
                    </Prose>

                    <Reveal>
                        <div className="case-study-block-gap">
                            <div className="grid grid-cols-1 items-start case-study-grid-gap md:grid-cols-[3fr_1fr]">
                                <div className="rounded-2xl overflow-hidden border border-ink/[0.08] bg-ink/[0.025]">
                                    <LightboxImage
                                        src="/assets/virdio/live_classes_filter.png"
                                        alt="Desktop class browsing: sidebar category filters, day-grouped class list"
                                        className="w-full h-auto object-contain"
                                        draggable={false}
                                    />
                                </div>
                                <div className="rounded-2xl overflow-hidden border border-ink/[0.08] bg-ink/[0.025]">
                                    <LightboxImage
                                        src="/assets/virdio/mobile_live_classes.png"
                                        alt="Mobile class browsing: compact class cards with inline category chips"
                                        className="w-full h-auto object-contain"
                                        draggable={false}
                                    />
                                </div>
                            </div>
                            <p className="site-gallery-caption case-study-media-caption-mt text-left text-ink-subtle">
                                Desktop exposes filters for planning. Mobile turns categories into chips for quick
                                booking, the part of the product where the phone shines.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal>
                        <div className="mx-auto w-full min-w-0 case-study-block-gap">
                            <div className="rounded-2xl overflow-hidden border border-ink/[0.08] bg-ink/[0.025]">
                                <LightboxImage
                                    src="/assets/virdio/desktop_schedule.png"
                                    alt="My Schedule: calendar widget with booked classes and Join Session CTA"
                                    className="w-full h-auto object-contain"
                                    draggable={false}
                                />
                            </div>
                            <p className="site-gallery-caption case-study-caption-tight-mt text-left text-ink-subtle">
                                &ldquo;My Schedule&rdquo; connects browsing to action, with a prominent Join Session at
                                class time.
                            </p>
                        </div>
                    </Reveal>

                    <div className="w-full min-w-0 case-study-block-gap">
                        <SubHead>Specs that answered the question before it was asked</SubHead>
                        <div className="case-study-prose-stack flex flex-col">
                            <P delay={0.05}>
                                With engineering twelve hours ahead, a question asked at the end of my day was answered
                                by a guess at the start of theirs. Early on, edge cases I hadn&rsquo;t designed came back
                                built with improvised solutions.
                            </P>
                            <P delay={0.1}>
                                Static screens weren&rsquo;t enough for an interactive AR product, so I wrote out
                                interactions and motion with every branch drawn, failure paths included. I prototyped
                                the trickier concepts, which settled debates faster than words did.
                            </P>
                        </div>
                    </div>

                    <Reveal>
                        <div className="mx-auto flex w-full min-w-0 flex-col gap-4 md:gap-5">
                            <div className="overflow-hidden rounded-2xl border border-ink/[0.08] bg-[#1C1830]">
                                <LightboxImage
                                    src="/assets/virdio/skipping_setup_flow.png"
                                    alt="Flow spec for skipping setup: screens connected by arrows for each branch, including tilt correction prompts and a capturing state"
                                    className="block h-auto w-full object-contain"
                                    draggable={false}
                                    hoverScale={1.02}
                                />
                            </div>
                            <p className="site-gallery-caption text-left text-ink-subtle">
                                The spec for skipping setup, one of the branches that used to get improvised.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ═══ 06 WHAT HAPPENED ═══ */}
            <div className={SITE_COLUMN}>
                <section id="outcome" className="case-study-section-y border-t border-ink/[0.08]">
                    <VirdioChapterHead
                        number="06"
                        eyebrow="What happened"
                        title="It shipped everywhere. It didn’t take off."
                    />

                    <Reveal>
                        <div className="case-study-block-gap">
                            <VirdioCardRow
                                cards={[
                                    {
                                        kind: "Shipped",
                                        title: "Every platform, mid-2022",
                                        body: "Launch-ready designs and one shared system across six surfaces.",
                                        accent: true,
                                    },
                                    {
                                        kind: "Reception",
                                        title: "A few good reviews",
                                        body: "Consumer adoption stayed small as home fitness cooled after its pandemic peak.",
                                    },
                                    {
                                        kind: "Why, I think",
                                        title: "Too much, too wide",
                                        body: "Setup asked a lot, people wanted their phones, and trainers, classes and schedules crowded the core.",
                                    },
                                ]}
                            />
                        </div>
                    </Reveal>

                    <div className="w-full min-w-0 case-study-block-gap">
                        <SubHead>What I&rsquo;d do differently</SubHead>
                        <ol className="m-0 flex list-none flex-col p-0">
                            {[
                                {
                                    t: "Ship one great version first.",
                                    b: "A web app with a small set of classes and trainers, all quality, because the AR classes are what wow people.",
                                },
                                {
                                    t: "Argue harder for focus.",
                                    b: "I believed launching everywhere was costing us focus, and I said so, but too passively. Next time I’d bring a prototype and evidence.",
                                },
                                {
                                    t: "Design AR like a game.",
                                    b: "Physics, feedback and especially sound matter as much as visuals for someone mid-workout who isn’t looking at the screen.",
                                },
                            ].map((r, i) => (
                                <Reveal key={r.t} delay={i * 0.05}>
                                    <li className="flex gap-4 border-b border-ink/[0.08] py-4 site-body">
                                        <span className="site-label w-6 shrink-0 pt-[3px] text-ink-subtle">0{i + 1}</span>
                                        <span className="text-ink-muted">
                                            <span className="font-semibold text-ink">{r.t}</span> {r.b}
                                        </span>
                                    </li>
                                </Reveal>
                            ))}
                        </ol>
                    </div>

                    <div className="case-study-block-gap">
                        <Reveal>
                            <VirdioPrinciple
                                eyebrow="What I carried forward"
                                statement="Focus is a design decision."
                                note="At Domis, I designed a bulk intake feature I believe in, then argued to cut it from v1 because it sat on the onboarding critical path."
                            />
                        </Reveal>
                        <Reveal>
                            <p className="site-body mt-5 text-ink-muted">
                                <Link href="/domis" className="font-medium text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
                                    Read the Domis case study
                                </Link>
                            </p>
                        </Reveal>
                    </div>
                </section>
            </div>

            {/* ─── PUNCH BAG INTERACTIVE ─── */}
            <div className={cn("flex justify-center", SITE_COLUMN)}>
                <Reveal>
                    <PunchBag />
                </Reveal>
            </div>

            <div className="h-32 md:h-40" />
        </LightboxProvider>
    );
}
