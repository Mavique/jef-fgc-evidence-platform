import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FgcCurrentUserResult } from "@/lib/fgc/current-user";

const queryMock = vi.fn();
const fgcQueryMock = vi.fn();
const fetchMock = vi.fn();

vi.mock("@/lib/fgc/db", () => ({
  FgcConfigurationError: class FgcConfigurationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "FgcConfigurationError";
    }
  },
  fgcQuery: (...args: unknown[]) => fgcQueryMock(...args),
  withFgcTransaction: async (callback: (query: typeof queryMock) => Promise<unknown>) => callback(queryMock)
}));

vi.mock("@/lib/fgc/env", () => ({
  getFgcRuntimeConfig: () => ({
    appUrl: "http://localhost:3000",
    evidenceStorageProvider: "supabase",
    evidenceStorageBucket: "fgc-evidence",
    supabaseUrl: "https://example.supabase.co",
    supabaseServiceRoleKey: "test-service-role",
    maxUploadBytes: 1024 * 1024
  })
}));

const access = (overrides: Partial<Extract<FgcCurrentUserResult, { ok: true }>> = {}): Extract<FgcCurrentUserResult, { ok: true }> => ({
  ok: true,
  session: { expiresAt: new Date(Date.now() + 1000).toISOString(), createdAt: new Date().toISOString() },
  user: {
    id: "11111111-1111-1111-1111-111111111111",
    email: "lecturer@example.edu",
    name: "Lecturer User",
    firstName: "Lecturer",
    surname: "User",
    accountState: "ACTIVE",
    emailVerified: true,
    lastLoginAt: null
  },
  roles: [
    {
      id: "role-1",
      code: "LECTURER",
      name: "Lecturer",
      status: "APPROVED",
      organisationId: null,
      organisationName: null,
      collegeId: "22222222-2222-2222-2222-222222222222",
      collegeName: "College",
      campusId: "33333333-3333-3333-3333-333333333333",
      campusName: "Campus",
      approvedAt: new Date().toISOString()
    }
  ],
  formAssignments: [],
  access: {
    accessState: "LECTURER_ACTIVE",
    expectedPortal: "/fgc-ekm/data-capturer",
    activeRole: null,
    canOpenProtectedWorkspace: true
  },
  diagnostic: "SESSION_RESOLVED",
  ...overrides
});

const assignment = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  assigned_to: "11111111-1111-1111-1111-111111111111",
  assignment_status: "IN_PROGRESS",
  reporting_period_id: "44444444-4444-4444-4444-444444444444",
  college_id: "22222222-2222-2222-2222-222222222222",
  campus_id: "33333333-3333-3333-3333-333333333333"
};

const submission = {
  id: "55555555-5555-5555-5555-555555555555",
  status: "DRAFT",
  current_version: 2,
  reporting_period_id: assignment.reporting_period_id,
  college_id: assignment.college_id,
  campus_id: assignment.campus_id
};

function pdfFile(name = "support.pdf", type = "application/pdf", bytes: number[] = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]) {
  const data = new Uint8Array(bytes);
  return {
    name,
    type,
    size: data.byteLength,
    arrayBuffer: async () => data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
  } as File;
}

function fakeFile(name: string, type: string, size: number, bytes = [0x78]) {
  const data = new Uint8Array(bytes);
  return {
    name,
    type,
    size,
    arrayBuffer: async () => data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
  } as File;
}

function textFile(name: string, type: string, text: string) {
  const data = new TextEncoder().encode(text);
  return {
    name,
    type,
    size: data.byteLength,
    arrayBuffer: async () => data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
  } as File;
}

