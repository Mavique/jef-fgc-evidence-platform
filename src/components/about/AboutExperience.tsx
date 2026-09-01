"use client";

import Image from "next/image";
import Link from "next/link";
import { BrainCircuit, Eye, GraduationCap, Landmark, Network, ShieldCheck, Waypoints } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/MotionPrimitives";
import { SpatialField } from "@/components/SpatialField";
import { xrMedia } from "@/content/xr-media";

const images = {
  vr: xrMedia.industrialVrTraining,
  classroom: xrMedia.jefTransformingEducationBanner,
  skills: xrMedia.jefIndustryBriefing
};

const identityCards = [
  {
    icon: BrainCircuit,
    title: "Artificial Intelligence",
    body: "JEF approaches AI as applied intelligence for real work: diagnostics, knowledge support, decision assistance, feedback loops and evidence-aware workflows."
  },
  {
    icon: Eye,
    title: "Extended Reality",
    body: "JEF uses XR to make practice visible, embodied and safer before learners, workers and institutions move into higher-stakes performance."
  },
  {
    icon: Waypoints,
    title: "Spatial AI",
    body: "JEF connects people, places, assets, services and learning moments through spatial systems, digital twins and contextual intelligence."
  },
  {
    icon: GraduationCap,
    title: "Education at the centre",
    body: "Technology is not the headline by itself. The centre is education, training, skills development and practical capability that can travel into work."
  }
];

const principles = [
  ["Human capability first", "Every system should help people understand, practise, decide, collaborate or progress."],
  ["Technology with governance", "AI, XR and spatial systems need human oversight, safety, privacy, evidence and clear limits."],
  ["Institutions over hype", "JEF designs for schools, colleges, government, enterprises and communities that need implementation paths, not buzzwords."],
  ["Proof before claims", "Impact numbers, partnerships, deployments and outcomes must be verified before they are presented as achieved facts."]
] as const;

const ecosystem = [
  ["Transformation Services", "/services", "A gateway for institutions choosing a structured transformation pathway."],
  ["JEF AI Services", "/programmes/ai-services", "Responsible applied AI strategy, implementation and capability building."],
  ["VOCLE XR", "/programmes/vocle-xr", "Immersive learning and cognitive practice architecture."],
  ["XR Labs for TVET Colleges", "/programmes/xr-labs-tvet-colleges", "A platform-neutral model for institutional XR lab capability."],
  ["Spatial AI City", "/programmes/spatial-ai-city", "Civic spatial intelligence for places, participation and public innovation."],
  ["WorxStream", "/programmes/worxstream", "Governed routing from verified capability to opportunity pathways."]
] as const;

