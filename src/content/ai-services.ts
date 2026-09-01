export const aiServicesPositioning = {
  name: "JEF AI Services",
  status: "proposed_service_architecture",
  line: "Turn AI potential into work that performs.",
  description:
    "JEF AI Services helps organisations diagnose, design, implement and govern assistants, agents, automation and knowledge systems around real people, workflows and measurable outcomes.",
  caution:
    "Specific packaged services, clients, deployments, integrations, performance claims and outcomes require approved evidence before publication."
};

export const aiTruths = [
  "AI opportunity is not AI readiness.",
  "A chatbot is not a knowledge system.",
  "An assistant suggests; an agent may act.",
  "Automation does not fix a broken process.",
  "A model demonstration is not an operational deployment.",
  "Human oversight must be designed, not merely stated."
];

export const workbenchSteps = [
  ["Outcome", "Define the work result that matters before selecting any model or tool."],
  ["Friction", "Find slow handoffs, repeated capture, missing knowledge and weak decisions."],
  ["Foundations", "Check lawful data, trusted knowledge, identity, permissions and support."],
  ["Intervention", "Choose no AI, tool, assistant, copilot, gated agent, bounded agent or automation."],
  ["Oversight", "Place human judgement, approval, escalation, appeal and fallback into the workflow."],
  ["Evidence", "Measure quality, safety, cost, value, adoption and harm before scaling."]
];

export const interventionLevels = [
  {
    level: "Level 0",
    mode: "No AI",
    role: "Use process improvement, rules, search, templates or human judgement.",
    controls: "Document why AI adds insufficient value or unacceptable risk.",
    risk: "Low autonomy, high clarity."
  },
  {
    level: "Level 1",
    mode: "AI-enabled tool",
    role: "Extract, transcribe, classify or translate a bounded input.",
    controls: "Human verification, input limits and quality checks.",
    risk: "Useful when task boundaries are stable."
  },
  {
    level: "Level 2",
    mode: "Assistant",
    role: "Respond, retrieve or draft while the human initiates and acts.",
    controls: "Source inspection, uncertainty labels and user verification.",
    risk: "Unsafe when treated as authoritative without review."
  },
  {
    level: "Level 3",
    mode: "Copilot",
    role: "Preserve workflow context and recommend next actions.",
    controls: "Role scope, manager support, feedback and audit trail.",
    risk: "Requires adoption design, not only access."
  },
  {
    level: "Level 4",
    mode: "Approval-gated agent",
    role: "Plan and prepare multi-step work but request approval before consequential execution.",
    controls: "Permission checks, approval gates, logs, rollback and exception handling.",
    risk: "Appropriate only when accountability is explicit."
  },
  {
    level: "Level 5",
    mode: "Bounded autonomous agent",
    role: "Execute narrow reversible actions within limits and monitoring.",
    controls: "Least privilege, cost limits, kill switch, incident response and shutdown criteria.",
    risk: "Never for unrestricted or high-impact decisions without foundation."
  }
];

export const serviceDomains = [
  ["AI strategy and transformation leadership", "Outcomes, portfolio priorities, investment logic, ownership and acceptable-risk boundaries."],
  ["AI readiness and opportunity diagnosis", "Processes, data, knowledge, systems, people, governance, security and implementation capacity."],
  ["Data foundations", "Availability, quality, ownership, access, lineage, security and use-case fitness."],
  ["Knowledge intelligence", "Trusted organisational knowledge for governed search, retrieval, assistance and reuse."],
  ["AI assistants and copilots", "Drafting, research, analysis, navigation, communication and task support with human control."],
  ["Agentic AI", "Bounded planning and tool use with permissions, approval gates, monitoring and shutdown criteria."],
  ["Intelligent automation", "AI-assisted extraction, routing and stable workflow execution with exceptions and escalation."],
  ["Analytics and decision intelligence", "Dashboards, forecasting, anomaly detection, scenarios and accountable decision support."],
  ["Document and content intelligence", "Classify, compare, summarise and transform documents, reports, proposals and media with verification."],
  ["Integration and AI engineering", "Models, applications, APIs, identity, observability, environments and operational controls."],
  ["Responsible AI, security and assurance", "Privacy, safety, bias, transparency, oversight, red-teaming, auditability and incidents."],
  ["Adoption, capability and managed improvement", "Role-based practice, support, monitoring, cost optimisation and continuous learning."]
];

