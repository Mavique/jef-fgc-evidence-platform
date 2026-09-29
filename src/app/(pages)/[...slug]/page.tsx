import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicRouteExperience } from "@/components/public-routes/PublicRouteExperience";
import { publicRoutes, publicRouteSlugs } from "@/content/public-routes";

export function generateStaticParams() {
  return publicRouteSlugs.map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const key = slug.join("/");
  const page = publicRoutes[key];

  if (!page) {
    return {};
  }

  return {
    title: `${page.title} | Jengrac Education Foundation`,
    description: page.intro,
    alternates: {
      canonical: `/${page.slug}`
    }
  };
}

export default async function PublicPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const key = slug.join("/");
  const page = publicRoutes[key];

  if (!page) {
    notFound();
  }

  return <PublicRouteExperience page={page} />;
}
