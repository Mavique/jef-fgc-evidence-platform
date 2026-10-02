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

export default async function PublicPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const key = slug.join("/");
  const page = publicRoutes[key];

  if (!page) {
    notFound();
  }

  const partnership = Array.isArray(query.partnership) ? query.partnership[0] : query.partnership;

  return <PublicRouteExperience page={page} partnership={partnership} />;
}
