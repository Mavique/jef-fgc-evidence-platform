"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Factory,
  Landmark,
  Network,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/MotionPrimitives";
import { defaultPartnershipPathwayId, partnershipPathways, type PartnershipPathwayId } from "@/content/partnership-pathways";

const pathwayIcons = {
  "tvet-education": Building2,
  "government-municipalities": Landmark,
  "industry-employers": Factory,
  "funders-strategic": Network
} satisfies Record<PartnershipPathwayId, typeof Building2>;

function PathwayVisual() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block" aria-hidden="true">
      <div className="absolute -right-20 top-16 h-72 w-72 rounded-full border border-cyan/18" />
      <div className="absolute right-16 top-40 h-40 w-40 rounded-full border border-lime/16" />
      <div className="absolute bottom-14 right-12 h-px w-[28rem] rotate-[-28deg] bg-gradient-to-r from-transparent via-cyan/35 to-transparent" />
      <div className="absolute bottom-40 right-6 h-px w-[22rem] rotate-[18deg] bg-gradient-to-r from-transparent via-lime/28 to-transparent" />
      <div className="absolute right-28 top-28 grid size-14 place-items-center rounded-full border border-cyan/25 bg-cyan/10 text-cyan">
        <Sparkles size={20} />
      </div>
      <div className="absolute bottom-28 right-44 grid size-11 place-items-center rounded-full border border-lime/25 bg-lime/10 text-lime">
        <ShieldCheck size={18} />
      </div>
    </div>
  );
}

