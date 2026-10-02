"use client";

import Link from "next/link";
import { BarChart3, Compass, DraftingCompass, Rocket, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

type TransformationStage = {
  number: "01" | "02" | "03" | "04";
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
};

const transformationStages: TransformationStage[] = [
  {
    number: "01",
    title: "Discover the need",
    description:
      "We examine institutional priorities, learner and lecturer needs, implementation barriers and emerging opportunities.",
    icon: Compass
  },
  {
    number: "02",
    title: "Design the intervention",
    description:
      "We combine curriculum, technology, capability development and partnership models into practical programmes.",
    icon: DraftingCompass
  },
  {
    number: "03",
    title: "Activate in context",
    description:
      "We support institutions, educators and delivery partners to move solutions from planning into real environments.",
    icon: Rocket
  },
  {
    number: "04",
    title: "Measure and strengthen",
    description:
      "We use evidence, participation data and implementation findings to improve delivery and inform the next action.",
    icon: BarChart3
  }
];

export function TransformationPathway() {
  const prefersReducedMotion = useReducedMotion();
  const sectionMotion = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 28 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
        viewport: { once: true, margin: "-12% 0px" }
      };
  const routeMotion = prefersReducedMotion
    ? {}
    : {
        initial: { scaleX: 0, opacity: 0 },
        whileInView: { scaleX: 1, opacity: 1 },
        transition: { duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] },
        viewport: { once: true, margin: "-12% 0px" }
      };

  return (
    <section aria-labelledby="transformation-pathway-title" className="home-section relative overflow-hidden bg-paper text-ink">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_20%,rgba(84,220,255,0.22),transparent_30rem),radial-gradient(ellipse_at_86%_72%,rgba(170,255,128,0.18),transparent_34rem)]" />
      <div className="absolute inset-0 noise-field opacity-[0.16]" />
      <motion.div className="home-container relative" {...sectionMotion}>
        <div className="grid gap-7 lg:grid-cols-[0.82fr_0.78fr] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-canopy">How transformation moves</p>
            <h2
              className="mt-5 max-w-4xl font-display text-[clamp(2.45rem,5vw,5.9rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-balance"
              id="transformation-pathway-title"
            >
              From opportunity to measurable transformation
            </h2>
          </div>
          <div className="max-w-2xl">
            <p className="home-body text-ink/72">
              JEF works with education, government and industry partners to identify priority needs, design practical interventions, activate programmes and use evidence to guide continuous improvement.
            </p>
            <Link
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-5 text-sm font-bold text-paper transition duration-300 ease-fluid hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-canopy motion-reduce:transition-none"
              href="/programmes"
            >
              Explore our programmes
            </Link>
          </div>
        </div>

        <div className="relative mt-10 md:mt-12">
          <motion.div
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-[2.75rem] hidden h-px origin-left bg-gradient-to-r from-canopy/20 via-cyan/70 to-lime/60 xl:block"
            {...routeMotion}
          />
          <div aria-hidden="true" className="absolute bottom-0 left-8 top-2 w-px bg-gradient-to-b from-cyan/70 via-canopy/34 to-lime/54 md:hidden" />
          <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {transformationStages.map((stage, index) => {
              const Icon = stage.icon;
              const stageMotion = prefersReducedMotion
                ? {}
                : {
                    initial: { opacity: 0, y: 24 },
                    whileInView: { opacity: 1, y: 0 },
                    transition: { duration: 0.65, delay: 0.08 + index * 0.08, ease: [0.16, 1, 0.3, 1] },
                    viewport: { once: true, margin: "-12% 0px" }
                  };

              return (
                <motion.li className="relative" key={stage.number} {...stageMotion}>
                  <article className="group relative h-full overflow-hidden rounded-[1.15rem] border border-ink/10 bg-white/78 p-5 shadow-[0_18px_70px_rgba(5,8,13,0.08)] transition duration-300 ease-fluid hover:-translate-y-1 hover:border-canopy/30 hover:bg-white focus-within:-translate-y-1 focus-within:border-canopy/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:focus-within:translate-y-0 md:min-h-[240px]">
                    <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan/55 via-canopy/42 to-lime/50 opacity-80" />
                    <div className="flex items-center gap-4 md:block">
                      <div className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full bg-ink text-paper shadow-[0_0_34px_rgba(84,220,255,0.2)] ring-4 ring-white">
                        <Icon aria-hidden="true" size={23} />
                      </div>
                      <span className="font-mono text-xs uppercase tracking-[0.18em] text-canopy md:mt-6 md:block">{stage.number}</span>
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold leading-none tracking-[-0.04em] text-ink">{stage.title}</h3>
                    <p className="mt-4 text-sm leading-6 text-ink/68">{stage.description}</p>
                    {stage.href ? (
                      <Link
                        className="mt-5 inline-flex min-h-11 items-center rounded-full bg-ink/6 px-4 text-sm font-bold text-ink ring-1 ring-ink/10 transition hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-canopy"
                        href={stage.href}
                      >
                        Open stage
                      </Link>
                    ) : null}
                  </article>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </motion.div>
    </section>
  );
}
