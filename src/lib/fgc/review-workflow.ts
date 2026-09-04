import { FgcValidationError } from "@/lib/fgc/api";
import { fgcQuery, withFgcTransaction } from "@/lib/fgc/db";
import type { FgcCurrentUserResult } from "@/lib/fgc/current-user";

type Access = Extract<FgcCurrentUserResult, { ok: true }>;
type Query = typeof fgcQuery;
export type ReviewAssignmentType = "ASSESSOR" | "MODERATOR";
export type AssignmentState = "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "REVOKED" | "SUPERSEDED";

export class FgcReviewWorkflowError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = "FgcReviewWorkflowError";
  }
}

type AssignmentRow = {
  id: string;
  submission_id: string;
  submission_version_id: string;
  assignment_type: ReviewAssignmentType;
  assignee_user_id: string;
  status: AssignmentState;
  assigned_at: string;
  started_at: string | null;
  due_at: string | null;
  completed_at: string | null;
  reason: string;
  concurrency_version: number;
  submission_reference: string;
  lecturer_name: string;
  college_name: string | null;
  campus_name: string | null;
  programme_name: string | null;
  reporting_period_name: string | null;
  submission_status: string;
  current_version: number;
  updated_at: string;
  evidence_count: string;
  evidence_pending_count: string;
};

type ReviewCase = AssignmentRow & {
  submission_snapshot: Record<string, unknown>;
  assessor_review_id: string | null;
  assessor_review_status: string | null;
  assessor_decisions: Record<string, unknown> | null;
  assessor_rationale: string | null;
  assessor_submitted_at: string | null;
  moderation_record_id: string | null;
  moderation_status: string | null;
  moderation_outcome: Record<string, unknown> | null;
  moderation_reason: string | null;
};

function roleCode(access: Access) {
  return access.access.activeRole?.code ?? null;
}

function requireJef(access: Access) {
  if (access.access.accessState !== "JEF_ADMIN_ACTIVE" || roleCode(access) !== "JEF_ADMINISTRATOR") {
    throw new FgcReviewWorkflowError(403, "FGC_ASSIGNMENT_ADMIN_REQUIRED", "An approved JEF Administrator role is required for assignment governance.");
  }
  if (!access.access.activeRole?.collegeId) {
    throw new FgcReviewWorkflowError(403, "FGC_ASSIGNMENT_SCOPE_REQUIRED", "A scoped institution role is required for assignment governance.");
  }
}

function requireWorker(access: Access, type: ReviewAssignmentType) {
  const expected = type === "ASSESSOR" ? "ASSESSOR_ACTIVE" : "MODERATOR_ACTIVE";
  if (access.access.accessState !== expected) {
    throw new FgcReviewWorkflowError(403, "FGC_REVIEW_ROLE_REQUIRED", `An approved ${type.toLowerCase()} role is required for this operation.`);
  }
}

function assignmentType(value: string | null | undefined): ReviewAssignmentType {
  if (value === "ASSESSOR" || value === "MODERATOR") return value;
  throw new FgcValidationError(400, "FGC_REVIEW_ASSIGNMENT_TYPE_INVALID", "Select an assessor or moderator assignment type.");
}

function requiredReason(reason: string | undefined, code: string) {
  if (!reason || reason.trim().length < 8) throw new FgcValidationError(400, code, "Provide a meaningful reason of at least 8 characters.");
  return reason.trim();
}

function validateReviewPayload(value: Record<string, unknown>, code: string) {
  const forbidden = new Set(["__proto__", "prototype", "constructor"]);
  let keys = 0;
  function visit(item: unknown, depth: number): void {
    if (depth > 6) throw new FgcValidationError(422, code, "The structured review payload is too deeply nested.");
    if (Array.isArray(item)) {
      if (item.length > 100) throw new FgcValidationError(422, code, "The structured review payload is too large.");
      for (const child of item) visit(child, depth + 1);
      return;
    }
    if (!item || typeof item !== "object") return;
    for (const [key, child] of Object.entries(item)) {
      if (forbidden.has(key) || ++keys > 200) throw new FgcValidationError(422, code, "The structured review payload contains unsupported fields.");
      visit(child, depth + 1);
    }
  }
  visit(value, 0);
  const encoded = JSON.stringify(value);
  if (!encoded || encoded.length > 64 * 1024) throw new FgcValidationError(422, code, "The structured review payload is too large.");
  return value;
}

function submissionScope(access: Access) {
  const role = access.access.activeRole;
  if (!role?.collegeId) throw new FgcReviewWorkflowError(403, "FGC_ASSIGNMENT_SCOPE_REQUIRED", "A scoped institution role is required for this operation.");
  return role.campusId
    ? { sql: "ps.college_id = $2 AND ps.campus_id = $3", values: [access.user.id, role.collegeId, role.campusId] }
    : { sql: "ps.college_id = $2", values: [access.user.id, role.collegeId] };
}