export function PartnerWithJef() {
  const [activeId, setActiveId] = useState<PartnershipPathwayId>(defaultPartnershipPathwayId);
  const [mobileOpenId, setMobileOpenId] = useState<PartnershipPathwayId | null>(null);
  const reduceMotion = useReducedMotion();
  const active = partnershipPathways.find((pathway) => pathway.id === activeId) ?? partnershipPathways[0];
  const ActiveIcon = pathwayIcons[active.id];

  return (
    <section className="home-section-anchor relative overflow-hidden bg-ink" id="partner-with-jef">
      <div className="absolute inset-0 tech-grid opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_16%_18%,rgba(84,220,255,0.16),transparent_32rem),radial-gradient(ellipse_at_86%_72%,rgba(170,255,128,0.12),transparent_30rem)]" />
      <PathwayVisual />

      <div className="home-container relative grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-stretch">
        <Reveal>
          <aside className="grid h-full content-between gap-8 rounded-[1.35rem] border border-white/[0.1] bg-white/[0.055] p-6 md:p-8">
            <div>
              <h2 className="font-display text-[clamp(2.7rem,6vw,6.35rem)] font-semibold leading-[0.88] tracking-[-0.055em] text-paper">
                Partner With JEF
              </h2>
              <p className="home-body mt-6 max-w-xl text-paper/72">
                JEF works with institutions to design and implement education, skills, technology and employment pathways that can be adopted responsibly.
              </p>
            </div>
            <div className="rounded-[1rem] border border-cyan/18 bg-cyan/10 p-5">
              <p className="text-sm font-semibold leading-6 text-paper/82">
                Start with the audience you represent. The next step routes to the public contact page with the relevant partnership context selected.
              </p>
            </div>
          </aside>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="hidden h-full rounded-[1.35rem] border border-white/[0.1] bg-surface/88 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.28)] lg:grid lg:grid-cols-[17rem_1fr] lg:gap-4">
            <nav aria-label="Partnership pathways" className="grid gap-3">
              {partnershipPathways.map((pathway, index) => {
                const Icon = pathwayIcons[pathway.id];
                const selected = pathway.id === active.id;

                return (
                  <button
                    aria-current={selected ? "true" : undefined}
                    className={`group grid min-h-20 grid-cols-[2.5rem_1fr] items-center gap-3 rounded-[1rem] p-4 text-left transition duration-300 ease-fluid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan ${
                      selected
                        ? "bg-cyan text-ink"
                        : "bg-white/[0.055] text-paper ring-1 ring-white/[0.1] hover:bg-white/[0.09]"
                    }`}
                    key={pathway.id}
                    onClick={() => setActiveId(pathway.id)}
                    type="button"
                  >
                    <span className={`grid size-10 place-items-center rounded-full ${selected ? "bg-ink text-paper" : "bg-white/[0.08] text-cyan ring-1 ring-white/[0.1]"}`}>
                      <Icon aria-hidden="true" size={18} />
                    </span>
                    <span>
                      <span className="block text-xs font-black uppercase tracking-[0.14em] opacity-70">
                        Pathway {index + 1}
                      </span>
                      <span className="mt-2 block text-sm font-bold leading-5">{pathway.audience}</span>
                    </span>
                  </button>
                );
              })}
            </nav>

            <motion.article
              animate={reduceMotion ? false : { opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[1.12rem] bg-ink p-6 md:p-8"
              initial={reduceMotion ? false : { opacity: 0.96, y: 8 }}
              key={active.id}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-cyan/80 via-lime/60 to-transparent" />
              <div className="flex items-start gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-cyan text-ink">
                  <ActiveIcon aria-hidden="true" size={24} />
                </span>
                <div>
                  <p className="text-sm font-bold text-cyan">Selected pathway</p>
                  <h3 className="mt-2 max-w-2xl text-[clamp(2.2rem,4vw,3.7rem)] font-semibold leading-none tracking-[-0.055em] text-paper">
                    {active.audience}
                  </h3>
                </div>
              </div>
              <p className="home-body mt-6 max-w-3xl text-paper/72">{active.summary}</p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {active.possibilities.map((possibility) => (
                  <div className="rounded-[0.95rem] border border-white/[0.1] bg-white/[0.055] p-4 text-sm font-semibold leading-6 text-paper/78" key={possibility}>
                    {possibility}
                  </div>
                ))}
              </div>
              <Link
                className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cyan px-5 text-sm font-bold text-ink transition duration-300 ease-fluid hover:bg-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
                href={active.contactHref}
              >
                {active.actionLabel}
                <ArrowUpRight aria-hidden="true" size={16} />
              </Link>
            </motion.article>
          </div>

          <div className="grid gap-3 lg:hidden">
            {partnershipPathways.map((pathway) => {
              const Icon = pathwayIcons[pathway.id];
              const open = pathway.id === mobileOpenId;

              return (
                <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055]" key={pathway.id}>
                  <button
                    aria-expanded={open}
                    className="grid min-h-16 w-full grid-cols-[2.5rem_1fr_auto] items-center gap-3 p-4 text-left text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
                    onClick={() => {
                      setActiveId(pathway.id);
                      setMobileOpenId(open ? null : pathway.id);
                    }}
                    type="button"
                  >
                    <span className="grid size-10 place-items-center rounded-full bg-cyan/12 text-cyan ring-1 ring-cyan/20">
                      <Icon aria-hidden="true" size={18} />
                    </span>
                    <span className="text-base font-bold leading-5">{pathway.audience}</span>
                    <span className="text-sm font-black text-cyan">{open ? "Close" : "Open"}</span>
                  </button>
                  {open ? (
                    <div className="border-t border-white/[0.1] p-4">
                      <p className="text-sm leading-6 text-paper/70">{pathway.summary}</p>
                      <div className="mt-5 grid gap-2">
                        {pathway.possibilities.map((possibility) => (
                          <p className="rounded-[0.85rem] bg-ink/48 p-3 text-sm leading-6 text-paper/72" key={possibility}>
                            {possibility}
                          </p>
                        ))}
                      </div>
                      <Link
                        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-cyan px-4 text-sm font-bold text-ink transition hover:bg-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
                        href={pathway.contactHref}
                      >
                        {pathway.actionLabel}
                        <ArrowUpRight aria-hidden="true" size={15} />
                      </Link>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
