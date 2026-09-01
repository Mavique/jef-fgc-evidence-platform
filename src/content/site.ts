import { z } from "zod";
import { xrMedia } from "@/content/xr-media";

export const programmeSchema = z.object({
  slug: z.string(),
  name: z.string(),
  status: z.enum(["Active", "Pilot", "In development", "Proposed", "Placeholder"]),
  audience: z.string(),
  reach: z.string(),
  purpose: z.string(),
  image: z.string()
});

export const programmes = [
  {
    slug: "vocle-xr",
    name: "VOCLE XR",
    status: "In development",
    audience: "Learners, lecturers, institutions, employers and funders",
    reach: "MVP validation required",
    purpose:
      "A lecturer-led cognitive immersive learning platform connecting curriculum, simulation, governed evidence and persistent capability development.",
    image: xrMedia.xrMedicalHeartLearning
  },
  {
    slug: "ai-services",
    name: "JEF AI Services",
    status: "Proposed",
    audience: "Executives, operations leaders, workforce teams, SMMEs, public institutions, technology teams and governance leaders",
    reach: "Service architecture requiring approved packages, clients, integrations and outcomes",
    purpose:
      "A responsible applied-AI transformation service that helps organisations diagnose real work, prepare trusted foundations, implement appropriate assistants, agents, automation and knowledge systems, and govern value safely.",
    image: xrMedia.industrialDataXrWorker
  },
  {
    slug: "icampus",
    name: "JEF iCampus",
    status: "In development",
    audience: "Learners, workers, educators, municipalities, institutions and funders",
    reach: "Programme architecture requiring verification",
    purpose:
      "A connected digital and blended learning campus for digital, AI, professional capability, supported learning, practical application and governed progression.",
    image: xrMedia.jefLargeTrainingRoom
  },
  {
    slug: "worxstream",
    name: "WorxStream",
    status: "In development",
    audience: "Candidates, graduates, employers, institutions, funders and opportunity owners",
    reach: "Conceptual architecture requiring operational verification",
    purpose:
      "A governed capability-to-opportunity orchestration system connecting authorised evidence to work, WIL, projects, enterprise and continued development.",
    image: xrMedia.arManufacturingTablet
  },
  {
    slug: "workplace-4",
    name: "Workplace 4.0",
    status: "In development",
    audience: "Workers, managers, executives, HR, public institutions, SMEs, labour stakeholders and partners",
    reach: "Core methodology requiring verified deployments and outcomes",
    purpose:
      "A human-centred workforce and organisational transformation framework for Smart Worker capability, redesigned work, responsible AI and measurable improvement.",
    image: xrMedia.xrManufacturingDashboard
  },
  {
    slug: "spatial-enterprise",
    name: "Spatial Enterprise Solutions",
    status: "In development",
    audience: "Enterprise leaders, operations teams, technicians, L&D, safety, IT and development partners",
    reach: "Strategic architecture requiring verified deployments",
    purpose:
      "A human-centred Spatial AI portfolio embedding knowledge, simulation, digital twins and contextual guidance into the physical workplace.",
    image: xrMedia.xrManufacturingEngineOverlay
  },
  {
    slug: "gig-economy-accelerator",
    name: "Gig-Economy Accelerator",
    status: "In development",
    audience: "Learners, graduates, freelancers, clients, institutions, funders and platform partners",
    reach: "Strategic architecture requiring verified cohorts, projects and outcomes",
    purpose:
      "A protected capability-to-income pathway for service design, pricing, contracting, professional delivery, payment proof and resilient independent work.",
    image: xrMedia.jefSmallWorkshopDemo
  },
  {
    slug: "spatial-ai-city",
    name: "Spatial AI City",
    status: "In development",
    audience: "Municipalities, communities, institutions, creators, funders and civic technology partners",
    reach: "Strategic framework requiring verified mandate, data, pilots and outcomes",
    purpose:
      "A human-centred civic spatial intelligence framework connecting places, services, infrastructure, community knowledge, digital twins, XR and participation.",
    image: xrMedia.spatialAiCollaborationRoom
  },
  {
    slug: "digital-transformation-hubs",
    name: "Digital Transformation Hubs",
    status: "In development",
    audience: "Municipalities, TVET colleges and local enterprise ecosystems",
    reach: "Regional implementation details required",
    purpose:
      "Place-based infrastructure connecting youth capability, digital services and regional economic participation.",
    image: xrMedia.jefDigitalClassroomSession
  },
  {
    slug: "prolific-edge",
    name: "Prolific Edge",
    status: "Active",
    audience: "SMMEs, enterprises and workforce teams",
    reach: "Verified cohorts required",
    purpose:
      "Enterprise capability methodology across leadership, digital readiness, AI adoption and operational maturity.",
    image: xrMedia.jefIndustryBriefing
  },
  {
    slug: "workgrid-labs",
    name: "WORKGRID LABS",
    status: "Pilot",
    audience: "TVET students, graduates, colleges, employers and funders",
    reach: "Implementation details required",
    purpose:
      "The TVET-to-Work Transformation Grid connecting qualifications, professional capability, AI, missions, evidence and opportunity routing.",
    image: xrMedia.childrenRoboticsLearning
  },
  {
    slug: "merseta-fgc-ekm",
    name: "merSETA FGC for EKM",
    status: "In development",
    audience: "merSETA oversight, college evidence owners, lecturers, assessors, moderators, JEF administrators and EON analytics leads",
    reach: "Frontend-first evidence platform using supplied September 2026 workshop artefacts as source of truth",
    purpose:
      "An evidence validation and adoption intelligence platform that separates learner utilisation from lecturer independence, triangulates source quality and turns unresolved gaps into governed corrective action.",
    image: xrMedia.jefTransformingEducationBanner
  },
  {
    slug: "xr-labs-tvet-colleges",
    name: "XR Labs for TVET Colleges",
    status: "Proposed",
    audience: "TVET leaders, lecturers, students, technical teams, industry partners and funders",
    reach: "Methodology and implementation model requiring verified sites, assets and outcomes",
    purpose:
      "A platform-neutral XR Lab establishment and activation model that connects occupational teaching, simulation, workshops, student creation, operations and evidence.",
    image: xrMedia.jefCollegeComputerLab
  },
  {
    slug: "xr-basic-education",
    name: "XR in Basic Education",
    status: "Proposed",
    audience: "Schools, educators and district leadership",
    reach: "Approval and implementation details required",
    purpose:
      "Spatial learning support for curriculum-linked concepts that benefit from simulation and embodied understanding.",
    image: xrMedia.xrClassroomSolarSystem
  },
  {
    slug: "jef-ignite-institute",
    name: "JEF Ignite Institute",
    status: "Active",
    audience: "Educators, facilitators and institutional leaders",
    reach: "Verified delivery record required",
    purpose:
      "Leadership and capability development for institutions preparing people for changing education and work systems.",
    image: xrMedia.jefXrPresentationStage1
  }
] satisfies z.infer<typeof programmeSchema>[];

export const impactRecords = [
  {
    title: "Verified results",
    value: "Pending",
    classification: "Achieved",
    note: "Replace only after JEF supplies confirmed figures and source documentation."
  },
  {
    title: "Active delivery",
    value: "Pending",
    classification: "In progress",
    note: "Show current programmes separately from achieved outcomes."
  },
  {
    title: "Contracted targets",
    value: "Pending",
    classification: "Target",
    note: "Use exact contract language and dates once available."
  },
  {
    title: "Long-term ambitions",
    value: "Pending",
    classification: "Ambition",
    note: "Keep future-facing statements visibly distinct from evidence."
  }
];

export const pathways = [
  "Government",
  "SETAs",
  "Municipalities",
  "TVET colleges",
  "Schools",
  "Businesses",
  "Funders",
  "Technology partners"
];

export const regions = [
  { name: "Gauteng", state: "Activity to verify", x: 58, y: 43 },
  { name: "Free State", state: "Activity to verify", x: 50, y: 53 },
  { name: "Lejweleputswa", state: "Activity to verify", x: 47, y: 49 }
];
