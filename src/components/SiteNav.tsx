"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, ChevronDown, LayoutDashboard, LogOut, Menu, UserCircle, X } from "lucide-react";
import { motion } from "motion/react";
import type { FgcCurrentUserResult } from "@/lib/fgc/current-user";

type SolutionItem = {
  label: string;
  description: string;
  href: string;
};

type SolutionGroup = {
  group: string;
  items: SolutionItem[];
};

type NavigationItem = {
  label: string;
  href?: string;
  children?: SolutionGroup[];
};

const solutionGroups: SolutionGroup[] = [
  {
    group: "Immersive Education",
    items: [
      {
        label: "XR in Education",
        description: "Curriculum-led immersive learning for basic education.",
        href: "/programmes/xr-basic-education"
      },
      {
        label: "XR Labs for TVET Colleges",
        description: "Institutional immersive-learning laboratories and implementation systems.",
        href: "/programmes/xr-labs-tvet-colleges"
      },
      {
        label: "XR Catalogue",
        description: "XR Lab devices, infrastructure, quote list and solution configurator.",
        href: "/xr-catalogue"
      },
      {
        label: "VOCLE XR",
        description: "Learning-to-capability intelligence through immersive experience and evidence.",
        href: "/programmes/vocle-xr"
      }
    ]
  },
  {
    group: "Institutional Transformation",
    items: [
      {
        label: "Digital Transformation Hubs",
        description: "Place-based infrastructure for local capability, services and participation.",
        href: "/programmes/dxhub"
      },
      {
        label: "JEF AI Services",
        description: "Responsible AI strategy, knowledge systems, workflow intelligence and governance.",
        href: "/programmes/ai-services"
      },
      {
        label: "Workplace 4.0",
        description: "Human-centred work redesign, responsible AI adoption and measurable capability.",
        href: "/programmes/workplace-4"
      }
    ]
  },
  {
    group: "Workforce and Enterprise",
    items: [
      {
        label: "WORKGRID LABS",
        description: "TVET-to-work capability, missions, evidence and opportunity routing.",
        href: "/programmes/workgrid-labs"
      },
      {
        label: "Prolific Edge",
        description: "Enterprise capability development for leadership, digital readiness and operations.",
        href: "/programmes/prolific-edge"
      },
      {
        label: "WorxStream",
        description: "Capability-to-opportunity pathways for work, projects and continued development.",
        href: "/programmes/worxstream"
      }
    ]
  },
  {
    group: "Spatial Intelligence",
    items: [
      {
        label: "Spatial Enterprise",
        description: "Digital twins, spatial guidance and contextual workplace intelligence.",
        href: "/programmes/spatial-enterprise"
      },
      {
        label: "Spatial AI City",
        description: "Civic spatial intelligence for places, services, participation and public innovation.",
        href: "/programmes/spatial-ai-city"
      }
    ]
  },
  {
    group: "Digital Platforms",
    items: [
      {
        label: "iCampus",
        description: "Connected digital learning and progression pathways.",
        href: "/programmes/icampus"
      },
      {
        label: "FGC Evidence Platform",
        description: "Evidence validation and adoption intelligence for scoped FGC users.",
        href: "/programmes/merseta-fgc-ekm"
      }
    ]
  }
];

