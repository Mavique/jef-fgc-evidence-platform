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

export type AccountLifecycleState =
  | "Invited"
  | "Registration Started"
  | "Email Verification Pending"
  | "Affiliation Review Pending"
  | "More Information Required"
  | "Active"
  | "Suspended"
  | "Rejected"
  | "Deactivated"
  | "Invitation Expired";

export type OrganisationType = "TVET College" | "merSETA" | "Jengrac Education Foundation" | "EON Reality";

export type RoleAssignment = {
  id: string;
  userId: string;
  role: UserRole;
  organisation: string;
  organisationType: OrganisationType;
  campusScope: string;
  status: "Requested" | "Approved" | "Returned" | "Rejected" | "Expired";
  approver: string;
  effectiveDate: string;
  expiryDate?: string;
};

export type DemoUserProfile = {
  id: string;
  name: string;
  email: string;
  accountState: AccountLifecycleState;
  emailVerified: boolean;
  requestedRole: UserRole;
  landingRoute: string;
  contextLabel: string;
  attentionItems: string[];
  roleAssignments: RoleAssignment[];
};

export type DemoAuthSession = {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  landingRoute: string;
  signedInAt: string;
  isMaster: boolean;
};

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
  status: "Requires confirmation" | "Configured for demo" | "Blocked";
};

export const fgcDemoSessionKey = "jef-fgc-demo-session";

export const demoAdminProfile = {
  userId: "USR-DEMO-ADMIN-001",
  role: "JEF Administrator" as UserRole,
  name: "JEF Demo Administrator",
  email: "admin.demo@jengrac.example",
  landingRoute: "/fgc-ekm"
} as const;

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

export const accountLifecycleStates: AccountLifecycleState[] = [
  "Invited",
  "Registration Started",
  "Email Verification Pending",
  "Affiliation Review Pending",
  "More Information Required",
  "Active",
  "Suspended",
  "Rejected",
  "Deactivated",
  "Invitation Expired"
];

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

const allTwoScores = rubricAreas.map((area): RubricScore => ({ area, score: 2, evidenceNote: "Observed independently under own author account." }));
const supportScores = rubricAreas.map((area, index): RubricScore => ({
  area,
  score: index === 3 || index === 5 ? 1 : 2,
  evidenceNote: index === 3 || index === 5 ? "Prompting recorded; no facilitator execution." : "Completed independently."
}));
const failedScores = rubricAreas.map((area, index): RubricScore => ({
  area,
  score: index === 3 ? 0 : index === 5 ? 1 : 2,
  evidenceNote: index === 3 ? "Facilitator executed publish step; independence invalidated." : "Evidence captured with limitations."
}));

export const evidenceItems: EvidenceItem[] = [
  {
    id: "EVI-Q1-001",
    question: "Q1 Learner Utilisation",
    college: "Demonstration College 01",
    type: "Platform analytics export",
    sourceName: "EON active users by session export v1",
    date: "2026-09-08",
    owner: "EON Analytics Lead",
    qualityStatus: "Verified",
    reviewerNotes: "Matched against timetable and learner register for engineering cohort."
  },
  {
    id: "EVI-Q1-002",
    question: "Q1 Learner Utilisation",
    college: "Demonstration College 02",
    type: "College timetable",
    sourceName: "Workshop timetable and lesson plan pack",
    date: "2026-09-08",
    owner: "College Evidence Owner",
    qualityStatus: "Contradicted",
    reviewerNotes: "Planned activity not present in analytics export for the same time band."
  },
  {
    id: "EVI-Q2-001",
    question: "Q2 Lecturer Capability",
    college: "Demonstration College 01",
    type: "Moderated rubric",
    sourceName: "Independent build challenge rubric A12",
    date: "2026-09-09",
    owner: "Moderator",
    qualityStatus: "Verified",
    reviewerNotes: "Author, publish, assignment and teach-back evidence all linked."
  },
  {
    id: "EVI-Q2-002",
    question: "Q2 Lecturer Capability",
    college: "Demonstration College 03",
    type: "Assistance log",
    sourceName: "Build challenge observation log B07",
    date: "2026-09-09",
    owner: "Assessor",
    qualityStatus: "Partially Verified",
    reviewerNotes: "Technical intervention separated from participant capability."
  },
  {
    id: "EVI-ACT-001",
    question: "Shared",
    college: "Demonstration College 02",
    type: "Corrective-action register",
    sourceName: "30/60/90 activation plan v1",
    date: "2026-09-10",
    owner: "Workshop Lead",
    qualityStatus: "Partially Verified",
    reviewerNotes: "60-day closure evidence still due."
  }
];

