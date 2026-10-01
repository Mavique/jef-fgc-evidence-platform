"use client";

import Image from "next/image";
import { ExternalLink, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { xrMedia } from "@/content/xr-media";

const brandFilm = {
  embedUrl: "https://www.youtube-nocookie.com/embed/zG0xqtNSCP8?autoplay=1&rel=0",
  watchUrl: "https://youtu.be/zG0xqtNSCP8",
  title: "Jengrac Education Foundation brand film",
  poster: xrMedia.jefXrExpoHeadsetDemo
};

export function BrandFilmFeature() {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isPlaying) {
      playerRef.current?.focus({ preventScroll: true });
    }
  }, [isPlaying]);

  return (
    <section aria-labelledby="jef-brand-film-title" className="relative overflow-hidden bg-ink px-4 py-16 md:px-8 md:py-24">
      <div className="absolute inset-0 tech-grid opacity-25" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.72fr_1.08fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">The JEF story</p>
          <h2
            className="mt-5 max-w-3xl font-display text-[clamp(2.5rem,4.8vw,5.55rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-balance"
            id="jef-brand-film-title"
          >
            See Transformation in Motion
          </h2>
          <p className="mt-6 text-lg leading-8 text-paper/72 md:text-xl md:leading-9">
            Discover how Jengrac Education Foundation connects immersive learning, emerging technology and workforce pathways to help institutions and people participate in Africa&apos;s evolving digital economy.
          </p>
          <a
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-white/[0.08] px-5 text-sm font-bold text-paper ring-1 ring-white/[0.14] transition duration-300 ease-fluid hover:bg-white/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan motion-reduce:transition-none"
            href={brandFilm.watchUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Watch on YouTube
            <ExternalLink aria-hidden="true" size={16} />
          </a>
        </div>

        <div className="signal-frame overflow-hidden rounded-[1.45rem] border border-white/[0.14] bg-white/[0.055] p-2 shadow-[0_30px_110px_rgba(0,0,0,0.34)]">
          <div className="relative aspect-video overflow-hidden rounded-[1.1rem] bg-surface" data-testid="jef-brand-film-frame">
            {isPlaying ? (
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
                loading="lazy"
                ref={playerRef}
                src={brandFilm.embedUrl}
                title={brandFilm.title}
              />
            ) : (
              <>
                <Image
                  alt="JEF team demonstrating XR technology at an education and skills development exhibition"
                  className="object-cover opacity-90 saturate-[0.92]"
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  src={brandFilm.poster}
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,13,0.62),rgba(5,8,13,0.18)_48%,rgba(5,8,13,0.58)),linear-gradient(180deg,rgba(5,8,13,0.06),rgba(5,8,13,0.72))]" />
                <div className="absolute left-4 top-4 rounded-full bg-ink/72 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-lime ring-1 ring-white/15 backdrop-blur-xl md:left-6 md:top-6">
                  JEF Brand Film
                </div>
                <p className="absolute bottom-4 left-4 right-4 max-w-lg text-xs font-semibold leading-5 text-paper/82 md:bottom-7 md:left-7 md:right-24 md:text-base md:leading-6">
                  Education • Technology • Economic Opportunity
                </p>
                <button
                  aria-label="Play the Jengrac Education Foundation brand film"
                  className="group absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cyan text-ink shadow-[0_0_72px_rgba(84,220,255,0.42)] transition duration-300 ease-fluid hover:scale-105 hover:bg-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper active:scale-95 motion-reduce:transition-none md:size-24"
                  onClick={() => setIsPlaying(true)}
                  type="button"
                >
                  <Play aria-hidden="true" className="ml-1 fill-current" size={34} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
