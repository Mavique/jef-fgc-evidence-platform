"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Reveal, WordReveal } from "@/components/MotionPrimitives";
import {
  aiValuePath,
  campus,
  domains,
  evolutionStages,
  frictions,
  partnershipRoutes,
  portfolioAssets,
  prolificImpact,
  prolificPositioning,
  prolificStakeholders,
  sectors,
  supportVsTransformation
} from "@/content/prolific-edge";
import { EnterpriseField } from "@/components/prolific-edge/EnterpriseField";

gsap.registerPlugin(ScrollTrigger);

function EvidenceTag({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-white/[0.08] px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-amber ring-1 ring-white/[0.12]">
      {status.replaceAll("_", " ")}
    </span>
  );
}

function PrimeCTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="group inline-flex items-center gap-3 rounded-full bg-amber p-1.5 pl-6 text-sm font-bold text-ink transition duration-700 ease-fluid hover:bg-cyan active:scale-[0.98]" href={href}>
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-ink text-paper transition duration-700 ease-fluid group-hover:translate-x-1">↗</span>
    </Link>
  );
}

export function ProlificEdgeExperience() {
  const [friction, setFriction] = useState(frictions[0]);
  const [stage, setStage] = useState(evolutionStages[0]);
  const [domain, setDomain] = useState(domains[0]);
  const [campusSpace, setCampusSpace] = useState(campus[0]);
  const [sector, setSector] = useState(sectors[0]);
  const [stakeholder, setStakeholder] = useState(prolificStakeholders[0]);
  const [partnerRoute, setPartnerRoute] = useState(partnershipRoutes[0]);
  const progressRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !progressRef.current) return;
    const tween = gsap.fromTo(
      progressRef.current,
      { scaleX: 0, transformOrigin: "left center" },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-prolific-page]",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8
        }
      }
    );

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [reduce]);

  const visibleAssets = useMemo(() => portfolioAssets.slice(0, Math.min(portfolioAssets.length, evolutionStages.findIndex((item) => item.title === stage.title) + 2)), [stage]);

  return (
    <main data-prolific-page className="w-full max-w-full overflow-x-hidden bg-ink text-paper">
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-white/[0.04]">
        <div ref={progressRef} className="h-full bg-gradient-to-r from-amber via-cyan to-canopy" />
      </div>

      <section className="relative isolate min-h-[100dvh] overflow-hidden px-4 pb-20 pt-32 md:px-8">
        <div className="absolute inset-0">
          <EnterpriseField />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(255,201,104,0.19),transparent_34%),radial-gradient(circle_at_22%_72%,rgba(138,124,255,0.18),transparent_32%),linear-gradient(180deg,rgba(6,8,13,0.08),rgba(6,8,13,0.98))]" />
          <div className="tech-grid" />
        </div>
        <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-9rem)] max-w-7xl content-center">
          <motion.div
            initial={reduce ? false : { opacity: 0.74, y: 28, filter: "blur(5px)" }}
            animate={reduce ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[1180px]"
          >
            <div className="mb-7 flex flex-wrap items-center gap-3">
              <EvidenceTag status={prolificPositioning.status} />
              <span className="text-sm text-paper/[0.66]">No proposal-specific figures or unverified outcomes are displayed.</span>
            </div>
            <h1 className="max-w-[1180px] font-display text-[clamp(3.05rem,7vw,7.4rem)] font-semibold leading-[0.86] tracking-[-0.07em]">
              <span className="block text-amber">{prolificPositioning.name}</span>
              Intelligent enterprises
              <span className="mx-4 hidden h-[0.52em] w-[1.08em] rounded-full bg-cyan/25 align-middle ring-1 ring-cyan/25 md:inline-block" />
              for the AI economy.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-paper/[0.72] md:text-2xl md:leading-10">{prolificPositioning.description}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PrimeCTA href="#journey">Explore the transformation journey</PrimeCTA>
              <Link className="rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#pathway">
                Enterprise pathway
              </Link>
              <Link className="rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#partners">
                Cohort partnership
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-surface px-4 py-32 md:px-8 md:py-48">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.8rem,6.2vw,7.2rem)] font-semibold leading-[0.84] tracking-[-0.07em]">
              From business support to enterprise transformation.
            </h2>
          </Reveal>
          <div className="mt-16 grid grid-flow-dense auto-rows-[minmax(300px,auto)] grid-cols-1 gap-4 md:grid-cols-12">
            {supportVsTransformation.map(([title, body], index) => (
              <Reveal delay={index * 0.08} className={index === 0 ? "md:col-span-5" : "md:col-span-7"} key={title}>
                <article className={`group h-full rounded-[2rem] p-1.5 ring-1 ring-white/[0.1] ${index === 0 ? "bg-white/[0.04]" : "bg-amber text-ink"}`}>
                  <div className={`flex h-full flex-col justify-between rounded-[1.55rem] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)] ${index === 0 ? "bg-ink text-paper" : "bg-amber text-ink"}`}>
                    <span className="font-mono text-xs uppercase tracking-[0.18em] opacity-70">{index === 0 ? "Passive input" : "Active mechanism"}</span>
                    <div>
                      <h3 className="text-5xl font-semibold tracking-[-0.065em]">{title}</h3>
                      <p className="mt-6 max-w-xl text-lg leading-8 opacity-72">{body}</p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="pathway" className="bg-ink px-4 py-32 md:px-8 md:py-48">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.8rem,5.9vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.065em]">Enterprise friction explorer</h2>
            <div className="mt-8 grid gap-3">
              {frictions.map((item) => (
                <button className={`rounded-[1.35rem] p-4 text-left transition duration-700 ease-fluid ${item.title === friction.title ? "bg-amber text-ink" : "bg-white/[0.06] text-paper ring-1 ring-white/[0.1] hover:bg-white/[0.1]"}`} type="button" onClick={() => setFriction(item)} key={item.title}>
                  {item.title}
                </button>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[2.2rem] bg-white/[0.05] p-1.5 ring-1 ring-white/[0.1]">
              <div className="rounded-[1.75rem] bg-surface p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)]">
                <h3 className="text-5xl font-semibold tracking-[-0.065em]">{friction.title}</h3>
                <p className="mt-7 text-lg leading-8 text-paper/[0.68]"><strong className="text-paper">System involved: </strong>{friction.system}</p>
                <p className="mt-5 text-lg leading-8 text-paper/[0.68]"><strong className="text-paper">Prolific Edge response: </strong>{friction.response}</p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section id="journey" className="bg-surface px-4 py-32 md:px-8 md:py-48">
        <div className="mx-auto max-w-7xl">
          <Reveal className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
            <h2 className="font-display text-[clamp(2.8rem,6.2vw,7.2rem)] font-semibold leading-[0.84] tracking-[-0.07em]">Enterprise Evolution Journey</h2>
            <p className="max-w-2xl text-lg leading-8 text-paper/[0.64]">A common methodology creates enterprise-specific pathways. Select a movement to see purpose, assets and evidence status.</p>
          </Reveal>
          <div className="mt-16 grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="grid gap-3">
              {evolutionStages.map((item, index) => (
                <button className={`rounded-[1.35rem] p-4 text-left transition duration-700 ease-fluid ${item.title === stage.title ? "bg-cyan text-ink" : "bg-white/[0.055] text-paper ring-1 ring-white/[0.1] hover:bg-white/[0.09]"}`} type="button" onClick={() => setStage(item)} key={item.title}>
                  <span className="font-mono text-xs">{String(index + 1).padStart(2, "0")}</span>
                  <span className="ml-4 font-semibold">{item.title}</span>
                </button>
              ))}
            </div>
            <Reveal delay={0.1}>
              <article className="rounded-[2.2rem] bg-white/[0.05] p-1.5 ring-1 ring-white/[0.1]">
                <div className="rounded-[1.75rem] bg-ink p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)]">
                  <EvidenceTag status={stage.status} />
                  <h3 className="mt-8 text-5xl font-semibold tracking-[-0.065em]">{stage.title}</h3>
                  <p className="mt-6 text-xl leading-9 text-paper/[0.68]">{stage.purpose}</p>
                  <p className="mt-7 rounded-[1.2rem] bg-white/[0.055] p-5 text-paper/[0.66]">Asset produced: {stage.asset}</p>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-ink px-4 py-32 md:px-8 md:py-48">
        <div className="mx-auto max-w-7xl">
          <WordReveal text="A capable enterprise is built through evidence, leadership, disciplined implementation and continuous learning." />
          <div className="mt-20 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[640px] rounded-[2.2rem] bg-white/[0.05] p-1.5 ring-1 ring-white/[0.1] max-lg:hidden">
              <div className="relative h-full overflow-hidden rounded-[1.75rem] bg-surface">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,201,104,0.18),transparent_32%)]" />
                {domains.map((item, index) => {
                  const angle = (index / domains.length) * Math.PI * 2;
                  return (
                    <button
                      className={`absolute max-w-44 rounded-full px-4 py-3 text-xs font-bold transition duration-700 ease-fluid ${item.name === domain.name ? "bg-amber text-ink" : "bg-white/[0.08] text-paper ring-1 ring-white/[0.12]"}`}
                      style={{
                        left: `calc(50% ${Math.cos(angle) >= 0 ? "+" : "-"} ${Math.abs(Math.cos(angle) * 280).toFixed(1)}px)`,
                        top: `calc(50% ${Math.sin(angle) >= 0 ? "+" : "-"} ${Math.abs(Math.sin(angle) * 235).toFixed(1)}px)`,
                        transform: "translate(-50%, -50%)"
                      }}
                      type="button"
                      onClick={() => setDomain(item)}
                      key={item.name}
                    >
                      {item.name}
                    </button>
                  );
                })}
                <div className="absolute left-1/2 top-1/2 grid size-44 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cyan text-center font-bold text-ink">
                  Enterprise DNA
                </div>
              </div>
            </div>
            <div className="grid gap-3 lg:hidden">
              {domains.map((item) => (
                <button className={`rounded-[1.2rem] p-4 text-left ${item.name === domain.name ? "bg-amber text-ink" : "bg-white/[0.06] text-paper"}`} type="button" onClick={() => setDomain(item)} key={item.name}>
                  {item.name}
                </button>
              ))}
            </div>
            <Reveal delay={0.1}>
              <article className="rounded-[2.2rem] bg-white/[0.05] p-1.5 ring-1 ring-white/[0.1]">
                <div className="rounded-[1.75rem] bg-surface p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)]">
                  <EvidenceTag status={domain.status} />
                  <h3 className="mt-8 text-5xl font-semibold tracking-[-0.065em]">{domain.name}</h3>
                  <p className="mt-6 text-lg leading-8 text-paper/[0.66]">{domain.description}</p>
                  <p className="mt-8 text-sm leading-6 text-paper/[0.54]">Relationships matter: no single domain transforms an enterprise alone. AI, automation and analytics depend on process clarity, people, governance, data and leadership.</p>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-surface px-4 py-32 md:px-8 md:py-48">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.8rem,6.2vw,7.2rem)] font-semibold leading-[0.84] tracking-[-0.07em]">Transformation Campus</h2>
          </Reveal>
          <div className="mt-16 grid grid-flow-dense auto-rows-[minmax(280px,auto)] grid-cols-1 gap-4 md:grid-cols-12">
            {campus.map((item, index) => (
              <button
                className={`group rounded-[2rem] bg-white/[0.05] p-1.5 text-left ring-1 ring-white/[0.1] transition duration-700 ease-fluid hover:-translate-y-1 ${index === 0 ? "md:col-span-7" : index === 1 ? "md:col-span-5" : "md:col-span-4"}`}
                type="button"
                onClick={() => setCampusSpace(item)}
                key={item.name}
              >
                <article className={`flex h-full flex-col justify-between rounded-[1.55rem] p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)] ${item.name === campusSpace.name ? "bg-amber text-ink" : "bg-ink text-paper"}`}>
                  <EvidenceTag status={item.status} />
                  <div>
                    <h3 className="text-3xl font-semibold tracking-[-0.055em]">{item.name}</h3>
                    <p className="mt-4 text-sm leading-6 opacity-70">{item.purpose}</p>
                    <p className="mt-6 text-sm font-semibold">Output: {item.output}</p>
                  </div>
                </article>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink px-4 py-32 md:px-8 md:py-48">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.8rem,5.9vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.065em]">Sector Transformation Lens</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {sectors.map((item) => (
                <button className={`rounded-full px-4 py-3 text-sm font-bold ${item.name === sector.name ? "bg-cyan text-ink" : "bg-white/[0.08] text-paper ring-1 ring-white/[0.12]"}`} type="button" onClick={() => setSector(item)} key={item.name}>
                  {item.name}
                </button>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[2.2rem] bg-white/[0.05] p-1.5 ring-1 ring-white/[0.1]">
              <div className="rounded-[1.75rem] bg-surface p-8">
                <EvidenceTag status="illustrative" />
                <h3 className="mt-8 text-5xl font-semibold tracking-[-0.065em]">{sector.name}</h3>
                <p className="mt-6 text-lg leading-8 text-paper/[0.66]"><strong className="text-paper">Friction: </strong>{sector.friction}</p>
                <p className="mt-4 text-lg leading-8 text-paper/[0.66]"><strong className="text-paper">Intervention: </strong>{sector.intervention}</p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {sector.assets.map((asset) => (
                    <span className="rounded-full bg-white/[0.08] px-3 py-2 text-xs font-semibold text-paper" key={asset}>{asset}</span>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface px-4 py-32 md:px-8 md:py-48">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.8rem,5.9vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.065em]">Transformation Portfolio Builder</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-paper/[0.64]">As the journey advances, the enterprise accumulates working assets. The public page previews asset categories without exposing proprietary templates.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid gap-3">
              {visibleAssets.map((asset, index) => (
                <div className="rounded-[1.25rem] bg-white/[0.06] p-4 ring-1 ring-white/[0.1]" key={asset}>
                  <span className="font-mono text-xs text-amber">{String(index + 1).padStart(2, "0")}</span>
                  <span className="ml-4 font-semibold">{asset}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-ink px-4 py-32 md:px-8 md:py-48">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-[clamp(2.8rem,5.9vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.065em]">AI Enterprise Lab</h2>
            <div className="mt-8 grid gap-3">
              {aiValuePath.map((item, index) => (
                <div className="rounded-[1.25rem] bg-white/[0.06] p-4 ring-1 ring-white/[0.1]" key={item}>
                  <span className="font-mono text-xs text-cyan">{String(index + 1).padStart(2, "0")}</span>
                  <span className="ml-4 font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-[clamp(2.8rem,5.9vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.065em]">Stakeholder value</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {prolificStakeholders.map((item) => (
                <button className={`rounded-full px-4 py-3 text-sm font-bold ${item[0] === stakeholder[0] ? "bg-amber text-ink" : "bg-white/[0.08] text-paper ring-1 ring-white/[0.12]"}`} type="button" onClick={() => setStakeholder(item)} key={item[0]}>
                  {item[0]}
                </button>
              ))}
            </div>
            <div className="mt-8 rounded-[2rem] bg-white/[0.05] p-1.5 ring-1 ring-white/[0.1]">
              <div className="rounded-[1.55rem] bg-surface p-7">
                <h3 className="text-4xl font-semibold tracking-[-0.06em]">{stakeholder[0]}</h3>
                <p className="mt-5 text-lg leading-8 text-paper/[0.66]">{stakeholder[1]}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface px-4 py-32 md:px-8 md:py-48">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.8rem,6.2vw,7.2rem)] font-semibold leading-[0.84] tracking-[-0.07em]">Impact beyond attendance</h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-5">
            {prolificImpact.map(([level, description], index) => (
              <Reveal delay={index * 0.05} key={level}>
                <article className="min-h-80 rounded-[2rem] bg-white/[0.05] p-1.5 ring-1 ring-white/[0.1]">
                  <div className="flex h-full flex-col justify-between rounded-[1.55rem] bg-ink p-6">
                    <span className="font-mono text-xs text-lime">Level {index + 1}</span>
                    <div>
                      <h3 className="text-2xl font-semibold tracking-[-0.05em]">{level}</h3>
                      <p className="mt-4 text-sm leading-6 text-paper/[0.58]">{description}</p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="partners" className="relative overflow-hidden bg-paper px-4 py-32 text-ink md:px-8 md:py-48">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,201,104,0.38),transparent_30%),radial-gradient(circle_at_14%_78%,rgba(105,227,255,0.28),transparent_34%)]" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(3rem,7vw,7.8rem)] font-semibold leading-[0.82] tracking-[-0.075em]">
              The future belongs to enterprises capable of learning faster, implementing better and innovating continuously.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-[2rem] bg-ink p-1.5 text-paper">
              <div className="rounded-[1.55rem] bg-surface p-7">
                <label className="text-sm font-semibold text-amber" htmlFor="prolific-partner-route">Partnership route</label>
                <select
                  id="prolific-partner-route"
                  className="mt-3 w-full rounded-2xl bg-ink p-4 text-paper ring-1 ring-white/[0.12]"
                  value={partnerRoute}
                  onChange={(event) => setPartnerRoute(event.target.value)}
                >
                  {partnershipRoutes.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <p className="mt-6 text-lg leading-8 text-paper/[0.66]">
                  Selected route: <strong className="text-paper">{partnerRoute}</strong>. Formal enquiry flows should avoid collecting confidential business information until POPIA-aligned discovery processes are approved.
                </p>
                <div className="mt-8">
                  <PrimeCTA href="/contact">Start a governed enquiry</PrimeCTA>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
