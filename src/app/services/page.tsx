import type { Metadata } from "next";
import { ServicesExperience } from "@/components/services/ServicesExperience";

export const metadata: Metadata = {
  title: "Services | Jengrac Education Foundation",
  description:
    "Explore JEF Transformation Services for TVET colleges, private colleges, municipalities, healthcare institutions and enterprises."
};

export default function ServicesPage() {
  return <ServicesExperience />;
}
