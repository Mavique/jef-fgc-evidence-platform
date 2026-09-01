import type { Metadata } from "next";
import { ICampusExperience } from "@/components/icampus/ICampusExperience";

export const metadata: Metadata = {
  title: "JEF iCampus | Jengrac Education Foundation",
  description:
    "JEF iCampus is a connected digital and blended learning campus for digital, AI, professional capability, supported learning, practical application and governed progression."
};

export default function ICampusPage() {
  return <ICampusExperience />;
}
