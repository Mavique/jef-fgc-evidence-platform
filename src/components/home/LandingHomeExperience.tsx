"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/MotionPrimitives";
import { SpatialField } from "@/components/SpatialField";
import { xrMedia } from "@/content/xr-media";

const images = {
  ai: xrMedia.spatialAiCollaborationRoom,
  vr: xrMedia.xrDeviceIndustrialHologram,
  classroom: xrMedia.xrScienceClassroomDna,
  skills: xrMedia.jefXrPresentationStage2,
  hero: xrMedia.jefXrExpoHeadsetDemo
};

const capabilities = [
  {
    kicker: "Artificial Intelligence",
    title: "Workflow intelligence for learning, operations and skills evidence.",
    body:
      "JEF frames AI around supervised decisions: diagnostics, feedback loops, knowledge support, routing and evidence systems that help institutions work with more clarity.",
    href: "/programmes/ai-services",
    image: images.ai,
    alt: "AI interface visual with connected data nodes"
  },
  {
    kicker: "Extended Reality",
    title: "Immersive practice environments before real-world performance.",
    body:
      "XR helps learners, educators and workers rehearse procedures, spatial concepts and professional scenarios in environments built for practice, feedback and safer deployment.",
    href: "/programmes/vocle-xr",
    image: images.vr,
    alt: "Professional wearing a VR headset during immersive training"
  },
  {
    kicker: "Spatial AI",
    title: "Digital twins and spatial systems for institutions and cities.",
    body:
      "Spatial intelligence connects people, places, assets and services so teams can inspect context, coordinate work and make evidence-led transformation choices.",
    href: "/programmes/spatial-ai-city",
    image: images.classroom,
    alt: "Classroom using AI enabled learning technology"
  }
];

const pathways = [
  ["Education leaders", "Schools, colleges and learning providers", "/services#education"],
  ["TVET colleges", "Labs, simulated work and industry readiness", "/programmes/xr-labs-tvet-colleges"],
  ["Government", "Public service innovation and civic spatial intelligence", "/services#government"],
  ["Enterprise", "Human-AI work redesign and capability systems", "/services#enterprise"]
] as const;

const signals = ["AI strategy", "XR labs", "Spatial platforms", "Skills evidence", "Institutional transformation"];

function LandingButton({
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
      className={`group inline-flex min-h-12 items-center justify-center gap-3 rounded-full p-1.5 pl-6 text-sm font-bold transition duration-700 ease-fluid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan active:scale-[0.98] ${
        variant === "primary"
          ? "bg-cyan text-ink shadow-[0_0_72px_rgba(84,220,255,0.24)] hover:bg-lime"
          : "bg-white/[0.08] text-paper ring-1 ring-white/[0.16] hover:bg-white/[0.14]"
      }`}
      href={href}
    >
      {children}
      <span
        aria-hidden
        className={`grid size-8 place-items-center rounded-full transition duration-700 ease-fluid group-hover:translate-x-1 ${
          variant === "primary" ? "bg-ink text-paper" : "bg-paper text-ink"
        }`}
      >
        ↗
      </span>
    </Link>
  );
}

