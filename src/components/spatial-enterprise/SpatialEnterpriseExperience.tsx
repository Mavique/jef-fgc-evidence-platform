"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Reveal } from "@/components/MotionPrimitives";
import { SpatialEnterpriseField } from "@/components/spatial-enterprise/SpatialEnterpriseField";
import {
  assetA17Views,
  copilotBoundaries,
  ecosystemLinks,
  hypothesisOptions,
  lifecycle,
  overlayCompare,
  provenanceRecord,
  sectors,
  solutions,
  spatialEnterprisePositioning,
  transformationJourney,
  trustLayers,
  twinTypes
} from "@/content/spatial-enterprise";

function StatusTag({ children }: { children: React.ReactNode }) {
  const label = typeof children === "string" ? children.replaceAll("_", " ") : children;

  return (
    <span className="inline-flex rounded-full bg-[#48f2d2] px-3 py-1 font-mono text-[0.64rem] font-bold uppercase tracking-[0.15em] text-[#090d14]">
      {label}
    </span>
  );
}

function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#48f2d2] p-1.5 pl-6 text-sm font-bold text-[#090d14] transition duration-700 ease-fluid hover:bg-[#ffc857] active:scale-[0.98]" href={href}>
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-[#090d14] text-[#f8fbff] transition duration-700 ease-fluid group-hover:translate-x-1">›</span>
    </Link>
  );
}

function SelectorButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className={`rounded-full px-4 py-3 text-left text-sm font-semibold transition duration-700 ease-fluid ${
        active ? "bg-[#48f2d2] text-[#090d14]" : "bg-white/[0.06] text-[#f8fbff] ring-1 ring-white/[0.12] hover:bg-white/[0.1]"
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function SpatialEnterpriseExperience() {
  const [assetView, setAssetView] = useState(assetA17Views[0]);
  const [journeyStep, setJourneyStep] = useState(transformationJourney[0]);
  const [sector, setSector] = useState(sectors[0]);
  const [hypothesis, setHypothesis] = useState(hypothesisOptions[0]);

  const activeStepIndex = useMemo(() => transformationJourney.findIndex((item) => item[0] === journeyStep[0]), [journeyStep]);

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#090d14] text-[#f8fbff]">
      <section className="relative isolate min-h-[84dvh] overflow-hidden px-4 pb-16 pt-36 md:px-8 md:pt-32">
        <div className="absolute inset-0">
          <SpatialEnterpriseField />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(72,242,210,0.16),transparent_31%),radial-gradient(circle_at_20%_78%,rgba(255,200,87,0.12),transparent_29%),linear-gradient(180deg,rgba(9,13,20,0.18),rgba(9,13,20,0.98))]" />
          <div className="tech-grid opacity-45" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#090d14] to-transparent" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(84dvh-7rem)] max-w-7xl content-center gap-10 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <StatusTag>{spatialEnterprisePositioning.status}</StatusTag>
              <span className="text-sm text-[#f8fbff]/[0.66]">{spatialEnterprisePositioning.nameNote}</span>
            </div>
            <h1 className="max-w-[1040px] font-display text-[clamp(3.05rem,6.5vw,7.15rem)] font-semibold leading-[0.88] tracking-[-0.066em]">
              <span className="block text-[#48f2d2]">{spatialEnterprisePositioning.portfolioName}</span>
              workplace as interface.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-[#f8fbff]/[0.74] md:text-2xl md:leading-10">
              {spatialEnterprisePositioning.line} Asset context, verified knowledge and human authority meet at the point of work.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTA href="#asset-a17">Explore Asset A17</CTA>
              <Link className="inline-flex items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-[#f8fbff] ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#journey">
                Map a Spatial Opportunity
              </Link>
              <Link className="inline-flex items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-[#f8fbff] ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#pilot">
                Design a Pilot
              </Link>
            </div>
          </motion.div>

          <Reveal delay={0.12}>
            <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.06] p-1.5 ring-1 ring-white/[0.12]">
              <div className="relative min-h-[440px] overflow-hidden rounded-[1.55rem] bg-[#101722] p-6">
                <div className="absolute inset-0 bg-[url('/images/xr/vr-robotics-workcell.jpg')] bg-cover bg-center opacity-22 grayscale" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(72,242,210,0.08)_1px,transparent_1px),linear-gradient(rgba(72,242,210,0.08)_1px,transparent_1px)] bg-[length:58px_58px]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,23,34,0.22),rgba(16,23,34,0.94))]" />
                <div className="relative z-10 flex h-full flex-col justify-between gap-9">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#ffc857]">Machine A / Asset A17</p>
                    <h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.058em] md:text-6xl">Context becomes visible before action begins.</h2>
                  </div>
                  <div className="grid gap-3">
                    {["Asset", "Role", "Procedure", "Risk", "Confidence", "Escalation"].map((item, index) => (
                      <motion.div
                        className={`flex items-center justify-between rounded-[1rem] p-4 ring-1 ${
                          index === 0 ? "bg-[#f8fbff] text-[#090d14] ring-[#f8fbff]" : index === 4 ? "bg-[#ffc857] text-[#090d14] ring-[#ffc857]" : "bg-white/[0.07] text-[#f8fbff] ring-white/[0.12]"
                        }`}
                        initial={false}
                        whileInView={{ opacity: 1, x: 0 }}
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

      <section className="bg-[#090d14] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.7rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Not AR theatre. Operational intelligence with boundaries.</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {overlayCompare.map((item, index) => (
              <Reveal className={`rounded-[2rem] p-1.5 ${index === 0 ? "bg-white/[0.07]" : "bg-[#48f2d2]"}`} key={item.label}>
                <article className={`min-h-[440px] rounded-[1.55rem] p-7 ${index === 0 ? "bg-[#101722] text-[#f8fbff]" : "bg-[#48f2d2] text-[#090d14]"}`}>
                  <h3 className="max-w-lg text-5xl font-semibold tracking-[-0.06em]">{item.label}</h3>
                  <p className="mt-6 max-w-xl text-lg leading-8 opacity-72">{item.intent}</p>
                  <div className="mt-10 grid gap-3">
                    {item.points.map((point, pointIndex) => (
                      <div className="flex items-center justify-between rounded-[1rem] bg-black/[0.12] p-4 ring-1 ring-current/10" key={point}>
                        <span className="font-semibold">{point}</span>
                        <span className="font-mono text-xs opacity-65">{String(pointIndex + 1).padStart(2, "0")}</span>
                      </div>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="asset-a17" className="bg-[#101722] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.76fr_1.24fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.5rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Follow Asset A17 through the enterprise stack.</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#f8fbff]/[0.66]">
              Switch views to see how a technician, system, supervisor, knowledge authority and executive read the same workplace event.
            </p>
            <div className="mt-9 grid gap-3">
              {assetA17Views.map((item) => (
                <SelectorButton active={item.name === assetView.name} onClick={() => setAssetView(item)} key={item.name}>
                  {item.name}
                </SelectorButton>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <article className="rounded-[2rem] bg-[#ffc857] p-1.5 text-[#090d14]">
              <div className="grid min-h-[500px] gap-8 rounded-[1.55rem] bg-[#ffc857] p-7 md:grid-cols-[0.9fr_1.1fr] md:p-9">
                <div className="flex flex-col justify-between gap-10">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.16em] opacity-70">{assetView.signal}</p>
                    <h3 className="mt-5 text-5xl font-semibold tracking-[-0.064em] md:text-7xl">{assetView.title}</h3>
                    <p className="mt-6 text-lg leading-8 opacity-78">{assetView.body}</p>
                  </div>
                  <div className="rounded-[1.15rem] bg-[#090d14] p-5 text-[#f8fbff]">
                    <p className="font-semibold text-[#48f2d2]">Current doctrine</p>
                    <p className="mt-3 text-lg leading-8 text-[#f8fbff]/[0.72]">A spatial system may support work, but it does not replace qualified judgement, OEM procedure, safety authority or human escalation.</p>
                  </div>
                </div>
                <div className="relative min-h-[390px] overflow-hidden rounded-[1.2rem] bg-[#111823] p-5 text-[#f8fbff]">
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(72,242,210,0.1)_1px,transparent_1px),linear-gradient(rgba(72,242,210,0.1)_1px,transparent_1px)] bg-[length:46px_46px]" />
                  <div className="relative z-10 grid h-full content-end gap-3">
                    {["Physical asset", "Knowledge twin", "Spatial guidance", "Human authority"].map((item, index) => (
                      <div className={`rounded-[1rem] p-4 ${index === 2 ? "bg-[#48f2d2] text-[#090d14]" : "bg-white/[0.08] text-[#f8fbff] ring-1 ring-white/[0.12]"}`} key={item}>
                        <span className="font-mono text-xs opacity-65">{String(index + 1).padStart(2, "0")}</span>
                        <h4 className="mt-2 text-xl font-semibold tracking-[-0.045em]">{item}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section id="journey" className="bg-[#090d14] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Start with enterprise need, not device spectacle.</h2>
          </Reveal>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="grid gap-3 sm:grid-cols-2">
              {transformationJourney.map((item, index) => (
                <button
                  className={`min-h-32 rounded-[1.05rem] p-5 text-left transition duration-700 ease-fluid ${
                    item[0] === journeyStep[0] ? "bg-[#48f2d2] text-[#090d14]" : "bg-white/[0.06] text-[#f8fbff] ring-1 ring-white/[0.1] hover:bg-white/[0.1]"
                  }`}
                  type="button"
                  onClick={() => setJourneyStep(item)}
                  key={item[0]}
                >
                  <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                  <span className="mt-4 block text-2xl font-semibold tracking-[-0.05em]">{item[0]}</span>
                </button>
              ))}
            </div>
            <Reveal delay={0.08}>
              <article className="sticky top-28 rounded-[2rem] bg-white/[0.06] p-1.5 ring-1 ring-white/[0.11]">
                <div className="rounded-[1.55rem] bg-[#101722] p-8">
                  <StatusTag>stage {String(activeStepIndex + 1).padStart(2, "0")}</StatusTag>
                  <h3 className="mt-8 text-5xl font-semibold tracking-[-0.06em]">{journeyStep[0]}</h3>
                  <p className="mt-6 text-lg leading-8 text-[#f8fbff]/[0.68]">{journeyStep[1]}</p>
                  <div className="mt-8 rounded-[1.1rem] bg-[#ffc857] p-5 text-[#090d14]">
                    <p className="font-semibold">Scale rule</p>
                    <p className="mt-2 leading-7 opacity-75">Scale only where value, safety, user trust and total cost are demonstrated.</p>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-[#e9fffb] px-4 py-20 text-[#090d14] md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">What makes one instruction trustworthy?</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 opacity-74">
              The worker sees a simple step. The enterprise needs the layers beneath it to prove source, applicability, confidence and authority.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="grid gap-3">
              {trustLayers.map(([title, body], index) => (
                <div className={`rounded-[1.15rem] p-5 ${index === 0 ? "bg-[#090d14] text-[#f8fbff]" : index === trustLayers.length - 1 ? "bg-[#ffc857]" : "bg-white"}`} key={title}>
                  <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em]">{title}</h3>
                  <p className="mt-2 leading-7 opacity-70">{body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#090d14] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Solution portfolio by enterprise outcome.</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {solutions.map(([title, body], index) => (
              <Reveal className={`min-h-[240px] rounded-[1.5rem] p-5 ${index === 2 ? "bg-[#48f2d2] text-[#090d14]" : index === 5 ? "bg-[#ffc857] text-[#090d14]" : "bg-white/[0.06] text-[#f8fbff] ring-1 ring-white/[0.1]"}`} key={title}>
                <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-10 text-3xl font-semibold tracking-[-0.055em]">{title}</h3>
                <p className="mt-4 text-sm leading-6 opacity-70">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#111823] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.3rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Sector Spatial Lens.</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#f8fbff]/[0.66]">
              Examples frame the types of deployment evidence, permissions and measured outcomes JEF reviews before public claims.
            </p>
            <div className="mt-9 grid gap-3">
              {sectors.map((item) => (
                <SelectorButton active={item.name === sector.name} onClick={() => setSector(item)} key={item.name}>
                  {item.name}
                </SelectorButton>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="relative min-h-[460px] overflow-hidden rounded-[2rem] bg-[#48f2d2] p-8 text-[#090d14]">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,13,20,0.12)_1px,transparent_1px),linear-gradient(rgba(9,13,20,0.12)_1px,transparent_1px)] bg-[length:56px_56px]" />
              <div className="relative z-10 flex min-h-[500px] flex-col justify-between">
                <StatusTag>use_case_pathway</StatusTag>
                <div>
                  <h3 className="text-6xl font-semibold tracking-[-0.066em]">{sector.asset}</h3>
                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.1rem] bg-[#090d14] p-5 text-[#f8fbff]">
                      <p className="font-semibold text-[#ffc857]">Problem</p>
                      <p className="mt-3 leading-7 text-[#f8fbff]/[0.72]">{sector.problem}</p>
                    </div>
                    <div className="rounded-[1.1rem] bg-[#090d14] p-5 text-[#f8fbff]">
                      <p className="font-semibold text-[#48f2d2]">Value lens</p>
                      <p className="mt-3 leading-7 text-[#f8fbff]/[0.72]">{sector.value}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#090d14] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.3rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Learn, simulate, operate, capture, improve.</h2>
          </Reveal>
          <div className="mt-10 overflow-hidden rounded-[2rem] bg-white/[0.06] p-5 ring-1 ring-white/[0.11]">
            <div className="grid min-w-[980px] grid-cols-9 gap-2">
              {lifecycle.map((item, index) => (
                <div className={`min-h-48 rounded-[1rem] p-4 ${index >= 2 && index <= 5 ? "bg-[#48f2d2] text-[#090d14]" : "bg-[#111823] text-[#f8fbff]"}`} key={item}>
                  <span className="font-mono text-xs opacity-65">{String(index + 1).padStart(2, "0")}</span>
                  <p className="mt-8 text-lg font-semibold leading-6 tracking-[-0.04em]">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#f8fbff]/[0.64]">
            The concepts, asset representation, procedures and evidence should transfer from learning into simulation and real work.
          </p>
        </div>
      </section>

      <section className="bg-[#e9fffb] px-4 py-20 text-[#090d14] md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.3rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Spatial Copilot boundary explorer.</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {copilotBoundaries.map(([title, body], index) => (
              <Reveal className={`min-h-[180px] rounded-[1.4rem] p-5 ${index < 3 ? "bg-white" : index === 4 ? "bg-[#ffc857]" : "bg-[#090d14] text-[#f8fbff]"}`} key={title}>
                <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-12 text-3xl font-semibold tracking-[-0.055em]">{title}</h3>
                <p className="mt-4 text-sm leading-6 opacity-70">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#090d14] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Knowledge Provenance Inspector.</h2>
            <div className="mt-10 grid gap-3">
              {provenanceRecord.map(([title, body]) => (
                <div className="rounded-[1.05rem] bg-white/[0.06] p-5 ring-1 ring-white/[0.1]" key={title}>
                  <h3 className="text-xl font-semibold tracking-[-0.045em]">{title}</h3>
                  <p className="mt-2 leading-7 text-[#f8fbff]/[0.64]">{body}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Digital Twin Decoder.</h2>
            <div className="mt-10 grid gap-3">
              {twinTypes.map(([title, body], index) => (
                <div className={`rounded-[1.05rem] p-5 ${index === 3 ? "bg-[#48f2d2] text-[#090d14]" : "bg-white/[0.06] text-[#f8fbff] ring-1 ring-white/[0.1]"}`} key={title}>
                  <h3 className="text-xl font-semibold tracking-[-0.045em]">{title}</h3>
                  <p className="mt-2 leading-7 opacity-70">{body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="pilot" className="bg-[#111823] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.3rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Value hypothesis builder.</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#f8fbff]/[0.66]">
              A pilot starts with a measurable enterprise friction, baseline, users, safeguards and stop condition.
            </p>
            <div className="mt-9 grid gap-3">
              {hypothesisOptions.map((item) => (
                <SelectorButton active={item === hypothesis} onClick={() => setHypothesis(item)} key={item}>
                  {item}
                </SelectorButton>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="rounded-[2rem] bg-[#ffc857] p-1.5 text-[#090d14]">
              <div className="rounded-[1.55rem] bg-[#ffc857] p-8">
                <p className="font-mono text-xs uppercase tracking-[0.16em] opacity-65">Pilot hypothesis</p>
                <h3 className="mt-5 text-5xl font-semibold tracking-[-0.06em]">{hypothesis}</h3>
                <div className="mt-10 grid gap-3 md:grid-cols-2">
                  {["Baseline", "Users", "Safeguards", "Success measure"].map((item) => (
                    <div className="rounded-[1.05rem] bg-[#090d14] p-5 text-[#f8fbff]" key={item}>
                      <h4 className="text-xl font-semibold tracking-[-0.045em]">{item}</h4>
                      <p className="mt-2 text-sm leading-6 text-[#f8fbff]/[0.66]">Define before prototype, verify during pilot, review before scale.</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#090d14] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.2rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Built through the JEF enterprise ecosystem.</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {ecosystemLinks.map(([title, body], index) => (
              <Reveal className={`min-h-[180px] rounded-[1.4rem] p-5 ${index === 0 ? "bg-[#48f2d2] text-[#090d14]" : index === 5 ? "bg-[#ffc857] text-[#090d14]" : "bg-white/[0.06] text-[#f8fbff] ring-1 ring-white/[0.1]"}`} key={title}>
                <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-12 text-3xl font-semibold tracking-[-0.055em]">{title}</h3>
                <p className="mt-4 text-sm leading-6 opacity-70">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
