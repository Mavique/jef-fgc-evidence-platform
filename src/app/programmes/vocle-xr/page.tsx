import type { Metadata } from "next";
import { VocleXrExperience } from "@/components/vocle-xr/VocleXrExperience";

export const metadata: Metadata = {
  title: "VOCLE XR | Jengrac Education Foundation",
  description:
    "VOCLE XR is JEF's lecturer-led cognitive immersive learning platform, connecting curriculum, XR, governed evidence and persistent capability development."
};

export default function VocleXrPage() {
  return <VocleXrExperience />;
}
