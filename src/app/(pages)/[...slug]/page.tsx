import Image from "next/image";
import Link from "next/link";
import { xrMedia } from "@/content/xr-media";

const titles: Record<string, string> = {
  "about/leadership": "Leadership",
  "about/governance": "Governance",
  programmes: "Programmes",
  impact: "Impact",
  projects: "Projects",
  partnerships: "Partnerships",
  insights: "Insights",
  opportunities: "Opportunities",
  documents: "Documents",
  contact: "Contact",
  privacy: "Privacy",
  accessibility: "Accessibility"
};

const placeholderImages: Record<string, string> = {
  "about/leadership": xrMedia.jefXrPresentationStage2,
  "about/governance": xrMedia.jefTransformingEducationBanner,
  programmes: xrMedia.mixedRealityDeviceCollage,
  impact: xrMedia.medicalXrSpine,
  projects: xrMedia.spatialAiRoboticsFactory,
  partnerships: xrMedia.arLabInspection,
  insights: xrMedia.industrialXrInterface,
  opportunities: xrMedia.industrialMrTechnician,
  documents: xrMedia.medicalXrTraining,
  contact: xrMedia.jefXrExpoHeadsetDemo,
  privacy: xrMedia.industrialMrTechnician,
  accessibility: xrMedia.girlRoboticsLab
};

export function generateStaticParams() {
  return Object.keys(titles).map((slug) => ({ slug: slug.split("/") }));
}

export default async function PlaceholderPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const key = slug.join("/");
  const title = titles[key] ?? "JEF Programme Story";
  const image = placeholderImages[key] ?? xrMedia.mixedRealityDeviceCollage;

  return (
    <main className="min-h-screen bg-ink px-5 pb-24 pt-36 text-paper md:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="mb-14 inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-5 py-3 text-sm font-bold text-cyan ring-1 ring-white/[0.12]">
          ← Back to homepage
        </Link>
        <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.1] bg-white/[0.055] p-1.5 ring-1 ring-white/10">
          <Image
            alt={`${title} visual context`}
            className="absolute inset-0 object-cover opacity-42 saturate-[0.82]"
            fill
            priority
            sizes="(min-width: 1024px) 80vw, 100vw"
            src={image}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,13,0.96),rgba(5,8,13,0.78)_48%,rgba(5,8,13,0.34)),linear-gradient(180deg,rgba(5,8,13,0.12),rgba(5,8,13,0.9))]" />
          <div className="relative z-10 grid min-h-[620px] content-between gap-12 rounded-[1.55rem] p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)] md:p-10">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">JEF information architecture</p>
              <h1 className="mt-7 max-w-4xl font-display text-[clamp(3rem,8vw,7rem)] font-semibold leading-[0.86] tracking-[-0.065em] text-paper">{title}</h1>
              <p className="mt-8 max-w-3xl text-xl leading-9 text-paper/[0.72]">
                This route is established for the production information architecture. Final copy, verified evidence, product detail, imagery and governance documents should be added through the structured content model before publication.
              </p>
            </div>
            <div className="max-w-2xl rounded-[1.25rem] bg-ink/74 p-6 backdrop-blur-xl ring-1 ring-white/[0.12]">
              <h2 className="text-3xl font-semibold tracking-[-0.05em]">Content verification required</h2>
              <p className="mt-4 leading-7 text-paper/[0.66]">
                Do not add institutional claims, impact numbers, partner names or programme outcomes here unless supplied and approved by JEF.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
