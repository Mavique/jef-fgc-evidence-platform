import Image from "next/image";
import Link from "next/link";
import type { PublicRouteAction, PublicRouteCard, PublicRouteDefinition } from "@/content/public-routes";

function ActionLink({ action }: { action: PublicRouteAction }) {
  const base = "inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-bold transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan";
  const tone = action.variant === "secondary"
    ? "bg-white/[0.08] text-paper ring-1 ring-white/[0.14] hover:bg-white/[0.12]"
    : "bg-cyan text-ink hover:bg-lime";

  return (
    <Link className={`${base} ${tone}`} href={action.href}>
      {action.label}
    </Link>
  );
}

function SmallCard({ card, index }: { card: PublicRouteCard; index: number }) {
  const featured = index === 0;
  const content = (
    <>
      <div>
        {card.meta ? (
          <p className={`mb-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] ${featured ? "text-ink/70" : "text-cyan"}`}>
            {card.meta}
          </p>
        ) : null}
        <h3 className="text-xl font-semibold tracking-[-0.04em]">{card.title}</h3>
      </div>
      <div>
        <p className={`text-sm leading-6 ${featured ? "text-ink/74" : "text-paper/[0.68]"}`}>{card.body}</p>
        {card.href ? (
          <span className={`mt-5 inline-flex text-sm font-bold ${featured ? "text-ink" : "text-cyan"}`}>
            {card.actionLabel ?? "Open resource"}
          </span>
        ) : null}
      </div>
    </>
  );

  const className = `grid h-full content-between gap-5 rounded-[1.1rem] border p-5 ${featured ? "border-cyan/35 bg-cyan text-ink" : "border-white/[0.1] bg-white/[0.055] text-paper"}`;

  if (card.href) {
    return (
      <Link className={`${className} transition duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan`} href={card.href}>
        {content}
      </Link>
    );
  }

  return (
    <article className={className}>
      {content}
    </article>
  );
}

function PathwayItem({ card, index }: { card: PublicRouteCard; index: number }) {
  return (
    <article className="grid gap-4 rounded-[1rem] border border-white/[0.1] bg-white/[0.055] p-5 md:grid-cols-[5rem_1fr] md:items-start">
      <div className="flex items-center gap-3 md:grid md:gap-2">
        <span className="grid size-10 place-items-center rounded-full bg-lime text-sm font-black text-ink">{String(index + 1).padStart(2, "0")}</span>
        <span className="hidden h-full min-h-12 w-px bg-gradient-to-b from-lime/70 to-transparent md:block" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-xl font-semibold tracking-[-0.04em] text-paper">{card.title}</h3>
        <p className="mt-2 text-sm leading-6 text-paper/[0.68]">{card.body}</p>
      </div>
    </article>
  );
}

export function PublicRouteExperience({ page }: { page: PublicRouteDefinition }) {
  return (
    <main className="bg-ink text-paper">
      <section className="relative isolate overflow-hidden px-4 pb-16 pt-32 md:px-8 md:pt-36">
        <div className="absolute inset-0 noise-field opacity-25" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.94fr_1.06fr] lg:items-stretch">
          <div className="relative z-10 grid content-between gap-8 rounded-[1.35rem] border border-white/[0.1] bg-white/[0.045] p-6 md:p-8">
            <div>
              <Link
                className="mb-8 inline-flex min-h-11 items-center rounded-full bg-white/[0.08] px-4 text-sm font-bold text-cyan ring-1 ring-white/[0.12] transition hover:bg-white/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
                href="/"
              >
                Back to home
              </Link>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">{page.eyebrow}</p>
              <h1 className="mt-5 max-w-4xl font-display text-[clamp(3.2rem,8vw,7.1rem)] font-semibold leading-[0.86] tracking-[-0.06em] text-paper">
                {page.title}
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-paper/[0.74] md:text-xl md:leading-9">{page.intro}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {page.primaryAction ? <ActionLink action={page.primaryAction} /> : null}
              {page.secondaryAction ? <ActionLink action={page.secondaryAction} /> : null}
            </div>
          </div>

          <div className="relative z-10 min-h-[440px] overflow-hidden rounded-[1.35rem] border border-white/[0.1] bg-surface">
            <Image
              alt={page.imageAlt}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              src={page.image}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,13,0.06),rgba(5,8,13,0.72)),linear-gradient(90deg,rgba(5,8,13,0.52),transparent_55%)]" />
            <div className="absolute bottom-5 left-5 right-5 rounded-[1rem] border border-white/[0.14] bg-ink/78 p-5 backdrop-blur-xl">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-cyan">Current public status</p>
              <p className="mt-3 text-xl font-semibold tracking-[-0.04em] text-paper">{page.status}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 md:grid-cols-3">
            {page.highlights.map((card, index) => (
              <SmallCard card={card} index={index} key={`${card.title}-${index}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Operating view</p>
            <h2 className="mt-4 max-w-xl font-display text-[clamp(2.4rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-paper">
              {page.pathwayTitle}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-paper/[0.68]">{page.pathwayIntro}</p>
          </div>
          <div className="grid gap-4">
            {page.pathway.map((card, index) => (
              <PathwayItem card={card} index={index} key={`${card.title}-${index}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper px-4 py-16 text-ink md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-canopy">Evidence posture</p>
            <h2 className="mt-4 max-w-2xl font-display text-[clamp(2.4rem,5vw,4.8rem)] font-semibold leading-[0.92] tracking-[-0.055em]">
              {page.evidenceTitle}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-ink/70">{page.evidenceIntro}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            {page.evidence.map((card) => (
              <article className="rounded-[1rem] border border-ink/10 bg-ink/[0.035] p-5" key={card.title}>
                <h3 className="text-xl font-semibold tracking-[-0.04em]">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/68">{card.body}</p>
                {card.href ? (
                  <Link className="mt-5 inline-flex min-h-10 items-center rounded-full bg-ink px-4 text-sm font-bold text-paper transition hover:bg-canopy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-canopy" href={card.href}>
                    {card.actionLabel ?? "Open resource"}
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-[1.35rem] border border-white/[0.1] bg-white/[0.055] p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Next step</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-paper md:text-4xl">{page.finalTitle}</h2>
            <p className="mt-3 max-w-3xl leading-7 text-paper/[0.68]">{page.finalBody}</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            {page.primaryAction ? <ActionLink action={page.primaryAction} /> : null}
            <ActionLink action={{ label: "All programmes", href: "/programmes", variant: "secondary" }} />
          </div>
        </div>
      </section>
    </main>
  );
}