export const learnerUseRecords: LearnerUseRecord[] = [
  {
    id: "LU-001",
    college: "Demonstration College 01",
    campus: "Engineering Campus",
    programme: "Engineering Studies",
    cohort: "Fitting N3",
    date: "2026-09-08",
    timeBand: "09:00-11:00",
    context: "Scheduled class",
    activeLearners: 38,
    enrolledLearners: 42,
    evidenceStatus: "Verified",
    evidenceIds: ["EVI-Q1-001"]
  },
  {
    id: "LU-002",
    college: "Demonstration College 02",
    campus: "Central Campus",
    programme: "Automotive",
    cohort: "Level 2",
    date: "2026-09-08",
    timeBand: "11:00-13:00",
    context: "Scheduled class",
    activeLearners: null,
    enrolledLearners: 31,
    evidenceStatus: "Contradicted",
    evidenceIds: ["EVI-Q1-002"],
    contradiction: "Timetable indicates use, but analytics export contains no matching learner activity."
  },
  {
    id: "LU-003",
    college: "Demonstration College 03",
    campus: "Skills Centre",
    programme: "Electrical",
    cohort: "N2",
    date: "2026-09-09",
    timeBand: "After-hours",
    context: "Independent study",
    activeLearners: 11,
    enrolledLearners: 35,
    evidenceStatus: "Partially Verified",
    evidenceIds: ["EVI-Q1-001"]
  },
  {
    id: "LU-004",
    college: "Demonstration College 04",
    campus: "Main Campus",
    programme: "Mechatronics",
    cohort: "Pilot group",
    date: "2026-09-09",
    timeBand: "Unknown",
    context: "No meaningful use",
    activeLearners: null,
    enrolledLearners: 28,
    evidenceStatus: "Not Verified",
    evidenceIds: []
  }
];

export const lecturerAssessments: LecturerAssessment[] = [
  {
    id: "AS-001",
    college: "Demonstration College 01",
    campus: "Engineering Campus",
    lecturer: "Lecturer A",
    programme: "Engineering Studies",
    date: "2026-09-09",
    experienceTitle: "Hydraulic Safety Procedure",
    eonUrl: "EON-DEMO-001",
    scores: allTwoScores,
    assistanceType: "None",
    facilitatorExecuted: false,
    environmentFault: false,
    moderation: "Confirmed",
    evidenceIds: ["EVI-Q2-001"]
  },
  {
    id: "AS-002",
    college: "Demonstration College 02",
    campus: "Central Campus",
    lecturer: "Lecturer B",
    programme: "Automotive",
    date: "2026-09-09",
    experienceTitle: "Engine Component Identification",
    eonUrl: "EON-DEMO-002",
    scores: supportScores,
    assistanceType: "Prompting",
    facilitatorExecuted: false,
    environmentFault: false,
    moderation: "Pending",
    evidenceIds: ["EVI-Q2-002"]
  },
  {
    id: "AS-003",
    college: "Demonstration College 03",
    campus: "Skills Centre",
    lecturer: "Lecturer C",
    programme: "Electrical",
    date: "2026-09-09",
    experienceTitle: "Circuit Fault Finding",
    eonUrl: "EON-DEMO-003",
    scores: failedScores,
    assistanceType: "Facilitator Execution",
    facilitatorExecuted: true,
    environmentFault: false,
    moderation: "Changed",
    evidenceIds: ["EVI-Q2-002"]
  },
  {
    id: "AS-004",
    college: "Demonstration College 04",
    campus: "Main Campus",
    lecturer: "Lecturer D",
    programme: "Mechatronics",
    date: "2026-09-09",
    experienceTitle: "PLC Sequence Simulation",
    eonUrl: "Pending",
    scores: [],
    assistanceType: "Technical Intervention",
    facilitatorExecuted: false,
    environmentFault: true,
    moderation: "Reassessment Requested",
    evidenceIds: []
  }
];

