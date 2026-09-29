export const spatialAiCityPositioning = {
  slug: "spatial-ai-city",
  name: "JEF Spatial AI City",
  status: "strategic_framework",
  line: "See the place. Understand the system. Shape the future together.",
  support:
    "A human-centred civic intelligence framework connecting places, public services, infrastructure, communities, digital twins, XR and Spatial AI."
};

export const civicCompare = [
  {
    label: "Generic smart city",
    body: "Procurement, dashboards, automation and surveillance are mistaken for intelligence.",
    points: ["Technology first", "Opaque data", "Control-room posture", "Weak public agency"]
  },
  {
    label: "Civic intelligence city",
    body: "People, places, evidence, participation and accountable decisions are connected with visible limits.",
    points: ["Public purpose", "Trusted layers", "Community knowledge", "Measured improvement"]
  }
];

export const districtLayers = [
  {
    name: "Public services",
    purpose: "Show facilities, service areas and access gaps.",
    status: "planning_layer",
    source: "Requires authorised public data",
    time: "Verification required",
    privacy: "Public or aggregated"
  },
  {
    name: "Infrastructure",
    purpose: "Represent roads, water, energy, waste and facilities where authorised.",
    status: "planning_layer",
    source: "Municipal or utility owner required",
    time: "Not live",
    privacy: "Sensitive details protected"
  },
  {
    name: "Community knowledge",
    purpose: "Connect local reports, stories, accessibility experience and priorities.",
    status: "planning_layer",
    source: "Consent and validation required",
    time: "Community update cycle",
    privacy: "Contributor rights protected"
  },
  {
    name: "Environment and risk",
    purpose: "Support preparedness for flood, fire, land, pollution and climate risks.",
    status: "simulated_data",
    source: "Scientific and emergency authority required",
    time: "Scenario only",
    privacy: "Sensitive sites filtered"
  },
  {
    name: "Heritage and culture",
    purpose: "Preserve mining heritage, oral histories, routes and local identity.",
    status: "planning_layer",
    source: "Community and knowledge-holder approval required",
    time: "Interpretation labelled",
    privacy: "Sensitive cultural places protected"
  },
  {
    name: "Economy and creators",
    purpose: "Show local enterprise, skills, projects, tourism and spatial creator pathways.",
    status: "verification_required",
    source: "Verified ecosystem data required",
    time: "No outcome claims",
    privacy: "Business consent required"
  }
];

export const civicJourney = [
  ["Mandate", "Define the public purpose, authority, people affected, decision and expected value."],
  ["Stakeholders", "Map residents, departments, institutions, enterprises, emergency services and vulnerable groups."],
  ["Knowledge discovery", "Catalogue maps, plans, service data, imagery, stories and environmental information."],
  ["Governance", "Set privacy, consent, security, ownership, bias, redress, retention and prohibited uses."],
  ["Spatial baseline", "Capture the place with GIS, imagery, surveys, 3D or community mapping under lawful practice."],
  ["Layer architecture", "Define what is represented, fidelity, decision purpose, owner and update responsibility."],
  ["Experience design", "Create maps, XR, scenarios, public interfaces and field tools for real users."],
  ["Validation", "Test accuracy, lived experience, accessibility, language, usefulness and harms."],
  ["Pilot", "Run a bounded use case with owners, training, security, fallback and decision measures."],
  ["Participation", "Let residents understand, comment, contribute, correct and appeal."],
  ["Measure value", "Evaluate decision quality, preparedness, inclusion, coordination and trust."],
  ["Scale or stop", "Scale proven layers. Stop uses that create harm, surveillance or unsustainable cost."]
];

export const manyTruths = [
  ["Municipal record", "Official data may show ownership, service area or planned work."],
  ["Community experience", "Residents may show access barriers, safety concerns or local priorities."],
  ["Engineering context", "Professionals may show asset condition, dependencies and limits."],
  ["Environmental context", "Risk layers may show water, land, climate or pollution constraints."],
  ["Planning document", "Future scenarios may show assumptions, trade-offs and alternatives."]
];

export const twinTypes = [
  ["District context twin", "A fit-for-purpose spatial representation of boundaries, facilities and relationships."],
  ["Infrastructure twin", "Authorised asset context for planning, maintenance or service coordination."],
  ["Emergency simulation twin", "Preparedness scenarios, routes, resources and roles, clearly not live incident data."],
  ["Heritage twin", "Immersive cultural or historic interpretation with evidence and community rights labelled."],
  ["Economic scenario twin", "Sites, sectors, skills and opportunity context from verified public information."]
];

export const useCases = [
  ["Planning intelligence", "Compare land, corridors, access, facilities and growth constraints."],
  ["Infrastructure visibility", "Map authorised assets, condition, dependencies and inspection priorities."],
  ["Emergency preparedness", "Simulate hazards, routes, facilities, resources and public guidance."],
  ["Environment resilience", "Visualise climate hazards, pollution, water, land and nature-based interventions."],
  ["Public service access", "Help residents locate services and identify inclusion gaps."],
  ["Digital heritage", "Create governed heritage trails, oral-history maps and local tourism routes."],
  ["Education and civic learning", "Use local places for maps, 3D, XR, history, planning and community inquiry."],
  ["Participatory mapping", "Let residents contribute knowledge, evaluate plans and co-design improvements."]
];

export const participationSteps = ["Inform", "Contribute", "Deliberate", "Co-design", "Decision", "Track", "Correct"];

export const dataTrust = [
  ["Purpose", "Why this layer exists and which decision it supports."],
  ["Source and owner", "Who supplied it and who can maintain or approve changes."],
  ["Geography and time", "Where it applies, when it was captured and update cycle."],
  ["Quality and uncertainty", "Completeness, limits, assumptions and confidence remain visible."],
  ["Privacy and access", "Personal, sensitive and infrastructure data are protected."],
  ["Authority to act", "Which institution or role can decide, respond or escalate."]
];

export const creatorRoles = [
  "GIS practitioner",
  "Field-data collector",
  "3D modeller",
  "XR developer",
  "Digital-twin technician",
  "Civic researcher",
  "Heritage storyteller",
  "Community facilitator"
];

export const partnerOptions = [
  "Identify a civic challenge",
  "Contribute authorised data",
  "Host participatory mapping",
  "Build a pilot twin",
  "Develop heritage content",
  "Support spatial skills",
  "Fund creators",
  "Collaborate on governance"
];
