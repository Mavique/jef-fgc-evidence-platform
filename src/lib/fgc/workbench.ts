import { createHash } from "node:crypto";
import { FgcConfigurationError, fgcQuery, withFgcTransaction } from "@/lib/fgc/db";
import type { FgcCurrentUserResult } from "@/lib/fgc/current-user";
import { getFgcRuntimeConfig } from "@/lib/fgc/env";
import { fieldKey, fgcLecturerModules } from "@/lib/fgc/lecturer-form";
import { getFgcProductionMetricsSummary } from "@/lib/fgc/metrics";

type Access = Extract<FgcCurrentUserResult, { ok: true }>;
type FgcQueryExecutor = typeof fgcQuery;

export class FgcWorkbenchAccessError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = "FgcWorkbenchAccessError";
  }
}

export type FgcWorkbenchSubmission = {
  id: string;
  assignmentId: string | null;
  submitterName: string;
  submitterEmail: string;
  status: string;
  currentVersion: number;
  updatedAt: string;
  submittedAt: string | null;
  collegeName: string | null;
  campusName: string | null;
  templateName: string | null;
  completionPercent: number;
  evidenceManifest: string;
  programmeName: string;
  moduleName: string;
  sourceStatus: string;
};

export type FgcRoleWorkbench = {
  generatedAt: string;
  accessState: Access["access"]["accessState"];
  roleCode: string | null;
  roleName: string | null;
  readOnly: boolean;
  scope: { label: string; collegeName: string | null; campusName: string | null };
  metrics: Awaited<ReturnType<typeof getFgcProductionMetricsSummary>>;
  submissions: FgcWorkbenchSubmission[];
  queues: Array<{ id: string; label: string; count: number; description: string }>;
  notifications: Array<{ id: string; subject: string; body: string; status: string; createdAt: string }>;
  reports: Array<{ id: string; identifier: string; type: string; scope: string; status: string; createdAt: string }>;
  auditEvents: Array<{ id: string; actorRole: string | null; action: string; objectType: string; reason: string | null; createdAt: string }>;
};

export type FgcSubmissionDetailField = {
  sectionCode: string;
  sectionTitle: string;
  fieldCode: string;
  label: string;
  value: string;
  evidenceKind: string;
  sourceStatus: string;
  verificationStatus: string;
  version: number;
  capturedAt: string;
};

export type FgcSubmissionDetailSection = {
  code: string;
  title: string;
  purpose: string;
  fields: FgcSubmissionDetailField[];
};

export type FgcSubmissionDetail = {
  id: string;
  reference: string;
  assignmentId: string | null;
  submitterName: string;
  submitterEmail: string;
  status: string;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  collegeName: string | null;
  campusName: string | null;
  templateName: string | null;
  reportingPeriodName: string | null;
  completionPercent: number;
  verificationStatus: string;
  evidenceCompletenessStatus: string;
  sourceStatus: string;
  sections: FgcSubmissionDetailSection[];
  versions: Array<{ id: string; version: number; status: string; checksum: string; createdAt: string; createdBy: string | null }>;
  evidenceFiles: Array<{ id: string; category: string; filename: string; mimeType: string; sizeBytes: number; checksumSha256: string; documentDate: string | null; description: string | null; confidentiality: string; reviewStatus: string; uploadStatus: string; scannerStatus: string; version: number; sectionCode: string | null; fieldCode: string | null; uploadedAt: string; viewUrl: string }>;
  evidenceReviews: Array<{ id: string; evidenceFileId: string | null; decision: string; decisionReason: string; reviewerNotes: string | null; reviewedBy: string; createdAt: string }>;
  statusHistory: Array<{ id: string; previousStatus: string | null; newStatus: string; changedRole: string | null; reason: string; comments: string | null; createdAt: string }>;
  auditEvents: Array<{ id: string; actorRole: string | null; action: string; reason: string | null; createdAt: string }>;
};

