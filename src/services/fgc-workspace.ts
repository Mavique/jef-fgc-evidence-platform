import {
  classifyAssessment,
  type AssistanceType,
  type CorrectiveAction,
  type EvidenceItem,
  type EvidenceStatus,
  type LearnerUseRecord,
  type LecturerAssessment,
  type RubricArea,
  type RubricScore
} from "@/content/merseta-fgc";
import type { CampusReference, CollegeReference, ProgrammeLevelReference, ProgrammeReference, SubjectReference } from "@/content/fgc-reference-data";
import type { ObservatorySnapshot } from "@/services/merseta-fgc";

export const fgcWorkspaceStorageKey = "jef-fgc-workspace-v1";
export const fgcCaptureDraftStorageKey = "jef-fgc-capture-draft-v1";

export type CaptureDraft = Record<string, string>;

export type CaptureContext = {
  selectedCollege?: CollegeReference;
  selectedCampus?: CampusReference;
  selectedProgramme?: ProgrammeReference;
  selectedLevel?: ProgrammeLevelReference;
  selectedSubjects: SubjectReference[];
};

export type FgcReferenceDataRequest = {
  id: string;
  requestType: "PROGRAMME" | "SUBJECT" | "MODULE" | "QUALIFICATION" | "CAMPUS_MAPPING";
  status: "PENDING_REVIEW" | "MAPPED_TO_EXISTING" | "APPROVED_CREATED" | "REJECTED" | "CLARIFICATION_REQUESTED";
  programmeName: string;
  subjectOrModuleName: string;
  qualificationType: string;
  levelLabel: string;
  evidenceLocation: string;
  campus: string;
  submittedAt: string;
};

export type FgcAuditEvent = {
  id: string;
  action: string;
  actor: string;
  detail: string;
  createdAt: string;
};

export type FgcWorkspaceState = ObservatorySnapshot & {
  referenceRequests: FgcReferenceDataRequest[];
  auditEvents: FgcAuditEvent[];
  lastUpdatedAt: string;
};

