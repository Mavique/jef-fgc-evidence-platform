import type { Metadata } from "next";
import { WorkplaceExperience } from "@/components/workplace-4/WorkplaceExperience";
import { workplacePositioning } from "@/content/workplace-4";

export const metadata: Metadata = {
  title: `${workplacePositioning.name} | Jengrac Education Foundation`,
  description:
    "JEF's human-centred workforce and organisational transformation framework for Smart Workers, redesigned workflows, responsible AI, safeguards and measurable improvement."
};

export default function Workplace4Page() {
  return <WorkplaceExperience />;
}
