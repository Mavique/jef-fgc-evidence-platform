import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { QueryResult, QueryResultRow } from "pg";
import { closeFgcIntegrationPool, fgcQuery } from "@/lib/fgc/db";
import { createSessionToken } from "@/lib/fgc/session";
import { resolveFgcCurrentUserFromToken } from "@/lib/fgc/current-user";
import { fieldKey, fgcLecturerModules, type FgcLecturerDraftValues } from "@/lib/fgc/lecturer-form";
import { getLecturerFormState, saveLecturerDraft, submitLecturerForm } from "@/lib/fgc/lecturer-submissions";
import {
  assignReviewCase,
  finalizeModeration,
  getReviewCase,
  listReviewQueue,
  saveAssessorDraft,
  startReview,
  submitAssessorReview
} from "@/lib/fgc/review-workflow";

const ids = {
  country: "11111111-1111-4111-8111-111111111101",
  province: "11111111-1111-4111-8111-111111111102",
  organisation: "11111111-1111-4111-8111-111111111103",
  college: "11111111-1111-4111-8111-111111111104",
  campus: "11111111-1111-4111-8111-111111111105",
  collegeOther: "11111111-1111-4111-8111-111111111106",
  campusOther: "11111111-1111-4111-8111-111111111107",
  period: "11111111-1111-4111-8111-111111111120",
  programme: "11111111-1111-4111-8111-111111111130",
  template: "11111111-1111-4111-8111-111111111140",
  lecturer: "11111111-1111-4111-8111-111111111150",
  lecturerOther: "11111111-1111-4111-8111-111111111151",
  jef: "11111111-1111-4111-8111-111111111152",
  jefOther: "11111111-1111-4111-8111-111111111153",
  assessor: "11111111-1111-4111-8111-111111111154",
  moderator: "11111111-1111-4111-8111-111111111155",
  merseta: "11111111-1111-4111-8111-111111111156",
  mersetaOther: "11111111-1111-4111-8111-111111111157",
  multiRole: "11111111-1111-4111-8111-111111111158",
  roleJef: "11111111-1111-4111-8111-111111111160",
  roleLecturer: "11111111-1111-4111-8111-111111111161",
  roleAssessor: "11111111-1111-4111-8111-111111111162",
  roleModerator: "11111111-1111-4111-8111-111111111163",
  roleMerseta: "11111111-1111-4111-8111-111111111164",
  assignment: "11111111-1111-4111-8111-111111111170",
  assignmentOther: "11111111-1111-4111-8111-111111111171",
  assignmentMulti: "11111111-1111-4111-8111-111111111172",
  selfSubmission: "11111111-1111-4111-8111-111111111173",
  selfVersion: "11111111-1111-4111-8111-111111111174",
  rollbackAssignment: "11111111-1111-4111-8111-111111111175"
} as const;

async function query<T extends QueryResultRow = QueryResultRow>(sql: string, values: unknown[] = []): Promise<QueryResult<T>> {
  return fgcQuery<T>(sql, values);
}

async function accessFor(userId: string, suffix: string) {
  const { token, sessionHash } = createSessionToken();
  await query(
    "INSERT INTO fgc.production_sessions (user_id, session_hash, expires_at) VALUES ($1, $2, now() + interval '2 hours')",
    [userId, sessionHash]
  );
  const access = await resolveFgcCurrentUserFromToken(token);
  expect(access.ok, `session ${suffix} should resolve`).toBe(true);
  if (!access.ok) throw new Error("integration session did not resolve");
  return access;
}

function completeValues(): FgcLecturerDraftValues {
  const values: FgcLecturerDraftValues = {};
  for (const lecturerModule of fgcLecturerModules) {
    for (const field of lecturerModule.fields) {
      if (!field.required) continue;
      values[fieldKey(lecturerModule.code, field.code)] = field.options?.[0] ?? (field.type === "number" ? "12" : field.type === "date" ? "2026-01-01" : `Synthetic ${field.code}`);
    }
  }
  return values;
}