function mapAssignment(row: AssignmentRow) {
  return {
    id: row.id,
    submissionId: row.submission_id,
    submissionVersionId: row.submission_version_id,
    type: row.assignment_type,
    assigneeUserId: row.assignee_user_id,
    status: row.status,
    assignedAt: row.assigned_at,
    startedAt: row.started_at,
    dueAt: row.due_at,
    completedAt: row.completed_at,
    reason: row.reason,
    concurrencyVersion: row.concurrency_version,
    submissionReference: row.submission_reference,
    lecturerName: row.lecturer_name,
    collegeName: row.college_name,
    campusName: row.campus_name,
    programmeName: row.programme_name,
    reportingPeriodName: row.reporting_period_name,
    submissionStatus: row.submission_status,
    currentVersion: row.current_version,
    updatedAt: row.updated_at,
    evidenceCount: Number(row.evidence_count),
    evidencePendingCount: Number(row.evidence_pending_count)
  };
}

const assignmentSelect = `
  SELECT ra.id::text, ra.submission_id::text, ra.submission_version_id::text, ra.assignment_type,
    ra.assignee_user_id::text, ra.status, ra.assigned_at::text, ra.started_at::text, ra.due_at::text,
    ra.completed_at::text, ra.reason, ra.concurrency_version,
    'FGC-' || COALESCE(EXTRACT(YEAR FROM ps.created_at)::int::text, 'UNKNOWN') || '-' || UPPER(LEFT(ps.id::text, 8)) AS submission_reference,
    TRIM(u.first_name || ' ' || u.surname) AS lecturer_name,
    c.official_name AS college_name, cs.official_name AS campus_name, cp.name AS programme_name,
    rp.name AS reporting_period_name, ps.status::text AS submission_status, ps.current_version, ps.updated_at::text,
    COUNT(DISTINCT ef.id)::text AS evidence_count,
    COUNT(DISTINCT ef.id) FILTER (WHERE ef.review_status IN ('UPLOADED', 'PENDING_REVIEW') OR ef.upload_status <> 'COMPLETED')::text AS evidence_pending_count
  FROM fgc.review_assignments ra
  JOIN fgc.production_submissions ps ON ps.id = ra.submission_id
  JOIN fgc.production_users u ON u.id = ps.submitted_by
  LEFT JOIN fgc.tvet_colleges c ON c.id = ps.college_id
  LEFT JOIN fgc.campus_sites cs ON cs.id = ps.campus_id
  LEFT JOIN fgc.curriculum_programmes cp ON cp.id = ps.programme_id
  LEFT JOIN fgc.reporting_periods rp ON rp.id = ps.reporting_period_id
  LEFT JOIN fgc.evidence_files ef ON ef.submission_id = ps.id AND ef.submission_version_id = ra.submission_version_id AND ef.deleted_at IS NULL
`;

export async function listEligibleReviewers(access: Access, typeInput: string | null | undefined, submissionId: string, query: Query = fgcQuery) {
  requireJef(access);
  const type = assignmentType(typeInput);
  const scope = access.access.activeRole?.campusId
    ? { sql: "ps.college_id = $3 AND ps.campus_id = $4", values: [access.access.activeRole.collegeId, access.access.activeRole.campusId] }
    : { sql: "ps.college_id = $3", values: [access.access.activeRole?.collegeId] };
  const result = await query<{ id: string; name: string; email: string; college_name: string | null; campus_name: string | null }>(
    `
      SELECT u.id::text, TRIM(u.first_name || ' ' || u.surname) AS name, u.email::text,
        c.official_name AS college_name, cs.official_name AS campus_name
      FROM fgc.production_users u
      JOIN fgc.production_role_assignments pra ON pra.user_id = u.id AND pra.status = 'APPROVED'
      JOIN fgc.roles r ON r.id = pra.role_id AND r.code = $1
      LEFT JOIN fgc.tvet_colleges c ON c.id = pra.tvet_college_id
      LEFT JOIN fgc.campus_sites cs ON cs.id = pra.campus_id
      JOIN fgc.production_submissions ps ON ps.id = $2 AND ${scope.sql}
      WHERE u.id <> ps.submitted_by
        AND u.account_state = 'ACTIVE' AND u.deleted_at IS NULL
        AND pra.tvet_college_id = ps.college_id
        AND (ps.campus_id IS NULL OR pra.campus_id IS NULL OR pra.campus_id = ps.campus_id)
      ORDER BY name
    `,
    [type, submissionId, ...scope.values]
  );
  return result.rows.map((row) => ({ id: row.id, name: row.name, email: row.email, collegeName: row.college_name, campusName: row.campus_name }));
}

async function getSubmissionForJef(access: Access, submissionId: string, query: Query) {
  const scope = submissionScope(access);
  const result = await query<{
    id: string; submitted_by: string; reporting_period_id: string | null; college_id: string | null; campus_id: string | null; programme_id: string | null; status: string; current_version: number; version_id: string | null;
  }>(
    `
      SELECT ps.id::text, ps.submitted_by::text, ps.reporting_period_id::text, ps.college_id::text, ps.campus_id::text,
        ps.programme_id::text, ps.status::text, ps.current_version, psv.id::text AS version_id
      FROM fgc.production_submissions ps
      LEFT JOIN fgc.production_submission_versions psv ON psv.submission_id = ps.id AND psv.version = ps.current_version
      WHERE ps.id = $${scope.values.length + 1} AND ${scope.sql}
      FOR UPDATE
    `,
    [...scope.values, submissionId]
  );
  const submission = result.rows[0];
  if (!submission) throw new FgcReviewWorkflowError(404, "FGC_SUBMISSION_NOT_IN_SCOPE", "The selected submission is not available in the JEF scope.");
  if (!submission.version_id) throw new FgcReviewWorkflowError(409, "FGC_SUBMISSION_VERSION_MISSING", "The selected submission has no immutable version available for review.");
  return submission;
}

