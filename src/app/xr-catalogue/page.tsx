import type { Metadata } from "next";
import { XrCatalogueExperience } from "@/components/xr-catalogue/XrCatalogueExperience";

export const metadata: Metadata = {
  title: "XR Catalogue | Jengrac Education Foundation",
  description:
    "Explore JEF XR Lab devices, workstations, interactive teaching equipment, charging, infrastructure and implementation services for institutional XR learning environments.",
  alternates: {
    canonical: "/xr-catalogue"
  },
  openGraph: {
    title: "XR Catalogue | Jengrac Education Foundation",
    description:
      "A digital XR Lab catalogue with products, comparison, quote-list tools and a guided XR Lab configurator.",
    images: ["/images/xr/jef-ar-learning-workshop-wide.webp"]
  }
};

export default function XrCataloguePage() {
  return <XrCatalogueExperience />;
}
