"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { BrandFilmFeature } from "@/components/home/BrandFilmFeature";
import { EvidenceOfTransformation } from "@/components/home/EvidenceOfTransformation";
import { KnowledgeResources } from "@/components/home/KnowledgeResources";
import { PartnerWithJef } from "@/components/home/PartnerWithJef";
import { ProgrammeExplorer } from "@/components/home/ProgrammeExplorer";
import { TransformationPathway } from "@/components/home/TransformationPathway";
import { Reveal } from "@/components/MotionPrimitives";
import { SpatialField } from "@/components/SpatialField";
import { xrMedia } from "@/content/xr-media";

const heroImage = xrMedia.jefXrExpoHeadsetDemo;

const challengeSignals = [
  "Disconnected technology investments",
  "Limited practical and immersive learning",
  "Weak transitions between education and work",
  "Underused digital infrastructure",
  "Fragmented capability evidence",
  "Limited institutional readiness for AI"
];

const capabilities = [
  {
    title: "Artificial Intelligence",
    description:
      "Responsible AI strategy, knowledge systems, workflow intelligence, supervised automation and institutional decision support.",
    outcome: "Helps leaders and teams redesign work around trusted information, oversight and measurable adoption.",
    href: "/programmes/ai-services",
    image: xrMedia.mixedRealityDeviceCollage,
    alt: "Mixed reality device collage representing applied intelligence and systems design"
  },
  {
    title: "Extended Reality",
    description:
      "Immersive teaching, simulation, practice, assessment support, content creation and safer preparation for real-world performance.",
    outcome: "Gives learners, lecturers and workers space to practise complex tasks before workplace consequences are real.",
    href: "/programmes/vocle-xr",
    image: xrMedia.jefVocleXrExpoDemo,
    alt: "Learner using a VR headset during a JEF immersive learning demonstration"
  },
  {
    title: "Spatial Intelligence",
    description:
      "Digital twins, spatial platforms, asset and place intelligence, contextual guidance and data-informed institutional transformation.",
    outcome: "Connects people, places, assets and services so decisions are made with clearer operational context.",
    href: "/programmes/spatial-enterprise",
    image: xrMedia.spatialAiRoboticsFactory,
    alt: "Spatial AI robotics factory environment with digital workflow overlays"
  }
];

const transformationModel = [
  ["Diagnose", "Understand the institutional challenge, people, systems and readiness."],
  ["Design", "Define the transformation architecture, use cases and implementation pathway."],
  ["Build", "Establish platforms, labs, workflows, content and enabling infrastructure."],
  ["Activate", "Develop people, embed adoption and launch practical use."],
  ["Evidence and Scale", "Measure implementation, govern evidence and strengthen what works."]
];

const audiencePathways = [
  {
    audience: "TVET Colleges and Education Institutions",
    challenge: "Curriculum, labs and lecturer development often operate as separate projects.",
    capability: "XR labs, immersive learning, AI support and evidence-led adoption.",
    href: "/programmes/xr-labs-tvet-colleges"
  },
  {
    audience: "Government and Municipalities",
    challenge: "Digital public-service ideas need governance, workflows and public-value evidence.",
    capability: "Spatial intelligence, service redesign and responsible AI readiness.",
    href: "/services#government"
  },
  {
    audience: "SETAs and Funders",
    challenge: "Skills investments need clearer implementation evidence and sustainable pathways.",
    capability: "Programme design, adoption intelligence and capability evidence systems.",
    href: "/programmes/merseta-fgc-ekm"
  },
  {
    audience: "Enterprises and Employers",
    challenge: "AI and automation create value only when work, people and safeguards are redesigned together.",
    capability: "Workplace 4.0, enterprise transformation and human-AI operating models.",
    href: "/programmes/workplace-4"
  },
  {
    audience: "Technology and Implementation Partners",
    challenge: "Solutions need local context, adoption support and institutional delivery capacity.",
    capability: "Joint implementation pathways for AI, XR, spatial systems and skills ecosystems.",
    href: "/partnerships"
  }
];

const deliveryThemes = [
  "Working across education and skills ecosystems",
  "Supporting institutional adoption of immersive learning",
  "Building implementation pathways with public and private partners",
  "Using evidence-led programme design and improvement"
];

const humanGroups = [
  ["Learners", "Make complex concepts visible, practical and connected to future work."],
  ["Lecturers and facilitators", "Strengthen teaching practice with immersive tools, AI support and usable evidence."],
  ["Young people entering work", "Connect capability development to portfolios, missions and opportunity pathways."],
  ["Institutional leaders", "Move from isolated innovation projects to governed systems that can be adopted."],
  ["Workers and entrepreneurs", "Develop practical digital, AI and operational capability inside real work contexts."],
  ["Communities", "Use technology to improve access, participation, services and locally relevant development."]
];

