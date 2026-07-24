"use client";

import "./domis-case-study.css";
import { Reveal } from "@/components/Reveal";
import { DomisMoreCards } from "@/components/domis/DomisMoreCards";
import { DomisKnownCarousel } from "@/components/domis/DomisKnownCarousel";
import { DomisConstraintDiagram } from "@/components/domis/DomisConstraintDiagram";
import { DomisValueMultiply } from "@/components/domis/DomisValueMultiply";
import { DomisHomeKnowledgeJourney } from "@/components/domis/DomisHomeKnowledgeJourney";
import { DomisAddressUserFlow } from "@/components/domis/DomisAddressUserFlow";
import { DomisApplianceTaskFlow } from "@/components/domis/DomisApplianceTaskFlow";
import { DomisReportAffinity } from "@/components/domis/DomisReportAffinity";
import { DomisAddressFeatureCard } from "@/components/domis/DomisAddressFeatureCard";
import { DomisApplianceFeatureCard } from "@/components/domis/DomisApplianceFeatureCard";
import { DomisHomeFeatureCard } from "@/components/domis/DomisHomeFeatureCard";
import "@/components/domis/domis-ux-diagrams.css";
import {
  ApplianceCaptureDemo,
  ApplianceV1V2Compare,
  ConsensusRunsPanel,
  DomisLiveFonts,
  HeroProductShot,
  HomeAvatarConversion,
  InspectionToTasksDemo,
  PropertyGridDemo,
  WebCreateHomeDemo,
} from "@/components/domis/live";
import { SITE_COLUMN } from "@/components/home/homeGrid";

