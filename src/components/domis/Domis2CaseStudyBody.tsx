"use client";

import "./domis-case-study.css";
import { Reveal } from "@/components/Reveal";
import { DomisKnownCarousel } from "@/components/domis/DomisKnownCarousel";
import { DomisAddressFeatureCard } from "@/components/domis/DomisAddressFeatureCard";
import { DomisApplianceFeatureCard } from "@/components/domis/DomisApplianceFeatureCard";
import { DomisHomeFeatureCard } from "@/components/domis/DomisHomeFeatureCard";
import {
  ApplianceCaptureDemo,
  ApplianceV1V2Compare,
  ConsensusRunsPanel,
  DomisLiveFonts,
  HomeAvatarConversion,
  InspectionToTasksDemo,
  PropertyGridDemo,
  WebCreateHomeDemo,
} from "@/components/domis/live";
import { SITE_COLUMN } from "@/components/home/homeGrid";

/**
 * Domis case study v2 — Airbnb-review rewrite for preview at /domis2.
 * Arc: unknown home → principle → ingestions as evidence → systems/trust →
 * tradeoff → ship / learnings. No “And more!” ending.
 */
export function Domis2CaseStudyBody() {
  return (
    <DomisLiveFonts className={`domis-cs ${SITE_COLUMN} pb-16 md:pb-24`}>
      {/* 01 Problem */}
      <section id="problem" className="dcs-col dcs-block pt-16 md:pt-24">
        <Reveal>
          <p className="dcs-heading site-subheading text-white">
            The problem
          </p>
          <div className="site-body text-white/65">
            <p>
              Domis only works if it knows your home. Listing every space,
              appliance, and nuance by hand is painful — and when people tried,
              many realized they didn&rsquo;t know their own houses.
            </p>
            <p>
              Setting up Domis became the act of learning the home. That is the
              product problem:{" "}
              <strong className="text-white">
                make understanding the house feel worth the first tap.
              </strong>
            </p>
          </div>
          <figure className="dcs-img-block mt-8">
            <div className="dcs-media dcs-media-fit">
              <div className="dcs-affinity">
                <div className="dcs-cluster">
                  <span className="dcs-ch">Doesn&rsquo;t know the home</span>
                  <div className="dcs-note">
                    &ldquo;I couldn&rsquo;t tell you what brand the furnace
                    is.&rdquo;
                  </div>
                  <div className="dcs-note">
                    &ldquo;When was the roof done? No idea. Before us.&rdquo;
                  </div>
                  <div className="dcs-note dcs-fact">
                    Affinity interviews — homeowners 4–11 yrs in place
                  </div>
                </div>
                <div className="dcs-cluster">
                  <span className="dcs-ch">Report is unused</span>
                  <div className="dcs-note">
                    &ldquo;Read it once during closing. Never again.&rdquo;
                  </div>
                  <div className="dcs-note">
                    &ldquo;I think it&rsquo;s in a drawer. Maybe the garage.&rdquo;
                  </div>
                  <div className="dcs-note dcs-fact">
                    0 of 9 had opened the inspection report in the past year
                  </div>
                </div>
              </div>
            </div>
          </figure>
        </Reveal>
      </section>

      <hr className="dcs-rule" />

      {/* 02 Principle */}
      <section id="principle" className="dcs-col dcs-block">
        <Reveal>
          <p className="dcs-heading site-subheading text-white">
            The principle
          </p>
          <div className="site-body text-white/65">
            <p>
              I joined as Founding Product Designer — 0→1 across mobile and web,
              owning end-to-end product design, the system it ships on, and how
              Domis uses AI (which I prototype myself). I work directly with
              leadership and engineering on what gets built when.
            </p>
            <p>
              To make setup rewarding instead of extractive, I designed around
              one principle:
            </p>
            <p className="mt-3 font-medium text-white">
              Extract the maximum value from the smallest action the user is
              willing to take.
            </p>
            <p className="mt-4">
              Everything below is evidence of that principle — not a feature
              catalog.
            </p>
          </div>
        </Reveal>
      </section>

      <hr className="dcs-rule" />

      {/* 03 Payoff — after stakes */}
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
              This is the destination: a home that exists in software. Upcoming
              work, appliances you can name, findings you can act on. The rest
              of the case study is how the smallest actions get you here.
            </p>
          </div>
        </Reveal>
      </section>

      <hr className="dcs-rule" />

      {/* 04 Address — evidence */}
      <section id="address" className="dcs-col dcs-block">
        <Reveal>
          <p className="dcs-heading site-subheading text-white">
            Evidence · Address
          </p>
          <p className="site-body text-white/50 mb-4">
            Smallest action: type an address.
          </p>
          <figure className="dcs-img-block">
            <DomisAddressFeatureCard />
          </figure>
          <div className="site-body text-white/65">
            <p>
              That is roughly the maximum a new user will tolerate before
              deciding if Domis is worth their time. So the address has to return
              as much as possible — Places discovery, then a search agent that
              researches the house.
            </p>
            <p>
              <strong className="text-white">
                AI search is non-deterministic.
              </strong>{" "}
              Same address, different runs. Rather than fake certainty, I ran
              the search three times and kept what agreed. Results land in the
              same form the user would have filled themselves — always editable.
            </p>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <figure className="dcs-figure">
          <div className="dcs-media">
            <ConsensusRunsPanel />
          </div>
          <figcaption className="dcs-caption site-body">
            Three searches, then a review. Agreement shows. Disagreement stays
            blank for the owner.
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

      <Reveal>
        <figure className="dcs-figure">
          <div className="dcs-media">
            <HomeAvatarConversion />
          </div>
          <figcaption className="dcs-caption site-body">
            Street view in — a clean home icon out. Recognizable when you manage
            more than one property.
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

      <hr className="dcs-rule" />

      {/* 05 Appliance — evidence */}
      <section id="appliance" className="dcs-col dcs-block">
        <Reveal>
          <p className="dcs-heading site-subheading text-white">
            Evidence · Appliance
          </p>
          <p className="site-body text-white/50 mb-4">
            Smallest action: take a photo of the label.
          </p>
          <figure className="dcs-img-block">
            <DomisApplianceFeatureCard />
          </figure>
          <div className="site-body text-white/65">
            <p>
              Logging appliances is useful early — they show up in tasks and
              with Pros. Photographing them feels fine. Typing model numbers
              does not. So the ask stayed at one photo.
            </p>
            <p>
              <strong className="text-white">
                The value is not the model number — it is what the model number
                unlocks.
              </strong>{" "}
              V1 read the plate. V2 turns that into support, warranty, and parts
              paths the owner can actually use.
            </p>
          </div>
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

      <Reveal>
        <figure className="dcs-figure">
          <div className="dcs-media dcs-media-fit">
            <ApplianceV1V2Compare />
          </div>
          <figcaption className="dcs-caption site-body">
            Same scan. One version knows the model number; the other knows what
            to do with it.
          </figcaption>
        </figure>
      </Reveal>

      <hr className="dcs-rule" />

      {/* 06 Report — evidence (chronology corrected) */}
      <section id="report" className="dcs-col dcs-block">
        <Reveal>
          <p className="dcs-heading site-subheading text-white">
            Evidence · Inspection report
          </p>
          <p className="site-body text-white/50 mb-4">
            Smallest action: upload a PDF you already have.
          </p>
          <figure className="dcs-img-block">
            <DomisHomeFeatureCard />
          </figure>
          <div className="site-body text-white/65">
            <p>
              Before address and appliance intelligence shipped, I looked for
              what homeowners already hold. Every home has an inspection report
              — long, unread, and often stale.
            </p>
            <p>
              Interviews flipped the goal.{" "}
              <strong className="text-white">
                Not a diagnostic that dumps a to-do list (wrong on arrival), but
                a way to understand the house.
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
            One PDF in. From dozens of pages of lingo to things you can
            comprehend — and optionally pull into tasks.
          </figcaption>
        </figure>
      </Reveal>

      <hr className="dcs-rule" />

      {/* 07 Systems, trust, collab */}
      <section id="systems" className="dcs-col dcs-block">
        <Reveal>
          <p className="dcs-heading site-subheading text-white">
            Systems, trust, and collaboration
          </p>
          <div className="site-body text-white/65">
            <p>
              <strong className="text-white">Systems.</strong> AI output and
              human input share the same editable forms. Mobile and web sit on
              one design system I own. Consensus, capture, and report processing
              are different pipelines with the same contract: fill what you can,
              never lock the owner out.
            </p>
            <p>
              <strong className="text-white">Trust.</strong> AI is wrong
              sometimes. We show disagreement instead of a confident wrong
              answer, keep every field editable, and treat the report as
              understanding — not an automatic chore list. Latency and cost of
              ×3 search were accepted so the product could be honest under
              non-determinism.
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

      <hr className="dcs-rule" />

      {/* 08 Tradeoff + outcome + learnings */}
      <section id="outcome" className="dcs-col dcs-block">
        <Reveal>
          <p className="dcs-heading site-subheading text-white">
            Tradeoff, outcome, learnings
          </p>
          <div className="site-body text-white/65">
            <p>
              <strong className="text-white">Hard tradeoff — Home tab density.</strong>{" "}
              Tall task cards and Domis Recommends mean roughly two tasks on
              screen. I chose calm readability and a clear create path over
              backlog density. Cost: more scroll for power users. For 0→1
              homeowners who do not know where to start, the calm scan won.
            </p>
            <p>
              <strong className="text-white">Outcome.</strong> Domis is shipped
              and still early. Craft and the principle are in market; setup
              completion and week-one return are the metrics I care about next —
              not claimed here as solved.
            </p>
            <p className="text-white font-medium mt-6 mb-2">Learnings</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                The smallest action only works if the payoff is visible
                immediately (address → filled home).
              </li>
              <li>
                Consensus and editability mattered more for trust than a
                “smarter” single-shot AI answer.
              </li>
              <li>
                Inspection reports needed a goal flip (understand ≠ task
                generator) before the UI could be right.
              </li>
              <li>
                Early launch means the principle shipped; the next pass is
                measuring whether people reopen Domis after week one.
              </li>
            </ul>
          </div>
        </Reveal>
      </section>
    </DomisLiveFonts>
  );
}