function checksum(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function assertWorkbench(access: Access) {
  if (!access.access.canOpenProtectedWorkspace) {
    throw new FgcWorkbenchAccessError(403, "FGC_WORKBENCH_FORBIDDEN", "An approved production role is required.");
  }
}

function scopeWhere(access: Access) {
  if (access.access.accessState === "LECTURER_ACTIVE") return { sql: "ps.submitted_by = $1", values: [access.user.id] };
  if (access.access.accessState === "COLLEGE_ACTIVE") {
    const role = access.access.activeRole;
    if (!role?.collegeId) return { sql: "false", values: [] as string[] };
    return role.campusId
      ? { sql: "ps.college_id = $1 AND ps.campus_id = $2", values: [role.collegeId, role.campusId] }
      : { sql: "ps.college_id = $1", values: [role.collegeId] };
  }
  return { sql: "true", values: [] as string[] };
}

function submissionReference(id: string, createdAt: string | null) {
  const year = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
  return `FGC-${Number.isFinite(year) ? year : new Date().getFullYear()}-${id.slice(0, 8).toUpperCase()}`;
}

function stringifyFieldValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(stringifyFieldValue).filter(Boolean).join(", ");
  if (typeof value === "object" && "value" in value) return stringifyFieldValue((value as { value?: unknown }).value);
  return JSON.stringify(value);
}

function fieldLookup() {
  const lookup = new Map<string, { sectionTitle: string; sectionPurpose: string; label: string; evidenceKind: string }>();
  for (const formModule of fgcLecturerModules) {
    for (const field of formModule.fields) {
      lookup.set(fieldKey(formModule.code, field.code), {
        sectionTitle: formModule.title,
        sectionPurpose: formModule.purpose,
        label: field.label,
        evidenceKind: field.evidenceKind
      });
    }
  }
  return lookup;
}

export async function assertSubmissionVisibleToAccess(access: Access, submissionId: string, query: FgcQueryExecutor = fgcQuery) {
  assertWorkbench(access);
  const scoped = scopeWhere(access);
  const result = await query<{ id: string }>(
    `SELECT ps.id::text FROM fgc.production_submissions ps WHERE ps.id = $${scoped.values.length + 1} AND ${scoped.sql} LIMIT 1`,
    [...scoped.values, submissionId]
  );
  if (!result.rows[0]) throw new FgcWorkbenchAccessError(404, "FGC_SUBMISSION_NOT_VISIBLE", "The selected submission is not available in this role scope.");
}

function snapshotValues(snapshot: Record<string, unknown> | null) {
  const values = snapshot?.values && typeof snapshot.values === "object" ? snapshot.values as Record<string, string> : {};
  const completion = snapshot?.completion && typeof snapshot.completion === "object" ? snapshot.completion as { completionPercent?: number } : {};
  return { values, completionPercent: Number(completion.completionPercent ?? 0) };
}