async function verifyAssignee(query: Query, submission: { submitted_by: string; college_id: string | null; campus_id: string | null }, assigneeId: string, type: ReviewAssignmentType) {
  if (submission.submitted_by === assigneeId) throw new FgcReviewWorkflowError(409, "FGC_REVIEW_CONFLICT_OF_INTEREST", "The lecturer cannot assess or moderate their own submission.");
  const result = await query<{ id: string }>(
    `
      SELECT u.id::text
      FROM fgc.production_users u
      JOIN fgc.production_role_assignments pra ON pra.user_id = u.id AND pra.status = 'APPROVED'
      JOIN fgc.roles r ON r.id = pra.role_id AND r.code = $2
      WHERE u.id = $1 AND u.account_state = 'ACTIVE' AND u.deleted_at IS NULL
        AND pra.tvet_college_id IS NOT DISTINCT FROM $3::uuid
        AND ( $4::uuid IS NULL OR pra.campus_id IS NULL OR pra.campus_id = $4::uuid )
      LIMIT 1
    `,
    [assigneeId, type, submission.college_id, submission.campus_id]
  );
  if (!result.rows[0]) throw new FgcReviewWorkflowError(409, "FGC_REVIEW_ASSIGNEE_INVALID", "The proposed reviewer is not active, approved for this role, or compatible with the submission scope.");
}

export async function assignReviewCase(access: Access, input: { type: string; submissionId: string; assigneeId: string; reason: string; dueAt?: string | null; replaceAssignmentId?: string; expectedConcurrencyVersion?: number }) {
  requireJef(access);
  const type = assignmentType(input.type);
  const reason = requiredReason(input.reason, "FGC_ASSIGNMENT_REASON_REQUIRED");
  return withFgcTransaction(async (query) => {
    const submission = await getSubmissionForJef(access, input.submissionId, query);
    const allowed = type === "ASSESSOR"
      ? ["SUBMITTED_BY_LECTURER", "COLLEGE_REVIEW_PENDING", "JEF_REVIEW_PENDING", "RESUBMITTED"]
      : ["MODERATION_PENDING"];
    if (!allowed.includes(submission.status)) throw new FgcReviewWorkflowError(409, "FGC_ASSIGNMENT_STATUS_INVALID", "The submission is not at the governed handoff stage for this assignment.");
    if (type === "MODERATOR") {
      const assessor = await query<{ id: string }>("SELECT id::text FROM fgc.assessor_reviews ar WHERE ar.submission_id = $1 AND ar.submission_version_id = $2 AND ar.status = 'SUBMITTED' LIMIT 1", [submission.id, submission.version_id]);
      if (!assessor.rows[0]) throw new FgcReviewWorkflowError(409, "FGC_ASSESSOR_REVIEW_REQUIRED", "A submitted assessor review is required before moderator assignment.");
    }
    await verifyAssignee(query, submission, input.assigneeId, type);
    const active = await query<{ id: string; concurrency_version: number }>(
      "SELECT id::text, concurrency_version FROM fgc.review_assignments WHERE submission_id = $1 AND assignment_type = $2 AND status IN ('ASSIGNED', 'IN_PROGRESS') FOR UPDATE",
      [submission.id, type]
    );
    if (active.rows[0]) {
      if (input.replaceAssignmentId !== active.rows[0].id) throw new FgcReviewWorkflowError(409, "FGC_ACTIVE_ASSIGNMENT_EXISTS", "An active assignment already exists for this workflow stage.");
      if (input.expectedConcurrencyVersion !== active.rows[0].concurrency_version) throw new FgcReviewWorkflowError(409, "FGC_ASSIGNMENT_CONFLICT", "The assignment changed before this reassignment was saved.");
      await query("UPDATE fgc.review_assignments SET status = 'SUPERSEDED', superseded_at = now(), closed_reason = $2, concurrency_version = concurrency_version + 1, updated_at = now() WHERE id = $1", [active.rows[0].id, reason]);
    } else if (input.replaceAssignmentId) {
      throw new FgcReviewWorkflowError(409, "FGC_ASSIGNMENT_CONFLICT", "The assignment changed before this reassignment was saved.");
    }
    if (type === "ASSESSOR" && submission.status !== "JEF_REVIEW_PENDING") {
      await query("UPDATE fgc.production_submissions SET status = 'JEF_REVIEW_PENDING', updated_at = now() WHERE id = $1 AND status = $2::fgc.submission_lifecycle_status", [submission.id, submission.status]);
      await query("INSERT INTO fgc.production_submission_status_history (submission_id, previous_status, new_status, changed_by, changed_role, reason, comments) VALUES ($1, $2::fgc.submission_lifecycle_status, 'JEF_REVIEW_PENDING', $3, $4, 'JEF assigned an assessor', $5)", [submission.id, submission.status, access.user.id, roleCode(access), `Assessor responsibility assigned for submission version ${submission.version_id}.`]);
    }
    const inserted = await query<{ id: string }>(
      `
        INSERT INTO fgc.review_assignments (
          submission_id, submission_version_id, assignment_type, assignee_user_id, assigned_by,
          reporting_period_id, college_id, campus_id, programme_id, due_at, reason, reassignment_of
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id::text
      `,
      [submission.id, submission.version_id, type, input.assigneeId, access.user.id, submission.reporting_period_id, submission.college_id, submission.campus_id, submission.programme_id, input.dueAt ?? null, reason, active.rows[0]?.id ?? null]
    );
    const assignmentId = inserted.rows[0].id;
    await query(
      `INSERT INTO fgc.notifications (user_id, channel, notification_type, subject, body, status, related_object_type, related_object_id, sent_at)
       VALUES ($1, 'IN_APP', $2, $3, $4, 'SENT', 'review_assignment', $5, now())`,
      [input.assigneeId, `${type}_ASSIGNED`, `${type === "ASSESSOR" ? "Assessor" : "Moderator"} case assigned`, `A governed FGC ${type.toLowerCase()} case is ready for review.`, assignmentId]
    );
    await query(
      `INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, object_id, reason, metadata)
       VALUES ($1, $2, $3, 'review_assignment', $4, $5, $6::jsonb)`,
      [access.user.id, roleCode(access), active.rows[0] ? "REASSIGN_REVIEW_CASE" : "ASSIGN_REVIEW_CASE", assignmentId, reason, JSON.stringify({ assignmentType: type, submissionId: submission.id, submissionVersionId: submission.version_id, reassignmentOf: active.rows[0]?.id ?? null })]
    );
    return { assignmentId, submissionId: submission.id, submissionVersionId: submission.version_id, type, status: "ASSIGNED", reassignmentOf: active.rows[0]?.id ?? null };
  });
}