export const readinessDimensions = [
  {
    name: "Strategic readiness",
    checks: "Defined outcomes, sponsor, investment criteria and alignment.",
    state: "evidence required"
  },
  {
    name: "Process readiness",
    checks: "Stable workflow, owner, exceptions, baseline and improvement hypothesis.",
    state: "foundation before automation"
  },
  {
    name: "Data readiness",
    checks: "Lawful access, quality, ownership, lineage, retention and representative coverage.",
    state: "blocker if unresolved"
  },
  {
    name: "Knowledge readiness",
    checks: "Authoritative sources, metadata, review dates, conflicts and access boundaries.",
    state: "required for trusted answers"
  },
  {
    name: "Technology readiness",
    checks: "Integration access, identity, deployment environment, cybersecurity and observability.",
    state: "pilot-ready with conditions"
  },
  {
    name: "People readiness",
    checks: "Role clarity, user capability, consultation, manager participation and support.",
    state: "adoption evidence required"
  },
  {
    name: "Governance readiness",
    checks: "Lawful purpose, risk classification, approval, oversight, correction and incidents.",
    state: "non-negotiable"
  },
  {
    name: "Operational readiness",
    checks: "Monitoring, fallback, service levels, change control, budget and vendor management.",
    state: "required before scale"
  }
];

export const knowledgeInspector = [
  ["Source layer", "Approved policies, procedures, manuals, records, databases and verified external sources."],
  ["Preparation layer", "Remove obsolete material, classify sensitivity, chunk content and preserve version and owner."],
  ["Retrieval layer", "Combine permissions-aware search, ranking, filters and query rewriting where appropriate."],
  ["Generation layer", "Answer within scope, cite sources, state uncertainty and refuse unsupported conclusions."],
  ["Verification layer", "Inspect sources, detect conflicts and route consequential use to human approval."],
  ["Lifecycle layer", "Refresh content, re-index, monitor quality, correct incidents and retire weak sources."]
];

export const agentTrace = [
  ["Goal", "A bounded work request is received."],
  ["Plan", "The system proposes steps and identifies required tools."],
  ["Permission", "Identity, access, data class and action limits are checked."],
  ["Approval", "Consequential action waits for accountable human approval."],
  ["Action", "Only authorised reversible actions execute."],
  ["Log", "The decision, source, approval and result are recorded."],
  ["Exception", "Uncertainty, prohibited action or failure escalates or shuts down."]
];

export const implementationPhases = [
  ["Align", "Define outcome, sponsor, affected people, success criteria and boundaries."],
  ["Discover work", "Observe workflows, decisions, information, systems and pain points."],
  ["Baseline", "Measure current performance and assess foundations, risks and dependencies."],
  ["Prioritise", "Select the smallest meaningful use case with viable evidence."],
  ["Design human-AI work", "Allocate responsibilities, approval, escalation, fallback and capability requirements."],
  ["Prepare foundations", "Improve data, knowledge, process, integration, identity, security and governance."],
  ["Prototype", "Build a bounded solution using protected representative information."],
  ["Evaluate", "Test quality, safety, bias, reliability, usability, cost, latency and value."],
  ["Pilot", "Deploy to a controlled user group with monitoring and fallback."],
  ["Adopt", "Train users and managers, redesign habits and support real work."],
  ["Operate", "Monitor performance, cost, incidents, knowledge freshness and access."],
  ["Scale, improve or retire", "Expand only with evidence, or stop systems that fail value or safety criteria."]
];

export const evaluationAreas = [
  ["Functional quality", "Task completion, accuracy, relevance, groundedness, instruction following and tool reliability."],
  ["Safety and responsibility", "Bias, privacy leakage, prompt injection, unauthorised action and misleading certainty."],
  ["Operational quality", "Latency, availability, cost per successful task, retries, integrations and fallback."],
  ["Human experience", "Usefulness, comprehension, calibrated trust, accessibility, verification and correction."],
  ["Business or public value", "Cycle time, rework, quality, service resolution, knowledge reuse and decision quality."],
  ["Risk and harm", "Material error, harmful output, privacy incident, failed appeal, exception and fallback failure."]
];

export const ecosystemMap = [
  ["Prolific Edge", "Enterprise diagnosis, readiness, prescription, blueprint and managed transformation."],
  ["Workplace 4.0", "Human-centred work redesign, Smart Worker capability and responsible automation adoption."],
  ["Spatial Enterprise", "Context-aware workplaces, assets, workflows, digital twins and spatial interfaces."],
  ["Spatial AI City", "Governed analytics, assistants, agents and automation for civic systems."],
  ["DxHubs", "Local demonstrations, readiness support, implementation coordination and skills mobilisation."],
  ["iCampus", "AI literacy, role-based academies, assessment, portfolios and continuous capability."],
  ["WORKGRID LABS", "Applied AI studios, occupational challenges, prototypes and capability evidence."],
  ["VOCLE XR", "AI-enabled immersive learning, simulation, spatial content and evidence environments."]
];