export function DomisCaseStudyBody() {
  return (
    <DomisLiveFonts className={`domis-cs ${SITE_COLUMN} pb-16 md:pb-24`}>
      {/* Intro — top padding mirrors hero pb-16/md:pb-24 for even spacing around the divider */}
      <section id="overview" className="dcs-col dcs-block pt-16 md:pt-24">
        <Reveal>
          <div className="dcs-overview-stack">
            <div>
              <p className="dcs-heading site-subheading text-white">
                What is Domis
              </p>
              <figure className="dcs-img-block">
                <div className="dcs-media dcs-media-hero-shot">
                  <HeroProductShot />
                </div>
              </figure>
              <div className="site-body text-white/65">
                <p>
                  Domis helps homeowners keep track of their homes. What needs
                  fixing, what&rsquo;s about to break, and what that appliance
                  in the garage actually is.
                </p>
                <p>
                  Most services in this category try to take home care out of
                  the owner&rsquo;s hands. Domis does the opposite. It sits
                  between the owner and the house as a compatibility layer,
                  helping them track it, understand it, and prevent the failures
                  that get expensive.
                </p>
              </div>
            </div>

            <div>
              <p className="dcs-heading site-subheading text-white">
                My role
              </p>
              <p className="site-body text-white/65">
                I joined as the Founding Product Designer and work on 0→1
                design across mobile and web.
              </p>
            </div>

            <div id="role">
              <p className="dcs-heading site-subheading text-white">
                My responsibilities
              </p>
              <ul className="dcs-roles">
                <li className="dcs-role-card">
                  <span className="dcs-role-icon dcs-role-icon-layers" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path
                        className="dcs-role-layer dcs-role-layer-1"
                        d="M14 3.5 L24.5 9 L14 14.5 L3.5 9 Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <path
                        className="dcs-role-layer dcs-role-layer-2"
                        d="M3.5 14 L14 19.5 L24.5 14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <path
                        className="dcs-role-layer dcs-role-layer-3"
                        d="M3.5 18.5 L14 24 L24.5 18.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="site-body text-white/65">
                    Own product design end to end, along with the design system it
                    ships on.
                  </span>
                </li>
                <li className="dcs-role-card">
                  <span className="dcs-role-icon dcs-role-icon-phases" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path
                        className="dcs-role-axis"
                        d="M4 24 V4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <rect
                        className="dcs-role-bar dcs-role-bar-1"
                        x="8"
                        y="5"
                        width="7"
                        height="5.5"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <rect
                        className="dcs-role-bar dcs-role-bar-2"
                        x="14"
                        y="15.5"
                        width="10"
                        height="5.5"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        className="dcs-role-tick dcs-role-tick-1"
                        d="M15 7.75 H24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        className="dcs-role-tick dcs-role-tick-2"
                        d="M4 18.25 H14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span className="site-body text-white/65">
                    Define the phases of design and development, and what gets built
                    when.
                  </span>
                </li>
                <li className="dcs-role-card">
                  <span className="dcs-role-icon dcs-role-icon-collab" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <circle
                        className="dcs-role-node dcs-role-node-1"
                        cx="14"
                        cy="6"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <circle
                        className="dcs-role-node dcs-role-node-2"
                        cx="6"
                        cy="21"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <circle
                        className="dcs-role-node dcs-role-node-3"
                        cx="22"
                        cy="21"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        className="dcs-role-link dcs-role-link-1"
                        d="M11.8 8.4 L7.8 18.2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        className="dcs-role-link dcs-role-link-2"
                        d="M16.2 8.4 L20.2 18.2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        className="dcs-role-link dcs-role-link-3"
                        d="M9 21 H19"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span className="site-body text-white/65">
                    Work directly with leadership and engineering on how the product
                    takes shape.
                  </span>
                </li>
                <li className="dcs-role-card">
                  <span className="dcs-role-icon dcs-role-icon-spark" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path
                        className="dcs-role-spark dcs-role-spark-1"
                        d="M10.5 3.5 L12.4 9 L17.5 10.9 L12.4 12.8 L10.5 18.3 L8.6 12.8 L3.5 10.9 L8.6 9 Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <path
                        className="dcs-role-spark dcs-role-spark-2"
                        d="M20.5 15 L21.7 18.2 L25 19.4 L21.7 20.6 L20.5 23.8 L19.3 20.6 L16 19.4 L19.3 18.2 Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="site-body text-white/65">
                    Define how Domis uses AI, and design and prototype those
                    implementations myself.
                  </span>
                </li>
              </ul>
            </div>

          </div>
        </Reveal>
      </section>

      <hr className="dcs-rule" />

      <section id="user-problem" className="dcs-col dcs-block">
        <Reveal>
          <p className="dcs-heading site-subheading text-white">
            User problem
          </p>
          <div className="site-body text-white/65">
            <p>
              Before designing features, I needed to understand how homeowners
              actually hold knowledge about their houses, and where that
              knowledge breaks down. Domis has to meet people in that messy
              middle, not ask them to become facility managers overnight.
            </p>
          </div>
          <figure className="dcs-ux-figure dcs-ux-figure-wide dcs-ux-zoomable">
            <DomisHomeKnowledgeJourney />
            <figcaption className="dcs-caption site-body">
              First-timers drown in closing docs; mid-journey owners (most Domis
              users) keep reconstructing the house under stress.
            </figcaption>
          </figure>
        </Reveal>
      </section>

      <hr className="dcs-rule" />

      <section id="challenge" className="dcs-col dcs-block">
        <Reveal>
          <p className="dcs-heading site-subheading text-white">
            Key challenge
          </p>
          <div className="site-body text-white/65">
            <p>
              Domis only works if it knows your home, but listing every space,
              appliance, and nuance by hand is painful.
            </p>
            <p>
              When people tried to set up a home profile, many realized they
              didn&rsquo;t know their own homes. Setting up Domis also became
              the act of learning it.
            </p>
          </div>
          <figure className="dcs-ux-figure">
            <DomisConstraintDiagram />
          </figure>
          <div className="site-body text-white/65">
            <p>
              So to make setup feel as rewarding and informative as possible, I
              designed Domis around one principle:
            </p>
            <p className="mt-3 font-medium text-white">
              Extract the maximum value from the smallest action the user is
              willing to take.
            </p>
          </div>
          <figure className="dcs-ux-figure">
            <div className="dud dud-board dvm-board">
              <DomisValueMultiply />
            </div>
          </figure>
        </Reveal>
      </section>

      {/* Payoff — the home, known — before ingestion mechanics */}
      <hr className="dcs-rule" />

      <section id="known" className="dcs-col dcs-block">
        <Reveal>
          <p className="dcs-heading site-subheading text-white">
            The home, known
          </p>
          <figure className="dcs-img-block dcs-known-breakout">
              <DomisKnownCarousel />
          </figure>
          <div className="site-body text-white/65">
            <p>
              This is what an owner who understands their house looks like in
              software. A filled property. Tasks tracked with tagged appliances.
              Tasks pulled from the report.
            </p>
          </div>
        </Reveal>
      </section>


      {/* Address Intelligence */}
      <hr className="dcs-rule" />

      <section id="address" className="dcs-col dcs-block">
        <Reveal>
          <p className="dcs-heading site-subheading text-white">
            Address Intelligence
          </p>
          <figure className="dcs-img-block">
              <DomisAddressFeatureCard />
          </figure>
          <div className="site-body text-white/65">
            <p>
              <strong className="text-white">
                The first thing anyone does in Domis is type their address.
              </strong>{" "}
              That is the entire ask, and it is roughly the maximum a new user
              will tolerate before deciding whether this is worth their time.
            </p>
            <p>
              So I designed an address intelligence feature that maximizes the
              value of a user provided home address. Type it once, and Domis
              researches the house, then puts what it finds into the same form
              the owner would have filled by hand.
            </p>
          </div>
          <figure className="dcs-ux-figure dcs-ux-figure-wide">
            <DomisAddressUserFlow />
          </figure>
        </Reveal>
      </section>

      <section className="dcs-col dcs-block">
        <Reveal>
          <p className="dcs-heading site-subheading text-white">
            The challenge
          </p>
          <div className="site-body text-white/65">
            <p>
              <strong className="text-white">
                The hard part is not finding data. It is deciding what the owner
                should see when search is unsure.
              </strong>{" "}
              The same address can return different facts on different runs.
            </p>
            <p>
              Rather than forcing a confident answer, Domis does 3 searches,
              cross references them, and only shows what sources agree on,
              leaves blanks when they do not, and never locks the owner out of
              a field.
            </p>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <figure className="dcs-ux-figure">
          <div className="dud dud-board crp-board">
            <ConsensusRunsPanel />
          </div>
          <figcaption className="dcs-caption site-body">
            Three searches, then a review agent checks. Two matches are enough
            to show. No agreement leaves the field blank for you to review.
          </figcaption>
        </figure>
      </Reveal>

      <Reveal>
        <figure className="dcs-figure">
          <div className="dcs-media">
              <WebCreateHomeDemo />
          </div>
          <figcaption className="dcs-caption site-body">
            Type an address. Domis fills in what it can.
          </figcaption>
        </figure>
      </Reveal>

      <section className="dcs-col dcs-block">
        <Reveal>
          <p className="site-body text-white/65">
            Address Intelligence also pulls photos of the property and generates
            a clean icon for it. Small thing, but a recognizable avatar matters
            when someone manages more than one property, and it is replaceable
            if they would rather use their own.
          </p>
        </Reveal>
      </section>

      <Reveal>
        <figure className="dcs-figure">
          <div className="dcs-media">
              <HomeAvatarConversion />
          </div>
          <figcaption className="dcs-caption site-body">
            Street view in. A clean home icon out.
          </figcaption>
        </figure>
      </Reveal>

      <Reveal>
        <figure className="dcs-figure">
          <div className="dcs-media">
              <PropertyGridDemo />
          </div>
          <figcaption className="dcs-caption site-body">
            Recognizable at a glance.
          </figcaption>
        </figure>
      </Reveal>


      {/* Appliance Intelligence */}
      <hr className="dcs-rule" />

      <section id="appliance" className="dcs-col dcs-block">
        <Reveal>
          <p className="dcs-heading site-subheading text-white">
            Appliance Intelligence
          </p>
          <figure className="dcs-img-block">
              <DomisApplianceFeatureCard />
          </figure>
          <div className="site-body text-white/65">
            <p>
              Logging your appliances is one of the first useful things to do in
              Domis, since it lets them be tagged in tasks and in conversations
              with Pros.
            </p>
            <p>
              Walking around photographing them turns out to be mildly
              satisfying. Typing in the model number and other minute details
              does not.
            </p>
            <p>
              The model number was not the user goal. It was a key to the
              things owners actually need later: manuals, warranty, support,
              parts, and common failures.
            </p>
            <p>
              <strong className="text-white">
                I asked my Google Gemini app about appliance labels to see what
                it could give me.
              </strong>
            </p>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <figure className="dcs-figure">
          <div className="dcs-media dcs-media-image">
            <div className="dcs-gemini-shot">
              <img
                src="/assets/domis/live/gemini-appliance-label.jpg"
                alt="Gemini chat extracting manufacturer, model, and serial from an appliance label photo"
                width={1024}
                height={865}
                draggable={false}
              />
            </div>
          </div>
        </figure>
      </Reveal>

      <section className="dcs-col dcs-block">
        <Reveal>
          <div className="site-body text-white/65">
            <p>
              With the Gemini test as proof of concept, I moved on to designing
              the feature.
            </p>
          </div>
          <figure className="dcs-ux-figure dcs-ux-figure-wide">
            <DomisApplianceTaskFlow />
          </figure>
        </Reveal>
      </section>

      <Reveal>
        <figure className="dcs-figure">
          <div className="dcs-media dcs-media-fit">
              <ApplianceCaptureDemo />
          </div>
          <figcaption className="dcs-caption site-body">
            One photo, and the form fills itself in.
          </figcaption>
        </figure>
      </Reveal>

      <section className="dcs-col dcs-block">
        <Reveal>
          <div className="site-body text-white/65">
            <p>
              V1 stopped at reading the plate. For v2 I pushed the same scan
              further: support pages, warranty links, the things an owner
              actually needs when something breaks.
            </p>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <figure className="dcs-ux-figure">
          <div className="dud dud-board avc-board">
            <ApplianceV1V2Compare />
          </div>
          <figcaption className="dcs-caption site-body">
            Same scan. One version knows the model number, the other knows what
            to do with it.
          </figcaption>
        </figure>
      </Reveal>

      {/* Report Processor */}
      <hr className="dcs-rule" />

      <section id="report" className="dcs-col dcs-block">
        <Reveal>
          <p className="dcs-heading site-subheading text-white">
            Report Processor
          </p>
          <figure className="dcs-img-block">
              <DomisHomeFeatureCard />
          </figure>
          <div className="site-body text-white/65">
            <p>
              Before any of the above, I went looking for what a homeowner
              already has.
            </p>
            <p>
              Every homeowner has an inspection report. It is also long,
              repetitive, and almost entirely unread.
            </p>
            <p>
              However, no one cares about the inspection report. Our interviews
              explained why.{" "}
              <strong className="text-white">
                People had been in their homes long enough that the report no
                longer described the house they were living in.
              </strong>
            </p>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <figure className="dcs-ux-figure">
          <DomisReportAffinity />
        </figure>
      </Reveal>

      <section className="dcs-col dcs-block">
        <Reveal>
          <div className="site-body text-white/65">
            <p>
              That changed what the feature should be.{" "}
              <strong className="text-white">
                Not a diagnostic that generates a to-do list, which would be
                wrong on arrival, but a way to understand the house.
              </strong>
            </p>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <figure className="dcs-figure">
          <div className="dcs-media">
              <InspectionToTasksDemo />
          </div>
          <figcaption className="dcs-caption site-body">
            From 64 pages of construction and real estate lingo to things you
            can actually comprehend.
          </figcaption>
        </figure>
      </Reveal>


      {/* Insights */}
      <hr className="dcs-rule" />

      <section id="insights" className="dcs-col dcs-block">
        <Reveal>
          <p className="dcs-heading site-subheading text-white">
            Insights
          </p>
          <div className="site-body text-white/65">
            <p>
              <strong className="text-white">Systems.</strong> AI output and
              human input share the same editable forms. Mobile and web sit on
              one design system I own. Different ingestion paths share one
              contract: fill what you can, never lock the owner out.
            </p>
            <p>
              <strong className="text-white">Trust.</strong> AI is wrong
              sometimes.               We show disagreement instead of a confident wrong
              answer, and treat the report as understanding, not an automatic
              chore list.
            </p>
            <p>
              <strong className="text-white">Collaboration.</strong> As founding
              PD I set phases with leadership and eng: what ships when, and what
              the AI is allowed to claim. I define and prototype the AI
              surfaces; engineering owns the pipeline under that contract.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Closing */}
      <hr className="dcs-rule" />

      <section id="more" className="dcs-col dcs-block">
        <Reveal>
          <p className="dcs-heading site-subheading text-white">
            And more!
          </p>
          <div className="site-body text-white/65">
            <p>
              Domis is recently launched and rapidly updating.
            </p>
            <p>
              The lens has not changed.{" "}
              <strong className="text-white">
                Find the smallest thing the user is willing to do, and return as
                much as possible for it.
              </strong>
            </p>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <DomisMoreCards />
      </Reveal>
    </DomisLiveFonts>
  );
}