export async function listReviewQueue(access: Access, type: ReviewAssignmentType, query: Query = fgcQuery) {
  requireWorker(access, type);
  const result = await query<AssignmentRow>(`${assignmentSelect} WHERE ra.assignment_type = $1 AND ra.assignee_user_id = $2 AND ra.status IN ('ASSIGNED', 'IN_PROGRESS') GROUP BY ra.id, ps.id, u.id, c.id, cs.id, cp.id, rp.id ORDER BY ra.due_at NULLS LAST, ra.assigned_at LIMIT 100`, [type, access.user.id]);
  return result.rows.map(mapAssignment);
}

async function getAssignedCase(access: Access, assignmentId: string, type: ReviewAssignmentType, query: Query) {
  requireWorker(access, type);
  const result = await query<ReviewCase>(
    `
      SELECT ra.id::text, ra.submission_id::text, ra.submission_version_id::text, ra.assignment_type,
        ra.assignee_user_id::text, ra.status, ra.assigned_at::text, ra.started_at::text, ra.due_at::text,
        ra.completed_at::text, ra.reason, ra.concurrency_version,
        'FGC-' || COALESCE(EXTRACT(YEAR FROM ps.created_at)::int::text, 'UNKNOWN') || '-' || UPPER(LEFT(ps.id::text, 8)) AS submission_reference,
        TRIM(u.first_name || ' ' || u.surname) AS lecturer_name, c.official_name AS college_name,
        cs.official_name AS campus_name, cp.name AS programme_name, rp.name AS reporting_period_name,
        ps.status::text AS submission_status, ps.current_version, ps.updated_at::text,
        (SELECT COUNT(*)::text FROM fgc.evidence_files ef WHERE ef.submission_id = ps.id AND ef.submission_version_id = ra.submission_version_id AND ef.deleted_at IS NULL) AS evidence_count,
        (SELECT COUNT(*)::text FROM fgc.evidence_files ef WHERE ef.submission_id = ps.id AND ef.submission_version_id = ra.submission_version_id AND ef.deleted_at IS NULL AND (ef.review_status IN ('UPLOADED', 'PENDING_REVIEW') OR ef.upload_status <> 'COMPLETED')) AS evidence_pending_count,
        psv.snapshot AS submission_snapshot,
        ar.id::text AS assessor_review_id, ar.status AS assessor_review_status, ar.decisions AS assessor_decisions,
        ar.rationale AS assessor_rationale, ar.submitted_at::text AS assessor_submitted_at,
        mr.id::text AS moderation_record_id, mr.status AS moderation_status, mr.outcome AS moderation_outcome,
        mr.reason AS moderation_reason
      FROM fgc.review_assignments ra
      JOIN fgc.production_submissions ps ON ps.id = ra.submission_id
      JOIN fgc.production_users u ON u.id = ps.submitted_by
      LEFT JOIN fgc.tvet_colleges c ON c.id = ps.college_id
      LEFT JOIN fgc.campus_sites cs ON cs.id = ps.campus_id
      LEFT JOIN fgc.curriculum_programmes cp ON cp.id = ps.programme_id
      LEFT JOIN fgc.reporting_periods rp ON rp.id = ps.reporting_period_id
      JOIN fgc.production_submission_versions psv ON psv.id = ra.submission_version_id
      LEFT JOIN fgc.assessor_reviews ar ON ar.submission_id = ra.submission_id AND ar.submission_version_id = ra.submission_version_id AND ar.status = 'SUBMITTED'
      LEFT JOIN fgc.moderation_records mr ON mr.assignment_id = ra.id
      WHERE ra.id = $1 AND ra.assignment_type = $2 AND ra.assignee_user_id = $3
        AND ra.status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED')
      LIMIT 1`,
    [assignmentId, type, access.user.id]
  );
  const row = result.rows[0];
  if (!row) throw new FgcReviewWorkflowError(404, "FGC_REVIEW_ASSIGNMENT_NOT_FOUND", "The selected review assignment is not available to this reviewer.");
  return row;
}

