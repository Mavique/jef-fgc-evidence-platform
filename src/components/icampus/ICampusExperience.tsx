"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Reveal } from "@/components/MotionPrimitives";
import { ICampusField } from "@/components/icampus/ICampusField";
import {
  academies,
  applicationBridge,
  credentials,
  goals,
  icampusPositioning,
  loopStages,
  partnerActions,
  platformComparison,
  stakeholders,
  supportRoles
} from "@/content/icampus";

function StatusTag({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-[#ffd76a] px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#071426]">
      {status.replaceAll("_", " ")}
    </span>
  );
}

function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#4ee8c6] p-1.5 pl-6 text-sm font-bold text-[#071426] transition duration-700 ease-fluid hover:bg-[#ffd76a] active:scale-[0.98]" href={href}>
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-[#071426] text-paper transition duration-700 ease-fluid group-hover:translate-x-1">↗</span>
    </Link>
  );
}

function Choice({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className={`rounded-full px-4 py-3 text-left text-sm font-semibold transition duration-700 ease-fluid ${
        active ? "bg-[#4ee8c6] text-[#071426]" : "bg-white/[0.07] text-paper ring-1 ring-white/[0.12] hover:bg-white/[0.11]"
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function ICampusExperience() {
  const [goal, setGoal] = useState(goals[0]);
  const [stage, setStage] = useState(loopStages[0]);
  const [credential, setCredential] = useState(credentials[0]);
  const [stakeholder, setStakeholder] = useState(stakeholders[0]);
  const [bridge, setBridge] = useState(applicationBridge[0]);
  const [partner, setPartner] = useState(partnerActions[0]);

  const stageIndex = useMemo(() => loopStages.findIndex((item) => item.name === stage.name), [stage]);
  const visibleAcademies = useMemo(() => academies.slice(0, Math.max(5, stageIndex + 4)), [stageIndex]);

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#071426] text-paper">
      <section className="relative isolate min-h-[84dvh] overflow-hidden px-4 pb-16 pt-32 md:px-8">
        <div className="absolute inset-0">
          <ICampusField />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(78,232,198,0.18),transparent_32%),radial-gradient(circle_at_22%_72%,rgba(255,127,114,0.18),transparent_30%),linear-gradient(180deg,rgba(7,20,38,0.1),rgba(7,20,38,0.97))]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,248,255,0.045)_1px,transparent_1px),linear-gradient(rgba(246,248,255,0.045)_1px,transparent_1px)] bg-[length:80px_80px] opacity-50" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(84dvh-7rem)] max-w-7xl content-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <StatusTag status={icampusPositioning.status} />
              <span className="text-sm text-paper/[0.66]">Accreditation, vendor and outcome claims are published through approved JEF channels.</span>
            </div>
            <h1 className="max-w-[780px] font-display text-[clamp(2.75rem,5.2vw,5.8rem)] font-semibold leading-[0.89] tracking-[-0.065em]">
              <span className="block text-[#4ee8c6]">{icampusPositioning.name}</span>
              Your connected campus for the intelligent economy.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-paper/[0.74] md:text-2xl md:leading-10">
              Discover digital, AI and professional learning pathways that connect knowledge with practical capability, recognised achievement and meaningful next steps.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTA href="#pathway">Find My Learning Path</CTA>
              <Link className="inline-flex items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#academies">
                Explore the Academies
              </Link>
              <Link className="inline-flex items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#partners">
                Build a Learning Pathway
              </Link>
            </div>
          </motion.div>

          <Reveal delay={0.12}>
            <div className="rounded-[2.2rem] bg-white/[0.06] p-1.5 ring-1 ring-white/[0.12]">
              <div className="relative min-h-[460px] overflow-hidden rounded-[1.7rem] bg-[#0d2038] p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)]">
                <div className="absolute inset-0 bg-[url('/images/xr/robotics-sensor-car.jpg')] bg-cover bg-center opacity-20 grayscale" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,32,56,0.2),rgba(13,32,56,0.94))]" />
                <div className="relative z-10 grid min-h-[400px] content-between gap-8">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#ffd76a]">Campus without walls</p>
                    <h2 className="mt-5 text-5xl font-semibold tracking-[-0.065em] md:text-7xl">Learning should move somewhere.</h2>
                  </div>
                  <div className="grid gap-3">
                    {["Goal", "Pathway", "Support", "Evidence", "Application", "Next step"].map((item, index) => (
                      <motion.div
                        className={`rounded-[1.1rem] p-4 text-lg font-semibold ring-1 ${index === 0 || index === 5 ? "bg-[#ffd76a] text-[#071426] ring-[#ffd76a]" : "bg-white/[0.085] text-paper ring-white/[0.12]"}`}
                        initial={false}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.5, delay: index * 0.055, ease: [0.16, 1, 0.3, 1] }}
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

      <section className="bg-[#071426] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.8rem,6vw,7rem)] font-semibold leading-[0.84] tracking-[-0.07em]">Not a course catalogue.</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
            {platformComparison.map((item, index) => (
              <Reveal delay={index * 0.08} key={item.name}>
                <article className={`h-full rounded-[2rem] p-1.5 ${index === 0 ? "bg-white/[0.055] ring-1 ring-white/[0.1]" : "bg-[#4ee8c6] text-[#071426]"}`}>
                  <div className={`flex min-h-[320px] flex-col justify-between rounded-[1.55rem] p-7 ${index === 0 ? "bg-[#0d2038] text-paper" : "bg-[#4ee8c6] text-[#071426]"}`}>
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-70">{item.stance}</p>
                      <h3 className="mt-6 text-5xl font-semibold tracking-[-0.065em]">{item.name}</h3>
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2">
                        {item.items.map((signal) => (
                          <span className={`rounded-full px-3 py-2 text-sm font-semibold ${index === 0 ? "bg-white/[0.07] text-paper" : "bg-[#071426] text-paper"}`} key={signal}>
                            {signal}
                          </span>
                        ))}
                      </div>
                      <p className="mt-7 text-lg leading-8 opacity-75">{item.outcome}</p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="pathway" className="bg-[#0d2038] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.8rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.065em]">Start with a goal.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-paper/[0.64]">
              Pathways connect goals, support and destination programmes so learners can compare routes with context.
            </p>
            <div className="mt-8 grid gap-3">
              {goals.map((item) => (
                <Choice active={item.name === goal.name} onClick={() => setGoal(item)} key={item.name}>
                  {item.name}
                </Choice>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[2.2rem] bg-[#ffd76a] p-8 text-[#071426]">
              <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-70">{goal.audience}</p>
              <h3 className="mt-6 text-5xl font-semibold tracking-[-0.065em]">{goal.name}</h3>
              <div className="mt-8 grid gap-3">
                {goal.path.map((item, index) => (
                  <div className="rounded-[1rem] bg-[#071426] p-4 text-paper" key={item}>
                    <span className="font-mono text-xs text-[#4ee8c6]">{String(index + 1).padStart(2, "0")}</span>
                    <span className="ml-4 text-lg font-semibold">{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-8 rounded-[1.2rem] bg-white/35 p-5 text-lg leading-8">Destination: {goal.destination}</p>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#071426] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.8rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.065em]">Learning-to-Opportunity Loop.</h2>
            <div className="mt-8 grid gap-3">
              {loopStages.map((item) => (
                <Choice active={item.name === stage.name} onClick={() => setStage(item)} key={item.name}>
                  {item.name}
                </Choice>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[2.2rem] bg-white/[0.055] p-1.5 ring-1 ring-white/[0.1]">
              <div className="rounded-[1.7rem] bg-[#0d2038] p-8">
                <StatusTag status={stageIndex < 3 ? "confirmed_programme" : "pathway_model"} />
                <h3 className="mt-8 text-5xl font-semibold tracking-[-0.065em]">{stage.name}</h3>
                <div className="mt-8 grid gap-4">
                  <p className="rounded-[1rem] bg-white/[0.06] p-5 text-paper/[0.72]">Learner action: {stage.action}</p>
                  <p className="rounded-[1rem] bg-white/[0.06] p-5 text-paper/[0.72]">Output: {stage.output}</p>
                  <p className="rounded-[1rem] bg-[#4ee8c6] p-5 font-semibold text-[#071426]">Evidence: {stage.evidence}</p>
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section id="academies" className="bg-[#0d2038] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.8rem,6vw,7rem)] font-semibold leading-[0.84] tracking-[-0.07em]">Academies illuminate by pathway.</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleAcademies.map(([name, status, body], index) => (
              <Reveal delay={index * 0.035} key={name}>
                <article className={`min-h-64 rounded-[1.6rem] p-6 ring-1 ${status === "vendor_partnership_pending" ? "bg-[#ff7f72] text-[#071426] ring-[#ff7f72]" : "bg-white/[0.055] text-paper ring-white/[0.1]"}`}>
                  <span className="font-mono text-xs uppercase tracking-[0.16em] opacity-70">{status.replaceAll("_", " ")}</span>
                  <h3 className="mt-8 text-3xl font-semibold tracking-[-0.055em]">{name}</h3>
                  <p className="mt-5 text-sm leading-6 opacity-75">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#071426] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.8rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.065em]">Credential Decoder.</h2>
            <div className="mt-8 grid gap-3">
              {credentials.map((item) => (
                <button className={`rounded-[1.2rem] p-5 text-left transition duration-700 ease-fluid ${item.name === credential.name ? "bg-[#ffd76a] text-[#071426]" : "bg-white/[0.055] text-paper ring-1 ring-white/[0.1] hover:bg-white/[0.09]"}`} type="button" onClick={() => setCredential(item)} key={item.name}>
                  <span className="font-mono text-xs uppercase tracking-[0.16em] opacity-70">{item.status.replaceAll("_", " ")}</span>
                  <span className="mt-3 block text-xl font-semibold">{item.name}</span>
                </button>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[2.2rem] bg-paper p-8 text-[#071426]">
              <StatusTag status={credential.status} />
              <h3 className="mt-8 text-5xl font-semibold tracking-[-0.065em]">{credential.name}</h3>
              <p className="mt-7 text-xl leading-9">{credential.means}</p>
              <p className="mt-8 rounded-[1.2rem] bg-[#071426] p-5 text-lg leading-8 text-paper">What it does not mean: {credential.not}</p>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#0d2038] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.8rem,6vw,7rem)] font-semibold leading-[0.84] tracking-[-0.07em]">Scalable does not mean unsupported.</h2>
          </Reveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {supportRoles.map((item) => (
              <span className="rounded-[1.15rem] bg-white/[0.065] p-5 text-lg font-semibold ring-1 ring-white/[0.1]" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#071426] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.86fr_1.14fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.8rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.065em]">Learning bridges into application.</h2>
            <div className="mt-8 grid gap-3">
              {applicationBridge.map((item) => (
                <Choice active={item[0] === bridge[0]} onClick={() => setBridge(item)} key={item[0]}>
                  {item[0]}
                </Choice>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[2.2rem] bg-[#4ee8c6] p-8 text-[#071426]">
              <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-70">Application destination</p>
              <h3 className="mt-6 text-6xl font-semibold tracking-[-0.07em]">{bridge[0]}</h3>
              <p className="mt-7 text-2xl leading-9">{bridge[1]}</p>
              <p className="mt-8 rounded-[1.2rem] bg-[#071426] p-5 text-lg leading-8 text-paper">
                Entry requirements, availability and evidence outputs are confirmed through JEF programme engagement before a route is presented as active.
              </p>
            </article>
          </Reveal>
        </div>
      </section>

      <section id="partners" className="bg-[#0d2038] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.8rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.065em]">Stakeholders enter through different doors.</h2>
            <div className="mt-8 grid gap-3">
              {stakeholders.map((item) => (
                <Choice active={item[0] === stakeholder[0]} onClick={() => setStakeholder(item)} key={item[0]}>
                  {item[0]}
                </Choice>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-[2.2rem] bg-[#ffd76a] p-8 text-[#071426]">
              <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-70">Perspective</p>
              <h3 className="mt-6 text-5xl font-semibold tracking-[-0.065em]">{stakeholder[0]}</h3>
              <p className="mt-5 text-xl leading-9 opacity-80">{stakeholder[1]}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {partnerActions.map((item) => (
                  <button className={`rounded-[1rem] p-4 text-left text-sm font-bold transition duration-700 ease-fluid ${item === partner ? "bg-[#071426] text-paper" : "bg-white/35 text-[#071426] hover:bg-white/55"}`} type="button" onClick={() => setPartner(item)} key={item}>
                    {item}
                  </button>
                ))}
              </div>
              <p className="mt-8 rounded-[1.2rem] bg-[#071426] p-5 text-lg leading-8 text-paper">
                Selected action: {partner}. JEF reviews governance, cost, access, partner permissions, accreditation and outcome definitions before publishing claims.
              </p>
            </article>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