function minimalZipFile(name: string, type: string, entries: string[]) {
  const encoder = new TextEncoder();
  const localHeader = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
  const centralParts = entries.map((entry) => {
    const nameBytes = encoder.encode(entry);
    const header = new Uint8Array(46 + nameBytes.byteLength);
    header.set([0x50, 0x4b, 0x01, 0x02], 0);
    header[28] = nameBytes.byteLength & 0xff;
    header[29] = (nameBytes.byteLength >> 8) & 0xff;
    header.set(nameBytes, 46);
    return header;
  });
  const centralSize = centralParts.reduce((sum, part) => sum + part.byteLength, 0);
  const eocd = new Uint8Array(22);
  eocd.set([0x50, 0x4b, 0x05, 0x06], 0);
  eocd[10] = entries.length & 0xff;
  eocd[11] = (entries.length >> 8) & 0xff;
  eocd[12] = centralSize & 0xff;
  eocd[13] = (centralSize >> 8) & 0xff;
  eocd[14] = (centralSize >> 16) & 0xff;
  eocd[15] = (centralSize >> 24) & 0xff;
  eocd[16] = localHeader.byteLength;
  const bytes = new Uint8Array(localHeader.byteLength + centralSize + eocd.byteLength);
  bytes.set(localHeader, 0);
  let offset = localHeader.byteLength;
  for (const part of centralParts) {
    bytes.set(part, offset);
    offset += part.byteLength;
  }
  bytes.set(eocd, offset);
  return fakeFile(name, type, bytes.byteLength, Array.from(bytes));
}

function installDefaultDbMocks(options: { submissionStatus?: string; assignmentRow?: typeof assignment | null; replacement?: boolean } = {}) {
  queryMock.mockImplementation((sql: string, values: unknown[]) => {
    if (sql.includes("FROM fgc.form_assignments")) return Promise.resolve({ rows: options.assignmentRow === null ? [] : [options.assignmentRow ?? assignment] });
    if (sql.includes("FROM fgc.production_submissions")) return Promise.resolve({ rows: [{ ...submission, status: options.submissionStatus ?? submission.status }] });
    if (sql.includes("FROM fgc.evidence_files") && sql.includes("FOR UPDATE")) {
      return Promise.resolve({
        rows: options.replacement
          ? [{ id: values[0], submission_id: submission.id, uploaded_by: access().user.id, review_status: "PENDING_REVIEW", evidence_version: 1, replaced_by_file_id: null }]
          : []
      });
    }
    if (sql.includes("FROM fgc.production_submission_versions")) return Promise.resolve({ rows: [{ submission_version_id: "66666666-6666-6666-6666-666666666666", response_value_id: "77777777-7777-7777-7777-777777777777" }] });
    if (sql.includes("UPDATE fgc.evidence_files") && sql.includes("upload_status = 'COMPLETED'")) {
      return Promise.resolve({
        rows: [{
          id: "88888888-8888-8888-8888-888888888888",
          evidence_category: "LECTURER_SUPPORTING_EVIDENCE",
          original_filename: "support.pdf",
          mime_type: "application/pdf",
          file_size_bytes: "6",
          checksum_sha256: "abc123",
          review_status: "PENDING_REVIEW",
          upload_status: "COMPLETED",
          scanner_status: "UNAVAILABLE",
          evidence_version: options.replacement ? 2 : 1,
          created_at: "2026-09-03T00:00:00.000Z"
        }]
      });
    }
    if (sql.includes("INSERT INTO fgc.evidence_files")) {
      return Promise.resolve({
        rows: [
          {
            id: "88888888-8888-8888-8888-888888888888",
            evidence_category: "LECTURER_SUPPORTING_EVIDENCE",
            original_filename: "support.pdf",
            mime_type: "application/pdf",
            file_size_bytes: "6",
            checksum_sha256: "abc123",
            review_status: "PENDING_REVIEW",
            upload_status: "COMPLETED",
            scanner_status: "UNAVAILABLE",
            evidence_version: options.replacement ? 2 : 1,
            created_at: "2026-09-03T00:00:00.000Z"
          }
        ]
      });
    }
    return Promise.resolve({ rows: [] });
  });
  fgcQueryMock.mockResolvedValue({ rows: [] });
}

beforeEach(() => {
  vi.clearAllMocks();
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
  vi.stubGlobal("fetch", fetchMock);
});

