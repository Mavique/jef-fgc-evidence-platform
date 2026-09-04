import { describe, expect, it, beforeEach, vi } from "vitest";
import type { FgcCurrentUserResult } from "@/lib/fgc/current-user";

const db = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock("@/lib/fgc/db", () => ({
  fgcQuery: (...args: unknown[]) => db.query(...args),
  withFgcTransaction: async (callback: (query: typeof db.query) => Promise<unknown>) => callback(db.query)
}));

const submissionId = "11111111-1111-4111-8111-111111111111";
const versionId = "22222222-2222-4222-8222-222222222222";
const assignmentId = "33333333-3333-4333-8333-333333333333";
const assigneeId = "44444444-4444-4444-8444-444444444444";
const jefId = "55555555-5555-4555-8555-555555555555";
const collegeId = "66666666-6666-4666-8666-666666666666";
const campusId = "77777777-7777-4777-8777-777777777777";

function access(state: "JEF_ADMIN_ACTIVE" | "ASSESSOR_ACTIVE" | "MODERATOR_ACTIVE", code: string, userId = jefId): Extract<FgcCurrentUserResult, { ok: true }> {
  return {
    ok: true,
    user: { id: userId, email: "reviewer@example.invalid", name: "Reviewer", firstName: "Review", surname: "User", accountState: "ACTIVE", emailVerified: true, lastLoginAt: null },
    roles: [],
    formAssignments: [],
    session: { expiresAt: "2027-01-01T00:00:00.000Z", createdAt: "2026-01-01T00:00:00.000Z" },
    diagnostic: "SESSION_RESOLVED",
    access: {
      accessState: state,
      expectedPortal: "/fgc-ekm",
      activeRole: { id: "role", code, name: code, status: "APPROVED", organisationId: null, organisationName: null, collegeId, collegeName: "Scoped College", campusId, campusName: "Scoped Campus", approvedAt: "2026-01-01T00:00:00.000Z" },
      canOpenProtectedWorkspace: true
    }
  };
}

