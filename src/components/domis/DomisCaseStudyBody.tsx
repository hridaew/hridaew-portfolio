"use client";

import "./domis-case-study.css";
import "./domis-chapters.css";
import { Reveal } from "@/components/Reveal";
import { DomisMoreCards } from "@/components/domis/DomisMoreCards";
import { DomisKnownCarousel } from "@/components/domis/DomisKnownCarousel";
import { DomisConstraintDiagram } from "@/components/domis/DomisConstraintDiagram";
import { DomisValueMultiply } from "@/components/domis/DomisValueMultiply";
import { DomisHomeKnowledgeJourney } from "@/components/domis/DomisHomeKnowledgeJourney";
import { DomisAddressUserFlow } from "@/components/domis/DomisAddressUserFlow";
import { DomisApplianceTaskFlow } from "@/components/domis/DomisApplianceTaskFlow";
import { DomisUxDiagramEmbed } from "@/components/domis/DomisUxDiagramEmbed";
import { domisUxDiagramAssets } from "@/components/domis/domis-ux-diagram-assets";
import { DomisReportAffinity } from "@/components/domis/DomisReportAffinity";
import { DomisAddressFeatureCard } from "@/components/domis/DomisAddressFeatureCard";
import { DomisApplianceFeatureCard } from "@/components/domis/DomisApplianceFeatureCard";
import { DomisHomeFeatureCard } from "@/components/domis/DomisHomeFeatureCard";
import { DomisRoleCards } from "@/components/domis/DomisRoleCards";
import {
  DomisBridge,
  DomisChapterHead,
  DomisChapterIndex,
  DomisEyebrow,
  DomisShot,
  DomisUnderTheHood,
} from "@/components/domis/DomisChapter";
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

const GLANCE = [
  {
    label: "Problem",
    body: "A home app is useless until it knows the home, and owners can’t or won’t set it up.",
  },
  {
    label: "Principle",
    body: "Extract the most value from the smallest action someone will take.",
  },
  {
    label: "What I built",
    body: "Four AI-assisted ways in, a triage view that ranks what needs you, and Domis+ for people with many homes.",
  },
  {
    label: "Results",
    body: "Launched and still building. 85% of appliance labels read correctly in the first evaluation run. 15 Domis+ engineering blockers closed.",
  },
];

const FIRST_ATTEMPT = [
  {
    src: "/assets/domis/v2/early-task-form.jpg",
    w: 660,
    h: 1434,
    label: "A task as a form",
    alt: "Early wireframe of a Replace Air Filter task: date, room, how-to video, effort and importance tiles, vendor quote, and a service log",
  },
  {
    src: "/assets/domis/v2/early-savings.jpg",
    w: 585,
    h: 1266,
    label: "Promised savings",
    alt: "Early home screen with $1,400 estimated savings, 14 hours saved and 157 tasks completed above today’s tasks",
  },
  {
    src: "/assets/domis/v2/early-badges.jpg",
    w: 585,
    h: 1266,
    label: "Rewarded logging",
    alt: "Early home screen with achievement badges, tasks completed and appliances tracked counts, and scheduled and suggested tasks",
  },
];

const INPUTS = [
  { n: "1", title: "A task", give: "Five minutes in.", get: "The item, its room and its next date out." },
  { n: "2", title: "An address", give: "Typed once.", get: "Year built, size, systems and a home icon out." },
  { n: "3", title: "A photo", give: "One shot of a label.", get: "Model, manual, parts and warranty out." },
  { n: "4", title: "A report", give: "One upload.", get: "A plain-language read of the whole house out." },
];

const GATES = [
  { gate: "Every fact traces to a source", target: "100%", run: "100%", pass: true },
  { gate: "Safety recalls matched correctly", target: "98%", run: "100%", pass: true },
  { gate: "Appliance model read correctly", target: "95%", run: "85%", pass: false },
  { gate: "Priority address facts found", target: "85%", run: "57%", pass: false },
];

const RECAP = [
  { input: "A task", give: "About five minutes", learn: "The item, its room, when it’s due next" },
  { input: "An address", give: "Typed once", learn: "Year built, size, systems, a home icon" },
  { input: "A photo", give: "One shot of a label", learn: "Model, manual, parts, warranty, failures" },
  { input: "A report", give: "One upload", learn: "Spaces, items, and dozens of tasks" },
];