describe("FGC lecturer evidence upload", () => {
  it("uploads actual bytes, persists canonical pending-review metadata and returns safe metadata", async () => {
    installDefaultDbMocks();
    const { uploadLecturerEvidenceFile } = await import("@/lib/fgc/evidence-upload");

    const result = await uploadLecturerEvidenceFile(access(), {
      assignmentId: assignment.id,
      file: pdfFile(),
      evidenceCategory: "LECTURER_SUPPORTING_EVIDENCE",
      sectionCode: "evidence_uploads",
      fieldCode: "evidence_manifest"
    });

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/storage/v1/object/fgc-evidence/lecturer-evidence/"), expect.objectContaining({ method: "POST", body: expect.any(ArrayBuffer) }));
    expect(result.reviewStatus).toBe("PENDING_REVIEW");
    expect(result.uploadStatus).toBe("COMPLETED");
    expect(result.scannerStatus).toBe("UNAVAILABLE");
    expect(JSON.stringify(result)).not.toContain("storage_key");
  });

  it("rejects unsupported file types before storage", async () => {
    installDefaultDbMocks();
    const { uploadLecturerEvidenceFile } = await import("@/lib/fgc/evidence-upload");

    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: fakeFile("run.exe", "application/x-msdownload", 1), evidenceCategory: "bad" })).rejects.toMatchObject({ status: 415, code: "FGC_UNSUPPORTED_EVIDENCE_TYPE" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects files over FGC_MAX_UPLOAD_BYTES before storage", async () => {
    installDefaultDbMocks();
    const { uploadLecturerEvidenceFile } = await import("@/lib/fgc/evidence-upload");
    const large = fakeFile("large.pdf", "application/pdf", 1024 * 1024 + 1, [0x25, 0x50, 0x44, 0x46, 0x2d]);

    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: large, evidenceCategory: "large" })).rejects.toMatchObject({ status: 413, code: "FGC_EVIDENCE_FILE_TOO_LARGE" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts the exact configured size boundary and rejects one byte over", async () => {
    const exactBytes = [0x25, 0x50, 0x44, 0x46, 0x2d, ...Array(1024 * 1024 - 5).fill(0x20)];
    installDefaultDbMocks();
    const { uploadLecturerEvidenceFile } = await import("@/lib/fgc/evidence-upload");

    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: fakeFile("exact.pdf", "application/pdf", 1024 * 1024, exactBytes), evidenceCategory: "boundary" })).resolves.toMatchObject({ uploadStatus: "COMPLETED" });
    fetchMock.mockClear();

    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: fakeFile("large.pdf", "application/pdf", 1024 * 1024 + 1, [0x25, 0x50, 0x44, 0x46, 0x2d]), evidenceCategory: "boundary" })).rejects.toMatchObject({ status: 413, code: "FGC_EVIDENCE_FILE_TOO_LARGE" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects zero-byte files before storage", async () => {
    installDefaultDbMocks();
    const { uploadLecturerEvidenceFile } = await import("@/lib/fgc/evidence-upload");

    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: fakeFile("empty.txt", "text/plain", 0, []), evidenceCategory: "empty" })).rejects.toMatchObject({ status: 400, code: "FGC_EMPTY_EVIDENCE_FILE" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects path traversal names and executable double-extension disguises", async () => {
    installDefaultDbMocks();
    const { uploadLecturerEvidenceFile } = await import("@/lib/fgc/evidence-upload");

    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: pdfFile("..\\support.pdf"), evidenceCategory: "bad-name" })).rejects.toMatchObject({ code: "FGC_INVALID_FILENAME" });
    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: pdfFile("invoice.exe.pdf"), evidenceCategory: "bad-name" })).rejects.toMatchObject({ code: "FGC_DANGEROUS_EVIDENCE_FILENAME" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects MIME and signature mismatches", async () => {
    installDefaultDbMocks();
    const { uploadLecturerEvidenceFile } = await import("@/lib/fgc/evidence-upload");

    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: pdfFile("support.pdf", "image/png"), evidenceCategory: "mismatch" })).rejects.toMatchObject({ code: "FGC_EVIDENCE_MIME_MISMATCH" });
    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: pdfFile("support.pdf", "application/pdf", [1, 2, 3, 4]), evidenceCategory: "mismatch" })).rejects.toMatchObject({ code: "FGC_EVIDENCE_SIGNATURE_MISMATCH" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects active HTML or script content disguised as text evidence", async () => {
    installDefaultDbMocks();
    const { uploadLecturerEvidenceFile } = await import("@/lib/fgc/evidence-upload");

    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: textFile("notes.txt", "text/plain", "<!doctype html><script>alert(1)</script>"), evidenceCategory: "text" })).rejects.toMatchObject({ code: "FGC_EVIDENCE_SIGNATURE_MISMATCH" });
    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: textFile("data.json", "application/json", "{\"ok\":"), evidenceCategory: "text" })).rejects.toMatchObject({ code: "FGC_EVIDENCE_SIGNATURE_MISMATCH" });
    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: textFile("data.xml", "application/xml", "<root><broken></root>"), evidenceCategory: "text" })).rejects.toMatchObject({ code: "FGC_EVIDENCE_SIGNATURE_MISMATCH" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("inspects DOCX and XLSX package contents instead of accepting any ZIP", async () => {
    installDefaultDbMocks();
    const { uploadLecturerEvidenceFile } = await import("@/lib/fgc/evidence-upload");

    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: minimalZipFile("generic.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ["readme.txt"]), evidenceCategory: "office" })).rejects.toMatchObject({ code: "FGC_EVIDENCE_SIGNATURE_MISMATCH" });
    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: minimalZipFile("support.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ["[Content_Types].xml", "word/document.xml"]), evidenceCategory: "office" })).resolves.toMatchObject({ uploadStatus: "COMPLETED" });
  });

  it("generates opaque storage keys and SHA-256 checksums without using the original filename as path", async () => {
    const { generateFgcEvidenceStorageKey, sha256Hex } = await import("@/lib/fgc/evidence-upload");
    const key = generateFgcEvidenceStorageKey({ userId: access().user.id, submissionId: submission.id, extension: "pdf", now: new Date("2026-09-03T00:00:00.000Z") });
    const checksum = await sha256Hex(new TextEncoder().encode("abc").buffer);

    expect(key).toMatch(/^lecturer-evidence\/2026-09-03\/11111111\/55555555\/[a-f0-9]{48}\.pdf$/);
    expect(key).not.toContain("support.pdf");
    expect(checksum).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("denies non-lecturer and cross-scope uploads server-side", async () => {
    installDefaultDbMocks();
    const { uploadLecturerEvidenceFile } = await import("@/lib/fgc/evidence-upload");

    await expect(uploadLecturerEvidenceFile(access({ roles: [] }), { assignmentId: assignment.id, file: pdfFile(), evidenceCategory: "auth" })).rejects.toMatchObject({ status: 403, code: "FGC_LECTURER_ROLE_REQUIRED" });
    await expect(uploadLecturerEvidenceFile(access({ roles: [{ ...access().roles[0], campusId: "99999999-9999-9999-9999-999999999999" }] }), { assignmentId: assignment.id, file: pdfFile(), evidenceCategory: "auth" })).rejects.toMatchObject({ status: 403, code: "FGC_LECTURER_SCOPE_FORBIDDEN" });
  });

  it("denies forged assignment, toolkit field and replacement ids before storage", async () => {
    installDefaultDbMocks({ assignmentRow: null });
    const { uploadLecturerEvidenceFile } = await import("@/lib/fgc/evidence-upload");

    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: pdfFile(), evidenceCategory: "forged" })).rejects.toMatchObject({ status: 404, code: "FGC_FORM_ASSIGNMENT_NOT_FOUND" });
    expect(fetchMock).not.toHaveBeenCalled();

    installDefaultDbMocks();
    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: pdfFile(), evidenceCategory: "forged", sectionCode: "other", fieldCode: "field" })).rejects.toMatchObject({ status: 400, code: "FGC_INVALID_EVIDENCE_FIELD_LINK" });
    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: pdfFile(), evidenceCategory: "forged", replacementForFileId: "99999999-9999-9999-9999-999999999999" })).rejects.toMatchObject({ status: 404, code: "FGC_REPLACEMENT_EVIDENCE_NOT_FOUND" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects duplicate retry uploads before creating another completed evidence record", async () => {
    queryMock.mockImplementation((sql: string) => {
      if (sql.includes("FROM fgc.form_assignments")) return Promise.resolve({ rows: [assignment] });
      if (sql.includes("FROM fgc.production_submissions")) return Promise.resolve({ rows: [submission] });
      if (sql.includes("checksum_sha256")) return Promise.resolve({ rows: [{ id: "existing" }] });
      return Promise.resolve({ rows: [] });
    });
    const { uploadLecturerEvidenceFile } = await import("@/lib/fgc/evidence-upload");

    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: pdfFile(), evidenceCategory: "duplicate" })).rejects.toMatchObject({ status: 409, code: "FGC_DUPLICATE_EVIDENCE_FILE" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("denies immutable submissions unless they are in an editable governed revision state", async () => {
    installDefaultDbMocks({ submissionStatus: "SUBMITTED_BY_LECTURER" });
    const { uploadLecturerEvidenceFile } = await import("@/lib/fgc/evidence-upload");

    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: pdfFile(), evidenceCategory: "locked" })).rejects.toMatchObject({ status: 409, code: "FGC_SUBMISSION_LOCKED" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves replacement version history", async () => {
    installDefaultDbMocks({ replacement: true });
    const { uploadLecturerEvidenceFile } = await import("@/lib/fgc/evidence-upload");

    const result = await uploadLecturerEvidenceFile(access(), {
      assignmentId: assignment.id,
      file: pdfFile(),
      evidenceCategory: "replacement",
      replacementForFileId: "99999999-9999-9999-9999-999999999999"
    });

    expect(result.version).toBe(2);
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining("replaced_by_file_id"), expect.arrayContaining(["99999999-9999-9999-9999-999999999999", result.id]));
  });

  it("denies stale concurrent replacement attempts after storage and cleans up the new object", async () => {
    let replacementReads = 0;
    queryMock.mockImplementation((sql: string, values: unknown[]) => {
      if (sql.includes("FROM fgc.form_assignments")) return Promise.resolve({ rows: [assignment] });
      if (sql.includes("FROM fgc.production_submissions")) return Promise.resolve({ rows: [submission] });
      if (sql.includes("FROM fgc.evidence_files") && sql.includes("FOR UPDATE")) {
        replacementReads += 1;
        return Promise.resolve({
          rows: [
            {
              id: values[0],
              submission_id: submission.id,
              uploaded_by: access().user.id,
              review_status: "PENDING_REVIEW",
              evidence_version: 1,
              replaced_by_file_id: replacementReads === 1 ? null : "already-new"
            }
          ]
        });
      }
      if (sql.includes("FROM fgc.production_submission_versions")) return Promise.resolve({ rows: [] });
      if (sql.includes("INSERT INTO fgc.evidence_files")) return Promise.resolve({ rows: [{ id: "88888888-8888-8888-8888-888888888888" }] });
      if (sql.includes("UPDATE fgc.evidence_files") && sql.includes("upload_status = 'COMPLETED'")) return Promise.resolve({ rows: [{ id: "88888888-8888-8888-8888-888888888888", evidence_category: "RACE", original_filename: "support.pdf", mime_type: "application/pdf", file_size_bytes: "6", checksum_sha256: "abc123", review_status: "PENDING_REVIEW", upload_status: "COMPLETED", scanner_status: "UNAVAILABLE", evidence_version: 1, created_at: "2026-09-03T00:00:00.000Z" }] });
      return Promise.resolve({ rows: [] });
    });
    const { uploadLecturerEvidenceFile } = await import("@/lib/fgc/evidence-upload");

    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: pdfFile(), evidenceCategory: "race", replacementForFileId: "99999999-9999-9999-9999-999999999999" })).rejects.toMatchObject({ status: 409, code: "FGC_EVIDENCE_ALREADY_REPLACED" });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/storage/v1/object/fgc-evidence/lecturer-evidence/"), expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/storage/v1/object/fgc-evidence"), expect.objectContaining({ method: "DELETE" }));
  });

  it("cleans up storage if completed metadata persistence fails", async () => {
    installDefaultDbMocks();
    queryMock.mockImplementation((sql: string) => {
      if (sql.includes("INSERT INTO fgc.evidence_files")) return Promise.resolve({ rows: [{ id: "88888888-8888-8888-8888-888888888888" }] });
      if (sql.includes("UPDATE fgc.evidence_files") && sql.includes("upload_status = 'COMPLETED'")) throw new Error("db failed");
      if (sql.includes("FROM fgc.form_assignments")) return Promise.resolve({ rows: [assignment] });
      if (sql.includes("FROM fgc.production_submissions")) return Promise.resolve({ rows: [submission] });
      if (sql.includes("FROM fgc.production_submission_versions")) return Promise.resolve({ rows: [] });
      return Promise.resolve({ rows: [] });
    });
    const { uploadLecturerEvidenceFile } = await import("@/lib/fgc/evidence-upload");

    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: pdfFile(), evidenceCategory: "cleanup" })).rejects.toThrow("db failed");
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/storage/v1/object/fgc-evidence"), expect.objectContaining({ method: "DELETE" }));
  });

  it("audits storage cleanup failure after DB persistence failure", async () => {
    installDefaultDbMocks();
    queryMock.mockImplementation((sql: string) => {
      if (sql.includes("INSERT INTO fgc.evidence_files")) return Promise.resolve({ rows: [{ id: "88888888-8888-8888-8888-888888888888" }] });
      if (sql.includes("UPDATE fgc.evidence_files") && sql.includes("upload_status = 'COMPLETED'")) throw new Error("db failed");
      if (sql.includes("FROM fgc.form_assignments")) return Promise.resolve({ rows: [assignment] });
      if (sql.includes("FROM fgc.production_submissions")) return Promise.resolve({ rows: [submission] });
      if (sql.includes("FROM fgc.production_submission_versions")) return Promise.resolve({ rows: [] });
      return Promise.resolve({ rows: [] });
    });
    fetchMock.mockImplementation((url: string, init: RequestInit) => Promise.resolve({ ok: init.method !== "DELETE", json: async () => ({}) }));
    const { uploadLecturerEvidenceFile } = await import("@/lib/fgc/evidence-upload");

    await expect(uploadLecturerEvidenceFile(access(), { assignmentId: assignment.id, file: pdfFile(), evidenceCategory: "cleanup" })).rejects.toThrow("db failed");
    expect(fgcQueryMock).toHaveBeenCalledWith(expect.stringContaining("EVIDENCE_UPLOAD_CLEANUP_FAILED"), expect.any(Array));
  });
});

