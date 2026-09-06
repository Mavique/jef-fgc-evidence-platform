import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { QueryResult, QueryResultRow } from "pg";
import { closeFgcIntegrationPool, fgcQuery } from "@/lib/fgc/db";
import { createSessionToken } from "@/lib/fgc/session";
import { resolveFgcCurrentUserFromToken } from "@/lib/fgc/current-user";
import { uploadLecturerEvidenceFile } from "@/lib/fgc/evidence-upload";
import { createFgcEvidenceFileViewUrl } from "@/lib/fgc/workbench";

process.env.FGC_EVIDENCE_STORAGE_PROVIDER = "supabase";
process.env.FGC_EVIDENCE_STORAGE_BUCKET = "fgc-evidence-test";
process.env.FGC_MAX_UPLOAD_BYTES = "1048576";

const ids = {
  country: "22222222-2222-4222-8222-222222222201", province: "22222222-2222-4222-8222-222222222202",
  organisation: "22222222-2222-4222-8222-222222222203", college: "22222222-2222-4222-8222-222222222204",
  campus: "22222222-2222-4222-8222-222222222205", period: "22222222-2222-4222-8222-222222222220",
  programme: "22222222-2222-4222-8222-222222222230", template: "22222222-2222-4222-8222-222222222240",
  lecturer: "22222222-2222-4222-8222-222222222250", lecturerOther: "22222222-2222-4222-8222-222222222251",
  assessor: "22222222-2222-4222-8222-222222222254", assessorOther: "22222222-2222-4222-8222-222222222255",
  moderator: "22222222-2222-4222-8222-222222222256", moderatorOther: "22222222-2222-4222-8222-222222222257",
  jef: "22222222-2222-4222-8222-222222222258", merseta: "22222222-2222-4222-8222-222222222259",
  roleLecturer: "22222222-2222-4222-8222-222222222261", roleAssessor: "22222222-2222-4222-8222-222222222262",
  roleModerator: "22222222-2222-4222-8222-222222222263", roleJef: "22222222-2222-4222-8222-222222222264",
  roleMerseta: "22222222-2222-4222-8222-222222222265", assignment: "22222222-2222-4222-8222-222222222270",
  assignment2: "22222222-2222-4222-8222-222222222271", assignment3: "22222222-2222-4222-8222-222222222272",
  version: "22222222-2222-4222-8222-222222222280", assessorAssignment: "22222222-2222-4222-8222-222222222281", moderatorAssignment: "22222222-2222-4222-8222-222222222282",
  scope: "22222222-2222-4222-8222-222222222290"
} as const;

type Access = Extract<Awaited<ReturnType<typeof accessFor>>, { ok: true }>;
let server: ReturnType<typeof createServer>;
let baseUrl: string;
let lecturer: Access;
let otherLecturer: Access;
let assessor: Access;
let otherAssessor: Access;
let moderator: Access;
let otherModerator: Access;
let jef: Access;
let merseta: Access;
let failNextUpload = false;
const objects = new Map<string, Buffer>();

function query<T extends QueryResultRow = QueryResultRow>(sql: string, values: unknown[] = []): Promise<QueryResult<T>> { return fgcQuery<T>(sql, values); }

