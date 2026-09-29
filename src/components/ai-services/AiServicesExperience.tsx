"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { Reveal } from "@/components/MotionPrimitives";
import { AiServicesField } from "@/components/ai-services/AiServicesField";
import {
  agentTrace,
  aiServicesPositioning,
  aiTruths,
  ecosystemMap,
  evaluationAreas,
  implementationPhases,
  interventionLevels,
  knowledgeInspector,
  readinessDimensions,
  serviceDomains,
  workbenchSteps
} from "@/content/ai-services";
import { xrMedia } from "@/content/xr-media";

const aiImage = xrMedia.industrialDataXrWorker;
const skillsImage = xrMedia.jefDigitalClassroomSession;

function StatusTag({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full bg-amber px-3 py-1 font-mono text-[0.64rem] font-bold uppercase tracking-[0.15em] text-ink">
      {children.replaceAll("_", " ")}
    </span>
  );
}

function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-cyan p-1.5 pl-6 text-sm font-bold text-ink transition duration-700 ease-fluid hover:bg-lime active:scale-[0.98]" href={href}>
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-ink text-paper transition duration-700 ease-fluid group-hover:translate-x-1">↗</span>
    </Link>
  );
}

function ChoiceButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className={`min-h-11 rounded-full px-4 py-3 text-left text-sm font-semibold transition duration-700 ease-fluid ${
        active ? "bg-cyan text-ink" : "bg-white/[0.065] text-paper ring-1 ring-white/[0.12] hover:bg-white/[0.11]"
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function AiServicesExperience() {
  const [step, setStep] = useState(workbenchSteps[0]);
  const [level, setLevel] = useState(interventionLevels[2]);
  const [readiness, setReadiness] = useState(readinessDimensions[0]);
  const [source, setSource] = useState(knowledgeInspector[0]);
  const [trace, setTrace] = useState(agentTrace[0]);

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-ink text-paper">
      <section className="relative isolate min-h-[84dvh] overflow-hidden px-4 pb-16 pt-36 md:px-8 md:pt-32">
        <div className="absolute inset-0">
          <AiServicesField />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,13,1)_0%,rgba(5,8,13,0.82)_46%,rgba(5,8,13,0.28)_100%),linear-gradient(180deg,rgba(5,8,13,0.12),rgba(5,8,13,1))]" />
          <div className="tech-grid opacity-35" />
          <div className="grain opacity-25" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(84dvh-7rem)] max-w-7xl content-center gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <StatusTag>{aiServicesPositioning.status}</StatusTag>
              <span className="text-sm text-paper/[0.68]">Problem-led AI. Human oversight visible. Evidence before scale.</span>
            </div>
            <h1 className="max-w-[1060px] font-display text-[clamp(3.1rem,6.4vw,7.2rem)] font-semibold leading-[0.86] tracking-[-0.066em]">
              <span className="block text-cyan">{aiServicesPositioning.name}</span>
              Turn AI potential into work that performs.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-paper/[0.76] md:text-2xl md:leading-10">{aiServicesPositioning.description}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTA href="#workbench">Design an AI-enabled workflow</CTA>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#readiness">
                Assess AI readiness
              </Link>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#governance">
                Inspect governance controls
              </Link>
            </div>
          </motion.div>

          <Reveal delay={0.12}>
            <div className="rounded-[1.55rem] border border-white/[0.12] bg-white/[0.055] p-1">
              <div className="relative min-h-[460px] overflow-hidden rounded-[1.25rem] bg-surface p-6">
                <Image alt="Professional using AI assisted work systems" className="object-cover opacity-38 saturate-[0.85]" fill priority sizes="(min-width: 1024px) 42vw, 100vw" src={aiImage} />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,15,24,0.16),rgba(9,15,24,0.95))]" />
                <div className="relative z-10 flex min-h-[400px] flex-col justify-between gap-10">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber">Intelligence workbench</p>
                    <h2 className="mt-5 max-w-2xl text-5xl font-semibold tracking-[-0.065em] md:text-7xl">AI works when the work is redesigned.</h2>
                  </div>
                  <div className="grid gap-3">
                    {aiTruths.slice(0, 4).map((item, index) => (
                      <motion.div
                        className="rounded-[1rem] bg-white/[0.1] p-4 text-lg font-semibold ring-1 ring-white/[0.12]"
                        initial={false}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ duration: 0.48, delay: index * 0.055, ease: [0.16, 1, 0.3, 1] }}
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

      <section className="bg-ink px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Not a catalogue of fashionable tools.</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {[
              ["AI Services is", "A problem-led transformation and implementation capability that connects trusted foundations, human capability, appropriate autonomy, operations and evidence."],
              ["AI Services is not", "A chatbot animation, an agent for every task, indiscriminate automation, vendor lock-in or a prototype presented as production."]
            ].map(([title, body], index) => (
              <Reveal className={`rounded-[1.55rem] p-1 ${index === 0 ? "bg-cyan" : "bg-white/[0.07]"}`} delay={index * 0.08} key={title}>
                <article className={`min-h-[320px] rounded-[1.25rem] p-7 ${index === 0 ? "bg-cyan text-ink" : "bg-surface text-paper"}`}>
                  <span className="font-mono text-xs uppercase tracking-[0.18em] opacity-65">{index === 0 ? "Transformation system" : "Evidence boundary"}</span>
                  <h3 className="mt-8 text-5xl font-semibold tracking-[-0.06em]">{title}</h3>
                  <p className="mt-8 text-xl leading-9 opacity-75">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="workbench" className="bg-surface px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.78fr_1.22fr]">
          <Reveal>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-cyan">Problem to intervention navigator</p>
            <h2 className="font-display text-[clamp(2.65rem,5.6vw,6.2rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Begin with the work, not the model.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-paper/[0.68]">
              The visitor follows a real request through outcome, friction, foundations, intervention, oversight and evidence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {workbenchSteps.map((item) => (
                <ChoiceButton active={item[0] === step[0]} onClick={() => setStep(item)} key={item[0]}>
                  {item[0]}
                </ChoiceButton>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[1.55rem] bg-cyan p-8 text-ink">
              <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-65">Active workbench layer</p>
              <h3 className="mt-6 text-6xl font-semibold tracking-[-0.07em]">{step[0]}</h3>
              <p className="mt-8 text-2xl leading-9">{step[1]}</p>
              <p className="mt-8 rounded-[1rem] bg-ink p-5 text-lg leading-8 text-paper">The safest recommendation may be a non-AI fix, a better process, a knowledge base or a trained person with clearer responsibility.</p>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-ink px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Twelve domains form one intelligence operating system.</h2>
            <p className="max-w-2xl text-lg leading-8 text-paper/[0.68]">
              JEF AI Services is vendor-aware but not vendor-defined. The work moves through strategy, foundations, implementation, governance, adoption and managed improvement.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {serviceDomains.map(([title, body], index) => (
              <Reveal delay={index * 0.035} key={title}>
                <article className="flex min-h-64 flex-col justify-between rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5">
                  <span className="font-mono text-xs text-cyan">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-3xl font-semibold tracking-[-0.05em]">{title}</h3>
                    <p className="mt-4 text-sm leading-6 text-paper/[0.66]">{body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-lime">Autonomy boundary designer</p>
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Do not present all AI systems as equivalent.</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {interventionLevels.map((item) => (
                <ChoiceButton active={item.mode === level.mode} onClick={() => setLevel(item)} key={item.mode}>
                  {item.mode}
                </ChoiceButton>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[1.55rem] bg-lime p-8 text-ink">
              <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-65">{level.level}</p>
              <h3 className="mt-6 text-6xl font-semibold tracking-[-0.07em]">{level.mode}</h3>
              <p className="mt-8 text-2xl leading-9">{level.role}</p>
              <div className="mt-8 grid gap-3">
                <p className="rounded-[1rem] bg-ink p-5 text-paper">Controls: {level.controls}</p>
                <p className="rounded-[1rem] bg-white p-5 font-semibold text-ink">Boundary: {level.risk}</p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section id="readiness" className="bg-ink px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Readiness is a set of conditions, not one percentage.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-paper/[0.68]">The explorer shows blockers and dependencies before a prototype is treated as deployable.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {readinessDimensions.map((item) => (
                <ChoiceButton active={item.name === readiness.name} onClick={() => setReadiness(item)} key={item.name}>
                  {item.name}
                </ChoiceButton>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[1.55rem] bg-amber p-8 text-ink">
              <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-65">Readiness state: {readiness.state}</p>
              <h3 className="mt-6 text-5xl font-semibold tracking-[-0.065em] md:text-6xl">{readiness.name}</h3>
              <p className="mt-8 text-2xl leading-9">{readiness.checks}</p>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-paper px-4 py-20 text-ink md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Inspect the answer before you trust it.</h2>
            <p className="max-w-2xl text-lg leading-8 text-slate-700">
              A governed knowledge system reveals sources, permissions, uncertainty, contradictions and reviewer requirements. Retrieval alone does not guarantee correctness.
            </p>
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-3">
            {knowledgeInspector.map((item) => (
              <button
                className={`min-h-11 rounded-full px-4 py-3 text-left text-sm font-semibold transition duration-700 ease-fluid ${item[0] === source[0] ? "bg-ink text-paper" : "bg-white text-ink hover:bg-cyan/20"}`}
                type="button"
                onClick={() => setSource(item)}
                key={item[0]}
              >
                {item[0]}
              </button>
            ))}
          </div>
          <Reveal delay={0.08}>
            <article className="relative mt-10 min-h-[460px] overflow-hidden rounded-[1.55rem] bg-ink p-7 text-paper">
              <Image alt="Team reviewing AI assisted digital work" className="object-cover opacity-28 saturate-[0.8]" fill sizes="100vw" src={skillsImage} />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,13,0.1),rgba(5,8,13,0.95))]" />
              <div className="relative z-10 flex min-h-[340px] flex-col justify-end">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber">Knowledge answer inspector</p>
                <h3 className="mt-5 max-w-3xl text-6xl font-semibold tracking-[-0.07em]">{source[0]}</h3>
                <p className="mt-6 max-w-3xl text-xl leading-9 text-paper/[0.76]">{source[1]}</p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">See an agent act responsibly.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-paper/[0.68]">The agent is not an infallible employee. It is a bounded system with identity, permissions, approval, logs, exceptions and shutdown criteria.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {agentTrace.map((item) => (
                <ChoiceButton active={item[0] === trace[0]} onClick={() => setTrace(item)} key={item[0]}>
                  {item[0]}
                </ChoiceButton>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[1.55rem] border border-white/[0.1] bg-white/[0.055] p-7">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Agent action simulator</p>
              <h3 className="mt-6 text-6xl font-semibold tracking-[-0.07em]">{trace[0]}</h3>
              <p className="mt-8 text-2xl leading-9 text-paper/[0.76]">{trace[1]}</p>
              <div className="mt-10 grid gap-3 md:grid-cols-3">
                {["Least privilege", "Human approval", "Kill switch"].map((item) => (
                  <span className="rounded-[1rem] bg-ink p-5 text-sm font-bold text-cyan ring-1 ring-white/[0.08]" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-ink px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Twelve phases from experiment to governed operation.</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {implementationPhases.map(([title, body], index) => (
              <Reveal delay={index * 0.035} key={title}>
                <article className="min-h-56 rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5">
                  <span className="font-mono text-xs text-amber">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-8 text-3xl font-semibold tracking-[-0.05em]">{title}</h3>
                  <p className="mt-4 text-sm leading-6 text-paper/[0.66]">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="governance" className="bg-surface px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <Reveal>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-cyan">Evaluation and assurance</p>
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">One demo does not establish reliability.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-paper/[0.68]">{aiServicesPositioning.caution}</p>
          </Reveal>
          <div className="grid gap-4">
            {evaluationAreas.map(([title, body], index) => (
              <Reveal delay={index * 0.045} key={title}>
                <article className="grid gap-4 rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5 md:grid-cols-[0.16fr_0.32fr_0.52fr] md:items-center">
                  <span className="font-mono text-xs text-cyan">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="text-2xl font-semibold tracking-[-0.045em]">{title}</h3>
                  <p className="leading-7 text-paper/[0.66]">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Connected to the JEF ecosystem.</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {ecosystemMap.map(([title, body], index) => (
              <Reveal delay={index * 0.04} key={title}>
                <article className="flex min-h-60 flex-col justify-between rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5">
                  <span className="font-mono text-xs text-lime">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-3xl font-semibold tracking-[-0.05em]">{title}</h3>
                    <p className="mt-4 text-sm leading-6 text-paper/[0.66]">{body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cyan px-4 py-20 text-ink md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <h2 className="max-w-6xl font-display text-[clamp(3rem,7vw,7.7rem)] font-semibold leading-[0.84] tracking-[-0.07em]">
              Design the work. Govern the intelligence. Measure the value.
            </h2>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-6 py-4 text-sm font-bold text-paper transition duration-700 ease-fluid hover:bg-surface" href="/contact">
                Bring a workflow challenge
              </Link>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-4 text-sm font-bold text-ink transition duration-700 ease-fluid hover:bg-paper" href="/programmes">
                Explore JEF programmes
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
