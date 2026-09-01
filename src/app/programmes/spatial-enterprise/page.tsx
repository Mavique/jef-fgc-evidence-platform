import type { Metadata } from "next";
import { SpatialEnterpriseExperience } from "@/components/spatial-enterprise/SpatialEnterpriseExperience";
import { spatialEnterprisePositioning } from "@/content/spatial-enterprise";

export const metadata: Metadata = {
  title: `${spatialEnterprisePositioning.portfolioName} | Jengrac Education Foundation`,
  description:
    "JEF's Spatial Enterprise Solutions portfolio for contextual workplace intelligence, digital twins, spatial guidance, immersive learning and human-centred operational support."
};

export default function SpatialEnterprisePage() {
  return <SpatialEnterpriseExperience />;
}
