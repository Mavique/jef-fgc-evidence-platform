"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { impactRecords, pathways, programmes } from "@/content/site";
import { Reveal, WordReveal } from "@/components/MotionPrimitives";
import { SpatialField } from "@/components/SpatialField";
import { xrMedia } from "@/content/xr-media";

const clarityTiles = [
  {
    label: "Artificial Intelligence",
    title: "AI that supports learning and workplace readiness.",
    body:
      "JEF uses AI concepts for tutoring support, feedback, assessment signals and skills evidence. The goal is not generic automation. It is better learning decisions for educators, learners and organisations.",
    image: xrMedia.spatialAiRoboticsFactory,
    alt: "Learner using an AI assisted digital learning interface"
  },
  {
    label: "Extended Reality",
    title: "XR simulations for practice before real-world performance.",
    body:
      "Extended Reality helps people practise complex tasks, safety routines, professional scenarios and spatial concepts in immersive environments before they are assessed or deployed.",
    image: xrMedia.xrSpaceScienceLearning,
    alt: "Professional wearing a VR headset during immersive training"
  },
  {
    label: "Education and skills",
    title: "Education stays at the centre of the technology.",
    body:
      "The platform connects schools, TVET colleges, training providers, employers and public partners around practical capability development, not technology for its own sake.",
    image: xrMedia.jefArLearningClassroomTablets,
    alt: "Learners using AR tablets and textbooks in a classroom environment"
  }
];

const heroProofPoints = ["AI learning support", "XR simulation practice", "Skills evidence for work"];

const visualLibrary = {
  ai: xrMedia.industrialXrInterface,
  vr: xrMedia.xrDeviceIndustrialHologram,
  ar: xrMedia.arManufacturingDigitalTwin,
  classroom: xrMedia.xrSpaceScienceLearning,
  skills: xrMedia.jefLargeTrainingRoom,
  city: xrMedia.arLabInspection,
  enterprise: xrMedia.vrRoboticsWorkcell,
  robotics: xrMedia.roboticsSensorCar,
  workshop: xrMedia.jefSmallWorkshopDemo,
  workplace: xrMedia.industrialDataXrWorker,
  ignite: xrMedia.jefXrPresentationStage2
};

const programmeVisuals: Record<string, string> = {
  "vocle-xr": xrMedia.jefVocleXrExpoDemo,
  "ai-services": xrMedia.spatialAiCollaborationRoom,
  icampus: xrMedia.jefDigitalClassroomSession,
  worxstream: visualLibrary.skills,
  "workplace-4": visualLibrary.workplace,
  "spatial-enterprise": xrMedia.jefSpatialAiIndustrialTraining,
  "gig-economy-accelerator": visualLibrary.workshop,
  "spatial-ai-city": xrMedia.jefSpatialAiCommercialWorkshop,
  "digital-transformation-hubs": xrMedia.jefCollegeComputerLab,
  "prolific-edge": xrMedia.vrIndustrialFactoryTour,
  "workgrid-labs": xrMedia.jefWorkshopAuditoriumWide,
  "merseta-fgc-ekm": xrMedia.jefTransformingEducationBanner,
  "xr-labs-tvet-colleges": xrMedia.jefArLearningWorkshopWide,
  "xr-basic-education": xrMedia.girlRoboticsLab,
  "jef-ignite-institute": visualLibrary.ignite
};

function ArrowMark() {
  return (
    <span className="grid size-8 place-items-center rounded-[0.8rem] bg-ink text-paper transition duration-700 ease-fluid group-hover:translate-x-1 group-hover:-translate-y-0.5 group-hover:bg-lime group-hover:text-ink">
      <span aria-hidden>↗</span>
    </span>
  );
}

function TechButton({
  href,
  children,
  variant = "primary"
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      className={`group inline-flex min-h-12 items-center gap-3 rounded-full p-1.5 pl-6 text-sm font-semibold transition duration-700 ease-fluid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan active:scale-[0.98] ${
        variant === "primary"
          ? "bg-paper text-ink shadow-[0_0_70px_rgba(84,220,255,0.22)] hover:bg-lime"
          : "bg-white/[0.08] text-paper ring-1 ring-white/[0.16] hover:bg-white/[0.14]"
      }`}
      href={href}
    >
      {children}
      <ArrowMark />
    </Link>
  );
}