export async function getReviewCase(access: Access, assignmentId: string, type: ReviewAssignmentType) {
  const row = await getAssignedCase(access, assignmentId, type, fgcQuery);
  const [responses, evidence, history] = await Promise.all([
    fgcQuery<{ section_code: string; field_code: string; value_json: unknown; evidence_kind: string }>(
      "SELECT section_code, field_code, value_json, evidence_kind::text FROM fgc.production_response_values WHERE submission_version_id = $1 ORDER BY section_code, field_code",
      [row.submission_version_id]
    ),
    fgcQuery<{ id: string; original_filename: string; mime_type: string; review_status: string; upload_status: string; evidence_version: number }>(
      "SELECT id::text, original_filename, mime_type, review_status::text, upload_status, evidence_version FROM fgc.evidence_files WHERE submission_id = $1 AND submission_version_id = $2 AND deleted_at IS NULL AND upload_status = 'COMPLETED' ORDER BY created_at DESC LIMIT 100",
      [row.submission_id, row.submission_version_id]
    ),
    fgcQuery<{ id: string; previous_status: string | null; new_status: string; reason: string; created_at: string }>(
      "SELECT id::text, previous_status::text, new_status::text, reason, created_at::text FROM fgc.production_submission_status_history WHERE submission_id = $1 ORDER BY created_at DESC LIMIT 25",
      [row.submission_id]
    )
  ]);
  return {
    assignment: mapAssignment(row),
    submissionVersion: row.submission_version_id,
    snapshot: row.submission_snapshot,
    responses: responses.rows,
    evidence: evidence.rows,
    statusHistory: history.rows,
    assessorReview: row.assessor_review_id ? { id: row.assessor_review_id, status: row.assessor_review_status, decisions: row.assessor_decisions, rationale: row.assessor_rationale, submittedAt: row.assessor_submitted_at } : null,
    moderation: row.moderation_record_id ? { id: row.moderation_record_id, status: row.moderation_status, outcome: row.moderation_outcome, reason: row.moderation_reason } : null
  };
}

export async function startReview(access: Access, assignmentId: string, typeInput: string, expectedConcurrencyVersion: number) {
  const type = assignmentType(typeInput);
  requireWorker(access, type);
  if (!Number.isInteger(expectedConcurrencyVersion) || expectedConcurrencyVersion < 1) throw new FgcValidationError(400, "FGC_ASSIGNMENT_VERSION_REQUIRED", "The current assignment version is required.");
  return withFgcTransaction(async (query) => {
    const assignment = await getAssignedCase(access, assignmentId, type, query);
    const updated = await query<{ id: string }>("UPDATE fgc.review_assignments SET status = 'IN_PROGRESS', started_at = COALESCE(started_at, now()), concurrency_version = concurrency_version + 1, updated_at = now() WHERE id = $1 AND assignee_user_id = $2 AND status = 'ASSIGNED' AND concurrency_version = $3 RETURNING id::text", [assignmentId, access.user.id, expectedConcurrencyVersion]);
    if (!updated.rows[0]) throw new FgcReviewWorkflowError(409, "FGC_ASSIGNMENT_CONFLICT", "The assignment changed before review started.");
    await query("INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, object_id, reason, metadata) VALUES ($1, $2, 'START_REVIEW_ASSIGNMENT', 'review_assignment', $3, 'Reviewer started the assigned case.', $4::jsonb)", [access.user.id, roleCode(access), assignmentId, JSON.stringify({ submissionId: assignment.submission_id, submissionVersionId: assignment.submission_version_id })]);
    return { assignmentId, status: "IN_PROGRESS" };
  });
}

export async function saveAssessorDraft(access: Access, assignmentId: string, expectedConcurrencyVersion: number, decisions: Record<string, unknown>, rationale: string) {
  requireWorker(access, "ASSESSOR");
  validateReviewPayload(decisions, "FGC_ASSESSOR_DECISIONS_INVALID");
  if (!rationale.trim()) throw new FgcValidationError(400, "FGC_ASSESSOR_RATIONALE_REQUIRED", "Add rationale before saving the assessor draft.");
  return withFgcTransaction(async (query) => {
    const assignment = await getAssignedCase(access, assignmentId, "ASSESSOR", query);
    const updated = await query<{ id: string }>("UPDATE fgc.review_assignments SET status = 'IN_PROGRESS', concurrency_version = concurrency_version + 1, updated_at = now() WHERE id = $1 AND assignee_user_id = $2 AND status IN ('ASSIGNED', 'IN_PROGRESS') AND concurrency_version = $3 RETURNING id::text", [assignmentId, access.user.id, expectedConcurrencyVersion]);
    if (!updated.rows[0]) throw new FgcReviewWorkflowError(409, "FGC_ASSIGNMENT_CONFLICT", "The assessor assignment changed before the draft was saved.");
    await query(`INSERT INTO fgc.assessor_reviews (assignment_id, submission_id, submission_version_id, assessor_user_id, status, decisions, rationale) VALUES ($1, $2, $3, $4, 'DRAFT', $5::jsonb, $6) ON CONFLICT (assignment_id) DO UPDATE SET decisions = EXCLUDED.decisions, rationale = EXCLUDED.rationale, updated_at = now(), status = 'DRAFT'`, [assignmentId, assignment.submission_id, assignment.submission_version_id, access.user.id, JSON.stringify(decisions), rationale.trim()]);
    await query("INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, object_id, reason, metadata) VALUES ($1, $2, 'SAVE_ASSESSOR_DRAFT', 'review_assignment', $3, 'Assessor draft saved without changing lecturer responses.', $4::jsonb)", [access.user.id, roleCode(access), assignmentId, JSON.stringify({ submissionId: assignment.submission_id, submissionVersionId: assignment.submission_version_id })]);
    return { assignmentId, submissionId: assignment.submission_id, submissionVersionId: assignment.submission_version_id, status: "DRAFT" };
  });
}

