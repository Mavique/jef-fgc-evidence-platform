import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/MotionPrimitives";
import { programmes } from "@/content/site";

type ProgrammeExplorerItem = {
  name: string;
  descriptor: string;
  description: string;
  category: "Immersive Learning" | "Workforce Pathways" | "Institutional Transformation" | "AI and Spatial Enterprise";
  href: string;
  image: string;
  imageAlt: string;
  emphasis: "feature" | "wide" | "standard";
  label?: string;
};

const programmeRouteBySlug: Record<string, string> = {
  "digital-transformation-hubs": "/programmes/dxhub",
  "workgrid-labs": "/programmes/workgrid-labs",
  "vocle-xr": "/programmes/vocle-xr",
  "xr-labs-tvet-colleges": "/programmes/xr-labs-tvet-colleges",
  "prolific-edge": "/programmes/prolific-edge",
  icampus: "/programmes/icampus",
  "spatial-enterprise": "/programmes/spatial-enterprise",
  "ai-services": "/programmes/ai-services"
};

const programmeSelection = [
  {
    slug: "digital-transformation-hubs",
    descriptor: "Place-based digital capability",
    category: "Institutional Transformation",
    emphasis: "feature",
    imageAlt: "Learners and facilitators in a JEF-supported digital classroom session"
  },
  {
    slug: "workgrid-labs",
    descriptor: "TVET-to-work capability grid",
    category: "Workforce Pathways",
    emphasis: "feature",
    imageAlt: "Learners working with robotics in a practical learning environment"
  },
  {
    slug: "vocle-xr",
    descriptor: "Immersive learning to capability",
    category: "Immersive Learning",
    emphasis: "wide",
    imageAlt: "XR-assisted learning visual with medical and capability development context"
  },
  {
    slug: "xr-labs-tvet-colleges",
    descriptor: "Platform-neutral XR lab activation",
    category: "Immersive Learning",
    emphasis: "standard",
    imageAlt: "A college computer lab used for XR and digital learning activation"
  },
  {
    slug: "prolific-edge",
    descriptor: "Enterprise capability development",
    category: "Workforce Pathways",
    emphasis: "standard",
    imageAlt: "JEF team engaging stakeholders during an institutional technology briefing"
  },
  {
    slug: "icampus",
    descriptor: "Connected learning campus",
    category: "Institutional Transformation",
    emphasis: "standard",
    imageAlt: "A large training room prepared for institutional learning and digital capability development"
  },
  {
    slug: "spatial-enterprise",
    descriptor: "Digital twins and spatial guidance",
    category: "AI and Spatial Enterprise",
    emphasis: "wide",
    imageAlt: "Worker inspecting a digital twin of industrial equipment"
  },
  {
    slug: "ai-services",
    descriptor: "Responsible applied AI systems",
    category: "AI and Spatial Enterprise",
    emphasis: "standard",
    imageAlt: "Professional using extended reality and data systems in an industrial setting"
  }
] satisfies Array<{
  slug: string;
  descriptor: string;
  category: ProgrammeExplorerItem["category"];
  emphasis: ProgrammeExplorerItem["emphasis"];
  imageAlt: string;
}>;

export const programmeExplorerItems: ProgrammeExplorerItem[] = programmeSelection.map((selection) => {
  const programme = programmes.find((item) => item.slug === selection.slug);
  if (!programme) {
    throw new Error(`Missing homepage programme explorer content for ${selection.slug}`);
  }

  return {
    name: programme.name,
    descriptor: selection.descriptor,
    description: programme.purpose,
    category: selection.category,
    href: programmeRouteBySlug[selection.slug],
    image: programme.image,
    imageAlt: selection.imageAlt,
    emphasis: selection.emphasis,
    label: programme.status
  };
});

function cardGridClassName(emphasis: ProgrammeExplorerItem["emphasis"]) {
  if (emphasis === "feature") return "md:col-span-6 xl:col-span-6";
  if (emphasis === "wide") return "md:col-span-6 xl:col-span-6";
  return "md:col-span-6 xl:col-span-3";
}