function nextNumber(items: Array<{ id: string }>, prefix: string) {
  const max = items.reduce((highest, item) => {
    const value = Number(item.id.replace(prefix, "").replace(/[^0-9]/g, ""));
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 0);
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

function parseCount(value: string | undefined) {
  const count = Number(value);
  return Number.isFinite(count) ? count : null;
}

function questionFromSupport(value: string | undefined): EvidenceItem["question"] {
  if (value?.toLowerCase().includes("q2")) return "Q2 Lecturer Capability";
  if (value?.toLowerCase().includes("shared")) return "Shared";
  return "Q1 Learner Utilisation";
}

function qualityStatus(value: string | undefined): EvidenceStatus {
  if (value === "Verified" || value === "Partially Verified" || value === "Not Verified" || value === "Contradicted") return value;
  return "Partially Verified";
}

function assistanceType(value: string | undefined): AssistanceType {
  if (value === "None" || value === "Clarification" || value === "Prompting" || value === "Technical Intervention" || value === "Facilitator Execution") return value;
  return "None";
}

function rubricScore(area: RubricArea, value: string | undefined): RubricScore {
  const parsed = Number(value?.slice(0, 1));
  const score = parsed === 0 || parsed === 1 || parsed === 2 ? parsed : 2;
  return {
    area,
    score,
    evidenceNote: value ?? "No rubric note captured."
  };
}

function firstNonEmpty(...values: Array<string | undefined>) {
  return values.find((value) => value?.trim())?.trim() ?? "";
}

export function hydrateWorkspace(base: ObservatorySnapshot, stored?: Partial<FgcWorkspaceState> | null): FgcWorkspaceState {
  return {
    ...base,
    evidence: stored?.evidence ?? base.evidence,
    learnerUse: stored?.learnerUse ?? base.learnerUse,
    assessments: stored?.assessments ?? base.assessments,
    actions: stored?.actions ?? base.actions,
    decisions: stored?.decisions ?? base.decisions,
    permissions: stored?.permissions ?? base.permissions,
    referenceRequests: stored?.referenceRequests ?? [],
    auditEvents: stored?.auditEvents ?? [],
    lastUpdatedAt: stored?.lastUpdatedAt ?? new Date().toISOString()
  };
}

export function createCaptureSubmission(
  current: FgcWorkspaceState,
  draft: CaptureDraft,
  context: CaptureContext,
  actor = "FGC user"
): FgcWorkspaceState {
  const now = new Date().toISOString();
  const college = context.selectedCollege?.officialName ?? firstNonEmpty(draft.college, "Unscoped college");
  const campus = context.selectedCampus?.officialName ?? firstNonEmpty(draft.campus, "Unscoped campus");
  const programme = context.selectedProgramme?.title ?? firstNonEmpty(draft.programme, draft.requestedProgramme, "Unmapped programme");
  const level = context.selectedLevel?.label ?? draft.programmeLevel ?? "";
  const evidenceId = nextNumber(current.evidence, "EVI-USER-");
  const learnerRecordId = nextNumber(current.learnerUse, "LU-USER-");
  const assessmentId = nextNumber(current.assessments, "AS-USER-");
  const actionId = nextNumber(current.actions, "ACT-USER-");

  const evidenceStatus = qualityStatus(draft.qualityStatus);
  const evidenceItem: EvidenceItem = {
    id: evidenceId,
    question: questionFromSupport(draft.supportsQuestion),
    college,
    type: firstNonEmpty(draft.evidenceType, "User captured evidence"),
    sourceName: firstNonEmpty(draft.sourceName, draft.analyticsReference, "User captured evidence package"),
    date: firstNonEmpty(draft.sourceDate, draft.useDate, now.slice(0, 10)),
    owner: firstNonEmpty(draft.owner, draft.signoffOwner, actor),
    qualityStatus: evidenceStatus,
    reviewerNotes: firstNonEmpty(draft.reviewerNotes, draft.limitations, "Captured through the FGC product workspace.")
  };

  const learnerUse: LearnerUseRecord = {
    id: learnerRecordId,
    college,
    campus,
    programme: [programme, level].filter(Boolean).join(" - "),
    cohort: firstNonEmpty(draft.cohort, context.selectedSubjects.map((subject) => subject.name).join(", "), "Unspecified cohort"),
    date: firstNonEmpty(draft.useDate, now.slice(0, 10)),
    timeBand: `${firstNonEmpty(draft.startTime, "--:--")}-${firstNonEmpty(draft.endTime, "--:--")}`,
    context: firstNonEmpty(draft.useContext, "Scheduled class"),
    activeLearners: parseCount(draft.activeLearners),
    enrolledLearners: parseCount(draft.enrolledLearners),
    evidenceStatus,
    evidenceIds: [evidenceId],
    contradiction: evidenceStatus === "Contradicted" ? firstNonEmpty(draft.issue, "Captured evidence indicates an unresolved contradiction.") : undefined
  };

  const scores = current.assessments[0]?.scores.map((score) => rubricScore(score.area, draft[`rubric-${score.area}`])) ?? [];
  const assessment: LecturerAssessment = {
    id: assessmentId,
    college,
    campus,
    lecturer: firstNonEmpty(draft.lecturer, actor),
    programme: [programme, level].filter(Boolean).join(" - "),
    date: firstNonEmpty(draft.useDate, now.slice(0, 10)),
    experienceTitle: firstNonEmpty(draft.experienceTitle, "Captured EON experience"),
    eonUrl: firstNonEmpty(draft.eonId, "Pending"),
    scores,
    assistanceType: assistanceType(draft.assistance),
    facilitatorExecuted: draft.facilitatorExecuted === "Yes",
    environmentFault: draft.environmentFault !== "No environment fault",
    moderation: "Pending",
    evidenceIds: [evidenceId]
  };

  const nextActions: CorrectiveAction[] = [...current.actions];
  if (draft.issue?.trim() || draft.action?.trim()) {
    nextActions.unshift({
      id: actionId,
      college,
      issue: firstNonEmpty(draft.issue, "Captured follow-up required"),
      category: firstNonEmpty(draft.issueCategory, "Evidence quality"),
      rootCause: firstNonEmpty(draft.rootCause, "Root cause pending review."),
      action: firstNonEmpty(draft.action, "Administrator review required."),
      owner: firstNonEmpty(draft.actionOwner, draft.owner, actor),
      priority: draft.priority === "Critical" || draft.priority === "High" || draft.priority === "Medium" || draft.priority === "Low" ? draft.priority : "Medium",
      dueDate: firstNonEmpty(draft.dueDate, now.slice(0, 10)),
      status: "Not Started",
      closureEvidence: firstNonEmpty(draft.closureEvidence, "Closure evidence pending definition.")
    });
  }

  const referenceRequests = [...current.referenceRequests];
  if (draft.requestedProgramme?.trim() || draft.requestedSubject?.trim()) {
    referenceRequests.unshift({
      id: nextNumber(referenceRequests, "REF-REQ-"),
      requestType: draft.requestedSubject?.trim() ? "SUBJECT" : "PROGRAMME",
      status: "PENDING_REVIEW",
      programmeName: firstNonEmpty(draft.requestedProgramme, programme),
      subjectOrModuleName: firstNonEmpty(draft.requestedSubject),
      qualificationType: firstNonEmpty(draft.requestedQualificationType),
      levelLabel: firstNonEmpty(draft.requestedLevel, level),
      evidenceLocation: firstNonEmpty(draft.requestedEvidence),
      campus,
      submittedAt: now
    });
  }

  return {
    ...current,
    evidence: [evidenceItem, ...current.evidence],
    learnerUse: [learnerUse, ...current.learnerUse],
    assessments: [assessment, ...current.assessments],
    actions: nextActions,
    referenceRequests,
    auditEvents: [
      {
        id: nextNumber(current.auditEvents, "AUD-"),
        action: "CAPTURE_PACKAGE_SUBMITTED",
        actor,
        detail: `${college} / ${campus} / ${programme} captured. Lecturer classification: ${classifyAssessment(assessment)}.`,
        createdAt: now
      },
      ...current.auditEvents
    ],
    lastUpdatedAt: now
  };
}

export function updateActionStatus(current: FgcWorkspaceState, actionId: string, status: CorrectiveAction["status"], actor = "FGC user"): FgcWorkspaceState {
  const now = new Date().toISOString();
  return {
    ...current,
    actions: current.actions.map((action) => action.id === actionId ? { ...action, status } : action),
    auditEvents: [
      {
        id: nextNumber(current.auditEvents, "AUD-"),
        action: "CORRECTIVE_ACTION_STATUS_UPDATED",
        actor,
        detail: `${actionId} moved to ${status}.`,
        createdAt: now
      },
      ...current.auditEvents
    ],
    lastUpdatedAt: now
  };
}

export function exportWorkspace(state: FgcWorkspaceState) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      reportingPeriod: state.scope.reportingPeriod,
      counts: {
        evidence: state.evidence.length,
        learnerUse: state.learnerUse.length,
        assessments: state.assessments.length,
        actions: state.actions.length,
        referenceRequests: state.referenceRequests.length,
        auditEvents: state.auditEvents.length
      },
      state
    },
    null,
    2
  );
}