function AboutButton({
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

export function AboutExperience() {
  const reduce = useReducedMotion();

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-ink text-paper">
      <section className="relative isolate min-h-[92dvh] overflow-hidden px-4 pb-10 pt-32 md:px-8 md:pt-36">
        <div className="absolute inset-0">
          <Image
            alt="AI enabled learning environment with students and digital intelligence interface"
            className="object-cover opacity-38 saturate-[0.86]"
            fill
            priority
            sizes="100vw"
            src={images.classroom}
          />
          <SpatialField />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,13,0.98)_0%,rgba(5,8,13,0.84)_46%,rgba(5,8,13,0.34)_100%),linear-gradient(180deg,rgba(5,8,13,0.18),rgba(5,8,13,0.96)_88%)]" />
          <div className="tech-grid" />
          <div className="grain opacity-35" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(92dvh-10rem)] max-w-7xl content-center gap-10 lg:grid-cols-[1.03fr_0.68fr] lg:items-end">
          <motion.div
            className="max-w-5xl"
            initial={reduce ? false : { opacity: 0.7, y: 30 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-7 inline-flex flex-wrap gap-1.5 rounded-[1.1rem] bg-ink/62 p-1.5 text-xs font-semibold text-paper ring-1 ring-white/[0.14] backdrop-blur-xl">
              <span className="rounded-[0.82rem] bg-cyan px-3 py-1.5 text-ink">About JEF</span>
              <span className="px-3 py-1.5 text-paper/74">AI · XR · Spatial Intelligence · Skills</span>
            </div>
            <h1 className="max-w-[1120px] font-display text-[clamp(3.05rem,7.3vw,8.2rem)] font-semibold leading-[0.86] tracking-[-0.06em] text-balance">
              A technology company with education at the centre.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-paper/[0.8] md:text-2xl md:leading-9">
              Jengrac Education Foundation builds Artificial Intelligence, Extended Reality and Spatial AI systems that help institutions develop practical capability, prepare people for work and govern transformation responsibly.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <AboutButton href="/services">Explore what JEF builds</AboutButton>
              <AboutButton href="/about/governance" variant="secondary">
                Review governance
              </AboutButton>
            </div>
          </motion.div>

          <motion.aside
            aria-label="JEF identity summary"
            className="signal-frame scanline-panel rounded-[1.35rem] border border-white/[0.12] bg-white/[0.055] p-5 backdrop-blur-xl"
            initial={reduce ? false : { opacity: 0, x: 34 }}
            animate={reduce ? undefined : { opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-paper/58">
              <span>Identity stack</span>
              <span className="text-lime">JEF</span>
            </div>
            <div className="mt-5 grid gap-3">
              {["Technology company", "Education mission", "Institutional transformation", "Evidence-led communication"].map((item) => (
                <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-[0.95rem] border border-white/[0.08] bg-ink/46 px-4 py-3" key={item}>
                  <span className="size-2 rounded-full bg-cyan shadow-[0_0_22px_rgba(84,220,255,0.72)]" />
                  <span className="text-sm text-paper/76">{item}</span>
                </div>
              ))}
            </div>
          </motion.aside>
        </div>
      </section>

      <section className="relative overflow-hidden bg-surface px-4 py-20 md:px-8 md:py-24">
        <div className="absolute inset-0 noise-field opacity-[0.16]" />
        <div className="relative mx-auto max-w-7xl">
          <Reveal className="grid gap-8 lg:grid-cols-[0.78fr_1fr] lg:items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">What JEF is</p>
              <h2 className="mt-5 max-w-3xl font-display text-[clamp(2.35rem,4.55vw,5.15rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
                Not a generic charity page. Not a course catalogue. A capability systems company.
              </h2>
            </div>
            <div className="grid gap-4">
              <p className="max-w-2xl text-lg leading-8 text-paper/70">
                JEF’s public identity should be understood through the systems it creates: learning systems, workplace systems, spatial systems, AI-assisted knowledge systems and opportunity systems. The foundation name carries the mission; the operating expression is technology, implementation and human capability.
              </p>
              <div className="grid gap-3 rounded-[1.25rem] border border-white/[0.1] bg-white/[0.055] p-4 md:grid-cols-3">
                {["AI strategy", "XR practice", "Skills pathways"].map((item) => (
                  <div className="rounded-[0.95rem] bg-ink/56 p-4 ring-1 ring-white/[0.08]" key={item}>
                    <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-lime">Operating layer</p>
                    <p className="mt-2 text-lg font-semibold tracking-[-0.035em]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {identityCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Reveal delay={index * 0.055} key={card.title}>
                  <article className="h-full rounded-[1.25rem] border border-white/[0.11] bg-white/[0.045] p-6">
                    <div className="grid size-12 place-items-center rounded-[1rem] bg-cyan/12 text-cyan ring-1 ring-cyan/25">
                      <Icon aria-hidden className="size-5" strokeWidth={1.8} />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold leading-tight tracking-[-0.035em]">{card.title}</h3>
                    <p className="mt-4 leading-7 text-paper/68">{card.body}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative bg-ink px-4 py-20 md:px-8 md:py-24">
        <div className="absolute inset-0 tech-grid opacity-40" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber">The operating thesis</p>
            <h2 className="mt-5 max-w-2xl font-display text-[clamp(2.3rem,4.25vw,4.75rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
              The future of learning is spatial, intelligent and connected to work.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-paper/70">
              JEF’s work sits where advanced technology meets implementation: institutions need strategy, tools, curriculum, human adoption, governance and evidence to move together.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {["Diagnose readiness", "Build practice environments", "Measure evidence"].map((item, index) => (
                <div className="rounded-[1rem] border border-white/[0.1] bg-white/[0.045] p-4" key={item}>
                  <span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-cyan">Step {index + 1}</span>
                  <p className="mt-2 font-semibold text-paper/86">{item}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
            <Reveal>
              <div className="relative min-h-[460px] overflow-hidden rounded-[1.35rem] border border-white/[0.11] bg-white/[0.045]">
                <Image alt="Professional using virtual reality for immersive training" className="object-cover" fill sizes="(min-width: 1024px) 40vw, 100vw" src={images.vr} />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,13,0.1),rgba(5,8,13,0.82))]" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-lime">From practice to performance</p>
                  <h3 className="mt-3 text-3xl font-semibold leading-[0.98] tracking-[-0.04em]">Immersion matters when it builds transferable capability.</h3>
                </div>
              </div>
            </Reveal>
            <div className="grid content-stretch gap-4">
              {principles.map(([title, body], index) => (
                <Reveal delay={index * 0.055} key={title}>
                  <article className="h-full rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5">
                    <h3 className="text-2xl font-semibold tracking-[-0.035em]">{title}</h3>
                    <p className="mt-3 leading-7 text-paper/68">{body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-paper px-4 py-20 text-ink md:px-8 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_82%_20%,rgba(84,220,255,0.28),transparent_34rem),radial-gradient(ellipse_at_18%_72%,rgba(170,255,128,0.2),transparent_30rem)]" />
        <div className="relative mx-auto max-w-7xl">
          <Reveal className="grid gap-8 lg:grid-cols-[0.72fr_0.68fr_0.6fr] lg:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-canopy">Ecosystem view</p>
              <h2 className="mt-5 max-w-3xl font-display text-[clamp(2.35rem,4.45vw,5rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
                One organisation, multiple transformation pathways.
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-ink/72">
              The About page should make the rest of the site easier to understand. JEF’s programmes are not isolated pages; they are connected pathways for capability, institutional change and responsible technology adoption.
            </p>
            <div className="rounded-[1.25rem] border border-ink/10 bg-white/70 p-5 shadow-fine">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-canopy">Connection logic</p>
              <p className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.045em]">Strategy, platforms, skills and evidence should read as one system.</p>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-3 lg:grid-cols-3">
            {ecosystem.map(([title, href, body], index) => (
              <Reveal delay={index * 0.045} key={title}>
                <Link className="group block h-full rounded-[1.2rem] border border-ink/10 bg-ink/[0.045] p-6 transition duration-700 ease-fluid hover:-translate-y-1 hover:bg-ink/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-canopy" href={href}>
                  <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-canopy">System 0{index + 1}</span>
                  <h3 className="mt-5 text-3xl font-semibold leading-[0.98] tracking-[-0.04em]">{title}</h3>
                  <p className="mt-4 leading-7 text-ink/68">{body}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink px-4 py-20 md:px-8 md:py-24">
        <div className="absolute inset-0 noise-field opacity-[0.15]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <div className="relative min-h-[360px] overflow-hidden rounded-[1.35rem] border border-white/[0.12] bg-white/[0.045]">
              <Image alt="Professionals collaborating in a digital skills workshop" className="object-cover" fill sizes="(min-width: 1024px) 44vw, 100vw" src={images.skills} />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,13,0.08),rgba(5,8,13,0.74))]" />
              <div className="absolute bottom-5 left-5 right-5 rounded-[1rem] border border-white/[0.14] bg-ink/74 p-4 backdrop-blur-xl">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-lime">Verification posture</p>
                <p className="mt-2 text-sm leading-6 text-paper/74">Specific impact numbers, funders, live deployments and partner claims require JEF-approved evidence before publication.</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mb-6 flex flex-wrap gap-3">
              <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/[0.08] px-4 text-sm font-semibold text-paper ring-1 ring-white/[0.12]">
                <ShieldCheck aria-hidden className="size-4 text-lime" /> Evidence before claims
              </span>
              <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/[0.08] px-4 text-sm font-semibold text-paper ring-1 ring-white/[0.12]">
                <Landmark aria-hidden className="size-4 text-cyan" /> Governance visible
              </span>
              <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/[0.08] px-4 text-sm font-semibold text-paper ring-1 ring-white/[0.12]">
                <Network aria-hidden className="size-4 text-amber" /> Ecosystem connected
              </span>
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">How to read JEF</p>
            <h2 className="mt-5 max-w-3xl font-display text-[clamp(2.35rem,4.8vw,5.35rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
              Ambitious technology, careful evidence and human-centred implementation.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-paper/70">
              This About page positions JEF clearly without overstating what still needs formal proof. Where a programme is strategic, proposed or in development, the website should say so plainly.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <AboutButton href="/about/leadership" variant="secondary">
                Leadership
              </AboutButton>
              <AboutButton href="/partnerships">Partner with JEF</AboutButton>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
