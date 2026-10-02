import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { xrMedia } from "@/content/xr-media";

type JefActionImage = {
  src: string;
  alt: string;
  caption: string;
  programme?: string;
  layout: "primary" | "portrait" | "wide" | "compact" | "textual";
  objectPosition?: string;
  href?: string;
};

export const jefInActionImages: JefActionImage[] = [
  {
    src: xrMedia.mersetaCptWorkshopFacilitator,
    alt: "A facilitator presenting XR skills content during a workshop setting",
    caption: "Lecturer capability development",
    programme: "XR and digital skills",
    layout: "primary",
    objectPosition: "center 42%",
    href: "/programmes/xr-labs-tvet-colleges"
  },
  {
    src: xrMedia.jefSmallWorkshopDemo,
    alt: "A small group reviewing a projected digital learning demonstration",
    caption: "Implementation support in practice",
    programme: "Institutional transformation",
    layout: "portrait",
    objectPosition: "center 48%"
  },
  {
    src: xrMedia.jefIndustryBriefing,
    alt: "A group discussion at an industry and education technology briefing stand",
    caption: "Technology-enabled vocational education",
    programme: "Education and industry engagement",
    layout: "wide",
    objectPosition: "center 42%",
    href: "/services"
  },
  {
    src: xrMedia.jefXrPresentationStage2,
    alt: "A presenter explaining digital learning content beside a large display",
    caption: "Skills development in practice",
    programme: "Immersive learning",
    layout: "compact",
    objectPosition: "center 42%"
  },
  {
    src: xrMedia.jefTransformingEducationBanner,
    alt: "JEF and merSETA banners describing XR, digital skills and future-ready workforce development",
    caption: "Institutional digital transformation",
    programme: "Public programme positioning",
    layout: "textual",
    objectPosition: "center 50%",
    href: "/programmes"
  }
];

function imageFrameClassName(layout: JefActionImage["layout"]) {
  if (layout === "primary") return "md:col-span-7 md:row-span-2";
  if (layout === "portrait") return "md:col-span-5 md:row-span-2";
  if (layout === "wide") return "md:col-span-5";
  return "md:col-span-3";
}

function imageAspectClassName(layout: JefActionImage["layout"]) {
  if (layout === "primary") return "aspect-[1.22] md:h-full md:min-h-[580px]";
  if (layout === "portrait") return "aspect-[0.82] md:h-full md:min-h-[580px]";
  if (layout === "wide") return "aspect-[1.7]";
  return "aspect-[1.08]";
}

function MosaicFigure({ image, index }: { image: JefActionImage; index: number }) {
  const content = (
    <figure
      className={`group relative h-full overflow-hidden rounded-[1.25rem] border border-white/[0.12] bg-white/[0.055] shadow-[0_24px_90px_rgba(0,0,0,0.24)] transition duration-300 ease-fluid motion-safe:animate-[jef-mosaic-rise_680ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:transition-none ${imageAspectClassName(image.layout)}`}
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <Image
        alt={image.alt}
        className="object-cover transition duration-500 ease-fluid group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        fill
        loading="lazy"
        sizes={
          image.layout === "primary"
            ? "(min-width: 1024px) 54vw, (min-width: 768px) 58vw, 100vw"
            : image.layout === "portrait"
              ? "(min-width: 1024px) 38vw, (min-width: 768px) 42vw, 100vw"
              : "(min-width: 1024px) 30vw, (min-width: 768px) 44vw, 100vw"
        }
        src={image.src}
        style={{ objectPosition: image.objectPosition ?? "center" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,13,0.02),rgba(5,8,13,0.18)_42%,rgba(5,8,13,0.84)_100%)]" />
      <figcaption className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
        <span className="inline-flex rounded-full bg-ink/78 px-3 py-1.5 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-lime ring-1 ring-white/12 backdrop-blur-xl">
          {image.programme}
        </span>
        <p className="mt-3 max-w-sm text-lg font-semibold leading-6 tracking-[-0.025em] text-paper">{image.caption}</p>
      </figcaption>
    </figure>
  );

  if (!image.href) return content;

  return (
    <Link
      aria-label={`Explore ${image.caption.toLowerCase()}`}
      className="block h-full rounded-[1.25rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
      href={image.href}
    >
      {content}
    </Link>
  );
}

export function JefInAction() {
  return (
    <section aria-labelledby="jef-in-action-title" className="relative scroll-mt-28 overflow-hidden bg-surface px-4 py-20 text-paper md:scroll-mt-32 md:px-8 md:py-32">
      <div className="absolute inset-0 noise-field opacity-[0.14]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_8%,rgba(84,220,255,0.14),transparent_32rem),radial-gradient(ellipse_at_88%_82%,rgba(170,255,128,0.1),transparent_34rem)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">JEF in Action</p>
            <h2
              className="mt-5 max-w-4xl font-display text-[clamp(2.45rem,5vw,5.8rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-balance"
              id="jef-in-action-title"
            >
              Transformation becomes real through implementation
            </h2>
          </div>
          <div className="max-w-2xl lg:justify-self-end">
            <p className="text-lg leading-8 text-paper/72">
              Across education, technology and workforce development, JEF works with institutions and people to turn practical ideas into active programmes and stronger capabilities.
            </p>
            <Link
              className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-white/[0.08] px-5 text-sm font-bold text-paper ring-1 ring-white/[0.14] transition duration-300 ease-fluid hover:bg-cyan hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan motion-reduce:transition-none"
              href="/programmes"
            >
              View programmes
              <ArrowUpRight aria-hidden="true" size={16} />
            </Link>
          </div>
        </div>

        <ul className="mt-12 grid gap-4 md:grid-cols-12 md:auto-rows-fr" aria-label="JEF implementation imagery">
          {jefInActionImages.map((image, index) => (
            <li className={imageFrameClassName(image.layout)} key={image.src}>
              <MosaicFigure image={image} index={index} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