export async function submitAssessorReview(access: Access, assignmentId: string, expectedConcurrencyVersion: number, decisions: Record<string, unknown>, rationale: string) {
  requireWorker(access, "ASSESSOR");
  validateReviewPayload(decisions, "FGC_ASSESSOR_DECISIONS_INVALID");
  if (!Object.keys(decisions).length || rationale.trim().length < 8) throw new FgcValidationError(422, "FGC_ASSESSOR_REVIEW_INCOMPLETE", "Assessor decisions and meaningful rationale are required before handoff.");
  return withFgcTransaction(async (query) => {
    const assignment = await getAssignedCase(access, assignmentId, "ASSESSOR", query);
    const updated = await query<{ id: string }>("UPDATE fgc.review_assignments SET status = 'COMPLETED', completed_at = now(), concurrency_version = concurrency_version + 1, updated_at = now() WHERE id = $1 AND assignee_user_id = $2 AND status IN ('ASSIGNED', 'IN_PROGRESS') AND concurrency_version = $3 RETURNING id::text", [assignmentId, access.user.id, expectedConcurrencyVersion]);
    if (!updated.rows[0]) throw new FgcReviewWorkflowError(409, "FGC_ASSIGNMENT_CONFLICT", "The assessor assignment changed before handoff.");
    await query(`INSERT INTO fgc.assessor_reviews (assignment_id, submission_id, submission_version_id, assessor_user_id, status, decisions, rationale, submitted_at) VALUES ($1, $2, $3, $4, 'SUBMITTED', $5::jsonb, $6, now()) ON CONFLICT (assignment_id) DO UPDATE SET status = 'SUBMITTED', decisions = EXCLUDED.decisions, rationale = EXCLUDED.rationale, submitted_at = now(), updated_at = now()`, [assignmentId, assignment.submission_id, assignment.submission_version_id, access.user.id, JSON.stringify(decisions), rationale.trim()]);
    const current = await query<{ status: string }>("SELECT status::text FROM fgc.production_submissions WHERE id = $1 FOR UPDATE", [assignment.submission_id]);
    await query("UPDATE fgc.production_submissions SET status = 'MODERATION_PENDING', updated_at = now() WHERE id = $1 AND status IN ('SUBMITTED_BY_LECTURER', 'COLLEGE_REVIEW_PENDING', 'JEF_REVIEW_PENDING', 'RESUBMITTED')", [assignment.submission_id]);
    await query("INSERT INTO fgc.production_submission_status_history (submission_id, previous_status, new_status, changed_by, changed_role, reason, comments) VALUES ($1, $2::fgc.submission_lifecycle_status, 'MODERATION_PENDING', $3, $4, 'Assessor review submitted', $5)", [assignment.submission_id, current.rows[0]?.status ?? "JEF_REVIEW_PENDING", access.user.id, roleCode(access), `Bound to submission version ${assignment.submission_version_id}.`]);
    await query("INSERT INTO fgc.notifications (user_id, channel, notification_type, subject, body, status, related_object_type, related_object_id, sent_at) SELECT pra.user_id, 'IN_APP', 'MODERATION_READY', 'FGC case ready for moderator assignment', 'An assessor review has completed and the case is ready for governed moderator assignment.', 'SENT', 'production_submission', $1, now() FROM fgc.production_role_assignments pra JOIN fgc.roles r ON r.id = pra.role_id WHERE r.code = 'JEF_ADMINISTRATOR' AND pra.status = 'APPROVED' AND pra.tvet_college_id = (SELECT college_id FROM fgc.production_submissions WHERE id = $1)", [assignment.submission_id]);
    await query("INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, object_id, reason, metadata) VALUES ($1, $2, 'SUBMIT_ASSESSOR_REVIEW', 'review_assignment', $3, 'Assessor review handed to governed moderation.', $4::jsonb)", [access.user.id, roleCode(access), assignmentId, JSON.stringify({ submissionId: assignment.submission_id, submissionVersionId: assignment.submission_version_id })]);
    return { assignmentId, submissionId: assignment.submission_id, submissionVersionId: assignment.submission_version_id, status: "SUBMITTED", nextWorkflowStatus: "MODERATION_PENDING" };
  });
}

