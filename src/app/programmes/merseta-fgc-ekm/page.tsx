import type { Metadata } from "next";
import { FgcGateway } from "@/components/merseta-fgc/FgcGateway";

export const metadata: Metadata = {
  title: "merSETA FGC for EKM | Jengrac Education Foundation",
  description:
    "A frontend-first evidence validation and adoption intelligence platform for answering merSETA FGC learner-use and lecturer-capability questions with traceable evidence."
};

export default function MersetaFgcGatewayPage() {
  return <FgcGateway />;
}
