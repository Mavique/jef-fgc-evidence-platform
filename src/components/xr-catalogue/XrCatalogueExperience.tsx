"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BatteryCharging,
  BookOpenCheck,
  Box,
  Cable,
  Camera,
  ChevronsDownUp,
  Cpu,
  Download,
  Eye,
  Fan,
  Gamepad2,
  Hand,
  HardDrive,
  LayoutDashboard,
  Lock,
  MemoryStick,
  Monitor,
  MonitorPlay,
  MoveVertical,
  PackageCheck,
  Pencil,
  Scale,
  ScanLine,
  Search,
  Server,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Sun,
  TrendingUp,
  Trash2,
  Usb,
  Users,
  Wifi,
  Wrench,
  type LucideIcon
} from "lucide-react";
import {
  catalogueCategories,
  intendedUseFilters,
  type CatalogueProduct,
  type CatalogueCategory,
  xrCataloguePdf,
  xrCatalogueProducts,
  xrLabServices,
  xrLabSolutionCompositions,
  formatQuoteSummary
} from "@/content/xr-catalogue";

type QuoteItem = {
  productId: string;
  quantity: number;
};

const configuratorQuestions = [
  {
    key: "institution",
    label: "Institution type",
    options: ["TVET college", "School", "Training provider", "Enterprise academy"]
  },
  {
    key: "primaryUse",
    label: "Primary use",
    options: ["Immersive learning", "Lecturer content creation", "XR development", "Managed XR deployment"]
  },
  {
    key: "groupSize",
    label: "Expected learner group size",
    options: ["Small group", "Classroom cohort", "Multiple groups", "Institution-wide"]
  },
  {
    key: "display",
    label: "Preferred display environment",
    options: ["Interactive panel", "Projection", "Workstation-led", "Not sure yet"]
  },
  {
    key: "management",
    label: "Device management requirement",
    options: ["Basic setup", "Managed headset fleet", "Secure storage", "Full infrastructure review"]
  },
  {
    key: "support",
    label: "Implementation support required",
    options: ["Needs assessment", "Lecturer onboarding", "Commissioning support", "Ongoing utilisation review"]
  }
] as const;

function productPrice(product: CatalogueProduct) {
  if (product.pricingMode === "REQUEST_QUOTE") return "Price on Request";
  return product.displayedPrice ?? "Request Quote";
}

/** Capability tag -> glyph, so specifications can be shown as icons on the product stage. */
const SPEC_ICON_RULES: Array<[RegExp, LucideIcon]> = [
  [/wi-?fi/i, Wifi],
  [/usb/i, Usb],
  [/controller/i, Gamepad2],
  [/ssd|storage|\bgb\b|\btb\b/i, HardDrive],
  [/chip|cpu|processor|xr2|\bm[245]\b|intel|amd|snapdragon|class/i, Cpu],
  [/\bram\b|memory/i, MemoryStick],
  [/display|retina|screen|4k|uhd|1080|full hd|inch|\bsize\b/i, Monitor],
  [/camera|\bmp\b|prores/i, Camera],
  [/lidar|arkit|scanner/i, ScanLine],
  [/pencil|stylus/i, Pencil],
  [/tracking|touch/i, Hand],
  [/passthrough/i, Eye],
  [/port|charging|18w|power|runtime|battery|voltage/i, BatteryCharging],
  [/lock|secure|security|monitored/i, Lock],
  [/thermal|fan|cool/i, Fan],
  [/rack|server|42u|19-inch|network/i, Server],
  [/cable|high-speed/i, Cable],
  [/motorised|retractable/i, ChevronsDownUp],
  [/3d|stereo|optimised/i, Box],
  [/lumens|brightness/i, Sun],
  [/mount|ceiling/i, Wrench],
  [/hygien|clean|comfort/i, Sparkles],
  [/shared|5-person|collaborat|group|seating/i, Users],
  [/height|adjust/i, MoveVertical],
  [/android|education ready|cloud/i, Smartphone],
  [/management|centralis|fleet|scalable|institution/i, LayoutDashboard],
  [/insight|analytics|real-time|usage/i, BarChart3],
  [/sustainab|future|growth/i, TrendingUp],
  [/design|durable|build|stable|modern|surface|protection|visibilit|range/i, Shield],
  [/\b5 m\b|metre|meter/i, Scale]
];

