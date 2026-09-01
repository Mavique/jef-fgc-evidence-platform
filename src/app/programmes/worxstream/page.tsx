import type { Metadata } from "next";
import { WorxStreamExperience } from "@/components/worxstream/WorxStreamExperience";
import { worxStreamPositioning } from "@/content/worxstream";

export const metadata: Metadata = {
  title: `${worxStreamPositioning.name} | Jengrac Education Foundation`,
  description:
    "JEF's governed capability-to-opportunity orchestration system for consent-based matching, authorised evidence exchange and continued development."
};

export default function WorxStreamPage() {
  return <WorxStreamExperience />;
}
