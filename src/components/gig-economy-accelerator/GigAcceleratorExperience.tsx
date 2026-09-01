"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/MotionPrimitives";
import { GigAcceleratorField } from "@/components/gig-economy-accelerator/GigAcceleratorField";
import {
  acceleratorJourney,
  deliverySprint,
  economicsInputs,
  gigAcceleratorPositioning,
  gigCompare,
  hiddenCosts,
  offerBuilderChecks,
  partnershipOptions,
  platformSafety,
  protectionTerms,
  readinessDimensions,
  resilienceDashboard,
  servicePathways,
  venturePath
} from "@/content/gig-economy-accelerator";

function StatusTag({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full bg-[#4fffe0] px-3 py-1 font-mono text-[0.64rem] font-bold uppercase tracking-[0.15em] text-[#0b0d12]">
      {children.replaceAll("_", " ")}
    </span>
  );
}

function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#4fffe0] p-1.5 pl-6 text-sm font-bold text-[#0b0d12] transition duration-700 ease-fluid hover:bg-[#ffc24d] active:scale-[0.98]" href={href}>
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-[#0b0d12] text-[#fbfbf6] transition duration-700 ease-fluid group-hover:translate-x-1">›</span>
    </Link>
  );
}

function ChoiceButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className={`rounded-full px-4 py-3 text-left text-sm font-semibold transition duration-700 ease-fluid ${
        active ? "bg-[#4fffe0] text-[#0b0d12]" : "bg-white/[0.06] text-[#fbfbf6] ring-1 ring-white/[0.12] hover:bg-white/[0.1]"
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function GigAcceleratorExperience() {
  const [journeyStep, setJourneyStep] = useState(acceleratorJourney[0]);
  const [service, setService] = useState(servicePathways[0]);
  const [partner, setPartner] = useState(partnershipOptions[0]);
  const reduce = useReducedMotion();

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#0b0d12] text-[#fbfbf6]">
      <section className="relative isolate min-h-[100dvh] overflow-hidden px-4 pb-16 pt-36 md:px-8 md:pt-32">
        <div className="absolute inset-0">
          <GigAcceleratorField />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(79,255,224,0.17),transparent_31%),radial-gradient(circle_at_22%_78%,rgba(255,194,77,0.13),transparent_30%),linear-gradient(180deg,rgba(11,13,18,0.16),rgba(11,13,18,0.98))]" />
          <div className="tech-grid opacity-40" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0b0d12] to-transparent" />
        </div>
        <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-8rem)] max-w-7xl content-center gap-10 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
          <motion.div
            initial={reduce ? false : { opacity: 0.72, y: 28, filter: "blur(5px)" }}
            animate={reduce ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <StatusTag>{gigAcceleratorPositioning.status}</StatusTag>
              <span className="text-sm text-[#fbfbf6]/[0.66]">Outcomes, clients, projects and income require verification.</span>
            </div>
            <h1 className="max-w-[1040px] font-display text-[clamp(3rem,6.2vw,6.9rem)] font-semibold leading-[0.88] tracking-[-0.066em]">
              <span className="block text-[#4fffe0]">Gig-Economy Accelerator</span>
              capability with protection.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-[#fbfbf6]/[0.74] md:text-2xl md:leading-10">
              Turn proof into a scoped service, fair contract, professional delivery, verified payment and repeatable growth.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTA href="#journey">Explore My Accelerator Journey</CTA>
              <Link className="inline-flex items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-[#fbfbf6] ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#readiness">
                Check My Readiness
              </Link>
              <Link className="inline-flex items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-[#fbfbf6] ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#partners">
                Create a Quality Brief
              </Link>
            </div>
          </motion.div>

          <Reveal delay={0.12}>
            <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.06] p-1.5 ring-1 ring-white/[0.12]">
              <div className="relative min-h-[520px] overflow-hidden rounded-[1.55rem] bg-[#12151d] p-6">
                <div className="absolute inset-0 bg-[url('/images/xr/medical-xr-spine.jpg')] bg-cover bg-center opacity-20 grayscale" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(79,255,224,0.08)_1px,transparent_1px),linear-gradient(rgba(79,255,224,0.08)_1px,transparent_1px)] bg-[length:58px_58px]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,21,29,0.2),rgba(18,21,29,0.94))]" />
                <div className="relative z-10 flex h-full flex-col justify-between gap-9">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#ffc24d]">Protected pathway</p>
                    <h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.058em] md:text-6xl">The first gig is not the finish line.</h2>
                  </div>
                  <div className="grid gap-3">
                    {["Proof", "Offer", "Price", "Contract", "Delivery", "Payment"].map((item, index) => (
                      <motion.div
                        className={`flex items-center justify-between rounded-[1rem] p-4 ring-1 ${
                          index === 0 ? "bg-[#fbfbf6] text-[#0b0d12] ring-[#fbfbf6]" : index === 3 ? "bg-[#5aa7ff] text-[#0b0d12] ring-[#5aa7ff]" : index === 5 ? "bg-[#71f26d] text-[#0b0d12] ring-[#71f26d]" : "bg-white/[0.07] text-[#fbfbf6] ring-white/[0.12]"
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

      <section className="bg-[#0b0d12] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.7rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Do not sell easy online income. Build economic resilience.</h2>
          </Reveal>
          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {gigCompare.map((item, index) => (
              <Reveal className={`rounded-[2rem] p-1.5 ${index === 0 ? "bg-white/[0.07]" : "bg-[#4fffe0]"}`} key={item.label}>
                <article className={`min-h-[430px] rounded-[1.55rem] p-7 ${index === 0 ? "bg-[#12151d] text-[#fbfbf6]" : "bg-[#4fffe0] text-[#0b0d12]"}`}>
                  <h3 className="max-w-lg text-5xl font-semibold tracking-[-0.06em]">{item.label}</h3>
                  <p className="mt-6 max-w-xl text-lg leading-8 opacity-72">{item.body}</p>
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

      <section className="bg-[#141821] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.5rem)] font-semibold leading-[0.86] tracking-[-0.066em]">The price of an unprotected gig.</h2>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {hiddenCosts.map(([title, body], index) => (
              <Reveal className={`min-h-[260px] rounded-[1.45rem] p-5 ${index === 4 ? "bg-[#ffc24d] text-[#0b0d12]" : "bg-white/[0.06] text-[#fbfbf6] ring-1 ring-white/[0.1]"}`} key={title}>
                <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-12 text-3xl font-semibold tracking-[-0.055em]">{title}</h3>
                <p className="mt-4 text-sm leading-6 opacity-70">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="readiness" className="bg-[#f3fff9] px-4 py-24 text-[#0b0d12] md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Readiness Compass, not a gig-ready score.</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 opacity-74">
              Each dimension is developmental guidance. It is not a guarantee, exclusion decision or income prediction.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="grid gap-3 md:grid-cols-2">
              {readinessDimensions.map(([title, body], index) => (
                <div className={`rounded-[1.1rem] p-5 ${index === 5 ? "bg-[#5aa7ff]" : index === 7 ? "bg-[#71f26d]" : "bg-white"}`} key={title}>
                  <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 opacity-70">{body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="journey" className="bg-[#0b0d12] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.74fr_1.26fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.5rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Income Resilience Journey.</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#fbfbf6]/[0.66]">
              Fourteen stages connect capability, service design, market access, protection, delivery, payment and growth.
            </p>
            <div className="mt-9 grid gap-3">
              {acceleratorJourney.slice(0, 8).map((item) => (
                <ChoiceButton active={item[0] === journeyStep[0]} onClick={() => setJourneyStep(item)} key={item[0]}>
                  {item[0]}
                </ChoiceButton>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="rounded-[2rem] bg-[#4fffe0] p-1.5 text-[#0b0d12]">
              <div className="grid min-h-[610px] gap-8 rounded-[1.55rem] bg-[#4fffe0] p-7 md:grid-cols-[0.9fr_1.1fr] md:p-9">
                <div className="flex flex-col justify-between gap-10">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.16em] opacity-70">Accelerator stage</p>
                    <h3 className="mt-5 text-5xl font-semibold tracking-[-0.064em] md:text-7xl">{journeyStep[0]}</h3>
                    <p className="mt-6 text-lg leading-8 opacity-78">{journeyStep[1]}</p>
                  </div>
                  <div className="rounded-[1.15rem] bg-[#0b0d12] p-5 text-[#fbfbf6]">
                    <p className="font-semibold text-[#ffc24d]">Progression rule</p>
                    <p className="mt-3 text-lg leading-8 text-[#fbfbf6]/[0.72]">Training completion, proposal submission and platform registration are not counted as paid economic outcomes.</p>
                  </div>
                </div>
                <div className="grid max-h-[610px] gap-3 overflow-y-auto pr-1">
                  {acceleratorJourney.map((item, index) => (
                    <button
                      className={`rounded-[1rem] p-4 text-left transition duration-700 ease-fluid ${
                        item[0] === journeyStep[0] ? "bg-[#0b0d12] text-[#fbfbf6]" : "bg-[#0b0d12]/[0.13] text-[#0b0d12] hover:bg-[#0b0d12]/[0.2]"
                      }`}
                      type="button"
                      onClick={() => setJourneyStep(item)}
                      key={item[0]}
                    >
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

      <section className="bg-[#141821] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.3rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Service Pathway Explorer.</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#fbfbf6]/[0.66]">
              Examples are illustrative until validated through learning, evidence and market pathways.
            </p>
            <div className="mt-9 grid gap-3">
              {servicePathways.map((item) => (
                <ChoiceButton active={item[0] === service[0]} onClick={() => setService(item)} key={item[0]}>
                  {item[0]}
                </ChoiceButton>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="relative min-h-[560px] overflow-hidden rounded-[2rem] bg-[#ffc24d] p-8 text-[#0b0d12]">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,13,18,0.11)_1px,transparent_1px),linear-gradient(rgba(11,13,18,0.11)_1px,transparent_1px)] bg-[length:56px_56px]" />
              <div className="relative z-10 flex min-h-[500px] flex-col justify-between">
                <StatusTag>illustrative_service</StatusTag>
                <div>
                  <h3 className="text-6xl font-semibold tracking-[-0.066em]">{service[0]}</h3>
                  <p className="mt-7 max-w-2xl text-xl leading-9 opacity-75">{service[1]}</p>
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#f3fff9] px-4 py-24 text-[#0b0d12] md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Offer Builder.</h2>
            <div className="mt-10 grid gap-3 md:grid-cols-2">
              {offerBuilderChecks.map((item, index) => (
                <div className={`rounded-[1.05rem] p-5 ${index === 8 ? "bg-[#ffc24d]" : "bg-white"}`} key={item}>
                  <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-xl font-semibold tracking-[-0.045em]">{item}</h3>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Gig Economics Calculator.</h2>
            <div className="mt-10 grid gap-3">
              {economicsInputs.map(([title, body], index) => (
                <div className={`rounded-[1.05rem] p-5 ${index === 5 ? "bg-[#71f26d]" : "bg-white"}`} key={title}>
                  <h3 className="text-xl font-semibold tracking-[-0.045em]">{title}</h3>
                  <p className="mt-2 leading-7 opacity-70">{body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#0b0d12] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.3rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Project Protection Preview.</h2>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {protectionTerms.map(([title, body], index) => (
              <Reveal className={`min-h-[250px] rounded-[1.4rem] p-5 ${index === 2 ? "bg-[#71f26d] text-[#0b0d12]" : index === 3 ? "bg-[#5aa7ff] text-[#0b0d12]" : "bg-white/[0.06] text-[#fbfbf6] ring-1 ring-white/[0.1]"}`} key={title}>
                <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-12 text-3xl font-semibold tracking-[-0.055em]">{title}</h3>
                <p className="mt-4 text-sm leading-6 opacity-70">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#141821] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Platform Safety Lab.</h2>
            <div className="mt-10 grid gap-3">
              {platformSafety.map(([title, body]) => (
                <div className={`rounded-[1.05rem] p-5 ${title === "Scam signal" ? "bg-[#ffc24d] text-[#0b0d12]" : "bg-white/[0.06] text-[#fbfbf6] ring-1 ring-white/[0.1]"}`} key={`${title}-${body}`}>
                  <h3 className="text-xl font-semibold tracking-[-0.045em]">{title}</h3>
                  <p className="mt-2 leading-7 opacity-70">{body}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Delivery Sprint Simulator.</h2>
            <div className="mt-10 grid grid-cols-2 gap-3">
              {deliverySprint.map((item, index) => (
                <div className={`min-h-28 rounded-[1.05rem] p-5 ${index >= 7 ? "bg-[#71f26d] text-[#0b0d12]" : "bg-white/[0.06] text-[#fbfbf6] ring-1 ring-white/[0.1]"}`} key={item}>
                  <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.05em]">{item}</h3>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#0b0d12] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.3rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Gig to venture is earned, not forced.</h2>
          </Reveal>
          <div className="mt-14 overflow-hidden rounded-[2rem] bg-white/[0.06] p-5 ring-1 ring-white/[0.11]">
            <div className="grid min-w-[900px] grid-cols-6 gap-2">
              {venturePath.map((item, index) => (
                <div className={`min-h-48 rounded-[1rem] p-4 ${index >= 3 ? "bg-[#4fffe0] text-[#0b0d12]" : "bg-[#141821] text-[#fbfbf6]"}`} key={item}>
                  <span className="font-mono text-xs opacity-65">{String(index + 1).padStart(2, "0")}</span>
                  <p className="mt-8 text-lg font-semibold leading-6 tracking-[-0.04em]">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {resilienceDashboard.map(([title, body], index) => (
              <Reveal className={`min-h-[220px] rounded-[1.4rem] p-5 ${index === 1 ? "bg-[#ffc24d] text-[#0b0d12]" : index === 2 ? "bg-[#71f26d] text-[#0b0d12]" : "bg-white/[0.06] text-[#fbfbf6] ring-1 ring-white/[0.1]"}`} key={title}>
                <span className="font-mono text-xs uppercase tracking-[0.12em] opacity-60">demonstration data</span>
                <h3 className="mt-12 text-3xl font-semibold tracking-[-0.055em]">{title}</h3>
                <p className="mt-4 text-sm leading-6 opacity-70">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="partners" className="bg-[#141821] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.3rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Partnership configurator.</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#fbfbf6]/[0.66]">
              A quality project starts with real scope, fair compensation, timely feedback and accountable acceptance.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="rounded-[2rem] bg-white/[0.06] p-5 ring-1 ring-white/[0.11]">
              <div className="grid gap-3 sm:grid-cols-2">
                {partnershipOptions.map((item) => (
                  <button
                    className={`min-h-32 rounded-[1.05rem] p-5 text-left text-2xl font-semibold tracking-[-0.05em] transition duration-700 ease-fluid ${
                      item === partner ? "bg-[#4fffe0] text-[#0b0d12]" : "bg-[#0b0d12] text-[#fbfbf6] hover:bg-[#1a1f2a]"
                    }`}
                    type="button"
                    onClick={() => setPartner(item)}
                    key={item}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-[1.1rem] bg-[#f3fff9] p-5 text-[#0b0d12]">
                <p className="font-mono text-xs uppercase tracking-[0.14em] opacity-60">Selected action</p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">{partner}</p>
                <p className="mt-3 leading-7 opacity-70">JEF must verify project source, participant protection, payment process, data handling and outcome evidence before any public claim.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
