"use client";

import "./domis-case-study.css";
import { Reveal } from "@/components/Reveal";
import { DomisMoreCards } from "@/components/domis/DomisMoreCards";
import { DomisKnownCarousel } from "@/components/domis/DomisKnownCarousel";
import { LightboxImage } from "@/components/virdio/Lightbox";
import { SITE_COLUMN } from "@/components/home/homeGrid";

function PointerCursor({ className }: { className?: string }) {
  return (
    <svg className={`dcs-cursor ${className ?? ""}`} aria-hidden="true">
      <use href="#dcs-ptr" />
    </svg>
  );
}

export function DomisCaseStudyBody() {
  return (
    <div className={`domis-cs ${SITE_COLUMN} pb-16 md:pb-24`}>
      <svg className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <symbol id="dcs-ptr" viewBox="0 0 13 19">
          <path
            d="M1.5 1.2 L1.5 15.4 L5.2 11.9 L7.6 17.4 L10 16.4 L7.6 11 L12 11 Z"
            fill="#fff"
            stroke="#16181c"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </symbol>
      </svg>

      {/* Intro — top padding mirrors hero pb-16/md:pb-24 for even spacing around the divider */}
      <section id="overview" className="dcs-col dcs-block pt-16 md:pt-24">
        <Reveal>
          <div className="dcs-overview-stack">
            <div>
              <p className="dcs-heading site-subheading text-white">
                What is Domis
              </p>
              <figure className="dcs-img-block">
                <div
                  className="dcs-media dcs-media-placeholder"
                  aria-label="Placeholder: hero shot with web and mobile"
                >
                  <p className="dcs-placeholder-label">
                    Hero shot with web and mobile
                  </p>
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

            <div>
              <p className="dcs-heading site-subheading text-white">
                Key challenge
              </p>
              <figure className="dcs-img-block">
                <div
                  className="dcs-media dcs-media-placeholder"
                  aria-label="Placeholder: old appliance with cobwebs, inspection report, and overwhelmed user"
                >
                  <p className="dcs-placeholder-label">
                    Image or illustration: old core-system appliance with
                    cobwebs, an inspection report, and an overwhelmed user
                  </p>
                </div>
              </figure>
              <div className="site-body text-white/65">
                <p>
                  A successful Domis experience depends on the app knowing your
                  home. Setting up a home profile means answering questions
                  about square footage, build year, and every appliance you own,
                  and that is close to the least appealing task imaginable.
                </p>
                <p>
                  So people don&rsquo;t, and then the product has nothing to
                  work with.
                </p>
                <p>
                  <strong className="text-white">
                    My research and interviews with homeowners revealed that
                    this isn&rsquo;t just an information issue for Domis. Most
                    people don&rsquo;t know their own homes.
                  </strong>{" "}
                  Owners couldn&rsquo;t name the manufacturer of their water
                  heater or say when the roof was last serviced.
                </p>
                <p>
                  So getting information into Domis is also the act of learning
                  it. That reframed the goal: not a filled database, but an
                  owner who understands the house they live in.
                </p>
                <p>
                  In order to maximize the information we get and reduce the
                  load on the user, I designed Domis through one core principle:{" "}
                  <strong className="text-white">
                    Extract the maximum value from the smallest action the user
                    is willing to take.
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Role */}
      <section id="role" className="dcs-col dcs-block">
        <Reveal>
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
        </Reveal>
      </section>


      {/* Payoff — the home, known — before ingestion mechanics */}
      <hr className="dcs-rule" />

      <section id="known" className="dcs-col dcs-block">
        <Reveal>
          <p className="dcs-heading site-subheading text-white">
            The home, known
          </p>
          <figure className="dcs-img-block">
            <DomisKnownCarousel />
          </figure>
          <div className="site-body text-white/65">
            <p>
              This is what an owner who understands their house looks like in
              software. A filled property. Appliances tagged. Tasks pulled from
              the report.
            </p>
            <p>
              The three features below answer how it got that way, and each one
              has an obvious reason to exist.
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
          <div className="site-body text-white/65">
            <p>
              <strong className="text-white">
                The first thing anyone does in Domis is type their address.
              </strong>{" "}
              That is the entire ask, and it is roughly the maximum a new user
              will tolerate before deciding whether this is worth their time.
            </p>
            <p>
              So I designed for that one action to return as much as possible.
              The address resolves the property through Google Places, which
              hands off to a search agent that goes and researches the house. A
              second model sorts what comes back into what it is confident about
              and what should be dropped.
            </p>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <figure className="dcs-figure">
          <div className="dcs-media">
            <div className="dcs-io">
              <div className="dcs-in">
                <p className="dcs-lbl dcs-io-label">The user gives</p>
                <div className="dcs-addrfield">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    style={{ flex: "none" }}
                  >
                    <circle
                      cx="7"
                      cy="7"
                      r="5"
                      stroke="#b6bac1"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M10.7 10.7 L14.5 14.5"
                      stroke="#b6bac1"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="dcs-type">2140 Fillmore St</span>
                  <span className="dcs-caret" />
                </div>
              </div>

              <div className="dcs-io-arrow">
                <div className="dcs-stem" />
                <span className="dcs-mstep">Places</span>
                <div className="dcs-stem" />
                <span className="dcs-mstep">Search agent</span>
                <div className="dcs-stem" />
                <span className="dcs-mstep">Consensus</span>
                <div className="dcs-stem" />
                <span className="dcs-tip">→</span>
              </div>

              <div className="dcs-out">
                <p className="dcs-lbl dcs-io-label">Domis returns</p>
                <div className="dcs-profile dcs-card">
                  <div className="dcs-prow">
                    <span className="dcs-lbl">Property</span>
                    <span className="dcs-val">Single family</span>
                  </div>
                  <div className="dcs-prow">
                    <span className="dcs-lbl">Year built</span>
                    <span className="dcs-val">1974</span>
                  </div>
                  <div className="dcs-prow">
                    <span className="dcs-lbl">Square footage</span>
                    <span className="dcs-val">1,840</span>
                  </div>
                  <div className="dcs-prow">
                    <span className="dcs-lbl">Bedrooms</span>
                    <span className="dcs-val">3</span>
                  </div>
                  <div className="dcs-prow">
                    <span className="dcs-lbl">Bathrooms</span>
                    <span className="dcs-val">2</span>
                  </div>
                  <div className="dcs-prow">
                    <span className="dcs-lbl">Roof</span>
                    <span className="dcs-val">Asphalt shingle</span>
                  </div>
                  <div className="dcs-prow">
                    <span className="dcs-lbl">Heating</span>
                    <span className="dcs-val">Forced air, gas</span>
                  </div>
                  <div className="dcs-prow">
                    <span className="dcs-lbl">Lot size</span>
                    <span className="dcs-val" style={{ color: "var(--dcs-mock-muted)" }}>
                      Add
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <PointerCursor className="dcs-addr-cursor" />
          </div>
          <figcaption className="dcs-caption site-body">
            One address in. A home profile out.
          </figcaption>
        </figure>
      </Reveal>

      <section className="dcs-col dcs-block">
        <Reveal>
          <div className="site-body text-white/65">
            <p>
              <strong className="text-white">
                Agentic search is non-deterministic.
              </strong>{" "}
              The same address returns different results on different runs, and
              there is no version of this that is right every time. Rather than
              trying to engineer certainty, I ran the search three times and
              kept what agreed across runs. It is fast and cheap enough that
              redundancy is a reasonable substitute for confidence.
            </p>
            <p>
              The results land in the same form the user would have filled in
              themselves. Tap a field, type, done. If the model says three
              bathrooms and there are two, fixing it costs a second.
            </p>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <figure className="dcs-figure">
          <div className="dcs-media">
            <div className="dcs-sc">
              <div className="dcs-answers">
                <span className="dcs-who">Run 1</span>
                <div className="dcs-chip">1974</div>
                <div className="dcs-chip">2 bath</div>
                <div className="dcs-chip">1,840 sq ft</div>
              </div>
              <div className="dcs-answers">
                <span className="dcs-who">Run 2</span>
                <div className="dcs-chip">1974</div>
                <div className="dcs-chip">2 bath</div>
                <div className="dcs-chip dcs-drop">2,110 sq ft</div>
              </div>
              <div className="dcs-answers">
                <span className="dcs-who">Run 3</span>
                <div className="dcs-chip">1974</div>
                <div className="dcs-chip dcs-drop">3 bath</div>
                <div className="dcs-chip dcs-drop">1,910 sq ft</div>
              </div>

              <div className="dcs-lands">
                <div className="dcs-answers">
                  <span className="dcs-who">Shown</span>
                  <div className="dcs-landed">1974</div>
                  <div className="dcs-landed">2 bath</div>
                  <div className="dcs-landed dcs-ask">Add sq ft</div>
                </div>
                <p className="dcs-lbl" style={{ margin: "14px 0 0" }}>
                  Two out of three is enough to show. No agreement means the
                  field arrives empty and asks.
                </p>
              </div>
            </div>
          </div>
          <figcaption className="dcs-caption site-body">
            Three answers. Only agreement survives. Disagreement arrives as an
            empty field.
          </figcaption>
        </figure>
      </Reveal>

      <section className="dcs-col dcs-block">
        <Reveal>
          <p className="site-body text-white/65">
            Address Intelligence also pulls photos of the property and generates
            a clean icon for it. Small thing, but a recognizable avatar matters
            when someone manages more than one property, and it is better than a
            blurry satellite crop. It is replaceable if they would rather use
            their own.
          </p>
        </Reveal>
      </section>

      <Reveal>
        <figure className="dcs-figure">
          <div className="dcs-media">
            <div className="dcs-versus">
              <div>
                <div className="dcs-thumb dcs-sat" />
                <p className="dcs-lbl" style={{ margin: "12px 0 0" }}>
                  What the map gives you
                </p>
              </div>
              <div>
                <div className="dcs-thumb dcs-icon">
                  <svg
                    width="66"
                    height="66"
                    viewBox="0 0 64 64"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 30 L32 11 L55 30"
                      stroke="#4a5261"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 27 V52 H49 V27"
                      stroke="#4a5261"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="27"
                      y="38"
                      width="10"
                      height="14"
                      stroke="#4a5261"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M43 15 V23"
                      stroke="#4a5261"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <p className="dcs-lbl" style={{ margin: "12px 0 0" }}>
                  What Domis makes of it
                </p>
              </div>
            </div>
          </div>
          <figcaption className="dcs-caption site-body">
            Recognizable at a glance, which is the whole job when you own four
            of them.
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
          <div className="site-body text-white/65">
            <p>
              Logging your appliances is one of the first useful things to do in
              Domis, since it lets them be tagged in tasks and in conversations
              with Pros. Walking around photographing them turns out to be mildly
              satisfying. Typing in the model number, warranty date,
              manufacturer, and where you bought it does not.
            </p>
            <p>
              <strong className="text-white">
                I started by loading a cheap model against appliance labels to
                see what it could actually read.
              </strong>{" "}
              It read them well. That test became v1: an AI-assisted label
              scanner that captures what is printed on the plate, which every
              appliance has.
            </p>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <figure className="dcs-figure">
          <div className="dcs-media">
            <div className="dcs-artifact">
              <div className="dcs-term">
                <div>
                  <span className="dcs-c">$</span> python label_test.py --img
                  water_heater_01.jpg
                </div>
                <div className="dcs-c">reading label…</div>
                <div>&nbsp;</div>
                <div>
                  <span className="dcs-y">brand</span>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Rheem
                </div>
                <div>
                  <span className="dcs-y">model</span>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;XE50M06ST45U1
                </div>
                <div>
                  <span className="dcs-y">serial</span>
                  &nbsp;&nbsp;&nbsp;&nbsp;Q451812345
                </div>
                <div>
                  <span className="dcs-y">capacity</span>
                  &nbsp;&nbsp;50 gal
                </div>
                <div>
                  <span className="dcs-y">mfg_date</span>
                  &nbsp;&nbsp;2018-11
                </div>
                <div>&nbsp;</div>
                <div className="dcs-g">6/6 fields legible.</div>
                <div className="dcs-c"># ok. this is the feature.</div>
              </div>
              <p className="dcs-lbl dcs-media-note">
                Not a design yet. Just the question of whether there was anything
                to design.
              </p>
            </div>
          </div>
          <figcaption className="dcs-caption site-body">
            The test that became the feature, before it looked like anything.
          </figcaption>
        </figure>
      </Reveal>

      <Reveal>
        <figure className="dcs-figure">
          <div className="dcs-media">
            <div className="dcs-io">
              <div className="dcs-in" style={{ position: "relative" }}>
                <p className="dcs-lbl dcs-io-label">The user gives</p>
                <div className="dcs-phone">
                  <div className="dcs-viewfinder">
                    <div className="dcs-plate">
                      <div className="dcs-bar" style={{ width: "80%" }} />
                      <div className="dcs-bar" style={{ width: "56%" }} />
                      <div className="dcs-bar" style={{ width: "70%" }} />
                    </div>
                    <div className="dcs-flash" />
                  </div>
                  <div className="dcs-shutter">
                    <div className="dcs-ring">
                      <div className="dcs-dot" />
                    </div>
                  </div>
                </div>
                <div className="dcs-touch dcs-ph-touch" />
              </div>

              <div className="dcs-io-arrow">
                <div className="dcs-stem" />
                <span className="dcs-mstep">Read plate</span>
                <div className="dcs-stem" />
                <span className="dcs-tip">→</span>
              </div>

              <div className="dcs-out">
                <p className="dcs-lbl dcs-io-label">Domis returns</p>
                <div className="dcs-appl dcs-card">
                  <div className="dcs-arow">
                    <span className="dcs-lbl">Appliance</span>
                    <span className="dcs-val">Water heater</span>
                  </div>
                  <div className="dcs-arow">
                    <span className="dcs-lbl">Brand</span>
                    <span className="dcs-val">Rheem</span>
                  </div>
                  <div className="dcs-arow">
                    <span className="dcs-lbl">Model</span>
                    <span className="dcs-val">XE50M06ST45U1</span>
                  </div>
                  <div className="dcs-arow">
                    <span className="dcs-lbl">Serial</span>
                    <span className="dcs-val">Q451812345</span>
                  </div>
                  <div className="dcs-arow">
                    <span className="dcs-lbl">Installed</span>
                    <span className="dcs-val" style={{ color: "var(--dcs-mock-muted)" }}>
                      Add
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
              But a captured label is still just reference text.{" "}
              <strong className="text-white">
                The value is not in knowing the model number, it is in what the
                model number unlocks.
              </strong>
            </p>
            <p>
              For v2 I reused the pipeline I had built for Address Intelligence.
              Clean up the captured text, run the searches, filter the results,
              and return the things an owner actually wants: the support page,
              the manual, common failures for that unit, warranty status.
            </p>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <figure className="dcs-figure">
          <div className="dcs-media">
            <div className="dcs-twoup">
              <div className="dcs-pane">
                <div className="dcs-ph">
                  <span className="dcs-lbl">v1 — Label scanner</span>
                </div>
                <div className="dcs-kv">
                  <span className="dcs-lbl">Brand</span>
                  <span>Rheem</span>
                </div>
                <div className="dcs-kv">
                  <span className="dcs-lbl">Model</span>
                  <span>XE50M06ST</span>
                </div>
                <div className="dcs-kv">
                  <span className="dcs-lbl">Serial</span>
                  <span>Q451812345</span>
                </div>
                <div className="dcs-kv">
                  <span className="dcs-lbl">Capacity</span>
                  <span>50 gal</span>
                </div>
                <p className="dcs-lbl" style={{ margin: "auto 0 0" }}>
                  Accurate. Inert.
                </p>
              </div>
              <div className="dcs-pane">
                <div className="dcs-ph">
                  <span className="dcs-lbl">v2 — Appliance Intelligence</span>
                </div>
                <div className="dcs-link">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    style={{ flex: "none" }}
                  >
                    <path
                      d="M4 1.5 H9.5 L13 5 V14.5 H4 Z"
                      stroke="#3b6cf0"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.5 1.5 V5 H13"
                      stroke="#3b6cf0"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Manual, 42 pp
                </div>
                <div className="dcs-link">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    style={{ flex: "none" }}
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="6.3"
                      stroke="#3b6cf0"
                      strokeWidth="1.4"
                    />
                    <path d="M1.7 8 H14.3" stroke="#3b6cf0" strokeWidth="1.4" />
                    <path
                      d="M8 1.7 C10.2 4.2 10.2 11.8 8 14.3 C5.8 11.8 5.8 4.2 8 1.7 Z"
                      stroke="#3b6cf0"
                      strokeWidth="1.4"
                    />
                  </svg>
                  Rheem support
                </div>
                <div className="dcs-link">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    style={{ flex: "none" }}
                  >
                    <path
                      d="M2 5 L8 1.8 L14 5 V11 L8 14.2 L2 11 Z"
                      stroke="#3b6cf0"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 5 L8 8.2 L14 5 M8 8.2 V14.2"
                      stroke="#3b6cf0"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Replacement parts
                </div>
                <div style={{ padding: "9px 0 5px" }}>
                  <span className="dcs-pill dcs-hi">
                    Warranty active · 4 yrs left
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    lineHeight: 1.5,
                    color: "#4a4f57",
                    paddingTop: 6,
                  }}
                >
                  Common failures: thermocouple, anode rod, pilot assembly
                </div>
                <p className="dcs-lbl" style={{ margin: "auto 0 0" }}>
                  Same capture. Now it does something.
                </p>
              </div>
            </div>
          </div>
          <figcaption className="dcs-caption site-body">
            Same scan. One version knows the model number, the other knows what
            to do with it.
          </figcaption>
        </figure>
      </Reveal>

      <section className="dcs-col dcs-block">
        <Reveal>
          <div className="site-body text-white/65">
            <p>
              Same handling of uncertainty. The model fills the form, the fields
              are editable on tap, and being wrong is cheap.
            </p>
            <p>
              <span className="dcs-em">
                Signal: the reuse is the part I am most pleased with. One
                pipeline, built once, now serving two different entry points into
                the same problem.
              </span>
            </p>
          </div>
        </Reveal>
      </section>


      {/* Report Processor */}
      <hr className="dcs-rule" />

      <section id="report" className="dcs-col dcs-block">
        <Reveal>
          <p className="dcs-heading site-subheading text-white">
            Report Processor
          </p>
          <figure className="dcs-img-block">
            <div className="dcs-media dcs-media-fit dcs-media-image">
              <LightboxImage
                src="/assets/home/domis-card1-tasks-composite.png"
                alt="Domis report processor: inspection report flows into Tasks Found"
                className="mx-auto h-auto w-full max-w-[320px] object-contain"
                draggable={false}
                hoverScale={1.02}
              />
            </div>
          </figure>
          <div className="site-body text-white/65">
            <p>
              Before any of the above, I went looking for what a homeowner
              already has. If information has to come from somewhere, the
              cheapest place is something already sitting in their possession.
            </p>
            <p>
              <strong className="text-white">
                The inspection report is universal.
              </strong>{" "}
              Every homeowner has one, because you cannot buy a house without it.
              It is also long, repetitive, and almost entirely unread.
            </p>
            <p>
              Interviews explained why.{" "}
              <strong className="text-white">
                People had been in their homes long enough that the report no
                longer described the house they were living in.
              </strong>{" "}
              Consulting it felt like reading about a stranger&rsquo;s property.
            </p>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <figure className="dcs-figure">
          <div className="dcs-media dcs-media-fit">
            <div className="dcs-affinity">
              <div className="dcs-cluster">
                <span className="dcs-ch">Report is stale</span>
                <div className="dcs-note">
                  &ldquo;That was six years ago. We redid the whole kitchen
                  since.&rdquo;
                </div>
                <div className="dcs-note">
                  &ldquo;Half of it&rsquo;s about problems we already fixed.&rdquo;
                </div>
                <div className="dcs-note dcs-fact">
                  Report age at interview: 4–11 yrs
                </div>
              </div>
              <div className="dcs-cluster">
                <span className="dcs-ch">Never re-read</span>
                <div className="dcs-note">
                  &ldquo;I think it&rsquo;s in a drawer. Maybe the garage.&rdquo;
                </div>
                <div className="dcs-note">
                  &ldquo;Read it once during closing. Never again.&rdquo;
                </div>
                <div className="dcs-note dcs-fact">
                  0 of 9 had opened it in the past year
                </div>
              </div>
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
                  There could be data but it&rsquo;s not interpretable
                </div>
              </div>
            </div>
          </div>
        </figure>
      </Reveal>

      <section className="dcs-col dcs-block">
        <Reveal>
          <div className="site-body text-white/65">
            <p>
              That changed what the feature should be.{" "}
              <strong className="text-white">
                Not a diagnostic that generates a to-do list, which would be
                wrong on arrival, but a way to understand the house:
              </strong>{" "}
              what the higher priority issues were, how they group together, what
              any of it means in plain language.
            </p>
            <p>
              This turned the inspection report into something that is actually
              made for the user, task and location based so they can understand
              it through their lens.
            </p>
            <p>
              So the report became something that sits in the app and stays
              there. The user pulls tasks from it if they want them, deletes what
              no longer applies, and everything is categorized where the rest of
              Domis can reach it. Optional by design, because a report from 2016
              has no business telling anyone what to do this weekend.
            </p>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <figure className="dcs-figure">
          <div className="dcs-media">
            <div className="dcs-io">
              <div className="dcs-in">
                <p className="dcs-lbl dcs-io-label">The user gives</p>
                <div className="dcs-dropzone">
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    style={{ marginBottom: 8 }}
                  >
                    <path
                      d="M6 2.5 H13.5 L18.5 7.5 V21.5 H6 Z"
                      stroke="#b6bac1"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13.5 2.5 V7.5 H18.5"
                      stroke="#b6bac1"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.5 12.5 H16 M8.5 15.5 H16 M8.5 18.5 H13"
                      stroke="#b6bac1"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p className="dcs-lbl" style={{ margin: 0 }}>
                    inspection.pdf
                  </p>
                  <p
                    className="dcs-lbl"
                    style={{ margin: "2px 0 0", color: "var(--dcs-mock-faint)" }}
                  >
                    64 pages
                  </p>
                </div>
              </div>

              <div className="dcs-io-arrow">
                <div className="dcs-stem" />
                <span className="dcs-mstep">Read</span>
                <div className="dcs-stem" />
                <span className="dcs-mstep">Group</span>
                <div className="dcs-stem" />
                <span className="dcs-mstep">Translate</span>
                <div className="dcs-stem" />
                <span className="dcs-tip">→</span>
              </div>

              <div className="dcs-out">
                <p className="dcs-lbl dcs-io-label">Domis returns</p>
                <div className="dcs-cats">
                  <div className="dcs-cat">
                    <span className="dcs-pill dcs-hi">High priority</span>
                    <p className="dcs-val" style={{ margin: "9px 0 0" }}>
                      Roof flashing, north side
                    </p>
                    <p className="dcs-lbl" style={{ margin: "2px 0 0" }}>
                      Water can get in where the roof meets the chimney.
                    </p>
                  </div>
                  <div className="dcs-cat">
                    <span className="dcs-pill">Monitor</span>
                    <p className="dcs-val" style={{ margin: "9px 0 0" }}>
                      Water heater, age
                    </p>
                    <p className="dcs-lbl" style={{ margin: "2px 0 0" }}>
                      Near the end of a typical lifespan. Not urgent.
                    </p>
                  </div>
                  <div className="dcs-cat">
                    <span className="dcs-pill">Dismissed</span>
                    <p
                      className="dcs-val"
                      style={{ margin: "9px 0 0", color: "var(--dcs-mock-muted)" }}
                    >
                      Kitchen GFCI outlets
                    </p>
                    <p className="dcs-lbl" style={{ margin: "2px 0 0" }}>
                      Already fixed. Removed by you, Mar 2025.
                    </p>
                  </div>
                  <p className="dcs-lbl" style={{ margin: "2px 0 0" }}>
                    Pull any of these into tasks. Or don&rsquo;t.
                  </p>
                </div>
              </div>
            </div>
            <PointerCursor className="dcs-rep-cursor" />
          </div>
          <figcaption className="dcs-caption site-body">
            One PDF in. From 64 pages of construction and real estate lingo to
            things you can actually comprehend.
          </figcaption>
        </figure>
      </Reveal>


      {/* Closing */}
      <hr className="dcs-rule" />

      <section id="more" className="dcs-col dcs-block">
        <Reveal>
          <p className="dcs-heading site-subheading text-white">
            And more!
          </p>
          <div className="site-body text-white/65">
            <p>
              There is more: a location-based recommendation system,
              multi-property management, multi-task preventative maintenance
              guides, and the design system all of it ships on. Domis is recently
              launched and rapidly updating.
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
    </div>
  );
}
