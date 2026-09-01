import type { Metadata } from "next";
import { GigAcceleratorExperience } from "@/components/gig-economy-accelerator/GigAcceleratorExperience";
import { gigAcceleratorPositioning } from "@/content/gig-economy-accelerator";

export const metadata: Metadata = {
  title: `${gigAcceleratorPositioning.name} | Jengrac Education Foundation`,
  description:
    "JEF's protected pathway for converting verified capability into scoped services, fair contracts, professional delivery, verified payment and resilient independent work."
};

export default function GigEconomyAcceleratorPage() {
  return <GigAcceleratorExperience />;
}