export const correctiveActions: CorrectiveAction[] = [
  {
    id: "ACT-001",
    college: "Demonstration College 02",
    issue: "Timetable activity contradicted by analytics",
    category: "Timetable",
    rootCause: "Scheduled lab period was not mapped to active learner accounts.",
    action: "Evidence owner and EON Analytics Lead reconcile learner group, assignment and licence activation records.",
    owner: "College Evidence Owner",
    priority: "High",
    dueDate: "2026-10-09",
    status: "In Progress",
    closureEvidence: "Reconciled export and updated learner register"
  },
  {
    id: "ACT-002",
    college: "Demonstration College 03",
    issue: "Publishing workflow required facilitator execution",
    category: "Capability",
    rootCause: "Lecturer could not independently publish and assign the experience.",
    action: "Targeted reinforcement clinic followed by moderated reassessment within 30 days.",
    owner: "XR Ambassador",
    priority: "Critical",
    dueDate: "2026-10-10",
    status: "Not Started",
    closureEvidence: "Reassessment rubric and publish proof"
  },
  {
    id: "ACT-003",
    college: "Demonstration College 04",
    issue: "Missing analytics access",
    category: "Account",
    rootCause: "Analytics export permission not available during workshop.",
    action: "Confirm official export scope, extraction date and field definitions.",
    owner: "EON Analytics Lead",
    priority: "Medium",
    dueDate: "2026-11-08",
    status: "Overdue",
    closureEvidence: "Versioned analytics export"
  }
];

export const decisionRegister: DecisionItem[] = [
  {
    id: "DEC-001",
    decision: "Approved route or subdomain",
    currentDefault: "/programmes/merseta-fgc-ekm and /fgc-ekm",
    productionOwner: "JEF Administrator / merSETA Oversight",
    status: "Requires confirmation"
  },
  {
    id: "DEC-002",
    decision: "EON API availability, fields and definitions",
    currentDefault: "CSV/XLSX export adapter in mock mode",
    productionOwner: "EON Analytics Lead",
    status: "Requires confirmation"
  },
  {
    id: "DEC-003",
    decision: "Critical rubric steps and Support Required threshold",
    currentDefault: "Facilitator execution always overrides aggregate score",
    productionOwner: "Workshop Lead / Moderator",
    status: "Requires confirmation"
  },
  {
    id: "DEC-004",
    decision: "POPIA retention and de-identification rules",
    currentDefault: "Learners de-identified in national views",
    productionOwner: "merSETA Oversight",
    status: "Requires confirmation"
  }
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
  { route: "/fgc-ekm/college/demo-college-01/overview", group: "College workspace", title: "College overview", access: "Protected", primaryRole: "College Lead Admin" },
  { route: "/fgc-ekm/college/demo-college-01/affiliation-requests", group: "College workspace", title: "Affiliation requests", access: "Protected", primaryRole: "College Lead Admin" },
  { route: "/fgc-ekm/workshops/demo-workshop/control-room", group: "Workshop operations", title: "Workshop control room", access: "Protected", primaryRole: "Workshop Lead" },
  { route: "/fgc-ekm/assessments/challenges", group: "Lecturer assessment", title: "Build challenges", access: "Protected", primaryRole: "Assessor" },
  { route: "/fgc-ekm/moderation", group: "Lecturer assessment", title: "Moderation workbench", access: "Protected", primaryRole: "Moderator" },
  { route: "/fgc-ekm/merseta", group: "National oversight", title: "merSETA oversight", access: "Protected", primaryRole: "merSETA Oversight" },
  { route: "/fgc-ekm/national/observatory", group: "National oversight", title: "National observatory", access: "Protected", primaryRole: "merSETA Oversight" },
  { route: "/fgc-ekm/admin/access-requests", group: "Administration", title: "Access requests", access: "Protected", primaryRole: "JEF Administrator" },
  { route: "/fgc-ekm/admin/users-roles", group: "Administration", title: "Users and roles", access: "Protected", primaryRole: "JEF Administrator" },
  { route: "/fgc-ekm/admin/system", group: "Administration", title: "System governance", access: "Protected", primaryRole: "JEF Administrator" },
  { route: "/fgc-ekm/admin/audit-log", group: "Administration", title: "Audit log", access: "Protected", primaryRole: "JEF Administrator" }
];