function queues(access: Access, submissions: FgcWorkbenchSubmission[]) {
  const reviewReady = submissions.filter((item) => ["SUBMITTED_BY_LECTURER", "COLLEGE_REVIEW_PENDING", "JEF_REVIEW_PENDING"].includes(item.status)).length;
  const moderation = submissions.filter((item) => item.status === "MODERATION_PENDING").length;
  const clarification = submissions.filter((item) => item.status === "CLARIFICATION_REQUESTED").length;
  const draft = submissions.filter((item) => item.status === "DRAFT" || item.status === "READY_FOR_LECTURER_REVIEW").length;
  const submitted = submissions.filter((item) => item.status !== "DRAFT").length;

  if (access.access.accessState === "LECTURER_ACTIVE") return [
    { id: "drafts", label: "Drafts", count: draft, description: "Forms still editable by the lecturer." },
    { id: "submitted", label: "Submitted", count: submitted, description: "Evidence packs already in the governed workflow." },
    { id: "clarification", label: "Clarifications", count: clarification, description: "Items returned for correction." }
  ];
  if (access.access.accessState === "COLLEGE_ACTIVE") return [
    { id: "college-review", label: "College review", count: reviewReady, description: "Lecturer evidence awaiting institutional enrichment." },
    { id: "evidence-gaps", label: "Evidence gaps", count: submissions.filter((item) => !item.evidenceManifest).length, description: "Submissions without an evidence manifest." },
    { id: "clarification", label: "Clarifications", count: clarification, description: "College-scoped items needing detail." }
  ];
  if (access.access.accessState === "ASSESSOR_ACTIVE") return [
    { id: "review", label: "Evidence review", count: reviewReady, description: "Cases ready for assessor review." },
    { id: "contradictions", label: "Contradictions", count: submissions.filter((item) => /contradict|gap|missing/i.test(item.evidenceManifest)).length, description: "Potential conflicts or gaps." },
    { id: "moderation-ready", label: "Sent to moderation", count: moderation, description: "Reviews submitted for moderation." }
  ];
  if (access.access.accessState === "MODERATOR_ACTIVE") return [
    { id: "moderation", label: "Moderation pending", count: moderation, description: "Assessor decisions awaiting QA." },
    { id: "borderline", label: "Borderline", count: submissions.filter((item) => item.completionPercent < 100).length, description: "Cases with weaker evidence profiles." },
    { id: "finalised", label: "Moderated", count: submissions.filter((item) => item.status === "MODERATED").length, description: "Moderation outcomes recorded." }
  ];
  if (access.access.accessState === "MERSETA_ACTIVE") return [
    { id: "reports", label: "Reports", count: submissions.filter((item) => ["MODERATED", "VERIFIED", "PARTIALLY_VERIFIED"].includes(item.status)).length, description: "Read-only outcomes for oversight." },
    { id: "limitations", label: "Limitations", count: submissions.filter((item) => item.status !== "VERIFIED").length, description: "Records carrying limitations." },
    { id: "interventions", label: "Interventions", count: clarification, description: "Visible correction backlog." }
  ];
  return [
    { id: "pipeline", label: "Review pipeline", count: reviewReady, description: "Evidence packs before final moderation." },
    { id: "moderation", label: "Moderation", count: moderation, description: "Cases awaiting moderator decision." },
    { id: "clarification", label: "Clarification", count: clarification, description: "Records requiring additional information." }
  ];
}

export async function getFgcRoleWorkbench(access: Access): Promise<FgcRoleWorkbench> {
  assertWorkbench(access);
  const scoped = scopeWhere(access);
  const [metrics, submissionsResult, notificationsResult, reportsResult, auditResult] = await Promise.all([
    getFgcProductionMetricsSummary(access),
    fgcQuery<{
      id: string; assignment_id: string | null; submitter_name: string; submitter_email: string; status: string; current_version: number; updated_at: string; submitted_at: string | null; college_name: string | null; campus_name: string | null; template_name: string | null; snapshot: Record<string, unknown> | null;
    }>(`
      SELECT ps.id::text, ps.assignment_id::text, (u.first_name || ' ' || u.surname) AS submitter_name,
        u.email::text AS submitter_email, ps.status::text, ps.current_version, ps.updated_at::text,
        ps.submitted_at::text, c.official_name AS college_name, cs.official_name AS campus_name,
        ft.name AS template_name, latest.snapshot
      FROM fgc.production_submissions ps
      JOIN fgc.production_users u ON u.id = ps.submitted_by
      LEFT JOIN fgc.form_assignments fa ON fa.id = ps.assignment_id
      LEFT JOIN fgc.form_templates ft ON ft.id = fa.template_id
      LEFT JOIN fgc.tvet_colleges c ON c.id = ps.college_id
      LEFT JOIN fgc.campus_sites cs ON cs.id = ps.campus_id
      LEFT JOIN LATERAL (
        SELECT snapshot FROM fgc.production_submission_versions psv
        WHERE psv.submission_id = ps.id ORDER BY psv.version DESC LIMIT 1
      ) latest ON true
      WHERE ${scoped.sql}
      ORDER BY ps.updated_at DESC
      LIMIT 80
    `, scoped.values),
    fgcQuery<{ id: string; subject: string; body: string; status: string; created_at: string }>(`
      SELECT id::text, subject, body, status::text, created_at::text
      FROM fgc.notifications
      WHERE user_id = $1 OR $2 IN ('JEF_ADMIN_ACTIVE', 'PLATFORM_SUPER_ACTIVE')
      ORDER BY created_at DESC LIMIT 20
    `, [access.user.id, access.access.accessState]),
    fgcQuery<{ id: string; report_identifier: string; report_type: string; scope: string; status: string; created_at: string }>(`
      SELECT id::text, report_identifier, report_type, scope, status::text, created_at::text
      FROM fgc.generated_reports ORDER BY created_at DESC LIMIT 20
    `),
    fgcQuery<{ id: string; actor_role: string | null; action: string; object_type: string; reason: string | null; created_at: string }>(`
      SELECT id::text, actor_role, action, object_type, reason, created_at::text
      FROM fgc.production_audit_events ORDER BY created_at DESC LIMIT 20
    `)
  ]);

  const submissions = submissionsResult.rows.map((row) => {
    const parsed = snapshotValues(row.snapshot);
    return {
      id: row.id,
      assignmentId: row.assignment_id,
      submitterName: row.submitter_name,
      submitterEmail: row.submitter_email,
      status: row.status,
      currentVersion: row.current_version,
      updatedAt: row.updated_at,
      submittedAt: row.submitted_at,
      collegeName: row.college_name,
      campusName: row.campus_name,
      templateName: row.template_name,
      completionPercent: parsed.completionPercent,
      evidenceManifest: parsed.values["evidence_uploads.evidence_manifest"] ?? "",
      programmeName: parsed.values["learner_cohort.programme_name"] ?? "",
      moduleName: parsed.values["learner_cohort.subject_or_module"] ?? "",
      sourceStatus: parsed.values["evidence_uploads.evidence_status"] ?? "Self-Reported"
    };
  });
  const role = access.access.activeRole;

  return {
    generatedAt: new Date().toISOString(),
    accessState: access.access.accessState,
    roleCode: role?.code ?? null,
    roleName: role?.name ?? null,
    readOnly: access.access.accessState === "MERSETA_ACTIVE",
    scope: { label: role?.campusName ?? role?.collegeName ?? role?.organisationName ?? "National authorised scope", collegeName: role?.collegeName ?? null, campusName: role?.campusName ?? null },
    metrics,
    submissions,
    queues: queues(access, submissions),
    notifications: notificationsResult.rows.map((row) => ({ id: row.id, subject: row.subject, body: row.body, status: row.status, createdAt: row.created_at })),
    reports: reportsResult.rows.map((row) => ({ id: row.id, identifier: row.report_identifier, type: row.report_type, scope: row.scope, status: row.status, createdAt: row.created_at })),
    auditEvents: auditResult.rows.map((row) => ({ id: row.id, actorRole: row.actor_role, action: row.action, objectType: row.object_type, reason: row.reason, createdAt: row.created_at }))
  };
}

