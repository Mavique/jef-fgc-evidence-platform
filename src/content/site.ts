import { z } from "zod";
import { xrMedia } from "@/content/xr-media";

export const programmeSchema = z.object({
  slug: z.string(),
  name: z.string(),
  status: z.enum(["Active", "Pilot", "In development", "Proposed", "Draft"]),
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
    reach: "MVP-stage immersive learning and capability pathway",
    purpose:
      "A lecturer-led cognitive immersive learning platform connecting curriculum, simulation, governed evidence and persistent capability development.",
    image: xrMedia.jefVocleXrExpoDemo
  },
  {
    slug: "ai-services",
    name: "JEF AI Services",
    status: "Proposed",
    audience: "Executives, operations leaders, workforce teams, SMMEs, public institutions, technology teams and governance leaders",
    reach: "Service architecture for approved packages, integrations and governance",
    purpose:
      "A responsible applied-AI transformation service that helps organisations diagnose real work, prepare trusted foundations, implement appropriate assistants, agents, automation and knowledge systems, and govern value safely.",
    image: xrMedia.spatialAiCollaborationRoom
  },
  {
    slug: "icampus",
    name: "JEF iCampus",
    status: "In development",
    audience: "Learners, workers, educators, municipalities, institutions and funders",
    reach: "Connected learning-campus architecture",
    purpose:
      "A connected digital and blended learning campus for digital, AI, professional capability, supported learning, practical application and governed progression.",
    image: xrMedia.jefDigitalClassroomSession
  },
  {
    slug: "worxstream",
    name: "WorxStream",
    status: "In development",
    audience: "Candidates, graduates, employers, institutions, funders and opportunity owners",
    reach: "Capability-to-opportunity operating architecture",
    purpose:
      "A governed capability-to-opportunity orchestration system connecting authorised evidence to work, WIL, projects, enterprise and continued development.",
    image: xrMedia.jefLargeTrainingRoom
  },
  {
    slug: "workplace-4",
    name: "Workplace 4.0",
    status: "In development",
    audience: "Workers, managers, executives, HR, public institutions, SMEs, labour stakeholders and partners",
    reach: "Human-centred work transformation methodology",
    purpose:
      "A human-centred workforce and organisational transformation framework for Smart Worker capability, redesigned work, responsible AI and measurable improvement.",
    image: xrMedia.industrialDataXrWorker
  },
  {
    slug: "spatial-enterprise",
    name: "Spatial Enterprise Solutions",
    status: "In development",
    audience: "Enterprise leaders, operations teams, technicians, L&D, safety, IT and development partners",
    reach: "Digital-twin and workplace guidance architecture",
    purpose:
      "A human-centred Spatial AI portfolio embedding knowledge, simulation, digital twins and contextual guidance into the physical workplace.",
    image: xrMedia.jefSpatialAiIndustrialTraining
  },
  {
    slug: "gig-economy-accelerator",
    name: "Gig-Economy Accelerator",
    status: "In development",
    audience: "Learners, graduates, freelancers, clients, institutions, funders and platform partners",
    reach: "Capability-to-income pathway for resilient independent work",
    purpose:
      "A protected capability-to-income pathway for service design, pricing, contracting, professional delivery, payment proof and resilient independent work.",
    image: xrMedia.jefSmallWorkshopDemo
  },
  {
    slug: "spatial-ai-city",
    name: "Spatial AI City",
    status: "In development",
    audience: "Municipalities, communities, institutions, creators, funders and civic technology partners",
    reach: "Civic spatial-intelligence framework for participation and services",
    purpose:
      "A human-centred civic spatial intelligence framework connecting places, services, infrastructure, community knowledge, digital twins, XR and participation.",
    image: xrMedia.jefSpatialAiCommercialWorkshop
  },
  {
    slug: "digital-transformation-hubs",
    name: "Digital Transformation Hubs",
    status: "In development",
    audience: "Municipalities, TVET colleges and local enterprise ecosystems",
    reach: "Regional implementation model for local capability systems",
    purpose:
      "Place-based infrastructure connecting youth capability, digital services and regional economic participation.",
    image: xrMedia.jefCollegeComputerLab
  },
  {
    slug: "prolific-edge",
    name: "Prolific Edge",
    status: "Active",
    audience: "SMMEs, enterprises and workforce teams",
    reach: "Enterprise capability development pathway",
    purpose:
      "Enterprise capability methodology across leadership, digital readiness, AI adoption and operational maturity.",
    image: xrMedia.jefIndustryBriefing
  },
  {
    slug: "workgrid-labs",
    name: "WORKGRID LABS",
    status: "Pilot",
    audience: "TVET students, graduates, colleges, employers and funders",
    reach: "Implementation model for TVET-to-work pathways",
    purpose:
      "The TVET-to-Work Transformation Grid connecting qualifications, professional capability, AI, missions, evidence and opportunity routing.",
    image: xrMedia.jefWorkshopAuditoriumWide
  },
  {
    slug: "merseta-fgc-ekm",
    name: "merSETA FGC for EKM",
    status: "In development",
    audience: "merSETA oversight, college evidence owners, lecturers, assessors, moderators, JEF administrators and EON analytics leads",
    reach: "Frontend-first evidence platform using supplied September 2026 workshop artefacts as source of truth",
    purpose:
      "An evidence validation and adoption intelligence platform that separates learner utilisation from lecturer independence, triangulates source quality and turns unresolved gaps into governed corrective action.",
    image: xrMedia.jefXrPresentationStage1
  },
  {
    slug: "xr-labs-tvet-colleges",
    name: "XR Labs for TVET Colleges",
    status: "Proposed",
    audience: "TVET leaders, lecturers, students, technical teams, industry partners and funders",
    reach: "XR lab establishment and activation methodology",
    purpose:
      "A platform-neutral XR Lab establishment and activation model that connects occupational teaching, simulation, workshops, student creation, operations and evidence.",
    image: xrMedia.jefXrTvetEducationWorkshop
  },
  {
    slug: "xr-basic-education",
    name: "XR in Basic Education",
    status: "Proposed",
    audience: "Schools, educators and district leadership",
    reach: "Curriculum-linked spatial learning support",
    purpose:
      "Spatial learning support for curriculum-linked concepts that benefit from simulation and embodied understanding.",
    image: xrMedia.xrClassroomSolarSystem
  },
  {
    slug: "jef-ignite-institute",
    name: "JEF Ignite Institute",
    status: "Active",
    audience: "Educators, facilitators and institutional leaders",
    reach: "Leadership and facilitator capability development",
    purpose:
      "Leadership and capability development for institutions preparing people for changing education and work systems.",
    image: xrMedia.jefXrPresentationStage2
  }
] satisfies z.infer<typeof programmeSchema>[];

export const impactRecords = [
  {
    title: "Evidence practice",
    value: "Source-led",
    classification: "Public standard",
    note: "Programme claims are shaped by records, approved materials and responsible publication choices."
  },
  {
    title: "Capability focus",
    value: "People first",
    classification: "Operating principle",
    note: "JEF separates technology access from the practical capability people can demonstrate."
  },
  {
    title: "Adoption lens",
    value: "Use in context",
    classification: "Evidence lens",
    note: "Programme records distinguish exposure, participation, workflow use and sustained adoption."
  },
  {
    title: "Public claims",
    value: "Careful",
    classification: "Governance habit",
    note: "Partner, outcome and delivery claims are published with appropriate context and approval."
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
  { name: "Gauteng", state: "Engagement pathway", x: 58, y: 43 },
  { name: "Free State", state: "Engagement pathway", x: 50, y: 53 },
  { name: "Lejweleputswa", state: "Regional capability interest", x: 47, y: 49 }
];
