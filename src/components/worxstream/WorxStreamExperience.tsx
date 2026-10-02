"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { Reveal } from "@/components/MotionPrimitives";
import { WorxStreamField } from "@/components/worxstream/WorxStreamField";
import {
  ecosystemSources,
  matchFactors,
  opportunityStream,
  opportunityTypes,
  partnerRoutes,
  passportFields,
  perspectives,
  statusJourney,
  transitionCompare,
  worxStreamPositioning
} from "@/content/worxstream";

function StatusTag({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full bg-[#62f6a3] px-3 py-1 font-mono text-[0.64rem] font-bold uppercase tracking-[0.15em] text-[#07110e]">
      {children.replaceAll("_", " ")}
    </span>
  );
}

function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#62f6a3] p-1.5 pl-6 text-sm font-bold text-[#07110e] transition duration-700 ease-fluid hover:bg-[#7fd7ff] active:scale-[0.98]" href={href}>
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-[#07110e] text-[#f7fff9] transition duration-700 ease-fluid group-hover:translate-x-1">↗</span>
    </Link>
  );
}

function ChoiceButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className={`rounded-full px-4 py-3 text-left text-sm font-semibold transition duration-700 ease-fluid ${
        active ? "bg-[#62f6a3] text-[#07110e]" : "bg-white/[0.06] text-[#effff5] ring-1 ring-white/[0.12] hover:bg-white/[0.1]"
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function stateClasses(state: string) {
  if (state === "supported") return "bg-[#62f6a3] text-[#07110e]";
  if (state === "partial") return "bg-[#ffce6a] text-[#07110e]";
  if (state === "missing") return "bg-[#ff7b86] text-[#07110e]";
  return "bg-[#7fd7ff] text-[#07110e]";
}

export function WorxStreamExperience() {
  const [perspective, setPerspective] = useState(perspectives[0]);
  const [step, setStep] = useState(opportunityStream[0]);
  const [route, setRoute] = useState(opportunityTypes[0]);
  const [partnerRoute, setPartnerRoute] = useState(partnerRoutes[0]);

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#07110e] text-[#f7fff9]">
      <section className="relative isolate min-h-[84dvh] overflow-hidden px-4 pb-16 pt-36 md:px-8 md:pt-32">
        <div className="absolute inset-0">
          <WorxStreamField />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(98,246,163,0.2),transparent_31%),radial-gradient(circle_at_20%_80%,rgba(255,123,134,0.15),transparent_29%),linear-gradient(180deg,rgba(7,17,14,0.18),rgba(7,17,14,0.98))]" />
          <div className="tech-grid opacity-50" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#07110e] to-transparent" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(84dvh-7rem)] max-w-7xl content-center gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <StatusTag>{worxStreamPositioning.status}</StatusTag>
              <span className="text-sm text-[#f7fff9]/[0.66]">{worxStreamPositioning.publicNameStatus}</span>
            </div>
            <h1 className="max-w-[980px] font-display text-[clamp(3.25rem,6.6vw,7.25rem)] font-semibold leading-[0.88] tracking-[-0.066em]">
              <span className="block text-[#62f6a3]">{worxStreamPositioning.name}</span>
              capability in motion.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-[#f7fff9]/[0.74] md:text-2xl md:leading-10">
              A consent-based route from verified evidence to work, WIL, projects, enterprise and continued development.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTA href="#journey">Explore My Opportunity Journey</CTA>
              <Link className="inline-flex items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-[#f7fff9] ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#matching">
                See How Matching Works
              </Link>
              <Link className="inline-flex items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-[#f7fff9] ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#partners">
                Create a Quality Opportunity
              </Link>
            </div>
          </motion.div>

          <Reveal delay={0.12}>
            <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.06] p-1.5 ring-1 ring-white/[0.12]">
              <div className="relative min-h-[440px] overflow-hidden rounded-[1.55rem] bg-[#0c1915] p-6">
                <div className="absolute inset-0 bg-[url('/images/xr/vr-industrial-factory-tour.jpeg')] bg-cover bg-center opacity-20 grayscale" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(127,215,255,0.08)_1px,transparent_1px),linear-gradient(rgba(127,215,255,0.08)_1px,transparent_1px)] bg-[length:58px_58px]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,25,21,0.2),rgba(12,25,21,0.94))]" />
                <div className="relative z-10 flex h-full flex-col justify-between gap-9">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#7fd7ff]">Not a jobs board</p>
                    <h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.058em] md:text-6xl">The match is visible before evidence moves.</h2>
                  </div>
                  <div className="grid gap-3">
                    {["Goal", "Consent", "Eligibility", "Passport", "Human review", "Follow-up"].map((item, index) => (
                      <motion.div
                        className={`flex items-center justify-between rounded-[1rem] p-4 ring-1 ${
                          index === 0 ? "bg-[#f7fff9] text-[#07110e] ring-[#f7fff9]" : index === 3 ? "bg-[#62f6a3] text-[#07110e] ring-[#62f6a3]" : "bg-white/[0.07] text-[#f7fff9] ring-white/[0.12]"
                        }`}
                        initial={false}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ duration: 0.54, delay: index * 0.055, ease: [0.16, 1, 0.3, 1] }}
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

      <section className="bg-[#07110e] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.7rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Broken transition becomes governed movement.</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {transitionCompare.map((item) => (
              <Reveal className={`rounded-[2rem] p-1.5 ${item.tone === "broken" ? "bg-white/[0.07]" : "bg-[#62f6a3]"}`} key={item.label}>
                <article className={`min-h-[320px] rounded-[1.55rem] p-7 ${item.tone === "broken" ? "bg-[#0d1714] text-[#f7fff9]" : "bg-[#62f6a3] text-[#07110e]"}`}>
                  <h3 className="max-w-lg text-5xl font-semibold tracking-[-0.06em]">{item.label}</h3>
                  <div className="mt-12 grid gap-3">
                    {item.points.map((point, index) => (
                      <div className="flex items-center justify-between rounded-[1rem] bg-black/[0.12] p-4 ring-1 ring-current/10" key={point}>
                        <span className="font-semibold">{point}</span>
                        <span className="font-mono text-xs opacity-65">{String(index + 1).padStart(2, "0")}</span>
                      </div>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="journey" className="bg-[#0b1714] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.5rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Choose a role. The opportunity stream explains itself.</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#f7fff9]/[0.66]">
              The interface changes perspective without changing the governance doctrine.
            </p>
            <div className="mt-9 grid gap-3">
              {perspectives.map((item) => (
                <ChoiceButton active={item.name === perspective.name} onClick={() => setPerspective(item)} key={item.name}>
                  {item.name}
                </ChoiceButton>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <article className="rounded-[2rem] bg-[#62f6a3] p-1.5 text-[#07110e]">
              <div className="grid min-h-[500px] gap-8 rounded-[1.55rem] bg-[#62f6a3] p-7 md:grid-cols-[0.9fr_1.1fr] md:p-9">
                <div className="flex flex-col justify-between gap-10">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.16em] opacity-70">{perspective.signal}</p>
                    <h3 className="mt-5 text-5xl font-semibold tracking-[-0.064em] md:text-7xl">{perspective.name} route</h3>
                    <p className="mt-6 text-lg leading-8 opacity-78">{perspective.intent}</p>
                  </div>
                  <div className="rounded-[1.15rem] bg-[#07110e] p-5 text-[#f7fff9]">
                    <p className="font-semibold text-[#7fd7ff]">{step[0]}</p>
                    <p className="mt-3 text-lg leading-8 text-[#f7fff9]/[0.72]">{step[1]}</p>
                  </div>
                </div>
                <div className="grid max-h-[610px] gap-3 overflow-y-auto pr-1">
                  {opportunityStream.map((item, index) => (
                    <button
                      className={`rounded-[1rem] p-4 text-left transition duration-700 ease-fluid ${
                        item[0] === step[0] ? "bg-[#07110e] text-[#f7fff9]" : "bg-[#07110e]/[0.13] text-[#07110e] hover:bg-[#07110e]/[0.2]"
                      }`}
                      type="button"
                      onClick={() => setStep(item)}
                      key={item[0]}
                    >
                      <span className="font-mono text-xs opacity-65">{String(index + 1).padStart(2, "0")}</span>
                      <span className="mt-2 block text-2xl font-semibold tracking-[-0.05em]">{item[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section id="matching" className="bg-[#07110e] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">No universal score. Separate factors, separate decisions.</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {matchFactors.map((item) => (
              <Reveal className="rounded-[1.45rem] bg-white/[0.06] p-5 ring-1 ring-white/[0.11]" key={item.name}>
                <span className={`inline-flex rounded-full px-3 py-1 font-mono text-[0.63rem] font-bold uppercase tracking-[0.14em] ${stateClasses(item.state)}`}>
                  {item.state}
                </span>
                <h3 className="mt-9 text-3xl font-semibold tracking-[-0.055em]">{item.name}</h3>
                <p className="mt-4 text-base leading-7 text-[#f7fff9]/[0.64]">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#dfffee] px-4 py-20 text-[#07110e] md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Passport Consent Preview.</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 opacity-75">
              A learner sees what will be shared, why it is relevant and what stays private before authorising disclosure.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="rounded-[2rem] bg-[#07110e] p-1.5 text-[#f7fff9]">
              <div className="grid gap-3 rounded-[1.55rem] bg-[#07110e] p-5">
                {passportFields.map(([status, title, body]) => (
                  <div className="grid gap-4 rounded-[1rem] bg-white/[0.07] p-4 ring-1 ring-white/[0.1] md:grid-cols-[120px_1fr]" key={title}>
                    <span className={`h-fit rounded-full px-3 py-1 text-center font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] ${status === "Shared" ? "bg-[#62f6a3] text-[#07110e]" : "bg-[#ff7b86] text-[#07110e]"}`}>
                      {status}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold tracking-[-0.045em]">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#f7fff9]/[0.64]">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#0b1714] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-4xl">
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.2rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Route explorer without placement promises.</h2>
          </Reveal>
          <div className="mt-10 grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="grid gap-3">
              {opportunityTypes.map((item) => (
                <ChoiceButton active={item[0] === route[0]} onClick={() => setRoute(item)} key={item[0]}>
                  {item[0]}
                </ChoiceButton>
              ))}
            </div>
            <Reveal delay={0.08}>
              <article className="relative min-h-[400px] overflow-hidden rounded-[2rem] bg-white/[0.06] p-8 ring-1 ring-white/[0.11]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(127,215,255,0.16),transparent_32%),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[length:auto,52px_52px]" />
                <div className="relative z-10 flex min-h-[340px] flex-col justify-between">
                  <StatusTag>verification_required</StatusTag>
                  <div>
                    <h3 className="text-6xl font-semibold tracking-[-0.066em]">{route[0]}</h3>
                    <p className="mt-7 max-w-2xl text-xl leading-9 text-[#f7fff9]/[0.7]">{route[1]}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-[#07110e] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Statuses keep outcomes honest.</h2>
          </Reveal>
          <div className="mt-10 overflow-hidden rounded-[2rem] bg-white/[0.06] p-5 ring-1 ring-white/[0.11]">
            <div className="grid min-w-[980px] grid-cols-10 gap-2">
              {statusJourney.map((item, index) => (
                <div className={`min-h-48 rounded-[1rem] p-4 ${index >= 7 ? "bg-[#62f6a3] text-[#07110e]" : "bg-[#0d1b17] text-[#f7fff9]"}`} key={item}>
                  <span className="font-mono text-xs opacity-65">{String(index + 1).padStart(2, "0")}</span>
                  <p className="mt-8 text-lg font-semibold leading-6 tracking-[-0.04em]">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#f7fff9]/[0.64]">
            Referrals, applications, offers and onboarding are not reported as active engagement. Verified start evidence is the threshold.
          </p>
        </div>
      </section>

      <section className="bg-[#eaf7ff] px-4 py-20 text-[#07110e] md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Ecosystem sources feed the stream.</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {ecosystemSources.map(([name, body], index) => (
              <Reveal className={`min-h-[240px] rounded-[1.5rem] p-5 ${index === 1 ? "bg-[#07110e] text-[#f7fff9]" : index === 2 ? "bg-[#62f6a3]" : "bg-white"}`} key={name}>
                <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-10 text-3xl font-semibold tracking-[-0.055em]">{name}</h3>
                <p className="mt-4 text-sm leading-6 opacity-70">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="partners" className="bg-[#07110e] px-4 py-20 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.3rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Partnership configurator.</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#f7fff9]/[0.66]">
              Participation begins with a governed action, not a vague promise of opportunity.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="rounded-[2rem] bg-white/[0.06] p-5 ring-1 ring-white/[0.11]">
              <div className="grid gap-3 sm:grid-cols-2">
                {partnerRoutes.map((item) => (
                  <button
                    className={`min-h-32 rounded-[1.05rem] p-5 text-left text-2xl font-semibold tracking-[-0.05em] transition duration-700 ease-fluid ${
                      item === partnerRoute ? "bg-[#62f6a3] text-[#07110e]" : "bg-[#0d1b17] text-[#f7fff9] hover:bg-[#132720]"
                    }`}
                    type="button"
                    onClick={() => setPartnerRoute(item)}
                    key={item}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-[1.1rem] bg-[#eaf7ff] p-5 text-[#07110e]">
                <p className="font-mono text-xs uppercase tracking-[0.14em] opacity-60">Selected action</p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">{partnerRoute}</p>
                <p className="mt-3 leading-7 opacity-70">JEF must verify the owner, terms, evidence expectations, support model, dates and complaints route before publishing any live opportunity.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