const RULES = [
  {
    name: "Now",
    tone: "now",
    body: "Overdue, due within 7 days, or starred. One primary action per card, and the reason is on the card. Red means broken.",
  },
  {
    name: "Coming up",
    tone: "soon",
    body: "8 to 30 days out, five at most, as a light list instead of a dense month grid. Amber means prepare.",
  },
  {
    name: "Snooze",
    tone: "quiet",
    body: "Always one week. Nobody wants a duration picker for gutters. Completed work drops below, with undo.",
  },
];

const DOMIS_PLUS_WORK = [
  {
    title: "Research",
    body: "Working sessions with landlords dropped two framings I’d started from, migration and setup depth. The real competitor is recall: which property, which contractor, what it cost, where the receipt is.",
  },
  {
    title: "Setup",
    body: "Three passes, each removing a decision. Grouping waits until it’s useful and file intake moved to its own track. What shipped asks for one field per home.",
  },
  {
    title: "Pricing",
    body: "A seat is a home, not a person, so the purchase moment is the moment someone adds a property. The plan picker took three passes to show the trial without punishing the free plan.",
  },
  {
    title: "Inhale",
    body: "Bulk intake: give Domis what you have and it proposes structure. Forty AI proposals need a policy, not forty modals, so each is scored on confidence and consequence. I cut it from v1 to keep it off the critical path.",
  },
];

const IMPACT = [
  {
    kind: "Shipped",
    title: "Domis, launched",
    body: "On iOS with Scan It and the report processor. The web app and Domis+ are launched and still being built.",
  },
  {
    kind: "Measured",
    title: "85% of labels read right",
    body: "In the test lab’s first run, where every extracted fact also traced back to a source.",
  },
  {
    kind: "Unblocked",
    title: "15 engineering questions closed",
    body: "Across three Domis+ sprints, written as rules developers could build from.",
  },
];

const DIFFERENTLY = [
  {
    title: "Measure the product, not just the AI",
    body: "I benchmarked the models. I can argue the bet worked, but I can’t show it yet.",
  },
  {
    title: "Meet landlords before sketching",
    body: "One working session rewrote a framing I’d already designed around.",
  },
  {
    title: "Set the system before adding surfaces",
    body: "Web screens got built ahead of design, and fixing that cost rework.",
  },
];

const PRINCIPLES = [
  "Fix hierarchy before reaching for color.",
  "Amber prepares. Red interrupts.",
  "Show disagreement, not confident errors.",
  "Fill what you can, never lock the owner out.",
  "An unfinished profile is never a failure state.",
];

