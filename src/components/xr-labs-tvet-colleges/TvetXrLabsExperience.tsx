"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/MotionPrimitives";
import { TvetXrLabField } from "@/components/xr-labs-tvet-colleges/TvetXrLabField";
import {
  architectureLayers,
  capabilityPaths,
  ecosystemMap,
  evidenceStates,
  implementationRoadmap,
  labTruths,
  labZones,
  sustainabilityChecks,
  xrLabPositioning
} from "@/content/xr-labs-tvet-colleges";
import { xrMedia } from "@/content/xr-media";

const workshopImage = xrMedia.jefCollegeComputerLab;
const vrTrainingImage = xrMedia.industrialVrTraining;

function StatusTag({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full bg-[#d97706] px-3 py-1 font-mono text-[0.64rem] font-bold uppercase tracking-[0.15em] text-white">
      {children.replaceAll("_", " ")}
    </span>
  );
}

function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#2dd4bf] p-1.5 pl-6 text-sm font-bold text-[#06211f] transition duration-700 ease-fluid hover:bg-[#f59e0b] active:scale-[0.98]" href={href}>
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-[#06211f] text-white transition duration-700 ease-fluid group-hover:translate-x-1">↗</span>
    </Link>
  );
}

function ChoiceButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className={`rounded-full px-4 py-3 text-left text-sm font-semibold transition duration-700 ease-fluid ${
        active ? "bg-[#2dd4bf] text-[#06211f]" : "bg-white/[0.065] text-white ring-1 ring-white/[0.12] hover:bg-white/[0.11]"
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function TvetXrLabsExperience() {
  const [layer, setLayer] = useState(architectureLayers[0]);
  const [zone, setZone] = useState(labZones[0]);
  const [capability, setCapability] = useState(capabilityPaths[0]);
  const reduce = useReducedMotion();

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#071312] text-white">
      <section className="relative isolate min-h-[100dvh] overflow-hidden px-4 pb-16 pt-36 md:px-8 md:pt-32">
        <div className="absolute inset-0">
          <TvetXrLabField />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,19,18,0.98)_0%,rgba(7,19,18,0.78)_48%,rgba(7,19,18,0.24)_100%),linear-gradient(180deg,rgba(7,19,18,0.12),rgba(7,19,18,0.98))]" />
          <div className="tech-grid opacity-30" />
          <div className="grain opacity-25" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-8rem)] max-w-7xl content-center gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
          <motion.div
            initial={reduce ? false : { opacity: 0.72, y: 28, filter: "blur(5px)" }}
            animate={reduce ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <StatusTag>{xrLabPositioning.status}</StatusTag>
              <span className="text-sm text-white/[0.7]">Platform-neutral TVET capability system. Evidence before deployment claims.</span>
            </div>
            <h1 className="max-w-[1060px] font-display text-[clamp(3rem,6.3vw,7rem)] font-semibold leading-[0.88] tracking-[-0.066em]">
              <span className="block text-[#2dd4bf]">{xrLabPositioning.name}</span>
              Build more than an XR room.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-white/[0.76] md:text-2xl md:leading-10">{xrLabPositioning.description}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTA href="#lab-system">Build the living lab</CTA>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-white ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#architecture">
                Explore the six-layer architecture
              </Link>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-white ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#evidence">
                See the evidence gates
              </Link>
            </div>
          </motion.div>

          <Reveal delay={0.12}>
            <div className="rounded-[1.55rem] border border-white/[0.12] bg-white/[0.055] p-1">
              <div className="relative min-h-[540px] overflow-hidden rounded-[1.25rem] bg-[#0d1e1c] p-6">
                <Image alt="TVET students and professionals in a digital skills workshop" className="object-cover opacity-38 saturate-[0.85]" fill priority sizes="(min-width: 1024px) 42vw, 100vw" src={workshopImage} />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,30,28,0.18),rgba(13,30,28,0.94))]" />
                <div className="relative z-10 flex min-h-[492px] flex-col justify-between gap-10">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#f59e0b]">Core operating idea</p>
                    <h2 className="mt-5 max-w-2xl text-5xl font-semibold tracking-[-0.065em] md:text-7xl">Procurement does not create teaching capability.</h2>
                  </div>
                  <div className="grid gap-3">
                    {labTruths.slice(0, 4).map((item, index) => (
                      <motion.div
                        className="rounded-[1rem] bg-white/[0.1] p-4 text-lg font-semibold ring-1 ring-white/[0.12]"
                        initial={reduce ? false : { opacity: 0, x: -18 }}
                        whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
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

      <section className="bg-[#071312] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Not a room containing headsets.</h2>
          </Reveal>
          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {[
              ["An XR Lab is", "A college capability operating system connecting curriculum, people, place, content, technology, operations and evidence."],
              ["An XR Lab is not", "A headset room, a once-off demo, a passive content centre, a substitute for physical competence or a licence-count success story."]
            ].map(([title, body], index) => (
              <Reveal className={`rounded-[1.55rem] p-1 ${index === 0 ? "bg-[#2dd4bf]" : "bg-white/[0.07]"}`} delay={index * 0.08} key={title}>
                <article className={`min-h-[420px] rounded-[1.25rem] p-7 ${index === 0 ? "bg-[#2dd4bf] text-[#06211f]" : "bg-[#0d1e1c] text-white"}`}>
                  <span className="font-mono text-xs uppercase tracking-[0.18em] opacity-65">{index === 0 ? "Capability system" : "Evidence boundary"}</span>
                  <h3 className="mt-8 text-5xl font-semibold tracking-[-0.06em]">{title}</h3>
                  <p className="mt-8 text-xl leading-9 opacity-75">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="lab-system" className="bg-[#0d1e1c] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.78fr_1.22fr]">
          <Reveal>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-[#2dd4bf]">Empty room to living lab</p>
            <h2 className="font-display text-[clamp(2.65rem,5.6vw,6.2rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Establish purpose before infrastructure.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/[0.68]">
              A TVET XR Lab becomes valuable when it can teach through simulation, connect to workshops and operate reliably after launch.
            </p>
          </Reveal>
          <div className="grid gap-4">
            {labTruths.map((item, index) => (
              <Reveal delay={index * 0.055} key={item}>
                <article className="grid gap-5 rounded-[1.25rem] border border-white/[0.1] bg-white/[0.055] p-6 md:grid-cols-[0.16fr_0.84fr] md:items-center md:p-7">
                  <span className="font-mono text-xs text-[#2dd4bf]">{String(index + 1).padStart(2, "0")}</span>
                  <p className="text-xl font-semibold leading-8 tracking-[-0.035em]">{item}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="architecture" className="bg-[#071312] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Six layers before scale.</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {architectureLayers.map((item) => (
                <ChoiceButton active={item.name === layer.name} onClick={() => setLayer(item)} key={item.name}>
                  {item.name}
                </ChoiceButton>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[1.55rem] bg-[#2dd4bf] p-8 text-[#06211f]">
              <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-65">Architecture layer</p>
              <h3 className="mt-6 text-5xl font-semibold tracking-[-0.065em] md:text-6xl">{layer.name}</h3>
              <p className="mt-7 text-xl leading-8">{layer.purpose}</p>
              <div className="mt-8 grid gap-3">
                <p className="rounded-[1rem] bg-[#06211f] p-5 text-white">Dependency: {layer.dependency}</p>
                <p className="rounded-[1rem] bg-[#134e4a] p-5 text-white">Risk: {layer.risk}</p>
                <p className="rounded-[1rem] bg-white p-5 font-semibold text-[#06211f]">Evidence: {layer.evidence}</p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#f0fdfa] px-4 py-24 text-[#06211f] md:px-8 md:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Design the spatial model around teaching flow.</h2>
            <p className="max-w-2xl text-lg leading-8 text-[#334155]">
              The lab may be one flexible room or a connected suite. Zones should respond to facilities, programme mix, budget, accessibility and safety.
            </p>
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-3">
            {labZones.map((item) => (
              <button
                className={`rounded-full px-4 py-3 text-left text-sm font-semibold transition duration-700 ease-fluid ${item[0] === zone[0] ? "bg-[#06211f] text-white" : "bg-white text-[#06211f] hover:bg-[#ccfbf1]"}`}
                type="button"
                onClick={() => setZone(item)}
                key={item[0]}
              >
                {item[0]}
              </button>
            ))}
          </div>
          <Reveal delay={0.08}>
            <article className="relative mt-10 min-h-[460px] overflow-hidden rounded-[1.55rem] bg-[#06211f] p-7 text-white">
              <Image alt="Professional using VR headset during immersive technical training" className="object-cover opacity-36 saturate-[0.8]" fill sizes="100vw" src={vrTrainingImage} />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,33,31,0.18),rgba(6,33,31,0.94))]" />
              <div className="relative z-10 flex min-h-[404px] flex-col justify-end">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#f59e0b]">Active zone</p>
                <h3 className="mt-5 max-w-3xl text-6xl font-semibold tracking-[-0.07em]">{zone[0]}</h3>
                <p className="mt-6 max-w-3xl text-xl leading-9 text-white/[0.76]">{zone[1]}</p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#071312] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.86fr_1.14fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Build people, not only infrastructure.</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {capabilityPaths.map((item) => (
                <ChoiceButton active={item.role === capability.role} onClick={() => setCapability(item)} key={item.role}>
                  {item.role}
                </ChoiceButton>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[1.55rem] bg-[#f59e0b] p-8 text-[#06211f]">
              <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-65">Capability path</p>
              <h3 className="mt-6 text-6xl font-semibold tracking-[-0.07em]">{capability.role}</h3>
              <p className="mt-8 text-2xl leading-9">{capability.path}</p>
              <p className="mt-8 rounded-[1rem] bg-[#06211f] p-5 text-lg leading-8 text-white">Evidence: {capability.evidence}</p>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#0d1e1c] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Nine-stage roadmap with decision gates.</h2>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {implementationRoadmap.map(([title, body], index) => (
              <Reveal delay={index * 0.04} key={title}>
                <article className="flex min-h-72 flex-col justify-between rounded-[1.25rem] border border-white/[0.1] bg-white/[0.055] p-6">
                  <span className="font-mono text-xs text-[#2dd4bf]">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-3xl font-semibold tracking-[-0.05em]">{title}</h3>
                    <p className="mt-4 leading-7 text-white/[0.66]">{body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="evidence" className="bg-[#071312] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.78fr_1.22fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.65rem,5.7vw,6.2rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Never collapse evidence into one success number.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/[0.68]">{xrLabPositioning.caution}</p>
          </Reveal>
          <div className="grid gap-4">
            {evidenceStates.map(([title, body], index) => (
              <Reveal delay={index * 0.04} key={title}>
                <article className="grid gap-4 rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5 md:grid-cols-[0.18fr_0.3fr_0.52fr] md:items-center">
                  <span className="font-mono text-xs text-[#2dd4bf]">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="text-2xl font-semibold tracking-[-0.045em]">{title}</h3>
                  <p className="leading-7 text-white/[0.66]">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f0fdfa] px-4 py-24 text-[#06211f] md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.65rem,5.7vw,6.2rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Sustainability is designed before launch.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#334155]">
              The lab is sustainable only if it can continue operating after establishment funding or external implementation support ends.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid gap-3">
              {sustainabilityChecks.map((item, index) => (
                <div className="rounded-[1rem] bg-white p-5 font-semibold shadow-[0_18px_70px_rgba(19,78,74,0.1)] ring-1 ring-[#06211f]/10" key={item}>
                  <span className="mr-4 font-mono text-xs text-[#0d9488]">{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#071312] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Connected to the JEF ecosystem.</h2>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ecosystemMap.map(([title, body], index) => (
              <Reveal delay={index * 0.045} key={title}>
                <article className="flex min-h-64 flex-col justify-between rounded-[1.25rem] border border-white/[0.1] bg-white/[0.055] p-5">
                  <span className="font-mono text-xs text-[#f59e0b]">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-3xl font-semibold tracking-[-0.05em]">{title}</h3>
                    <p className="mt-4 text-sm leading-6 text-white/[0.66]">{body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#2dd4bf] px-4 py-24 text-[#06211f] md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <h2 className="max-w-6xl font-display text-[clamp(3rem,7vw,7.7rem)] font-semibold leading-[0.84] tracking-[-0.07em]">
              Teach through it. Create within it. Operate it reliably. Prove what it improves.
            </h2>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#06211f] px-6 py-4 text-sm font-bold text-white transition duration-700 ease-fluid hover:bg-[#134e4a]" href="/contact">
                Assess institutional readiness
              </Link>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-4 text-sm font-bold text-[#06211f] transition duration-700 ease-fluid hover:bg-[#f0fdfa]" href="/programmes">
                Explore JEF programmes
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
