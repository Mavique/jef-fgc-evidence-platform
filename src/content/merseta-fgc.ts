export type EvidenceStatus = "Verified" | "Partially Verified" | "Not Verified" | "Contradicted";

export type CapabilityClassification =
  | "Independent"
  | "Partially Independent / Support Required"
  | "Not Yet Demonstrated"
  | "Not Assessed";

export type AssistanceType = "None" | "Clarification" | "Prompting" | "Technical Intervention" | "Facilitator Execution";

export type UserRole =
  | "College Evidence Owner"
  | "College Lead Admin"
  | "Lecturer"
  | "XR Ambassador"
  | "Assessor"
  | "Moderator"
  | "Workshop Lead"
  | "Evidence Lead"
  | "JEF Administrator"
  | "merSETA Oversight"
  | "EON Analytics Lead"
  | "Executive Viewer";

export type FgcRouteDefinition = {
  route: string;
  group: "Public" | "Secure common" | "College workspace" | "Workshop operations" | "Lecturer assessment" | "National oversight" | "Administration";
  title: string;
  access: "Public" | "Protected" | "Pending-only";
  primaryRole?: UserRole;
};

export type RubricArea =
  | "Curriculum relevance"
  | "Experience creation"
  | "Platform organisation"
  | "Publishing and deployment"
  | "Teaching application"
  | "Learner evidence and analytics"
  | "Troubleshooting and repeatability";

export type RubricScore = {
  area: RubricArea;
  score: 0 | 1 | 2;
  evidenceNote: string;
};

export type EvidenceItem = {
  id: string;
  question: "Q1 Learner Utilisation" | "Q2 Lecturer Capability" | "Shared";
  college: string;
  type: string;
  sourceName: string;
  date: string;
  owner: string;
  qualityStatus: EvidenceStatus;
  reviewerNotes: string;
};

export type LearnerUseRecord = {
  id: string;
  college: string;
  campus: string;
  programme: string;
  cohort: string;
  date: string;
  timeBand: string;
  context: string;
  activeLearners: number | null;
  enrolledLearners: number | null;
  evidenceStatus: EvidenceStatus;
  evidenceIds: string[];
  contradiction?: string;
};

export type LecturerAssessment = {
  id: string;
  college: string;
  campus: string;
  lecturer: string;
  programme: string;
  date: string;
  experienceTitle: string;
  eonUrl: string;
  scores: RubricScore[];
  assistanceType: AssistanceType;
  facilitatorExecuted: boolean;
  environmentFault: boolean;
  moderation: "Pending" | "Confirmed" | "Changed" | "Reassessment Requested";
  evidenceIds: string[];
};

export type CorrectiveAction = {
  id: string;
  college: string;
  issue: string;
  category: string;
  rootCause: string;
  action: string;
  owner: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  dueDate: string;
  status: "Not Started" | "In Progress" | "Complete" | "Overdue";
  closureEvidence: string;
};

export type DecisionItem = {
  id: string;
  decision: string;
  currentDefault: string;
  productionOwner: string;
  status: "Requires confirmation" | "Configured" | "Blocked";
};

export const fgcProduct = {
  name: "merSETA FGC for EKM",
  descriptor: "Evidence Validation & Adoption Intelligence Platform",
  publicRoute: "/programmes/merseta-fgc-ekm",
  appRoute: "/fgc-ekm",
  sourceDocs: [
    "EON Workshop Agenda SEPT 2026 - FGC Evidence Validation.pdf",
    "merSETA EON FGC Evidence Tracker - September 2026.xlsx",
    "merSETA EON FGC Evidence Validation Toolkit - September 2026.pdf",
    "merSETA EON FGC Evidence Validation Workshop Facilitator Guide - September 2026.pdf"
  ],
  governingQuestions: [
    "When are learners using the EON-XR platform?",
    "Do college lecturers know how to independently create, publish, assign and demonstrate curriculum-relevant experiences on the EON-XR platform?"
  ]
} as const;

export const evidenceStatuses: Record<EvidenceStatus, { tone: string; explanation: string }> = {
  Verified: {
    tone: "bg-lime text-ink ring-lime/40",
    explanation: "Sufficient, traceable and internally consistent evidence exists."
  },
  "Partially Verified": {
    tone: "bg-amber text-ink ring-amber/40",
    explanation: "Relevant evidence exists, but a material gap remains."
  },
  "Not Verified": {
    tone: "bg-white/[0.1] text-paper ring-white/[0.18]",
    explanation: "Required evidence is absent, inaccessible, unreliable or outside scope."
  },
  Contradicted: {
    tone: "bg-rose-300 text-ink ring-rose-300/40",
    explanation: "Sources disagree and the discrepancy remains unresolved."
  }
};

export function classifyAssessment(assessment: Pick<LecturerAssessment, "scores" | "facilitatorExecuted">): CapabilityClassification {
  if (assessment.scores.length === 0) return "Not Assessed";
  if (assessment.facilitatorExecuted) return "Not Yet Demonstrated";
  if (assessment.scores.every((score) => score.score === 2)) return "Independent";
  if (assessment.scores.some((score) => score.score === 0)) return "Not Yet Demonstrated";
  return "Partially Independent / Support Required";
}

export function totalRubricScore(scores: RubricScore[]) {
  return scores.reduce((sum, score) => sum + score.score, 0);
}

export const rubricAreas: RubricArea[] = [
  "Curriculum relevance",
  "Experience creation",
  "Platform organisation",
  "Publishing and deployment",
  "Teaching application",
  "Learner evidence and analytics",
  "Troubleshooting and repeatability"
];

