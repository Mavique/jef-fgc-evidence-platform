import { impactRecords, pathways, programmes } from "@/content/site";

type EvidenceProofPoint = {
  label: string;
  value: string;
  body: string;
  source: string;
};

const developmentStageProgrammes = programmes.filter((programme) => programme.status === "In development").length;
const proposalStageProgrammes = programmes.filter((programme) => programme.status === "Proposed").length;
const activeOrPilotProgrammes = programmes.filter((programme) => programme.status === "Active" || programme.status === "Pilot").length;
const fgcProgramme = programmes.find((programme) => programme.slug === "merseta-fgc-ekm");
const workgridProgramme = programmes.find((programme) => programme.slug === "workgrid-labs");
const evidencePractice = impactRecords.find((record) => record.title === "Evidence practice");

if (!fgcProgramme) throw new Error("Missing merSETA FGC programme evidence content");
if (!workgridProgramme) throw new Error("Missing WORKGRID LABS programme evidence content");
if (!evidencePractice) throw new Error("Missing evidence practice record");

export const evidenceOfTransformation = {
  eyebrow: "Evidence of Transformation",
  title: "Proof is built into the way transformation moves.",
  intro:
    "JEF connects institutional transformation, educator capability and learner opportunity through structured programmes, clear publication standards and evidence-aware delivery systems.",
  outcome:
    "The public story remains deliberately measured: current work, pilot work, development-stage architecture and proposal-stage pathways are separated before they are presented as outcomes.",
  cta: {
    label: "Explore our programmes",
    href: "/programmes"
  },
  sourceSummary: {
    programmeTotal: programmes.length,
    pathwayTotal: pathways.length,
    developmentStageProgrammes,
    proposalStageProgrammes,
    activeOrPilotProgrammes
  },
  proofPoints: [
    {
      label: "Structured programme ecosystem",
      value: `${programmes.length} public programme records`,
      body:
        "The structured content model spans AI, XR, spatial intelligence, enterprise capability, TVET-to-work pathways and governed evidence validation.",
      source: "src/content/site.ts programmes"
    },
    {
      label: "Operational reach is scoped",
      value: `${pathways.length} public pathway audiences`,
      body:
        "Government, SETAs, municipalities, TVET colleges, schools, businesses, funders and technology partners are handled as distinct entry points.",
      source: "src/content/site.ts pathways"
    },
    {
      label: "Evidence standard",
      value: evidencePractice.value,
      body: evidencePractice.note,
      source: "src/content/site.ts impactRecords"
    },
    {
      label: "Evidence platform work",
      value: fgcProgramme.name,
      body: fgcProgramme.purpose,
      source: "src/content/site.ts programmes[merseta-fgc-ekm]"
    },
    {
      label: "Workforce pathway work",
      value: workgridProgramme.name,
      body: workgridProgramme.purpose,
      source: "src/content/site.ts programmes[workgrid-labs]"
    }
  ] satisfies EvidenceProofPoint[]
};
