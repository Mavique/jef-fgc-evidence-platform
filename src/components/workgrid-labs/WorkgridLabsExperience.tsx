"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/MotionPrimitives";
import { WorkgridField } from "@/components/workgrid-labs/WorkgridField";
import {
  capabilityLayers,
  ecosystemConnections,
  fields,
  labConstellation,
  missingLayer,
  missions,
  opportunityRoutes,
  partnerActions,
  passportBlocks,
  roles,
  studios,
  workgridPositioning
} from "@/content/workgrid-labs";

function StatusTag({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-amber px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink">
      {status.replaceAll("_", " ")}
    </span>
  );
}

function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="group inline-flex items-center justify-center gap-3 rounded-full bg-amber p-1.5 pl-6 text-sm font-bold text-ink transition duration-700 ease-fluid hover:bg-cyan active:scale-[0.98]" href={href}>
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-ink text-paper transition duration-700 ease-fluid group-hover:translate-x-1">↗</span>
    </Link>
  );
}

function RailButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className={`rounded-full px-4 py-3 text-left text-sm font-semibold transition duration-700 ease-fluid ${
        active ? "bg-amber text-ink" : "bg-white/[0.06] text-paper ring-1 ring-white/[0.11] hover:bg-white/[0.1]"
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function WorkgridLabsExperience() {
  const [role, setRole] = useState(roles[0]);
  const [field, setField] = useState(fields[0]);
  const [studio, setStudio] = useState(studios[2]);
  const [lab, setLab] = useState(labConstellation[0]);
  const [mission, setMission] = useState(missions[0]);
  const [route, setRoute] = useState(opportunityRoutes[0]);
  const [partnerAction, setPartnerAction] = useState(partnerActions[0]);
  const reduce = useReducedMotion();

  const studioIndex = useMemo(() => studios.findIndex((item) => item.name === studio.name), [studio]);
  const passportProgress = useMemo(() => passportBlocks.slice(0, Math.max(4, studioIndex + 2)), [studioIndex]);

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#080b10] text-paper">
      <section className="relative isolate min-h-[100dvh] overflow-hidden px-4 pb-16 pt-32 md:px-8">
        <div className="absolute inset-0">
          <WorkgridField />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_20%,rgba(255,184,76,0.16),transparent_32%),radial-gradient(circle_at_18%_74%,rgba(55,240,220,0.16),transparent_30%),linear-gradient(180deg,rgba(8,11,16,0.18),rgba(8,11,16,0.98))]" />
          <div className="tech-grid" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#080b10] to-transparent" />
        </div>
        <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-8rem)] max-w-7xl content-center gap-10 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
          <motion.div
            initial={reduce ? false : { opacity: 0.7, y: 28, filter: "blur(5px)" }}
            animate={reduce ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <StatusTag status={workgridPositioning.status} />
              <span className="text-sm text-paper/[0.66]">An initiative of Jengrac Education Foundation.</span>
            </div>
            <h1 className="max-w-[920px] font-display text-[clamp(3.15rem,6.4vw,7rem)] font-semibold leading-[0.9] tracking-[-0.065em]">
              <span className="block text-amber">{workgridPositioning.name}</span>
              TVET-to-Work Grid.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-paper/[0.74] md:text-2xl md:leading-10">
              The TVET-to-Work Transformation Grid connects occupational qualifications with professional capability, AI, practical missions and verified pathways.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTA href="#builder">Build Your Workgrid Path</CTA>
              <Link className="inline-flex items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#studios">
                Explore the Studios
              </Link>
              <Link className="inline-flex items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#missions">
                Bring an Industry Mission
              </Link>
            </div>
          </motion.div>

          <Reveal delay={0.12}>
            <div className="relative overflow-hidden rounded-[2.2rem] bg-white/[0.055] p-1.5 ring-1 ring-white/[0.12]">
              <div className="relative min-h-[520px] overflow-hidden rounded-[1.7rem] bg-[#0d1218] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.13)]">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[length:56px_56px]" />
                <div className="relative z-10 grid h-full content-between gap-7">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber">The missing layer</p>
                    <h2 className="mt-5 text-4xl font-semibold tracking-[-0.06em] md:text-6xl">Qualification becomes work evidence.</h2>
                  </div>
                  <div className="grid gap-3">
                    {missingLayer.map((item, index) => (
                      <motion.div
                        className={`flex items-center justify-between rounded-[1.1rem] p-4 ring-1 ${
                          index === 0 ? "bg-paper text-ink ring-paper" : index === missingLayer.length - 1 ? "bg-amber text-ink ring-amber" : "bg-white/[0.07] text-paper ring-white/[0.12]"
                        }`}
                        initial={reduce ? false : { opacity: 0, x: -24 }}
                        whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.55, delay: index * 0.055, ease: [0.16, 1, 0.3, 1] }}
                        key={item}
                      >
                        <span className="font-semibold">{item}</span>
                        <span className="font-mono text-xs opacity-70">{String(index + 1).padStart(2, "0")}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="builder" className="bg-[#080b10] px-4 py-28 md:px-8 md:py-40">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.8rem,6vw,7rem)] font-semibold leading-[0.84] tracking-[-0.07em]">Choose a role. Choose a field. The grid adjusts.</h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-paper/[0.64]">
              The selector does not change programme truth. It changes which evidence, studios and next actions surface first.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
            <Reveal>
              <div className="grid gap-3">
                {roles.map((item) => (
                  <RailButton active={item.name === role.name} onClick={() => setRole(item)} key={item.name}>
                    I am a {item.name.toLowerCase()}
                  </RailButton>
                ))}
              </div>
              <div className="mt-8 grid gap-3">
                {fields.map((item) => (
                  <RailButton active={item.name === field.name} onClick={() => setField(item)} key={item.name}>
                    {item.name}
                  </RailButton>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <article className="min-h-[560px] rounded-[2.2rem] bg-amber p-1.5 text-ink">
                <div className="grid h-full gap-8 rounded-[1.7rem] bg-amber p-7 md:grid-cols-[0.92fr_1.08fr] md:p-9">
                  <div className="flex flex-col justify-between gap-10">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-70">{role.cta}</p>
                      <h3 className="mt-5 text-5xl font-semibold tracking-[-0.065em] md:text-7xl">{role.name} pathway</h3>
                      <p className="mt-6 text-lg leading-8 opacity-80">{role.intent}</p>
                    </div>
                    <div className="rounded-[1.2rem] bg-ink p-5 text-paper">
                      <p className="text-sm font-semibold text-cyan">{field.name}</p>
                      <p className="mt-3 text-lg leading-8 text-paper/[0.72]">{field.capability}</p>
                    </div>
                  </div>
                  <div className="relative min-h-[360px] overflow-hidden rounded-[1.3rem] bg-[#10151b] p-5 text-paper">
                    <div className="absolute inset-0 bg-[url('/images/xr/ar-automotive-training.jpg')] bg-cover bg-center opacity-24 grayscale" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,21,27,0.22),rgba(16,21,27,0.94))]" />
                    <div className="relative z-10 grid h-full content-end gap-3">
                      {capabilityLayers.map(([title, body]) => (
                        <div className="rounded-[1rem] bg-white/[0.08] p-4 ring-1 ring-white/[0.12]" key={title}>
                          <h4 className="font-semibold">{title}</h4>
                          <p className="mt-2 text-sm leading-6 text-paper/[0.64]">{body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="studios" className="bg-[#0d1218] px-4 py-28 md:px-8 md:py-40">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.8rem,6vw,7rem)] font-semibold leading-[0.84] tracking-[-0.07em]">A pathway, not a course queue.</h2>
          </Reveal>
          <div className="mt-16 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[620px] rounded-[2.2rem] bg-white/[0.05] p-4 ring-1 ring-white/[0.1]">
              <div className="absolute inset-4 rounded-[1.6rem] bg-[linear-gradient(90deg,rgba(55,240,220,0.09)_1px,transparent_1px),linear-gradient(rgba(55,240,220,0.09)_1px,transparent_1px)] bg-[length:64px_64px]" />
              <div className="relative grid h-full grid-cols-1 gap-3 sm:grid-cols-2">
                {studios.map((item, index) => (
                  <button
                    className={`min-h-36 rounded-[1.35rem] p-5 text-left transition duration-700 ease-fluid ${
                      item.name === studio.name ? "bg-cyan text-ink" : "bg-[#111922]/88 text-paper ring-1 ring-white/[0.12] hover:bg-[#18222d]"
                    }`}
                    type="button"
                    onClick={() => setStudio(item)}
                    key={item.name}
                  >
                    <span className="font-mono text-xs opacity-70">{String(index + 1).padStart(2, "0")}</span>
                    <span className="mt-5 block text-2xl font-semibold tracking-[-0.055em]">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <Reveal delay={0.1}>
              <article className="rounded-[2.2rem] bg-white/[0.05] p-1.5 ring-1 ring-white/[0.1]">
                <div className="rounded-[1.7rem] bg-[#080b10] p-8">
                  <StatusTag status={studioIndex < 3 ? "core_programme" : "illustrative_pathway"} />
                  <h3 className="mt-8 text-5xl font-semibold tracking-[-0.065em]">{studio.name}</h3>
                  <p className="mt-6 text-lg leading-8 text-paper/[0.68]">{studio.purpose}</p>
                  <div className="mt-8 grid gap-4">
                    <p className="rounded-[1rem] bg-white/[0.06] p-5 text-paper/[0.72]">Output: {studio.output}</p>
                    <p className="rounded-[1rem] bg-white/[0.06] p-5 text-paper/[0.72]">Evidence: {studio.evidence}</p>
                    <p className="rounded-[1rem] bg-white/[0.06] p-5 text-paper/[0.72]">Support role: {studio.support}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-[#080b10] px-4 py-28 md:px-8 md:py-40">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.8rem,6vw,7rem)] font-semibold leading-[0.84] tracking-[-0.07em]">Lab constellation by what participants can deliver.</h2>
          </Reveal>
          <div className="mt-16 grid gap-4 md:grid-cols-2">
            {labConstellation.map((item) => (
              <button
                className={`min-h-[260px] rounded-[1.8rem] p-6 text-left transition duration-700 ease-fluid ${
                  item.name === lab.name ? "bg-amber text-ink" : "bg-white/[0.055] text-paper ring-1 ring-white/[0.1] hover:bg-white/[0.09]"
                }`}
                type="button"
                onClick={() => setLab(item)}
                key={item.name}
              >
                <span className="font-mono text-xs uppercase tracking-[0.16em] opacity-70">{item.status.replaceAll("_", " ")}</span>
                <h3 className="mt-8 text-4xl font-semibold tracking-[-0.06em]">{item.name}</h3>
                <p className="mt-5 max-w-xl text-lg leading-8 opacity-75">{item.need}</p>
              </button>
            ))}
          </div>
          <Reveal delay={0.1} className="mt-5 rounded-[2rem] bg-[#10171f] p-7 ring-1 ring-white/[0.1]">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <StatusTag status={lab.status} />
                <h3 className="mt-6 text-5xl font-semibold tracking-[-0.065em]">{lab.name}</h3>
                <p className="mt-5 text-lg leading-8 text-paper/[0.66]">Work product: {lab.output}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {lab.activities.map((activity) => (
                  <span className="rounded-[1rem] bg-white/[0.06] p-5 text-lg font-semibold text-paper ring-1 ring-white/[0.1]" key={activity}>
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="missions" className="bg-[#0d1218] px-4 py-28 md:px-8 md:py-40">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.8rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.065em]">Industry mission simulator.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-paper/[0.64]">
              Examples are illustrative planning interactions until a challenge owner, participants, outcomes and permissions are verified.
            </p>
            <div className="mt-8 grid gap-3">
              {missions.map((item) => (
                <RailButton active={item.name === mission.name} onClick={() => setMission(item)} key={item.name}>
                  {item.name}
                </RailButton>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[2.2rem] bg-white/[0.05] p-1.5 ring-1 ring-white/[0.1]">
              <div className="rounded-[1.7rem] bg-[#080b10] p-8">
                <StatusTag status="verification_required" />
                <h3 className="mt-8 text-5xl font-semibold tracking-[-0.065em]">{mission.name}</h3>
                <div className="mt-8 grid gap-4">
                  <p className="rounded-[1rem] bg-white/[0.06] p-5 text-paper/[0.72]">Challenge: {mission.challenge}</p>
                  <p className="rounded-[1rem] bg-white/[0.06] p-5 text-paper/[0.72]">Deliverable: {mission.deliverable}</p>
                  <p className="rounded-[1rem] bg-white/[0.06] p-5 text-paper/[0.72]">Possible route: {mission.route}</p>
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#080b10] px-4 py-28 md:px-8 md:py-40">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.8rem,6vw,7rem)] font-semibold leading-[0.84] tracking-[-0.07em]">The Capability Passport is evidence architecture.</h2>
          </Reveal>
          <div className="mt-16 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2.2rem] bg-paper p-7 text-ink">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-5xl font-semibold tracking-[-0.065em]">Anonymous Passport</h3>
                <span className="rounded-full bg-ink px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-paper">Prototype</span>
              </div>
              <div className="mt-10 grid gap-3">
                {passportProgress.map((item, index) => (
                  <motion.div
                    className="rounded-[1rem] bg-ink p-4 text-paper"
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5, delay: index * 0.045, ease: [0.16, 1, 0.3, 1] }}
                    key={item}
                  >
                    <span className="font-mono text-xs text-cyan">Verifier required</span>
                    <p className="mt-2 text-lg font-semibold">{item}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="grid content-start gap-3">
              {opportunityRoutes.map((item) => (
                <button
                  className={`rounded-[1.3rem] p-5 text-left transition duration-700 ease-fluid ${
                    item.goal === route.goal ? "bg-cyan text-ink" : "bg-white/[0.055] text-paper ring-1 ring-white/[0.1] hover:bg-white/[0.09]"
                  }`}
                  type="button"
                  onClick={() => setRoute(item)}
                  key={item.goal}
                >
                  <span className="text-xl font-semibold tracking-[-0.04em]">{item.goal}</span>
                  {item.goal === route.goal ? <span className="mt-4 block text-sm leading-6 opacity-75">{item.requirement}</span> : null}
                </button>
              ))}
              <div className="rounded-[1.3rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-amber">No guarantee rule</p>
                <p className="mt-4 text-lg leading-8 text-paper/[0.68]">{route.next}. Routes depend on verified readiness, available opportunities and governed follow-up.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0d1218] px-4 py-28 md:px-8 md:py-40">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.8rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.065em]">Ecosystem connections appear when the pathway needs them.</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {ecosystemConnections.map((item) => (
                <span className="rounded-full bg-white/[0.07] px-4 py-3 text-sm font-semibold text-paper ring-1 ring-white/[0.1]" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[2.2rem] bg-amber p-8 text-ink">
              <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-70">Partner action builder</p>
              <h3 className="mt-6 text-5xl font-semibold tracking-[-0.065em]">Choose how to contribute to the grid.</h3>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {partnerActions.map((item) => (
                  <button
                    className={`rounded-[1rem] p-4 text-left text-sm font-bold transition duration-700 ease-fluid ${
                      item === partnerAction ? "bg-ink text-paper" : "bg-white/30 text-ink hover:bg-white/50"
                    }`}
                    type="button"
                    onClick={() => setPartnerAction(item)}
                    key={item}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <p className="mt-8 rounded-[1.2rem] bg-ink p-5 text-lg leading-8 text-paper">
                Selected action: {partnerAction}. JEF would define scope, evidence standards, safeguarding, POPIA, intellectual-property terms and verified outcomes before publishing claims.
              </p>
            </article>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
