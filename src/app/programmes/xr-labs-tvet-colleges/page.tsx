import type { Metadata } from "next";
import { TvetXrLabsExperience } from "@/components/xr-labs-tvet-colleges/TvetXrLabsExperience";

export const metadata: Metadata = {
  title: "XR Labs for TVET Colleges | Jengrac Education Foundation",
  description:
    "JEF XR Labs for TVET Colleges is a platform-neutral establishment and activation model for curriculum-aligned immersive occupational learning, lecturer capability and institutional sustainability."
};

export default function XrLabsTvetCollegesPage() {
  return <TvetXrLabsExperience />;
}