export function DomisCaseStudyBody() {
  return (
    <DomisLiveFonts className={`domis-cs ${SITE_COLUMN} pb-16 md:pb-24`}>
      {/* ─── AT A GLANCE + CHAPTER INDEX ─── */}
      <section aria-label="At a glance" className="dcs-col dcs-block pt-16 md:pt-24">
        <Reveal>
          <p className="dcs-heading site-subheading text-ink">At a glance</p>
          <dl className="dcs-glance">
            {GLANCE.map((g) => (
              <div key={g.label} className="dcs-glance-cell">
                <dt className="site-label text-ink-subtle">{g.label}</dt>
                <dd className="site-body text-ink">{g.body}</dd>
              </div>
            ))}
          </dl>
          <DomisChapterIndex />
        </Reveal>
      </section>

      <hr className="dcs-rule" />

      {/* ─── 01 THE TENSION ─── */}
      <section id="tension" className="dcs-chapter">
        <div className="dcs-col dcs-block">
          <Reveal>
            <DomisChapterHead number="01" title="The tension" />
            <p className="dcs-heading site-subheading text-ink">What is Domis</p>
            <figure className="dcs-img-block">
              <div className="dcs-media dcs-media-hero-shot">
                <HeroProductShot />
              </div>
            </figure>
            <div className="site-body text-ink-muted">
              <p>
                Domis helps homeowners keep track of their homes: what needs
                fixing, what&rsquo;s about to break, and what that appliance in
                the garage actually is.
              </p>
              <p>
                Most services in this category try to take home care out of the
                owner&rsquo;s hands. Domis does the opposite. It sits between the
                owner and the house, helping them track it, understand it, and
                prevent the failures that get expensive.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="dcs-col dcs-block">
          <Reveal>
            <p className="dcs-heading site-subheading text-ink">My role</p>
            <p className="site-body text-ink-muted dcs-role-lede">
              Founding and only designer across mobile, web and Domis+. I joined
              to make it exist.
            </p>
            <DomisRoleCards />
          </Reveal>
        </div>

        <div className="dcs-col dcs-block">
          <Reveal>
            <p className="dcs-heading site-subheading text-ink">
              Most owners are rebuilding their house from scraps
            </p>
            <div className="site-body text-ink-muted">
              <p>
                Years in, something breaks, and they dig through texts, PDFs and
                camera rolls under stress. That moment of digging is the low point
                of every journey I mapped.
              </p>
            </div>
            <figure className="dcs-ux-figure dcs-ux-figure-wide dcs-ux-zoomable">
              <DomisHomeKnowledgeJourney />
              <figcaption className="dcs-caption site-body">
                First-timers drown in closing docs. Mid-journey owners, most Domis
                users, reconstruct the house every time something goes wrong.
              </figcaption>
            </figure>
          </Reveal>
        </div>

        <div className="dcs-col dcs-block">
          <Reveal>
            <p className="dcs-heading site-subheading text-ink">
              Domis only works once it knows your home. Most owners don&rsquo;t
              fully know it either.
            </p>
            <div className="site-body text-ink-muted">
              <p>
                Listing every space, appliance and quirk by hand is painful. When
                people tried to set up a home profile, many realized they
                didn&rsquo;t know their own homes, so setting up Domis also became
                the act of learning it.
              </p>
            </div>
            <figure className="dcs-ux-figure">
              <DomisConstraintDiagram />
            </figure>
          </Reveal>
        </div>

        <div className="dcs-col dcs-block">
          <Reveal>
            <p className="dcs-heading site-subheading text-ink">
              My first answer was to make data entry feel worth it
            </p>
            <div className="site-body text-ink-muted">
              <p>
                Savings counters, hours saved, badges. Rewarded data entry is
                still data entry, and an empty home read like a failing grade. So
                I stopped asking.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <figure className="dcs-wide dcs-attempts">
            <ul className="dcs-attempt-row">
              {FIRST_ATTEMPT.map((a) => (
                <li key={a.label} className="dcs-attempt is-dropped">
                  <DomisShot src={a.src} alt={a.alt} width={a.w} height={a.h} />
                  <span className="dcs-attempt-label">
                    <s>{a.label}</s>
                  </span>
                </li>
              ))}
              <li className="dcs-attempt is-kept">
                <DomisShot
                  src="/assets/domis/v2/tasks-first.jpg"
                  alt="Shipped home tab for Steph’s Place: search, a short list of tasks with tags and last-done dates, and Domis Recommends below"
                  width={780}
                  height={1688}
                />
                <span className="dcs-attempt-label">Where it landed: tasks first</span>
              </li>
            </ul>
            <figcaption className="dcs-caption site-body">
              Three early directions that asked for data up front, and the
              tasks-first home that replaced them.
            </figcaption>
          </figure>
        </Reveal>

        <Reveal>
          <aside className="dcs-principle" aria-label="Design principle">
            <p className="site-label dcs-principle-eyebrow">The turn</p>
            <p className="dcs-principle-text">
              Extract the maximum value from the smallest action someone is
              willing to take.
            </p>
            <p className="dcs-principle-note">
              Every chapter below applies this test at a bigger scale.
            </p>
          </aside>
        </Reveal>

        <div className="dcs-col dcs-block">
          <Reveal>
            <figure className="dcs-ux-figure">
              <div className="dud dud-board dvm-board">
                <DomisValueMultiply />
              </div>
            </figure>
          </Reveal>
        </div>

        <div className="dcs-col dcs-block">
          <Reveal>
            <p className="dcs-heading site-subheading text-ink">
              The target: a home, known
            </p>
            <figure className="dcs-img-block dcs-known-breakout">
              <DomisKnownCarousel />
            </figure>
            <div className="site-body text-ink-muted">
              <p>
                This is what an owner who understands their house looks like in
                software: a filled property, tasks tagged with the appliances they
                touch, and tasks pulled from the inspection report. The next
                chapter is how Domis gets there without a setup form.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <hr className="dcs-rule" />

      {/* ─── 02 LEARN THE HOME WITHOUT ASKING ─── */}
      <section id="learn" className="dcs-chapter">
        <div className="dcs-col dcs-block">
          <Reveal>
            <DomisChapterHead
              number="02"
              title="Learn the home without asking"
              lede="Four small actions, and the intelligence under each one. For every input, the experience comes first and the AI design second."
            />
            <ol className="dcs-inputs">
              {INPUTS.map((i) => (
                <li key={i.n} className="dcs-input">
                  <span className="site-label text-ink-subtle">Input {i.n}</span>
                  <span className="dcs-input-title">{i.title}</span>
                  <span className="dcs-input-copy">
                    {i.give} {i.get}
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        {/* Address Intelligence */}
        <div id="address" className="dcs-col dcs-block dcs-sub">
          <Reveal>
            <DomisEyebrow>Input 2 · Address Intelligence</DomisEyebrow>
            <h3 className="dcs-heading type-h3 text-ink">
              Type an address once. Get a home.
            </h3>
            <figure className="dcs-img-block">
              <DomisAddressFeatureCard />
            </figure>
            <div className="site-body text-ink-muted">
              <p>
                <strong className="text-ink">
                  The first thing anyone does in Domis is type their address.
                </strong>{" "}
                That is the entire ask, and about as much as a new user will give.
              </p>
              <p>
                So I designed address intelligence around that single input: type
                an address once, and Domis researches the house and fills in the
                form the owner would have completed by hand.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="dcs-col dcs-block">
          <Reveal>
            <p className="dcs-heading site-subheading text-ink">
              Three searches. Show only what agrees.
            </p>
            <div className="site-body text-ink-muted">
              <p>
                <strong className="text-ink">
                  The hard part is not finding data. It is deciding what the owner
                  should see when search is unsure.
                </strong>{" "}
                The same address can return different facts on different runs.
              </p>
              <p>
                Rather than forcing a confident answer, Domis runs three searches
                and cross-checks them. It shows what the sources agree on, leaves
                a blank when they don&rsquo;t, and never locks the owner out of a
                field.
              </p>
            </div>
          </Reveal>
        </div>

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

        <div className="dcs-col dcs-block">
          <Reveal>
            <p className="site-body text-ink-muted">
              Address Intelligence also pulls photos of the property and generates
              a clean icon for it. A small thing, but a recognizable avatar matters
              once someone manages more than one property, and it&rsquo;s
              replaceable if they&rsquo;d rather use their own.
            </p>
          </Reveal>
        </div>

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

        <div className="dcs-col dcs-block">
          <Reveal>
            <DomisUnderTheHood title="The address flow, end to end">
              <DomisUxDiagramEmbed
                scrollable
                zoomable
                type="User flow"
                heading="Create a home from an address"
                src={domisUxDiagramAssets.addressUserFlow}
                alt="User flow: enter address, choose autofill or type manually, Domis loads home facts, review or leave blanks, optional edits and photo, home created"
                fallback={<DomisAddressUserFlow />}
              />
            </DomisUnderTheHood>
          </Reveal>
        </div>

        {/* Appliance Intelligence */}
        <div id="appliance" className="dcs-col dcs-block dcs-sub">
          <Reveal>
            <DomisEyebrow>Input 3 · Appliance Intelligence</DomisEyebrow>
            <h3 className="dcs-heading type-h3 text-ink">The label is already the data</h3>
            <figure className="dcs-img-block">
              <DomisApplianceFeatureCard />
            </figure>
            <div className="site-body text-ink-muted">
              <p>
                Logging appliances is one of the first useful things to do in
                Domis, since it lets them be tagged in tasks and in conversations
                with Pros. Walking around photographing them turns out to be
                mildly satisfying. Typing in the model number does not.
              </p>
              <p>
                <strong className="text-ink">
                  The model number was never the user goal. It was a key
                </strong>{" "}
                to what owners need later: manuals, warranty, support, parts and
                common failures.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="dcs-col dcs-block">
          <Reveal>
            <p className="dcs-heading site-subheading text-ink">
              Proved it in a chat. Shipped v1. Designed v2.
            </p>
            <div className="site-body text-ink-muted">
              <p>
                Before asking anyone to build a scanner, I asked my Gemini app
                about an appliance label to see what it could give me. That one
                chat was the proof of concept.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <figure className="dcs-figure">
            <div className="dcs-media dcs-media-image">
              <div className="dcs-gemini-shot">
                <img
                  src="/assets/domis/live/gemini-appliance-label.jpg"
                  alt="Gemini chat extracting manufacturer, model, and serial from an appliance label photo"
                  width={1024}
                  height={865}
                  loading="lazy"
                  draggable={false}
                />
              </div>
            </div>
            <figcaption className="dcs-caption site-body">
              Proof of concept: one photo, one chat.
            </figcaption>
          </figure>
        </Reveal>

        <Reveal>
          <figure className="dcs-figure">
            <div className="dcs-media dcs-media-fit">
              <ApplianceCaptureDemo />
            </div>
            <figcaption className="dcs-caption site-body">
              v1: one photo of the spec sticker, and the form fills itself in.
            </figcaption>
          </figure>
        </Reveal>

        <div className="dcs-col dcs-block">
          <Reveal>
            <p className="site-body text-ink-muted">
              V1 stopped at reading the plate. For v2 I pushed the same scan
              further: support pages, warranty links, the things an owner
              actually needs when something breaks.
            </p>
          </Reveal>
        </div>

        <Reveal>
          <figure className="dcs-ux-figure">
            <ApplianceV1V2Compare />
            <figcaption className="dcs-caption site-body">
              v1 reads the label. v2 knows the appliance.
            </figcaption>
          </figure>
        </Reveal>

        <div className="dcs-col dcs-block">
          <Reveal>
            <DomisUnderTheHood title="The appliance task flow">
              <DomisUxDiagramEmbed
                scrollable
                zoomable
                type="Task flow"
                heading="Add an appliance so it can be tagged later"
                src={domisUxDiagramAssets.applianceTaskFlow}
                alt="Task flow: open capture, photograph label or enter manually, extract brand and model, confirm, attach links or save without them, appliance on home"
                fallback={<DomisApplianceTaskFlow />}
              />
            </DomisUnderTheHood>
          </Reveal>
        </div>

        {/* Quality gates */}
        <div className="dcs-col dcs-block">
          <Reveal>
            <p className="dcs-heading site-subheading text-ink">
              Pass or fail, misses included
            </p>
            <div className="site-body text-ink-muted">
              <p>
                I built a working test lab for both features: an evaluation
                harness with pass or fail gates. The first quick run covered 20
                addresses and 40 appliance labels.
              </p>
            </div>
            <div className="dcs-table-wrap">
              <table className="dcs-table">
                <caption className="sr-only">
                  Quality gates for address and appliance intelligence, first run
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Gate</th>
                    <th scope="col">Target</th>
                    <th scope="col">First run</th>
                    <th scope="col">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {GATES.map((g) => (
                    <tr key={g.gate}>
                      <th scope="row">{g.gate}</th>
                      <td>{g.target}</td>
                      <td>{g.run}</td>
                      <td>
                        <span className={`dcs-gate ${g.pass ? "is-pass" : "is-miss"}`}>
                          {g.pass ? "Pass" : "Not yet"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="site-body text-ink-muted dcs-after-table">
              The misses shaped the design.{" "}
              <strong className="text-ink">
                A blank is a normal state, and the owner can always edit.
              </strong>
            </p>
          </Reveal>
        </div>

        {/* Report Processor */}
        <div id="report" className="dcs-col dcs-block dcs-sub">
          <Reveal>
            <DomisEyebrow>Input 4 · Report Processor</DomisEyebrow>
            <h3 className="dcs-heading type-h3 text-ink">
              A report isn&rsquo;t a to-do list. It describes your house.
            </h3>
            <figure className="dcs-img-block">
              <DomisHomeFeatureCard />
            </figure>
            <div className="site-body text-ink-muted">
              <p>
                Part of meeting owners where they are was asking what information
                they already have. Every homeowner has an inspection report. It is
                also long, repetitive, and almost entirely unread.
              </p>
              <p>
                Interviews explained why.{" "}
                <strong className="text-ink">
                  People had been in their homes long enough that the report no
                  longer described the house they were living in.
                </strong>
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <figure className="dcs-ux-figure">
            <DomisReportAffinity />
          </figure>
        </Reveal>

        <div className="dcs-col dcs-block">
          <Reveal>
            <p className="site-body text-ink-muted">
              That changed what the feature should be.{" "}
              <strong className="text-ink">
                Not a diagnostic that generates a to-do list, which would be wrong
                on arrival, but a way to understand the house.
              </strong>{" "}
              The processor explains the house first and lets owners choose what
              becomes a task.
            </p>
          </Reveal>
        </div>

        <Reveal>
          <figure className="dcs-figure">
            <div className="dcs-media">
              <InspectionToTasksDemo />
            </div>
            <figcaption className="dcs-caption site-body">
              From 64 pages of construction and real estate lingo to things you
              can actually understand.
            </figcaption>
          </figure>
        </Reveal>

        {/* Recap */}
        <div className="dcs-col dcs-block">
          <Reveal>
            <p className="dcs-heading site-subheading text-ink">
              Small actions in, a whole house out
            </p>
            <div className="dcs-table-wrap">
              <table className="dcs-table dcs-table-recap">
                <caption className="sr-only">
                  What each input asks of the owner and what Domis learns from it
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Input</th>
                    <th scope="col">The owner gives</th>
                    <th scope="col">Domis learns</th>
                  </tr>
                </thead>
                <tbody>
                  {RECAP.map((r) => (
                    <tr key={r.input}>
                      <th scope="row">{r.input}</th>
                      <td>{r.give}</td>
                      <td>{r.learn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DomisBridge>
              It worked, and it created the next problem: a home full of facts,
              all at the same volume.
            </DomisBridge>
          </Reveal>
        </div>
      </section>

      <hr className="dcs-rule" />

      {/* ─── 03 TURN IT INTO A VERDICT ─── */}
      <section id="verdict" className="dcs-chapter">
        <div className="dcs-col dcs-block">
          <Reveal>
            <DomisChapterHead number="03" title="Turn it into a verdict" />
            <div className="site-body text-ink-muted">
              <p>
                Stakeholder feedback on the overview came in as three requests:
                stronger calls to action, more color, more distinct widgets.{" "}
                <strong className="text-ink">
                  I argued they were one problem. Nothing on the screen outranked
                  anything else.
                </strong>
              </p>
              <p>
                In one review the loudest card was yard care and a broken HVAC
                system was the quietest. More color would have made the screen
                louder, not clearer. The screen has one job: is my home OK, and
                what do I do next?
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <figure className="dcs-wide dcs-compare">
            <div className="dcs-compare-item is-before">
              <p className="site-label text-ink-subtle">Before · every card at the same volume</p>
              <DomisShot
                src="/assets/domis/v2/web-before.jpg"
                alt="Earlier web layout: a filter panel and calendar beside a column of identical Check Air Filter cards with equal visual weight"
                width={1600}
                height={1338}
              />
            </div>
            <div className="dcs-compare-item is-after">
              <p className="site-label text-ink">After · ranked by what needs you</p>
              <DomisShot
                src="/assets/domis/v2/web-triage.jpg"
                alt="Triage view for All properties: a Now section of three task cards each with a property name and one primary action, then Coming up, Recently completed with restore, and a calendar column"
                width={1600}
                height={1511}
              />
            </div>
          </figure>
        </Reveal>

        <div className="dcs-col dcs-block">
          <Reveal>
            <p className="dcs-heading site-subheading text-ink">
              Every section runs on a written rule
            </p>
            <ul className="dcs-rules">
              {RULES.map((r) => (
                <li key={r.name} className={`dcs-rule-card is-${r.tone}`}>
                  <span className="dcs-rule-name">{r.name}</span>
                  <span className="site-body text-ink-muted">{r.body}</span>
                </li>
              ))}
            </ul>
            <DomisBridge>
              One home, legible at a glance. Then landlords asked about their
              other nine.
            </DomisBridge>
          </Reveal>
        </div>
      </section>

      <hr className="dcs-rule" />

      {/* ─── 04 DOMIS+ (teaser) ─── */}
      <section id="domis-plus" className="dcs-chapter">
        <div className="dcs-col dcs-block">
          <Reveal>
            <DomisChapterHead number="04" title="The same problem, times ten" />
            <p className="dcs-status">
              <span className="dcs-status-dot" aria-hidden="true" />
              Domis+ · Launched and currently building
            </p>
            <div className="site-body text-ink-muted">
              <p>
                Domis+ is the paid tier for people with more than one home, mostly
                small landlords.{" "}
                <strong className="text-ink">
                  The people who need a record of their homes most have the least
                  time to build one.
                </strong>{" "}
                So the principle had to hold at ten homes, not one.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <figure className="dcs-figure">
            <DomisShot
              className="dcs-shot-framed"
              src="/assets/domis/v2/domis-plus-name-homes.jpg"
              alt="Domis+ setup: Name your 4 homes. Each row has a home icon, a name field and an optional address with autocomplete; the first is named from its address"
              width={1600}
              height={1112}
            />
            <figcaption className="dcs-caption site-body">
              Setup for four homes asks for one field each. Addresses are optional.
            </figcaption>
          </figure>
        </Reveal>

        <div className="dcs-col dcs-block">
          <Reveal>
            <p className="dcs-heading site-subheading text-ink">What went into it</p>
            <ul className="dcs-worklist">
              {DOMIS_PLUS_WORK.map((w) => (
                <li key={w.title}>
                  <span className="dcs-worklist-title">{w.title}</span>
                  <span className="site-body text-ink-muted">{w.body}</span>
                </li>
              ))}
            </ul>
            <p className="site-body text-ink-muted dcs-after-table">
              The full Domis+ story gets its own write-up as it ships.
            </p>
          </Reveal>
        </div>
      </section>

      <hr className="dcs-rule" />

      {/* ─── 05 WHAT IT ADDED UP TO ─── */}
      <section id="impact" className="dcs-chapter">
        <div className="dcs-col dcs-block">
          <Reveal>
            <DomisChapterHead
              number="05"
              title="What it added up to"
              lede="My job was to make it exist. In 0 to 1 work there’s no baseline to beat, so here is what exists, what I measured, and what it unblocked."
            />
            <ul className="dcs-impact">
              {IMPACT.map((i) => (
                <li key={i.kind} className="dcs-impact-card">
                  <span className="site-label text-ink-subtle">{i.kind}</span>
                  <span className="dcs-impact-title">{i.title}</span>
                  <span className="site-body text-ink-muted">{i.body}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="dcs-col dcs-block">
          <Reveal>
            <p className="dcs-heading site-subheading text-ink">
              What I&rsquo;d do differently
            </p>
            <ol className="dcs-worklist dcs-worklist-numbered">
              {DIFFERENTLY.map((d) => (
                <li key={d.title}>
                  <span className="dcs-worklist-title">{d.title}</span>
                  <span className="site-body text-ink-muted">{d.body}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        <div className="dcs-col dcs-block">
          <Reveal>
            <p className="dcs-heading site-subheading text-ink">
              Principles I carry forward
            </p>
            <ul className="dcs-principles">
              {PRINCIPLES.map((p) => (
                <li key={p} className="site-body text-ink">
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div id="more" className="dcs-col dcs-block">
          <Reveal>
            <p className="dcs-heading site-subheading text-ink">And more</p>
            <div className="site-body text-ink-muted">
              <p>
                Domis recently launched and is updating quickly. The lens
                hasn&rsquo;t changed.{" "}
                <strong className="text-ink">
                  Find the smallest thing the user is willing to do, and return
                  as much as possible for it.
                </strong>
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <DomisMoreCards />
        </Reveal>
      </section>
    </DomisLiveFonts>
  );
}
