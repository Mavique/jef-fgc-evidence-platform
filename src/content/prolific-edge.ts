export type ProlificStatus =
  | "core_methodology"
  | "implementation_option"
  | "evidence_model"
  | "proposal_specific"
  | "confirmed_cohort"
  | "target"
  | "verified_result"
  | "verification_required";

export const prolificPositioning = {
  name: "Prolific Edge™",
  headline: "Building Intelligent Enterprises for South Africa’s AI Economy.",
  description:
    "A practical enterprise transformation methodology combining diagnostics, personalised pathways, capability development, implementation, innovation and responsible intelligent technology.",
  campaign: "From business support to enterprise transformation.",
  status: "core_methodology" as ProlificStatus
};

export const supportVsTransformation = [
  ["Training programme", "Attendance, presentations, certificates and disconnected workshops."],
  ["Transformation methodology", "Diagnosis, prescription, implementation assets, workplace projects, evidence and continuous improvement."]
];

export const frictions = [
  {
    title: "Manual administration",
    system: "Operations, workforce capability, digital systems, data visibility and leadership discipline.",
    response: "Map recurring work, simplify process steps, introduce appropriate tools and review adoption evidence."
  },
  {
    title: "Slow quotations",
    system: "Customer value, financial discipline, job tracking, knowledge management and workflow clarity.",
    response: "Build quoting templates, job data, approval routines and customer communication assets."
  },
  {
    title: "Weak customer follow-up",
    system: "Customer-centred operations, digital engagement, staff routines and performance measurement.",
    response: "Define the customer journey, assign follow-up ownership and introduce simple relationship systems."
  },
  {
    title: "Disconnected systems",
    system: "Connected digital operations, data governance, team habits and implementation support.",
    response: "Create an information architecture, choose fit-for-purpose tools and train teams around usage."
  },
  {
    title: "Low innovation capacity",
    system: "Leadership, sector awareness, workforce learning, experimentation and customer insight.",
    response: "Run innovation sprints that create tested prototypes, evidence and a practical improvement portfolio."
  }
];

export const evolutionStages = [
  ["Enterprise Discovery™", "Understand the enterprise before prescribing solutions.", "Discovery report, evidence base and readiness signals."],
  ["Enterprise DNA Profile™", "Translate evidence into how the enterprise currently functions.", "Strengths, constraints, behaviours, systems and capability profile."],
  ["Intelligent Enterprise Index™", "Create a baseline for progress measurement, not a vanity score.", "Defined dimensions, baseline and interpretation notes."],
  ["Transformation Prescription™", "Identify priorities, sequencing, interventions, risks and expected evidence.", "Personalised prescription and implementation priorities."],
  ["Transformation Pathway™", "Convert prescription into studios, clinics, sprints and specialist support.", "Navigable enterprise pathway."],
  ["Capability development", "Build leadership, workforce and organisational capability for implementation.", "Studio outputs, applied learning and team participation."],
  ["Workplace implementation", "Apply learning inside the business through guided projects and coaching.", "Redesigned workflows, enterprise tools and business-improvement assets."],
  ["Innovation and AI adoption", "Test responsible AI, automation, data or immersive tools where they solve defined problems.", "Proof-of-value, risk controls and adoption support."],
  ["Measurement and improvement", "Review evidence, update the index and refine transformation priorities.", "Progress views, lessons and improvement actions."],
  ["Transformation Blueprint™", "Consolidate a three-year forward transformation horizon.", "Blueprint, portfolio and continued capability roadmap."]
].map(([title, purpose, asset], index) => ({
  title,
  purpose,
  asset,
  status: index < 5 ? ("core_methodology" as ProlificStatus) : ("implementation_option" as ProlificStatus)
}));

export const domains = [
  ["Transformational leadership", "Strategic direction, adaptability, governance and change leadership."],
  ["Workforce capability", "Skills, collaboration, Smart Worker capability and human-AI collaboration."],
  ["Customer-centred operations", "Customer understanding, responsiveness, service design and digital engagement."],
  ["Operational excellence", "Process visibility, quality, productivity, consistency and reduced friction."],
  ["Financial capability", "Costing, cash flow, reporting and evidence-informed financial decisions."],
  ["Connected digital operations", "Organised information, collaboration, documentation and integrated tools."],
  ["Intelligent decision-making", "Dashboards, KPIs, enterprise scorecards and evidence-led decisions."],
  ["Practical Artificial Intelligence", "Responsible AI for defined business needs, not novelty."],
  ["Intelligent automation", "Simplification of repetitive work with oversight and accountability."],
  ["Continuous innovation", "Everyday improvement of products, services, processes and business models."],
  ["Sector transformation", "Contextual implementation for manufacturing, retail, agriculture, services and trades."],
  ["Resilience and growth", "Competitiveness, risk response, opportunity pursuit and continuous evolution."]
].map(([name, description]) => ({
  name,
  description,
  status: "core_methodology" as ProlificStatus
}));

