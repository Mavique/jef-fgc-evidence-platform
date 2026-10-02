export type PartnershipPathwayId =
  | "tvet-education"
  | "government-municipalities"
  | "industry-employers"
  | "funders-strategic";

export type PartnershipPathway = {
  id: PartnershipPathwayId;
  audience: string;
  actionLabel: string;
  contactHref: string;
  summary: string;
  possibilities: string[];
  contactSubject: string;
};

export const partnershipPathways: PartnershipPathway[] = [
  {
    id: "tvet-education",
    audience: "TVET Colleges and Education Institutions",
    actionLabel: "Discuss institutional transformation",
    contactHref: "/contact?partnership=tvet-education",
    summary:
      "Work with JEF to connect digital transformation, XR lab activation, lecturer capability, curriculum integration and learning technology adoption into one implementation pathway.",
    possibilities: [
      "XR Lab establishment and activation",
      "Lecturer development and facilitation support",
      "Curriculum-linked immersive learning integration",
      "Adoption planning, governance and implementation support"
    ],
    contactSubject: "TVET and education institution partnership"
  },
  {
    id: "government-municipalities",
    audience: "Government and Municipalities",
    actionLabel: "Explore municipal collaboration",
    contactHref: "/contact?partnership=government-municipalities",
    summary:
      "Shape place-based digital transformation hubs, skills infrastructure and youth development pathways with implementation models that fit district and local realities.",
    possibilities: [
      "Digital Transformation Hub scoping",
      "Skills infrastructure and access planning",
      "Youth development and participation pathways",
      "District or municipal implementation support"
    ],
    contactSubject: "Government and municipality partnership"
  },
  {
    id: "industry-employers",
    audience: "Industry and Employers",
    actionLabel: "Build an industry pathway",
    contactHref: "/contact?partnership=industry-employers",
    summary:
      "Connect workplace integration, work-based learning, occupational relevance and technology-enabled workforce development to practical talent pathways.",
    possibilities: [
      "Workplace integration and occupational relevance",
      "Industry exit pathways from learning to work",
      "Work-based learning and capability evidence",
      "Technology-enabled workforce development"
    ],
    contactSubject: "Industry and employer partnership"
  },
  {
    id: "funders-strategic",
    audience: "Funders and Strategic Partners",
    actionLabel: "Start a strategic partnership conversation",
    contactHref: "/contact?partnership=funders-strategic",
    summary:
      "Co-develop programmes, technology enablement, research and outcome-oriented implementation partnerships without overstating delivery before evidence exists.",
    possibilities: [
      "Programme co-development",
      "Technology enablement and implementation partnerships",
      "Research and evidence design",
      "Scale planning with outcome-oriented investment"
    ],
    contactSubject: "Funder and strategic partner conversation"
  }
];

export const defaultPartnershipPathwayId: PartnershipPathwayId = "tvet-education";

export function isPartnershipPathwayId(value: unknown): value is PartnershipPathwayId {
  return typeof value === "string" && partnershipPathways.some((pathway) => pathway.id === value);
}

export function findPartnershipPathway(value: unknown) {
  return partnershipPathways.find((pathway) => pathway.id === value);
}
