import type { Metadata } from "next";
import { DxHubExperience } from "@/components/dxhub/DxHubExperience";

export const metadata: Metadata = {
  title: "DxHub | Jengrac Education Foundation",
  description:
    "JEF Digital Transformation Hubs are proposed place-based platforms connecting digital access, AI, XR, practical capability and local opportunity."
};

export default function DxHubPage() {
  return <DxHubExperience />;
}
