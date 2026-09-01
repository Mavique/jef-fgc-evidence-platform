"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/MotionPrimitives";
import {
  evidenceStatuses,
  fgcProduct,
  lifecycleStages,
  rubricAreas
} from "@/content/merseta-fgc";
import { xrMedia } from "@/content/xr-media";

const evidenceRules = [
  "Learner-use evidence and lecturer-capability evidence are never inferred from each other.",
  "Login counts, attendance and certificates do not automatically prove meaningful learning or independent capability.",
  "Timetables prove planned activity only; analytics and supporting artefacts must confirm actual use.",
  "Missing evidence is recorded as Not Verified. Conflicting sources are recorded as Contradicted."
];

export function FgcGateway() {
  return (
    <main className="w-full max-w-full overflow-x-hidden bg-ink text-paper">
      <section className="relative isolate min-h-[100dvh] overflow-hidden px-4 pb-20 pt-36 md:px-8 md:pt-32">
        <div className="absolute inset-0">
          <Image
            alt="JEF workshop and evidence-validation context"
            className="object-cover opacity-42 saturate-[0.92]"
            fill
            priority
            sizes="100vw"
            src={xrMedia.jefTransformingEducationBanner}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,13,0.98)_0%,rgba(5,8,13,0.78)_52%,rgba(5,8,13,0.4)_100%),linear-gradient(180deg,rgba(5,8,13,0.18),rgba(5,8,13,0.98))]" />
          <div className="tech-grid" />
          <div className="grain opacity-30" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-9rem)] max-w-7xl content-center gap-12 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <Reveal>
            <div className="mb-6 inline-flex max-w-full flex-wrap items-center gap-2 rounded-[1rem] bg-white/[0.08] p-1.5 text-xs font-semibold text-paper ring-1 ring-white/[0.14] backdrop-blur-xl">
              <span className="rounded-[0.78rem] bg-cyan px-3 py-1.5 text-ink">Evidence platform</span>
              <span className="px-3 py-1.5 text-paper/72">Source-aligned frontend-first build</span>
            </div>
            <h1 className="max-w-5xl font-display text-[clamp(3rem,7vw,7.4rem)] font-semibold leading-[0.86] tracking-[-0.066em] text-balance">
              {fgcProduct.name}
            </h1>
            <p className="mt-7 max-w-3xl text-xl leading-9 text-paper/[0.78] md:text-2xl md:leading-10">
              {fgcProduct.descriptor} for answering two merSETA FGC questions with traceable evidence, not assumptions.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-paper p-1.5 pl-6 text-sm font-bold text-ink transition duration-700 ease-fluid hover:bg-lime active:scale-[0.98]" href="/fgc-ekm/sign-in">
                Secure sign-in
                <span className="grid size-8 place-items-center rounded-full bg-ink text-paper transition duration-700 ease-fluid group-hover:translate-x-1">↗</span>
              </Link>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-paper ring-1 ring-white/[0.14] transition duration-700 ease-fluid hover:bg-white/[0.14]" href={fgcProduct.appRoute}>
                View demo observatory
              </Link>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-paper ring-1 ring-white/[0.14] transition duration-700 ease-fluid hover:bg-white/[0.14]" href="#source-truth">
                View evidence rules
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <aside className="signal-frame rounded-[1.35rem] border border-white/[0.12] bg-white/[0.06] p-5 backdrop-blur-xl">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">The two questions stay separate</p>
              <div className="mt-5 grid gap-3">
                {fgcProduct.governingQuestions.map((question, index) => (
                  <article className="rounded-[1.05rem] bg-ink/70 p-5 ring-1 ring-white/[0.1]" key={question}>
                    <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-lime">FGC Question {index + 1}</span>
                    <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.04em]">{question}</h2>
                  </article>
                ))}
              </div>
            </aside>
          </Reveal>
        </div>
      </section>

      <section id="source-truth" className="bg-surface px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.84fr_1.16fr]">
          <Reveal>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-cyan">Source of truth</p>
            <h2 className="font-display text-[clamp(2.5rem,5.3vw,5.8rem)] font-semibold leading-[0.88] tracking-[-0.06em]">Evidence rules before dashboard theatre.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-paper/[0.68]">
              The app is structured around the agenda, workbook, validation toolkit and facilitator guide supplied for the September 2026 FGC evidence-validation workshop.
            </p>
          </Reveal>
          <div className="grid gap-4">
            {evidenceRules.map((rule, index) => (
              <Reveal delay={index * 0.06} key={rule}>
                <article className="rounded-[1.2rem] border border-white/[0.1] bg-white/[0.055] p-6">
                  <span className="font-mono text-xs text-lime">{String(index + 1).padStart(2, "0")}</span>
                  <p className="mt-4 text-xl font-semibold leading-8 tracking-[-0.035em]">{rule}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal className="grid gap-8 md:grid-cols-[0.95fr_1.05fr] md:items-end">
            <h2 className="font-display text-[clamp(2.5rem,5.4vw,6rem)] font-semibold leading-[0.88] tracking-[-0.06em]">A working platform spine, not a brochure page.</h2>
            <p className="max-w-2xl text-lg leading-8 text-paper/[0.68]">
              The frontend-first app models the operational flow from pre-work evidence readiness through moderation, sign-off and corrective action.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {lifecycleStages.map((stage, index) => (
              <Reveal delay={index * 0.025} key={stage}>
                <article className="min-h-36 rounded-[1.1rem] border border-white/[0.1] bg-white/[0.045] p-5">
                  <span className="font-mono text-[0.68rem] text-cyan">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 text-xl font-semibold leading-tight tracking-[-0.035em]">{stage}</h3>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper px-4 py-24 text-ink md:px-8 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-canopy">Validation language</p>
            <h2 className="font-display text-[clamp(2.45rem,5.1vw,5.8rem)] font-semibold leading-[0.88] tracking-[-0.06em]">Shared words for defensible findings.</h2>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(evidenceStatuses).map(([status, meta]) => (
              <Reveal key={status}>
                <article className="rounded-[1.2rem] border border-ink/10 bg-white p-6 shadow-[0_24px_80px_rgba(5,8,13,0.08)]">
                  <span className="rounded-full bg-ink px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-paper">{status}</span>
                  <p className="mt-5 leading-7 text-ink/72">{meta.explanation}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-7xl rounded-[1.35rem] bg-ink p-6 text-paper md:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Lecturer capability rubric</p>
          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {rubricAreas.map((area) => (
              <span className="rounded-[0.9rem] bg-white/[0.08] px-4 py-4 text-sm font-semibold ring-1 ring-white/[0.1]" key={area}>{area}</span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
