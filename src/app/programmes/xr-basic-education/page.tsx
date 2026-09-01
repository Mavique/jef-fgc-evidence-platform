import type { Metadata } from "next";
import { XrBasicEducationExperience } from "@/components/xr-basic-education/XrBasicEducationExperience";

export const metadata: Metadata = {
  title: "XR in Basic Education | Jengrac Education Foundation",
  description:
    "JEF XR in Basic Education is a proposed Basic Education and BEEI capability framework for curriculum-linked immersive learning, teacher support and Education Assistant development."
};

export default function XrBasicEducationPage() {
  return <XrBasicEducationExperience />;
}
