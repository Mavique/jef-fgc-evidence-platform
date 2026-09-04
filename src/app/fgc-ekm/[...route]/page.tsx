import type { Metadata } from "next";
import { FgcAccessExperience } from "@/components/merseta-fgc/FgcAccessExperience";
import { fgcRouteDefinitions } from "@/content/merseta-fgc";
import { getCurrentFgcUserFromCookies } from "@/lib/fgc/current-user";

export const metadata: Metadata = {
  title: "FGC Access | Jengrac Education Foundation",
  description:
    "Frontend-first authentication, affiliation, role-aware routing and access management screens for the merSETA FGC for EKM app."
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [
    ...fgcRouteDefinitions
      .filter((definition) => definition.route.startsWith("/fgc-ekm/"))
      .map((definition) => ({ route: definition.route.replace("/fgc-ekm/", "").split("/") }))
  ];
}

export default async function FgcAccessRoutePage({ params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  const initialAccess = await getCurrentFgcUserFromCookies().catch(() => null);
  return <FgcAccessExperience initialAccess={initialAccess} routePath={`/fgc-ekm/${route.join("/")}`} />;
}