export const lifecycleStages = [
  "Programme Configuration",
  "Pre-Work Evidence Readiness",
  "Registration and Scope Lock",
  "Learner-Use Evidence Ingestion",
  "Triangulation Workspace",
  "Learner Utilisation Map",
  "Learner and Lecturer Voice",
  "Root-Cause and Activation Planning",
  "Independent Build Challenge",
  "Assessment and Moderation",
  "Consolidation and Sign-Off",
  "Post-Workshop Follow-Through"
] as const;

export const rolePermissions: Record<UserRole, string[]> = {
  "College Evidence Owner": ["Upload college records", "Validate proposed learner-use findings", "Submit 30/60/90 plans"],
  "College Lead Admin": ["Approve college affiliations", "Invite lecturers", "Monitor authorised campus evidence"],
  Lecturer: ["View assigned challenge", "Submit EON URL/ID", "View moderated feedback"],
  "XR Ambassador": ["Track reinforcement", "Upload intervention evidence", "Coordinate support routes"],
  Assessor: ["Observe build challenge", "Score rubric", "Log assistance and environment faults"],
  Moderator: ["Review borderline cases", "Lock moderated results", "Request reassessment"],
  "Workshop Lead": ["Control session gates", "Freeze findings", "Confirm scope and definitions"],
  "Evidence Lead": ["Index evidence", "Quality-check sources", "Control version history"],
  "JEF Administrator": ["Administer workflow", "Monitor data quality", "Support reporting"],
  "merSETA Oversight": ["Review national findings", "Check evidence-backed actions", "Control final decisions within mandate"],
  "EON Analytics Lead": ["Supply analytics exports", "Document source limitations", "Acknowledge relevant findings"],
  "Executive Viewer": ["View approved summaries", "Review limitations", "Open governed reports"]
};

export const fgcRouteDefinitions: FgcRouteDefinition[] = [
  { route: "/fgc-ekm/sign-up", group: "Public", title: "Sign up", access: "Public" },
  { route: "/fgc-ekm/confirm-email", group: "Public", title: "Confirm your email", access: "Public" },
  { route: "/fgc-ekm/verification-pending", group: "Public", title: "Verification pending", access: "Pending-only" },
  { route: "/fgc-ekm/sign-in", group: "Public", title: "Sign in", access: "Public" },
  { route: "/fgc-ekm/forgot-password", group: "Public", title: "Forgot password", access: "Public" },
  { route: "/fgc-ekm/reset-password", group: "Public", title: "Reset password", access: "Public" },
  { route: "/fgc-ekm/access-pending", group: "Public", title: "Access pending", access: "Pending-only" },
  { route: "/fgc-ekm/accessibility", group: "Public", title: "Accessibility", access: "Public" },
  { route: "/fgc-ekm/privacy", group: "Public", title: "Privacy", access: "Public" },
  { route: "/fgc-ekm/help", group: "Public", title: "Help", access: "Public" },
  { route: "/fgc-ekm/home", group: "Secure common", title: "Role-aware home", access: "Protected" },
  { route: "/fgc-ekm/my-account", group: "Secure common", title: "My account", access: "Protected" },
  { route: "/fgc-ekm/my-affiliations", group: "Secure common", title: "My affiliations", access: "Protected" },
  { route: "/fgc-ekm/tasks", group: "Secure common", title: "Tasks", access: "Protected" },
  { route: "/fgc-ekm/notifications", group: "Secure common", title: "Notifications", access: "Protected" },
  { route: "/fgc-ekm/reports", group: "Secure common", title: "Reports", access: "Protected" },
  { route: "/fgc-ekm/data-capturer", group: "College workspace", title: "Data Capturer Portal", access: "Protected", primaryRole: "Lecturer" },
  { route: "/fgc-ekm/my-dashboard", group: "College workspace", title: "Lecturer My Dashboard", access: "Protected", primaryRole: "Lecturer" },
  { route: "/fgc-ekm/college/overview", group: "College workspace", title: "College overview", access: "Protected", primaryRole: "College Lead Admin" },
  { route: "/fgc-ekm/college/affiliation-requests", group: "College workspace", title: "Affiliation requests", access: "Protected", primaryRole: "College Lead Admin" },
  { route: "/fgc-ekm/workshops/control-room", group: "Workshop operations", title: "Workshop control room", access: "Protected", primaryRole: "Workshop Lead" },
  { route: "/fgc-ekm/assessments/challenges", group: "Lecturer assessment", title: "Build challenges", access: "Protected", primaryRole: "Assessor" },
  { route: "/fgc-ekm/moderation", group: "Lecturer assessment", title: "Moderation workbench", access: "Protected", primaryRole: "Moderator" },
  { route: "/fgc-ekm/merseta", group: "National oversight", title: "merSETA oversight", access: "Protected", primaryRole: "merSETA Oversight" },
  { route: "/fgc-ekm/national/observatory", group: "National oversight", title: "National observatory", access: "Protected", primaryRole: "merSETA Oversight" },
  { route: "/fgc-ekm/admin/access-requests", group: "Administration", title: "Access requests", access: "Protected", primaryRole: "JEF Administrator" },
  { route: "/fgc-ekm/admin/users-roles", group: "Administration", title: "Users and roles", access: "Protected", primaryRole: "JEF Administrator" },
  { route: "/fgc-ekm/admin/system", group: "Administration", title: "System governance", access: "Protected", primaryRole: "JEF Administrator" },
  { route: "/fgc-ekm/admin/audit-log", group: "Administration", title: "Audit log", access: "Protected", primaryRole: "JEF Administrator" }
];