export async function recordFgcWorkbenchDecision(access: Access, input: { submissionId: string; action: "COLLEGE_ENRICH" | "ASSESSOR_REVIEW" | "REQUEST_CLARIFICATION" | "MODERATOR_FINALISE" | "JEF_REOPEN"; decision: string; notes: string }) {
  assertWorkbench(access);
  const allowed: Record<typeof input.action, string[]> = {
    COLLEGE_ENRICH: ["COLLEGE_ACTIVE"],
    ASSESSOR_REVIEW: ["ASSESSOR_ACTIVE", "JEF_ADMIN_ACTIVE"],
    REQUEST_CLARIFICATION: ["COLLEGE_ACTIVE", "ASSESSOR_ACTIVE", "MODERATOR_ACTIVE", "JEF_ADMIN_ACTIVE"],
    MODERATOR_FINALISE: ["MODERATOR_ACTIVE", "JEF_ADMIN_ACTIVE"],
    JEF_REOPEN: ["JEF_ADMIN_ACTIVE", "PLATFORM_SUPER_ACTIVE"]
  };
  if (!allowed[input.action].includes(access.access.accessState)) {
    throw new FgcWorkbenchAccessError(403, "FGC_ACTION_FORBIDDEN", "This role cannot perform the selected action.");
  }
  const nextStatus = input.action === "COLLEGE_ENRICH" ? "JEF_REVIEW_PENDING"
    : input.action === "ASSESSOR_REVIEW" ? "MODERATION_PENDING"
      : input.action === "MODERATOR_FINALISE" ? "MODERATED"
        : "CLARIFICATION_REQUESTED";

  return withFgcTransaction(async (query) => {
    await assertSubmissionVisibleToAccess(access, input.submissionId, query);
    const current = await query<{ id: string; status: string; submitted_by: string }>(
      "SELECT id::text, status::text, submitted_by::text FROM fgc.production_submissions WHERE id = $1 FOR UPDATE",
      [input.submissionId]
    );
    const row = current.rows[0];
    if (!row) throw new FgcWorkbenchAccessError(404, "FGC_SUBMISSION_NOT_FOUND", "The selected submission was not found.");

    await query("UPDATE fgc.production_submissions SET status = $2::fgc.submission_lifecycle_status, updated_at = now() WHERE id = $1", [input.submissionId, nextStatus]);
    await query(`
      INSERT INTO fgc.production_submission_status_history (submission_id, previous_status, new_status, changed_by, changed_role, reason, comments)
      VALUES ($1, $2::fgc.submission_lifecycle_status, $3::fgc.submission_lifecycle_status, $4, $5, $6, $7)
    `, [input.submissionId, row.status, nextStatus, access.user.id, access.access.activeRole?.code ?? access.access.accessState, input.decision, input.notes]);
    await query(`
      INSERT INTO fgc.notifications (user_id, channel, notification_type, subject, body, status, related_object_type, related_object_id, sent_at)
      VALUES
        ($1, 'IN_APP', $2, 'FGC submission status updated', $3, 'SENT', 'production_submission', $4, now()),
        ($1, 'EMAIL', $2, 'FGC submission status updated', $3, 'PENDING', 'production_submission', $4, NULL)
    `, [row.submitted_by, input.action, `${input.decision}. ${input.notes}`, input.submissionId]);
    await query(`
      INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, object_id, previous_value, new_value, reason, metadata)
      VALUES ($1, $2, $3, 'production_submission', $4, $5::jsonb, $6::jsonb, $7, $8::jsonb)
    `, [
      access.user.id,
      access.access.activeRole?.code ?? access.access.accessState,
      input.action,
      input.submissionId,
      JSON.stringify({ status: row.status }),
      JSON.stringify({ status: nextStatus }),
      input.decision,
      JSON.stringify({ notes: input.notes })
    ]);

    return { submissionId: input.submissionId, previousStatus: row.status, nextStatus };
  });
}