const primaryNavigation: NavigationItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Solutions", href: "/programmes", children: solutionGroups },
  { label: "Contact", href: "/contact" }
];

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getProductionWorkspaceHref(access: FgcCurrentUserResult | null) {
  if (!access?.ok) return null;
  return access.access.expectedPortal || "/fgc-ekm/home";
}

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const solutionsId = useId();
  const fgcMenuId = useId();
  const mobileMenuId = useId();
  const [solid, setSolid] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [fgcOpen, setFgcOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(true);
  const [productionAccess, setProductionAccess] = useState<FgcCurrentUserResult | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const solutionsButtonRef = useRef<HTMLButtonElement | null>(null);
  const solutionsPanelRef = useRef<HTMLDivElement | null>(null);
  const fgcButtonRef = useRef<HTMLButtonElement | null>(null);
  const fgcPanelRef = useRef<HTMLDivElement | null>(null);
  const mobileButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);
  const hoverOpenTimer = useRef<number | null>(null);
  const hoverCloseTimer = useRef<number | null>(null);

  const solutionsActive = pathname.startsWith("/programmes") || pathname === "/platform-overview" || pathname.startsWith("/xr-catalogue");
  const productionWorkspaceHref = getProductionWorkspaceHref(productionAccess);
  const workspaceHref = productionWorkspaceHref ?? "/fgc-ekm/sign-in";

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const readProductionSession = () => {
      fetch("/api/fgc/auth/me", { cache: "no-store" })
        .then(async (response) => {
          const payload = await response.json().catch(() => null) as FgcCurrentUserResult | null;
          setProductionAccess(response.ok ? payload : null);
        })
        .catch(() => setProductionAccess(null));
    };

    readProductionSession();
    window.addEventListener("focus", readProductionSession);
    return () => window.removeEventListener("focus", readProductionSession);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!headerRef.current?.contains(target)) {
        setSolutionsOpen(false);
        setFgcOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        if (solutionsOpen) {
          setSolutionsOpen(false);
          solutionsButtonRef.current?.focus();
        }
        if (fgcOpen) {
          setFgcOpen(false);
          fgcButtonRef.current?.focus();
        }
        if (mobileOpen) {
          setMobileOpen(false);
          mobileButtonRef.current?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [fgcOpen, mobileOpen, solutionsOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const panel = mobilePanelRef.current;
    const first = panel?.querySelector<HTMLElement>(focusableSelector);
    first?.focus();

    const trapFocus = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector)).filter((node) => node.offsetParent !== null);
      if (!focusable.length) return;
      const firstNode = focusable[0];
      const lastNode = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstNode) {
        event.preventDefault();
        lastNode.focus();
      } else if (!event.shiftKey && document.activeElement === lastNode) {
        event.preventDefault();
        firstNode.focus();
      }
    };

    document.addEventListener("keydown", trapFocus);
    return () => document.removeEventListener("keydown", trapFocus);
  }, [mobileOpen]);

  const clearHoverTimers = () => {
    if (hoverOpenTimer.current) window.clearTimeout(hoverOpenTimer.current);
    if (hoverCloseTimer.current) window.clearTimeout(hoverCloseTimer.current);
  };

  const openSolutionsWithIntent = () => {
    clearHoverTimers();
    hoverOpenTimer.current = window.setTimeout(() => {
      setSolutionsOpen(true);
      setFgcOpen(false);
    }, 140);
  };

  const closeSolutionsWithGrace = () => {
    clearHoverTimers();
    hoverCloseTimer.current = window.setTimeout(() => setSolutionsOpen(false), 210);
  };

  const focusSolutionByIndex = (index: number) => {
    const links = Array.from(solutionsPanelRef.current?.querySelectorAll<HTMLAnchorElement>("[data-solution-link]") ?? []);
    links[index]?.focus();
  };

  const handleSolutionsKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
      event.preventDefault();
      setSolutionsOpen(true);
      setFgcOpen(false);
      window.requestAnimationFrame(() => focusSolutionByIndex(0));
    }
  };

  const handleSolutionPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const links = Array.from(solutionsPanelRef.current?.querySelectorAll<HTMLAnchorElement>("[data-solution-link]") ?? []);
    const index = links.findIndex((link) => link === document.activeElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusSolutionByIndex(index >= 0 ? (index + 1) % links.length : 0);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusSolutionByIndex(index > 0 ? index - 1 : links.length - 1);
    }
  };

  const toggleFgcMenu = () => {
    setFgcOpen((value) => !value);
    setSolutionsOpen(false);
  };

  const handleSignOut = async () => {
    await fetch("/api/fgc/auth/logout", { method: "POST" }).catch(() => null);
    setProductionAccess(null);
    setFgcOpen(false);
    setMobileOpen(false);
    router.push("/fgc-ekm/sign-in");
  };

  const productionSession = productionAccess?.ok ? productionAccess : null;
  const fgcSignedIn = Boolean(productionSession);
  const fgcDisplayName = productionSession?.user.name ?? "FGC user";
  const fgcDisplayRole = productionSession?.access.accessState.replaceAll("_", " ") ?? "Production session";
  const navSurface = solid || solutionsOpen || fgcOpen || mobileOpen
    ? "bg-ink/[0.91] shadow-[0_18px_70px_rgba(0,0,0,0.34)] ring-white/[0.14]"
    : "bg-ink/[0.68] ring-white/[0.1]";

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 md:pt-4" ref={headerRef}>
      <nav
        aria-label="Primary navigation"
        className={`relative z-50 mx-auto flex h-[74px] max-w-[1280px] items-center justify-between rounded-[1.2rem] px-3 text-paper ring-1 backdrop-blur-2xl transition duration-300 ease-fluid md:px-4 ${navSurface}`}
      >
        <Link
          href="/"
          className="flex min-h-11 shrink-0 items-center rounded-[0.8rem] px-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
          aria-label="Jengrac Education Foundation home"
          onClick={() => {
            setSolutionsOpen(false);
            setFgcOpen(false);
          }}
        >
          <span className="relative block h-10 w-[156px] sm:w-[190px]">
            <Image
              alt="Jengrac Education Foundation"
              className="object-contain object-left drop-shadow-[0_0_24px_rgba(84,220,255,0.12)]"
              fill
              priority
              sizes="(min-width: 640px) 190px, 156px"
              src="/images/brand/jef-logo.png"
            />
          </span>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {primaryNavigation.map((item) => {
            if (item.children) {
              return (
                <div
                  className="relative"
                  key={item.label}
                  onPointerEnter={openSolutionsWithIntent}
                  onPointerLeave={closeSolutionsWithGrace}
                >
                  <button
                    aria-controls={solutionsId}
                    aria-expanded={solutionsOpen}
                    aria-haspopup="menu"
                    className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan ${
                      solutionsActive
                        ? "text-paper after:block after:h-1 after:w-1 after:rounded-full after:bg-cyan"
                        : "text-paper/68 hover:bg-white/[0.07] hover:text-paper"
                    }`}
                    ref={solutionsButtonRef}
                    type="button"
                    onClick={() => {
                      setSolutionsOpen((value) => !value);
                      setFgcOpen(false);
                    }}
                    onKeyDown={handleSolutionsKeyDown}
                  >
                    {item.label}
                    <ChevronDown aria-hidden="true" className={`transition duration-200 ${solutionsOpen ? "rotate-180" : ""}`} size={15} />
                  </button>

                  {solutionsOpen ? (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      aria-label="Solutions menu"
                      className="absolute left-1/2 top-[calc(100%+0.8rem)] w-[1040px] max-w-[calc(100vw-3rem)] -translate-x-1/2 rounded-[1rem] border border-white/[0.12] bg-[#07131d] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.42)]"
                      id={solutionsId}
                      initial={false}
                      onKeyDown={handleSolutionPanelKeyDown}
                      ref={solutionsPanelRef}
                      role="menu"
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {solutionGroups.map((group) => (
                          <section key={group.group}>
                            <p className="text-xs font-semibold text-cyan">{group.group}</p>
                            <ul className="mt-3 grid gap-2">
                              {group.items.map((solution) => (
                                <li key={solution.href}>
                                  <Link
                                    className="group grid min-h-16 gap-1 rounded-[0.75rem] border-l-2 border-transparent px-3 py-3 transition duration-200 hover:border-cyan hover:bg-white/[0.06] focus-visible:border-cyan focus-visible:bg-white/[0.06] focus-visible:outline-none"
                                    data-solution-link
                                    href={solution.href}
                                    role="menuitem"
                                    onClick={() => setSolutionsOpen(false)}
                                  >
                                    <span className="flex items-center justify-between gap-4 text-[0.95rem] font-semibold text-paper">
                                      {solution.label}
                                      <ArrowRight aria-hidden="true" className="opacity-0 transition duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100" size={15} />
                                    </span>
                                    <span className="text-sm leading-5 text-paper/58">{solution.description}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </section>
                        ))}
                      </div>
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                        <Link className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/[0.08] px-4 text-sm font-bold text-paper ring-1 ring-white/[0.1] transition hover:bg-white/[0.12]" href="/programmes" onClick={() => setSolutionsOpen(false)}>
                          Explore all solutions
                          <ArrowRight aria-hidden="true" size={15} />
                        </Link>
                        <Link className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-bold text-cyan transition hover:bg-cyan/10" href="/contact" onClick={() => setSolutionsOpen(false)}>
                          Discuss a solution
                        </Link>
                      </div>
                    </motion.div>
                  ) : null}
                </div>
              );
            }

            const active = item.href ? isActivePath(pathname, item.href) : false;
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-3.5 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan ${
                  active
                    ? "text-paper after:ml-2 after:block after:h-1 after:w-1 after:rounded-full after:bg-cyan"
                    : "text-paper/68 hover:bg-white/[0.07] hover:text-paper"
                }`}
                href={item.href ?? "#"}
                key={item.label}
                onClick={() => {
                  setSolutionsOpen(false);
                  setFgcOpen(false);
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="relative hidden sm:block">
            <button
              aria-controls={fgcMenuId}
              aria-expanded={fgcOpen}
              aria-haspopup="menu"
              className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full bg-cyan px-4 text-sm font-bold text-ink transition duration-200 hover:bg-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan active:scale-[0.98]"
              ref={fgcButtonRef}
              type="button"
              onClick={toggleFgcMenu}
            >
              {fgcSignedIn ? <UserCircle aria-hidden="true" size={17} /> : <LayoutDashboard aria-hidden="true" size={17} />}
              {fgcSignedIn ? "My FGC Workspace" : "FGC Portal"}
              <ChevronDown aria-hidden="true" className={`transition duration-200 ${fgcOpen ? "rotate-180" : ""}`} size={15} />
            </button>

            {fgcOpen ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                aria-label="FGC Portal menu"
                className="absolute right-0 top-[calc(100%+0.75rem)] w-[320px] rounded-[1rem] border border-white/[0.12] bg-[#07131d] p-3 text-paper shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
                id={fgcMenuId}
                initial={false}
                ref={fgcPanelRef}
                role="menu"
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                {fgcSignedIn ? (
                  <>
                    <div className="rounded-[0.85rem] bg-white/[0.06] p-4">
                      <p className="text-sm font-semibold">{fgcDisplayName}</p>
                      <p className="mt-1 text-xs leading-5 text-paper/54">{fgcDisplayRole}</p>
                    </div>
                    <Link className="mt-2 grid min-h-14 rounded-[0.75rem] px-3 py-3 transition hover:bg-white/[0.07] focus-visible:bg-white/[0.07] focus-visible:outline-none" href={workspaceHref} role="menuitem" onClick={() => setFgcOpen(false)}>
                      <span className="font-semibold">Open dashboard</span>
                      <span className="text-sm text-paper/56">Continue to your scoped workspace.</span>
                    </Link>
                    <Link className="grid min-h-14 rounded-[0.75rem] px-3 py-3 transition hover:bg-white/[0.07] focus-visible:bg-white/[0.07] focus-visible:outline-none" href="/fgc-ekm/my-account" role="menuitem" onClick={() => setFgcOpen(false)}>
                      <span className="font-semibold">My account</span>
                      <span className="text-sm text-paper/56">Review profile and access state.</span>
                    </Link>
                    <button className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-[0.75rem] px-3 text-left text-sm font-bold text-rose-100 transition hover:bg-rose-300/10 focus-visible:bg-rose-300/10 focus-visible:outline-none" role="menuitem" type="button" onClick={handleSignOut}>
                      <LogOut aria-hidden="true" size={16} />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link className="grid min-h-14 rounded-[0.75rem] px-3 py-3 transition hover:bg-white/[0.07] focus-visible:bg-white/[0.07] focus-visible:outline-none" href="/fgc-ekm/sign-in" role="menuitem" onClick={() => setFgcOpen(false)}>
                      <span className="font-semibold">Sign in</span>
                      <span className="text-sm text-paper/56">Access your FGC workspace.</span>
                    </Link>
                    <Link className="grid min-h-14 rounded-[0.75rem] px-3 py-3 transition hover:bg-white/[0.07] focus-visible:bg-white/[0.07] focus-visible:outline-none" href="/fgc-ekm/sign-up" role="menuitem" onClick={() => setFgcOpen(false)}>
                      <span className="font-semibold">Create account</span>
                      <span className="text-sm text-paper/56">Register and request institutional access.</span>
                    </Link>
                  </>
                )}
              </motion.div>
            ) : null}
          </div>

          <button
            aria-controls={mobileMenuId}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            className="grid size-11 place-items-center rounded-[0.9rem] bg-white/[0.09] text-paper transition duration-200 hover:bg-white/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan lg:hidden"
            ref={mobileButtonRef}
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
          </button>
        </div>
      </nav>

      {mobileOpen ? (
        <motion.div
          animate={{ opacity: 1 }}
          aria-modal="true"
          className="fixed inset-0 z-40 overflow-y-auto bg-ink/96 px-4 pb-8 pt-28 text-paper backdrop-blur-2xl lg:hidden"
          id={mobileMenuId}
          initial={false}
          ref={mobilePanelRef}
          role="dialog"
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mx-auto grid max-w-2xl gap-2">
            {primaryNavigation.map((item) => {
              if (item.children) {
                return (
                  <div className="border-b border-white/10 py-2" key={item.label}>
                    <button
                      aria-expanded={mobileSolutionsOpen}
                      className="flex min-h-14 w-full items-center justify-between rounded-[0.85rem] px-3 text-left text-3xl font-semibold tracking-[-0.04em] transition hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan"
                      type="button"
                      onClick={() => setMobileSolutionsOpen((value) => !value)}
                    >
                      Solutions
                      <ChevronDown aria-hidden="true" className={`transition duration-200 ${mobileSolutionsOpen ? "rotate-180" : ""}`} size={22} />
                    </button>
                    {mobileSolutionsOpen ? (
                      <div className="mt-2 grid gap-4 px-1 pb-3">
                        {solutionGroups.map((group) => (
                          <section className="rounded-[0.9rem] bg-white/[0.045] p-3 ring-1 ring-white/[0.08]" key={group.group}>
                            <p className="px-2 text-xs font-semibold text-cyan">{group.group}</p>
                            <ul className="mt-2 grid gap-1">
                              {group.items.map((solution) => (
                                <li key={solution.href}>
                                  <Link className="grid min-h-14 rounded-[0.75rem] px-2 py-3 transition hover:bg-white/[0.07] focus-visible:bg-white/[0.07] focus-visible:outline-none" href={solution.href} onClick={() => setMobileOpen(false)}>
                                    <span className="font-semibold">{solution.label}</span>
                                    <span className="mt-1 text-sm leading-5 text-paper/56">{solution.description}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </section>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }

              const active = item.href ? isActivePath(pathname, item.href) : false;
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 items-center border-b border-white/10 px-3 text-3xl font-semibold tracking-[-0.04em] transition hover:text-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan ${
                    active ? "text-cyan" : "text-paper"
                  }`}
                  href={item.href ?? "#"}
                  key={item.label}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="mt-5 grid gap-2 border-t border-white/14 pt-5">
              {fgcSignedIn ? (
                <>
                  <Link className="grid min-h-14 rounded-[0.85rem] bg-cyan px-4 py-3 text-ink" href={workspaceHref} onClick={() => setMobileOpen(false)}>
                    <span className="font-bold">Open FGC dashboard</span>
                    <span className="text-sm text-ink/70">{fgcDisplayRole}</span>
                  </Link>
                  <button className="min-h-12 rounded-[0.85rem] bg-white/[0.08] px-4 text-left text-sm font-bold text-paper ring-1 ring-white/[0.12]" type="button" onClick={handleSignOut}>
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-cyan px-5 text-sm font-bold text-ink" href="/fgc-ekm/sign-in" onClick={() => setMobileOpen(false)}>
                    FGC Sign in
                  </Link>
                  <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/[0.08] px-5 text-sm font-bold text-paper ring-1 ring-white/[0.14]" href="/fgc-ekm/sign-up" onClick={() => setMobileOpen(false)}>
                    Create FGC account
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </header>
  );
}
