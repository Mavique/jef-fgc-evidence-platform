"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, FileCheck2, GitBranch, Landmark, Network, Route, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { evidenceOfTransformation } from "@/content/home-evidence";

const proofIcons: LucideIcon[] = [Network, Route, FileCheck2, Landmark, GitBranch];

function proofMotion(index: number, reduceMotion: boolean | null) {
  if (reduceMotion) return {};

  return {
    initial: { opacity: 1, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.62, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] },
    viewport: { once: true, margin: "-12% 0px" }
  };
}

export function EvidenceOfTransformation() {
  const reduceMotion = useReducedMotion();
  const lineMotion = reduceMotion
    ? {}
    : {
        initial: { scaleY: 0.18, opacity: 1 },
        whileInView: { scaleY: 1, opacity: 1 },
        transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
        viewport: { once: true, margin: "-12% 0px" }
      };

  return (
    <section aria-labelledby="evidence-of-transformation-title" className="home-section relative overflow-hidden bg-surface">
      <div className="absolute inset-0 tech-grid opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_14%_20%,rgba(84,220,255,0.16),transparent_34rem),radial-gradient(ellipse_at_86%_82%,rgba(170,255,128,0.12),transparent_34rem)]" />
      <div className="absolute inset-0 noise-field opacity-[0.12]" />

      <div className="home-container relative grid gap-10 lg:grid-cols-[0.78fr_1.02fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">{evidenceOfTransformation.eyebrow}</p>
          <h2
            className="mt-5 max-w-3xl font-display text-[clamp(2.35rem,4.9vw,5.5rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-balance"
            id="evidence-of-transformation-title"
          >
            {evidenceOfTransformation.title}
          </h2>
          <p className="home-body mt-6 max-w-2xl text-paper/72">{evidenceOfTransformation.intro}</p>

          <div className="mt-7 grid gap-3 rounded-[1.2rem] border border-white/[0.1] bg-white/[0.045] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.18)]">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-cyan">Status discipline</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Current and pilot work", evidenceOfTransformation.sourceSummary.activeOrPilotProgrammes],
                ["Development-stage records", evidenceOfTransformation.sourceSummary.developmentStageProgrammes],
                ["Proposal-stage pathways", evidenceOfTransformation.sourceSummary.proposalStageProgrammes]
              ].map(([label, value]) => (
                <div className="rounded-[0.9rem] border border-white/[0.08] bg-ink/48 p-4" key={label}>
                  <p className="font-mono text-2xl font-semibold leading-none text-lime">{value}</p>
                  <p className="mt-3 text-xs font-semibold leading-5 text-paper/64">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-sm leading-6 text-paper/62">{evidenceOfTransformation.outcome}</p>

          <Link
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-cyan p-1.5 pl-6 text-sm font-bold text-ink transition duration-300 ease-fluid hover:bg-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan active:scale-[0.98] motion-reduce:transition-none"
            href={evidenceOfTransformation.cta.href}
          >
            {evidenceOfTransformation.cta.label}
            <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-ink text-paper">
              <ArrowUpRight size={16} />
            </span>
          </Link>
        </div>

        <div className="relative">
          <motion.div
            aria-hidden="true"
            className="absolute bottom-8 left-6 top-8 hidden w-px origin-top bg-gradient-to-b from-cyan/70 via-lime/48 to-white/0 md:block"
            {...lineMotion}
          />
          <ol className="grid gap-3">
            {evidenceOfTransformation.proofPoints.map((point, index) => {
              const Icon = proofIcons[index] ?? CheckCircle2;

              return (
                <motion.li className="relative md:pl-16" key={point.label} {...proofMotion(index + 1, reduceMotion)}>
                  <div
                    aria-hidden="true"
                    className="absolute left-0 top-6 hidden size-12 place-items-center rounded-full border border-cyan/35 bg-ink text-cyan shadow-[0_0_42px_rgba(84,220,255,0.16)] md:grid"
                  >
                    <Icon size={20} />
                  </div>
                  <article className="group relative overflow-hidden rounded-[1.2rem] border border-white/[0.1] bg-white/[0.05] p-5 shadow-[0_18px_80px_rgba(0,0,0,0.2)] transition duration-300 ease-fluid hover:-translate-y-1 hover:border-cyan/36 hover:bg-white/[0.07] motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:p-5">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/50 to-transparent opacity-70" />
                    <div className="flex items-start gap-4">
                      <div className="grid size-11 shrink-0 place-items-center rounded-full bg-cyan/12 text-cyan ring-1 ring-cyan/24 md:hidden">
                        <Icon aria-hidden="true" size={19} />
                      </div>
                      <div>
                        <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-lime">{point.label}</p>
                        <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.04em] text-paper md:text-3xl">{point.value}</h3>
                        <p className="mt-4 max-w-3xl text-sm leading-6 text-paper/68 md:text-base md:leading-7">{point.body}</p>
                      </div>
                    </div>
                  </article>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