async function body(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function send(response: ServerResponse, status: number, payload: unknown) {
  response.statusCode = status;
  response.setHeader("content-type", "application/json");
  response.end(JSON.stringify(payload));
}

async function storageHandler(request: IncomingMessage, response: ServerResponse) {
  const path = request.url ?? "";
  const objectPrefix = "/storage/v1/object/fgc-evidence-test/";
  if (request.method === "POST" && path.startsWith(objectPrefix)) {
    if (failNextUpload) { failNextUpload = false; send(response, 503, { error: "temporary provider failure" }); return; }
    const key = decodeURIComponent(path.slice(objectPrefix.length));
    if (objects.has(key)) { send(response, 409, { error: "object exists" }); return; }
    objects.set(key, await body(request)); send(response, 200, { Key: key }); return;
  }
  if (request.method === "DELETE" && path === "/storage/v1/object/fgc-evidence-test") {
    const payload = JSON.parse((await body(request)).toString("utf8")) as { prefixes?: string[] };
    for (const key of payload.prefixes ?? []) objects.delete(key);
    send(response, 200, {}); return;
  }
  const signPrefix = "/storage/v1/object/sign/fgc-evidence-test/";
  if (request.method === "POST" && path.startsWith(signPrefix)) {
    const key = decodeURIComponent(path.slice(signPrefix.length));
    if (!objects.has(key)) { send(response, 404, {}); return; }
    const token = Buffer.from(JSON.stringify({ key, expires: Date.now() + 300_000 })).toString("base64url");
    send(response, 200, { signedURL: `/storage/v1/signed/object/${token}` }); return;
  }
  if (request.method === "GET" && path.startsWith("/storage/v1/signed/object/")) {
    try {
      const decoded = JSON.parse(Buffer.from(path.slice("/storage/v1/signed/object/".length), "base64url").toString("utf8")) as { key: string; expires: number };
      if (decoded.expires <= Date.now() || !objects.has(decoded.key)) { send(response, 403, { error: "expired or invalid signature" }); return; }
      response.statusCode = 200; response.setHeader("content-type", "application/pdf"); response.end(objects.get(decoded.key)); return;
    } catch { send(response, 403, { error: "invalid signature" }); return; }
  }
  send(response, 403, { error: "private objects require signed access" });
}

async function accessFor(userId: string) {
  const { token, sessionHash } = createSessionToken();
  await query("INSERT INTO fgc.production_sessions (user_id, session_hash, expires_at) VALUES ($1, $2, now() + interval '2 hours')", [userId, sessionHash]);
  const access = await resolveFgcCurrentUserFromToken(token);
  if (!access.ok) throw new Error("synthetic session did not resolve");
  return access;
}

function pdf(name: string, content = "%PDF-1.7 synthetic evidence") {
  const bytes = Buffer.from(content);
  return { name, type: "application/pdf", size: bytes.length, arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) } as unknown as File;
}