function HomepageButton({
  href,
  children,
  variant = "primary"
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "light";
}) {
  const styles = {
    primary: "bg-cyan text-ink shadow-[0_0_64px_rgba(84,220,255,0.22)] hover:bg-lime",
    secondary: "bg-white/[0.08] text-paper ring-1 ring-white/[0.16] hover:bg-white/[0.14]",
    light: "bg-ink text-paper hover:bg-surface"
  };

  return (
    <Link
      className={`group inline-flex min-h-12 items-center justify-center gap-3 rounded-full p-1.5 pl-6 text-sm font-bold transition duration-300 ease-fluid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan active:scale-[0.98] ${styles[variant]}`}
      href={href}
    >
      {children}
      <span
        aria-hidden="true"
        className={`grid size-8 place-items-center rounded-full transition duration-300 ease-fluid group-hover:translate-x-0.5 ${
          variant === "primary" ? "bg-ink text-paper" : "bg-paper text-ink"
        }`}
      >
        <ArrowUpRight size={16} />
      </span>
    </Link>
  );
}

function SectionIntro({
  eyebrow,
  title,
  body,
  dark = true
}: {
  eyebrow: string;
  title: string;
  body: string;
  dark?: boolean;
}) {
  return (
    <Reveal className="grid gap-6 lg:grid-cols-[0.86fr_0.74fr] lg:items-end">
      <div>
        <p className={`font-mono text-xs uppercase tracking-[0.18em] ${dark ? "text-cyan" : "text-canopy"}`}>{eyebrow}</p>
        <h2 className="mt-5 max-w-4xl font-display text-[clamp(2.4rem,5vw,5.7rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-balance">
          {title}
        </h2>
      </div>
      <p className={`home-body max-w-2xl ${dark ? "text-paper/70" : "text-ink/72"}`}>{body}</p>
    </Reveal>
  );
}

