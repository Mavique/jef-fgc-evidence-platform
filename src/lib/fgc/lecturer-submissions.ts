import { createHash } from "node:crypto";
import { fgcQuery, withFgcTransaction } from "@/lib/fgc/db";
import { throwFgcIntegrationFault } from "@/lib/fgc/test-faults";
import type { FgcCurrentUserResult } from "@/lib/fgc/current-user";
import { evaluateFgcLecturerDraft, fgcLecturerModules, fieldKey, sanitizeFgcLecturerDraft, type FgcLecturerDraftValues } from "@/lib/fgc/lecturer-form";

type ResolvedProductionAccess = Extract<FgcCurrentUserResult, { ok: true }>;
type FgcQueryExecutor = typeof fgcQuery;

type AssignmentRow = {
  id: string;
  template_id: string;
  template_name: string;
  template_code: string;
  assignment_status: string;
  assigned_to: string;
  due_at: string | null;
  reporting_period_id: string | null;
  reporting_period_name: string | null;
  programme_id: string | null;
  college_id: string | null;
  college_name: string | null;
  campus_id: string | null;
  campus_name: string | null;
};

type SubmissionRow = {
  id: string;
  status: string;
  current_version: number;
  updated_at: string;
  submitted_at: string | null;
};

type VersionRow = {
  id: string;
  version: number;
  snapshot: Record<string, unknown>;
  created_at: string;
};

type LecturerEvidenceFileRow = {
  id: string;
  evidence_category: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: string;
  checksum_sha256: string;
  description: string | null;
  review_status: string;
  upload_status: string;
  scanner_status: string;
  evidence_version: number;
  created_at: string;
};

export type LecturerSubmissionSnapshot = {
  values: FgcLecturerDraftValues;
  completion: ReturnType<typeof evaluateFgcLecturerDraft>;
  savedAt: string;
};

export type LecturerFormState = {
  assignment: {
    id: string;
    templateName: string;
    templateCode: string;
    status: string;
    dueAt: string | null;
    reportingPeriod: string | null;
    collegeName: string | null;
    campusName: string | null;
  };
  submission: {
    id: string | null;
    status: string;
    currentVersion: number;
    updatedAt: string | null;
    submittedAt: string | null;
  };
  modules: typeof fgcLecturerModules;
  values: FgcLecturerDraftValues;
  completion: ReturnType<typeof evaluateFgcLecturerDraft>;
  versionHistory: Array<{ version: number; createdAt: string }>;
  evidenceFiles: Array<{ id: string; category: string; filename: string; mimeType: string; sizeBytes: number; checksumSha256: string; description: string | null; reviewStatus: string; uploadStatus: string; scannerStatus: string; version: number; uploadedAt: string; viewUrl: string }>;
};

export class FgcFormAccessError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "FgcFormAccessError";
    this.status = status;
    this.code = code;
  }
}

function checksum(payload: unknown) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function assertLecturerAccess(access: ResolvedProductionAccess) {
  const hasApprovedLecturerRole = access.roles.some((role) => role.code === "LECTURER" && role.status === "APPROVED");
  if (!hasApprovedLecturerRole) {
    throw new FgcFormAccessError(403, "FGC_LECTURER_ROLE_REQUIRED", "Only an approved Lecturer can edit this capture form.");
  }
}

async function getAssignmentForUser(assignmentId: string, userId: string, query: FgcQueryExecutor = fgcQuery) {
  const result = await query<AssignmentRow>(
    `
      SELECT
        fa.id::text,
        fa.template_id::text,
        ft.name AS template_name,
        ft.code AS template_code,
        fa.status AS assignment_status,
        fa.assigned_to::text,
        fa.due_at::text,
        fa.reporting_period_id::text,
        rp.name AS reporting_period_name,
        fa.programme_id::text,
        fa.college_id::text,
        c.official_name AS college_name,
        fa.campus_id::text,
        cs.official_name AS campus_name
      FROM fgc.form_assignments fa
      JOIN fgc.form_templates ft ON ft.id = fa.template_id
      LEFT JOIN fgc.reporting_periods rp ON rp.id = fa.reporting_period_id
      LEFT JOIN fgc.tvet_colleges c ON c.id = fa.college_id
      LEFT JOIN fgc.campus_sites cs ON cs.id = fa.campus_id
      WHERE fa.id = $1
        AND fa.assigned_to = $2
      LIMIT 1
    `,
    [assignmentId, userId]
  );

  const assignment = result.rows[0];
  if (!assignment) {
    throw new FgcFormAccessError(404, "FGC_FORM_ASSIGNMENT_NOT_FOUND", "This FGC form assignment was not found for the signed-in lecturer.");
  }
  return assignment;
}