describe("authenticated FGC workflow against disposable PostgreSQL", () => {
  let lecturerAccess: Extract<Awaited<ReturnType<typeof accessFor>>, { ok: true }>;
  let jefAccess: Extract<Awaited<ReturnType<typeof accessFor>>, { ok: true }>;
  let outOfScopeJefAccess: Extract<Awaited<ReturnType<typeof accessFor>>, { ok: true }>;
  let assessorAccess: Extract<Awaited<ReturnType<typeof accessFor>>, { ok: true }>;
  let moderatorAccess: Extract<Awaited<ReturnType<typeof accessFor>>, { ok: true }>;
  let otherAssessorAccess: Extract<Awaited<ReturnType<typeof accessFor>>, { ok: true }>;
  let submissionId: string;
  let versionId: string;
  let assessorAssignmentId: string;
  let moderatorAssignmentId: string;
  let values: FgcLecturerDraftValues;

  beforeAll(async () => {
    await query(`
      INSERT INTO fgc.countries (id, iso2, iso3, official_name, common_name) VALUES ('${ids.country}', 'ZZ', 'ZZZ', 'Synthetic Country', 'Synthetic Country');
      INSERT INTO fgc.provinces (id, country_id, official_name) VALUES ('${ids.province}', '${ids.country}', 'Synthetic Province');
      INSERT INTO fgc.organisations (id, name, organisation_type) VALUES ('${ids.organisation}', 'Synthetic Organisation', 'TVET');
      INSERT INTO fgc.tvet_colleges (id, official_name, province_id) VALUES ('${ids.college}', 'Synthetic College A', '${ids.province}'), ('${ids.collegeOther}', 'Synthetic College B', '${ids.province}');
      INSERT INTO fgc.campus_sites (id, college_id, official_name) VALUES ('${ids.campus}', '${ids.college}', 'Synthetic Campus A'), ('${ids.campusOther}', '${ids.collegeOther}', 'Synthetic Campus B');
      INSERT INTO fgc.reporting_periods (id, name, scope_statement) VALUES ('${ids.period}', 'Synthetic Period', 'Disposable integration scope');
      INSERT INTO fgc.curriculum_programmes (id, official_title, framework) VALUES ('${ids.programme}', 'Synthetic Programme', 'NCV');
      INSERT INTO fgc.form_templates (id, code, name) VALUES ('${ids.template}', 'FGC_INTEGRATION', 'Synthetic FGC Integration Form');
      INSERT INTO fgc.roles (id, code, name, description) VALUES
        ('${ids.roleJef}', 'JEF_ADMINISTRATOR', 'Synthetic JEF Administrator', 'Integration role'),
        ('${ids.roleLecturer}', 'LECTURER', 'Synthetic Lecturer', 'Integration role'),
        ('${ids.roleAssessor}', 'ASSESSOR', 'Synthetic Assessor', 'Integration role'),
        ('${ids.roleModerator}', 'MODERATOR', 'Synthetic Moderator', 'Integration role'),
        ('${ids.roleMerseta}', 'MERSETA_ADMINISTRATOR', 'Synthetic merSETA Administrator', 'Integration role');
      INSERT INTO fgc.production_users (id, email, password_hash, first_name, surname, account_state, email_verified_at) VALUES
        ('${ids.lecturer}', 'lecturer-a@integration.invalid', 'integration-only', 'Lecturer', 'A', 'ACTIVE', now()),
        ('${ids.lecturerOther}', 'lecturer-b@integration.invalid', 'integration-only', 'Lecturer', 'B', 'ACTIVE', now()),
        ('${ids.jef}', 'jef@integration.invalid', 'integration-only', 'JEF', 'Scoped', 'ACTIVE', now()),
        ('${ids.jefOther}', 'jef-out@integration.invalid', 'integration-only', 'JEF', 'Out', 'ACTIVE', now()),
        ('${ids.assessor}', 'assessor@integration.invalid', 'integration-only', 'Assessor', 'Assigned', 'ACTIVE', now()),
        ('${ids.moderator}', 'moderator@integration.invalid', 'integration-only', 'Moderator', 'Assigned', 'ACTIVE', now()),
        ('${ids.merseta}', 'merseta@integration.invalid', 'integration-only', 'merSETA', 'Scoped', 'ACTIVE', now()),
        ('${ids.mersetaOther}', 'merseta-out@integration.invalid', 'integration-only', 'merSETA', 'Out', 'ACTIVE', now()),
        ('${ids.multiRole}', 'multi-role@integration.invalid', 'integration-only', 'Multi', 'Role', 'ACTIVE', now());
      INSERT INTO fgc.production_role_assignments (user_id, role_id, organisation_id, tvet_college_id, campus_id, status, approved_at) VALUES
        ('${ids.lecturer}', '${ids.roleLecturer}', '${ids.organisation}', '${ids.college}', '${ids.campus}', 'APPROVED', now()),
        ('${ids.lecturerOther}', '${ids.roleLecturer}', '${ids.organisation}', '${ids.collegeOther}', '${ids.campusOther}', 'APPROVED', now()),
        ('${ids.jef}', '${ids.roleJef}', '${ids.organisation}', '${ids.college}', NULL, 'APPROVED', now()),
        ('${ids.jefOther}', '${ids.roleJef}', '${ids.organisation}', '${ids.collegeOther}', NULL, 'APPROVED', now()),
        ('${ids.assessor}', '${ids.roleAssessor}', '${ids.organisation}', '${ids.college}', '${ids.campus}', 'APPROVED', now()),
        ('${ids.moderator}', '${ids.roleModerator}', '${ids.organisation}', '${ids.college}', '${ids.campus}', 'APPROVED', now()),
        ('${ids.merseta}', '${ids.roleMerseta}', '${ids.organisation}', NULL, NULL, 'APPROVED', now()),
        ('${ids.mersetaOther}', '${ids.roleMerseta}', '${ids.organisation}', '${ids.collegeOther}', NULL, 'APPROVED', now()),
        ('${ids.multiRole}', '${ids.roleLecturer}', '${ids.organisation}', '${ids.college}', '${ids.campus}', 'APPROVED', now()),
        ('${ids.multiRole}', '${ids.roleAssessor}', '${ids.organisation}', '${ids.college}', '${ids.campus}', 'APPROVED', now());
      INSERT INTO fgc.form_assignments (id, template_id, assigned_to, assigned_by, reporting_period_id, college_id, campus_id, status)
      VALUES ('${ids.assignment}', '${ids.template}', '${ids.lecturer}', '${ids.jef}', '${ids.period}', '${ids.college}', '${ids.campus}', 'ASSIGNED');
      INSERT INTO fgc.form_assignments (id, template_id, assigned_to, assigned_by, reporting_period_id, college_id, campus_id, status)
      VALUES ('${ids.assignmentOther}', '${ids.template}', '${ids.lecturerOther}', '${ids.jef}', '${ids.period}', '${ids.collegeOther}', '${ids.campusOther}', 'ASSIGNED');
      INSERT INTO fgc.form_assignments (id, template_id, assigned_to, assigned_by, reporting_period_id, college_id, campus_id, status)
      VALUES ('${ids.assignmentMulti}', '${ids.template}', '${ids.multiRole}', '${ids.jef}', '${ids.period}', '${ids.college}', '${ids.campus}', 'ASSIGNED');
      INSERT INTO fgc.production_submissions (id, assignment_id, submitted_by, reporting_period_id, college_id, campus_id, status, current_version, locked_at, submitted_at)
      VALUES ('${ids.selfSubmission}', '${ids.assignmentMulti}', '${ids.multiRole}', '${ids.period}', '${ids.college}', '${ids.campus}', 'SUBMITTED_BY_LECTURER', 1, now(), now());
      INSERT INTO fgc.production_submission_versions (id, submission_id, version, status_at_snapshot, snapshot, snapshot_checksum, created_by)
      VALUES ('${ids.selfVersion}', '${ids.selfSubmission}', 1, 'SUBMITTED_BY_LECTURER', '{"values":{}}'::jsonb, 'integration-self-review', '${ids.multiRole}');
      INSERT INTO fgc.form_assignments (id, template_id, assigned_to, assigned_by, reporting_period_id, college_id, campus_id, status)
      VALUES ('${ids.rollbackAssignment}', '${ids.template}', '${ids.lecturer}', '${ids.jef}', '${ids.period}', '${ids.college}', '${ids.campus}', 'ASSIGNED');
    `);
    lecturerAccess = await accessFor(ids.lecturer, "lecturer");
    jefAccess = await accessFor(ids.jef, "jef");
    outOfScopeJefAccess = await accessFor(ids.jefOther, "out-of-scope-jef");
    assessorAccess = await accessFor(ids.assessor, "assessor");
    moderatorAccess = await accessFor(ids.moderator, "moderator");
    otherAssessorAccess = await accessFor(ids.multiRole, "multi-role");
    values = completeValues();
  });

  afterAll(async () => {
    await closeFgcIntegrationPool();
  });

  it("rejects absent, expired, revoked and suspended sessions", async () => {
    expect((await resolveFgcCurrentUserFromToken(undefined)).ok).toBe(false);
    const expired = createSessionToken();
    await query("INSERT INTO fgc.production_sessions (user_id, session_hash, expires_at) VALUES ($1, $2, now() - interval '1 minute')", [ids.lecturer, expired.sessionHash]);
    expect((await resolveFgcCurrentUserFromToken(expired.token)).ok).toBe(false);
    const revoked = createSessionToken();
    await query("INSERT INTO fgc.production_sessions (user_id, session_hash, expires_at, revoked_at) VALUES ($1, $2, now() + interval '2 hours', now())", [ids.lecturer, revoked.sessionHash]);
    expect((await resolveFgcCurrentUserFromToken(revoked.token)).ok).toBe(false);
    const suspended = createSessionToken();
    await query("INSERT INTO fgc.production_sessions (user_id, session_hash, expires_at) VALUES ($1, $2, now() + interval '2 hours')", [ids.lecturer, suspended.sessionHash]);
    await query("UPDATE fgc.production_users SET account_state = 'SUSPENDED' WHERE id = $1", [ids.lecturer]);
    const blocked = await resolveFgcCurrentUserFromToken(suspended.token);
    expect(blocked.ok).toBe(false);
    await query("UPDATE fgc.production_users SET account_state = 'ACTIVE' WHERE id = $1", [ids.lecturer]);
  });

  it("persists the authenticated lecturer lifecycle and exact immutable version", async () => {
    const initial = await getLecturerFormState(lecturerAccess, ids.assignment);
    expect(initial.submission.id).toBeNull();
    const draft = await saveLecturerDraft(lecturerAccess, ids.assignment, values);
    expect(draft.completion.complete).toBe(true);
    const reopened = await getLecturerFormState(lecturerAccess, ids.assignment);
    expect(reopened.submission.currentVersion).toBe(1);
    expect(reopened.values[fieldKey("SCOPE_SOURCE", "institution_name")]).toBe(values[fieldKey("SCOPE_SOURCE", "institution_name")]);
    const submitted = await submitLecturerForm(lecturerAccess, ids.assignment, values);
    submissionId = submitted.submissionId;
    const version = await query<{ id: string }>("SELECT id::text FROM fgc.production_submission_versions WHERE submission_id = $1 AND version = 2", [submissionId]);
    versionId = version.rows[0].id;
    expect(submitted.version).toBe(2);
    const persisted = await query<{ status: string; current_version: number; locked_at: string | null }>("SELECT status::text, current_version, locked_at::text FROM fgc.production_submissions WHERE id = $1", [submissionId]);
    expect(persisted.rows[0]).toMatchObject({ status: "SUBMITTED_BY_LECTURER", current_version: 2 });
    expect(persisted.rows[0].locked_at).toBeTruthy();
    expect((await query("SELECT 1 FROM fgc.production_submission_status_history WHERE submission_id = $1 AND new_status = 'SUBMITTED_BY_LECTURER'", [submissionId])).rowCount).toBe(1);
    expect((await query("SELECT 1 FROM fgc.notifications WHERE related_object_id = $1 AND notification_type = 'LECTURER_SUBMISSION_RECEIVED'", [submissionId])).rowCount).toBe(1);
    expect((await query("SELECT 1 FROM fgc.production_response_values prv JOIN fgc.production_submission_versions psv ON psv.id = prv.submission_version_id WHERE psv.id = $1 AND prv.evidence_kind = 'DOCUMENT_SUPPORTED'", [versionId])).rowCount).toBeGreaterThan(0);
    await expect(saveLecturerDraft(lecturerAccess, ids.assignment, values)).rejects.toMatchObject({ status: 409, code: "FGC_SUBMISSION_LOCKED" });
    await expect(getLecturerFormState(lecturerAccess, ids.assignmentOther)).rejects.toMatchObject({ status: 404 });
  });

  it("governs assignment, assessor handoff, moderation and role isolation", async () => {
    const assignment = await assignReviewCase(jefAccess, { type: "ASSESSOR", submissionId, assigneeId: ids.assessor, reason: "Synthetic governed assessor assignment" });
    assessorAssignmentId = assignment.assignmentId;
    expect(assignment.submissionVersionId).toBe(versionId);
    expect((await listReviewQueue(assessorAccess, "ASSESSOR")).map((row) => row.id)).toContain(assessorAssignmentId);
    expect(await listReviewQueue(otherAssessorAccess, "ASSESSOR")).toHaveLength(0);
    const caseFile = await getReviewCase(assessorAccess, assessorAssignmentId, "ASSESSOR");
    expect(caseFile.assignment.submissionVersionId).toBe(versionId);
    expect(caseFile.responses.length).toBeGreaterThan(0);
    await expect(getReviewCase(otherAssessorAccess, assessorAssignmentId, "ASSESSOR")).rejects.toMatchObject({ status: 404 });
    await expect(assignReviewCase(outOfScopeJefAccess, { type: "ASSESSOR", submissionId, assigneeId: ids.assessor, reason: "Synthetic out of scope attempt" })).rejects.toMatchObject({ status: 404 });
    await expect(assignReviewCase(jefAccess, { type: "ASSESSOR", submissionId: ids.selfSubmission, assigneeId: ids.multiRole, reason: "Synthetic self review attempt" })).rejects.toMatchObject({ code: "FGC_REVIEW_CONFLICT_OF_INTEREST" });
    const started = await startReview(assessorAccess, assessorAssignmentId, "ASSESSOR", 1);
    expect(started.status).toBe("IN_PROGRESS");
    const draft = await saveAssessorDraft(assessorAccess, assessorAssignmentId, 2, { capability: "NOT_ASSESSED" }, "Synthetic assessor draft rationale");
    expect(draft.submissionVersionId).toBe(versionId);
    const submitted = await submitAssessorReview(assessorAccess, assessorAssignmentId, 3, { capability: "NOT_ASSESSED" }, "Synthetic assessor final rationale");
    expect(submitted.nextWorkflowStatus).toBe("MODERATION_PENDING");
    expect((await query<{ status: string }>("SELECT status::text FROM fgc.production_submissions WHERE id = $1", [submissionId])).rows[0].status).toBe("MODERATION_PENDING");
    expect((await query("SELECT 1 FROM fgc.assessor_reviews WHERE assignment_id = $1 AND status = 'SUBMITTED' AND submission_version_id = $2", [assessorAssignmentId, versionId])).rowCount).toBe(1);
    await expect(submitAssessorReview(assessorAccess, assessorAssignmentId, 3, { capability: "NOT_ASSESSED" }, "Synthetic replay")).rejects.toMatchObject({ status: 409 });
    const moderatorAssignment = await assignReviewCase(jefAccess, { type: "MODERATOR", submissionId, assigneeId: ids.moderator, reason: "Synthetic governed moderator assignment" });
    moderatorAssignmentId = moderatorAssignment.assignmentId;
    expect((await listReviewQueue(moderatorAccess, "MODERATOR")).map((row) => row.id)).toContain(moderatorAssignmentId);
    await expect(getReviewCase(otherAssessorAccess, moderatorAssignmentId, "MODERATOR")).rejects.toMatchObject({ status: 403 });
    const moderatorCase = await getReviewCase(moderatorAccess, moderatorAssignmentId, "MODERATOR");
    expect(moderatorCase.assessorReview?.status).toBe("SUBMITTED");
    await expect(finalizeModeration(moderatorAccess, moderatorAssignmentId, 1, "CHANGED", { capability: "NOT_ASSESSED" }, "")).rejects.toMatchObject({ code: "FGC_MODERATION_REASON_REQUIRED" });
    const final = await finalizeModeration(moderatorAccess, moderatorAssignmentId, 1, "CHANGED", { capability: "NOT_ASSESSED" }, "Synthetic moderation amendment rationale");
    expect(final.nextWorkflowStatus).toBe("MODERATED");
    expect((await query<{ status: string }>("SELECT status::text FROM fgc.production_submissions WHERE id = $1", [submissionId])).rows[0].status).toBe("MODERATED");
    expect((await query("SELECT 1 FROM fgc.assessor_reviews WHERE assignment_id = $1 AND status = 'SUBMITTED'", [assessorAssignmentId])).rowCount).toBe(1);
    expect((await query("SELECT 1 FROM fgc.moderation_records WHERE assignment_id = $1 AND status = 'CHANGED'", [moderatorAssignmentId])).rowCount).toBe(1);
    expect((await query("SELECT 1 FROM fgc.production_audit_events WHERE object_id = $1 AND action = 'FINALIZE_MODERATION'", [moderatorAssignmentId])).rowCount).toBe(1);
    await expect(finalizeModeration(moderatorAccess, moderatorAssignmentId, 1, "CONFIRMED", {}, "")).rejects.toMatchObject({ status: 409 });
  });

  it("rejects direct version and scope manipulation at the database boundary", async () => {
    const invalidVersion = "11111111-1111-4111-8111-111111111199";
    await expect(query("INSERT INTO fgc.review_assignments (submission_id, submission_version_id, assignment_type, assignee_user_id, assigned_by, reporting_period_id, college_id, campus_id, reason) VALUES ($1, $2, 'ASSESSOR', $3, $4, $5, $6, $7, 'Synthetic invalid version')", [submissionId, invalidVersion, ids.assessor, ids.jef, ids.period, ids.college, ids.campus])).rejects.toThrow(/version|submission/i);
  });

  it("rolls back each real workflow transaction at its dependent-write fault point", async () => {
    try {
      process.env.FGC_TEST_FAULT_POINT = "lecturer_submission_after_snapshot";
      await saveLecturerDraft(lecturerAccess, ids.rollbackAssignment, values);
      await expect(submitLecturerForm(lecturerAccess, ids.rollbackAssignment, values)).rejects.toThrow("lecturer_submission_after_snapshot");
      const lecturerRollback = await query<{ id: string; status: string; current_version: number }>("SELECT ps.id::text, ps.status::text, ps.current_version FROM fgc.production_submissions ps WHERE ps.assignment_id = $1", [ids.rollbackAssignment]);
      expect(lecturerRollback.rows).toHaveLength(1);
      expect(lecturerRollback.rows[0]).toMatchObject({ status: "READY_FOR_LECTURER_REVIEW", current_version: 1 });
      const rollbackSubmissionId = lecturerRollback.rows[0].id;
      expect((await query("SELECT 1 FROM fgc.production_submission_versions WHERE submission_id = $1", [rollbackSubmissionId])).rowCount).toBe(1);
      expect((await query("SELECT 1 FROM fgc.notifications WHERE related_object_id = $1 AND notification_type = 'LECTURER_SUBMISSION_RECEIVED'", [rollbackSubmissionId])).rowCount).toBe(0);
      expect((await query("SELECT 1 FROM fgc.production_submission_status_history WHERE submission_id = $1 AND new_status = 'SUBMITTED_BY_LECTURER'", [rollbackSubmissionId])).rowCount).toBe(0);
      expect((await query("SELECT 1 FROM fgc.production_audit_events WHERE object_id = $1 AND action = 'SUBMIT_LECTURER_FORM'", [rollbackSubmissionId])).rowCount).toBe(0);
      delete process.env.FGC_TEST_FAULT_POINT;
      await submitLecturerForm(lecturerAccess, ids.rollbackAssignment, values);
      const submittedRollback = await query<{ status: string; current_version: number }>("SELECT status::text, current_version FROM fgc.production_submissions WHERE id = $1", [rollbackSubmissionId]);
      expect(submittedRollback.rows[0]).toMatchObject({ status: "SUBMITTED_BY_LECTURER", current_version: 2 });

      const assessorCase = await assignReviewCase(jefAccess, { type: "ASSESSOR", submissionId: rollbackSubmissionId, assigneeId: ids.assessor, reason: "Synthetic rollback assessor assignment" });
      process.env.FGC_TEST_FAULT_POINT = "assessor_submission_after_review";
      await expect(submitAssessorReview(assessorAccess, assessorCase.assignmentId, 1, { capability: "NOT_ASSESSED" }, "Synthetic rollback assessor rationale")).rejects.toThrow("assessor_submission_after_review");
      expect((await query("SELECT 1 FROM fgc.assessor_reviews WHERE assignment_id = $1 AND status = 'SUBMITTED'", [assessorCase.assignmentId])).rowCount).toBe(0);
      expect((await query("SELECT status::text FROM fgc.production_submissions WHERE id = $1", [rollbackSubmissionId])).rows[0].status).toBe("JEF_REVIEW_PENDING");
      expect((await query("SELECT 1 FROM fgc.notifications WHERE related_object_id = $1 AND notification_type = 'MODERATION_READY'", [rollbackSubmissionId])).rowCount).toBe(0);
      expect((await query("SELECT 1 FROM fgc.production_audit_events WHERE object_id = $1 AND action = 'SUBMIT_ASSESSOR_REVIEW'", [assessorCase.assignmentId])).rowCount).toBe(0);
      delete process.env.FGC_TEST_FAULT_POINT;
      await submitAssessorReview(assessorAccess, assessorCase.assignmentId, 1, { capability: "NOT_ASSESSED" }, "Synthetic successful assessor rationale");
      expect((await query("SELECT 1 FROM fgc.assessor_reviews WHERE assignment_id = $1 AND status = 'SUBMITTED'", [assessorCase.assignmentId])).rowCount).toBe(1);

      const moderatorCase = await assignReviewCase(jefAccess, { type: "MODERATOR", submissionId: rollbackSubmissionId, assigneeId: ids.moderator, reason: "Synthetic rollback moderator assignment" });
      process.env.FGC_TEST_FAULT_POINT = "moderator_finalization_after_decision";
      await expect(finalizeModeration(moderatorAccess, moderatorCase.assignmentId, 1, "CHANGED", { capability: "NOT_ASSESSED" }, "Synthetic rollback moderation rationale")).rejects.toThrow("moderator_finalization_after_decision");
      expect((await query("SELECT 1 FROM fgc.moderation_records WHERE assignment_id = $1 AND finalized_at IS NOT NULL", [moderatorCase.assignmentId])).rowCount).toBe(0);
      expect((await query("SELECT status::text FROM fgc.production_submissions WHERE id = $1", [rollbackSubmissionId])).rows[0].status).toBe("MODERATION_PENDING");
      expect((await query("SELECT 1 FROM fgc.notifications WHERE related_object_id = $1 AND notification_type = 'MODERATION_OUTCOME'", [rollbackSubmissionId])).rowCount).toBe(0);
      expect((await query("SELECT 1 FROM fgc.production_audit_events WHERE object_id = $1 AND action = 'FINALIZE_MODERATION'", [moderatorCase.assignmentId])).rowCount).toBe(0);
      delete process.env.FGC_TEST_FAULT_POINT;
      const final = await finalizeModeration(moderatorAccess, moderatorCase.assignmentId, 1, "CHANGED", { capability: "NOT_ASSESSED" }, "Synthetic successful moderation rationale");
      expect(final.nextWorkflowStatus).toBe("MODERATED");
      expect((await query("SELECT 1 FROM fgc.moderation_records WHERE assignment_id = $1 AND status = 'CHANGED' AND finalized_at IS NOT NULL", [moderatorCase.assignmentId])).rowCount).toBe(1);
      expect((await query("SELECT 1 FROM fgc.notifications WHERE related_object_id = $1 AND notification_type = 'MODERATION_OUTCOME'", [rollbackSubmissionId])).rowCount).toBe(1);
    } finally {
      delete process.env.FGC_TEST_FAULT_POINT;
    }
  });
});