export async function getFgcSubmissionDetail(access: Access, submissionId: string): Promise<FgcSubmissionDetail> {
  await assertSubmissionVisibleToAccess(access, submissionId);
  const detailResult = await fgcQuery<{
    id: string; assignment_id: string | null; submitter_name: string; submitter_email: string; status: string; current_version: number; created_at: string; updated_at: string; submitted_at: string | null; college_name: string | null; campus_name: string | null; template_name: string | null; reporting_period_name: string | null; snapshot: Record<string, unknown> | null;
  }>(`
    SELECT ps.id::text, ps.assignment_id::text, (u.first_name || ' ' || u.surname) AS submitter_name,
      u.email::text AS submitter_email, ps.status::text, ps.current_version, ps.created_at::text,
      ps.updated_at::text, ps.submitted_at::text, c.official_name AS college_name, cs.official_name AS campus_name,
      ft.name AS template_name, rp.name AS reporting_period_name, latest.snapshot
    FROM fgc.production_submissions ps
    JOIN fgc.production_users u ON u.id = ps.submitted_by
    LEFT JOIN fgc.form_assignments fa ON fa.id = ps.assignment_id
    LEFT JOIN fgc.form_templates ft ON ft.id = fa.template_id
    LEFT JOIN fgc.reporting_periods rp ON rp.id = ps.reporting_period_id
    LEFT JOIN fgc.tvet_colleges c ON c.id = ps.college_id
    LEFT JOIN fgc.campus_sites cs ON cs.id = ps.campus_id
    LEFT JOIN LATERAL (
      SELECT snapshot FROM fgc.production_submission_versions psv
      WHERE psv.submission_id = ps.id ORDER BY psv.version DESC LIMIT 1
    ) latest ON true
    WHERE ps.id = $1
    LIMIT 1
  `, [submissionId]);
  const detail = detailResult.rows[0];
  if (!detail) throw new FgcWorkbenchAccessError(404, "FGC_SUBMISSION_NOT_FOUND", "The selected submission was not found.");

  const versionResult = await fgcQuery<{ id: string; version: number; status_at_snapshot: string; snapshot_checksum: string; created_at: string; created_by_name: string | null }>(`
    SELECT psv.id::text, psv.version, psv.status_at_snapshot::text, psv.snapshot_checksum, psv.created_at::text,
      NULLIF(TRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.surname, '')), '') AS created_by_name
    FROM fgc.production_submission_versions psv
    LEFT JOIN fgc.production_users u ON u.id = psv.created_by
    WHERE psv.submission_id = $1
    ORDER BY psv.version DESC
  `, [submissionId]);
  const latestVersion = versionResult.rows[0];
  const responseResult = latestVersion ? await fgcQuery<{ section_code: string; field_code: string; value_json: unknown; evidence_kind: string; created_at: string }>(`
    SELECT section_code, field_code, value_json, evidence_kind::text, created_at::text
    FROM fgc.production_response_values
    WHERE submission_version_id = $1
    ORDER BY section_code, field_code
  `, [latestVersion.id]) : { rows: [] };
  const evidenceResult = await fgcQuery<{ id: string; evidence_category: string; original_filename: string; mime_type: string; file_size_bytes: string; checksum_sha256: string; document_date: string | null; description: string | null; confidentiality_classification: string; review_status: string; upload_status: string; scanner_status: string; evidence_version: number; section_code: string | null; field_code: string | null; created_at: string }>(`
    SELECT id::text, evidence_category, original_filename, mime_type, file_size_bytes::text, checksum_sha256, document_date::text,
      description, confidentiality_classification, review_status::text, upload_status, scanner_status, evidence_version, section_code, field_code, created_at::text
    FROM fgc.evidence_files
    WHERE submission_id = $1 AND deleted_at IS NULL AND upload_status = 'COMPLETED'
    ORDER BY created_at DESC
  `, [submissionId]);
  const reviewResult = await fgcQuery<{ id: string; evidence_file_id: string | null; decision: string; decision_reason: string; reviewer_notes: string | null; reviewed_by_name: string; created_at: string }>(`
    SELECT er.id::text, er.evidence_file_id::text, er.decision::text, er.decision_reason, er.reviewer_notes,
      COALESCE(NULLIF(TRIM(u.first_name || ' ' || u.surname), ''), u.email::text) AS reviewed_by_name,
      er.created_at::text
    FROM fgc.evidence_reviews er
    JOIN fgc.production_users u ON u.id = er.reviewed_by
    LEFT JOIN fgc.evidence_files ef ON ef.id = er.evidence_file_id
    WHERE ef.submission_id = $1
    ORDER BY er.created_at DESC
  `, [submissionId]);
  const historyResult = await fgcQuery<{ id: string; previous_status: string | null; new_status: string; changed_role: string | null; reason: string; comments: string | null; created_at: string }>(`
    SELECT id::text, previous_status::text, new_status::text, changed_role, reason, comments, created_at::text
    FROM fgc.production_submission_status_history
    WHERE submission_id = $1
    ORDER BY created_at DESC
  `, [submissionId]);
  const auditResult = await fgcQuery<{ id: string; actor_role: string | null; action: string; reason: string | null; created_at: string }>(`
    SELECT id::text, actor_role, action, reason, created_at::text
    FROM fgc.production_audit_events
    WHERE object_type = 'production_submission' AND object_id = $1
    ORDER BY created_at DESC
    LIMIT 25
  `, [submissionId]);

  const lookup = fieldLookup();
  const sections = new Map<string, FgcSubmissionDetailSection>();
  for (const row of responseResult.rows) {
    const key = fieldKey(row.section_code, row.field_code);
    const meta = lookup.get(key);
    const section = sections.get(row.section_code) ?? {
      code: row.section_code,
      title: meta?.sectionTitle ?? row.section_code.replaceAll("_", " "),
      purpose: meta?.sectionPurpose ?? "Captured field-level submission data.",
      fields: []
    };
    section.fields.push({
      sectionCode: row.section_code,
      sectionTitle: section.title,
      fieldCode: row.field_code,
      label: meta?.label ?? row.field_code.replaceAll("_", " "),
      value: stringifyFieldValue(row.value_json),
      evidenceKind: row.evidence_kind || meta?.evidenceKind || "SELF_REPORTED",
      sourceStatus: row.evidence_kind === "SYSTEM_DERIVED" ? "System-derived" : row.evidence_kind === "DOCUMENT_SUPPORTED" ? "Document-supported claim" : "Lecturer self-report",
      verificationStatus: row.evidence_kind === "DOCUMENT_SUPPORTED" ? "Pending evidence review" : "Pending verification",
      version: latestVersion?.version ?? detail.current_version,
      capturedAt: row.created_at
    });
    sections.set(row.section_code, section);
  }
  const parsed = snapshotValues(detail.snapshot);
  const manifest = parsed.values["evidence_uploads.evidence_manifest"] ?? "";
  const evidenceStatus = parsed.values["evidence_uploads.evidence_status"] ?? "";

  return {
    id: detail.id,
    reference: submissionReference(detail.id, detail.created_at),
    assignmentId: detail.assignment_id,
    submitterName: detail.submitter_name,
    submitterEmail: detail.submitter_email,
    status: detail.status,
    currentVersion: detail.current_version,
    createdAt: detail.created_at,
    updatedAt: detail.updated_at,
    submittedAt: detail.submitted_at,
    collegeName: detail.college_name,
    campusName: detail.campus_name,
    templateName: detail.template_name,
    reportingPeriodName: detail.reporting_period_name,
    completionPercent: parsed.completionPercent,
    verificationStatus: ["VERIFIED", "PARTIALLY_VERIFIED", "CONTRADICTED"].includes(detail.status) ? detail.status : "PENDING_VERIFICATION",
    evidenceCompletenessStatus: evidenceResult.rows.length || manifest ? "EVIDENCE_DECLARED_PENDING_REVIEW" : "EVIDENCE_MANIFEST_PENDING",
    sourceStatus: evidenceStatus || "Lecturer Self-Report",
    sections: fgcLecturerModules
      .map((formModule) => sections.get(formModule.code))
      .filter((section): section is FgcSubmissionDetailSection => Boolean(section))
      .concat(Array.from(sections.values()).filter((section) => !fgcLecturerModules.some((formModule) => formModule.code === section.code))),
    versions: versionResult.rows.map((row) => ({ id: row.id, version: row.version, status: row.status_at_snapshot, checksum: row.snapshot_checksum, createdAt: row.created_at, createdBy: row.created_by_name })),
    evidenceFiles: evidenceResult.rows.map((row) => ({ id: row.id, category: row.evidence_category, filename: row.original_filename, mimeType: row.mime_type, sizeBytes: Number(row.file_size_bytes), checksumSha256: row.checksum_sha256, documentDate: row.document_date, description: row.description, confidentiality: row.confidentiality_classification, reviewStatus: row.review_status, uploadStatus: row.upload_status, scannerStatus: row.scanner_status, version: row.evidence_version, sectionCode: row.section_code, fieldCode: row.field_code, uploadedAt: row.created_at, viewUrl: `/api/fgc/evidence/files/${row.id}/download` })),
    evidenceReviews: reviewResult.rows.map((row) => ({ id: row.id, evidenceFileId: row.evidence_file_id, decision: row.decision, decisionReason: row.decision_reason, reviewerNotes: row.reviewer_notes, reviewedBy: row.reviewed_by_name, createdAt: row.created_at })),
    statusHistory: historyResult.rows.map((row) => ({ id: row.id, previousStatus: row.previous_status, newStatus: row.new_status, changedRole: row.changed_role, reason: row.reason, comments: row.comments, createdAt: row.created_at })),
    auditEvents: auditResult.rows.map((row) => ({ id: row.id, actorRole: row.actor_role, action: row.action, reason: row.reason, createdAt: row.created_at }))
  };
}

