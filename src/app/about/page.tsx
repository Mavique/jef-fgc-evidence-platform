import type { Metadata } from "next";
import { AboutExperience } from "@/components/about/AboutExperience";

export const metadata: Metadata = {
  title: "About Us | Jengrac Education Foundation",
  description:
    "About JEF, a technology company building AI, Extended Reality and Spatial AI systems with education, training and skills development at the centre."
};

export default function AboutPage() {
  return <AboutExperience />;
}
