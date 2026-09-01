import type { Metadata } from "next";
import { AiServicesExperience } from "@/components/ai-services/AiServicesExperience";

export const metadata: Metadata = {
  title: "AI Services | Jengrac Education Foundation",
  description:
    "JEF AI Services helps organisations move from AI experiments to responsible human-AI work systems through readiness, knowledge foundations, assistants, agents, automation, governance and measured value."
};

export default function AiServicesPage() {
  return <AiServicesExperience />;
}
