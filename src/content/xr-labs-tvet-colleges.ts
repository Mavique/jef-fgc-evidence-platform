export const xrLabPositioning = {
  name: "XR Labs for TVET Colleges",
  status: "proposed_solution",
  line: "More than a lab. A new way to prepare for real work.",
  description:
    "A platform-neutral XR Lab establishment and activation model for TVET colleges, connecting occupational teaching, simulation, workshops, student creation, operations and evidence.",
  caution:
    "Methodology, readiness model and implementation stages are programme design. Named deployments, equipment quantities, licences, participant numbers and outcomes require approved verification."
};

export const labTruths = [
  "The lab begins with curriculum and occupational practice, not devices.",
  "Lecturers remain the instructional authority.",
  "Immersive simulation supplements workshops and workplace learning.",
  "Students can progress from users to creators and problem-solvers.",
  "Sustainability depends on governance, people, content, support and evidence."
];

export const architectureLayers = [
  {
    name: "Curriculum and occupational practice",
    purpose: "Defines qualifications, modules, outcomes, tasks, standards and workplace contexts.",
    dependency: "Priority use cases and lecturer ownership",
    risk: "Devices are procured before learning purpose is clear.",
    evidence: "Mapped occupational outcomes and teaching scenarios"
  },
  {
    name: "People and capability",
    purpose: "Builds lecturer, student, lab facilitator, technical administrator and industry-contributor roles.",
    dependency: "Workload, training, mentoring and role clarity",
    risk: "Certificates are treated as classroom adoption.",
    evidence: "Build, publish, assign, facilitate and evaluate records"
  },
  {
    name: "Physical and spatial environment",
    purpose: "Designs safe zones for briefing, simulation, creation, debrief, storage, charging and support.",
    dependency: "Room dimensions, power, accessibility, movement and safety review",
    risk: "A room of equipment becomes the whole strategy.",
    evidence: "Commissioned lab layout and safety acceptance"
  },
  {
    name: "Technology and content systems",
    purpose: "Configures platform-neutral devices, authoring tools, simulations, identity, analytics and integrations.",
    dependency: "Use cases, rotation logic, support and total cost of ownership",
    risk: "Licences and logins are counted as teaching value.",
    evidence: "Activated, tested and supported systems"
  },
  {
    name: "Governance and operations",
    purpose: "Owns access, scheduling, assets, content approval, privacy, cybersecurity and incident response.",
    dependency: "Executive sponsor, steering structure and operating procedures",
    risk: "The lab cannot survive after launch support ends.",
    evidence: "Operating model, support logs and review cadence"
  },
  {
    name: "Evidence and improvement",
    purpose: "Separates procurement, commissioning, use, applied teaching, capability and verified outcomes.",
    dependency: "Baseline, utilisation, teaching evidence and evaluation method",
    risk: "One success number hides weak adoption.",
    evidence: "Evidence ladder with limitations and review dates"
  }
];

export const labZones = [
  ["Orientation and briefing", "Learning objective, safety briefing, controls, rotations and lecturer station."],
  ["Immersive simulation", "Supervised individual or small-group rehearsal with safe movement boundaries."],
  ["AR and MR workbench", "Overlay information on physical components, procedures or training aids."],
  ["3D creation studio", "Modelling, media capture, animation, scanning and interactive content production."],
  ["Collaborative debrief", "Review observations, connect simulation to theory and solve problems in teams."],
  ["Technical administration", "Device configuration, accounts, diagnostics, publishing and support records."],
  ["Secure storage and hygiene", "Charging, inventory, cleaning, quarantine, access control and asset care."],
  ["Industry engagement", "Scenario co-design, showcases, open days and workplace relevance review."]
];

export const implementationRoadmap = [
  ["Readiness", "Assess curriculum priorities, facility, people, budget, support and evidence needs."],
  ["Design", "Define use cases, spatial model, governance, equipment logic and content roadmap."],
  ["Commission", "Procure, install, test, accept and document the lab before broad use."],
  ["Capability", "Train lecturers, students, administrators and technical support through applied evidence."],
  ["Pilot", "Run bounded teaching use with fallback, support, debrief and improvement records."],
  ["Reinforce", "Use 30, 60 and 90 day adoption support to move from launch to sustained use."],
  ["Evaluate", "Review utilisation, teaching application, student evidence, support and sustainability."],
  ["Scale", "Expand only when readiness, operations and evidence justify it."]
];

export const capabilityPaths = [
  {
    role: "Lecturer",
    path: "Select outcomes, evaluate content, facilitate simulation, debrief, assess and improve.",
    evidence: "Build, publish, assign, facilitate and evaluate workflow"
  },
  {
    role: "Student",
    path: "Move from safe user to critical participant, scenario performer, content contributor, XR creator and portfolio holder.",
    evidence: "Challenge, artefact, testing, feedback, result and reflection"
  },
  {
    role: "Technical team",
    path: "Manage devices, accounts, updates, support, storage, cybersecurity and incident response.",
    evidence: "Commissioning, uptime, support resolution and asset records"
  },
  {
    role: "Industry partner",
    path: "Contribute occupational scenarios, standards, workplace realism and review.",
    evidence: "Validated scenario briefs and current-practice feedback"
  }
];

export const evidenceStates = [
  ["Requirement", "Specified need before procurement."],
  ["Procured", "Purchased, but not necessarily commissioned."],
  ["Commissioned", "Installed, tested and accepted."],
  ["Activated", "User or system enabled."],
  ["Used", "Activity recorded."],
  ["Applied teaching", "Verified curriculum use."],
  ["Demonstrated capability", "Assessed output or practice."],
  ["Verified outcome", "Measured, attributable and approved."]
];

export const sustainabilityChecks = [
  "Recurring operational budget and licence renewal logic",
  "Maintenance, spares, warranties and replacement reserve",
  "Multiple trained role holders and succession planning",
  "Content review, versioning and retirement cycle",
  "Booking, support, asset and incident procedures",
  "Industry relevance and annual evidence review"
];

export const ecosystemMap = [
  ["VOCLE XR", "Immersive learning, simulation, content creation and evidence architecture."],
  ["Workgrid Labs", "Applied occupational studios, industry missions and TVET exit pathways."],
  ["iCampus", "Lecturer and student academies, resources, assessment, progress and portfolio support."],
  ["Workplace 4.0", "Smart Worker capability, digital collaboration and institutional adoption."],
  ["Spatial Enterprise", "Context-aware workplaces, assets, workflows and digital twins."],
  ["WorxStream", "Verified student portfolios routed toward projects or opportunities without guaranteeing work."]
];
