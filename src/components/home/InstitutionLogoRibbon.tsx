"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { institutionLogos, type InstitutionLogo } from "@/content/institution-logos";

const storageKey = "jef-institution-logo-ribbon-paused";

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function LogoImage({ decorative = false, logo }: { decorative?: boolean; logo: InstitutionLogo }) {
  return (
    <li className="institution-logo-ribbon__item">
      <Image
        alt={decorative ? "" : logo.name}
        aria-hidden={decorative ? "true" : undefined}
        className="institution-logo-ribbon__image"
        height={logo.height}
        loading="eager"
        src={logo.src}
        unoptimized
        width={logo.width}
      />
    </li>
  );
}

function LogoLane({ direction, logos }: { direction: "left" | "right"; logos: readonly InstitutionLogo[] }) {
  return (
    <div className="institution-logo-ribbon__lane" data-direction={direction}>
      <div className="institution-logo-ribbon__track-set">
        <ul className="institution-logo-ribbon__track" data-logo-copy="canonical">
          {logos.map((logo) => (
            <LogoImage key={logo.slug} logo={logo} />
          ))}
        </ul>
        <ul aria-hidden="true" className="institution-logo-ribbon__track" data-logo-copy="duplicate">
          {logos.map((logo) => (
            <LogoImage decorative key={`${logo.slug}-duplicate`} logo={logo} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export function InstitutionLogoRibbon() {
  const reducedMotion = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const lanes = useMemo(() => {
    const midpoint = Math.ceil(institutionLogos.length / 2);

    return [institutionLogos.slice(0, midpoint), institutionLogos.slice(midpoint)];
  }, []);
  const effectivePaused = reducedMotion || paused || focusPaused;

  useEffect(() => {
    setPaused(sessionStorage.getItem(storageKey) === "true");
  }, []);

  function togglePaused() {
    setPaused((current) => {
      const next = !current;
      sessionStorage.setItem(storageKey, String(next));
      return next;
    });
  }

  return (
    <div
      aria-label="Institution logo ribbon"
      className="institution-logo-ribbon"
      data-paused={effectivePaused ? "true" : "false"}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocusPaused(false);
        }
      }}
      onFocusCapture={() => setFocusPaused(true)}
    >
      <button
        aria-label={paused ? "Resume institution logo ribbon" : "Pause institution logo ribbon"}
        aria-pressed={paused}
        className="institution-logo-ribbon__control"
        onClick={togglePaused}
        type="button"
      >
        {paused ? <Play aria-hidden="true" size={18} /> : <Pause aria-hidden="true" size={18} />}
      </button>
      <div className="institution-logo-ribbon__viewport">
        <LogoLane direction="left" logos={lanes[0]} />
        <LogoLane direction="right" logos={lanes[1]} />
      </div>
    </div>
  );
}