export const campus = [
  ["Enterprise Discovery Centre™", "Gathers evidence and establishes the current state before prescriptions are made.", "Enterprise Discovery Report™"],
  ["Enterprise Learning Studios™", "Develops relevant knowledge through explanation, demonstration, application and peer learning.", "Applied studio outputs"],
  ["Enterprise Transformation Clinics™", "Guides real business improvements through Assess → Collaborate → Implement → Review.", "Implemented improvement assets"],
  ["Innovation Pathway Studios™", "Explores sector-specific modernisation and practical innovation opportunities.", "Sector pathway plan"],
  ["Enterprise Innovation Lab™", "Supports experimentation, prototyping, Innovation Sprints™ and innovation portfolios.", "Enterprise Innovation Portfolio™"],
  ["AI Enterprise Lab™", "Tests responsible AI, Agentic AI, automation, analytics and knowledge tools against business value.", "AI proof-of-value and oversight plan"],
  ["Enterprise Growth Network™", "Connects Enterprise Fellows to advisors, peers, partnerships and future capability development.", "Growth network pathway"]
].map(([name, purpose, output], index) => ({
  name,
  purpose,
  output,
  status: index === 6 ? ("implementation_option" as ProlificStatus) : ("core_methodology" as ProlificStatus)
}));

export const sectors = [
  {
    name: "Manufacturer",
    friction: "Production friction, quality evidence, downtime and planning gaps.",
    intervention: "Operational excellence pathway, data capture discipline and tested automation or analytics use case.",
    assets: ["Process visibility map", "Quality routine", "Productivity dashboard", "Modernisation roadmap"]
  },
  {
    name: "Welding or fabrication",
    friction: "Reactive job management, quotation delays and inconsistent quality evidence.",
    intervention: "Quotation workflow, job tracking, technical knowledge routines and sector innovation sprint.",
    assets: ["Quotation framework", "Job tracker", "Quality evidence pack", "Sector sprint output"]
  },
  {
    name: "Retail or township enterprise",
    friction: "Stock visibility, customer engagement and record organisation.",
    intervention: "Digital operations basics, customer routines, simple analytics and affordable automation.",
    assets: ["Stock view", "Customer follow-up flow", "Digital payments checklist", "Marketing routine"]
  },
  {
    name: "Professional services",
    friction: "Scattered knowledge, client workflow gaps and slow reporting.",
    intervention: "Knowledge and client-workflow redesign, responsible AI assistant pilot and validation routines.",
    assets: ["Knowledge base", "Client workflow", "AI assistant pilot", "Reporting framework"]
  }
];

export const aiValuePath = [
  "Business problem",
  "Process and data readiness",
  "Risk and human oversight",
  "Tool or solution selection",
  "Controlled test",
  "Measurable value",
  "Adoption support",
  "Review"
];

export const portfolioAssets = [
  "Enterprise Discovery Report™",
  "Enterprise DNA Profile™",
  "Intelligent Enterprise Index™",
  "Enterprise Transformation Prescription™",
  "Enterprise Transformation Pathway™",
  "Business improvement plan",
  "Enterprise Performance Dashboard",
  "Enterprise Innovation Portfolio™",
  "Enterprise Transformation Blueprint™"
];

export const prolificStakeholders = [
  ["Enterprise leader", "A credible route from current friction to a stronger enterprise."],
  ["Employee", "A clear role in workplace transformation, learning and adoption."],
  ["Funder", "An accountable investment architecture and measurable return logic."],
  ["Municipality", "A scalable enterprise-development methodology for local economic resilience."],
  ["Technology partner", "Responsible adoption based on business value rather than novelty."]
];

export const prolificImpact = [
  ["Participation impact", "Enterprises enrolled, Enterprise Fellows, studios, clinics, sprints and engagement."],
  ["Capability impact", "Leadership, financial, customer, digital, AI, automation, data and workforce capability."],
  ["Transformation impact", "Implemented assets, improved operations, adoption, responsiveness and decision support."],
  ["Enterprise growth impact", "Competitiveness, capacity, productivity, sustainability and supply-chain readiness."],
  ["Ecosystem impact", "Local value chains, peer learning, responsible technology diffusion and regional resilience."]
];

export const partnershipRoutes = [
  "Sponsor an enterprise cohort",
  "Commission supplier development",
  "Implement a municipal programme",
  "Support a sector innovation pathway",
  "Contribute technology or expertise",
  "Provide mentors or market access",
  "Collaborate on applied research"
];
