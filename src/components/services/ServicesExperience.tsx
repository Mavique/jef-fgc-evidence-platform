"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Reveal } from "@/components/MotionPrimitives";
import {
  capabilitySpine,
  currentStates,
  evidenceLabels,
  integratedComparison,
  jefMethod,
  pathwayChallenges,
  sectors,
  servicesPositioning,
  sharedPackages,
  transformationEquation
} from "@/content/services";
import { xrMedia } from "@/content/xr-media";

const sectorImages: Record<string, string> = {
  tvet: xrMedia.arAutomotiveTraining,
  private: xrMedia.xrEducationGears,
  government: xrMedia.jefLargeTrainingRoom,
  health: xrMedia.medicalXrTraining,
  enterprise: xrMedia.arManufacturingTablet
};

function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-cyan p-1.5 pl-6 text-sm font-bold text-ink transition duration-700 ease-fluid hover:bg-lime active:scale-[0.98]" href={href}>
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-ink text-paper transition duration-700 ease-fluid group-hover:translate-x-1">↗</span>
    </Link>
  );
}

export function ServicesExperience() {
  const [sector, setSector] = useState(sectors[0]);
  const [challenge, setChallenge] = useState(pathwayChallenges[0]);
  const [currentState, setCurrentState] = useState(currentStates[0]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const applyHashSector = () => {
      const selectedId = window.location.hash.replace("#", "");
      const selectedSector = sectors.find((item) => item.id === selectedId);
      if (selectedSector) setSector(selectedSector);
    };

    applyHashSector();
    const frame = window.requestAnimationFrame(applyHashSector);
    const timeout = window.setTimeout(applyHashSector, 100);
    window.addEventListener("hashchange", applyHashSector);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.removeEventListener("hashchange", applyHashSector);
    };
  }, []);

  const selectedPathway = useMemo(
    () => ({
      system: sector.service,
      discovery: currentState.includes("fragmented") || currentState.includes("recovery") ? "Transformation Diagnostic" : "JEF Discovery Session",
      firstSprint:
        challenge.includes("AI") || challenge.includes("workflow")
          ? "Activation Sprint with human-AI roles, workflow safeguards and evidence design"
          : challenge.includes("curriculum") || challenge.includes("readiness")
            ? "Curriculum, capability and readiness discovery before implementation"
            : "Sector-specific transformation prescription before scale",
      evidence: "Discovery path. Final scope follows partner discovery, validation and evidence review."
    }),
    [challenge, currentState, sector.service]
  );

  function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  function selectSector(nextSector: typeof sectors[number]) {
    setSector(nextSector);
    window.history.replaceState(null, "", `/services#${nextSector.id}`);
  }

  return (
    <main id="main-content" className="w-full max-w-full overflow-x-hidden bg-ink text-paper">
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-cyan focus:px-5 focus:py-3 focus:font-bold focus:text-ink" href="#sector-gateway">
        Skip to sector gateway
      </a>

      <section className="relative isolate overflow-hidden px-4 pb-14 pt-28 md:px-8 md:pb-16 md:pt-28">
        <div className="absolute inset-0">
          <Image alt="Integrated institutional transformation environment" className="object-cover opacity-34 saturate-[0.9]" fill priority sizes="100vw" src={sectorImages[sector.id]} />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,13,0.98)_0%,rgba(5,8,13,0.82)_48%,rgba(5,8,13,0.34)_100%),linear-gradient(180deg,rgba(5,8,13,0.16),rgba(5,8,13,1))]" />
          <div className="tech-grid opacity-40" />
          <div className="grain opacity-25" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[78dvh] max-w-7xl content-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mb-5 inline-flex rounded-full bg-amber px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-ink">{servicesPositioning.eyebrow}</p>
            <h1 className="max-w-[1050px] font-display text-[clamp(3rem,5.9vw,6.35rem)] font-semibold leading-[0.88] tracking-[-0.062em]">
              Transform institutions. Build capable people. Create systems that perform.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-paper/[0.76] md:text-xl md:leading-9">{servicesPositioning.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTA href="#sector-gateway">Find your transformation pathway</CTA>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#lead-form">
                Bring us a challenge
              </Link>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#method">
                See how JEF implements
              </Link>
            </div>
          </motion.div>

          <Reveal delay={0.1}>
            <article className="signal-frame rounded-[1.45rem] border border-white/[0.12] bg-white/[0.06] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-6">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Transformation signal</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] md:text-5xl">{sector.name}</h2>
              <p className="mt-4 text-base leading-7 text-paper/[0.72] md:text-lg md:leading-8">{sector.outcome}</p>
              <div className="mt-6 grid gap-3">
                {[
                  ["Current friction", sector.challenge],
                  ["JEF intervention", sector.service],
                  ["Target transformed state", sector.positioning]
                ].map(([label, value]) => (
                  <div className="rounded-[1rem] bg-ink/60 p-4 ring-1 ring-white/[0.1]" key={label}>
                    <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-lime">{label}</p>
                    <p className="mt-2 text-sm leading-6 text-paper/[0.74]">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {["Diagnose", "Design", "Activate"].map((item) => (
                  <div className="rounded-[0.9rem] bg-cyan/10 p-3 text-center ring-1 ring-cyan/20" key={item}>
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-cyan">{item}</p>
                  </div>
                ))}
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.78fr_1.22fr] md:items-start lg:grid-cols-[0.76fr_1.24fr]">
          <Reveal>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-cyan">Why JEF</p>
            <h2 className="font-display text-[clamp(2.35rem,4.6vw,5.7rem)] font-semibold leading-[0.88] tracking-[-0.062em]">Technology is only one layer of transformation.</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-paper/[0.68]">
              JEF begins with the outcome, diagnoses readiness, redesigns the operating environment, configures appropriate technology, builds human capability and supports adoption.
            </p>
            <div className="mt-6 rounded-[1.2rem] border border-cyan/18 bg-cyan/10 p-5">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-cyan">Implementation stance</p>
              <p className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.045em] text-paper/90">
                Tools only matter when people can use them, govern them and prove what changed.
              </p>
            </div>
          </Reveal>
          <div className="grid gap-3 md:grid-cols-2">
            {integratedComparison.map(([fragmented, integrated], index) => (
              <Reveal delay={index * 0.045} key={fragmented}>
                <article className="grid h-full gap-4 rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5">
                  <p className="text-paper/[0.54]">{fragmented}</p>
                  <p className="font-semibold text-cyan">{integrated}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal>
          <div className="mx-auto mt-10 max-w-7xl rounded-[1.35rem] bg-ink p-6 ring-1 ring-white/[0.1]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber">Sustainable transformation equation</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {transformationEquation.map((item) => (
                <span className="rounded-full bg-white/[0.08] px-4 py-3 font-semibold text-paper ring-1 ring-white/[0.1]" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section id="sector-gateway" className="bg-ink px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="grid gap-8 lg:grid-cols-[0.72fr_0.62fr_0.66fr] lg:items-end">
            <h2 className="font-display text-[clamp(2.55rem,5vw,5.85rem)] font-semibold leading-[0.88] tracking-[-0.062em]">Choose the system you need to transform.</h2>
            <p className="max-w-2xl text-lg leading-8 text-paper/[0.68]">Use the sector lens to compare service systems, flagship products, package entry points and safeguards that fit your operating need.</p>
            <div className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-lime">Current lens</p>
              <p className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.045em]">{sector.name}</p>
              <p className="mt-3 text-sm leading-6 text-paper/62">{sector.service}</p>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-3 md:grid-cols-5">
            {sectors.map((item) => (
              <button
                className={`min-h-44 rounded-[1.15rem] p-5 text-left transition duration-700 ease-fluid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan ${
                  item.id === sector.id ? "bg-cyan text-ink" : "bg-white/[0.055] text-paper ring-1 ring-white/[0.1] hover:bg-white/[0.1]"
                }`}
                type="button"
                onClick={() => selectSector(item)}
                key={item.id}
              >
                <span className="font-mono text-xs uppercase tracking-[0.16em] opacity-70">{item.service}</span>
                <strong className="mt-6 block text-3xl leading-none tracking-[-0.05em]">{item.name}</strong>
                <span className="mt-4 block text-sm leading-6 opacity-75">{item.outcome}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper px-4 py-20 text-ink md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.86fr_1.14fr]">
          <Reveal>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-slate-600">Active sector lens</p>
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">{sector.service}</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">{sector.audience}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="relative min-h-[440px] overflow-hidden rounded-[1.55rem] bg-ink p-7 text-paper">
              <Image alt={`${sector.name} transformation pathway`} className="object-cover opacity-34 saturate-[0.85]" fill sizes="(min-width: 1024px) 48vw, 100vw" src={sectorImages[sector.id]} />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,13,0.08),rgba(5,8,13,0.96))]" />
              <div className="relative z-10 flex min-h-[464px] flex-col justify-end">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber">Transformation model</p>
                <h3 className="mt-5 text-5xl font-semibold tracking-[-0.065em] md:text-6xl">{sector.positioning}</h3>
                <p className="mt-6 max-w-3xl text-xl leading-9 text-paper/[0.76]">{sector.model}</p>
              </div>
            </article>
          </Reveal>
        </div>
        <div className="mx-auto mt-10 grid max-w-7xl gap-4 lg:grid-cols-3">
          <Reveal>
            <article className="rounded-[1.15rem] bg-white p-6 shadow-fine ring-1 ring-ink/10">
              <h3 className="text-3xl font-semibold tracking-[-0.05em]">Flagship products</h3>
              <div className="mt-6 grid gap-3">
                {sector.products.map((item) => (
                  <p className="rounded-[0.9rem] bg-paper p-4 font-semibold text-slate-800" key={item}>{item}</p>
                ))}
              </div>
            </article>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="rounded-[1.15rem] bg-white p-6 shadow-fine ring-1 ring-ink/10">
              <h3 className="text-3xl font-semibold tracking-[-0.05em]">Package entry points</h3>
              <div className="mt-6 grid gap-3">
                {sector.packages.map((item) => (
                  <p className="rounded-[0.9rem] bg-paper p-4 font-semibold text-slate-800" key={item}>{item}</p>
                ))}
              </div>
            </article>
          </Reveal>
          <Reveal delay={0.16}>
            <article className="rounded-[1.15rem] bg-ink p-6 text-paper shadow-fine">
              <h3 className="text-3xl font-semibold tracking-[-0.05em]">Safeguards</h3>
              <div className="mt-6 grid gap-3">
                {sector.safeguards.map((item) => (
                  <p className="rounded-[0.9rem] bg-white/[0.08] p-4 text-sm leading-6 text-paper/[0.76] ring-1 ring-white/[0.1]" key={item}>{item}</p>
                ))}
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section id="method" className="bg-surface px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">One method, adapted by sector.</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {jefMethod.map(([title, body], index) => (
              <Reveal delay={index * 0.04} key={title}>
                <article className="min-h-56 rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5">
                  <span className="font-mono text-xs text-lime">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-8 text-3xl font-semibold tracking-[-0.05em]">{title}</h3>
                  <p className="mt-4 text-sm leading-6 text-paper/[0.66]">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.76fr_1.24fr]">
          <Reveal>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-cyan">Shared packages</p>
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Clear ways to begin without inventing pricing.</h2>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2">
            {sharedPackages.map(([title, body], index) => (
              <Reveal delay={index * 0.045} key={title}>
                <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-6">
                  <span className="font-mono text-xs text-amber">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-6 text-3xl font-semibold tracking-[-0.05em]">{title}</h3>
                  <p className="mt-4 leading-7 text-paper/[0.66]">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="pathway-builder" className="bg-paper px-4 py-20 text-ink md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.86fr_1.14fr]">
          <Reveal>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-slate-600">Transformation Pathway Builder</p>
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Receive a discovery pathway.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">The builder recommends a discovery path. It does not auto-generate pricing, commitments or outcome claims.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[1.55rem] bg-white p-6 shadow-fine ring-1 ring-ink/10">
              <fieldset>
                <legend className="font-mono text-xs uppercase tracking-[0.18em] text-slate-600">Primary challenge</legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {pathwayChallenges.map((item) => (
                    <button className={`min-h-11 rounded-full px-4 py-3 text-sm font-semibold ${item === challenge ? "bg-ink text-paper" : "bg-paper text-ink"}`} type="button" onClick={() => setChallenge(item)} key={item}>{item}</button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="mt-8">
                <legend className="font-mono text-xs uppercase tracking-[0.18em] text-slate-600">Current state</legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {currentStates.map((item) => (
                    <button className={`min-h-11 rounded-full px-4 py-3 text-sm font-semibold ${item === currentState ? "bg-cyan text-ink" : "bg-paper text-ink"}`} type="button" onClick={() => setCurrentState(item)} key={item}>{item}</button>
                  ))}
                </div>
              </fieldset>
              <div className="mt-8 rounded-[1.15rem] bg-ink p-6 text-paper">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber">Discovery pathway</p>
                <h3 className="mt-5 text-4xl font-semibold tracking-[-0.055em]">{selectedPathway.system}</h3>
                <p className="mt-5 leading-7 text-paper/[0.72]">Recommended discovery path: {selectedPathway.discovery}</p>
                <p className="mt-3 leading-7 text-paper/[0.72]">Possible first sprint: {selectedPathway.firstSprint}</p>
                <p className="mt-5 rounded-[0.9rem] bg-white/[0.08] p-4 text-sm font-semibold text-cyan ring-1 ring-white/[0.1]">{selectedPathway.evidence}</p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Specialist capability layers, activated with purpose.</h2>
            <p className="max-w-2xl text-lg leading-8 text-paper/[0.68]">These JEF programmes are not interchangeable brands. They are specialist layers activated according to the transformation pathway.</p>
          </Reveal>
          <div className="mt-12 flex flex-wrap gap-3">
            {capabilitySpine.map((item) => (
              <span className="rounded-full bg-white/[0.08] px-4 py-3 font-semibold text-paper ring-1 ring-white/[0.1]" key={item}>{item}</span>
            ))}
          </div>
          <Link className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-cyan px-6 py-4 text-sm font-bold text-ink transition duration-700 ease-fluid hover:bg-lime" href="/xr-catalogue">
            Explore XR Catalogue
          </Link>
        </div>
      </section>

      <section className="bg-ink px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.78fr_1.22fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.65rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Evidence and responsible implementation stay visible.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-paper/[0.68]">{servicesPositioning.evidenceRule}</p>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2">
            {evidenceLabels.map((item, index) => (
              <Reveal delay={index * 0.04} key={item}>
                <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5">
                  <span className="font-mono text-xs text-cyan">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-5 text-2xl font-semibold tracking-[-0.045em]">{item.replaceAll("_", " ")}</h3>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="lead-form" className="bg-cyan px-4 py-20 text-ink md:px-8 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(3rem,6.8vw,7.4rem)] font-semibold leading-[0.84] tracking-[-0.07em]">Start a Transformation Conversation.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8">Use this form as a qualified next step. Do not include confidential, patient or sensitive institutional information.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <form className="rounded-[1.35rem] bg-white p-6 shadow-fine ring-1 ring-ink/10" onSubmit={submitLead}>
              {submitted ? (
                <div className="rounded-[1rem] bg-lime p-5 font-bold text-ink" role="status">
                  Thank you. JEF will review the enquiry and respond through the appropriate contact route.
                </div>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["Name", "name", "text"],
                  ["Organisation", "organisation", "text"],
                  ["Role", "role", "text"],
                  ["Work email", "email", "email"]
                ].map(([label, name, type]) => (
                  <label className="grid gap-2 font-semibold" key={name}>
                    {label}
                    <input className="min-h-12 rounded-[0.85rem] border border-slate-300 px-4 text-base text-ink outline-none transition duration-300 focus:border-ink focus:ring-2 focus:ring-cyan" name={name} required type={type} />
                  </label>
                ))}
                <label className="grid gap-2 font-semibold">
                  Sector
                  <select className="min-h-12 rounded-[0.85rem] border border-slate-300 px-4 text-base text-ink outline-none transition duration-300 focus:border-ink focus:ring-2 focus:ring-cyan" defaultValue={sector.name} name="sector" required>
                    {sectors.map((item) => (
                      <option key={item.id}>{item.name}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 font-semibold">
                  Preferred engagement
                  <select className="min-h-12 rounded-[0.85rem] border border-slate-300 px-4 text-base text-ink outline-none transition duration-300 focus:border-ink focus:ring-2 focus:ring-cyan" name="engagement" required>
                    {sharedPackages.slice(0, 5).map(([item]) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="mt-4 grid gap-2 font-semibold">
                Challenge summary
                <textarea className="min-h-32 rounded-[0.85rem] border border-slate-300 p-4 text-base text-ink outline-none transition duration-300 focus:border-ink focus:ring-2 focus:ring-cyan" name="message" placeholder="Describe the transformation challenge without sharing sensitive data." />
              </label>
              <label className="mt-4 flex gap-3 text-sm leading-6 text-slate-700">
                <input className="mt-1 size-4" required type="checkbox" />
                I consent to be contacted about this transformation enquiry and understand that sensitive information should not be shared through this public form.
              </label>
              <button className="mt-6 inline-flex min-h-12 rounded-full bg-ink px-6 py-4 text-sm font-bold text-paper transition duration-700 ease-fluid hover:bg-surface" type="submit">
                Submit transformation enquiry
              </button>
            </form>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