export function Hero() {
  const telemetry = [
    ["Spatial graph", "Live"],
    ["XR simulation", "Ready"],
    ["Skills evidence", "Evidence-led"],
    ["AI feedback", "Active"]
  ];

  return (
    <section className="relative isolate min-h-[84dvh] overflow-hidden bg-ink text-paper">
      <div className="absolute inset-0">
        <SpatialField />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,13,0.98)_0%,rgba(5,8,13,0.78)_45%,rgba(5,8,13,0.28)_100%),linear-gradient(180deg,rgba(5,8,13,0.1),rgba(5,8,13,0.98))]" />
        <div className="tech-grid" />
        <div className="grain opacity-35" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[84dvh] max-w-7xl content-center gap-12 px-4 pb-16 pt-32 md:px-8 lg:grid-cols-[1.02fr_0.64fr] lg:items-end">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[980px]"
        >
          <div className="mb-8 inline-flex flex-wrap gap-1.5 rounded-[1.15rem] bg-ink/55 p-1.5 text-xs font-medium text-paper ring-1 ring-white/[0.14] backdrop-blur-xl">
            <span className="rounded-[0.85rem] bg-cyan px-3 py-1.5 font-bold text-ink">AI + XR company</span>
            <span className="px-3 py-1.5 text-paper/76">Education, training and skills at the centre</span>
          </div>
          <h1 className="max-w-[1050px] font-display text-[clamp(3.25rem,8vw,8.7rem)] font-semibold leading-[0.84] tracking-[-0.065em] text-balance">
            Spatial intelligence for the skills economy.
          </h1>
          <div className="mt-8 grid max-w-5xl gap-8 md:grid-cols-[1.05fr_0.78fr] md:items-end">
            <p className="max-w-2xl text-lg leading-8 text-paper/[0.78] md:text-2xl md:leading-9">
              Jengrac Education Foundation builds Artificial Intelligence and Extended Reality systems that make education, training and skills development measurable, immersive and work-ready.
            </p>
            <div className="flex flex-wrap gap-3 md:justify-start">
              <TechButton href="/programmes/dxhub">View DxHub</TechButton>
              <TechButton href="/contact" variant="secondary">
                Talk to JEF
              </TechButton>
            </div>
          </div>
          <div className="mt-8 flex max-w-4xl flex-wrap gap-2">
            {heroProofPoints.map((point) => (
              <span className="rounded-full border border-white/[0.12] bg-white/[0.07] px-4 py-2 text-sm font-medium text-paper/[0.78]" key={point}>
                {point}
              </span>
            ))}
          </div>
        </motion.div>
        <motion.aside
          aria-label="Platform signal panel"
          className="signal-frame scanline-panel hidden overflow-hidden rounded-[1.35rem] border border-white/[0.12] bg-white/[0.06] p-5 backdrop-blur-xl lg:block"
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.1, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-paper/58">
            <span>JEF Spatial OS</span>
            <span className="text-lime">Online</span>
          </div>
          <div className="mt-5 grid gap-3">
            {telemetry.map(([label, state], index) => (
              <div className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-[0.9rem] border border-white/[0.08] bg-ink/42 px-4 py-3" key={label}>
                <span className="text-sm text-paper/74">{label}</span>
                <span className={`font-mono text-[0.68rem] uppercase tracking-[0.16em] ${index === 2 ? "text-amber" : "text-cyan"}`}>{state}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 h-28 overflow-hidden rounded-[1rem] border border-cyan/20 bg-ink/58">
            <div className="noise-field h-full opacity-80" />
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

export function VisualClarity() {
  return (
    <section className="relative overflow-hidden bg-surface px-4 py-20 text-paper md:px-8 md:py-32">
      <div className="absolute inset-0 noise-field opacity-[0.18]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.74fr_1.26fr] lg:items-start">
        <Reveal>
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-cyan">Plain-language overview</p>
          <h2 className="max-w-xl font-display text-[clamp(2.55rem,5vw,5.8rem)] font-semibold leading-[0.88] tracking-[-0.055em]">
            JEF turns advanced technology into practical learning and work capability.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-paper/[0.7]">
            A visitor should understand the simple idea first: JEF builds digital systems that help people learn, practise, prove skills and connect those skills to real opportunities.
          </p>
        </Reveal>
        <div className="grid gap-4">
          {clarityTiles.map((tile, index) => (
            <Reveal delay={index * 0.06} key={tile.label}>
              <article className="grid overflow-hidden rounded-[1.25rem] border border-white/[0.11] bg-white/[0.045] md:grid-cols-[0.42fr_0.58fr]">
                <div className="relative min-h-56 overflow-hidden md:min-h-full">
                  <Image
                    alt={tile.alt}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1024px) 32vw, 100vw"
                    src={tile.image}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,13,0.12),rgba(5,8,13,0.72))]" />
                </div>
                <div className="p-6 md:p-8">
                  <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-lime">{tile.label}</span>
                  <h3 className="mt-5 max-w-xl text-3xl font-semibold leading-[0.96] tracking-[-0.045em] md:text-4xl">{tile.title}</h3>
                  <p className="mt-5 max-w-2xl leading-7 text-paper/[0.68]">{tile.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Mandate() {
  const systems = [
    ["AI tutoring layer", "Adaptive learning support, assessment signals and practical feedback loops."],
    ["XR simulation layer", "Immersive practice environments for learners, educators and workforce teams."],
    ["Skills graph", "Capability evidence mapped from learning activity to workplace readiness."],
    ["Deployment layer", "Programmes that reach schools, training providers, enterprises and public partners."]
  ];

  return (
    <section className="relative overflow-hidden bg-ink px-4 py-20 text-paper md:px-8 md:py-20">
      <div className="absolute inset-0 noise-field opacity-25" />
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <Reveal>
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-cyan">JEF builds technical infrastructure for human capability.</p>
          <h2 className="max-w-xl font-display text-[clamp(2.7rem,5.8vw,6.4rem)] font-semibold leading-[0.88] tracking-[-0.055em]">
            Education is the core. AI and XR are the engine.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-paper/[0.68]">
            JEF brings together a family of platforms around practical questions: how people learn better, practise safely, prove capability and move toward work.
          </p>
        </Reveal>
        <div className="grid gap-4">
          {systems.map(([title, body], index) => (
            <Reveal delay={index * 0.06} key={title}>
              <article className="group rounded-[1.35rem] border border-white/[0.11] bg-white/[0.045] p-6 transition duration-700 ease-fluid hover:border-cyan/35 hover:bg-white/[0.07] md:p-8">
                <div className="grid gap-5 md:grid-cols-[0.2fr_0.8fr]">
                  <span className="font-mono text-xs text-lime transition duration-700 ease-fluid group-hover:text-cyan">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.04em]">{title}</h3>
                    <p className="mt-3 max-w-2xl leading-7 text-paper/[0.68]">{body}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProgrammeEcosystem() {
  return (
    <section className="relative overflow-hidden bg-surface px-4 py-20 text-paper md:px-8 md:py-20">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(84,220,255,0.08),transparent_28rem),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:100%_100%,88px_88px] opacity-70" />
      <div className="mx-auto max-w-7xl">
        <Reveal className="grid gap-8 md:grid-cols-[0.92fr_1.08fr] md:items-end">
          <h2 className="font-display text-[clamp(2.7rem,6vw,7rem)] font-semibold leading-[0.84] tracking-[-0.06em]">
            Product modules for immersive skills delivery.
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-paper/[0.68]">
            Each card below is a JEF product or programme area. Open a module to see who it serves, what problem it solves and how AI, XR, spatial computing or skills development fits into the work.
          </p>
        </Reveal>
        <div className="relative mt-10 grid auto-rows-[minmax(270px,auto)] grid-cols-1 gap-3 md:grid-flow-dense md:grid-cols-12">
          {programmes.map((programme, index) => {
            const visual = programmeVisuals[programme.slug] ?? programme.image;

            return (
              <Link
                className={`group rounded-[1.35rem] border border-white/[0.1] bg-white/[0.045] p-1 transition duration-700 ease-fluid hover:-translate-y-1 hover:border-cyan/40 hover:bg-white/[0.085] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan ${
                  index === 0 ? "md:col-span-7 md:row-span-2" : index === 1 ? "md:col-span-5" : index === 2 ? "md:col-span-5" : "md:col-span-4"
                }`}
                href={["prolific-edge", "workgrid-labs"].includes(programme.slug) ? `/programmes/${programme.slug}` : `/programmes/${programme.slug}`}
                key={programme.slug}
              >
              <article className="signal-frame relative flex h-full min-h-64 overflow-hidden rounded-[1.05rem] bg-ink p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.13)]">
                <Image
                  alt={`${programme.name} visual context`}
                  className="absolute inset-0 object-cover opacity-[0.44] saturate-[0.85] transition duration-700 ease-fluid group-hover:scale-105 group-hover:opacity-[0.58]"
                  fill
                  sizes={index === 0 ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 768px) 34vw, 100vw"}
                  src={visual}
                />
                <div className="absolute inset-0 opacity-90">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/70 to-transparent" />
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(84,220,255,0.12)_1px,transparent_1px)] bg-[length:32px_32px] opacity-24" />
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(170,255,128,0.08),transparent_45%),linear-gradient(180deg,rgba(5,8,13,0.5),rgba(5,8,13,0.93))]" />
                </div>
                <div className="relative z-10 flex min-h-full flex-col justify-between">
                  <div className="flex items-start justify-between gap-6">
                    <span className="rounded-full bg-white/[0.08] px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-lime ring-1 ring-white/10">{programme.status}</span>
                    <span className="grid size-10 place-items-center rounded-[0.9rem] bg-white/[0.08] text-paper transition duration-700 ease-fluid group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:bg-cyan group-hover:text-ink">
                      ↗
                    </span>
                  </div>
                  <div className="pt-20">
                    <h3 className="max-w-lg text-4xl font-semibold leading-none tracking-[-0.055em] md:text-6xl">{programme.name}</h3>
                    <p className="mt-5 max-w-xl text-sm leading-6 text-paper/[0.7] md:text-base">{programme.purpose}</p>
                    {["vocle-xr", "ai-services", "icampus", "workplace-4", "spatial-enterprise", "gig-economy-accelerator", "spatial-ai-city", "worxstream", "prolific-edge", "workgrid-labs", "merseta-fgc-ekm", "xr-labs-tvet-colleges"].includes(programme.slug) ? (
                      <span className="mt-6 inline-flex rounded-full bg-amber px-4 py-2 text-sm font-bold text-ink shadow-[0_0_32px_rgba(255,196,92,0.22)]">Open interactive experience</span>
                    ) : null}
                  </div>
                </div>
              </article>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SpatialStory() {
  const stack = [
    ["Capture", "Learners practise inside XR environments while AI observes decisions, sequence and confidence."],
    ["Model", "The platform converts activity into skills evidence, training gaps and progression signals."],
    ["Deploy", "Educators, enterprises and partners use the evidence to move people into real opportunities."]
  ];

  return (
    <section className="relative overflow-hidden bg-ink px-4 py-20 text-paper md:px-8 md:py-20">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:120px_120px] opacity-40" />
      <div className="mx-auto max-w-7xl">
        <WordReveal text="The experience should feel like a technical operating system for human skill." />
        <div className="mt-20 grid gap-6 lg:grid-cols-3">
          {stack.map(([title, body], index) => (
            <Reveal delay={index * 0.08} key={title}>
              <article className="group min-h-[460px] rounded-[1.35rem] border border-white/[0.11] bg-white/[0.045] p-1 transition duration-700 ease-fluid hover:-translate-y-1 hover:border-cyan/35">
                <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[1.05rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.028))] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)]">
                  <div className="absolute inset-x-8 top-20 h-px bg-gradient-to-r from-transparent via-cyan/60 to-transparent" />
                  <div className="absolute inset-0 noise-field opacity-28" />
                  <div className="relative z-10 inline-flex size-12 items-center justify-center rounded-[1rem] border border-cyan/30 bg-cyan/[0.08] font-mono text-xs text-lime">0{index + 1}</div>
                  <div className="relative z-10">
                    <h3 className="text-5xl font-semibold tracking-[-0.06em]">{title}</h3>
                    <p className="mt-5 text-lg leading-8 text-paper/[0.68]">{body}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EvidenceAndMap() {
  return (
    <section className="relative overflow-hidden bg-surface px-4 py-20 text-paper md:px-8 md:py-20">
      <div className="absolute inset-0 noise-field opacity-20" />
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.95fr_1.05fr]">
        <Reveal>
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-cyan">Evidence layer</p>
          <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.4rem)] font-semibold leading-[0.88] tracking-[-0.06em]">
            Evidence stays honest and source-led.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-paper/[0.68]">
            Operational metrics, cohort evidence and delivery dashboards can be published as approved programme records become available.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-[1.35rem] border border-white/[0.11] bg-white/[0.045] p-1">
            <div className="scanline-panel rounded-[1.05rem] bg-ink p-5 md:p-8">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-paper/56">
                <span>Evidence console</span>
                <span className="text-amber">Source-led</span>
              </div>
              <div className="grid gap-3">
                {impactRecords.map((record) => (
                  <div className="grid gap-3 rounded-[0.95rem] border border-white/[0.08] bg-white/[0.045] p-5 md:grid-cols-[0.85fr_0.45fr_1fr] md:items-center" key={record.title}>
                    <strong className="text-paper">{record.title}</strong>
                    <span className="font-mono text-cyan">{record.value}</span>
                    <span className="text-sm leading-6 text-paper/[0.62]">
                      {record.classification}: {record.note}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Partnerships() {
  return (
    <section className="bg-ink px-4 py-20 text-paper md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <h2 className="max-w-5xl font-display text-[clamp(2.7rem,6vw,7rem)] font-semibold leading-[0.84] tracking-[-0.06em]">
            Built for partners who need deployable skills systems.
          </h2>
        </Reveal>
        <div className="mt-10 flex gap-4 overflow-x-auto pb-6 [scrollbar-width:none]">
          {pathways.map((pathway, index) => (
            <Link
              className="group min-w-[270px] rounded-[1.35rem] border border-white/[0.1] bg-white/[0.045] p-1 transition duration-700 ease-fluid hover:-translate-y-1 hover:border-cyan/35 hover:bg-white/[0.075] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
              href="/partnerships"
              key={pathway}
            >
              <article className="flex min-h-80 flex-col justify-between rounded-[1.05rem] bg-surface p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)]">
                <span className="font-mono text-xs text-lime">{String(index + 1).padStart(2, "0")} / partner lane</span>
                <div>
                  <h3 className="text-3xl font-semibold tracking-[-0.05em]">{pathway}</h3>
                  <p className="mt-4 text-sm leading-6 text-paper/[0.64]">
                    Partnership workflows connect operating needs, implementation roles, documentation and evidence expectations.
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function InstitutionalClose() {
  return (
    <section className="relative overflow-hidden bg-paper px-4 py-20 text-ink md:px-8 md:py-20">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(84,220,255,0.28),transparent_42%),linear-gradient(90deg,rgba(5,8,13,0.08)_1px,transparent_1px)] bg-[length:100%_100%,72px_72px]" />
      <div className="relative z-10 mx-auto max-w-7xl rounded-[1.5rem] border border-ink/10 bg-paper/74 p-6 shadow-[0_24px_90px_rgba(5,8,13,0.14)] backdrop-blur md:p-10">
        <Reveal>
          <h2 className="max-w-6xl font-display text-[clamp(3.2rem,7.6vw,8.2rem)] font-semibold leading-[0.84] tracking-[-0.07em]">
            Build the operating system for education, training and skills development.
          </h2>
          <div className="mt-12 flex flex-wrap gap-3">
            <TechButton href="/contact">Start with JEF</TechButton>
            <TechButton href="/programmes" variant="secondary">
              Explore modules
            </TechButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
