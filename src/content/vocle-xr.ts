export const voclePositioning = {
  name: "VOCLE XR",
  status: "in_development",
  line: "From immersive learning to verified human capability.",
  description:
    "A lecturer-led cognitive learning platform where immersive experiences generate governed evidence, adaptive support and persistent capability development.",
  safeguard:
    "Advanced architecture and MVP build contract. Do not present proposed capabilities as deployed production features without verification."
};

export const contentComparison = [
  {
    name: "XR Content Platform",
    stance: "Consumption and completion",
    signals: ["Headset access", "Time spent", "Completion badges", "Basic quiz results"],
    weakness: "Participation can look like progress while capability remains unclear."
  },
  {
    name: "Cognitive Capability Platform",
    stance: "Evidence and development",
    signals: ["Curriculum alignment", "Observed behaviour", "Evidence quality", "Human review", "Next experience"],
    weakness: "The system must remain explainable, governed and open to correction."
  }
];

export const loopSteps = [
  {
    name: "Learner experience",
    happened: "Thabo explores engine starting systems, answers questions and enters a no-start diagnostic simulation.",
    observed: "Questions, tool choices, inspection sequence, safety behaviour and job-card updates.",
    evidence: "Only relevant, contextual and sufficiently reliable observations can support evidence.",
    next: "Move to guided practice or diagnostic simulation depending on uncertainty."
  },
  {
    name: "WINGS observation",
    happened: "Specialised lenses investigate knowledge, reasoning, execution, safety and confidence calibration.",
    observed: "LUMEN, AC/DC, CTL, SENTINEL, MIRROR, PRISM and IPIE ask different questions.",
    evidence: "A lens does not declare universal truth. It contributes bounded evidence.",
    next: "Route findings into COS for governed interpretation."
  },
  {
    name: "COS evidence and beliefs",
    happened: "COS separates what occurred, what was observed, what counts as evidence and what is currently believed.",
    observed: "A starter test before battery verification may challenge sequencing capability.",
    evidence: "Beliefs remain revisable and may contain uncertainty or contradiction.",
    next: "Send the learner state to ALAE-X for developmental interpretation."
  },
  {
    name: "ALAE-X interpretation",
    happened: "ALAE-X identifies what remains uncertain and forms a developmental intention.",
    observed: "Possible diagnostic sequencing weakness, not automatic failure.",
    evidence: "The reason for the next experience must be explainable.",
    next: "Ask ATLAS to create a retry that tests independent sequencing."
  },
  {
    name: "ATLAS orchestration",
    happened: "ATLAS composes the next experience from curriculum, state, safety constraints and available simulations.",
    observed: "Guidance may reduce, difficulty may rise or a lecturer may intervene.",
    evidence: "The next experience serves development rather than platform engagement.",
    next: "Retry, transfer, human review or progression."
  },
  {
    name: "Twin and CDAP update",
    happened: "New evidence updates the Living Capability Twin and authoritative evidence record.",
    observed: "Improvement, contradiction, sufficiency and recency stay visible.",
    evidence: "Capability beliefs are not formal qualifications unless authorised by the institution.",
    next: "Continue academic learning and persistent career development."
  }
];

export const systems = [
  ["COS", "Cognition", "Owns observations, evidence, state, beliefs, reasoning, memory, governance and explainability."],
  ["WINGS", "Investigation", "Generates specialised competency evidence. It does not independently declare learner truth."],
  ["ALAE-X", "Developmental intelligence", "Interprets uncertainty, gaps and the intention for the next learning experience."],
  ["ATLAS", "Experience orchestration", "Builds and assigns experiences aligned to curriculum, constraints and learner state."],
  ["CDAP", "Evidence storage", "Preserves provenance, context, verification and trustworthy capability records."],
  ["Mission Control", "Lecturer authority", "Keeps human educators in curriculum control, intervention and assessment review."]
];

export const wings = [
  ["LUMEN", "Knowledge and conceptual mastery", "Does Thabo understand starting-system concepts?"],
  ["AC/DC", "Conversational reasoning", "Can he explain why battery verification comes first?"],
  ["CTL", "Practical execution", "Did he use tools and procedures correctly?"],
  ["SENTINEL", "Safety and critical risk", "Was any unsafe action or escalation condition observed?"],
  ["MIRROR", "Confidence calibration", "Does his confidence match demonstrated capability?"],
  ["PRISM", "Diagnostic sequencing", "Does his reasoning follow an appropriate diagnostic order?"],
  ["IPIE", "Integrated evidence", "How do multiple sources support explainable review?"]
];

export const twinDimensions = [
  {
    name: "Conceptual knowledge",
    state: "supported",
    note: "Quiz and explanation evidence support current understanding."
  },
  {
    name: "Diagnostic sequencing",
    state: "challenged",
    note: "One attempt skipped battery verification before starter testing."
  },
  {
    name: "Safety",
    state: "partial",
    note: "No critical risk, but more varied evidence is needed under pressure."
  },
  {
    name: "Independence",
    state: "developing",
    note: "Guidance is reducing across guided, reduced-guidance and independent practice."
  },
  {
    name: "Transfer",
    state: "uncertain",
    note: "A new no-start scenario is needed before stronger conclusions."
  }
];

export const missionControlViews = [
  "Cohort overview",
  "Capability Twin review",
  "ALAE-X alerts",
  "WINGS evidence replay",
  "Human observation capture",
  "Safety and wellbeing escalation",
  "Assessment review",
  "Experience override"
];

export const journeyStages = [
  "Immersive Knowledge",
  "Guided Learning",
  "Guided Practice",
  "Simulations",
  "Scenario-Based Problem Solving",
  "Team Missions",
  "Competency Assessment",
  "Simulated WIL Capstone",
  "Career Compass",
  "Virtual Enterprise",
  "Workplace Capability",
  "Innovation and Entrepreneurship"
];

export const pipeline = [
  "Curriculum outcome",
  "Competency model",
  "Educator design",
  "Learning assets",
  "Simulation or mission",
  "WINGS observation plan",
  "Safety review",
  "Approved experience"
];

export const evidenceInspector = [
  {
    observation: "Selected starter test before battery verification",
    value: "partial",
    explanation: "Relevant to diagnostic sequencing, but one event alone does not establish competence."
  },
  {
    observation: "Correct voltage reading with appropriate lead connection",
    value: "supporting",
    explanation: "Supports practical execution when provenance, context and supervision are clear."
  },
  {
    observation: "High confidence before checking fuse state",
    value: "contradictory",
    explanation: "May challenge confidence calibration if paired with procedural gaps."
  },
  {
    observation: "Completed 100 planned simulation hours",
    value: "insufficient",
    explanation: "Hours describe experience volume. They do not prove competence."
  }
];

export const userModes = [
  ["Learner", "Understand what is next, why it is next, what was observed and how to improve."],
  ["Lecturer", "Retain curriculum authority, intervention, human observations and deliberative assessment."],
  ["Institution", "Support curriculum implementation, simulation, evidence quality and governance."],
  ["Employer", "Inspect learner-consented, explainable capability evidence rather than self-declared skills."],
  ["Funder", "Separate access, evidence, capability, academic progression and verified outcomes."]
];

export const partnerPathways = [
  "Co-design a curriculum experience",
  "Contribute industry scenarios",
  "Pilot a programme",
  "Support lecturer development",
  "Fund simulation production",
  "Validate workplace realism",
  "Support accessibility research",
  "Connect capability to opportunity"
];
