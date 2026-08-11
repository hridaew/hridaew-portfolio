import { Fragment } from "react";
import Image from "next/image";
import { heroExpandedAssets } from "@/data/hero-expanded-assets";
import {
  playBiochipMalfunctionHeroGame,
  playGame3HeroCover,
  playHalfLife2HeroGameCover,
} from "@/lib/choomUiAudio";
import { AlbumArt } from "./AlbumArt";

const img = heroExpandedAssets;

function AboutSection() {
  return (
    <div className="flex w-full min-w-0 flex-col items-start gap-8 sm:flex-row">
      <div className="flex w-full max-w-[128px] shrink-0 flex-col items-start gap-2 sm:w-[128px]">
        <div className="relative size-[128px] shrink-0 rounded-lg shadow-e2">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
            <Image
              alt="Portrait at Valve Software"
              fill
              sizes="128px"
              className="object-cover object-top"
              src={img.aboutPrimary}
            />
          </div>
        </div>
        <p className="w-full min-w-0 font-[family-name:var(--font-geist-mono)] text-xs font-normal uppercase leading-[18px] text-ink-muted">
          This is me at valve software :D
        </p>
      </div>
      <div className="min-w-0 max-w-[432px] flex-1 font-[family-name:var(--font-geist)] text-base font-normal leading-6 text-ink-secondary whitespace-pre-wrap">
        <p className="mb-0 leading-6">
          {`Being the son of an engineer and an artist it would be easy to guess where my interests would lie, I'm an Interaction/Product/Experience/Everything Designer because I love making things that work and get a response out of people — whether it be from sensory stimuli or something as simple as getting a task done. `}
        </p>
        <p className="mb-0 leading-6">&nbsp;</p>
        <p className="leading-6">
          When I&apos;m not designing, I&apos;m painting, playing basketball,
          video games, or watching Arsenal FC.
        </p>
      </div>
    </div>
  );
}

function ExperienceSection() {
  return (
    <div className="flex w-full min-w-0 flex-col items-start justify-center gap-4">
      <div className="relative w-full shrink-0">
        <div className="flex size-full flex-row items-center justify-center">
          <div className="relative flex size-full items-center justify-center px-4">
            <p className="relative min-h-px min-w-px flex-[1_0_0] font-[family-name:var(--font-geist-mono)] text-xs font-normal uppercase leading-6 text-ink-muted">
              Experience
            </p>
          </div>
        </div>
      </div>
      <div className="relative flex w-full min-w-0 shrink-0 flex-col items-start gap-4 rounded-xl bg-ink/[0.02] py-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl border border-ink/[0.08]"
        />
        <ExpBlock
          title="Domis"
          date="2024 -"
          body="Founding Product Designer for an AI-Powered home maintenance app."
        />
        <ExpDivider />
        <ExpBlock
          title="Projects for MOHAI, Stanford, and others"
          date="2022 - 2023"
          body="Interactive exhibits, installations, and product design."
        />
        <ExpDivider />
        <ExpBlock
          title="Virdio"
          date="2021 - 2022"
          body="Built a cross-platform AR workout app."
        />
        <ExpDivider />
        <ExpBlock
          title="Maria Mortati Experience Design"
          date="2020 - 2021, 2023"
          body="Tangible multi-sensory experiences for people living with mid-to-late stage Dementia."
        />
      </div>
    </div>
  );
}

function ExpDivider() {
  return (
    <div className="relative h-0 w-full shrink-0">
      <div className="absolute inset-[-0.5px_0_0_0]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 432 0.5"
          aria-hidden
        >
          <line
            stroke="#1c1c1c"
            strokeOpacity={0.18}
            strokeWidth={0.5}
            style={{ mixBlendMode: "luminosity" }}
            x2="432"
            y1="0.25"
            y2="0.25"
          />
        </svg>
      </div>
    </div>
  );
}

