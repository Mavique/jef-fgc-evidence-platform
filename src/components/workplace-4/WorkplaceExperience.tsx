"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/MotionPrimitives";
import { WorkplaceField } from "@/components/workplace-4/WorkplaceField";
import {
  academies,
  allocationModes,
  ecosystemConnections,
  evidenceStates,
  frictionPoints,
  operatingDomains,
  safeguards,
  smartWorkerJourney,
  transformationPhases,
  workplacePositioning
} from "@/content/workplace-4";

function StatusTag({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full bg-[#4cecff] px-3 py-1 font-mono text-[0.64rem] font-bold uppercase tracking-[0.15em] text-[#090d12]">
      {children.replaceAll("_", " ")}
    </span>
  );
}

function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#4cecff] p-1.5 pl-6 text-sm font-bold text-[#090d12] transition duration-700 ease-fluid hover:bg-[#ffc45a] active:scale-[0.98]" href={href}>
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-[#090d12] text-[#f8fbff] transition duration-700 ease-fluid group-hover:translate-x-1">›</span>
    </Link>
  );
}

function ChoiceButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className={`rounded-full px-4 py-3 text-left text-sm font-semibold transition duration-700 ease-fluid ${
        active ? "bg-[#4cecff] text-[#090d12]" : "bg-white/[0.06] text-[#f8fbff] ring-1 ring-white/[0.12] hover:bg-white/[0.1]"
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function WorkplaceExperience() {
  const [friction, setFriction] = useState(frictionPoints[0]);
  const [domain, setDomain] = useState(operatingDomains[1]);
  const [workerStep, setWorkerStep] = useState(smartWorkerJourney[0]);
  const [phase, setPhase] = useState(transformationPhases[0]);
  const reduce = useReducedMotion();

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#090d12] text-[#f8fbff]">
      <section className="relative isolate min-h-[100dvh] overflow-hidden px-4 pb-16 pt-36 md:px-8 md:pt-32">
        <div className="absolute inset-0">
          <WorkplaceField />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(76,236,255,0.16),transparent_31%),radial-gradient(circle_at_22%_78%,rgba(158,130,255,0.13),transparent_30%),linear-gradient(180deg,rgba(9,13,18,0.14),rgba(9,13,18,0.98))]" />
          <div className="tech-grid opacity-38" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#090d12] to-transparent" />
        </div>
        <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-8rem)] max-w-7xl content-center gap-10 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
          <motion.div
            initial={reduce ? false : { opacity: 0.72, y: 28, filter: "blur(5px)" }}
            animate={reduce ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <StatusTag>{workplacePositioning.status}</StatusTag>
              <span className="text-sm text-[#f8fbff]/[0.66]">Deployments, outcomes and client claims require verification.</span>
            </div>
            <h1 className="max-w-[1040px] font-display text-[clamp(3.1rem,6.2vw,6.9rem)] font-semibold leading-[0.88] tracking-[-0.066em]">
              <span className="block text-[#4cecff]">Workplace 4.0</span>
              transform the way work works.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-[#f8fbff]/[0.74] md:text-2xl md:leading-10">
              Redesign real work around capable people, responsible AI, better workflows and measurable improvement.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTA href="#friction">Explore a work transformation</CTA>
              <Link className="inline-flex items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-[#f8fbff] ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#domains">
                Assess your workplace
              </Link>
              <Link className="inline-flex items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-[#f8fbff] ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#safeguards">
                See worker safeguards
              </Link>
            </div>
          </motion.div>

          <Reveal delay={0.12}>
            <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.06] p-1.5 ring-1 ring-white/[0.12]">
              <div className="relative min-h-[520px] overflow-hidden rounded-[1.55rem] bg-[#111821] p-6">
                <div className="absolute inset-0 bg-[url('/images/xr/industrial-mr-technician-close.jpg')] bg-cover bg-center opacity-20 grayscale" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(76,236,255,0.08)_1px,transparent_1px),linear-gradient(rgba(76,236,255,0.08)_1px,transparent_1px)] bg-[length:58px_58px]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,33,0.2),rgba(17,24,33,0.94))]" />
                <div className="relative z-10 flex h-full flex-col justify-between gap-9">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#ffc45a]">The Living Workplace</p>
                    <h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.058em] md:text-6xl">Friction becomes visible before technology is added.</h2>
                  </div>
                  <div className="grid gap-3">
                    {["Work", "Friction", "Capability", "AI boundary", "Safeguard", "Evidence"].map((item, index) => (
                      <motion.div
                        className={`flex items-center justify-between rounded-[1rem] p-4 ring-1 ${
                          index === 0 ? "bg-[#f8fbff] text-[#090d12] ring-[#f8fbff]" : index === 3 ? "bg-[#ffc45a] text-[#090d12] ring-[#ffc45a]" : index === 5 ? "bg-[#70f26d] text-[#090d12] ring-[#70f26d]" : "bg-white/[0.07] text-[#f8fbff] ring-white/[0.12]"
                        }`}
                        initial={reduce ? false : { opacity: 0, x: -22 }}
                        whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ duration: 0.54, delay: index * 0.055, ease: [0.16, 1, 0.3, 1] }}
                        key={item}
                      >
                        <span className="font-semibold">{item}</span>
                        <span className="font-mono text-xs opacity-70">{String(index + 1).padStart(2, "0")}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="friction" className="bg-[#090d12] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.5rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Why work needs redesign.</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#f8fbff]/[0.66]">Select a friction point. The intervention begins with work, not software.</p>
            <div className="mt-9 grid gap-3">
              {frictionPoints.map((item) => (
                <ChoiceButton active={item[0] === friction[0]} onClick={() => setFriction(item)} key={item[0]}>
                  {item[0]}
                </ChoiceButton>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="rounded-[2rem] bg-[#ffc45a] p-1.5 text-[#090d12]">
              <div className="grid min-h-[560px] gap-8 rounded-[1.55rem] bg-[#ffc45a] p-7 md:grid-cols-[0.9fr_1.1fr] md:p-9">
                <div className="flex flex-col justify-between gap-10">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.16em] opacity-70">Illustrative workflow</p>
                    <h3 className="mt-5 text-5xl font-semibold tracking-[-0.064em] md:text-7xl">{friction[0]}</h3>
                    <p className="mt-6 text-lg leading-8 opacity-78">{friction[1]}</p>
                  </div>
                  <div className="rounded-[1.15rem] bg-[#090d12] p-5 text-[#f8fbff]">
                    <p className="font-semibold text-[#4cecff]">Redesign principle</p>
                    <p className="mt-3 text-lg leading-8 text-[#f8fbff]/[0.72]">Remove waste, clarify responsibility, build capability, then introduce technology where it solves the real work problem.</p>
                  </div>
                </div>
                <div className="grid content-end gap-3">
                  {["What was removed", "What the worker learned", "What remains human", "What measure should change"].map((item, index) => (
                    <div className="rounded-[1.05rem] bg-[#090d12] p-5 text-[#f8fbff]" key={item}>
                      <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                      <h4 className="mt-2 text-xl font-semibold tracking-[-0.045em]">{item}</h4>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section id="domains" className="bg-[#121a24] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.76fr_1.24fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Explore the Workplace Operating System.</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#f8fbff]/[0.66]">Twelve domains work together. If one factor collapses, transformation value collapses.</p>
            <div className="mt-9 grid gap-3">
              {operatingDomains.slice(0, 7).map((item) => (
                <ChoiceButton active={item[0] === domain[0]} onClick={() => setDomain(item)} key={item[0]}>
                  {item[0]}
                </ChoiceButton>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="rounded-[2rem] bg-[#4cecff] p-1.5 text-[#090d12]">
              <div className="grid min-h-[610px] gap-8 rounded-[1.55rem] bg-[#4cecff] p-7 md:grid-cols-[0.9fr_1.1fr] md:p-9">
                <div className="flex flex-col justify-between gap-10">
                  <div>
                    <StatusTag>core_methodology</StatusTag>
                    <h3 className="mt-7 text-5xl font-semibold tracking-[-0.064em] md:text-7xl">{domain[0]}</h3>
                    <p className="mt-6 text-lg leading-8 opacity-78">{domain[1]}</p>
                  </div>
                  <div className="rounded-[1.15rem] bg-[#090d12] p-5 text-[#f8fbff]">
                    <p className="font-semibold text-[#ffc45a]">Evidence to collect</p>
                    <p className="mt-3 text-lg leading-8 text-[#f8fbff]/[0.72]">Baseline, affected roles, adoption behaviour, worker experience, quality, risk and outcome change.</p>
                  </div>
                </div>
                <div className="grid max-h-[610px] gap-3 overflow-y-auto pr-1">
                  {operatingDomains.map((item, index) => (
                    <button className={`rounded-[1rem] p-4 text-left transition duration-700 ease-fluid ${item[0] === domain[0] ? "bg-[#090d12] text-[#f8fbff]" : "bg-[#090d12]/[0.13] text-[#090d12] hover:bg-[#090d12]/[0.2]"}`} type="button" onClick={() => setDomain(item)} key={item[0]}>
                      <span className="font-mono text-xs opacity-65">{String(index + 1).padStart(2, "0")}</span>
                      <span className="mt-2 block text-2xl font-semibold tracking-[-0.05em]">{item[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#effcff] px-4 py-24 text-[#090d12] md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Meet the Smart Worker.</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 opacity-74">Capability is demonstrated through behaviour, workflow evidence and improved practice, not attendance alone.</p>
            <div className="mt-9 grid gap-3">
              {smartWorkerJourney.map((item) => (
                <button className={`rounded-full px-4 py-3 text-left text-sm font-semibold transition duration-700 ease-fluid ${item[0] === workerStep[0] ? "bg-[#090d12] text-[#f8fbff]" : "bg-white text-[#090d12] hover:bg-[#dff9ff]"}`} type="button" onClick={() => setWorkerStep(item)} key={item[0]}>
                  {item[0]}
                </button>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="rounded-[2rem] bg-[#9e82ff] p-8">
              <p className="font-mono text-xs uppercase tracking-[0.16em] opacity-65">Smart Worker path</p>
              <h3 className="mt-5 text-6xl font-semibold tracking-[-0.066em]">{workerStep[0]}</h3>
              <p className="mt-7 max-w-2xl text-xl leading-9 opacity-75">{workerStep[1]}</p>
              <div className="mt-10 grid gap-3 md:grid-cols-2">
                {academies.slice(0, 8).map((item, index) => (
                  <div className="rounded-[1rem] bg-[#090d12] p-4 text-[#f8fbff]" key={item}>
                    <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                    <h4 className="mt-3 text-xl font-semibold tracking-[-0.045em]">{item}</h4>
                  </div>
                ))}
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#090d12] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Human-AI work is designed by task, risk and context.</h2>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-5">
            {allocationModes.map(([title, body], index) => (
              <Reveal className={`min-h-[300px] rounded-[1.45rem] p-5 ${index === 1 ? "bg-[#4cecff] text-[#090d12]" : index === 4 ? "bg-[#ffc45a] text-[#090d12]" : "bg-white/[0.06] text-[#f8fbff] ring-1 ring-white/[0.1]"}`} key={title}>
                <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-14 text-3xl font-semibold tracking-[-0.055em]">{title}</h3>
                <p className="mt-4 text-sm leading-6 opacity-70">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#121a24] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.74fr_1.26fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Follow the transformation journey.</h2>
            <div className="mt-9 grid gap-3">
              {transformationPhases.slice(0, 7).map((item) => (
                <ChoiceButton active={item[0] === phase[0]} onClick={() => setPhase(item)} key={item[0]}>
                  {item[0]}
                </ChoiceButton>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="rounded-[2rem] bg-[#70f26d] p-1.5 text-[#090d12]">
              <div className="grid min-h-[560px] gap-8 rounded-[1.55rem] bg-[#70f26d] p-7 md:grid-cols-[0.9fr_1.1fr] md:p-9">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.16em] opacity-70">Organisational phase</p>
                  <h3 className="mt-5 text-6xl font-semibold tracking-[-0.066em]">{phase[0]}</h3>
                  <p className="mt-7 max-w-2xl text-xl leading-9 opacity-75">{phase[1]}</p>
                </div>
                <div className="grid content-end gap-3">
                  {transformationPhases.map((item, index) => (
                    <button className={`rounded-[1rem] p-4 text-left transition duration-700 ease-fluid ${item[0] === phase[0] ? "bg-[#090d12] text-[#f8fbff]" : "bg-[#090d12]/[0.13] text-[#090d12] hover:bg-[#090d12]/[0.2]"}`} type="button" onClick={() => setPhase(item)} key={item[0]}>
                      <span className="font-mono text-xs opacity-65">{String(index + 1).padStart(2, "0")}</span>
                      <span className="ml-3 font-semibold">{item[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section id="safeguards" className="bg-[#effcff] px-4 py-24 text-[#090d12] md:px-8 md:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Protect people and trust.</h2>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {safeguards.map(([title, body], index) => (
              <Reveal className={`min-h-[250px] rounded-[1.35rem] p-5 ${index === 1 ? "bg-[#ffc45a]" : index === 3 ? "bg-[#4cecff]" : "bg-white"}`} key={title}>
                <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-12 text-3xl font-semibold tracking-[-0.055em]">{title}</h3>
                <p className="mt-4 text-sm leading-6 opacity-70">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#090d12] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Measure what changes, and label the evidence state.</h2>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {evidenceStates.map(([title, body], index) => (
              <Reveal className={`min-h-[220px] rounded-[1.35rem] p-5 ${index === 4 ? "bg-[#70f26d] text-[#090d12]" : index === 5 ? "bg-[#ffc45a] text-[#090d12]" : "bg-white/[0.06] text-[#f8fbff] ring-1 ring-white/[0.1]"}`} key={title}>
                <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-12 text-3xl font-semibold tracking-[-0.055em]">{title}</h3>
                <p className="mt-4 text-sm leading-6 opacity-70">{body}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {ecosystemConnections.map(([title, body], index) => (
              <Reveal className={`min-h-[210px] rounded-[1.25rem] p-5 ${index === 0 || index === 6 ? "bg-[#4cecff] text-[#090d12]" : "bg-white/[0.06] text-[#f8fbff] ring-1 ring-white/[0.1]"}`} key={title}>
                <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-10 text-2xl font-semibold tracking-[-0.05em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 opacity-70">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
