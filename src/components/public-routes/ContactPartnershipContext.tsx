"use client";

import { useEffect, useMemo, useState } from "react";
import {
  defaultPartnershipPathwayId,
  findPartnershipPathway,
  isPartnershipPathwayId,
  partnershipPathways,
  type PartnershipPathwayId
} from "@/content/partnership-pathways";

type ContactPartnershipContextProps = {
  initialPartnership?: string;
};

function resolvePartnership(value: unknown): PartnershipPathwayId {
  return isPartnershipPathwayId(value) ? value : defaultPartnershipPathwayId;
}

export function ContactPartnershipContext({ initialPartnership }: ContactPartnershipContextProps) {
  const [selectedId, setSelectedId] = useState<PartnershipPathwayId>(() => resolvePartnership(initialPartnership));
  const selected = findPartnershipPathway(selectedId) ?? partnershipPathways[0];
  const invalidInitial = Boolean(initialPartnership && !isPartnershipPathwayId(initialPartnership));

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedId(resolvePartnership(params.get("partnership")));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const mailtoHref = useMemo(() => {
    const subject = selected.contactSubject;
    const body = [
      `Partnership pathway: ${selected.audience}`,
      "",
      "Please share your organisation, operating need, audience and timing. Do not include confidential learner, patient or platform information in this first message."
    ].join("\n");

    return `mailto:admin@jengrac.tech?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [selected]);

  function updateSelection(value: string) {
    if (!isPartnershipPathwayId(value)) return;
    setSelectedId(value);
    const url = new URL(window.location.href);
    url.searchParams.set("partnership", value);
    window.history.pushState(null, "", url);
  }

  return (
    <section className="bg-surface px-4 py-16 md:px-8 md:py-20" id="contact-partnership-context">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-[1.35rem] border border-white/[0.1] bg-white/[0.055] p-6 md:p-8 lg:grid-cols-[0.78fr_1.22fr]">
        <div>
          <h2 className="font-display text-[clamp(2.4rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-paper">
            Route your enquiry
          </h2>
          <p className="mt-5 max-w-xl leading-7 text-paper/68">
            Select the partnership context so your first message is framed around the right institutional need.
          </p>
          {invalidInitial ? (
            <p className="mt-4 rounded-[0.9rem] border border-amber/35 bg-amber/12 p-4 text-sm font-semibold leading-6 text-amber" role="status">
              The supplied partnership category is not recognised. The general institutional pathway is selected.
            </p>
          ) : null}
        </div>
        <div className="grid gap-5">
          <label className="grid gap-2 font-semibold text-paper" htmlFor="partnership-context">
            Enquiry type
            <select
              className="min-h-12 rounded-[0.85rem] border border-white/[0.16] bg-ink px-4 text-base text-paper outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan"
              id="partnership-context"
              onChange={(event) => updateSelection(event.target.value)}
              value={selectedId}
            >
              {partnershipPathways.map((pathway) => (
                <option key={pathway.id} value={pathway.id}>
                  {pathway.audience}
                </option>
              ))}
            </select>
          </label>
          <article className="rounded-[1rem] bg-ink/58 p-5 ring-1 ring-white/[0.1]">
            <p className="text-sm font-bold text-cyan">{selected.contactSubject}</p>
            <p className="mt-3 text-sm leading-6 text-paper/68">{selected.summary}</p>
          </article>
          <a
            className="inline-flex min-h-12 w-fit items-center justify-center rounded-full bg-cyan px-5 text-sm font-bold text-ink transition hover:bg-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
            href={mailtoHref}
          >
            Email admin@jengrac.tech
          </a>
          <p className="text-xs leading-5 text-paper/50">
            This public contact route opens your email client. It does not send a server-side form submission.
          </p>
        </div>
      </div>
    </section>
  );
}
