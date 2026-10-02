"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Download, FileText, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/MotionPrimitives";
import {
  featuredKnowledgeResource,
  knowledgeResourcesIntro,
  supportingKnowledgeResources,
  type HomeResource
} from "@/content/home-resources";

const resourceIcons = {
  Catalogue: BookOpen,
  Framework: ShieldCheck
} satisfies Record<HomeResource["type"], typeof BookOpen>;

function ResourceAction({ resource, className = "" }: { resource: HomeResource; className?: string }) {
  const icon = resource.download ? <Download aria-hidden="true" size={16} /> : <ArrowUpRight aria-hidden="true" size={16} />;
  const baseClassName = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold transition duration-300 ease-fluid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan ${className}`;

  if (resource.download) {
    return (
      <a className={baseClassName} download href={resource.href}>
        {resource.actionLabel}
        {icon}
      </a>
    );
  }

  return (
    <Link className={baseClassName} href={resource.href}>
      {resource.actionLabel}
      {icon}
    </Link>
  );
}

function ResourceLabel({ resource }: { resource: HomeResource }) {
  const Icon = resourceIcons[resource.type];

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-ink/8 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-ink/74 ring-1 ring-ink/10">
      <Icon aria-hidden="true" size={14} />
      {resource.type}
    </span>
  );
}

function SupportingResource({ resource, index }: { resource: HomeResource; index: number }) {
  return (
    <Reveal delay={index * 0.055}>
      <article className="group grid gap-4 rounded-[1.15rem] border border-white/[0.1] bg-white/[0.052] p-4 transition duration-300 ease-fluid hover:border-cyan/35 hover:bg-white/[0.074] md:grid-cols-[8.5rem_1fr]">
        <Link
          aria-label={`Open ${resource.title}`}
          className="relative min-h-32 overflow-hidden rounded-[0.9rem] bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan md:min-h-full"
          href={resource.href}
        >
          <Image
            alt={resource.imageAlt}
            className="object-cover transition duration-500 ease-fluid group-hover:scale-[1.04]"
            fill
            sizes="(min-width: 768px) 9rem, 100vw"
            src={resource.image}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,13,0.04),rgba(5,8,13,0.56))]" />
        </Link>
        <div className="grid gap-5 py-1">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-cyan ring-1 ring-white/[0.1]">
              <FileText aria-hidden="true" size={13} />
              {resource.type}
            </div>
            <h3 className="mt-4 text-2xl font-semibold leading-none tracking-[-0.045em] text-paper">{resource.title}</h3>
            <p className="mt-3 text-sm leading-6 text-paper/66">{resource.description}</p>
          </div>
          <ResourceAction className="w-fit bg-white/[0.08] text-paper ring-1 ring-white/[0.12] hover:bg-cyan hover:text-ink" resource={resource} />
        </div>
      </article>
    </Reveal>
  );
}

export function KnowledgeResources() {
  return (
    <section className="home-section-anchor relative overflow-hidden bg-surface" id="knowledge-resources">
      <div className="absolute inset-0 noise-field opacity-[0.14]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/35 to-transparent" />
      <div className="home-container relative">
        <Reveal className="grid gap-6 lg:grid-cols-[0.9fr_0.72fr] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">{knowledgeResourcesIntro.eyebrow}</p>
            <h2 className="mt-5 max-w-4xl font-display text-[clamp(2.4rem,5vw,5.6rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-balance text-paper">
              {knowledgeResourcesIntro.title}
            </h2>
          </div>
          <div className="grid gap-5">
            <p className="home-body max-w-2xl text-paper/70">{knowledgeResourcesIntro.body}</p>
            <Link
              className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-full bg-white/[0.08] px-4 text-sm font-bold text-paper ring-1 ring-white/[0.14] transition duration-300 ease-fluid hover:bg-white/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
              href={knowledgeResourcesIntro.viewAll.href}
            >
              {knowledgeResourcesIntro.viewAll.label}
              <ArrowUpRight aria-hidden="true" size={16} />
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
          <Reveal>
            <article className="relative grid h-full overflow-hidden rounded-[1.35rem] border border-cyan/24 bg-paper text-ink shadow-[0_30px_100px_rgba(5,8,13,0.28)] lg:grid-cols-[0.86fr_1.14fr]">
              <div className="relative min-h-[320px] overflow-hidden bg-white sm:min-h-[420px] lg:min-h-[560px]">
                <Image
                  alt={featuredKnowledgeResource.imageAlt}
                  className="p-4 object-contain object-top"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  src={featuredKnowledgeResource.image}
                />
              </div>
              <div className="grid content-between gap-8 p-6 md:p-8">
                <div>
                  <ResourceLabel resource={featuredKnowledgeResource} />
                  <h3 className="mt-6 max-w-xl font-display text-[clamp(2.2rem,4.1vw,4.6rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
                    {featuredKnowledgeResource.title}
                  </h3>
                  <p className="mt-5 max-w-xl text-base leading-7 text-ink/70 md:text-lg md:leading-8">
                    {featuredKnowledgeResource.description}
                  </p>
                </div>
                <div className="grid gap-5">
                  <div className="rounded-[1rem] border border-ink/10 bg-ink/[0.04] p-4">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-canopy">Public document</p>
                    <p className="mt-2 text-sm leading-6 text-ink/66">
                      Approved PDF catalogue. Publication date is not listed in the repository.
                    </p>
                  </div>
                  <ResourceAction
                    className="w-fit bg-ink text-paper hover:bg-canopy"
                    resource={featuredKnowledgeResource}
                  />
                </div>
              </div>
            </article>
          </Reveal>

          <div className="grid gap-5">
            {supportingKnowledgeResources.map((resource, index) => (
              <SupportingResource index={index} key={resource.id} resource={resource} />
            ))}
            <Reveal delay={0.12}>
              <div className="rounded-[1.15rem] border border-lime/22 bg-lime/[0.08] p-5">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-lime">Publication boundary</p>
                <p className="mt-3 text-sm leading-6 text-paper/70">
                  Restricted FGC evidence records, private submissions and internal operational documents remain outside this public homepage shelf.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