export async function saveModerationDraft(access: Access, assignmentId: string, expectedConcurrencyVersion: number, outcome: Record<string, unknown>, reason: string) {
  requireWorker(access, "MODERATOR");
  validateReviewPayload(outcome, "FGC_MODERATION_OUTCOME_INVALID");
  if (!reason.trim()) throw new FgcValidationError(400, "FGC_MODERATION_REASON_REQUIRED", "Add a moderation rationale before saving the draft.");
  return withFgcTransaction(async (query) => {
    const assignment = await getAssignedCase(access, assignmentId, "MODERATOR", query);
    const assessor = await query<{ id: string }>("SELECT id::text FROM fgc.assessor_reviews WHERE submission_id = $1 AND submission_version_id = $2 AND status = 'SUBMITTED' LIMIT 1", [assignment.submission_id, assignment.submission_version_id]);
    if (!assessor.rows[0]) throw new FgcReviewWorkflowError(409, "FGC_ASSESSOR_REVIEW_REQUIRED", "The assigned case has no completed assessor review for this version.");
    const updated = await query<{ id: string }>("UPDATE fgc.review_assignments SET status = 'IN_PROGRESS', concurrency_version = concurrency_version + 1, updated_at = now() WHERE id = $1 AND assignee_user_id = $2 AND status IN ('ASSIGNED', 'IN_PROGRESS') AND concurrency_version = $3 RETURNING id::text", [assignmentId, access.user.id, expectedConcurrencyVersion]);
    if (!updated.rows[0]) throw new FgcReviewWorkflowError(409, "FGC_ASSIGNMENT_CONFLICT", "The moderator assignment changed before the draft was saved.");
    await query(`INSERT INTO fgc.moderation_records (assignment_id, submission_id, submission_version_id, moderator_user_id, assessor_review_id, status, outcome, reason) VALUES ($1, $2, $3, $4, $5, 'DRAFT', $6::jsonb, $7) ON CONFLICT (assignment_id) DO UPDATE SET outcome = EXCLUDED.outcome, reason = EXCLUDED.reason, updated_at = now(), status = 'DRAFT'`, [assignmentId, assignment.submission_id, assignment.submission_version_id, access.user.id, assessor.rows[0].id, JSON.stringify(outcome), reason.trim()]);
    await query("INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, object_id, reason, metadata) VALUES ($1, $2, 'SAVE_MODERATION_DRAFT', 'review_assignment', $3, 'Moderator draft saved without changing lecturer or assessor records.', $4::jsonb)", [access.user.id, roleCode(access), assignmentId, JSON.stringify({ submissionId: assignment.submission_id, submissionVersionId: assignment.submission_version_id })]);
    return { assignmentId, status: "DRAFT" };
  });
}

export async function finalizeModeration(access: Access, assignmentId: string, expectedConcurrencyVersion: number, outcomeStatus: string, outcome: Record<string, unknown>, reason: string) {
  requireWorker(access, "MODERATOR");
  validateReviewPayload(outcome, "FGC_MODERATION_OUTCOME_INVALID");
  if (!["CONFIRMED", "CHANGED", "FURTHER_EVIDENCE_REQUESTED", "REASSESSMENT_REQUESTED"].includes(outcomeStatus)) throw new FgcValidationError(400, "FGC_MODERATION_OUTCOME_INVALID", "Select a governed moderation outcome.");
  if (outcomeStatus !== "CONFIRMED") requiredReason(reason, "FGC_MODERATION_REASON_REQUIRED");
  return withFgcTransaction(async (query) => {
    const assignment = await getAssignedCase(access, assignmentId, "MODERATOR", query);
    const assessor = await query<{ id: string }>("SELECT id::text FROM fgc.assessor_reviews WHERE submission_id = $1 AND submission_version_id = $2 AND status = 'SUBMITTED' LIMIT 1", [assignment.submission_id, assignment.submission_version_id]);
    if (!assessor.rows[0]) throw new FgcReviewWorkflowError(409, "FGC_ASSESSOR_REVIEW_REQUIRED", "The assigned case has no completed assessor review for this version.");
    const updated = await query<{ id: string }>("UPDATE fgc.review_assignments SET status = 'COMPLETED', completed_at = now(), concurrency_version = concurrency_version + 1, updated_at = now() WHERE id = $1 AND assignee_user_id = $2 AND status IN ('ASSIGNED', 'IN_PROGRESS') AND concurrency_version = $3 RETURNING id::text", [assignmentId, access.user.id, expectedConcurrencyVersion]);
    if (!updated.rows[0]) throw new FgcReviewWorkflowError(409, "FGC_ASSIGNMENT_CONFLICT", "The moderator assignment changed before finalization.");
    await query(`INSERT INTO fgc.moderation_records (assignment_id, submission_id, submission_version_id, moderator_user_id, assessor_review_id, status, outcome, reason, finalized_at) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, now()) ON CONFLICT (assignment_id) DO UPDATE SET status = EXCLUDED.status, outcome = EXCLUDED.outcome, reason = EXCLUDED.reason, finalized_at = now(), updated_at = now()`, [assignmentId, assignment.submission_id, assignment.submission_version_id, access.user.id, assessor.rows[0].id, outcomeStatus, JSON.stringify(outcome), reason.trim()]);
    const nextStatus = outcomeStatus === "CONFIRMED" || outcomeStatus === "CHANGED" ? "MODERATED" : "CLARIFICATION_REQUESTED";
    const current = await query<{ status: string }>("SELECT status::text FROM fgc.production_submissions WHERE id = $1 FOR UPDATE", [assignment.submission_id]);
    await query("UPDATE fgc.production_submissions SET status = $2::fgc.submission_lifecycle_status, updated_at = now() WHERE id = $1 AND status = 'MODERATION_PENDING'", [assignment.submission_id, nextStatus]);
    await query("INSERT INTO fgc.production_submission_status_history (submission_id, previous_status, new_status, changed_by, changed_role, reason, comments) VALUES ($1, $2::fgc.submission_lifecycle_status, $3::fgc.submission_lifecycle_status, $4, $5, $6, $7)", [assignment.submission_id, current.rows[0]?.status ?? "MODERATION_PENDING", nextStatus, access.user.id, roleCode(access), reason.trim() || "Moderator confirmed the assessor result.", `Submission version ${assignment.submission_version_id} remains immutable.`]);
    await query("INSERT INTO fgc.notifications (user_id, channel, notification_type, subject, body, status, related_object_type, related_object_id, sent_at) SELECT ps.submitted_by, 'IN_APP', 'MODERATION_OUTCOME', 'FGC moderation outcome recorded', 'A governed moderation outcome has been recorded for your FGC submission.', 'SENT', 'production_submission', ps.id, now() FROM fgc.production_submissions ps WHERE ps.id = $1", [assignment.submission_id]);
    await query("INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, object_id, reason, metadata) VALUES ($1, $2, 'FINALIZE_MODERATION', 'review_assignment', $3, $4, $5::jsonb)", [access.user.id, roleCode(access), assignmentId, reason.trim() || "Moderator confirmed the assessor result.", JSON.stringify({ submissionId: assignment.submission_id, submissionVersionId: assignment.submission_version_id, outcomeStatus, assessorReviewId: assessor.rows[0].id })]);
    return { assignmentId, submissionId: assignment.submission_id, submissionVersionId: assignment.submission_version_id, status: outcomeStatus, nextWorkflowStatus: nextStatus };
  });
}

