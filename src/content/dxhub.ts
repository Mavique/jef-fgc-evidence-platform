export type ContentStatus =
  | "confirmed"
  | "proposed"
  | "pathway_model"
  | "target"
  | "in_development"
  | "operational"
  | "completed"
  | "verification_required";

export const dxhubPositioning = {
  title: "Digital Transformation Hubs",
  short: "Local capability. Connected opportunity. Intelligent transformation.",
  description:
    "JEF DxHub connects people, institutions, enterprises and emerging technology to turn digital access into practical capability, applied innovation and economic pathways.",
  status: "proposed" satisfies ContentStatus,
  campaign: "A local doorway into the intelligent economy."
};

export const fragmentedNodes = [
  ["Training", "Certificates without progression"],
  ["Municipality", "Systems without internal capability"],
  ["Enterprise", "Tools without implementation support"],
  ["Youth", "Skills without portfolios or work exposure"],
  ["Technology", "Access without local application"],
  ["Funder", "Investment without accountable pathways"]
];

export const networkNodes = [
  {
    id: "emfuleni",
    name: "Emfuleni DxHub",
    area: "Emfuleni municipality-level service area",
    status: "proposed" as ContentStatus,
    role: "Local access, digital inclusion, youth pathways and enterprise digitisation support.",
    focus: "Digital access, AI productivity, workplace readiness and SMME adoption.",
    groups: "Youth, job seekers, educators, SMMEs, workers and public-service teams."
  },
  {
    id: "lesedi",
    name: "Lesedi DxHub",
    area: "Lesedi municipality-level service area",
    status: "proposed" as ContentStatus,
    role: "Community-connected capability building and practical technology adoption.",
    focus: "Digital literacy, coding foundations, IoT concepts and local innovation challenges.",
    groups: "Learners, educators, entrepreneurs, community members and local institutions."
  },
  {
    id: "midvaal",
    name: "Midvaal DxHub",
    area: "Midvaal municipality-level service area",
    status: "proposed" as ContentStatus,
    role: "Enterprise-linked skills, workforce transition and applied technology experimentation.",
    focus: "Smart Worker capability, automation, AI-supported operations and portfolio projects.",
    groups: "Workers, employers, SMMEs, young people and training partners."
  },
  {
    id: "sedibeng",
    name: "Sedibeng District DxHub",
    area: "District coordination node",
    status: "proposed" as ContentStatus,
    role: "Network coordination, shared intelligence, specialist capacity and partnership visibility.",
    focus: "Regional data, programme orchestration, partner briefs and cross-node learning.",
    groups: "Municipal partners, funders, institutions, employers and hub delivery teams."
  }
];

export const transformationLoop = [
  {
    title: "Listen and diagnose",
    happens: "Identify community, workforce, municipal, institutional and enterprise needs.",
    outputs: "Needs map, maturity profile, opportunity barriers and priority local challenges.",
    evidence: "Baseline records and signed-off problem statements.",
    status: "in_development" as ContentStatus
  },
  {
    title: "Orient and personalise",
    happens: "Route people and organisations according to need, readiness, ambition and sector.",
    outputs: "Pathway recommendation, referral plan and participant profile.",
    evidence: "Assessment data and pathway consent.",
    status: "in_development" as ContentStatus
  },
  {
    title: "Build capability",
    happens: "Develop digital, AI, XR, data, cyber, automation and workplace capability.",
    outputs: "Learning artefacts, assessments, demonstrations and guided practice.",
    evidence: "Completion, competency and portfolio evidence.",
    status: "target" as ContentStatus
  },
  {
    title: "Apply and prototype",
    happens: "Turn learning into workflows, XR experiences, AI assistants, prototypes and service improvements.",
    outputs: "Working prototype, digital asset, process map, portfolio or implementation plan.",
    evidence: "Reviewed project outputs and user feedback.",
    status: "pathway_model" as ContentStatus
  },
  {
    title: "Activate opportunity",
    happens: "Connect capability to work exposure, jobs, clients, projects, contracts and continued learning.",
    outputs: "Briefs, referrals, employer introductions and opportunity records.",
    evidence: "Placement, project or progression records when verified.",
    status: "target" as ContentStatus
  },
  {
    title: "Support adoption",
    happens: "Provide mentoring, technical assistance, troubleshooting and continuous improvement.",
    outputs: "Implementation support, change guidance and peer learning.",
    evidence: "Adoption logs and support outcomes.",
    status: "target" as ContentStatus
  },
  {
    title: "Measure and evolve",
    happens: "Track participation, capability growth, application, opportunity and system impact.",
    outputs: "Evidence ladder, reporting cadence and refinement priorities.",
    evidence: "Approved monitoring and evaluation records.",
    status: "in_development" as ContentStatus
  }
];

