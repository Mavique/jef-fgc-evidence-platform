import { publicRoutes } from "@/content/public-routes";
import { xrCataloguePdf } from "@/content/xr-catalogue";
import { xrMedia } from "@/content/xr-media";

export type HomeResourceType = "Catalogue" | "Framework";

export type HomeResource = {
  id: string;
  title: string;
  type: HomeResourceType;
  description: string;
  href: string;
  actionLabel: string;
  source: string;
  image: string;
  imageAlt: string;
  download?: boolean;
};

const productCatalogue = publicRoutes.documents.highlights[0];
const governanceRoute = publicRoutes["about/governance"];

export const knowledgeResourcesIntro = {
  eyebrow: "Knowledge and resources",
  title: "Ideas, tools and evidence for education transformation",
  body:
    "A focused shelf of approved public material for institutions exploring AI, XR, spatial intelligence and responsible technology adoption.",
  viewAll: {
    label: "View all resources",
    href: "/documents"
  }
};

export const featuredKnowledgeResource: HomeResource = {
  id: "jef-product-catalogue",
  title: productCatalogue.title,
  type: "Catalogue",
  description: productCatalogue.body,
  href: productCatalogue.href ?? xrCataloguePdf.href,
  actionLabel: "Download PDF",
  source: "src/content/public-routes.ts: publicRoutes.documents.highlights[0]",
  image: "/images/resources/jef-product-catalogue-preview.webp",
  imageAlt: "First-page preview of the JEF Product Catalogue PDF",
  download: true
};

export const supportingKnowledgeResources: HomeResource[] = [
  {
    id: "digital-xr-catalogue",
    title: "Digital XR Catalogue",
    type: "Catalogue",
    description:
      "Explore JEF XR Lab products, comparison tools and the guided XR Lab configurator built from the approved catalogue data.",
    href: "/xr-catalogue",
    actionLabel: "Explore catalogue",
    source: "src/content/xr-catalogue.ts: xrCatalogueProducts and xrCataloguePdf",
    image: xrMedia.jefArLearningWorkshopWide,
    imageAlt: "JEF AR learning workshop with tablet-based immersive learning materials"
  },
  {
    id: "responsible-technology-governance",
    title: "Responsible technology governance",
    type: "Framework",
    description: governanceRoute.intro,
    href: `/${governanceRoute.slug}`,
    actionLabel: "Read framework",
    source: "src/content/public-routes.ts: publicRoutes['about/governance']",
    image: governanceRoute.image,
    imageAlt: governanceRoute.imageAlt
  }
];

export const homepageKnowledgeResourceIds = [
  featuredKnowledgeResource.id,
  ...supportingKnowledgeResources.map((resource) => resource.id)
];