function cardLinkClassName(emphasis: ProgrammeExplorerItem["emphasis"]) {
  const minHeight = emphasis === "feature" ? "xl:min-h-[430px]" : emphasis === "wide" ? "xl:min-h-[360px]" : "";
  return `group relative flex min-h-[320px] h-full overflow-hidden rounded-[1.15rem] border border-white/[0.12] bg-white/[0.045] shadow-[0_24px_90px_rgba(0,0,0,0.22)] transition duration-300 ease-fluid hover:-translate-y-1 hover:border-cyan/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${minHeight}`;
}

export function ProgrammeExplorer() {
  return (
    <section aria-labelledby="programme-explorer-title" className="relative overflow-hidden bg-ink px-4 py-20 md:px-8 md:py-28">
      <div className="absolute inset-0 tech-grid opacity-28" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_12%,rgba(84,220,255,0.13),transparent_32rem),radial-gradient(ellipse_at_82%_72%,rgba(170,255,128,0.1),transparent_34rem)]" />
      <div className="relative mx-auto max-w-7xl">
        <Reveal className="grid gap-6 lg:grid-cols-[0.9fr_0.7fr] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">JEF Programme Ecosystem</p>
            <h2
              className="mt-5 max-w-4xl font-display text-[clamp(2.45rem,5vw,5.9rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-balance"
              id="programme-explorer-title"
            >
              Platforms and programmes for transformation
            </h2>
          </div>
          <div>
            <p className="max-w-2xl text-lg leading-8 text-paper/72">
              Explore JEF initiatives connecting education, immersive technology, institutional capability, enterprise development and pathways into work.
            </p>
            <Link
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-cyan px-5 text-sm font-bold text-ink transition duration-300 ease-fluid hover:bg-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan motion-reduce:transition-none"
              href="/programmes"
            >
              Explore all programmes
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-12">
          {programmeExplorerItems.map((programme, index) => (
            <Reveal className={cardGridClassName(programme.emphasis)} delay={(index % 4) * 0.035} key={programme.name}>
              <Link
                aria-label={`Explore programme: ${programme.name}`}
                className={cardLinkClassName(programme.emphasis)}
                href={programme.href}
              >
                <Image
                  alt={programme.imageAlt}
                  className="object-cover opacity-84 transition duration-500 ease-fluid group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  fill
                  sizes={
                    programme.emphasis === "standard"
                      ? "(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                      : "(min-width: 1280px) 50vw, (min-width: 768px) 50vw, 100vw"
                  }
                  src={programme.image}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,13,0.08),rgba(5,8,13,0.45)_35%,rgba(5,8,13,0.94)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_18%,rgba(84,220,255,0.18),transparent_18rem)] opacity-0 transition duration-300 group-hover:opacity-100 motion-reduce:transition-none" />
                <div className="relative z-10 flex min-h-full w-full flex-col justify-between p-5 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full bg-ink/70 px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-lime ring-1 ring-white/12 backdrop-blur-xl">
                      {programme.category}
                    </span>
                    {programme.label ? (
                      <span className="rounded-full bg-white/[0.12] px-3 py-1.5 text-xs font-bold text-paper ring-1 ring-white/12 backdrop-blur-xl">
                        {programme.label}
                      </span>
                    ) : null}
                  </div>

                  <div className="max-w-xl">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-cyan">{programme.descriptor}</p>
                    <h3 className="mt-4 text-[clamp(1.75rem,3.2vw,3.4rem)] font-semibold leading-none tracking-[-0.05em] text-paper">
                      {programme.name}
                    </h3>
                    <p className="mt-4 line-clamp-4 max-w-2xl text-sm leading-6 text-paper/76 md:text-base md:leading-7">
                      {programme.description}
                    </p>
                    <span className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white/[0.1] px-4 text-sm font-bold text-paper ring-1 ring-white/[0.14] transition duration-300 group-hover:bg-cyan group-hover:text-ink motion-reduce:transition-none">
                      Explore programme
                      <ArrowUpRight aria-hidden="true" size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