export const studios = [
  ["Digital Access and Inclusion", "Literacy, assisted access, online safety, digital identity and e-services."],
  ["AI and Intelligent Productivity", "Responsible AI, research, communication, workflow improvement and agents."],
  ["XR and Spatial Computing", "Immersive learning, Spatial AI, simulations, 3D content and digital twins."],
  ["Coding, Robotics and IoT", "Software foundations, connected devices, automation concepts and prototyping."],
  ["Data, Cybersecurity and Trust", "Data literacy, dashboards, privacy, cyber hygiene and decision support."],
  ["Smart Worker and Workplace 4.0", "Collaboration, productivity, knowledge work, process improvement and adaptability."],
  ["Enterprise Transformation", "SMME diagnostics, digital operations, e-commerce, automation and innovation support."],
  ["Opportunity and Pathways", "Portfolio development, work-readiness, referrals, gig preparation and progression tracking."],
  ["Municipal Innovation", "E-services, analytics, workflow automation and responsible smart-city exploration."]
].map(([name, purpose]) => ({
  name,
  purpose,
  status: "proposed" as ContentStatus
}));

export const stakeholders = [
  {
    id: "young-person",
    label: "Young person",
    need: "Access, future skills, practical experience, credible portfolios and opportunity navigation.",
    response: "Assessment, personalised pathways, applied projects, mentoring, work-readiness and follow-up support.",
    cta: "Find a pathway"
  },
  {
    id: "educator",
    label: "Educator",
    need: "Practical exposure to AI, XR and immersive learning methods.",
    response: "XR/AI literacy, curriculum use cases, content creation, testing with learners and peer support.",
    cta: "Explore educator journeys"
  },
  {
    id: "entrepreneur",
    label: "Entrepreneur",
    need: "Modernisation support that improves operations, customers, data and productivity.",
    response: "Business diagnostics, AI adoption, workflow automation, prototypes and Prolific Edge pathways.",
    cta: "Build an enterprise route"
  },
  {
    id: "municipality",
    label: "Municipality",
    need: "Internal capability, service innovation, responsible modernisation and community inclusion.",
    response: "Use-case discovery, prototypes, local innovation challenges and skilled digital catalysts.",
    cta: "Plan a public-service use case"
  },
  {
    id: "funder",
    label: "Funder",
    need: "Investable interventions, accountable implementation and measurable local outcomes.",
    response: "Defined pathways, transparent outcome architecture and funding options by cohort, studio or challenge.",
    cta: "Shape an investment pathway"
  }
];

export const journeys = [
  {
    title: "Young person to digital opportunity",
    steps: ["Discover", "Assess", "Choose pathway", "Learn", "Apply skills", "Build portfolio", "Complete brief", "Connect to opportunity"]
  },
  {
    title: "SMME to intelligent enterprise",
    steps: ["Diagnose", "Identify friction", "Prioritise", "Build capability", "Implement tools", "Measure value", "Continue support"]
  },
  {
    title: "Municipal challenge to improved service",
    steps: ["Define challenge", "Understand users", "Gather evidence", "Co-design", "Prototype", "Train users", "Evaluate", "Scale where justified"]
  },
  {
    title: "Educator to immersive learning creator",
    steps: ["Orient", "Build XR/AI literacy", "Explore curriculum", "Create content", "Test", "Improve", "Publish portfolio"]
  },
  {
    title: "Worker to Smart Worker",
    steps: ["Assess workflow", "Identify repetitive work", "Learn tools", "Redesign workflow", "Implement responsibly", "Measure gains"]
  }
];

export const useCases = [
  {
    context: "Municipality",
    challenge: "Slow manual process",
    response: "Map the service, identify friction, prototype an improved workflow, train users and measure quality or time changes."
  },
  {
    context: "SMME",
    challenge: "Weak digital operations",
    response: "Diagnose business friction, choose practical tools, implement workflow changes and track customer or productivity gains."
  },
  {
    context: "Educator",
    challenge: "Difficult-to-demonstrate concept",
    response: "Create an XR or spatial learning demonstration, test it with learners and improve the content from feedback."
  },
  {
    context: "Job seeker",
    challenge: "No portfolio or pathway",
    response: "Assess readiness, build project evidence, complete a real brief and connect to work exposure or further specialisation."
  }
];

export const ecosystemConnections = [
  ["Learning", "JEF Ignite Institute, iCampus and VOCLE XR add structured capability development and immersive learning experiences."],
  ["Work", "WorxStream, Workgrid Labs and Workplace 4.0 connect capability to work exposure, practical briefs and workforce transition."],
  ["Enterprise", "Prolific Edge and Spatial AI Enterprise support SMME modernisation, adoption and context-aware workplace transformation."],
  ["Municipality", "Spatial AI City and AI Services help frame responsible public-service use cases, analytics and automation concepts."]
];

export const evidenceLevels = [
  ["Reach and inclusion", "People reached, participants enrolled, communities served and inclusion profiles."],
  ["Capability", "Competencies, pathway completion, portfolio evidence and pre/post growth."],
  ["Application", "Projects, prototypes, workflows, digital assets and enterprise improvements."],
  ["Opportunity and performance", "Work exposure, jobs, contracts, clients, continued learning and measurable process gains."],
  ["System and regional impact", "Sustainable local capability, collaboration, service innovation and repeatable pathways."]
];

export const partnershipOptions = [
  "Host or enable a hub",
  "Fund a cohort or studio",
  "Provide equipment or connectivity",
  "Sponsor an innovation challenge",
  "Provide work experience or jobs",
  "Contribute expert mentors",
  "Refer participants or enterprises",
  "Commission a transformation project"
];