export const demoUserProfiles: DemoUserProfile[] = [
  {
    id: demoAdminProfile.userId,
    name: demoAdminProfile.name,
    email: demoAdminProfile.email,
    accountState: "Active",
    emailVerified: true,
    requestedRole: demoAdminProfile.role,
    landingRoute: demoAdminProfile.landingRoute,
    contextLabel: "JEF Administrator - National operational scope",
    attentionItems: ["Review access requests", "Monitor national evidence quality", "Prepare PostgreSQL-backed role governance"],
    roleAssignments: [
      {
        id: "RA-DEMO-ADMIN-001",
        userId: demoAdminProfile.userId,
        role: demoAdminProfile.role,
        organisation: "Jengrac Education Foundation",
        organisationType: "Jengrac Education Foundation",
        campusScope: "National operational scope",
        status: "Approved",
        approver: "Demo fixture",
        effectiveDate: "2026-09-01"
      }
    ]
  },
  {
    id: "USR-LECTURER-001",
    name: "Lecturer A",
    email: "lecturer.a@demo-college.example",
    accountState: "Active",
    emailVerified: true,
    requestedRole: "Lecturer",
    landingRoute: "/fgc-ekm/my-dashboard",
    contextLabel: "Lecturer - Demonstration College 01 - Engineering Campus",
    attentionItems: ["Continue Data Capture", "Upload assignment proof", "Review returned evidence note"],
    roleAssignments: [
      {
        id: "RA-LECTURER-001",
        userId: "USR-LECTURER-001",
        role: "Lecturer",
        organisation: "Demonstration College 01",
        organisationType: "TVET College",
        campusScope: "Engineering Campus",
        status: "Approved",
        approver: "College Lead Admin",
        effectiveDate: "2026-09-01"
      }
    ]
  },
  {
    id: "USR-LEAD-001",
    name: "College Lead Admin",
    email: "lead.admin@demo-college.example",
    accountState: "Active",
    emailVerified: true,
    requestedRole: "College Lead Admin",
    landingRoute: "/fgc-ekm/college/demo-college-01/overview",
    contextLabel: "College Lead Admin - Demonstration College 01 - All authorised campuses",
    attentionItems: ["Review 3 lecturer affiliation requests", "Return incomplete timetable evidence", "Send 60-day reminder"],
    roleAssignments: [
      {
        id: "RA-LEAD-001",
        userId: "USR-LEAD-001",
        role: "College Lead Admin",
        organisation: "Demonstration College 01",
        organisationType: "TVET College",
        campusScope: "All authorised campuses",
        status: "Approved",
        approver: "JEF Administrator",
        effectiveDate: "2026-09-01"
      }
    ]
  },
  {
    id: "USR-MERSETA-001",
    name: "merSETA Oversight User",
    email: "oversight@merseta.example",
    accountState: "Active",
    emailVerified: true,
    requestedRole: "merSETA Oversight",
    landingRoute: "/fgc-ekm/national/observatory",
    contextLabel: "merSETA Oversight - National FGC scope",
    attentionItems: ["Review national coverage caveat", "Check overdue corrective actions", "Open evidence health strip"],
    roleAssignments: [
      {
        id: "RA-MERSETA-001",
        userId: "USR-MERSETA-001",
        role: "merSETA Oversight",
        organisation: "merSETA",
        organisationType: "merSETA",
        campusScope: "National programme scope",
        status: "Approved",
        approver: "Designated system owner",
        effectiveDate: "2026-09-01"
      }
    ]
  },
  {
    id: "USR-PENDING-001",
    name: "Pending Lecturer",
    email: "pending.lecturer@demo-college.example",
    accountState: "Affiliation Review Pending",
    emailVerified: true,
    requestedRole: "Lecturer",
    landingRoute: "/fgc-ekm/access-pending",
    contextLabel: "Pending Lecturer - Demonstration College 02 - Campus approval required",
    attentionItems: ["Await college affiliation approval", "No protected dashboard access yet"],
    roleAssignments: [
      {
        id: "RA-PENDING-001",
        userId: "USR-PENDING-001",
        role: "Lecturer",
        organisation: "Demonstration College 02",
        organisationType: "TVET College",
        campusScope: "Central Campus",
        status: "Requested",
        approver: "College Lead Admin or JEF programme administrator",
        effectiveDate: "Pending"
      }
    ]
  }
];

export function canAccessProtectedData(profile: Pick<DemoUserProfile, "accountState" | "emailVerified" | "roleAssignments">) {
  return profile.accountState === "Active" && profile.emailVerified && profile.roleAssignments.some((assignment) => assignment.status === "Approved");
}

export function resolveRoleHome(profile: DemoUserProfile) {
  if (!canAccessProtectedData(profile)) return "/fgc-ekm/access-pending";
  return profile.landingRoute;
}
