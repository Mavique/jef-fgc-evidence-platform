"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SpatialField } from "@/components/SpatialField";
import { Reveal } from "@/components/MotionPrimitives";
import {
  dxhubPositioning,
  ecosystemConnections,
  evidenceLevels,
  fragmentedNodes,
  journeys,
  networkNodes,
  partnershipOptions,
  stakeholders,
  studios,
  transformationLoop,
  useCases
} from "@/content/dxhub";

function StatusTag({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-white/[0.08] px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-lime ring-1 ring-white/[0.12]">
      {status.replaceAll("_", " ")}
    </span>
  );
}

function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="group inline-flex items-center gap-3 rounded-full bg-cyan p-1.5 pl-6 text-sm font-bold text-ink transition duration-700 ease-fluid hover:bg-lime active:scale-[0.98]" href={href}>
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-ink text-paper transition duration-700 ease-fluid group-hover:translate-x-1">↗</span>
    </Link>
  );
}

export function DxHubExperience() {
  const [node, setNode] = useState(networkNodes[0]);
  const [loop, setLoop] = useState(transformationLoop[0]);
  const [stakeholder, setStakeholder] = useState(stakeholders[0]);
  const [studio, setStudio] = useState(studios[2]);
  const [journey, setJourney] = useState(journeys[0]);
  const [useCase, setUseCase] = useState(useCases[0]);
  const [partner, setPartner] = useState(partnershipOptions[0]);
  const reduce = useReducedMotion();

  const selectedStudioIndex = useMemo(() => studios.findIndex((item) => item.name === studio.name), [studio]);
  const studioOrbit = useMemo(
    () =>
      studios.map((_, index) => {
        const x = Math.cos((index / studios.length) * Math.PI * 2) * 235;
        const y = Math.sin((index / studios.length) * Math.PI * 2) * 215;
        const format = (value: number) => `calc(50% ${value >= 0 ? "+" : "-"} ${Math.abs(value).toFixed(1)}px)`;

        return {
          left: format(x),
          top: format(y)
        };
      }),
    []
  );

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-ink text-paper">
      <section className="relative isolate min-h-[100dvh] overflow-hidden px-4 pb-20 pt-32 md:px-8">
        <div className="absolute inset-0">
          <SpatialField />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(105,227,255,0.18),transparent_34%),radial-gradient(circle_at_20%_70%,rgba(255,190,92,0.16),transparent_30%),linear-gradient(180deg,rgba(6,8,13,0.12),rgba(6,8,13,0.98))]" />
          <div className="tech-grid" />
        </div>
        <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-9rem)] max-w-7xl content-center">
          <motion.div
            initial={reduce ? false : { opacity: 0.76, y: 24, filter: "blur(4px)" }}
            animate={reduce ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-6xl"
          >
            <div className="mb-7 flex flex-wrap items-center gap-3">
              <StatusTag status={dxhubPositioning.status} />
              <span className="text-sm text-paper/[0.66]">Do not portray proposed hubs as operational facts.</span>
            </div>
            <h1 className="max-w-[1180px] font-display text-[clamp(3.4rem,8.7vw,9.2rem)] font-semibold leading-[0.82] tracking-[-0.075em]">
              {dxhubPositioning.title}
            </h1>
            <p className="mt-7 max-w-3xl text-xl leading-9 text-paper/[0.72] md:text-2xl md:leading-10">{dxhubPositioning.description}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <CTA href="#system">Explore the DxHub system</CTA>
              <Link className="rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#pathways">
                Choose your pathway
              </Link>
              <Link className="rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#partners">
                Build a hub with us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="system" className="bg-surface px-4 py-28 md:px-8 md:py-40">
        <div className="mx-auto max-w-7xl">
          <Reveal className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-end">
            <h2 className="font-display text-[clamp(2.7rem,6vw,7rem)] font-semibold leading-[0.84] tracking-[-0.07em]">Why a hub?</h2>
            <p className="max-w-2xl text-lg leading-8 text-paper/[0.64]">
              DxHub is not a computer centre or a course menu. It is an operating model that connects needs, capability, practical application, opportunity and local transformation.
            </p>
          </Reveal>
          <div className="mt-16 grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="grid gap-3">
              {fragmentedNodes.map(([title, problem], index) => (
                <Reveal delay={index * 0.04} key={title}>
                  <div className="rounded-[1.6rem] bg-white/[0.055] p-4 ring-1 ring-white/[0.1]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold tracking-[-0.03em]">{title}</h3>
                        <p className="mt-1 text-sm text-paper/[0.56]">{problem}</p>
                      </div>
                      <span className="size-3 rounded-full bg-amber shadow-[0_0_28px_rgba(255,190,92,0.65)]" />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.12}>
              <div className="relative min-h-[520px] rounded-[2.4rem] bg-white/[0.05] p-1.5 ring-1 ring-white/[0.1]">
                <div className="relative h-full overflow-hidden rounded-[1.9rem] bg-ink p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.13)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(105,227,255,0.22),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:auto,42px_42px]" />
                <div className="absolute inset-0 bg-[url('/images/xr/ar-manufacturing-digital-twin.jpg')] bg-cover bg-center opacity-16 grayscale" />
                  <div className="relative z-10 grid h-full place-items-center">
                    <div className="grid size-52 place-items-center rounded-full bg-cyan text-center text-ink shadow-[0_0_120px_rgba(105,227,255,0.28)]">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em]">DxHub</p>
                        <p className="mt-2 px-8 text-2xl font-semibold tracking-[-0.05em]">Connects fragmented systems</p>
                      </div>
                    </div>
                    {["People", "Capability", "Application", "Opportunity", "Transformation"].map((item, index) => (
                      <span
                        className="absolute rounded-full bg-white/[0.08] px-4 py-2 text-sm font-semibold text-paper ring-1 ring-cyan/[0.24]"
                        style={{
                          transform: `rotate(${index * 72}deg) translateY(-190px) rotate(-${index * 72}deg)`
                        }}
                        key={item}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-ink px-4 py-28 md:px-8 md:py-40">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.065em]">Proposed Sedibeng network</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-paper/[0.64]">
              The map uses municipality-level service areas only. No street locations, opening dates or live services are implied.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {networkNodes.map((item) => (
                <button
                  className={`rounded-[1.4rem] p-4 text-left ring-1 transition duration-700 ease-fluid ${
                    item.id === node.id ? "bg-cyan text-ink ring-cyan" : "bg-white/[0.055] text-paper ring-white/[0.11] hover:bg-white/[0.09]"
                  }`}
                  type="button"
                  onClick={() => setNode(item)}
                  key={item.id}
                >
                  <span className="text-sm font-bold">{item.name}</span>
                  <span className="mt-2 block text-xs opacity-70">{item.area}</span>
                </button>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-[2.2rem] bg-white/[0.05] p-1.5 ring-1 ring-white/[0.1]">
              <div className="relative min-h-[520px] overflow-hidden rounded-[1.7rem] bg-surface p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)]">
                <div className="absolute inset-8 rounded-[40%] border border-cyan/[0.18]" />
                <div className="absolute inset-20 rounded-[45%] border border-lime/[0.13]" />
                {networkNodes.map((item, index) => (
                  <button
                    className={`absolute rounded-full px-4 py-3 text-xs font-bold transition duration-700 ease-fluid ${
                      item.id === node.id ? "bg-cyan text-ink shadow-[0_0_44px_rgba(105,227,255,0.42)]" : "bg-white/[0.09] text-paper ring-1 ring-white/[0.12]"
                    }`}
                    style={{
                      left: `${[14, 66, 28, 54][index]}%`,
                      top: `${[32, 28, 68, 56][index]}%`
                    }}
                    type="button"
                    onClick={() => setNode(item)}
                    key={item.id}
                  >
                    {item.name.replace(" DxHub", "")}
                  </button>
                ))}
                <div className="absolute bottom-7 left-7 right-7 rounded-[1.5rem] bg-ink/[0.82] p-6 ring-1 ring-white/[0.12]">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-3xl font-semibold tracking-[-0.055em]">{node.name}</h3>
                    <StatusTag status={node.status} />
                  </div>
                  <p className="mt-4 text-paper/[0.64]">{node.role}</p>
                  <p className="mt-4 text-sm text-paper/[0.54]">Focus: {node.focus}</p>
                  <p className="mt-2 text-sm text-paper/[0.54]">Groups: {node.groups}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface px-4 py-28 md:px-8 md:py-40">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,6vw,7rem)] font-semibold leading-[0.84] tracking-[-0.07em]">The transformation loop</h2>
          </Reveal>
          <div className="mt-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="grid gap-3">
              {transformationLoop.map((item, index) => (
                <button
                  className={`rounded-[1.4rem] p-4 text-left transition duration-700 ease-fluid ${
                    item.title === loop.title ? "bg-cyan text-ink" : "bg-white/[0.055] text-paper ring-1 ring-white/[0.1] hover:bg-white/[0.09]"
                  }`}
                  type="button"
                  onClick={() => setLoop(item)}
                  key={item.title}
                >
                  <span className="font-mono text-xs">{String(index + 1).padStart(2, "0")}</span>
                  <span className="ml-4 font-semibold">{item.title}</span>
                </button>
              ))}
            </div>
            <Reveal delay={0.1}>
              <article className="rounded-[2.2rem] bg-white/[0.05] p-1.5 ring-1 ring-white/[0.1]">
                <div className="rounded-[1.75rem] bg-ink p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)]">
                  <StatusTag status={loop.status} />
                  <h3 className="mt-8 text-5xl font-semibold tracking-[-0.065em]">{loop.title}</h3>
                  <div className="mt-8 grid gap-5 md:grid-cols-3">
                    <p className="text-paper/[0.66]"><strong className="block text-paper">What happens</strong>{loop.happens}</p>
                    <p className="text-paper/[0.66]"><strong className="block text-paper">Outputs</strong>{loop.outputs}</p>
                    <p className="text-paper/[0.66]"><strong className="block text-paper">Evidence</strong>{loop.evidence}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="pathways" className="bg-ink px-4 py-28 md:px-8 md:py-40">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.065em]">Choose a perspective</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {stakeholders.map((item) => (
                <button
                  className={`rounded-full px-4 py-3 text-sm font-bold transition duration-700 ease-fluid ${item.id === stakeholder.id ? "bg-lime text-ink" : "bg-white/[0.08] text-paper ring-1 ring-white/[0.12]"}`}
                  type="button"
                  onClick={() => setStakeholder(item)}
                  key={item.id}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-[2.2rem] bg-white/[0.05] p-1.5 ring-1 ring-white/[0.1]">
              <div className="rounded-[1.75rem] bg-surface p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)]">
                <h3 className="text-5xl font-semibold tracking-[-0.065em]">{stakeholder.label}</h3>
                <p className="mt-7 text-lg leading-8 text-paper/[0.68]"><strong className="text-paper">Need: </strong>{stakeholder.need}</p>
                <p className="mt-5 text-lg leading-8 text-paper/[0.68]"><strong className="text-paper">DxHub response: </strong>{stakeholder.response}</p>
                <div className="mt-8">
                  <CTA href="#partners">{stakeholder.cta}</CTA>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface px-4 py-28 md:px-8 md:py-40">
        <div className="mx-auto max-w-7xl">
          <Reveal className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <h2 className="font-display text-[clamp(2.7rem,6vw,7rem)] font-semibold leading-[0.84] tracking-[-0.07em]">Capability constellation</h2>
            <p className="text-lg leading-8 text-paper/[0.64]">Studios are presented as programme environments that may be physical, mobile, virtual or blended. They are not guaranteed rooms until verified.</p>
          </Reveal>
          <div className="mt-16 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[620px] rounded-[2.2rem] bg-white/[0.05] p-1.5 ring-1 ring-white/[0.1] max-lg:hidden">
              <div className="relative h-full overflow-hidden rounded-[1.75rem] bg-ink">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(105,227,255,0.18),transparent_30%)]" />
                <button className="absolute left-1/2 top-1/2 grid size-40 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cyan text-center font-bold text-ink" type="button">
                  DxHub OS
                </button>
                {studios.map((item, index) => (
                  <button
                    className={`absolute max-w-44 rounded-full px-4 py-3 text-xs font-bold transition duration-700 ease-fluid ${
                      index === selectedStudioIndex ? "bg-lime text-ink" : "bg-white/[0.08] text-paper ring-1 ring-white/[0.12] hover:bg-white/[0.12]"
                    }`}
                    style={{
                      left: studioOrbit[index].left,
                      top: studioOrbit[index].top,
                      transform: "translate(-50%, -50%)"
                    }}
                    type="button"
                    onClick={() => setStudio(item)}
                    key={item.name}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-3 lg:hidden">
              {studios.map((item) => (
                <button className={`rounded-[1.2rem] p-4 text-left ${item.name === studio.name ? "bg-lime text-ink" : "bg-white/[0.06] text-paper"}`} type="button" onClick={() => setStudio(item)} key={item.name}>
                  {item.name}
                </button>
              ))}
            </div>
            <Reveal delay={0.1}>
              <article className="rounded-[2.2rem] bg-white/[0.05] p-1.5 ring-1 ring-white/[0.1]">
                <div className="rounded-[1.75rem] bg-ink p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)]">
                  <StatusTag status={studio.status} />
                  <h3 className="mt-8 text-5xl font-semibold tracking-[-0.065em]">{studio.name}</h3>
                  <p className="mt-6 text-lg leading-8 text-paper/[0.66]">{studio.purpose}</p>
                  <p className="mt-8 rounded-[1.2rem] bg-white/[0.055] p-5 text-sm leading-6 text-paper/[0.58]">
                    Connected programmes, maturity labels, deliverables and verified availability can be added here as JEF approves details.
                  </p>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-ink px-4 py-28 md:px-8 md:py-40">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,6vw,7rem)] font-semibold leading-[0.84] tracking-[-0.07em]">Human journeys through the hub</h2>
          </Reveal>
          <div className="mt-12 flex flex-wrap gap-3">
            {journeys.map((item) => (
              <button className={`rounded-full px-4 py-3 text-sm font-bold ${item.title === journey.title ? "bg-cyan text-ink" : "bg-white/[0.08] text-paper ring-1 ring-white/[0.12]"}`} type="button" onClick={() => setJourney(item)} key={item.title}>
                {item.title.split(" to ")[0]}
              </button>
            ))}
          </div>
          <div className="mt-10 rounded-[2.2rem] bg-white/[0.05] p-1.5 ring-1 ring-white/[0.1]">
            <div className="rounded-[1.75rem] bg-surface p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)]">
              <h3 className="text-4xl font-semibold tracking-[-0.06em]">{journey.title}</h3>
              <div className="mt-8 flex gap-3 overflow-x-auto pb-4">
                {journey.steps.map((step, index) => (
                  <div className="min-w-[190px] rounded-[1.2rem] bg-ink p-4 ring-1 ring-white/[0.1]" key={step}>
                    <span className="font-mono text-xs text-lime">{String(index + 1).padStart(2, "0")}</span>
                    <p className="mt-8 font-semibold">{step}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-paper/[0.54]">Illustrative pathway. Delivery evidence must be added only when verified.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface px-4 py-28 md:px-8 md:py-40">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.065em]">Use-case lab</h2>
            <div className="mt-8 grid gap-3">
              {useCases.map((item) => (
                <button className={`rounded-[1.2rem] p-4 text-left ${item.context === useCase.context ? "bg-amber text-ink" : "bg-white/[0.06] text-paper ring-1 ring-white/[0.1]"}`} type="button" onClick={() => setUseCase(item)} key={item.context}>
                  {item.context} + {item.challenge}
                </button>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[2.2rem] bg-white/[0.05] p-1.5 ring-1 ring-white/[0.1]">
              <div className="rounded-[1.75rem] bg-ink p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)]">
                <StatusTag status="illustrative" />
                <h3 className="mt-8 text-5xl font-semibold tracking-[-0.065em]">{useCase.context}: {useCase.challenge}</h3>
                <p className="mt-6 text-xl leading-9 text-paper/[0.66]">{useCase.response}</p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-ink px-4 py-28 md:px-8 md:py-40">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.065em]">JEF ecosystem connections</h2>
            <div className="mt-8 grid gap-4">
              {ecosystemConnections.map(([need, value]) => (
                <div className="rounded-[1.4rem] bg-white/[0.055] p-5 ring-1 ring-white/[0.1]" key={need}>
                  <h3 className="text-xl font-semibold text-cyan">{need}</h3>
                  <p className="mt-2 leading-7 text-paper/[0.62]">{value}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.065em]">Evidence ladder</h2>
            <div className="mt-8 grid gap-3">
              {evidenceLevels.map(([level, description], index) => (
                <div className="rounded-[1.4rem] bg-white/[0.055] p-5 ring-1 ring-white/[0.1]" key={level}>
                  <span className="font-mono text-xs text-lime">Level {index + 1}</span>
                  <h3 className="mt-3 text-xl font-semibold">{level}</h3>
                  <p className="mt-2 leading-7 text-paper/[0.62]">{description}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="partners" className="relative overflow-hidden bg-paper px-4 py-28 text-ink md:px-8 md:py-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_20%,rgba(105,227,255,0.32),transparent_30%),radial-gradient(circle_at_16%_78%,rgba(255,190,92,0.26),transparent_34%)]" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.02fr_0.98fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(3rem,7vw,7.8rem)] font-semibold leading-[0.82] tracking-[-0.075em]">
              Transformation becomes real when capability meets a place, a problem and an opportunity.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-[2rem] bg-ink p-1.5 text-paper">
              <div className="rounded-[1.55rem] bg-surface p-7">
                <label className="text-sm font-semibold text-cyan" htmlFor="partner-pathway">Partnership pathway</label>
                <select
                  id="partner-pathway"
                  className="mt-3 w-full rounded-2xl bg-ink p-4 text-paper ring-1 ring-white/[0.12]"
                  value={partner}
                  onChange={(event) => setPartner(event.target.value)}
                >
                  {partnershipOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <p className="mt-6 text-lg leading-8 text-paper/[0.66]">
                  Selected route: <strong className="text-paper">{partner}</strong>. The final enquiry form should collect only the information needed for this pathway, with POPIA-aligned purpose and retention text.
                </p>
                <div className="mt-8">
                  <CTA href="/contact">Start a governed enquiry</CTA>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