async function getLatestSubmission(assignmentId: string, userId: string, query: FgcQueryExecutor = fgcQuery) {
  const result = await query<SubmissionRow>(
    `
      SELECT id::text, status::text, current_version, updated_at::text, submitted_at::text
      FROM fgc.production_submissions
      WHERE assignment_id = $1
        AND submitted_by = $2
        AND status <> 'ARCHIVED'
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [assignmentId, userId]
  );
  return result.rows[0] ?? null;
}

async function getLatestVersion(submissionId: string) {
  const result = await fgcQuery<VersionRow>(
    `
      SELECT id::text, version, snapshot, created_at::text
      FROM fgc.production_submission_versions
      WHERE submission_id = $1
      ORDER BY version DESC
      LIMIT 1
    `,
    [submissionId]
  );
  return result.rows[0] ?? null;
}

async function getVersionHistory(submissionId: string | null) {
  if (!submissionId) return [];
  const result = await fgcQuery<{ version: number; created_at: string }>(
    `
      SELECT version, created_at::text
      FROM fgc.production_submission_versions
      WHERE submission_id = $1
      ORDER BY version DESC
      LIMIT 12
    `,
    [submissionId]
  );
  return result.rows.map((row) => ({ version: row.version, createdAt: row.created_at }));
}

async function getEvidenceFiles(submissionId: string | null) {
  if (!submissionId) return [];
  const result = await fgcQuery<LecturerEvidenceFileRow>(
    `
      SELECT id::text, evidence_category, original_filename, mime_type, file_size_bytes::text,
        checksum_sha256, description, review_status::text, upload_status, scanner_status, evidence_version, created_at::text
      FROM fgc.evidence_files
      WHERE submission_id = $1
        AND deleted_at IS NULL
        AND upload_status = 'COMPLETED'
      ORDER BY created_at DESC
    `,
    [submissionId]
  );
  return result.rows.map((row) => ({
    id: row.id,
    category: row.evidence_category,
    filename: row.original_filename,
    mimeType: row.mime_type,
    sizeBytes: Number(row.file_size_bytes),
    checksumSha256: row.checksum_sha256,
    description: row.description,
    reviewStatus: row.review_status,
    uploadStatus: row.upload_status,
    scannerStatus: row.scanner_status,
    version: row.evidence_version,
    uploadedAt: row.created_at,
    viewUrl: `/api/fgc/evidence/files/${row.id}/download`
  }));
}

function snapshotValues(version: VersionRow | null): FgcLecturerDraftValues {
  const values = version?.snapshot?.values;
  if (!values || typeof values !== "object") return {};
  return values as FgcLecturerDraftValues;
}

export async function getLecturerFormState(access: ResolvedProductionAccess, assignmentId: string): Promise<LecturerFormState> {
  assertLecturerAccess(access);
  const assignment = await getAssignmentForUser(assignmentId, access.user.id);
  const submission = await getLatestSubmission(assignmentId, access.user.id);
  const latestVersion = submission ? await getLatestVersion(submission.id) : null;
  const values = snapshotValues(latestVersion);

  return {
    assignment: {
      id: assignment.id,
      templateName: assignment.template_name,
      templateCode: assignment.template_code,
      status: assignment.assignment_status,
      dueAt: assignment.due_at,
      reportingPeriod: assignment.reporting_period_name,
      collegeName: assignment.college_name,
      campusName: assignment.campus_name
    },
    submission: {
      id: submission?.id ?? null,
      status: submission?.status ?? "DRAFT",
      currentVersion: submission?.current_version ?? 0,
      updatedAt: submission?.updated_at ?? null,
      submittedAt: submission?.submitted_at ?? null
    },
    modules: fgcLecturerModules,
    values,
    completion: evaluateFgcLecturerDraft(values),
    versionHistory: await getVersionHistory(submission?.id ?? null),
    evidenceFiles: await getEvidenceFiles(submission?.id ?? null)
  };
}

export async function saveLecturerDraft(access: ResolvedProductionAccess, assignmentId: string, values: FgcLecturerDraftValues, reason = "Lecturer draft autosaved") {
  assertLecturerAccess(access);

  return withFgcTransaction((query) => saveLecturerDraftWithinTransaction(access, assignmentId, values, reason, query));
}

async function saveLecturerDraftWithinTransaction(
  access: ResolvedProductionAccess,
  assignmentId: string,
  values: FgcLecturerDraftValues,
  reason: string,
  query: FgcQueryExecutor
) {
  const sanitizedValues = sanitizeFgcLecturerDraft(values);
  const completion = evaluateFgcLecturerDraft(sanitizedValues);
  const now = new Date().toISOString();

  const assignment = await getAssignmentForUser(assignmentId, access.user.id, query);
  let submission = await getLatestSubmission(assignmentId, access.user.id, query);
    if (submission?.status && !["DRAFT", "READY_FOR_LECTURER_REVIEW", "CLARIFICATION_REQUESTED", "RESUBMITTED"].includes(submission.status)) {
      throw new FgcFormAccessError(409, "FGC_SUBMISSION_LOCKED", "This submission has already been submitted and cannot be edited as a draft.");
    }

    if (!submission) {
      const created = await query<SubmissionRow>(
        `
          INSERT INTO fgc.production_submissions (
            assignment_id,
            submitted_by,
            reporting_period_id,
            programme_id,
            college_id,
            campus_id,
            status,
            current_version
          )
          VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT', 0)
          RETURNING id::text, status::text, current_version, updated_at::text, submitted_at::text
        `,
        [assignment.id, access.user.id, assignment.reporting_period_id, assignment.programme_id, assignment.college_id, assignment.campus_id]
      );
      submission = created.rows[0];
    }

    const nextVersion = submission.current_version + 1;
    const snapshot: LecturerSubmissionSnapshot = { values: sanitizedValues, completion, savedAt: now };
    const insertedVersion = await query<{ id: string }>(
      `
        INSERT INTO fgc.production_submission_versions (
          submission_id,
          version,
          status_at_snapshot,
          snapshot,
          snapshot_checksum,
          created_by
        )
        VALUES ($1, $2, 'DRAFT', $3::jsonb, $4, $5)
        RETURNING id::text
      `,
      [submission.id, nextVersion, JSON.stringify(snapshot), checksum(snapshot), access.user.id]
    );

    for (const captureModule of fgcLecturerModules) {
      for (const field of captureModule.fields) {
        const key = fieldKey(captureModule.code, field.code);
        const value = sanitizedValues[key] ?? "";
        await query(
          `
            INSERT INTO fgc.production_response_values (
              submission_version_id,
              section_code,
              field_code,
              value_json,
              evidence_kind
            )
            VALUES ($1, $2, $3, $4::jsonb, $5::fgc.evidence_source_kind)
          `,
          [insertedVersion.rows[0].id, captureModule.code, field.code, JSON.stringify(value), field.evidenceKind]
        );
      }
    }

    await query(
      `
        UPDATE fgc.production_submissions
        SET current_version = $2,
            status = CASE WHEN $3 THEN 'READY_FOR_LECTURER_REVIEW'::fgc.submission_lifecycle_status ELSE 'DRAFT'::fgc.submission_lifecycle_status END,
            updated_at = now()
        WHERE id = $1
      `,
      [submission.id, nextVersion, completion.complete]
    );

    await query("UPDATE fgc.form_assignments SET status = 'IN_PROGRESS' WHERE id = $1 AND status = 'ASSIGNED'", [assignment.id]);
    await query(
      `
        INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, object_id, reason, metadata)
        VALUES ($1, 'LECTURER', 'SAVE_LECTURER_DRAFT', 'production_submission', $2, $3, $4::jsonb)
      `,
      [access.user.id, submission.id, reason, JSON.stringify({ assignmentId, version: nextVersion, completionPercent: completion.completionPercent })]
    );

  return { submissionId: submission.id, version: nextVersion, completion };
}

export async function submitLecturerForm(access: ResolvedProductionAccess, assignmentId: string, values: FgcLecturerDraftValues) {
  assertLecturerAccess(access);
  const sanitizedValues = sanitizeFgcLecturerDraft(values);
  const completion = evaluateFgcLecturerDraft(sanitizedValues);
  if (!completion.complete) {
    throw new FgcFormAccessError(422, "FGC_SUBMISSION_INCOMPLETE", "Complete all required lecturer capture fields before final submission.");
  }

  return withFgcTransaction(async (query) => {
    const saved = await saveLecturerDraftWithinTransaction(access, assignmentId, sanitizedValues, "Lecturer saved final submission snapshot", query);
    throwFgcIntegrationFault("lecturer_submission_after_snapshot");
    await query(
      `
        UPDATE fgc.production_submissions
        SET status = 'SUBMITTED_BY_LECTURER',
            submitted_at = now(),
            locked_at = now(),
            locked_by = $2,
            updated_at = now()
        WHERE id = $1
      `,
      [saved.submissionId, access.user.id]
    );
    await query("UPDATE fgc.form_assignments SET status = 'SUBMITTED' WHERE id = $1", [assignmentId]);
    await query(
      `
        INSERT INTO fgc.production_submission_status_history (
          submission_id,
          previous_status,
          new_status,
          changed_by,
          changed_role,
          reason,
          comments
        )
        VALUES ($1, 'READY_FOR_LECTURER_REVIEW', 'SUBMITTED_BY_LECTURER', $2, 'LECTURER', 'Lecturer final submission', 'Submission locked as immutable lecturer snapshot.')
      `,
      [saved.submissionId, access.user.id]
    );
    await query(
      `
        INSERT INTO fgc.notifications (user_id, channel, notification_type, subject, body, status, related_object_type, related_object_id, sent_at)
        VALUES ($1, 'IN_APP', 'LECTURER_SUBMISSION_RECEIVED', 'FGC form submitted', 'Your lecturer FGC evidence form has been submitted for governed review.', 'SENT', 'production_submission', $2, now())
      `,
      [access.user.id, saved.submissionId]
    );
    await query(
      `
        INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, object_id, reason, metadata)
        VALUES ($1, 'LECTURER', 'SUBMIT_LECTURER_FORM', 'production_submission', $2, 'Lecturer submitted complete FGC evidence form', $3::jsonb)
      `,
      [access.user.id, saved.submissionId, JSON.stringify({ assignmentId, version: saved.version, completionPercent: saved.completion.completionPercent })]
    );

    return saved;
  });
}
