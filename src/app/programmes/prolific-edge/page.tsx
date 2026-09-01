import type { Metadata } from "next";
import { ProlificEdgeExperience } from "@/components/prolific-edge/ProlificEdgeExperience";

export const metadata: Metadata = {
  title: "Prolific Edge | Jengrac Education Foundation",
  description:
    "Prolific Edge is JEF’s AI-powered, implementation-led enterprise transformation methodology for South African enterprises."
};

export default function ProlificEdgePage() {
  return <ProlificEdgeExperience />;
}