describe("FGC signed evidence download", () => {
  it("authorizes through canonical submission scope before issuing a short-lived signed URL", async () => {
    fgcQueryMock.mockImplementation((sql: string) => {
      if (sql.includes("FROM fgc.evidence_files")) {
        return Promise.resolve({
          rows: [
            {
              id: "88888888-8888-8888-8888-888888888888",
              submission_id: submission.id,
              storage_provider: "supabase",
              storage_bucket: "fgc-evidence",
              storage_key: "lecturer-evidence/opaque.pdf",
              original_filename: "support.pdf",
              mime_type: "application/pdf"
            }
          ]
        });
      }
      if (sql.includes("FROM fgc.production_submissions")) return Promise.resolve({ rows: [{ id: submission.id }] });
      return Promise.resolve({ rows: [] });
    });
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ signedURL: "/storage/v1/signed/object" }) });
    const { createFgcEvidenceFileViewUrl } = await import("@/lib/fgc/workbench");

    const result = await createFgcEvidenceFileViewUrl(access(), "88888888-8888-8888-8888-888888888888");

    expect(result.url).toBe("https://example.supabase.co/storage/v1/signed/object");
    expect(fgcQueryMock).toHaveBeenCalledWith(expect.stringContaining("upload_status = 'COMPLETED'"), expect.any(Array));
    expect(fgcQueryMock).toHaveBeenCalledWith(expect.stringContaining("ps.submitted_by = $1"), [access().user.id, submission.id]);
  });

  it("denies cross-lecturer IDOR attempts before signing storage access", async () => {
    fgcQueryMock.mockImplementation((sql: string) => {
      if (sql.includes("FROM fgc.evidence_files")) {
        return Promise.resolve({
          rows: [
            {
              id: "88888888-8888-8888-8888-888888888888",
              submission_id: submission.id,
              storage_provider: "supabase",
              storage_bucket: "fgc-evidence",
              storage_key: "lecturer-evidence/opaque.pdf",
              original_filename: "support.pdf",
              mime_type: "application/pdf"
            }
          ]
        });
      }
      if (sql.includes("FROM fgc.production_submissions")) return Promise.resolve({ rows: [] });
      return Promise.resolve({ rows: [] });
    });
    const { createFgcEvidenceFileViewUrl } = await import("@/lib/fgc/workbench");

    await expect(createFgcEvidenceFileViewUrl(access(), "88888888-8888-8888-8888-888888888888")).rejects.toMatchObject({ status: 404, code: "FGC_SUBMISSION_NOT_VISIBLE" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("denies signed download for incomplete evidence records", async () => {
    fgcQueryMock.mockImplementation((sql: string) => {
      if (sql.includes("FROM fgc.evidence_files")) return Promise.resolve({ rows: [] });
      return Promise.resolve({ rows: [] });
    });
    const { createFgcEvidenceFileViewUrl } = await import("@/lib/fgc/workbench");

    await expect(createFgcEvidenceFileViewUrl(access(), "88888888-8888-8888-8888-888888888888")).rejects.toMatchObject({ status: 404, code: "FGC_EVIDENCE_FILE_NOT_FOUND" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