function encodeStorageKey(storageKey: string) {
  return storageKey.split("/").map((segment) => encodeURIComponent(segment)).join("/");
}

export async function createFgcEvidenceFileViewUrl(access: Access, fileId: string) {
  assertWorkbench(access);
  const fileResult = await fgcQuery<{
    id: string; submission_id: string | null; storage_provider: string; storage_bucket: string; storage_key: string; original_filename: string; mime_type: string;
  }>(`
    SELECT id::text, submission_id::text, storage_provider, storage_bucket, storage_key, original_filename, mime_type
    FROM fgc.evidence_files
    WHERE id = $1 AND deleted_at IS NULL AND upload_status = 'COMPLETED'
    LIMIT 1
  `, [fileId]);
  const file = fileResult.rows[0];
  if (!file?.submission_id) throw new FgcWorkbenchAccessError(404, "FGC_EVIDENCE_FILE_NOT_FOUND", "The selected evidence document was not found.");
  await assertSubmissionVisibleToAccess(access, file.submission_id);

  const config = getFgcRuntimeConfig();
  if (file.storage_provider !== "supabase" || !config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw new FgcConfigurationError("Private evidence document viewing is not fully configured. Set FGC_SUPABASE_URL and FGC_SUPABASE_SERVICE_ROLE_KEY for signed storage access.");
  }

  const bucket = file.storage_bucket || config.evidenceStorageBucket;
  if (!bucket) throw new FgcConfigurationError("FGC evidence storage bucket is not configured.");

  const response = await fetch(`${config.supabaseUrl.replace(/\/$/, "")}/storage/v1/object/sign/${encodeURIComponent(bucket)}/${encodeStorageKey(file.storage_key)}`, {
    method: "POST",
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ expiresIn: 300 })
  });
  if (!response.ok) throw new Error(`Supabase signed evidence URL creation failed with status ${response.status}.`);

  const payload = await response.json() as { signedURL?: string; signedUrl?: string };
  const signedPath = payload.signedURL ?? payload.signedUrl;
  if (!signedPath) throw new Error("Supabase did not return a signed evidence URL.");

  await fgcQuery(`
    INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, object_id, reason, metadata)
    VALUES ($1, $2, 'DOWNLOAD_EVIDENCE_FILE', 'evidence_file', $3, 'Generated short-lived private evidence document download URL.', $4::jsonb)
  `, [access.user.id, access.access.activeRole?.code ?? access.access.accessState, file.id, JSON.stringify({ submissionId: file.submission_id, filename: file.original_filename })]);

  return {
    url: signedPath.startsWith("http") ? signedPath : `${config.supabaseUrl.replace(/\/$/, "")}${signedPath}`,
    filename: file.original_filename,
    mimeType: file.mime_type
  };
}

