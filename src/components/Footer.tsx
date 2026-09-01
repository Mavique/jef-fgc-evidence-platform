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
    "Platform",
    [
      ["VOCLE XR", "/programmes/vocle-xr"],
      ["Digital Hubs", "/programmes/dxhub"],
      ["Prolific Edge", "/programmes/prolific-edge"],
      ["WORKGRID Labs", "/programmes/workgrid-labs"]
    ]
  ],
  [
    "Systems",
    [
      ["Impact", "/impact"],
      ["Projects", "/projects"],
      ["Insights", "/insights"],
      ["Opportunities", "/opportunities"]
    ]
  ],
  [
    "Connect",
    [
      ["Partnerships", "/partnerships"],
      ["Contact", "/contact"],
      ["Privacy", "/privacy"],
      ["Accessibility", "/accessibility"]
    ]
  ]
] as const;

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink px-5 py-16 text-paper md:px-8" role="contentinfo">
      <div className="absolute inset-0 noise-field opacity-20" />
      <div className="relative mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.35fr_repeat(4,0.7fr)]">
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
            Jengrac Education Foundation builds AI and Extended Reality systems for education, training and skills development.
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
      <div className="relative mx-auto mt-14 max-w-7xl border-t border-paper/10 pt-6 font-mono text-xs uppercase tracking-[0.14em] text-paper/[0.48]">
        © 2026 Jengrac Education Foundation. AI, XR and skills development platform concept. Content placeholders require verification.
      </div>
    </footer>
  );
}
