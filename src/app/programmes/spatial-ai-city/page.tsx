import type { Metadata } from "next";
import { SpatialAiCityExperience } from "@/components/spatial-ai-city/SpatialAiCityExperience";
import { spatialAiCityPositioning } from "@/content/spatial-ai-city";

export const metadata: Metadata = {
  title: `${spatialAiCityPositioning.name} | Jengrac Education Foundation`,
  description:
    "JEF's human-centred civic spatial intelligence framework for Living District layers, participation, digital twins, XR, data trust and regional innovation."
};

export default function SpatialAiCityPage() {
  return <SpatialAiCityExperience />;
}
