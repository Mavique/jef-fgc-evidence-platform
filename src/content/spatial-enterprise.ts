export const spatialEnterprisePositioning = {
  slug: "spatial-enterprise",
  portfolioName: "Spatial Enterprise Solutions",
  methodologyName: "Spatial AI Enterprise",
  status: "strategic_architecture",
  nameNote: "Portfolio and methodology hierarchy pending JEF approval",
  line: "Enterprise intelligence, embedded where work happens.",
  support:
    "JEF helps organisations connect people, assets, knowledge, immersive learning, digital twins and AI-supported guidance to improve how work is learned, performed and continuously strengthened."
};

export const overlayCompare = [
  {
    label: "Decorative overlay",
    intent: "Information sits on top of the workplace without knowing the task, asset, role, risk or source authority.",
    points: ["Floating graphics", "Generic instruction", "No provenance", "No stop condition"]
  },
  {
    label: "Spatial intelligence",
    intent: "Guidance appears only when context, knowledge, permissions, confidence and human authority make it useful.",
    points: ["Asset context", "Approved knowledge", "Human judgement", "Governed escalation"]
  }
];

export const assetA17Views = [
  {
    name: "Technician view",
    title: "Asset A17 is abnormal.",
    body: "The worker sees the authorised asset, task zone, isolation reminder, inspection sequence and evidence capture prompt.",
    signal: "Work remains human"
  },
  {
    name: "System context",
    title: "The twin narrows the problem.",
    body: "The system compares role, asset version, maintenance history, procedure status, sensor timestamp and confidence before guidance appears.",
    signal: "Context before advice"
  },
  {
    name: "Supervisor view",
    title: "Escalation is visible.",
    body: "If conditions differ, confidence is low or safety criticality rises, guidance stops and a supervisor or expert takes authority.",
    signal: "Stop beats guess"
  },
  {
    name: "Knowledge source",
    title: "Instruction has provenance.",
    body: "Every step exposes source owner, version, effective date, review date, applicability and superseded material.",
    signal: "Trust is inspectable"
  },
  {
    name: "Business value",
    title: "Value is measured after use.",
    body: "The pilot compares baseline with task time, first-time accuracy, support burden, safety, adoption and user trust.",
    signal: "Evidence before scale"
  }
];

export const transformationJourney = [
  ["Enterprise Discovery", "Assess strategy, workforce, processes, assets, systems, risk and desired value."],
  ["Opportunity Mapping", "Find where physical context affects learning, safety, decisions, maintenance or quality."],
  ["Prioritisation", "Select use cases by value, feasibility, risk, data readiness and maintainability."],
  ["Asset Capture", "Create fit-for-purpose spatial representations from records, scans, CAD, media or GIS."],
  ["Knowledge Engineering", "Structure manuals, procedures, expert notes, history, safety rules and decision pathways."],
  ["Twin Architecture", "Define the Living Twin, Knowledge Twin, context layer and what remains out of scope."],
  ["Guidance Design", "Design onboarding, simulation, instructions, remote support and knowledge-capture interactions."],
  ["Safe Validation", "Test spatial accuracy, usability, safety, accessibility, latency and failure modes."],
  ["Workplace Pilot", "Deploy with trained users, fallback procedures, support, baselines and limited scope."],
  ["Integration", "Connect approved systems, roles, workflows, security and content governance."],
  ["Measure Improve", "Evaluate time, quality, learning, safety, adoption and unintended consequences."],
  ["Scale or Stop", "Scale only where value, safety and human impact are demonstrated."]
];

export const trustLayers = [
  ["Visible instruction", "What the worker sees at the asset."],
  ["Enterprise Living Twin", "Asset, space, process, state and relationships for an operational purpose."],
  ["Enterprise Knowledge Twin", "Approved knowledge connected to assets, roles, tasks, versions and authorities."],
  ["Spatial Copilot", "AI-supported guidance using role, location, task and approved context."],
  ["Integration layer", "Asset registers, documents, maintenance, sensors, identity and learning systems."],
  ["Governance and safety", "Authority, privacy, cybersecurity, human oversight, audit and fallback procedures."]
];

