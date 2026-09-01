"use client";

import {
  EvidenceAndMap,
  Hero,
  InstitutionalClose,
  Mandate,
  Partnerships,
  ProgrammeEcosystem,
  SpatialStory,
  VisualClarity
} from "@/components/Sections";

export function PlatformOverviewExperience() {
  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <Hero />
      <VisualClarity />
      <Mandate />
      <ProgrammeEcosystem />
      <SpatialStory />
      <EvidenceAndMap />
      <Partnerships />
      <InstitutionalClose />
    </main>
  );
}
