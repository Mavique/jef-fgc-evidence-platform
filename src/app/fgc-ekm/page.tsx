import type { Metadata } from "next";
import { FgcEkmApp } from "@/components/merseta-fgc/FgcEkmApp";

export const metadata: Metadata = {
  title: "FGC for EKM App | Jengrac Education Foundation",
  description:
    "In-site evidence observatory for merSETA FGC learner utilisation, lecturer independence, evidence quality, corrective actions and reporting decisions."
};

export default function FgcEkmPage() {
  return <FgcEkmApp />;
}