function submissionRow() {
  return { id: submissionId, submitted_by: "88888888-8888-4888-8888-888888888888", reporting_period_id: "99999999-9999-4999-8999-999999999999", college_id: collegeId, campus_id: campusId, programme_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", status: "JEF_REVIEW_PENDING", current_version: 3, version_id: versionId };
}

beforeEach(() => db.query.mockReset());

describe("FGC canonical review assignments", () => {
  it("denies platform technical administrators and out-of-scope JEF actors", async () => {
    const { assignReviewCase } = await import("@/lib/fgc/review-workflow");
    await expect(assignReviewCase(access("JEF_ADMIN_ACTIVE", "PLATFORM_SUPER_ADMINISTRATOR"), { type: "ASSESSOR", submissionId, assigneeId, reason: "Assign within governed review scope" })).rejects.toMatchObject({ status: 403, code: "FGC_ASSIGNMENT_ADMIN_REQUIRED" });
    await expect(assignReviewCase({ ...access("JEF_ADMIN_ACTIVE", "JEF_ADMINISTRATOR"), access: { ...access("JEF_ADMIN_ACTIVE", "JEF_ADMINISTRATOR").access, activeRole: { ...access("JEF_ADMIN_ACTIVE", "JEF_ADMINISTRATOR").access.activeRole!, collegeId: null, campusId: null } } }, { type: "ASSESSOR", submissionId, assigneeId, reason: "Assign within governed review scope" })).rejects.toMatchObject({ status: 403, code: "FGC_ASSIGNMENT_SCOPE_REQUIRED" });
    expect(db.query).not.toHaveBeenCalled();
  });

  it("validates active role, scope, and conflict of interest before assignment", async () => {
    const { assignReviewCase } = await import("@/lib/fgc/review-workflow");
    db.query.mockResolvedValueOnce({ rows: [submissionRow()] }).mockResolvedValueOnce({ rows: [] });
    await expect(assignReviewCase(access("JEF_ADMIN_ACTIVE", "JEF_ADMINISTRATOR"), { type: "ASSESSOR", submissionId, assigneeId, reason: "Assign within governed review scope" })).rejects.toMatchObject({ code: "FGC_REVIEW_ASSIGNEE_INVALID" });
    db.query.mockReset();
    db.query.mockResolvedValueOnce({ rows: [{ ...submissionRow(), submitted_by: assigneeId }] });
    await expect(assignReviewCase(access("JEF_ADMIN_ACTIVE", "JEF_ADMINISTRATOR"), { type: "ASSESSOR", submissionId, assigneeId, reason: "Assign within governed review scope" })).rejects.toMatchObject({ code: "FGC_REVIEW_CONFLICT_OF_INTEREST" });
  });

  it("creates an exact-version assignment and deep-linked notification atomically", async () => {
    const { assignReviewCase } = await import("@/lib/fgc/review-workflow");
    db.query
      .mockResolvedValueOnce({ rows: [submissionRow()] })
      .mockResolvedValueOnce({ rows: [{ id: assigneeId }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: assignmentId }] })
      .mockResolvedValue({ rows: [] });
    const result = await assignReviewCase(access("JEF_ADMIN_ACTIVE", "JEF_ADMINISTRATOR"), { type: "ASSESSOR", submissionId, assigneeId, reason: "Assign within governed review scope", dueAt: null });
    expect(result).toMatchObject({ assignmentId, submissionId, submissionVersionId: versionId, type: "ASSESSOR", status: "ASSIGNED" });
    const insert = db.query.mock.calls.find(([sql]) => String(sql).includes("INSERT INTO fgc.review_assignments"));
    expect(insert?.[1]).toContain(versionId);
    const notification = db.query.mock.calls.find(([sql]) => String(sql).includes("INSERT INTO fgc.notifications"));
    expect(notification?.[0]).toContain("related_object_type");
    expect(notification?.[1]).toContain(assignmentId);
  });

  it("rejects wrong-role or inactive assignees and duplicate active assignments", async () => {
    const { assignReviewCase } = await import("@/lib/fgc/review-workflow");
    db.query.mockResolvedValueOnce({ rows: [{ ...submissionRow(), status: "MODERATION_PENDING" }] }).mockResolvedValueOnce({ rows: [] });
    await expect(assignReviewCase(access("JEF_ADMIN_ACTIVE", "JEF_ADMINISTRATOR"), { type: "MODERATOR", submissionId, assigneeId, reason: "Assign within governed review scope" })).rejects.toMatchObject({ code: "FGC_ASSESSOR_REVIEW_REQUIRED" });
    db.query.mockReset();
    db.query.mockResolvedValueOnce({ rows: [submissionRow()] }).mockResolvedValueOnce({ rows: [{ id: assigneeId }] }).mockResolvedValueOnce({ rows: [{ id: assignmentId, concurrency_version: 2 }] });
    await expect(assignReviewCase(access("JEF_ADMIN_ACTIVE", "JEF_ADMINISTRATOR"), { type: "ASSESSOR", submissionId, assigneeId, reason: "Assign within governed review scope" })).rejects.toMatchObject({ status: 409, code: "FGC_ACTIVE_ASSIGNMENT_EXISTS" });
  });

  it("requires a reassignment reason and preserves the previous assignment", async () => {
    const { assignReviewCase } = await import("@/lib/fgc/review-workflow");
    await expect(assignReviewCase(access("JEF_ADMIN_ACTIVE", "JEF_ADMINISTRATOR"), { type: "ASSESSOR", submissionId, assigneeId, reason: "short", replaceAssignmentId: assignmentId, expectedConcurrencyVersion: 1 })).rejects.toMatchObject({ code: "FGC_ASSIGNMENT_REASON_REQUIRED" });
    db.query.mockResolvedValueOnce({ rows: [submissionRow()] }).mockResolvedValueOnce({ rows: [{ id: assigneeId }] }).mockResolvedValueOnce({ rows: [{ id: assignmentId, concurrency_version: 4 }] }).mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ id: "aaaaaaaa-aaaa-4aaa-8aaa-bbbbbbbbbbbb" }] }).mockResolvedValue({ rows: [] });
    const result = await assignReviewCase(access("JEF_ADMIN_ACTIVE", "JEF_ADMINISTRATOR"), { type: "ASSESSOR", submissionId, assigneeId, reason: "Reassign after conflict review", replaceAssignmentId: assignmentId, expectedConcurrencyVersion: 4 });
    expect(result.reassignmentOf).toBe(assignmentId);
    expect(db.query.mock.calls.some(([sql]) => String(sql).includes("status = 'SUPERSEDED'"))).toBe(true);
  });

  it("exposes only active assignments to the assigned assessor and denies unassigned access", async () => {
    const { listReviewQueue, getReviewCase } = await import("@/lib/fgc/review-workflow");
    db.query.mockResolvedValueOnce({ rows: [{ id: assignmentId, submission_id: submissionId, submission_version_id: versionId, assignment_type: "ASSESSOR", assignee_user_id: assigneeId, status: "ASSIGNED", assigned_at: "2026-01-01", started_at: null, due_at: null, completed_at: null, reason: "Assigned case", concurrency_version: 1, submission_reference: "FGC-2026-11111111", lecturer_name: "Lecturer", college_name: "Scoped College", campus_name: "Scoped Campus", programme_name: "Programme", reporting_period_name: "Period", submission_status: "JEF_REVIEW_PENDING", current_version: 3, updated_at: "2026-01-01", evidence_count: "2", evidence_pending_count: "1" }] });
    const queue = await listReviewQueue(access("ASSESSOR_ACTIVE", "ASSESSOR", assigneeId), "ASSESSOR");
    expect(queue).toHaveLength(1);
    expect(String(db.query.mock.calls[0][0])).toContain("ra.assignee_user_id = $2");
    db.query.mockResolvedValueOnce({ rows: [] });
    await expect(getReviewCase(access("ASSESSOR_ACTIVE", "ASSESSOR", "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"), assignmentId, "ASSESSOR")).rejects.toMatchObject({ status: 404, code: "FGC_REVIEW_ASSIGNMENT_NOT_FOUND" });
  });

  it("rejects stale optimistic-concurrency writes and preserves lecturer data during assessor handoff", async () => {
    const { saveAssessorDraft, submitAssessorReview } = await import("@/lib/fgc/review-workflow");
    const caseRow = { id: assignmentId, submission_id: submissionId, submission_version_id: versionId, assignment_type: "ASSESSOR", assignee_user_id: assigneeId, status: "IN_PROGRESS", assigned_at: "2026-01-01", started_at: "2026-01-01", due_at: null, completed_at: null, reason: "Assigned case", concurrency_version: 2, submission_reference: "FGC-2026-11111111", lecturer_name: "Lecturer", college_name: "Scoped College", campus_name: "Scoped Campus", programme_name: "Programme", reporting_period_name: "Period", submission_status: "JEF_REVIEW_PENDING", current_version: 3, updated_at: "2026-01-01", evidence_count: "1", evidence_pending_count: "0", submission_snapshot: { values: { "learner_cohort.programme_name": "Canonical Programme" } }, assessor_review_id: null, assessor_review_status: null, assessor_decisions: null, assessor_rationale: null, assessor_submitted_at: null, moderation_record_id: null, moderation_status: null, moderation_outcome: null, moderation_reason: null };
    db.query.mockResolvedValueOnce({ rows: [caseRow] }).mockResolvedValueOnce({ rows: [] });
    await expect(saveAssessorDraft(access("ASSESSOR_ACTIVE", "ASSESSOR", assigneeId), assignmentId, 1, { outcome: "INDEPENDENT" }, "Draft rationale")).rejects.toMatchObject({ code: "FGC_ASSIGNMENT_CONFLICT" });
    expect(db.query.mock.calls.some(([sql]) => String(sql).includes("production_response_values"))).toBe(false);
    db.query.mockReset();
    db.query.mockResolvedValueOnce({ rows: [caseRow] }).mockResolvedValueOnce({ rows: [{ id: assignmentId }] }).mockResolvedValue({ rows: [] });
    const result = await submitAssessorReview(access("ASSESSOR_ACTIVE", "ASSESSOR", assigneeId), assignmentId, 2, { outcome: "INDEPENDENT" }, "Assessor decision rationale");
    expect(result.nextWorkflowStatus).toBe("MODERATION_PENDING");
    expect(db.query.mock.calls.some(([sql]) => String(sql).includes("UPDATE fgc.production_submissions SET status = 'MODERATION_PENDING'"))).toBe(true);
  });

  it("requires a completed assessor review before moderator assignment and preserves assessor outcome on finalization", async () => {
    const { assignReviewCase, finalizeModeration } = await import("@/lib/fgc/review-workflow");
    db.query.mockResolvedValueOnce({ rows: [{ ...submissionRow(), status: "MODERATION_PENDING" }] }).mockResolvedValueOnce({ rows: [] });
    await expect(assignReviewCase(access("JEF_ADMIN_ACTIVE", "JEF_ADMINISTRATOR"), { type: "MODERATOR", submissionId, assigneeId, reason: "Assign moderator within scope" })).rejects.toMatchObject({ code: "FGC_ASSESSOR_REVIEW_REQUIRED" });
    const moderatorCase = { id: assignmentId, submission_id: submissionId, submission_version_id: versionId, assignment_type: "MODERATOR", assignee_user_id: assigneeId, status: "IN_PROGRESS", assigned_at: "2026-01-01", started_at: "2026-01-01", due_at: null, completed_at: null, reason: "Assigned case", concurrency_version: 2, submission_reference: "FGC-2026-11111111", lecturer_name: "Lecturer", college_name: "Scoped College", campus_name: "Scoped Campus", programme_name: "Programme", reporting_period_name: "Period", submission_status: "MODERATION_PENDING", current_version: 3, updated_at: "2026-01-01", evidence_count: "1", evidence_pending_count: "0", submission_snapshot: {}, assessor_review_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", assessor_review_status: "SUBMITTED", assessor_decisions: { outcome: "INDEPENDENT" }, assessor_rationale: "Original assessor rationale", assessor_submitted_at: "2026-01-01", moderation_record_id: null, moderation_status: null, moderation_outcome: null, moderation_reason: null };
    db.query.mockReset();
    db.query.mockResolvedValueOnce({ rows: [moderatorCase] }).mockResolvedValueOnce({ rows: [{ id: moderatorCase.assessor_review_id }] }).mockResolvedValueOnce({ rows: [{ id: assignmentId }] }).mockResolvedValue({ rows: [] });
    const result = await finalizeModeration(access("MODERATOR_ACTIVE", "MODERATOR", assigneeId), assignmentId, 2, "CHANGED", { outcome: "PARTIAL" }, "Moderator found a material evidence gap");
    expect(result.nextWorkflowStatus).toBe("MODERATED");
    expect(db.query.mock.calls.some(([sql]) => String(sql).includes("assessor_review_id"))).toBe(true);
  });

  it("does not permit moderator amendment without a reason or access after revocation", async () => {
    const { finalizeModeration, revokeOrSupersedeAssignment } = await import("@/lib/fgc/review-workflow");
    await expect(finalizeModeration(access("MODERATOR_ACTIVE", "MODERATOR", assigneeId), assignmentId, 1, "CHANGED", {}, "")).rejects.toMatchObject({ code: "FGC_MODERATION_REASON_REQUIRED" });
    db.query.mockResolvedValueOnce({ rows: [{ id: assignmentId, submission_id: submissionId, assignment_type: "ASSESSOR", status: "ASSIGNED", concurrency_version: 1 }] }).mockResolvedValueOnce({ rows: [{ id: assignmentId }] }).mockResolvedValue({ rows: [] });
    const result = await revokeOrSupersedeAssignment(access("JEF_ADMIN_ACTIVE", "JEF_ADMINISTRATOR"), assignmentId, 1, "Reviewer conflict requires revocation", "REVOKE");
    expect(result.status).toBe("REVOKED");
    expect(db.query.mock.calls.some(([sql]) => String(sql).includes("status = $2"))).toBe(true);
  });

  it("binds reviewer evidence to the assigned immutable version", async () => {
    const { getReviewCase } = await import("@/lib/fgc/review-workflow");
    const caseRow = { id: assignmentId, submission_id: submissionId, submission_version_id: versionId, assignment_type: "ASSESSOR", assignee_user_id: assigneeId, status: "IN_PROGRESS", assigned_at: "2026-01-01", started_at: "2026-01-01", due_at: null, completed_at: null, reason: "Assigned case", concurrency_version: 2, submission_reference: "FGC-2026-11111111", lecturer_name: "Lecturer", college_name: "Scoped College", campus_name: "Scoped Campus", programme_name: "Programme", reporting_period_name: "Period", submission_status: "JEF_REVIEW_PENDING", current_version: 3, updated_at: "2026-01-01", evidence_count: "1", evidence_pending_count: "0", submission_snapshot: {}, assessor_review_id: null, assessor_review_status: null, assessor_decisions: null, assessor_rationale: null, assessor_submitted_at: null, moderation_record_id: null, moderation_status: null, moderation_outcome: null, moderation_reason: null };
    db.query.mockResolvedValueOnce({ rows: [caseRow] }).mockResolvedValue({ rows: [] });
    await getReviewCase(access("ASSESSOR_ACTIVE", "ASSESSOR", assigneeId), assignmentId, "ASSESSOR");
    const evidenceQuery = db.query.mock.calls.find(([sql]) => String(sql).includes("SELECT id::text, original_filename"));
    expect(evidenceQuery?.[0]).toContain("submission_version_id = $2");
    expect(evidenceQuery?.[1]).toContain(versionId);
  });

  it("rejects unsafe structured decision keys and stale assignment closure", async () => {
    const { saveAssessorDraft, revokeOrSupersedeAssignment } = await import("@/lib/fgc/review-workflow");
    await expect(saveAssessorDraft(access("ASSESSOR_ACTIVE", "ASSESSOR", assigneeId), assignmentId, 1, { constructor: "unsafe" }, "Draft rationale")).rejects.toMatchObject({ code: "FGC_ASSESSOR_DECISIONS_INVALID" });
    db.query.mockResolvedValueOnce({ rows: [{ id: assignmentId, submission_id: submissionId, assignment_type: "ASSESSOR", status: "IN_PROGRESS", concurrency_version: 4 }] }).mockResolvedValueOnce({ rows: [] });
    await expect(revokeOrSupersedeAssignment(access("JEF_ADMIN_ACTIVE", "JEF_ADMINISTRATOR"), assignmentId, 3, "Reviewer conflict requires revocation", "REVOKE")).rejects.toMatchObject({ code: "FGC_ASSIGNMENT_CONFLICT" });
  });
});
