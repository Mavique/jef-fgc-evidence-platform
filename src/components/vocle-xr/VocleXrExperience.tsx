"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Reveal } from "@/components/MotionPrimitives";
import { VocleField } from "@/components/vocle-xr/VocleField";
import {
  contentComparison,
  evidenceInspector,
  journeyStages,
  loopSteps,
  missionControlViews,
  partnerPathways,
  pipeline,
  systems,
  twinDimensions,
  userModes,
  voclePositioning,
  wings
} from "@/content/vocle-xr";

function StatusTag({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-[#ffc86b] px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#111424]">
      {status.replaceAll("_", " ")}
    </span>
  );
}

function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#55e6d4] p-1.5 pl-6 text-sm font-bold text-[#111424] transition duration-700 ease-fluid hover:bg-[#ffc86b] active:scale-[0.98]" href={href}>
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-[#111424] text-paper transition duration-700 ease-fluid group-hover:translate-x-1">↗</span>
    </Link>
  );
}

function Choice({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className={`rounded-full px-4 py-3 text-left text-sm font-semibold transition duration-700 ease-fluid ${
        active ? "bg-[#55e6d4] text-[#111424]" : "bg-white/[0.065] text-paper ring-1 ring-white/[0.12] hover:bg-white/[0.1]"
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function VocleXrExperience() {
  const [loop, setLoop] = useState(loopSteps[0]);
  const [system, setSystem] = useState(systems[0]);
  const [wing, setWing] = useState(wings[0]);
  const [evidence, setEvidence] = useState(evidenceInspector[0]);
  const [mode, setMode] = useState(userModes[0]);
  const [partner, setPartner] = useState(partnerPathways[0]);

  const loopIndex = useMemo(() => loopSteps.findIndex((item) => item.name === loop.name), [loop]);
  const visibleJourney = useMemo(() => journeyStages.slice(0, Math.max(5, loopIndex + 5)), [loopIndex]);

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#080a16] text-paper">
      <section className="relative isolate min-h-[84dvh] overflow-hidden px-4 pb-16 pt-32 md:px-8">
        <div className="absolute inset-0">
          <VocleField />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(85,230,212,0.18),transparent_32%),radial-gradient(circle_at_22%_72%,rgba(109,107,255,0.22),transparent_32%),linear-gradient(180deg,rgba(8,10,22,0.12),rgba(8,10,22,0.97))]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,248,255,0.045)_1px,transparent_1px),linear-gradient(rgba(246,248,255,0.045)_1px,transparent_1px)] bg-[length:78px_78px] opacity-50" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(84dvh-7rem)] max-w-7xl content-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <StatusTag status={voclePositioning.status} />
              <span className="text-sm text-paper/[0.66]">Human educator primacy. Evidence before claims.</span>
            </div>
            <h1 className="max-w-[880px] font-display text-[clamp(2.75rem,5.7vw,6.15rem)] font-semibold leading-[0.88] tracking-[-0.065em]">
              <span className="block text-[#55e6d4]">{voclePositioning.name}</span>
              From immersive learning to verified human capability.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-paper/[0.74] md:text-2xl md:leading-10">{voclePositioning.description}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTA href="#loop">Follow the Cognitive Learning Loop</CTA>
              <Link className="inline-flex items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#learner">
                Explore a Learner Journey
              </Link>
              <Link className="inline-flex items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#partners">
                Design an Immersive Programme
              </Link>
            </div>
          </motion.div>

          <Reveal delay={0.12}>
            <div className="rounded-[2.2rem] bg-white/[0.06] p-1.5 ring-1 ring-white/[0.12]">
              <div className="relative min-h-[460px] overflow-hidden rounded-[1.7rem] bg-[#101326] p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)]">
                <div className="absolute inset-0 bg-[url('/images/xr/xr-medical-heart-learning.jpg')] bg-cover bg-center opacity-20 grayscale" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,19,38,0.25),rgba(16,19,38,0.94))]" />
                <div className="relative z-10 grid min-h-[400px] content-between gap-8">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#ffc86b]">Core doctrine</p>
                    <h2 className="mt-5 text-5xl font-semibold tracking-[-0.065em] md:text-7xl">Experience is not competence.</h2>
                  </div>
                  <div className="grid gap-3">
                    {[
                      "Observation is not evidence by default.",
                      "Evidence is not competence by itself.",
                      "AI inference is not human authority.",
                      "Adaptation must be explainable."
                    ].map((item, index) => (
                      <motion.div
                        className="rounded-[1.1rem] bg-white/[0.085] p-4 text-lg font-semibold ring-1 ring-white/[0.12]"
                        initial={false}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.5, delay: index * 0.055, ease: [0.16, 1, 0.3, 1] }}
                        key={item}
                      >
                        {item}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#080a16] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.8rem,6vw,7rem)] font-semibold leading-[0.84] tracking-[-0.07em]">Not an XR content library.</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
            {contentComparison.map((item, index) => (
              <Reveal delay={index * 0.08} key={item.name}>
                <article className={`h-full rounded-[2rem] p-1.5 ${index === 0 ? "bg-white/[0.055] ring-1 ring-white/[0.1]" : "bg-[#55e6d4] text-[#111424]"}`}>
                  <div className={`flex min-h-[320px] flex-col justify-between rounded-[1.55rem] p-7 ${index === 0 ? "bg-[#101326] text-paper" : "bg-[#55e6d4] text-[#111424]"}`}>
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-70">{item.stance}</p>
                      <h3 className="mt-6 text-5xl font-semibold tracking-[-0.065em]">{item.name}</h3>
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2">
                        {item.signals.map((signal) => (
                          <span className={`rounded-full px-3 py-2 text-sm font-semibold ${index === 0 ? "bg-white/[0.07] text-paper" : "bg-[#111424] text-paper"}`} key={signal}>
                            {signal}
                          </span>
                        ))}
                      </div>
                      <p className="mt-7 text-lg leading-8 opacity-75">{item.weakness}</p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="loop" className="bg-[#101326] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.84fr_1.16fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.8rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.065em]">Follow Thabo's first loop.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-paper/[0.64]">
              The no-start diagnostic story is an MVP specification until the end-to-end build is demonstrated and validated.
            </p>
            <div className="mt-8 grid gap-3">
              {loopSteps.map((item) => (
                <Choice active={item.name === loop.name} onClick={() => setLoop(item)} key={item.name}>
                  {item.name}
                </Choice>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[2.2rem] bg-white/[0.055] p-1.5 ring-1 ring-white/[0.1]">
              <div className="rounded-[1.7rem] bg-[#080a16] p-8">
                <StatusTag status={loopIndex < 2 ? "mvp_specification" : "adopted_architecture"} />
                <h3 className="mt-8 text-5xl font-semibold tracking-[-0.065em]">{loop.name}</h3>
                <div className="mt-8 grid gap-4">
                  <p className="rounded-[1rem] bg-white/[0.06] p-5 text-paper/[0.72]">What happened: {loop.happened}</p>
                  <p className="rounded-[1rem] bg-white/[0.06] p-5 text-paper/[0.72]">What was observed: {loop.observed}</p>
                  <p className="rounded-[1rem] bg-white/[0.06] p-5 text-paper/[0.72]">Evidence rule: {loop.evidence}</p>
                  <p className="rounded-[1rem] bg-[#55e6d4] p-5 font-semibold text-[#111424]">Next experience: {loop.next}</p>
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#080a16] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.8rem,6vw,7rem)] font-semibold leading-[0.84] tracking-[-0.07em]">Who owns what?</h2>
          </Reveal>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-3 sm:grid-cols-2">
              {systems.map((item) => (
                <button
                  className={`min-h-36 rounded-[1.35rem] p-5 text-left transition duration-700 ease-fluid ${item[0] === system[0] ? "bg-[#ffc86b] text-[#111424]" : "bg-white/[0.055] text-paper ring-1 ring-white/[0.1] hover:bg-white/[0.09]"}`}
                  type="button"
                  onClick={() => setSystem(item)}
                  key={item[0]}
                >
                  <span className="font-mono text-xs uppercase tracking-[0.16em] opacity-70">{item[1]}</span>
                  <span className="mt-5 block text-3xl font-semibold tracking-[-0.055em]">{item[0]}</span>
                </button>
              ))}
            </div>
            <Reveal delay={0.1}>
              <article className="rounded-[2rem] bg-white/[0.055] p-7 ring-1 ring-white/[0.1]">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#55e6d4]">{system[1]}</p>
                <h3 className="mt-5 text-5xl font-semibold tracking-[-0.065em]">{system[0]}</h3>
                <p className="mt-6 text-lg leading-8 text-paper/[0.68]">{system[2]}</p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-[#101326] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.78fr_1.22fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.8rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.065em]">Evidence lenses, not autonomous judges.</h2>
            <div className="mt-8 grid gap-3">
              {wings.map((item) => (
                <Choice active={item[0] === wing[0]} onClick={() => setWing(item)} key={item[0]}>
                  {item[0]}
                </Choice>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[2.2rem] bg-[#55e6d4] p-8 text-[#111424]">
              <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-70">{wing[1]}</p>
              <h3 className="mt-6 text-6xl font-semibold tracking-[-0.07em]">{wing[0]}</h3>
              <p className="mt-7 text-2xl leading-9">{wing[2]}</p>
              <p className="mt-8 rounded-[1.2rem] bg-[#111424] p-5 text-lg leading-8 text-paper">
                Lens rule: this lens contributes bounded evidence. It does not replace lecturer judgement or institutional assessment.
              </p>
            </article>
          </Reveal>
        </div>
      </section>

      <section id="learner" className="bg-[#080a16] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.8rem,6vw,7rem)] font-semibold leading-[0.84] tracking-[-0.07em]">The Twin is revisable.</h2>
          </Reveal>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2.2rem] bg-paper p-7 text-[#111424]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-5xl font-semibold tracking-[-0.065em]">Living Capability Twin</h3>
                <span className="rounded-full bg-[#111424] px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-paper">Prototype</span>
              </div>
              <div className="mt-10 grid gap-3">
                {twinDimensions.map((item, index) => (
                  <motion.div
                    className="rounded-[1rem] bg-[#111424] p-4 text-paper"
                    initial={false}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5, delay: index * 0.045, ease: [0.16, 1, 0.3, 1] }}
                    key={item.name}
                  >
                    <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#ffc86b]">{item.state}</span>
                    <p className="mt-2 text-xl font-semibold">{item.name}</p>
                    <p className="mt-2 text-sm leading-6 text-paper/[0.65]">{item.note}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="grid content-start gap-3">
              {evidenceInspector.map((item) => (
                <button
                  className={`rounded-[1.3rem] p-5 text-left transition duration-700 ease-fluid ${item.observation === evidence.observation ? "bg-[#ffc86b] text-[#111424]" : "bg-white/[0.055] text-paper ring-1 ring-white/[0.1] hover:bg-white/[0.09]"}`}
                  type="button"
                  onClick={() => setEvidence(item)}
                  key={item.observation}
                >
                  <span className="font-mono text-xs uppercase tracking-[0.16em] opacity-70">{item.value}</span>
                  <span className="mt-3 block text-lg font-semibold">{item.observation}</span>
                </button>
              ))}
              <div className="rounded-[1.3rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#55e6d4]">Evidence inspector</p>
                <p className="mt-4 text-lg leading-8 text-paper/[0.68]">{evidence.explanation}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#101326] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.8rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.065em]">Lecturer Mission Control is primary.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-paper/[0.64]">
              The lecturer remains curriculum authority, intervention lead and deliberative assessor inside approved institutional processes.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid gap-3 sm:grid-cols-2">
              {missionControlViews.map((item) => (
                <span className="rounded-[1.15rem] bg-white/[0.065] p-5 text-lg font-semibold ring-1 ring-white/[0.1]" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#080a16] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.8rem,6vw,7rem)] font-semibold leading-[0.84] tracking-[-0.07em]">Academic life and career life stay distinct.</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="rounded-[2rem] bg-[#ffc86b] p-7 text-[#111424]">
              <h3 className="text-4xl font-semibold tracking-[-0.055em]">Formal Academic Life</h3>
              <p className="mt-5 text-lg leading-8 opacity-75">Institution-bound programmes, curriculum, assessment, academic calendars and approved qualifications.</p>
            </div>
            <div className="rounded-[2rem] bg-[#55e6d4] p-7 text-[#111424]">
              <h3 className="text-4xl font-semibold tracking-[-0.055em]">Persistent Developmental Career Life</h3>
              <p className="mt-5 text-lg leading-8 opacity-75">Capability development continues with consent, governance, evidence history and career recommendations after institutional periods end.</p>
            </div>
          </div>
          <div className="mt-6 flex gap-3 overflow-x-auto pb-4 [scrollbar-width:none]">
            {visibleJourney.map((item) => (
              <span className="min-w-[240px] rounded-[1.2rem] bg-white/[0.06] p-5 text-lg font-semibold ring-1 ring-white/[0.1]" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="partners" className="bg-[#101326] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.8rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.065em]">Curriculum becomes experience through governance.</h2>
            <div className="mt-8 flex flex-wrap gap-2">
              {pipeline.map((item) => (
                <span className="rounded-full bg-white/[0.07] px-4 py-3 text-sm font-semibold ring-1 ring-white/[0.1]" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[2.2rem] bg-[#ffc86b] p-8 text-[#111424]">
              <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-70">Institutional pathway</p>
              <h3 className="mt-6 text-5xl font-semibold tracking-[-0.065em]">{mode[0]}</h3>
              <p className="mt-5 text-xl leading-9 opacity-80">{mode[1]}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {userModes.map((item) => (
                  <button className={`rounded-[1rem] p-4 text-left text-sm font-bold transition duration-700 ease-fluid ${item[0] === mode[0] ? "bg-[#111424] text-paper" : "bg-white/35 text-[#111424] hover:bg-white/55"}`} type="button" onClick={() => setMode(item)} key={item[0]}>
                    {item[0]}
                  </button>
                ))}
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {partnerPathways.map((item) => (
                  <button className={`rounded-[1rem] p-4 text-left text-sm font-bold transition duration-700 ease-fluid ${item === partner ? "bg-[#111424] text-paper" : "bg-white/35 text-[#111424] hover:bg-white/55"}`} type="button" onClick={() => setPartner(item)} key={item}>
                    {item}
                  </button>
                ))}
              </div>
              <p className="mt-8 rounded-[1.2rem] bg-[#111424] p-5 text-lg leading-8 text-paper">
                Selected action: {partner}. JEF should verify curriculum approval, data governance, accessibility, partner permissions and build status before publishing outcomes.
              </p>
            </article>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