export async function revokeOrSupersedeAssignment(access: Access, assignmentId: string, expectedConcurrencyVersion: number, reason: string, action: "REVOKE" | "SUPERSEDE") {
  requireJef(access);
  if (!Number.isInteger(expectedConcurrencyVersion) || expectedConcurrencyVersion < 1) throw new FgcValidationError(400, "FGC_ASSIGNMENT_VERSION_REQUIRED", "The current assignment version is required.");
  const closedReason = requiredReason(reason, "FGC_ASSIGNMENT_REASON_REQUIRED");
  return withFgcTransaction(async (query) => {
    const scope = submissionScope(access);
    const result = await query<{ id: string; submission_id: string; assignment_type: ReviewAssignmentType; status: AssignmentState; concurrency_version: number }>(`SELECT ra.id::text, ra.submission_id::text, ra.assignment_type, ra.status, ra.concurrency_version FROM fgc.review_assignments ra JOIN fgc.production_submissions ps ON ps.id = ra.submission_id WHERE ra.id = $${scope.values.length + 1} AND ${scope.sql.replace("ps.", "ps.")} FOR UPDATE`, [...scope.values, assignmentId]);
    const row = result.rows[0];
    if (!row) throw new FgcReviewWorkflowError(404, "FGC_REVIEW_ASSIGNMENT_NOT_FOUND", "The selected assignment is not available in the JEF scope.");
    if (!["ASSIGNED", "IN_PROGRESS"].includes(row.status)) throw new FgcReviewWorkflowError(409, "FGC_ASSIGNMENT_NOT_ACTIVE", "Only an active assignment can be revoked or superseded.");
    const nextStatus = action === "REVOKE" ? "REVOKED" : "SUPERSEDED";
    const updated = await query<{ id: string }>("UPDATE fgc.review_assignments SET status = $2, revoked_at = CASE WHEN $2 = 'REVOKED' THEN now() ELSE revoked_at END, superseded_at = CASE WHEN $2 = 'SUPERSEDED' THEN now() ELSE superseded_at END, closed_reason = $3, concurrency_version = concurrency_version + 1, updated_at = now() WHERE id = $1 AND status IN ('ASSIGNED', 'IN_PROGRESS') AND concurrency_version = $4 RETURNING id::text", [assignmentId, nextStatus, closedReason, expectedConcurrencyVersion]);
    if (!updated.rows[0]) throw new FgcReviewWorkflowError(409, "FGC_ASSIGNMENT_CONFLICT", "The assignment changed before it was closed.");
    await query("INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, object_id, reason, metadata) VALUES ($1, $2, $3, 'review_assignment', $4, $5, $6::jsonb)", [access.user.id, roleCode(access), action === "REVOKE" ? "REVOKE_REVIEW_ASSIGNMENT" : "SUPERSEDE_REVIEW_ASSIGNMENT", assignmentId, closedReason, JSON.stringify({ submissionId: row.submission_id, assignmentType: row.assignment_type })]);
    return { assignmentId, status: nextStatus };
  });
}

export async function listAssignmentHistory(access: Access, submissionId: string, typeInput?: string, query: Query = fgcQuery) {
  requireJef(access);
  const scope = submissionScope(access);
  const type = typeInput ? assignmentType(typeInput) : null;
  const typeSql = type ? ` AND ra.assignment_type = $${scope.values.length + 2}` : "";
  const result = await query<AssignmentRow>(`${assignmentSelect} WHERE ps.id = $${scope.values.length + 1} AND ${scope.sql}${typeSql} GROUP BY ra.id, ps.id, u.id, c.id, cs.id, cp.id, rp.id ORDER BY ra.assigned_at DESC LIMIT 200`, type ? [...scope.values, submissionId, type] : [...scope.values, submissionId]);
  return result.rows.map(mapAssignment);
}