describe("authenticated private FGC evidence lifecycle", () => {
  beforeAll(async () => {
    server = createServer((request, response) => { void storageHandler(request, response); });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("storage test server did not start");
    baseUrl = `http://127.0.0.1:${address.port}`;
    process.env.FGC_SUPABASE_URL = baseUrl;
    process.env.FGC_SUPABASE_SERVICE_ROLE_KEY = "local-boundary-only";
    await query(`
      INSERT INTO fgc.countries (id, iso2, iso3, official_name, common_name) VALUES ('${ids.country}', 'YY', 'YYY', 'Synthetic Evidence Country', 'Synthetic Evidence Country');
      INSERT INTO fgc.provinces (id, country_id, official_name) VALUES ('${ids.province}', '${ids.country}', 'Synthetic Evidence Province');
      INSERT INTO fgc.organisations (id, name, organisation_type) VALUES ('${ids.organisation}', 'Synthetic Evidence Organisation', 'TVET');
      INSERT INTO fgc.tvet_colleges (id, official_name, province_id) VALUES ('${ids.college}', 'Synthetic Evidence College', '${ids.province}');
      INSERT INTO fgc.campus_sites (id, college_id, official_name) VALUES ('${ids.campus}', '${ids.college}', 'Synthetic Evidence Campus');
      INSERT INTO fgc.reporting_periods (id, name, scope_statement) VALUES ('${ids.period}', 'Synthetic Evidence Period', 'Disposable evidence scope');
      INSERT INTO fgc.curriculum_programmes (id, official_title, framework) VALUES ('${ids.programme}', 'Synthetic Evidence Programme', 'NCV');
      INSERT INTO fgc.form_templates (id, code, name) VALUES ('${ids.template}', 'FGC_EVIDENCE_TEST', 'Synthetic Evidence Form');
      INSERT INTO fgc.roles (id, code, name, description) VALUES
        ('${ids.roleLecturer}', 'LECTURER', 'Lecturer', 'test'), ('${ids.roleAssessor}', 'ASSESSOR', 'Assessor', 'test'),
        ('${ids.roleModerator}', 'MODERATOR', 'Moderator', 'test'), ('${ids.roleJef}', 'JEF_ADMINISTRATOR', 'JEF', 'test'),
        ('${ids.roleMerseta}', 'MERSETA_ADMINISTRATOR', 'merSETA', 'test');
      INSERT INTO fgc.production_users (id, email, password_hash, first_name, surname, account_state, email_verified_at) VALUES
        ('${ids.lecturer}', 'evidence-lecturer@integration.invalid', 'synthetic', 'Evidence', 'Lecturer', 'ACTIVE', now()),
        ('${ids.lecturerOther}', 'evidence-other@integration.invalid', 'synthetic', 'Other', 'Lecturer', 'ACTIVE', now()),
        ('${ids.assessor}', 'evidence-assessor@integration.invalid', 'synthetic', 'Evidence', 'Assessor', 'ACTIVE', now()),
        ('${ids.assessorOther}', 'evidence-other-assessor@integration.invalid', 'synthetic', 'Other', 'Assessor', 'ACTIVE', now()),
        ('${ids.moderator}', 'evidence-moderator@integration.invalid', 'synthetic', 'Evidence', 'Moderator', 'ACTIVE', now()),
        ('${ids.moderatorOther}', 'evidence-other-moderator@integration.invalid', 'synthetic', 'Other', 'Moderator', 'ACTIVE', now()),
        ('${ids.jef}', 'evidence-jef@integration.invalid', 'synthetic', 'Evidence', 'JEF', 'ACTIVE', now()),
        ('${ids.merseta}', 'evidence-merseta@integration.invalid', 'synthetic', 'Evidence', 'merSETA', 'ACTIVE', now());
      INSERT INTO fgc.production_role_assignments (user_id, role_id, organisation_id, tvet_college_id, campus_id, status, approved_at) VALUES
        ('${ids.lecturer}', '${ids.roleLecturer}', '${ids.organisation}', '${ids.college}', '${ids.campus}', 'APPROVED', now()),
        ('${ids.lecturerOther}', '${ids.roleLecturer}', '${ids.organisation}', '${ids.college}', '${ids.campus}', 'APPROVED', now()),
        ('${ids.assessor}', '${ids.roleAssessor}', '${ids.organisation}', '${ids.college}', '${ids.campus}', 'APPROVED', now()),
        ('${ids.assessorOther}', '${ids.roleAssessor}', '${ids.organisation}', '${ids.college}', '${ids.campus}', 'APPROVED', now()),
        ('${ids.moderator}', '${ids.roleModerator}', '${ids.organisation}', '${ids.college}', '${ids.campus}', 'APPROVED', now()),
        ('${ids.moderatorOther}', '${ids.roleModerator}', '${ids.organisation}', '${ids.college}', '${ids.campus}', 'APPROVED', now()),
        ('${ids.jef}', '${ids.roleJef}', '${ids.organisation}', '${ids.college}', NULL, 'APPROVED', now()),
        ('${ids.merseta}', '${ids.roleMerseta}', '${ids.organisation}', NULL, NULL, 'APPROVED', now());
      INSERT INTO fgc.form_assignments (id, template_id, assigned_to, assigned_by, reporting_period_id, programme_id, college_id, campus_id, status) VALUES
        ('${ids.assignment}', '${ids.template}', '${ids.lecturer}', '${ids.jef}', '${ids.period}', '${ids.programme}', '${ids.college}', '${ids.campus}', 'ASSIGNED'),
        ('${ids.assignment2}', '${ids.template}', '${ids.lecturerOther}', '${ids.jef}', '${ids.period}', '${ids.programme}', '${ids.college}', '${ids.campus}', 'ASSIGNED'),
        ('${ids.assignment3}', '${ids.template}', '${ids.lecturer}', '${ids.jef}', '${ids.period}', '${ids.programme}', '${ids.college}', '${ids.campus}', 'ASSIGNED');
      INSERT INTO fgc.merseta_access_scopes (id, user_id, tvet_college_id, campus_id, programme_id, reporting_period_id, evidence_detail_permission, granted_by, reason)
        VALUES ('${ids.scope}', '${ids.merseta}', '${ids.college}', '${ids.campus}', '${ids.programme}', '${ids.period}', 'DETAIL', '${ids.jef}', 'Synthetic evidence scope');
    `);
    lecturer = await accessFor(ids.lecturer); otherLecturer = await accessFor(ids.lecturerOther);
    assessor = await accessFor(ids.assessor); otherAssessor = await accessFor(ids.assessorOther);
    moderator = await accessFor(ids.moderator); otherModerator = await accessFor(ids.moderatorOther);
    jef = await accessFor(ids.jef); merseta = await accessFor(ids.merseta);
  });

  afterAll(async () => { objects.clear(); await new Promise<void>((resolve) => server.close(() => resolve())); await closeFgcIntegrationPool(); });

  it("persists real upload metadata, private bytes, audit events and signed access", async () => {
    const result = await uploadLecturerEvidenceFile(lecturer, { assignmentId: ids.assignment, file: pdf("support.pdf"), evidenceCategory: "SUPPORT", documentDate: "2026-09-01", confidentiality: "CONFIDENTIAL" });
    expect(result.uploadStatus).toBe("COMPLETED"); expect(result.reviewStatus).toBe("PENDING_REVIEW"); expect(result.viewUrl).not.toContain("storage");
    const row = (await query<{ id: string; storage_key: string; checksum_sha256: string; upload_status: string; review_status: string }>("SELECT id::text, storage_key, checksum_sha256, upload_status, review_status FROM fgc.evidence_files WHERE id = $1", [result.id])).rows[0];
    expect(row.storage_key).not.toContain("support.pdf"); expect(row.upload_status).toBe("COMPLETED"); expect(row.review_status).toBe("PENDING_REVIEW"); expect(row.checksum_sha256).toMatch(/^[a-f0-9]{64}$/);
    const signed = await createFgcEvidenceFileViewUrl(lecturer, result.id); expect(signed.url).toContain("/storage/v1/signed/object/");
    const downloaded = await fetch(signed.url); expect(downloaded.status).toBe(200); expect(Buffer.from(await downloaded.arrayBuffer()).toString()).toContain("%PDF");
    const submissionId = row && (await query<{ submission_id: string }>("SELECT submission_id::text FROM fgc.evidence_files WHERE id = $1", [result.id])).rows[0].submission_id;
    await query(`
      INSERT INTO fgc.production_submission_versions (id, submission_id, version, status_at_snapshot, snapshot, snapshot_checksum, created_by)
      VALUES ('${ids.version}', '${submissionId}', 1, 'DRAFT', '{}'::jsonb, 'synthetic-evidence-version', '${ids.lecturer}');
      UPDATE fgc.evidence_files SET submission_version_id = '${ids.version}' WHERE id = '${result.id}';
      INSERT INTO fgc.review_assignments (id, submission_id, submission_version_id, assignment_type, assignee_user_id, assigned_by, reporting_period_id, college_id, campus_id, programme_id, reason)
      VALUES ('${ids.assessorAssignment}', '${submissionId}', '${ids.version}', 'ASSESSOR', '${ids.assessor}', '${ids.jef}', '${ids.period}', '${ids.college}', '${ids.campus}', '${ids.programme}', 'Synthetic evidence assessor assignment'),
             ('${ids.moderatorAssignment}', '${submissionId}', '${ids.version}', 'MODERATOR', '${ids.moderator}', '${ids.jef}', '${ids.period}', '${ids.college}', '${ids.campus}', '${ids.programme}', 'Synthetic evidence moderator assignment');
    `);
    expect((await createFgcEvidenceFileViewUrl(assessor, result.id)).url).toContain("signed/object");
    expect((await createFgcEvidenceFileViewUrl(moderator, result.id)).url).toContain("signed/object");
    expect((await query("SELECT 1 FROM fgc.production_audit_events WHERE object_id = $1 AND action IN ('INITIATE_EVIDENCE_UPLOAD', 'COMPLETE_EVIDENCE_UPLOAD', 'DOWNLOAD_EVIDENCE_FILE')", [result.id])).rowCount).toBeGreaterThanOrEqual(2);
    const tampered = `${signed.url.slice(0, -1)}x`; expect((await fetch(tampered)).status).toBe(403);
  });

  it("enforces reviewer, JEF and merSETA scope and preserves replacement history", async () => {
    const first = (await query<{ id: string; submission_id: string; submission_version_id: string | null }>("SELECT id::text, submission_id::text, submission_version_id::text FROM fgc.evidence_files ORDER BY created_at LIMIT 1")).rows[0];
    const submission = (await query<{ id: string }>("SELECT submission_id::text AS id FROM fgc.evidence_files WHERE id = $1", [first.id])).rows[0].id;
    await query("UPDATE fgc.production_submissions SET status = 'CLARIFICATION_REQUESTED' WHERE id = $1", [submission]);
    const replaced = await uploadLecturerEvidenceFile(lecturer, { assignmentId: ids.assignment, file: pdf("replacement.pdf", "%PDF-1.7 replacement"), evidenceCategory: "REPLACEMENT", replacementForFileId: first.id });
    expect(replaced.version).toBe(2); expect((await query("SELECT replaced_by_file_id FROM fgc.evidence_files WHERE id = $1", [first.id])).rows[0].replaced_by_file_id).toBe(replaced.id);
    expect((await createFgcEvidenceFileViewUrl(jef, replaced.id)).url).toContain("signed/object");
    await expect(createFgcEvidenceFileViewUrl(otherLecturer, replaced.id)).rejects.toMatchObject({ status: 404 });
    await expect(createFgcEvidenceFileViewUrl(assessor, replaced.id)).rejects.toMatchObject({ status: 404 });
    await expect(createFgcEvidenceFileViewUrl(otherAssessor, replaced.id)).rejects.toMatchObject({ status: 404 });
    await expect(createFgcEvidenceFileViewUrl(moderator, replaced.id)).rejects.toMatchObject({ status: 404 });
    await expect(createFgcEvidenceFileViewUrl(otherModerator, replaced.id)).rejects.toMatchObject({ status: 404 });
    expect((await createFgcEvidenceFileViewUrl(merseta, replaced.id)).url).toContain("signed/object");
    await query("UPDATE fgc.merseta_access_scopes SET evidence_detail_permission = 'METADATA' WHERE id = $1", [ids.scope]);
    await expect(createFgcEvidenceFileViewUrl(merseta, replaced.id)).rejects.toMatchObject({ status: 403 });
  });

  it("records failed provider and post-upload database operations without false completion", async () => {
    failNextUpload = true;
    await expect(uploadLecturerEvidenceFile(lecturer, { assignmentId: ids.assignment3, file: pdf("provider-failure.pdf"), evidenceCategory: "PROVIDER_FAILURE" })).rejects.toMatchObject({ code: "FGC_EVIDENCE_STORAGE_UPLOAD_FAILED" });
    expect((await query("SELECT 1 FROM fgc.evidence_files WHERE evidence_category = 'PROVIDER_FAILURE' AND upload_status = 'FAILED'")).rowCount).toBe(1);
    await query("CREATE OR REPLACE FUNCTION fgc.test_reject_evidence() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.evidence_category = 'DB_FAILURE' THEN RAISE EXCEPTION 'synthetic evidence persistence failure'; END IF; RETURN NEW; END $$");
    await query("CREATE TRIGGER test_reject_evidence BEFORE INSERT ON fgc.evidence_files FOR EACH ROW EXECUTE FUNCTION fgc.test_reject_evidence()");
    const countBefore = objects.size;
    await expect(uploadLecturerEvidenceFile(lecturer, { assignmentId: ids.assignment3, file: pdf("db-failure.pdf"), evidenceCategory: "DB_FAILURE" })).rejects.toThrow();
    expect(objects.size).toBe(countBefore);
    await query("DROP TRIGGER test_reject_evidence ON fgc.evidence_files; DROP FUNCTION fgc.test_reject_evidence()");
    const invalid = [pdf("empty.pdf", "")]; Object.defineProperty(invalid[0], "size", { value: 0 });
    await expect(uploadLecturerEvidenceFile(lecturer, { assignmentId: ids.assignment, file: invalid[0], evidenceCategory: "EMPTY" })).rejects.toMatchObject({ code: "FGC_EMPTY_EVIDENCE_FILE" });
  });
});
