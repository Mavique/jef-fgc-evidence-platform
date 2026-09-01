"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/MotionPrimitives";
import { SpatialAiCityField } from "@/components/spatial-ai-city/SpatialAiCityField";
import {
  civicCompare,
  civicJourney,
  creatorRoles,
  dataTrust,
  districtLayers,
  manyTruths,
  participationSteps,
  partnerOptions,
  spatialAiCityPositioning,
  twinTypes,
  useCases
} from "@/content/spatial-ai-city";

function StatusTag({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full bg-[#43f5dd] px-3 py-1 font-mono text-[0.64rem] font-bold uppercase tracking-[0.15em] text-[#081018]">
      {children.replaceAll("_", " ")}
    </span>
  );
}

function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#43f5dd] p-1.5 pl-6 text-sm font-bold text-[#081018] transition duration-700 ease-fluid hover:bg-[#ffca5c] active:scale-[0.98]" href={href}>
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-[#081018] text-[#f7fbff] transition duration-700 ease-fluid group-hover:translate-x-1">›</span>
    </Link>
  );
}

function ChoiceButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className={`rounded-full px-4 py-3 text-left text-sm font-semibold transition duration-700 ease-fluid ${
        active ? "bg-[#43f5dd] text-[#081018]" : "bg-white/[0.06] text-[#f7fbff] ring-1 ring-white/[0.12] hover:bg-white/[0.1]"
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function SpatialAiCityExperience() {
  const [layer, setLayer] = useState(districtLayers[0]);
  const [journeyStep, setJourneyStep] = useState(civicJourney[0]);
  const [partner, setPartner] = useState(partnerOptions[0]);
  const reduce = useReducedMotion();

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#081018] text-[#f7fbff]">
      <section className="relative isolate min-h-[100dvh] overflow-hidden px-4 pb-16 pt-36 md:px-8 md:pt-32">
        <div className="absolute inset-0">
          <SpatialAiCityField />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(67,245,221,0.17),transparent_31%),radial-gradient(circle_at_22%_78%,rgba(167,139,255,0.13),transparent_30%),linear-gradient(180deg,rgba(8,16,24,0.14),rgba(8,16,24,0.98))]" />
          <div className="tech-grid opacity-35" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#081018] to-transparent" />
        </div>
        <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-8rem)] max-w-7xl content-center gap-10 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
          <motion.div
            initial={reduce ? false : { opacity: 0.72, y: 28, filter: "blur(5px)" }}
            animate={reduce ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <StatusTag>{spatialAiCityPositioning.status}</StatusTag>
              <span className="text-sm text-[#f7fbff]/[0.66]">Municipal adoption, data integrations and outcomes require verification.</span>
            </div>
            <h1 className="max-w-[1040px] font-display text-[clamp(3.1rem,6.3vw,7rem)] font-semibold leading-[0.88] tracking-[-0.066em]">
              <span className="block text-[#43f5dd]">Spatial AI City</span>
              living civic interface.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-[#f7fbff]/[0.74] md:text-2xl md:leading-10">
              {spatialAiCityPositioning.line} Places become understandable when evidence, local knowledge and public action connect.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTA href="#district">Explore the Living District</CTA>
              <Link className="inline-flex items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-[#f7fbff] ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#journey">
                Follow a Civic Challenge
              </Link>
              <Link className="inline-flex items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-sm font-bold text-[#f7fbff] ring-1 ring-white/[0.12] transition duration-700 ease-fluid hover:bg-white/[0.13]" href="#partners">
                Design a Spatial Pilot
              </Link>
            </div>
          </motion.div>

          <Reveal delay={0.12}>
            <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.06] p-1.5 ring-1 ring-white/[0.12]">
              <div className="relative min-h-[520px] overflow-hidden rounded-[1.55rem] bg-[#101923] p-6">
                <div className="absolute inset-0 bg-[url('/images/xr/industrial-mr-technician-close.jpg')] bg-cover bg-center opacity-22 grayscale" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(67,245,221,0.08)_1px,transparent_1px),linear-gradient(rgba(67,245,221,0.08)_1px,transparent_1px)] bg-[length:58px_58px]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,25,35,0.2),rgba(16,25,35,0.94))]" />
                <div className="relative z-10 flex h-full flex-col justify-between gap-9">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#ffca5c]">Living District Explorer</p>
                    <h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.058em] md:text-6xl">A place reveals its systems without pretending to know everything.</h2>
                  </div>
                  <div className="grid gap-3">
                    {["Purpose", "Source", "Time", "Uncertainty", "Privacy", "Authority"].map((item, index) => (
                      <motion.div
                        className={`flex items-center justify-between rounded-[1rem] p-4 ring-1 ${
                          index === 0 ? "bg-[#f7fbff] text-[#081018] ring-[#f7fbff]" : index === 3 ? "bg-[#a78bff] text-[#081018] ring-[#a78bff]" : "bg-white/[0.07] text-[#f7fbff] ring-white/[0.12]"
                        }`}
                        initial={reduce ? false : { opacity: 0, x: -22 }}
                        whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
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

      <section className="bg-[#081018] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.7rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Not a surveillance smart city. A civic intelligence commons.</h2>
          </Reveal>
          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {civicCompare.map((item, index) => (
              <Reveal className={`rounded-[2rem] p-1.5 ${index === 0 ? "bg-white/[0.07]" : "bg-[#43f5dd]"}`} key={item.label}>
                <article className={`min-h-[430px] rounded-[1.55rem] p-7 ${index === 0 ? "bg-[#101923] text-[#f7fbff]" : "bg-[#43f5dd] text-[#081018]"}`}>
                  <h3 className="max-w-lg text-5xl font-semibold tracking-[-0.06em]">{item.label}</h3>
                  <p className="mt-6 max-w-xl text-lg leading-8 opacity-72">{item.body}</p>
                  <div className="mt-10 grid gap-3">
                    {item.points.map((point, pointIndex) => (
                      <div className="flex items-center justify-between rounded-[1rem] bg-black/[0.12] p-4 ring-1 ring-current/10" key={point}>
                        <span className="font-semibold">{point}</span>
                        <span className="font-mono text-xs opacity-65">{String(pointIndex + 1).padStart(2, "0")}</span>
                      </div>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#121c28] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">One place, many truths.</h2>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-5">
            {manyTruths.map(([title, body], index) => (
              <Reveal className={`min-h-[300px] rounded-[1.45rem] p-5 ${index === 1 ? "bg-[#ffca5c] text-[#081018]" : index === 3 ? "bg-[#7bf273] text-[#081018]" : "bg-white/[0.06] text-[#f7fbff] ring-1 ring-white/[0.1]"}`} key={title}>
                <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-14 text-3xl font-semibold tracking-[-0.055em]">{title}</h3>
                <p className="mt-4 text-sm leading-6 opacity-70">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="district" className="bg-[#eafffb] px-4 py-24 text-[#081018] md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Activate a civic layer.</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 opacity-74">
              Each layer exposes purpose, source, time, uncertainty, privacy and authority before action.
            </p>
            <div className="mt-9 grid gap-3">
              {districtLayers.map((item) => (
                <button
                  className={`rounded-full px-4 py-3 text-left text-sm font-semibold transition duration-700 ease-fluid ${item.name === layer.name ? "bg-[#081018] text-[#f7fbff]" : "bg-white text-[#081018] hover:bg-[#d6fff6]"}`}
                  type="button"
                  onClick={() => setLayer(item)}
                  key={item.name}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="rounded-[2rem] bg-[#43f5dd] p-1.5 text-[#081018]">
              <div className="grid min-h-[600px] gap-8 rounded-[1.55rem] bg-[#43f5dd] p-7 md:grid-cols-[0.9fr_1.1fr] md:p-9">
                <div className="flex flex-col justify-between gap-10">
                  <div>
                    <StatusTag>{layer.status}</StatusTag>
                    <h3 className="mt-7 text-5xl font-semibold tracking-[-0.064em] md:text-7xl">{layer.name}</h3>
                    <p className="mt-6 text-lg leading-8 opacity-78">{layer.purpose}</p>
                  </div>
                  <div className="rounded-[1.15rem] bg-[#081018] p-5 text-[#f7fbff]">
                    <p className="font-semibold text-[#ffca5c]">Authority rule</p>
                    <p className="mt-3 text-lg leading-8 text-[#f7fbff]/[0.72]">Spatial AI City may support understanding. It does not replace municipal, engineering or emergency authority.</p>
                  </div>
                </div>
                <div className="grid content-end gap-3">
                  {[
                    ["Source", layer.source],
                    ["Time", layer.time],
                    ["Privacy", layer.privacy],
                    ["Current claim", "Demonstration layer only"]
                  ].map(([title, body]) => (
                    <div className="rounded-[1.05rem] bg-[#081018] p-5 text-[#f7fbff]" key={title}>
                      <h4 className="text-xl font-semibold tracking-[-0.045em]">{title}</h4>
                      <p className="mt-2 leading-7 text-[#f7fbff]/[0.66]">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section id="journey" className="bg-[#081018] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.74fr_1.26fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Civic Transformation Journey.</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#f7fbff]/[0.66]">
              A spatial pilot begins with mandate and governance, not technology procurement.
            </p>
            <div className="mt-9 grid gap-3">
              {civicJourney.slice(0, 8).map((item) => (
                <ChoiceButton active={item[0] === journeyStep[0]} onClick={() => setJourneyStep(item)} key={item[0]}>
                  {item[0]}
                </ChoiceButton>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="rounded-[2rem] bg-[#a78bff] p-1.5 text-[#081018]">
              <div className="grid min-h-[600px] gap-8 rounded-[1.55rem] bg-[#a78bff] p-7 md:grid-cols-[0.9fr_1.1fr] md:p-9">
                <div className="flex flex-col justify-between gap-10">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.16em] opacity-70">Civic challenge stage</p>
                    <h3 className="mt-5 text-5xl font-semibold tracking-[-0.064em] md:text-7xl">{journeyStep[0]}</h3>
                    <p className="mt-6 text-lg leading-8 opacity-78">{journeyStep[1]}</p>
                  </div>
                  <div className="rounded-[1.15rem] bg-[#081018] p-5 text-[#f7fbff]">
                    <p className="font-semibold text-[#43f5dd]">Scale rule</p>
                    <p className="mt-3 text-lg leading-8 text-[#f7fbff]/[0.72]">Stop uses that create harm, surveillance, exclusion or unsustainable cost.</p>
                  </div>
                </div>
                <div className="grid max-h-[600px] gap-3 overflow-y-auto pr-1">
                  {civicJourney.map((item, index) => (
                    <button
                      className={`rounded-[1rem] p-4 text-left transition duration-700 ease-fluid ${item[0] === journeyStep[0] ? "bg-[#081018] text-[#f7fbff]" : "bg-[#081018]/[0.13] text-[#081018] hover:bg-[#081018]/[0.2]"}`}
                      type="button"
                      onClick={() => setJourneyStep(item)}
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

      <section className="bg-[#121c28] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Use-case constellation by civic outcome.</h2>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {useCases.map(([title, body], index) => (
              <Reveal className={`min-h-[300px] rounded-[1.45rem] p-5 ${index === 2 ? "bg-[#ffca5c] text-[#081018]" : index === 5 ? "bg-[#a78bff] text-[#081018]" : "bg-white/[0.06] text-[#f7fbff] ring-1 ring-white/[0.1]"}`} key={title}>
                <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-14 text-3xl font-semibold tracking-[-0.055em]">{title}</h3>
                <p className="mt-4 text-sm leading-6 opacity-70">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eafffb] px-4 py-24 text-[#081018] md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Digital Twin Decoder.</h2>
            <div className="mt-10 grid gap-3">
              {twinTypes.map(([title, body], index) => (
                <div className={`rounded-[1.05rem] p-5 ${index === 2 ? "bg-[#a78bff]" : "bg-white"}`} key={title}>
                  <h3 className="text-xl font-semibold tracking-[-0.045em]">{title}</h3>
                  <p className="mt-2 leading-7 opacity-70">{body}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Data Trust Inspector.</h2>
            <div className="mt-10 grid gap-3">
              {dataTrust.map(([title, body], index) => (
                <div className={`rounded-[1.05rem] p-5 ${index === 4 ? "bg-[#ffca5c]" : "bg-white"}`} key={title}>
                  <h3 className="text-xl font-semibold tracking-[-0.045em]">{title}</h3>
                  <p className="mt-2 leading-7 opacity-70">{body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#081018] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-5xl">
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.4rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Participation is more than a comment box.</h2>
          </Reveal>
          <div className="mt-14 overflow-hidden rounded-[2rem] bg-white/[0.06] p-5 ring-1 ring-white/[0.11]">
            <div className="grid min-w-[980px] grid-cols-7 gap-2">
              {participationSteps.map((item, index) => (
                <div className={`min-h-48 rounded-[1rem] p-4 ${index >= 3 ? "bg-[#43f5dd] text-[#081018]" : "bg-[#121c28] text-[#f7fbff]"}`} key={item}>
                  <span className="font-mono text-xs opacity-65">{String(index + 1).padStart(2, "0")}</span>
                  <p className="mt-8 text-lg font-semibold leading-6 tracking-[-0.04em]">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {creatorRoles.map((item, index) => (
              <Reveal className={`min-h-[190px] rounded-[1.25rem] p-5 ${index === 2 || index === 3 ? "bg-[#a78bff] text-[#081018]" : "bg-white/[0.06] text-[#f7fbff] ring-1 ring-white/[0.1]"}`} key={item}>
                <span className="font-mono text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-10 text-2xl font-semibold tracking-[-0.05em]">{item}</h3>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="partners" className="bg-[#121c28] px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2.7rem,5.7vw,6.3rem)] font-semibold leading-[0.86] tracking-[-0.066em]">Partnership configurator.</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#f7fbff]/[0.66]">
              A spatial pilot needs a public purpose, authorised data, community participation, governance and evaluation.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="rounded-[2rem] bg-white/[0.06] p-5 ring-1 ring-white/[0.11]">
              <div className="grid gap-3 sm:grid-cols-2">
                {partnerOptions.map((item) => (
                  <button
                    className={`min-h-32 rounded-[1.05rem] p-5 text-left text-2xl font-semibold tracking-[-0.05em] transition duration-700 ease-fluid ${item === partner ? "bg-[#43f5dd] text-[#081018]" : "bg-[#081018] text-[#f7fbff] hover:bg-[#172433]"}`}
                    type="button"
                    onClick={() => setPartner(item)}
                    key={item}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-[1.1rem] bg-[#eafffb] p-5 text-[#081018]">
                <p className="font-mono text-xs uppercase tracking-[0.14em] opacity-60">Selected action</p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">{partner}</p>
                <p className="mt-3 leading-7 opacity-70">JEF must verify mandate, owner, data authority, community consent and evidence before any public claim.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
