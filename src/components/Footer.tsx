import Image from "next/image";
import Link from "next/link";

const groups = [
  [
    "Company",
    [
      ["About", "/about"],
      ["Leadership", "/about/leadership"],
      ["Governance", "/about/governance"],
      ["Documents", "/documents"]
    ]
  ],
  [
    "Solutions",
    [
      ["Services", "/services"],
      ["XR Catalogue", "/xr-catalogue"],
      ["JEF AI Services", "/programmes/ai-services"],
      ["VOCLE XR", "/programmes/vocle-xr"],
      ["XR Labs for TVET Colleges", "/programmes/xr-labs-tvet-colleges"]
    ]
  ],
  [
    "Programmes",
    [
      ["Digital Hubs", "/programmes/dxhub"],
      ["WORKGRID Labs", "/programmes/workgrid-labs"],
      ["Workplace 4.0", "/programmes/workplace-4"],
      ["Spatial Enterprise", "/programmes/spatial-enterprise"]
    ]
  ],
  [
    "Governance",
    [
      ["Documents", "/documents"],
      ["Privacy", "/privacy"],
      ["Accessibility", "/accessibility"]
    ]
  ],
  [
    "Connect",
    [
      ["Partnerships", "/partnerships"],
      ["Contact", "/contact"],
      ["FGC Portal", "/fgc-ekm/sign-in"],
      ["FGC Gateway", "/programmes/merseta-fgc-ekm"]
    ]
  ]
] as const;

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink px-5 py-16 text-paper md:px-8" role="contentinfo">
      <div className="absolute inset-0 noise-field opacity-20" />
      <div className="relative mx-auto grid max-w-7xl gap-10 md:grid-cols-3 lg:grid-cols-[1.25fr_repeat(5,0.72fr)]">
        <div>
          <div className="relative mb-6 h-16 w-[260px] max-w-full">
            <Image
              alt="Jengrac Education Foundation"
              className="object-contain object-left drop-shadow-[0_0_28px_rgba(84,220,255,0.14)]"
              fill
              sizes="260px"
              src="/images/brand/jef-logo.png"
            />
          </div>
          <p className="max-w-sm text-sm leading-7 text-paper/[0.68]">
            Jengrac Education Foundation builds AI, Extended Reality and Spatial Intelligence systems for education, institutional transformation and practical capability development.
          </p>
          <p className="mt-5 max-w-sm text-sm leading-7 text-paper/[0.62]">
            <Link className="transition duration-300 hover:text-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan" href="mailto:admin@jengrac.tech">
              admin@jengrac.tech
            </Link>
          </p>
        </div>
        {groups.map(([title, items]) => (
          <div key={title}>
            <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-cyan">{title}</h2>
            <div className="grid gap-3">
              {items.map(([item, href]) => (
                <Link className="text-sm text-paper/[0.66] transition duration-700 ease-fluid hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan" href={href} key={href}>
                  {item}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="relative mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-paper/10 pt-6 font-mono text-xs uppercase tracking-[0.14em] text-paper/[0.48] md:flex-row md:items-center md:justify-between">
        <span>© 2026 Jengrac Education Foundation. All rights reserved.</span>
        <span>AI, XR and Spatial Intelligence for education and institutional transformation.</span>
      </div>
    </footer>
  );
}
