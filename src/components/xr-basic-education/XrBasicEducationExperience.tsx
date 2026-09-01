"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/MotionPrimitives";
import { XrEducationField } from "@/components/xr-basic-education/XrEducationField";
import {
  assistantJourney,
  deviceModes,
  ecosystemLinks,
  evidenceLadder,
  qualityChecks,
  readinessDomains,
  roleLenses,
  transformationLayers,
  xrEducationPositioning
} from "@/content/xr-basic-education";
import { xrMedia } from "@/content/xr-media";

const classroomImage = xrMedia.xrClassroomSolarSystem;
const vrTrainingImage = xrMedia.xrScienceClassroomDna;

function StatusTag({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full bg-[#ffb45c] px-3 py-1 font-mono text-[0.64rem] font-bold uppercase tracking-[0.15em] text-[#101326]">
      {children.replaceAll("_", " ")}
    </span>
  );
}

function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#54dcff] p-1.5 pl-6 text-sm font-bold text-[#101326] transition duration-700 ease-fluid hover:bg-[#aaff80] active:scale-[0.98]" href={href}>
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-[#101326] text-paper transition duration-700 ease-fluid group-hover:translate-x-1">↗</span>
    </Link>
  );
}

function ChoiceButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className={`rounded-full px-4 py-3 text-left text-sm font-semibold transition duration-700 ease-fluid ${
        active ? "bg-[#54dcff] text-[#101326]" : "bg-white/[0.065] text-paper ring-1 ring-white/[0.12] hover:bg-white/[0.11]"
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function XrBasicEducationExperience() {
  const [role, setRole] = useState(roleLenses[0]);
  const [device, setDevice] = useState(deviceModes[0]);
  const reduce = useReducedMotion();

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#090d16] text-paper">
      <section className="relative isolate min-h-[100dvh] overflow-hidden px-4 pb-16 pt-36 md:px-8 md:pt-32">
        <div className="absolute inset-0">
          <XrEducationField />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,13,22,0.98)_0%,rgba(9,13,22,0.78)_48%,rgba(9,13,22,0.25)_100%),linear-gradient(180deg,rgba(9,13,22,0.15),rgba(9,13,22,0.98))]" />
          <div className="tech-grid opacity-35" />
          <div className="grain opacity-25" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-8rem)] max-w-7xl content-center gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
          <motion.div
            initial={reduce ? false : { opacity: 0.72, y: 28, filter: "blur(5px)" }}
            animate={reduce ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <StatusTag>{xrEducationPositioning.status}</StatusTag>
              <span className="text-sm text-paper/[0.7]">Basic Education and BEEI architecture. Evidence before scale claims.</span>
            </div>
            <h1 className="max-w-[1020px] font-display text-[clamp(3rem,6.25vw,7rem)] font-semibold leading-[0.88] tracking-[-0.066em]">
              <span className="block text-[#54dcff]">{xrEducationPositioning.name}</span>
              {xrEducationPositioning.line}
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-paper/[0.76] md:text-2xl md:leading-10">{xrEducationPositioning.description}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTA href="#page-to-presence">Transform a curriculum concept</CTA>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#assistant-journey">
                Explore the Education Assistant journey
              </Link>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#evidence">
                See what must be verified
              </Link>
            </div>
          </motion.div>

          <Reveal delay={0.12}>
            <div className="rounded-[1.55rem] border border-white/[0.12] bg-white/[0.055] p-1">
              <div className="relative min-h-[540px] overflow-hidden rounded-[1.25rem] bg-[#101726] p-6">
                <Image alt="Teacher and learners using AI-supported digital classroom technology" className="object-cover opacity-40 saturate-[0.85]" fill priority sizes="(min-width: 1024px) 42vw, 100vw" src={classroomImage} />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,23,38,0.22),rgba(16,23,38,0.94))]" />
                <div className="relative z-10 flex min-h-[492px] flex-col justify-between gap-10">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#ffb45c]">Core rule</p>
                    <h2 className="mt-5 max-w-2xl text-5xl font-semibold tracking-[-0.065em] md:text-7xl">Pedagogy leads technology.</h2>
                  </div>
                  <div className="grid gap-3">
                    {["Teacher defines the learning need.", "Education Assistant researches and builds.", "Learners explore with accessible modes.", "Evidence improves the lesson."].map((item, index) => (
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

      <section className="bg-[#090d16] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Not a headset distribution project.</h2>
          </Reveal>
          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {[
              ["The programme is", "A curriculum-led capability framework where teachers, Education Assistants, schools and support teams make hard concepts visible, interactive and assessable."],
              ["The programme is not", "A claim that VR automatically improves learning, a device handout, a national rollout announcement or a promise of guaranteed employment outcomes."]
            ].map(([title, body], index) => (
              <Reveal className={`rounded-[1.55rem] p-1 ${index === 0 ? "bg-[#54dcff]" : "bg-white/[0.07]"}`} delay={index * 0.08} key={title}>
                <article className={`min-h-[420px] rounded-[1.25rem] p-7 ${index === 0 ? "bg-[#54dcff] text-[#101326]" : "bg-[#101726] text-paper"}`}>
                  <span className="font-mono text-xs uppercase tracking-[0.18em] opacity-65">{index === 0 ? "Capability system" : "Evidence boundary"}</span>
                  <h3 className="mt-8 text-5xl font-semibold tracking-[-0.06em]">{title}</h3>
                  <p className="mt-8 text-xl leading-9 opacity-75">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="page-to-presence" className="bg-[#101726] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.74fr_1.26fr]">
          <Reveal>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-[#54dcff]">From Page to Presence</p>
            <h2 className="font-display text-[clamp(2.65rem,5.6vw,6.2rem)] font-semibold leading-[0.86] tracking-[-0.066em]">One curriculum concept, transformed carefully.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-paper/[0.68]">
              The website experience follows a concept from static page to guided exploration without pretending the immersive layer is automatically better.
            </p>
          </Reveal>
          <div className="grid gap-4">
            {transformationLayers.map((item, index) => (
              <Reveal delay={index * 0.055} key={item.name}>
                <article className="grid gap-5 rounded-[1.25rem] border border-white/[0.1] bg-white/[0.055] p-6 md:grid-cols-[0.18fr_0.3fr_0.52fr] md:items-start md:p-7">
                  <span className="font-mono text-xs text-[#aaff80]">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-3xl font-semibold tracking-[-0.05em]">{item.name}</h3>
                    <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-[#ffb45c]">{item.owner}</p>
                  </div>
                  <p className="leading-7 text-paper/[0.68]">{item.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#090d16] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Switch the role lens.</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {roleLenses.map((item) => (
                <ChoiceButton active={item.role === role.role} onClick={() => setRole(item)} key={item.role}>
                  {item.role}
                </ChoiceButton>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[1.55rem] bg-[#54dcff] p-8 text-[#101326]">
              <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-65">Perspective</p>
              <h3 className="mt-6 text-6xl font-semibold tracking-[-0.07em]">{role.role}</h3>
              <p className="mt-8 text-2xl leading-9">{role.value}</p>
              <p className="mt-8 rounded-[1.1rem] bg-[#101326] p-5 text-lg leading-8 text-paper">Risk to manage: {role.risk}</p>
            </article>
          </Reveal>
        </div>
      </section>

      <section id="assistant-journey" className="bg-[#eef2ff] px-4 py-24 text-[#101326] md:px-8 md:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="grid gap-8 lg:grid-cols-[0.84fr_1.16fr] lg:items-end">
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Education Assistant capability journey.</h2>
            <p className="max-w-2xl text-lg leading-8 text-[#334155]">
              The assistant pathway is presented as applied capability, not attendance. Every stage should produce observable portfolio evidence.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assistantJourney.map(([title, body], index) => (
              <Reveal delay={index * 0.045} key={title}>
                <article className="flex min-h-72 flex-col justify-between rounded-[1.25rem] bg-white p-6 shadow-[0_18px_70px_rgba(30,27,75,0.1)] ring-1 ring-[#101326]/10">
                  <span className="font-mono text-xs text-[#4f46e5]">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-3xl font-semibold tracking-[-0.05em]">{title}</h3>
                    <p className="mt-4 leading-7 text-[#334155]">{body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#090d16] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.65rem,5.6vw,6.2rem)] font-semibold leading-[0.86] tracking-[-0.066em]">XR is multi-device, not VR-only.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-paper/[0.68]">
              Schools need flexible access modes so a lesson can work with available devices, accessibility needs and bandwidth limits.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {deviceModes.map((item) => (
                <ChoiceButton active={item[0] === device[0]} onClick={() => setDevice(item)} key={item[0]}>
                  {item[0]}
                </ChoiceButton>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="relative min-h-[520px] overflow-hidden rounded-[1.55rem] border border-white/[0.12] bg-white/[0.055] p-7">
              <Image alt="Professional using VR headset for immersive training" className="object-cover opacity-32 saturate-[0.8]" fill sizes="(min-width: 1024px) 44vw, 100vw" src={vrTrainingImage} />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,13,22,0.24),rgba(9,13,22,0.92))]" />
              <div className="relative z-10 flex min-h-[466px] flex-col justify-end">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#ffb45c]">Selected access mode</p>
                <h3 className="mt-5 text-6xl font-semibold tracking-[-0.07em]">{device[0]}</h3>
                <p className="mt-6 max-w-2xl text-xl leading-9 text-paper/[0.78]">{device[1]}</p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#101726] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Readiness blocks scale until the system is ready.</h2>
          </Reveal>
          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {readinessDomains.map((item, index) => (
              <Reveal delay={index * 0.035} key={item}>
                <article className="min-h-44 rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5">
                  <span className="font-mono text-xs text-[#aaff80]">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-10 text-2xl font-semibold tracking-[-0.045em]">{item}</h3>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="evidence" className="bg-[#090d16] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.78fr_1.22fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.65rem,5.7vw,6.2rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Measure what matters, not what is easiest to count.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-paper/[0.68]">{xrEducationPositioning.caution}</p>
          </Reveal>
          <div className="grid gap-4">
            {evidenceLadder.map(([title, body], index) => (
              <Reveal delay={index * 0.045} key={title}>
                <article className="grid gap-4 rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5 md:grid-cols-[0.22fr_0.28fr_0.5fr] md:items-center">
                  <span className="font-mono text-xs text-[#54dcff]">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="text-2xl font-semibold tracking-[-0.045em]">{title}</h3>
                  <p className="leading-7 text-paper/[0.66]">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eef2ff] px-4 py-24 text-[#101326] md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.65rem,5.7vw,6.2rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Content must pass quality and safeguarding checks.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#334155]">
              XR education content must be accurate, safe, accessible and reviewed before it reaches learners.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid gap-3">
              {qualityChecks.map((item, index) => (
                <div className="rounded-[1rem] bg-white p-5 font-semibold shadow-[0_18px_70px_rgba(30,27,75,0.08)] ring-1 ring-[#101326]/10" key={item}>
                  <span className="mr-4 font-mono text-xs text-[#4f46e5]">{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#090d16] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Connected to the JEF ecosystem.</h2>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {ecosystemLinks.map(([title, body], index) => (
              <Reveal delay={index * 0.045} key={title}>
                <article className="flex min-h-72 flex-col justify-between rounded-[1.25rem] border border-white/[0.1] bg-white/[0.055] p-5">
                  <span className="font-mono text-xs text-[#ffb45c]">{String(index + 1).padStart(2, "0")}</span>
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

      <section className="bg-[#54dcff] px-4 py-24 text-[#101326] md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <h2 className="max-w-6xl font-display text-[clamp(3rem,7vw,7.7rem)] font-semibold leading-[0.84] tracking-[-0.07em]">
              Build the people, pedagogy and systems that turn technology into learning.
            </h2>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#101326] px-6 py-4 text-sm font-bold text-paper transition duration-700 ease-fluid hover:bg-[#27324a]" href="/contact">
                Discuss an evidence-led implementation phase
              </Link>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-4 text-sm font-bold text-[#101326] transition duration-700 ease-fluid hover:bg-[#eef2ff]" href="/programmes">
                Explore JEF programmes
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