export async function generateFgcWorkbenchReport(access: Access, reportType: string) {
  assertWorkbench(access);
  if (!["LECTURER_ACTIVE", "COLLEGE_ACTIVE", "ASSESSOR_ACTIVE", "MODERATOR_ACTIVE", "JEF_ADMIN_ACTIVE", "MERSETA_ACTIVE", "PLATFORM_SUPER_ACTIVE"].includes(access.access.accessState)) {
    throw new FgcWorkbenchAccessError(403, "FGC_REPORT_FORBIDDEN", "This role cannot generate the selected report.");
  }
  const workbench = await getFgcRoleWorkbench(access);
  const identifier = `FGC-${reportType.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}-${Date.now()}`;
  const snapshot = {
    generatedAt: new Date().toISOString(),
    generatedBy: access.user.email,
    scope: workbench.scope,
    metrics: workbench.metrics.metrics,
    submissions: workbench.submissions.map((submission) => ({
      id: submission.id,
      status: submission.status,
      collegeName: submission.collegeName,
      completionPercent: submission.completionPercent,
      sourceStatus: submission.sourceStatus
    })),
    limitations: "Preliminary report generated from current production workflow records. Self-reported values remain distinct from verified evidence."
  };
  const inserted = await fgcQuery<{ id: string }>(`
    INSERT INTO fgc.generated_reports (report_identifier, report_type, scope, filters, source_snapshot, snapshot_checksum, status, generated_by, completed_at)
    VALUES ($1, $2, $3, '{}'::jsonb, $4::jsonb, $5, 'READY', $6, now())
    RETURNING id::text
  `, [identifier, reportType, workbench.scope.label, JSON.stringify(snapshot), checksum(snapshot), access.user.id]);
  await fgcQuery(`
    INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, object_id, reason, metadata)
    VALUES ($1, $2, 'GENERATE_FGC_REPORT', 'generated_report', $3, 'Generated report from shared FGC workbench metrics.', $4::jsonb)
  `, [access.user.id, access.access.activeRole?.code ?? access.access.accessState, inserted.rows[0].id, JSON.stringify({ reportType, identifier })]);
  return { id: inserted.rows[0].id, identifier, reportType };
}
