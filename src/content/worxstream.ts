export const worxStreamPositioning = {
  slug: "worxstream",
  name: "WorxStream",
  status: "conceptual_architecture",
  publicNameStatus: "Provisional public name pending JEF approval",
  line: "Where verified capability begins to move.",
  support:
    "A governed JEF pathway connecting capability to work, WIL, projects, enterprise and continued development through consent, explainable matching and human support."
};

export const transitionCompare = [
  {
    label: "Conventional job board",
    points: ["Keyword search", "Mass application", "Opaque rejection", "No development pathway"],
    tone: "broken"
  },
  {
    label: "Capability-to-opportunity system",
    points: ["Verified requirements", "Authorised Passport", "Explainable fit", "Follow-up development"],
    tone: "orchestrated"
  }
];

export const perspectives = [
  {
    name: "Candidate",
    intent: "Discover suitable routes, understand readiness, authorise evidence and keep developing after every decision.",
    signal: "Agency before disclosure"
  },
  {
    name: "Employer",
    intent: "Define a quality opportunity, review only relevant evidence and run a fair selection process.",
    signal: "Requirement clarity"
  },
  {
    name: "Institution",
    intent: "Coordinate exits, WIL, tracer studies and employer engagement without overstating outcomes.",
    signal: "Pathway quality"
  },
  {
    name: "SMME or client",
    intent: "Submit scoped missions or projects with clear terms, feedback and evidence use.",
    signal: "Protected project work"
  },
  {
    name: "Funder",
    intent: "Track the difference between readiness, applications, transitions, sustained outcomes and system learning.",
    signal: "Verified impact"
  }
];

export const opportunityStream = [
  ["Goal", "Career intention, work mode, location and constraints are declared by the person."],
  ["Consent", "Disclosure preferences are specific to an opportunity and can be reviewed."],
  ["Discovery", "Verified opportunities are filtered by availability, timing and formal criteria."],
  ["Eligibility", "Non-negotiable legal, safety, licence and procedural conditions are checked."],
  ["Capability fit", "Evidence is compared with requirements by type, depth, currency and transfer."],
  ["Readiness", "CV, portfolio, interview, logistics and workplace preparation are surfaced."],
  ["Passport", "Only the authorised opportunity-specific evidence view is shared."],
  ["Human review", "High-stakes exclusion, appeals and accommodations stay governed by people."],
  ["Transition", "Referral, shortlist, offer, onboarding and active engagement remain separate."],
  ["Follow-up", "The career stream continues with support, evidence and next actions."]
];

export const matchFactors = [
  { name: "Formal eligibility", state: "supported", body: "Mandatory conditions are visible before application." },
  { name: "Verified capability", state: "supported", body: "Evidence shows what the person can do, not what an employer prefers." },
  { name: "VCAP assurance depth", state: "review", body: "Assurance language remains marked for final JEF confirmation." },
  { name: "Career readiness", state: "partial", body: "Practical preparation can improve without reducing capability truth." },
  { name: "Learner constraints", state: "supported", body: "Location, work mode, access and schedule shape suitable routes." },
  { name: "Evidence currency", state: "missing", body: "Missing evidence creates a next action, not a permanent deficiency." }
];

export const passportFields = [
  ["Shared", "Identity authorised for this process", "Contact, qualification and relevant evidence labels."],
  ["Shared", "Capability dimensions for the role", "Evidence source, verification level, currency and context."],
  ["Shared", "Portfolio or work products", "Only links needed for this opportunity and purpose."],
  ["Withheld", "Sensitive developmental history", "Internal notes, private uncertainty and unrelated personal data stay closed."],
  ["Withheld", "Rejected applications", "Non-selection elsewhere is not evidence of incapability."],
  ["Withheld", "Unrestricted Capability Twin", "Opportunity owners never receive the whole internal model by default."]
];

export const opportunityTypes = [
  ["Employment", "Permanent, fixed-term, part-time or entry-level roles with verified conditions."],
  ["WIL and formal pathways", "Institutionally governed WIL, internships, apprenticeships, learnerships or candidacy."],
  ["Industry missions", "Scoped briefs producing outputs, feedback and evidence through JEF programmes."],
  ["Consulting teams", "Supervised multidisciplinary teams delivering a defined service."],
  ["Gig and freelance", "Independent work with transparent scope, pay, safety and dispute protections."],
  ["Enterprise", "Customer briefs, supplier development, market access and venture support."],
  ["Continued learning", "Specific learning, practice, mentoring or credential preparation when work is not the next best step."]
];

export const statusJourney = [
  "Discovered",
  "Consent pending",
  "Applied",
  "Under review",
  "Shortlisted",
  "Offer issued",
  "Onboarding",
  "Active engagement",
  "Completed",
  "Follow-up"
];

export const ecosystemSources = [
  ["iCampus", "Digital, AI and professional learning pathways."],
  ["VOCLE XR", "Immersive simulations, Capability Twin and Passport architecture."],
  ["Workgrid Labs", "Occupational capability, Industry Missions and preparation."],
  ["DxHub", "Local access, institutional projects and regional orchestration."],
  ["Prolific Edge", "SMME challenges, enterprise transformation and venture routes."]
];

export const partnerRoutes = [
  "Offer employment",
  "Host WIL",
  "Submit an Industry Mission",
  "Commission a project team",
  "Provide mentorship",
  "Fund transition support",
  "Support accessibility",
  "Contribute opportunity data"
];