function resolveSpecIcon(tag: string): LucideIcon {
  for (const [pattern, icon] of SPEC_ICON_RULES) {
    if (pattern.test(tag)) return icon;
  }
  return PackageCheck;
}

/** Compact label for the icon row: drops bracketed detail and long tails. */
function specIconLabel(tag: string) {
  const cleaned = tag.replace(/\(.*?\)/g, "").replace(/\s*\/\s*/g, " ").replace(/\s+/g, " ").trim();
  const words = cleaned.split(" ");
  let label = words.slice(0, 2).join(" ");
  if (label.length > 16) label = `${label.slice(0, 15).trimEnd()}\u2026`;
  return label;
}

function ProductCard({
  product,
  compared,
  onAddQuote,
  onToggleCompare
}: {
  product: CatalogueProduct;
  compared: boolean;
  onAddQuote: (product: CatalogueProduct) => void;
  onToggleCompare: (product: CatalogueProduct) => void;
}) {
  const specIcons = product.capabilityTags.slice(0, 3).map((tag) => ({
    tag,
    Icon: resolveSpecIcon(tag),
    label: specIconLabel(tag)
  }));

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.05rem] border border-white/[0.1] bg-white/[0.055] shadow-[0_20px_70px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-lime/45">
      <div className="relative aspect-[1.28] overflow-hidden bg-white">
        <Image
          alt={product.imageAlt}
          className="object-contain p-5 pb-[4.9rem] transition duration-500 ease-out group-hover:scale-[1.03]"
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
          src={product.image}
        />
        <span className="absolute right-3.5 top-3.5 rounded-full bg-lime px-3 py-1 text-xs font-black text-ink shadow-[0_8px_20px_rgba(0,0,0,0.14)]">
          {productPrice(product)}
        </span>
        {specIcons.length > 0 ? (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-5 border-t border-ink/[0.07] bg-white/92 px-4 py-3 backdrop-blur-sm">
            {specIcons.map(({ Icon, label, tag }) => (
              <span className="flex min-w-0 items-center gap-1.5 text-[0.7rem] font-semibold text-ink/55" key={tag}>
                <Icon aria-hidden="true" className="shrink-0 text-ink/70" size={15} strokeWidth={2.1} />
                <span className="truncate">{label}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-cyan">{product.category}</p>
        <h3 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-paper">{product.name}</h3>
        {product.model ? <p className="mt-1 text-sm font-semibold text-paper/60">{product.model}</p> : null}
        <p className="mt-3 text-sm leading-6 text-paper/[0.68]">{product.summary}</p>
        <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
          <Link className="inline-flex min-h-11 items-center justify-center rounded-full bg-white/[0.08] px-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition hover:bg-white/[0.13] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan" href={`/xr-catalogue/${product.slug}`}>
            View Details
          </Link>
          <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-cyan px-4 text-sm font-bold text-ink transition hover:bg-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan" type="button" onClick={() => onAddQuote(product)}>
            Add to Quote
          </button>
        </div>
        <button className="mt-2 inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-bold text-cyan transition hover:bg-cyan/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan" type="button" onClick={() => onToggleCompare(product)}>
          {compared ? "Remove from Compare" : "Compare"}
        </button>
      </div>
    </article>
  );
}

export function XrCatalogueExperience() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | CatalogueCategory>("All");
  const [pricing, setPricing] = useState<"ALL" | "FIXED" | "REQUEST_QUOTE">("ALL");
  const [useFilter, setUseFilter] = useState("All");
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const stored = window.sessionStorage.getItem("jef-xr-quote-list");
    if (stored) setQuoteItems(JSON.parse(stored) as QuoteItem[]);
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem("jef-xr-quote-list", JSON.stringify(quoteItems));
  }, [quoteItems]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return xrCatalogueProducts.filter((product) => {
      const matchesSearch = !term || [product.name, product.model, product.summary, product.productCode, product.category].filter(Boolean).join(" ").toLowerCase().includes(term);
      const matchesCategory = category === "All" || product.category === category;
      const matchesPricing = pricing === "ALL" || product.pricingMode === pricing;
      const matchesUse = useFilter === "All" || product.intendedUses.includes(useFilter);
      return matchesSearch && matchesCategory && matchesPricing && matchesUse;
    });
  }, [category, pricing, search, useFilter]);

  const quoteProducts = quoteItems
    .map((item) => {
      const product = xrCatalogueProducts.find((candidate) => candidate.id === item.productId);
      return product ? { product, quantity: item.quantity } : null;
    })
    .filter(Boolean) as Array<{ product: CatalogueProduct; quantity: number }>;

  const compareProducts = compareIds
    .map((id) => xrCatalogueProducts.find((product) => product.id === id))
    .filter(Boolean) as CatalogueProduct[];

  const selectedCategories = new Set(quoteProducts.map((item) => item.product.category));
  const quoteSummary = formatQuoteSummary(quoteProducts);
  const quoteHref = `mailto:admin@jengrac.tech?subject=${encodeURIComponent("XR Lab quotation request")}&body=${encodeURIComponent(`Please assist with an XR Lab quotation.\n\nSelected items:\n${quoteSummary || "No products selected yet."}\n\nConfiguration:\n${Object.entries(answers).map(([key, value]) => `${key}: ${value}`).join("\n") || "No configurator answers supplied yet."}`)}`;

  const addToQuote = (product: CatalogueProduct) => {
    setQuoteItems((items) => {
      const existing = items.find((item) => item.productId === product.id);
      if (existing) return items.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...items, { productId: product.id, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setQuoteItems((items) => items.map((item) => item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item));
  };

  const toggleCompare = (product: CatalogueProduct) => {
    setCompareIds((ids) => {
      if (ids.includes(product.id)) return ids.filter((id) => id !== product.id);
      const first = xrCatalogueProducts.find((candidate) => candidate.id === ids[0]);
      if (first && first.category !== product.category) return [product.id];
      if (ids.length >= 3) return [...ids.slice(1), product.id];
      return [...ids, product.id];
    });
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setPricing("ALL");
    setUseFilter("All");
  };

  return (
    <main className="bg-ink text-paper">
      <section className="relative isolate overflow-hidden px-4 pb-16 pt-32 md:px-8 md:pt-36">
        <div className="absolute inset-0 noise-field opacity-25" />
        <div className="absolute inset-x-0 top-0 h-[55rem] bg-[radial-gradient(circle_at_72%_16%,rgba(136,255,93,0.22),transparent_34%),radial-gradient(circle_at_18%_28%,rgba(84,220,255,0.17),transparent_33%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">XR Lab Infrastructure · Devices · Implementation</p>
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(3.2rem,7.6vw,7rem)] font-semibold leading-[0.84] tracking-[-0.065em]">
              Build an XR Lab that is ready to teach, create and scale.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-paper/[0.72] md:text-xl md:leading-9">
              JEF brings immersive-learning hardware, computing, interactive teaching equipment, charging, device management and implementation support into one practical XR Lab pathway.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="inline-flex min-h-12 items-center justify-center rounded-full bg-cyan px-6 text-sm font-bold text-ink transition hover:bg-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan" href="#catalogue">
                Explore the Catalogue
              </a>
              <a className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/[0.09] px-6 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition hover:bg-white/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan" href="#configurator">
                Configure an XR Lab
              </a>
              <a className="inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-bold text-lime transition hover:bg-lime/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime" href={xrCataloguePdf.href} download>
                <Download aria-hidden="true" size={16} />
                {xrCataloguePdf.label}
              </a>
            </div>
          </div>

          <div className="relative min-h-[500px] overflow-hidden rounded-[1.5rem] border border-white/[0.1] bg-white/[0.055] p-4 shadow-[0_34px_110px_rgba(0,0,0,0.38)]">
            <Image alt="JEF AR learning workshop with participants and projection-based simulation" className="rounded-[1.1rem] object-cover" fill priority sizes="(min-width: 1024px) 50vw, 100vw" src="/images/xr/jef-ar-learning-workshop-wide.webp" />
            <div className="absolute inset-4 rounded-[1.1rem] bg-[linear-gradient(180deg,rgba(5,8,13,0.04),rgba(5,8,13,0.72))]" />
            <div className="absolute bottom-8 left-8 right-8 grid gap-3 rounded-[1rem] border border-white/[0.16] bg-ink/72 p-5 backdrop-blur-xl md:grid-cols-3">
              {["Hardware", "Software", "Infrastructure"].map((item) => (
                <div key={item}>
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-cyan">{item}</p>
                  <p className="mt-2 text-sm leading-6 text-paper/70">Confirmed during consultation and site-readiness review.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-surface px-4 py-8 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-5">
          {[
            ["Immersive Learning", "VR/MR devices for structured practical learning."],
            ["AI-Ready Computing", "Workstations for learners, lecturers and creators."],
            ["Interactive Teaching", "Display and projection systems for facilitation."],
            ["Secure Device Management", "Charging, storage and fleet-management support."],
            ["Infrastructure and Support", "Power, readiness, commissioning and adoption support."]
          ].map(([title, body], index) => {
            const Icon = [MonitorPlay, Cpu, BookOpenCheck, ShieldCheck, PackageCheck][index];
            return (
              <article className="rounded-[1rem] border border-white/[0.08] bg-white/[0.055] p-4" key={title}>
                <Icon aria-hidden="true" className="text-lime" size={22} />
                <h2 className="mt-4 text-base font-semibold tracking-[-0.03em]">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-paper/62">{body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-4 py-16 md:px-8 md:py-20" id="catalogue">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Digital product catalogue</p>
              <h2 className="mt-4 max-w-3xl font-display text-[clamp(2.6rem,5.8vw,5.8rem)] font-semibold leading-[0.88] tracking-[-0.06em]">
                Explore products, compare fit and build a quote list.
              </h2>
            </div>
            <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/[0.08] px-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] md:hidden" type="button" onClick={() => setMobileFiltersOpen((value) => !value)}>
              <SlidersHorizontal aria-hidden="true" size={16} />
              Filters
            </button>
          </div>

          <div className={`mt-8 grid gap-4 rounded-[1.2rem] border border-white/[0.1] bg-white/[0.055] p-4 ${mobileFiltersOpen ? "block" : "hidden md:grid"} md:grid-cols-[1.1fr_repeat(4,auto)] md:items-end`}>
            <label className="grid gap-2 text-sm font-semibold text-paper">
              Search
              <span className="relative">
                <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-paper/40" size={16} />
                <input className="min-h-12 w-full rounded-full border border-white/[0.12] bg-ink/72 pl-10 pr-4 text-paper outline-none transition focus:border-cyan" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, codes or categories" />
              </span>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-paper">
              Category
              <select className="min-h-12 rounded-full border border-white/[0.12] bg-ink px-4 text-paper outline-none focus:border-cyan" value={category} onChange={(event) => setCategory(event.target.value as "All" | CatalogueCategory)}>
                <option>All</option>
                {catalogueCategories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-paper">
              Pricing
              <select className="min-h-12 rounded-full border border-white/[0.12] bg-ink px-4 text-paper outline-none focus:border-cyan" value={pricing} onChange={(event) => setPricing(event.target.value as "ALL" | "FIXED" | "REQUEST_QUOTE")}>
                <option value="ALL">All</option>
                <option value="FIXED">Displayed price</option>
                <option value="REQUEST_QUOTE">Price on Request</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-paper">
              Intended use
              <select className="min-h-12 rounded-full border border-white/[0.12] bg-ink px-4 text-paper outline-none focus:border-cyan" value={useFilter} onChange={(event) => setUseFilter(event.target.value)}>
                <option>All</option>
                {intendedUseFilters.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <button className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/[0.08] px-5 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition hover:bg-white/[0.14]" type="button" onClick={resetFilters}>
              Reset
            </button>
          </div>

          <p className="mt-5 text-sm text-paper/58" aria-live="polite">{filteredProducts.length} products shown. Product specifications, availability and quotations are confirmed during the enquiry process.</p>

          {filteredProducts.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard compared={compareIds.includes(product.id)} key={product.id} product={product} onAddQuote={addToQuote} onToggleCompare={toggleCompare} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[1rem] border border-dashed border-white/[0.18] p-8 text-center">
              <h3 className="text-2xl font-semibold tracking-[-0.04em]">No products match these filters.</h3>
              <p className="mt-3 text-paper/62">Clear the filters or search a broader product category.</p>
              <button className="mt-5 inline-flex min-h-11 items-center rounded-full bg-cyan px-5 text-sm font-bold text-ink" type="button" onClick={resetFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="bg-paper px-4 py-16 text-ink md:px-8 md:py-20" id="compare">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-canopy">Product comparison</p>
              <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.055em]">Compare compatible products.</h2>
              <p className="mt-5 leading-7 text-ink/68">Select up to three products in the same category. Choosing a product from another category starts a new comparison.</p>
            </div>
            <div className="overflow-x-auto rounded-[1rem] border border-ink/10 bg-white">
              {compareProducts.length ? (
                <table className="min-w-[720px] text-left text-sm">
                  <caption className="sr-only">Selected XR catalogue products comparison</caption>
                  <thead className="bg-ink text-paper">
                    <tr>
                      <th className="p-4">Attribute</th>
                      {compareProducts.map((product) => <th className="p-4" key={product.id}>{product.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {["model", "category", "price", "code", "uses"].map((row) => (
                      <tr className="border-t border-ink/10" key={row}>
                        <th className="p-4 capitalize text-ink/58">{row}</th>
                        {compareProducts.map((product) => (
                          <td className="p-4 text-ink/78" key={`${product.id}-${row}`}>
                            {row === "model" ? product.model ?? "Not specified" : row === "category" ? product.category : row === "price" ? productPrice(product) : row === "code" ? product.productCode ?? product.id : product.intendedUses.join(", ")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8">
                  <h3 className="text-2xl font-semibold tracking-[-0.04em]">No comparison selected.</h3>
                  <p className="mt-3 text-ink/62">Use the Compare action on a product card to build a side-by-side view.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8 md:py-20" id="quote-list">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Quote List</p>
            <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.055em]">Build a quotation enquiry, not a checkout.</h2>
            <p className="mt-5 leading-7 text-paper/68">The quote list stays in this browser session and can be sent to JEF as an enquiry. It does not create an order or payment request.</p>
          </div>
          <div className="rounded-[1.2rem] border border-white/[0.1] bg-white/[0.055] p-5">
            {quoteProducts.length ? (
              <div className="grid gap-3">
                {quoteProducts.map(({ product, quantity }) => (
                  <div className="grid gap-3 rounded-[0.9rem] bg-ink/62 p-4 md:grid-cols-[1fr_auto_auto] md:items-center" key={product.id}>
                    <div>
                      <p className="font-semibold">{product.name}{product.model ? ` - ${product.model}` : ""}</p>
                      <p className="mt-1 text-sm text-paper/54">{product.productCode} · {productPrice(product)}</p>
                    </div>
                    <label className="grid gap-1 text-sm font-semibold">
                      Quantity
                      <input aria-label={`Quantity for ${product.name}`} className="h-11 w-24 rounded-full border border-white/[0.12] bg-white/[0.08] px-4 text-paper" min={1} type="number" value={quantity} onChange={(event) => updateQuantity(product.id, Number(event.target.value))} />
                    </label>
                    <button className="grid size-11 place-items-center rounded-full bg-rose-300/12 text-rose-100 transition hover:bg-rose-300/20" aria-label={`Remove ${product.name} from quote list`} type="button" onClick={() => setQuoteItems((items) => items.filter((item) => item.productId !== product.id))}>
                      <Trash2 aria-hidden="true" size={17} />
                    </button>
                  </div>
                ))}
                <div className="mt-4 flex flex-wrap gap-3">
                  <a className="inline-flex min-h-12 items-center justify-center rounded-full bg-cyan px-6 text-sm font-bold text-ink transition hover:bg-lime" href={quoteHref}>
                    Request Quotation
                  </a>
                  <button className="inline-flex min-h-12 items-center rounded-full bg-white/[0.08] px-5 text-sm font-bold text-paper ring-1 ring-white/[0.12]" type="button" onClick={() => setQuoteItems([])}>
                    Clear Quote List
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-[0.9rem] border border-dashed border-white/[0.16] p-8">
                <h3 className="text-2xl font-semibold tracking-[-0.04em]">Your quote list is empty.</h3>
                <p className="mt-3 text-paper/62">Add products from the catalogue, then request a quotation or consultation.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-surface px-4 py-16 md:px-8 md:py-20" id="configurator">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Guided solution builder</p>
              <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.055em]">Configure an XR Lab direction.</h2>
              <p className="mt-5 leading-7 text-paper/68">Answer practical questions to generate a preliminary XR Lab configuration. JEF confirms the final design after institutional consultation and site-readiness review.</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/[0.1] bg-white/[0.055] p-5">
              <div className="grid gap-4 md:grid-cols-2">
                {configuratorQuestions.map((question, index) => (
                  <fieldset className="rounded-[0.9rem] bg-ink/58 p-4" key={question.key}>
                    <legend className="text-sm font-bold text-paper">{index + 1}. {question.label}</legend>
                    <div className="mt-3 grid gap-2">
                      {question.options.map((option) => (
                        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[0.75rem] px-3 text-sm text-paper/72 ring-1 ring-white/[0.08] transition hover:bg-white/[0.06]" key={option}>
                          <input checked={answers[question.key] === option} className="accent-lime" name={question.key} type="radio" value={option} onChange={() => setAnswers((current) => ({ ...current, [question.key]: option }))} />
                          {option}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
              <div className="mt-5 rounded-[0.9rem] border border-lime/25 bg-lime/10 p-5">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Preliminary XR Lab Configuration</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.045em]">Recommended categories</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(["XR and Spatial Computing", "Computing Workstations", "Interactive Teaching", "Power, Charging and Storage", "Device Management"] as CatalogueCategory[]).map((item) => (
                    <span className={`rounded-full px-3 py-1.5 text-sm font-bold ring-1 ${selectedCategories.has(item) ? "bg-cyan text-ink ring-cyan" : "bg-white/[0.08] text-paper ring-white/[0.12]"}`} key={item}>
                      {item}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-paper/68">Questions still requiring site assessment: room size, power, connectivity, storage security, support roles, training calendar and device-management governance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper px-4 py-16 text-ink md:px-8 md:py-20" id="solutions">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-canopy">Complete XR Lab Solutions</p>
              <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.055em]">Equipment only becomes a lab when the operating system works.</h2>
              <p className="mt-5 leading-7 text-ink/68">Effective XR adoption depends on curriculum purpose, lecturer capability, learner access, devices, computing capacity, charging, storage, governance and sustained utilisation.</p>
            </div>
            <div className="grid gap-4">
              {xrLabSolutionCompositions.map((solution) => (
                <article className="rounded-[1rem] border border-ink/10 bg-ink/[0.035] p-5" key={solution.name}>
                  <h3 className="text-2xl font-semibold tracking-[-0.04em]">{solution.name}</h3>
                  <p className="mt-3 leading-7 text-ink/68">{solution.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {solution.includes.map((item) => <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-ink/70 ring-1 ring-ink/10" key={item}>{item}</span>)}
                  </div>
                  <p className="mt-4 text-sm font-semibold text-canopy">Final configuration and pricing depend on institutional requirements, site readiness and selected equipment.</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8 md:py-20" id="services">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">XR Lab Services</p>
          <h2 className="mt-4 max-w-4xl font-display text-[clamp(2.5rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.055em]">Assess, design, equip, configure, enable, support and optimise.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {xrLabServices.map(([stage, title, body]) => (
              <article className="rounded-[1rem] border border-white/[0.1] bg-white/[0.055] p-5" key={stage}>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">{stage}</p>
                <h3 className="mt-3 text-xl font-semibold tracking-[-0.04em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-paper/66">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper px-4 py-16 text-ink md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-[1.4rem] border border-ink/10 bg-ink p-6 text-paper md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Consultation</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.055em] md:text-5xl">Plan the right XR Lab for your institution.</h2>
            <p className="mt-4 max-w-3xl leading-7 text-paper/68">JEF can help align equipment, infrastructure, teaching requirements and implementation support into one practical XR Lab plan.</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <a className="inline-flex min-h-12 items-center rounded-full bg-cyan px-6 text-sm font-bold text-ink hover:bg-lime" href="#configurator">Configure Your Lab</a>
            <a className="inline-flex min-h-12 items-center rounded-full bg-white/[0.08] px-6 text-sm font-bold text-paper ring-1 ring-white/[0.14]" href={quoteHref}>Request a Quotation</a>
            <a className="inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-bold text-lime hover:bg-lime/10" href={xrCataloguePdf.href} download><Download aria-hidden="true" size={16} />Download Catalogue</a>
          </div>
        </div>
      </section>
    </main>
  );
}