export function LandingHomeExperience() {
  const reduce = useReducedMotion();

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-ink text-paper">
      <section className="relative isolate min-h-[92dvh] overflow-hidden px-4 pb-8 pt-32 md:px-8 md:pt-36">
        <div className="absolute inset-0">
          <Image
            alt="AI and spatial technology interface supporting institutional transformation"
            className="object-cover opacity-36 saturate-[0.86]"
            fill
            priority
            sizes="100vw"
            src={images.hero}
          />
          <SpatialField />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,13,0.98)_0%,rgba(5,8,13,0.84)_42%,rgba(5,8,13,0.32)_100%),linear-gradient(180deg,rgba(5,8,13,0.16),rgba(5,8,13,0.96)_88%)]" />
          <div className="tech-grid" />
          <div className="grain opacity-35" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(92dvh-10rem)] max-w-7xl content-center gap-10 lg:grid-cols-[1.05fr_0.64fr] lg:items-end">
          <motion.div
            className="max-w-5xl"
            initial={reduce ? false : { opacity: 0.72, y: 30, filter: "blur(6px)" }}
            animate={reduce ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-7 inline-flex flex-wrap gap-1.5 rounded-[1.1rem] bg-ink/62 p-1.5 text-xs font-semibold text-paper ring-1 ring-white/[0.14] backdrop-blur-xl">
              <span className="rounded-[0.82rem] bg-cyan px-3 py-1.5 text-ink">AI · XR · Spatial Intelligence</span>
              <span className="px-3 py-1.5 text-paper/74">Education, training and skills at the centre</span>
            </div>
            <h1 className="max-w-[1060px] font-display text-[clamp(3.15rem,8vw,8.65rem)] font-semibold leading-[0.84] tracking-[-0.06em] text-balance">
              Jengrac Education Foundation
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-paper/[0.79] md:text-2xl md:leading-9">
              A technology company building Artificial Intelligence, Extended Reality and Spatial AI systems for institutions ready to transform how people learn, practise, work and prove capability.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LandingButton href="/services">Explore transformation services</LandingButton>
              <LandingButton href="/platform-overview" variant="secondary">
                View platform overview
              </LandingButton>
            </div>
          </motion.div>

          <motion.aside
            aria-label="JEF transformation signal"
            className="signal-frame scanline-panel rounded-[1.35rem] border border-white/[0.12] bg-white/[0.055] p-5 backdrop-blur-xl"
            initial={reduce ? false : { opacity: 0, x: 34 }}
            animate={reduce ? undefined : { opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-paper/58">
              <span>Transformation stack</span>
              <span className="text-lime">Model</span>
            </div>
            <div className="mt-5 grid gap-3">
              {signals.map((signal) => (
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[0.95rem] border border-white/[0.08] bg-ink/46 px-4 py-3" key={signal}>
                  <span className="size-2 rounded-full bg-cyan shadow-[0_0_22px_rgba(84,220,255,0.72)]" />
                  <span className="text-sm text-paper/76">{signal}</span>
                  <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-amber">JEF</span>
                </div>
              ))}
            </div>
          </motion.aside>
        </div>

        <div className="relative z-10 mx-auto mt-6 grid max-w-7xl gap-3 rounded-[1.25rem] border border-white/[0.1] bg-white/[0.055] p-3 text-sm text-paper/70 backdrop-blur-xl md:grid-cols-3">
          <span className="rounded-[0.9rem] bg-ink/42 px-4 py-3">What JEF is: AI, XR and Spatial AI technology company.</span>
          <span className="rounded-[0.9rem] bg-ink/42 px-4 py-3">What JEF centres: education, training and skills development.</span>
          <span className="rounded-[0.9rem] bg-ink/42 px-4 py-3">What visitors can do: choose a service or explore the platform.</span>
        </div>
      </section>

      <section className="relative overflow-hidden bg-surface px-4 py-24 md:px-8 md:py-32">
        <div className="absolute inset-0 noise-field opacity-[0.16]" />
        <div className="relative mx-auto max-w-7xl">
          <Reveal className="grid gap-6 lg:grid-cols-[0.72fr_1fr] lg:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Plain-language landing</p>
              <h2 className="mt-5 max-w-3xl font-display text-[clamp(2.4rem,5vw,5.7rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
                Institutions do not need disconnected tech. They need a transformation system.
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-paper/70">
              JEF connects strategy, immersive learning, AI-enabled work, spatial data and evidence. The website now starts by telling a new visitor exactly what the company does before sending them deeper into services and programmes.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {capabilities.map((capability, index) => (
              <Reveal delay={index * 0.06} key={capability.kicker}>
                <Link
                  className="group block h-full overflow-hidden rounded-[1.35rem] border border-white/[0.11] bg-white/[0.045] transition duration-700 ease-fluid hover:-translate-y-1 hover:border-cyan/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
                  href={capability.href}
                >
                  <div className="relative aspect-[1.55] overflow-hidden">
                    <Image alt={capability.alt} className="object-cover transition duration-700 ease-fluid group-hover:scale-[1.04]" fill sizes="(min-width: 1024px) 31vw, 100vw" src={capability.image} />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,13,0.08),rgba(5,8,13,0.78))]" />
                  </div>
                  <div className="p-6">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-lime">{capability.kicker}</p>
                    <h3 className="mt-4 text-3xl font-semibold leading-[0.98] tracking-[-0.04em]">{capability.title}</h3>
                    <p className="mt-5 leading-7 text-paper/68">{capability.body}</p>
                    <span className="mt-6 inline-flex min-h-11 items-center rounded-full bg-white/[0.08] px-4 text-sm font-semibold text-paper ring-1 ring-white/[0.12] transition duration-700 ease-fluid group-hover:bg-cyan group-hover:text-ink">
                      Open capability
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-ink px-4 py-24 md:px-8 md:py-32">
        <div className="absolute inset-0 tech-grid opacity-40" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber">Choose your route</p>
            <h2 className="mt-5 max-w-2xl font-display text-[clamp(2.35rem,4.8vw,5.25rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
              Start with the institution, then select the technology.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-paper/70">
              The services page gives each visitor a clearer doorway, whether they are transforming education, public services, enterprise operations or workforce development.
            </p>
            <div className="mt-8">
              <LandingButton href="/services">Find your service pathway</LandingButton>
            </div>
          </Reveal>

          <div className="grid gap-3 sm:grid-cols-2">
            {pathways.map(([title, body, href], index) => (
              <Reveal delay={index * 0.055} key={title}>
                <Link className="group block min-h-44 rounded-[1.2rem] border border-white/[0.1] bg-white/[0.055] p-6 transition duration-700 ease-fluid hover:border-lime/45 hover:bg-white/[0.085] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan" href={href}>
                  <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-cyan">Pathway 0{index + 1}</span>
                  <h3 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">{title}</h3>
                  <p className="mt-4 leading-7 text-paper/68">{body}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-paper px-4 py-24 text-ink md:px-8 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_18%,rgba(84,220,255,0.28),transparent_34rem),radial-gradient(ellipse_at_18%_68%,rgba(170,255,128,0.2),transparent_30rem)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <div className="relative min-h-[360px] overflow-hidden rounded-[1.35rem] bg-ink">
              <Image alt="Professionals collaborating in a digital skills workshop" className="object-cover" fill sizes="(min-width: 1024px) 44vw, 100vw" src={images.skills} />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,13,0.08),rgba(5,8,13,0.68))]" />
              <div className="absolute bottom-5 left-5 right-5 rounded-[1rem] border border-white/[0.14] bg-ink/70 p-4 text-paper backdrop-blur-xl">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-lime">Evidence posture</p>
                <p className="mt-2 text-sm leading-6 text-paper/74">Unverified outcomes stay labelled as placeholders until JEF can validate and publish them responsibly.</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-canopy">Trust layer</p>
            <h2 className="mt-5 max-w-3xl font-display text-[clamp(2.35rem,4.8vw,5.45rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
              Premium technology, clear language and no invented proof.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/72">
              The landing page presents JEF as a serious technology company while keeping the education mission legible. It avoids inflated metrics and guides visitors to services, programmes and partnership routes with less ambiguity.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LandingButton href="/programmes" variant="secondary">
                Explore programmes
              </LandingButton>
              <LandingButton href="/contact">Build with JEF</LandingButton>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
