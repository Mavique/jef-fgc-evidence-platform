import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { findCatalogueProduct, xrCataloguePdf, xrCatalogueProducts } from "@/content/xr-catalogue";

export function generateStaticParams() {
  return xrCatalogueProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = findCatalogueProduct(slug);

  if (!product) return {};

  return {
    title: `${product.name} | XR Catalogue | Jengrac Education Foundation`,
    description: product.summary,
    alternates: {
      canonical: `/xr-catalogue/${product.slug}`
    },
    openGraph: {
      title: `${product.name} | XR Catalogue`,
      description: product.summary,
      images: [product.image]
    }
  };
}

export default async function XrCatalogueProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = findCatalogueProduct(slug);

  if (!product) notFound();

  const related = xrCatalogueProducts
    .filter((candidate) => candidate.category === product.category && candidate.id !== product.id)
    .slice(0, 3);

  return (
    <main className="bg-ink text-paper">
      <section className="px-4 pb-16 pt-32 md:px-8 md:pt-36">
        <div className="mx-auto max-w-7xl">
          <Link className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/[0.08] px-4 text-sm font-bold text-cyan ring-1 ring-white/[0.12] transition hover:bg-white/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan" href="/xr-catalogue">
            <ArrowLeft aria-hidden="true" size={16} />
            Back to XR Catalogue
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="relative aspect-[1.2] overflow-hidden rounded-[1.4rem] border border-white/[0.1] bg-white">
              <Image alt={product.imageAlt} className="object-contain p-8" fill priority sizes="(min-width: 1024px) 48vw, 100vw" src={product.image} />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">{product.category}</p>
              <h1 className="mt-4 font-display text-[clamp(3rem,7vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.06em]">
                {product.name}
              </h1>
              {product.model ? <p className="mt-3 text-2xl font-semibold text-paper/72">{product.model}</p> : null}
              <p className="mt-6 max-w-2xl text-lg leading-8 text-paper/72">{product.summary}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-lime px-4 py-2 text-sm font-black text-ink">
                  {product.pricingMode === "REQUEST_QUOTE" ? "Price on Request" : product.displayedPrice}
                </span>
                {product.productCode ? <span className="rounded-full bg-white/[0.08] px-4 py-2 text-sm font-bold text-paper ring-1 ring-white/[0.12]">{product.productCode}</span> : null}
                <span className="rounded-full bg-white/[0.08] px-4 py-2 text-sm font-bold text-paper ring-1 ring-white/[0.12]">Catalogue page {product.sourcePage}</span>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a className="inline-flex min-h-12 items-center justify-center rounded-full bg-cyan px-6 text-sm font-bold text-ink transition hover:bg-lime" href={`mailto:admin@jengrac.tech?subject=${encodeURIComponent(`XR Catalogue enquiry: ${product.name}`)}&body=${encodeURIComponent(`Please assist with a quotation or consultation for ${product.name}${product.model ? ` (${product.model})` : ""}.\nProduct code: ${product.productCode ?? product.id}`)}`}>
                  Request Consultation
                </a>
                <a className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/[0.08] px-5 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition hover:bg-white/[0.14]" href={xrCataloguePdf.href} download>
                  <Download aria-hidden="true" size={16} />
                  Download Full Catalogue
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-[1.2rem] border border-white/[0.1] bg-white/[0.055] p-6">
              <h2 className="text-3xl font-semibold tracking-[-0.045em]">Verified specifications</h2>
              <dl className="mt-6 grid gap-3">
                {product.specifications.map((spec) => (
                  <div className="grid gap-2 border-t border-white/[0.08] pt-3 md:grid-cols-[12rem_1fr]" key={spec.label}>
                    <dt className="text-paper/48">{spec.label}</dt>
                    <dd className="text-paper/78">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="rounded-[1.2rem] border border-white/[0.1] bg-white/[0.055] p-6">
              <h2 className="text-3xl font-semibold tracking-[-0.045em]">Applications and tags</h2>
              <div className="mt-6">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Intended applications</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.intendedUses.map((item) => <span className="rounded-full bg-cyan/12 px-3 py-1.5 text-sm font-bold text-cyan ring-1 ring-cyan/20" key={item}>{item}</span>)}
                </div>
              </div>
              <div className="mt-6">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Capability tags</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.capabilityTags.map((item) => <span className="rounded-full bg-lime/12 px-3 py-1.5 text-sm font-bold text-lime ring-1 ring-lime/20" key={item}>{item}</span>)}
                </div>
              </div>
              <p className="mt-6 text-sm leading-6 text-paper/60">Product specifications, availability and quotations are confirmed during the enquiry process.</p>
            </section>
          </div>

          {related.length ? (
            <section className="mt-12">
              <h2 className="text-3xl font-semibold tracking-[-0.045em]">Related products</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {related.map((item) => (
                  <Link className="rounded-[1rem] border border-white/[0.1] bg-white/[0.055] p-4 transition hover:-translate-y-0.5 hover:border-cyan/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan" href={`/xr-catalogue/${item.slug}`} key={item.id}>
                    <p className="font-semibold">{item.name}</p>
                    <p className="mt-2 text-sm text-paper/58">{item.summary}</p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