function ExpBlock({
  title,
  date,
  body,
}: {
  title: string;
  date: string;
  body: string;
}) {
  return (
    <div className="relative flex w-full min-w-0 shrink-0 flex-col items-start gap-2">
      <div className="relative w-full shrink-0">
        <div className="flex size-full flex-row items-center justify-center">
          <div className="relative flex size-full items-center justify-center gap-2 px-4 leading-6">
            <p className="relative min-h-px min-w-px flex-[1_0_0] font-[family-name:var(--font-geist)] text-base font-semibold text-ink-secondary">
              {title}
            </p>
            <p className="relative shrink-0 whitespace-nowrap font-[family-name:var(--font-geist)] text-xs font-normal text-ink-muted">
              {date}
            </p>
          </div>
        </div>
      </div>
      <div className="relative w-full shrink-0">
        <div className="flex size-full flex-row items-center justify-center">
          <div className="relative flex size-full items-center justify-center px-4">
            <p className="relative min-h-px min-w-px flex-[1_0_0] font-[family-name:var(--font-geist)] text-base font-normal leading-6 text-ink-muted">
              {body}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EducationSection() {
  return (
    <div className="flex w-full min-w-0 flex-col items-start justify-center gap-4">
      <div className="relative w-full shrink-0">
        <div className="flex size-full flex-row items-center justify-center">
          <div className="relative flex size-full items-center justify-center px-4">
            <p className="relative min-h-px min-w-px flex-[1_0_0] font-[family-name:var(--font-geist-mono)] text-xs font-normal uppercase leading-6 text-ink-muted">
              Education
            </p>
          </div>
        </div>
      </div>
      <div className="relative flex w-full min-w-0 shrink-0 flex-col items-start gap-4 rounded-xl bg-ink/[0.02] py-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl border border-ink/[0.08]"
        />
        {(
          [
            {
              school: "University of Washington, Seattle",
              year: "2024",
              degree: "Master of Human Computer Interaction + Design",
            },
            {
              school: "California College of the Arts, San Francisco",
              year: "2020",
              degree: "BFA Interaction Design",
            },
          ] as const
        ).map((block, i) => (
          <Fragment key={block.school}>
            {i > 0 ? <ExpDivider /> : null}
            <div className="relative flex w-full min-w-0 shrink-0 flex-col items-start gap-2">
              <div className="relative w-full shrink-0">
                <div className="flex size-full flex-row items-center justify-center">
                  <div className="relative flex size-full items-center justify-center gap-2 px-4 leading-6">
                    <p className="relative min-h-px min-w-px flex-[1_0_0] font-[family-name:var(--font-geist)] text-base font-semibold text-ink-secondary">
                      {block.school}
                    </p>
                    <p className="relative shrink-0 whitespace-nowrap font-[family-name:var(--font-geist)] text-xs font-normal text-ink-muted">
                      {block.year}
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative w-full shrink-0">
                <div className="flex size-full flex-row items-center justify-center">
                  <div className="relative flex size-full items-center justify-center px-4">
                    <p className="relative min-h-px min-w-px flex-[1_0_0] font-[family-name:var(--font-geist)] text-base font-normal leading-6 text-ink-muted">
                      {block.degree}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function SideImages() {
  return (
    <div className="flex w-32 shrink-0 flex-col items-center justify-center gap-8 overflow-visible pt-[25px]">
      <TiltFrame rotation="-rotate-[4deg]">
        <div className="relative size-32 shrink-0 rounded-lg shadow-e2">
          <Image
            alt=""
            fill
            sizes="128px"
            className="pointer-events-none rounded-lg object-cover"
            src={img.tilt1}
          />
        </div>
      </TiltFrame>
      <TiltFrame rotation="rotate-[4deg]">
        <div className="relative size-32 shrink-0 rounded-2xl shadow-e2">
          <Image
            alt=""
            fill
            sizes="128px"
            className="pointer-events-none rounded-2xl object-cover"
            src={img.tilt2}
          />
        </div>
      </TiltFrame>
      <TiltFrame rotation="-rotate-[4deg]">
        <div className="relative size-32 shrink-0 rounded-2xl shadow-e2">
          <Image
            alt=""
            fill
            sizes="128px"
            className="pointer-events-none rounded-2xl object-cover"
            src={img.tilt3}
          />
        </div>
      </TiltFrame>
      <TiltFrame rotation="rotate-[4deg]">
        <div className="relative size-32 shrink-0 rounded-2xl">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            <Image
              alt=""
              width={256}
              height={168}
              sizes="128px"
              className="absolute left-[-20.63%] top-0 h-full max-w-none w-[153.8%]"
              src={img.tilt4}
            />
          </div>
        </div>
      </TiltFrame>
    </div>
  );
}

function TiltFrame({
  rotation,
  children,
}: {
  rotation: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex size-[136.617px] shrink-0 items-center justify-center overflow-visible">
      <div className={`flex-none ${rotation}`}>{children}</div>
    </div>
  );
}

function ExperienceEducationSection() {
  return (
    <div className="flex w-full min-w-0 flex-col items-start gap-8 lg:flex-row">
      <div className="relative flex min-h-px min-w-0 w-full flex-1 flex-col items-start justify-center gap-8 lg:min-w-0">
        <ExperienceSection />
        <EducationSection />
      </div>
      <div className="flex w-full justify-center lg:w-auto lg:shrink-0">
        <SideImages />
      </div>
    </div>
  );
}

function Top3Section() {
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col items-start justify-center gap-8">
      <div className="relative w-full shrink-0 font-[family-name:var(--font-geist)] text-base font-semibold leading-none text-ink-muted">
        <p className="leading-normal">Top 3:</p>
      </div>

      <div className="flex w-full min-w-0 flex-col items-start gap-4">
        <p className="relative w-full shrink-0 font-[family-name:var(--font-geist-mono)] text-xs font-normal uppercase leading-6 text-ink-muted">
          Games:
        </p>
        <div className="relative flex w-full min-w-0 flex-wrap content-start items-start gap-2">
          <div
            role="button"
            tabIndex={0}
            aria-label="Cyberpunk 2077 cover"
            className="relative h-[220px] w-[157px] shrink-0 cursor-pointer rounded-[5px] shadow-e3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/[0.36]"
            onClick={() => playBiochipMalfunctionHeroGame()}
            onKeyDown={(e) => {
              if (e.key !== "Enter" && e.key !== " ") return;
              e.preventDefault();
              playBiochipMalfunctionHeroGame();
            }}
          >
            <Image
              alt=""
              fill
              sizes="160px"
              className="pointer-events-none rounded-[5px] object-cover"
              src={img.game1}
            />
          </div>
          <div
            role="button"
            tabIndex={0}
            aria-label="Half-Life 2 cover"
            className="relative h-[220px] w-[159px] shrink-0 cursor-pointer rounded-[5px] shadow-e3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/[0.36]"
            onClick={() => playHalfLife2HeroGameCover()}
            onKeyDown={(e) => {
              if (e.key !== "Enter" && e.key !== " ") return;
              e.preventDefault();
              playHalfLife2HeroGameCover();
            }}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[5px]">
              <Image
                alt=""
                width={320}
                height={440}
                sizes="160px"
                className="absolute left-[0.73%] top-[-1.93%] h-[102.65%] max-w-none w-[100.01%]"
                src={img.game2}
              />
            </div>
          </div>
          <div
            role="button"
            tabIndex={0}
            aria-label="Third game cover"
            className="relative h-[219.302px] w-[156px] shrink-0 cursor-pointer rounded-[5px] shadow-e3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/[0.36]"
            onClick={() => playGame3HeroCover()}
            onKeyDown={(e) => {
              if (e.key !== "Enter" && e.key !== " ") return;
              e.preventDefault();
              playGame3HeroCover();
            }}
          >
            <Image
              alt=""
              fill
              sizes="160px"
              className="pointer-events-none rounded-[5px] object-cover"
              src={img.game3}
            />
          </div>
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-col items-start gap-4">
        <p className="relative w-full shrink-0 font-[family-name:var(--font-geist-mono)] text-xs font-normal uppercase leading-6 text-ink-muted">
          Albums:
        </p>
        <div className="relative flex w-full min-w-0 flex-wrap content-start items-start gap-2 overflow-visible">
          {(
            [
              {
                title: "Kid Cudi: Man on the Moon II",
                frontSrc: img.album1,
                backSrc: img.album1Back,
                id: "album-motm",
              },
              {
                title: "Clipse: Let God Sort Em Out",
                frontSrc: img.album2,
                backSrc: img.album2Back,
                id: "album-clipse",
              },
              {
                title: "Linkin Park: Reanimation",
                frontSrc: img.album3,
                backSrc: img.album3Back,
                id: "album-reanimation",
              },
            ] as const
          ).map((album) => (
            <AlbumArt
              key={album.id}
              title={album.title}
              frontSrc={album.frontSrc}
              backSrc={album.backSrc}
              layoutIdBase={album.id}
            />
          ))}
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-col items-start gap-4">
        <p className="relative w-full shrink-0 font-[family-name:var(--font-geist-mono)] text-xs font-normal uppercase leading-6 text-ink-muted">
          moves:
        </p>
        <div className="relative mb-8 flex h-[278px] w-full min-w-0 flex-wrap items-start gap-2">
          <div className="relative h-full min-h-px min-w-px flex-[1_0_0] rounded-[2px] shadow-e3">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2px]">
              <Image
                alt=""
                width={640}
                height={560}
                sizes="(max-width: 768px) 30vw, 220px"
                className="absolute left-[-1.66%] top-[-0.98%] h-[101.71%] max-w-none w-[103.88%]"
                src={img.move1}
              />
            </div>
          </div>
          <div className="relative h-full min-h-px min-w-px flex-[1_0_0] rounded-[2px] shadow-e3">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2px]">
              <Image
                alt=""
                width={640}
                height={560}
                sizes="(max-width: 768px) 30vw, 220px"
                className="absolute left-[-0.95%] top-[-0.34%] h-[100.73%] max-w-none w-[101.59%]"
                src={img.move2}
              />
            </div>
          </div>
          <div className="relative h-full min-h-px min-w-px flex-[1_0_0] rounded-[2px] shadow-e3">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2px]">
              <Image
                alt=""
                width={640}
                height={560}
                sizes="(max-width: 768px) 30vw, 220px"
                className="absolute left-[-1.53%] top-[-0.79%] h-[101.49%] max-w-none w-[102.7%]"
                src={img.move3}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Scrollable expanded column: divider + sections (reference `ExpandedContent` minus outer motion). */
export function HeroCardExpandedBody() {
  return (
    <div className="relative w-full min-w-0">
      <div className="sticky top-0 z-10 h-px w-full bg-ink/[0.075]" aria-hidden />
      <div className="flex w-full min-w-0 flex-col items-start gap-10 pt-8">
        <div className="flex w-full min-w-0 flex-col items-start gap-8">
          <AboutSection />
        </div>
        <ExperienceEducationSection />
        <Top3Section />
      </div>
    </div>
  );
}