export const solutions = [
  ["Spatial Onboarding", "Workplace orientation, asset familiarisation, safety zones and role-specific induction."],
  ["Procedure Learning", "3D instruction, XR rehearsal and simulations linked to real assets and procedures."],
  ["Spatial Work Guidance", "Context-aware instructions, checklists, visual references, quality checks and escalation."],
  ["Remote Expert Collaboration", "Shared worker-expert view, annotation, evidence and governed resolution."],
  ["Knowledge Capture", "Expert lessons, exceptions, field notes and institutional memory with review and versioning."],
  ["Digital Twin Operations", "Fit-for-purpose twins for learning, planning, maintenance and decision support."],
  ["Diagnostic Intelligence", "Asset history, fault knowledge and guided diagnostics under human authority."],
  ["Spatial Safety", "Hazard visualisation, emergency rehearsal, safe procedures and escalation boundaries."]
];

export const sectors = [
  {
    name: "Manufacturing",
    asset: "Changeover cell",
    problem: "Inconsistent procedure access and slow diagnosis.",
    value: "First-time accuracy, downtime and onboarding time."
  },
  {
    name: "Engineering services",
    asset: "Field inspection asset",
    problem: "Remote specialists and technical knowledge are not available at the point of work.",
    value: "Expert travel, evidence quality and resolution time."
  },
  {
    name: "Energy utilities",
    asset: "Distributed maintenance site",
    problem: "Safety, asset history and outage context are fragmented.",
    value: "Safe procedure adherence and diagnostic time."
  },
  {
    name: "Logistics",
    asset: "Warehouse flow zone",
    problem: "New workers need spatial routing, equipment use and safety context.",
    value: "Time to competence and process consistency."
  },
  {
    name: "Public facilities",
    asset: "Service infrastructure",
    problem: "Facility knowledge, emergency context and maintenance records are difficult to coordinate.",
    value: "Response quality, knowledge retention and service resilience."
  }
];

export const lifecycle = ["Recruit", "Onboard", "Learn", "Simulate", "Certify", "Work", "Assist", "Capture", "Improve"];

export const copilotBoundaries = [
  ["May retrieve", "Approved context, source material, task guidance and relevant explanation."],
  ["May ask", "Confirmation of conditions, missing information and evidence capture."],
  ["May recommend", "Stop, escalation, expert support or fallback when confidence is low."],
  ["Must not fabricate", "No invented procedures, hidden uncertainty or stale data without warning."],
  ["Must not authorise", "No work outside role, competence, permit, isolation or regulated safety boundary."],
  ["Must not surveil", "No covert productivity scoring or hidden behavioural monitoring."]
];

export const provenanceRecord = [
  ["Source owner", "Maintenance engineering authority"],
  ["Applies to", "Asset A17, valve bank V2, inspection mode"],
  ["Version", "Procedure 4.2, effective 2026-08-25"],
  ["Review date", "Verification required before public use"],
  ["Data freshness", "Representative timestamp for planning"],
  ["Escalation", "Supervisor or subject-matter expert if conditions differ"]
];

export const twinTypes = [
  ["Static spatial model", "Represents geometry only. It is not a live twin."],
  ["Asset-information twin", "Connects asset identity, manuals, records and configuration."],
  ["Learning twin", "Supports rehearsal, simulation and competence development."],
  ["Connected operational twin", "Uses approved current context with timestamps, provenance and fallback rules."]
];

export const hypothesisOptions = [
  "Reduce time to locate the approved procedure",
  "Improve first-time task accuracy",
  "Shorten supervised onboarding",
  "Reduce avoidable expert travel",
  "Improve inspection consistency",
  "Strengthen emergency rehearsal"
];

export const ecosystemLinks = [
  ["Prolific Edge", "Enterprise diagnostics and transformation prescriptions."],
  ["Workplace 4.0", "Smart Worker capability, change and responsible automation."],
  ["VOCLE XR", "Immersive learning, simulations and governed capability evidence."],
  ["Workgrid Labs", "3D, XR, IoT, robotics, missions and talent pipelines."],
  ["DxHub", "Local enterprise access, use-case discovery and implementation."],
  ["WorxStream", "Talent, project and staffing pathways for pilots."]
];
