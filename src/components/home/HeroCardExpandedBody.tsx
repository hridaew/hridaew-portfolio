import { heroExpandedAssets } from "@/data/hero-expanded-assets";

const img = heroExpandedAssets;

function AboutSection() {
  return (
    <div className="flex w-full min-w-0 flex-col items-start gap-8 sm:flex-row">
      <div className="flex w-full max-w-[128px] shrink-0 flex-col items-start gap-2 sm:w-[128px]">
        <div className="relative size-[128px] shrink-0 rounded-lg shadow-[0px_4px_16px_0px_rgba(0,0,0,0.3)]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
            <img
              loading="lazy"
              alt=""
              className="absolute left-[-22.31%] top-[-9.68%] h-[146.55%] max-w-none w-[144.63%]"
              src={img.aboutPrimary}
            />
          </div>
        </div>
        <p className="w-full min-w-0 font-[family-name:var(--font-geist-mono)] text-xs font-normal uppercase leading-[18px] text-white/50">
          This is me at valve software :D
        </p>
      </div>
      <div className="min-w-0 max-w-[432px] flex-1 font-[family-name:var(--font-geist)] text-base font-normal leading-6 text-white/80 whitespace-pre-wrap">
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
            <p className="relative min-h-px min-w-px flex-[1_0_0] font-[family-name:var(--font-geist-mono)] text-xs font-normal uppercase leading-6 text-white/50">
              Experience
            </p>
          </div>
        </div>
      </div>
      <div className="relative flex w-full min-w-0 shrink-0 flex-col items-start gap-4 rounded-xl bg-white/[0.02] py-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl border border-white/10"
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
            stroke="white"
            strokeOpacity={0.1}
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
            <p className="relative min-h-px min-w-px flex-[1_0_0] font-[family-name:var(--font-geist)] text-base font-semibold text-white/80">
              {title}
            </p>
            <p className="relative shrink-0 whitespace-nowrap font-[family-name:var(--font-geist)] text-xs font-normal text-white/60">
              {date}
            </p>
          </div>
        </div>
      </div>
      <div className="relative w-full shrink-0">
        <div className="flex size-full flex-row items-center justify-center">
          <div className="relative flex size-full items-center justify-center px-4">
            <p className="relative min-h-px min-w-px flex-[1_0_0] font-[family-name:var(--font-geist)] text-base font-normal leading-6 text-white/60">
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
            <p className="relative min-h-px min-w-px flex-[1_0_0] font-[family-name:var(--font-geist-mono)] text-xs font-normal uppercase leading-6 text-white/50">
              Education
            </p>
          </div>
        </div>
      </div>
      <div className="relative flex w-full min-w-0 shrink-0 flex-col items-start gap-4 rounded-xl bg-white/[0.02] py-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl border border-white/10"
        />
        <div className="relative flex w-full min-w-0 shrink-0 flex-col items-start gap-2">
          <div className="relative w-full shrink-0">
            <div className="flex size-full flex-row items-center justify-center">
              <div className="relative flex size-full items-center justify-center gap-2 px-4 leading-6">
                <p className="relative min-h-px min-w-px flex-[1_0_0] font-[family-name:var(--font-geist)] text-base font-semibold text-white/80">
                  University of Washington, Seattle
                </p>
                <p className="relative shrink-0 whitespace-nowrap font-[family-name:var(--font-geist)] text-xs font-normal text-white/60">
                  2024
                </p>
              </div>
            </div>
          </div>
          <div className="relative w-full shrink-0">
            <div className="flex size-full flex-row items-center justify-center">
              <div className="relative flex size-full items-center justify-center px-4">
                <p className="relative min-h-px min-w-px flex-[1_0_0] font-[family-name:var(--font-geist)] text-base font-normal leading-6 text-white/60">
                  Master of Human Computer Interaction + Design
                </p>
              </div>
            </div>
          </div>
        </div>
        <ExpDivider />
        <div className="relative flex w-full min-w-0 shrink-0 flex-col items-start gap-2">
          <div className="relative w-full shrink-0">
            <div className="flex size-full flex-row items-center justify-center">
              <div className="relative flex size-full items-center justify-center gap-2 px-4 leading-6">
                <p className="relative min-h-px min-w-px flex-[1_0_0] font-[family-name:var(--font-geist)] text-base font-semibold text-white/80">
                  California College of the Arts, San Francisco
                </p>
                <p className="relative shrink-0 whitespace-nowrap font-[family-name:var(--font-geist)] text-xs font-normal text-white/60">
                  2020
                </p>
              </div>
            </div>
          </div>
          <div className="relative w-full shrink-0">
            <div className="flex size-full flex-row items-center justify-center">
              <div className="relative flex size-full items-center justify-center px-4">
                <p className="relative min-h-px min-w-px flex-[1_0_0] font-[family-name:var(--font-geist)] text-base font-normal leading-6 text-white/60">
                  BFA Interaction Design
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SideImages() {
  return (
    <div className="flex w-32 shrink-0 flex-col items-center justify-center gap-8 pt-[25px]">
      <TiltFrame rotation="-rotate-[4deg]">
        <div className="relative size-32 shrink-0 rounded-lg shadow-[0px_4px_16px_0px_rgba(0,0,0,0.3)]">
          <img
            loading="lazy"
            alt=""
            className="pointer-events-none absolute inset-0 size-full max-w-none rounded-lg object-cover"
            src={img.tilt1}
          />
        </div>
      </TiltFrame>
      <TiltFrame rotation="rotate-[4deg]">
        <div className="relative size-32 shrink-0 rounded-2xl shadow-[0px_0px_16px_0px_rgba(0,0,0,0.15)]">
          <img
            loading="lazy"
            alt=""
            className="pointer-events-none absolute inset-0 size-full max-w-none rounded-2xl object-cover"
            src={img.tilt2}
          />
        </div>
      </TiltFrame>
      <TiltFrame rotation="-rotate-[4deg]">
        <div className="relative size-32 shrink-0 rounded-2xl shadow-[0px_0px_16px_0px_rgba(0,0,0,0.15)]">
          <img
            loading="lazy"
            alt=""
            className="pointer-events-none absolute inset-0 size-full max-w-none rounded-2xl object-cover"
            src={img.tilt3}
          />
        </div>
      </TiltFrame>
      <TiltFrame rotation="rotate-[4deg]">
        <div className="relative size-32 shrink-0 rounded-2xl">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            <img
              loading="lazy"
              alt=""
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
    <div className="relative flex size-[136.617px] shrink-0 items-center justify-center">
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
      <div className="relative w-full shrink-0 font-[family-name:var(--font-geist)] text-base font-semibold leading-none text-white/60">
        <p className="leading-normal">Top 3:</p>
      </div>

      <div className="flex w-full min-w-0 flex-col items-start gap-4">
        <p className="relative w-full shrink-0 font-[family-name:var(--font-geist-mono)] text-xs font-normal uppercase leading-6 text-white/50">
          Games:
        </p>
        <div className="relative flex w-full min-w-0 flex-wrap content-start items-start gap-2">
          <div className="relative h-[220px] w-[157px] shrink-0 rounded-[5px] shadow-[0px_8px_16px_0px_rgba(0,0,0,0.3)]">
            <img
              loading="lazy"
              alt=""
              className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[5px] object-cover"
              src={img.game1}
            />
          </div>
          <div className="relative h-[220px] w-[159px] shrink-0 rounded-[5px] shadow-[0px_8px_16px_0px_rgba(0,0,0,0.3)]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[5px]">
              <img
                loading="lazy"
                alt=""
                className="absolute left-[0.73%] top-[-1.93%] h-[102.65%] max-w-none w-[100.01%]"
                src={img.game2}
              />
            </div>
          </div>
          <div className="relative h-[219.302px] w-[156px] shrink-0 rounded-[5px] shadow-[0px_8px_16px_0px_rgba(0,0,0,0.3)]">
            <img
              loading="lazy"
              alt=""
              className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[5px] object-cover"
              src={img.game3}
            />
          </div>
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-col items-start gap-4">
        <p className="relative w-full shrink-0 font-[family-name:var(--font-geist-mono)] text-xs font-normal uppercase leading-6 text-white/50">
          Albums:
        </p>
        <div className="relative flex w-full min-w-0 flex-wrap content-start items-start gap-2 overflow-visible">
          {(
            [
              {
                title: "Kid Cudi: Man on the Moon II",
                src: img.album1,
              },
              {
                title: "Clipse: Let God Sort Em Out",
                src: img.album2,
              },
              {
                title: "Linkin Park: Reanimation",
                src: img.album3,
              },
            ] as const
          ).map((album) => (
            <div
              key={album.title}
              className="group relative size-[178px] shrink-0 overflow-visible rounded-[2px] shadow-[0px_8px_16px_0px_rgba(0,0,0,0.3)]"
              title={album.title}
            >
              <span
                className="pointer-events-none absolute bottom-full left-1/2 z-[1] mb-1 max-w-[min(280px,calc(100vw-32px))] -translate-x-1/2 text-center font-[family-name:var(--font-geist-mono)] text-[10px] font-normal uppercase leading-tight tracking-wide text-white/75 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                aria-hidden
              >
                {album.title}
              </span>
              <img
                loading="lazy"
                alt={album.title}
                draggable={false}
                className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[2px] object-cover"
                src={album.src}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-col items-start gap-4">
        <p className="relative w-full shrink-0 font-[family-name:var(--font-geist-mono)] text-xs font-normal uppercase leading-6 text-white/50">
          moves:
        </p>
        <div className="relative mb-8 flex h-[278px] w-full min-w-0 flex-wrap items-start gap-2">
          <div className="relative h-full min-h-px min-w-px flex-[1_0_0] rounded-[2px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.3)]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2px]">
              <img
                loading="lazy"
                alt=""
                className="absolute left-[-1.66%] top-[-0.98%] h-[101.71%] max-w-none w-[103.88%]"
                src={img.move1}
              />
            </div>
          </div>
          <div className="relative h-full min-h-px min-w-px flex-[1_0_0] rounded-[2px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.3)]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2px]">
              <img
                loading="lazy"
                alt=""
                className="absolute left-[-0.95%] top-[-0.34%] h-[100.73%] max-w-none w-[101.59%]"
                src={img.move2}
              />
            </div>
          </div>
          <div className="relative h-full min-h-px min-w-px flex-[1_0_0] rounded-[2px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.3)]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2px]">
              <img
                loading="lazy"
                alt=""
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
      <div className="sticky top-0 z-10 h-px w-full bg-white/15" aria-hidden />
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
