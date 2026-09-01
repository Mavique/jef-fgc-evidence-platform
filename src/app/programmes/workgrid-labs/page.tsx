import type { Metadata } from "next";
import { WorkgridLabsExperience } from "@/components/workgrid-labs/WorkgridLabsExperience";

export const metadata: Metadata = {
  title: "WORKGRID LABS | Jengrac Education Foundation",
  description:
    "WORKGRID LABS is JEF's TVET-to-Work Transformation Grid, connecting occupational qualifications with professional capability, AI, missions, evidence and opportunity routing."
};

export default function WorkgridLabsPage() {
  return <WorkgridLabsExperience />;
}