export function LandingHomeExperience() {

  return (
    <main id="main-content" className="w-full max-w-full overflow-x-hidden bg-ink text-paper">
      <section className="relative isolate min-h-[78dvh] overflow-hidden px-4 pb-12 pt-28 md:px-8 md:pb-16 md:pt-32">
        <div className="absolute inset-0">
          <Image
            alt="JEF XR exhibition demonstration with headset-based learning"
            className="object-cover opacity-55 saturate-[0.86]"
            fill
            priority
            sizes="100vw"
            src={heroImage}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,13,0.98)_0%,rgba(5,8,13,0.86)_48%,rgba(5,8,13,0.44)_100%),linear-gradient(180deg,rgba(5,8,13,0.16),rgba(5,8,13,0.98)_92%)]" />
          <div className="tech-grid opacity-45" />
          <div className="grain opacity-30" />
          <div className="absolute right-0 top-0 hidden h-full w-1/2 opacity-45 lg:block">
            <SpatialField />
          </div>
        </div>

        <div className="home-container relative z-10 grid min-h-[calc(78dvh-7rem)] content-center gap-10 lg:grid-cols-[1.08fr_0.52fr] lg:items-end">
          <motion.div
            className="max-w-5xl"
            initial={false}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-7 inline-flex flex-wrap gap-1.5 rounded-[1.1rem] bg-ink/64 p-1.5 text-xs font-semibold text-paper ring-1 ring-white/[0.14] backdrop-blur-xl">
              <span className="rounded-[0.82rem] bg-cyan px-3 py-1.5 text-ink">AI · XR · Spatial Intelligence</span>
              <span className="px-3 py-1.5 text-paper/76">Education, training and skills at the centre</span>
            </div>
            <p className="mb-4 max-w-2xl text-sm font-semibold uppercase tracking-[0.16em] text-lime">
              Jengrac Education Foundation
            </p>
            <h1 className="max-w-[1060px] font-display text-[clamp(2.75rem,6.5vw,7rem)] font-semibold leading-[0.88] tracking-[-0.06em] text-balance">
              We build intelligent systems that transform how Africa learns, works and develops capability.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-paper/[0.8] md:text-xl md:leading-9">
              Jengrac Education Foundation combines Artificial Intelligence, Extended Reality and Spatial Intelligence to help education institutions, government and enterprises build practical skills, modernise operations and prepare people for the future of work.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <HomepageButton href="/programmes">Explore programmes</HomepageButton>
              <HomepageButton href="#jef-brand-film-title" variant="secondary">
                Watch the JEF film
              </HomepageButton>
            </div>
          </motion.div>

          <motion.aside
            aria-label="Homepage transformation summary"
            className="signal-frame scanline-panel rounded-[1.35rem] border border-white/[0.12] bg-white/[0.055] p-5 backdrop-blur-xl"
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-cyan">Institutional transformation</p>
            <h2 className="mt-4 text-3xl font-semibold leading-none tracking-[-0.04em]">
              Technology becomes valuable when people, institutions and implementation systems move together.
            </h2>
            <div className="mt-6 grid gap-3">
              {["Learning systems", "Workforce capability", "Evidence-led adoption"].map((item) => (
                <div className="flex min-h-12 items-center gap-3 rounded-[0.95rem] border border-white/[0.08] bg-ink/46 px-4 py-3" key={item}>
                  <CheckCircle2 aria-hidden="true" className="shrink-0 text-lime" size={18} />
                  <span className="text-sm text-paper/76">{item}</span>
                </div>
              ))}
            </div>
          </motion.aside>
        </div>
      </section>

      <BrandFilmFeature />

      <TransformationPathway />

      <section className="home-section-tight home-rule-top relative overflow-hidden bg-surface">
        <div className="absolute inset-0 noise-field opacity-[0.16]" />
        <div className="home-container relative">
          <SectionIntro
            eyebrow="The challenge JEF addresses"
            title="The gap is not devices. It is adoption, capability and evidence."
            body="Many institutions already have platforms and pilots. The harder work is turning them into useful learning, better services and sustainable implementation."
          />

          <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {challengeSignals.map((signal, index) => (
              <Reveal delay={index * 0.035} key={signal}>
                <article className="flex min-h-24 gap-4 rounded-[1.1rem] border border-white/[0.1] bg-white/[0.045] p-4 md:p-5">
                  <span className="font-mono text-xs text-lime">{String(index + 1).padStart(2, "0")}</span>
                  <p className="text-base font-semibold leading-7 tracking-[-0.025em] text-paper/88 md:text-lg">{signal}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section relative overflow-hidden bg-ink">
        <div className="absolute inset-0 tech-grid opacity-30" />
        <div className="home-container relative">
          <SectionIntro
            eyebrow="Core capabilities"
            title="AI, XR and spatial intelligence, organised around human capability."
            body="JEF’s technology pillars are not presented as isolated products. They are used to help institutions teach better, redesign work, govern adoption and strengthen practical performance."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {capabilities.map((capability, index) => (
              <Reveal delay={index * 0.06} key={capability.title}>
                <Link
                  className="group grid h-full grid-cols-[7.5rem_1fr] overflow-hidden rounded-[1.35rem] border border-white/[0.11] bg-white/[0.045] transition duration-300 ease-fluid hover:-translate-y-1 hover:border-cyan/40 hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan md:block"
                  href={capability.href}
                >
                  <div className="relative min-h-full overflow-hidden md:aspect-[1.62]">
                    <Image
                      alt={capability.alt}
                      className="object-cover transition duration-500 ease-fluid group-hover:scale-[1.04]"
                      fill
                      sizes="(min-width: 1024px) 31vw, 100vw"
                      src={capability.image}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,13,0.06),rgba(5,8,13,0.82))]" />
                  </div>
                  <div className="p-4 md:p-6">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-lime">{capability.title}</p>
                    <p className="mt-3 text-sm leading-6 text-paper/76 md:mt-5 md:text-lg md:leading-7">{capability.description}</p>
                    <p className="mt-5 hidden rounded-[0.9rem] bg-ink/58 p-4 text-sm leading-6 text-paper/66 sm:block">{capability.outcome}</p>
                    <span className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-white/[0.08] px-3 text-sm font-semibold text-paper ring-1 ring-white/[0.12] transition duration-300 ease-fluid group-hover:bg-cyan group-hover:text-ink md:mt-6 md:min-h-11 md:px-4">
                      Open capability
                      <ArrowRight aria-hidden="true" size={15} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section-tight relative overflow-hidden bg-paper text-ink">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_14%,rgba(84,220,255,0.22),transparent_34rem),radial-gradient(ellipse_at_12%_80%,rgba(170,255,128,0.18),transparent_30rem)]" />
        <div className="home-container relative">
          <SectionIntro
            eyebrow="JEF transformation model"
            title="The operating model connects planning, build, activation and improvement."
            body="JEF is not a technology reseller. The work connects platforms, labs, people, governance and continuous improvement."
            dark={false}
          />

          <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {transformationModel.map(([stage, body], index) => (
              <Reveal delay={index * 0.04} key={stage}>
                <article className="relative h-full rounded-[1.1rem] border border-ink/10 bg-white/76 p-5 shadow-[0_18px_60px_rgba(5,8,13,0.08)] sm:min-h-[210px]">
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-canopy">Stage {index + 1}</span>
                  <h3 className="mt-5 text-2xl font-semibold leading-none tracking-[-0.04em]">{stage}</h3>
                  <p className="mt-4 text-sm leading-6 text-ink/68">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section-tight relative overflow-hidden bg-surface">
        <div className="absolute inset-0 noise-field opacity-[0.16]" />
        <div className="home-container relative">
          <SectionIntro
            eyebrow="Audience pathways"
            title="Choose the institutional pathway that matches the challenge."
            body="The same technology stack serves different responsibilities. Each entry point starts with the visitor’s likely problem and routes them to a relevant JEF destination."
          />

          <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {audiencePathways.map((pathway, index) => (
              <Reveal delay={index * 0.045} key={pathway.audience}>
                <Link
                  className="group flex h-full min-h-[210px] flex-col justify-between rounded-[1.2rem] border border-white/[0.1] bg-white/[0.052] p-5 transition duration-300 ease-fluid hover:-translate-y-1 hover:border-lime/45 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
                  href={pathway.href}
                >
                  <div>
                    <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-cyan">Pathway {index + 1}</span>
                    <h3 className="mt-5 text-2xl font-semibold leading-none tracking-[-0.04em]">{pathway.audience}</h3>
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-paper/62">{pathway.challenge}</p>
                  </div>
                  <p className="mt-6 border-t border-white/10 pt-5 text-sm font-semibold leading-6 text-lime">{pathway.capability}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ProgrammeExplorer />

      <EvidenceOfTransformation />

      <KnowledgeResources />

      <PartnerWithJef />

      <section className="home-section-tight relative overflow-hidden bg-paper text-ink">
        <div className="home-container relative grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <Reveal>
            <div className="relative min-h-[280px] overflow-hidden rounded-[1.35rem] bg-ink">
              <Image
                alt="JEF industry briefing with institutional participants"
                className="object-cover"
                fill
                sizes="(min-width: 1024px) 44vw, 100vw"
                src={xrMedia.jefIndustryBriefing}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,13,0.08),rgba(5,8,13,0.7))]" />
              <div className="absolute bottom-5 left-5 right-5 rounded-[1rem] border border-white/[0.14] bg-ink/72 p-4 text-paper backdrop-blur-xl">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-lime">Delivery posture</p>
                <p className="mt-2 text-sm leading-6 text-paper/74">Strategic technology only matters when people can adopt it and institutions can sustain it.</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-canopy">Delivery credibility</p>
            <h2 className="mt-5 max-w-3xl font-display text-[clamp(2.25rem,4.4vw,5rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
              Credible transformation is built through implementation, adoption support and evidence.
            </h2>
            <div className="mt-8 grid gap-3">
              {deliveryThemes.map((theme) => (
                <div className="flex gap-3 rounded-[1rem] border border-ink/10 bg-white/74 p-4" key={theme}>
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-canopy" size={18} />
                  <p className="leading-7 text-ink/72">{theme}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="home-section-tight relative overflow-hidden bg-surface">
        <div className="absolute inset-0 noise-field opacity-[0.14]" />
        <div className="home-container relative">
          <SectionIntro
            eyebrow="Human-centred impact"
            title="The point of intelligent technology is stronger human capability."
            body="JEF’s public story is not about devices alone. It is about learners, lecturers, workers, leaders, entrepreneurs and communities gaining practical ways to learn, work and participate."
          />

          <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {humanGroups.map(([group, body], index) => (
              <Reveal delay={index * 0.035} key={group}>
                <article className="min-h-40 rounded-[1.1rem] border border-white/[0.1] bg-white/[0.045] p-5 md:p-6">
                  <h3 className="text-2xl font-semibold tracking-[-0.04em] md:text-3xl">{group}</h3>
                  <p className="mt-5 leading-7 text-paper/68">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section-tight relative overflow-hidden bg-ink">
        <div className="absolute inset-0">
          <Image
            alt="JEF presentation stage showing integrated platforms for education, skills and opportunity"
            className="object-cover opacity-28 saturate-[0.82]"
            fill
            sizes="100vw"
            src={xrMedia.jefXrPresentationStage2}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,13,0.96),rgba(5,8,13,0.78)),linear-gradient(180deg,rgba(5,8,13,0.18),rgba(5,8,13,0.94))]" />
        </div>
        <Reveal className="home-container relative">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Partnership opportunity</p>
          <h2 className="mt-5 max-w-5xl font-display text-[clamp(2.55rem,5.4vw,6.2rem)] font-semibold leading-[0.88] tracking-[-0.055em] text-balance">
            Build the next institutional transformation system with JEF.
          </h2>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-paper/72 md:text-xl md:leading-9">
            JEF works with education institutions, government, SETAs, funders, employers, municipalities and technology partners who need practical systems for AI, XR, spatial intelligence and capability development.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <HomepageButton href="#partner-with-jef">Choose partnership pathway</HomepageButton>
            <HomepageButton href="/programmes" variant="secondary">
              Explore programmes
            </HomepageButton>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
