import type { Metadata } from "next";
import { PlatformOverviewExperience } from "@/components/home/PlatformOverviewExperience";

export const metadata: Metadata = {
  title: "JEF Platform Overview | Jengrac Education Foundation",
  description:
    "The preserved JEF platform overview covering AI, Extended Reality, spatial intelligence, programmes, partnerships and evidence-led impact."
};

export default function PlatformOverviewPage() {
  return <PlatformOverviewExperience />;
}
