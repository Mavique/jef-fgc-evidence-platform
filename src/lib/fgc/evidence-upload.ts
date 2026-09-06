import { FgcConfigurationError, fgcQuery, withFgcTransaction } from "@/lib/fgc/db";
import type { FgcCurrentUserResult } from "@/lib/fgc/current-user";
import { getFgcRuntimeConfig } from "@/lib/fgc/env";
import { fgcLecturerModules } from "@/lib/fgc/lecturer-form";

type Access = Extract<FgcCurrentUserResult, { ok: true }>;
type FgcQueryExecutor = typeof fgcQuery;

export class FgcEvidenceUploadError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
    this.name = "FgcEvidenceUploadError";
  }
}

export type FgcEvidenceUploadInput = {
  assignmentId: string;
  file: File;
  evidenceCategory: string;
  sectionCode?: string;
  fieldCode?: string;
  description?: string;
  documentDate?: string;
  confidentiality?: string;
  replacementForFileId?: string;
};

export type FgcEvidenceFileMetadata = {
  id: string;
  category: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
  reviewStatus: string;
  uploadStatus: string;
  scannerStatus: string;
  version: number;
  uploadedAt: string;
  viewUrl: string;
};

type AssignmentRow = {
  id: string;
  assigned_to: string;
  assignment_status: string;
  reporting_period_id: string | null;
  programme_id: string | null;
  college_id: string | null;
  campus_id: string | null;
};

type SubmissionRow = {
  id: string;
  status: string;
  current_version: number;
  reporting_period_id: string | null;
  programme_id: string | null;
  college_id: string | null;
  campus_id: string | null;
};

type InsertedEvidenceRow = {
  id: string;
  evidence_category: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: string;
  checksum_sha256: string;
  review_status: string;
  upload_status: string;
  scanner_status: string;
  evidence_version: number;
  created_at: string;
};

type ReplacementRow = {
  id: string;
  submission_id: string | null;
  uploaded_by: string;
  review_status: string;
  evidence_version: number | null;
  replaced_by_file_id: string | null;
};

const editableSubmissionStatuses = new Set(["DRAFT", "READY_FOR_LECTURER_REVIEW", "CLARIFICATION_REQUESTED", "RESUBMITTED"]);
const allowedConfidentiality = new Set(["INTERNAL", "CONFIDENTIAL", "RESTRICTED"]);
const signatureSampleBytes = 8192;
const dangerousIntermediateExtensions = new Set(["ade", "adp", "app", "asp", "aspx", "bat", "cmd", "com", "cpl", "dll", "exe", "gadget", "hta", "htm", "html", "jar", "js", "jse", "jsp", "lnk", "mjs", "msi", "php", "pif", "ps1", "scr", "sh", "svg", "vbe", "vbs", "wsf"]);

const supportedTypes = [
  { extensions: ["pdf"], mimeTypes: ["application/pdf"], signatures: [[0x25, 0x50, 0x44, 0x46, 0x2d]] },
  {
    extensions: ["docx"],
    mimeTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    officePackage: "docx"
  },
  {
    extensions: ["xlsx"],
    mimeTypes: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    officePackage: "xlsx"
  },
  { extensions: ["csv"], mimeTypes: ["text/csv", "application/csv", "application/vnd.ms-excel"], textBased: true },
  { extensions: ["png"], mimeTypes: ["image/png"], signatures: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]] },
  { extensions: ["jpg", "jpeg"], mimeTypes: ["image/jpeg"], signatures: [[0xff, 0xd8, 0xff]] },
  { extensions: ["txt"], mimeTypes: ["text/plain"], textBased: true },
  { extensions: ["json"], mimeTypes: ["application/json", "text/json"], textBased: true },
  { extensions: ["xml"], mimeTypes: ["application/xml", "text/xml"], textBased: true },
  { extensions: ["log"], mimeTypes: ["text/plain"], textBased: true }
] as const;

function bytesStartWith(bytes: Uint8Array, signature: readonly number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function fileExtension(filename: string) {
  const trimmed = filename.trim();
  const dot = trimmed.lastIndexOf(".");
  return dot > 0 && dot < trimmed.length - 1 ? trimmed.slice(dot + 1).toLowerCase() : "";
}

function assertSafeFilename(filename: string) {
  const trimmed = filename.normalize("NFC").trim();
  if (!trimmed || trimmed.length > 180) {
    throw new FgcEvidenceUploadError(400, "FGC_INVALID_FILENAME", "Evidence filename is missing or too long.");
  }
  if (/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/.test(trimmed) || /[\\/]/.test(trimmed) || trimmed.includes("..") || trimmed === "." || trimmed === "..") {
    throw new FgcEvidenceUploadError(400, "FGC_INVALID_FILENAME", "Evidence filename contains unsupported path or control characters.");
  }
  const segments = trimmed.toLowerCase().split(".");
  if (segments.length > 2 && segments.slice(0, -1).some((segment) => dangerousIntermediateExtensions.has(segment))) {
    throw new FgcEvidenceUploadError(415, "FGC_DANGEROUS_EVIDENCE_FILENAME", "Evidence filename contains a dangerous disguised extension.");
  }
  return trimmed;
}

function normalizeMimeType(type: string) {
  return type.split(";")[0].trim().toLowerCase();
}

function assertValidCategory(category: string) {
  const normalized = category.trim().replace(/[^A-Za-z0-9_.:-]+/g, "_").slice(0, 80);
  if (!normalized) {
    throw new FgcEvidenceUploadError(400, "FGC_INVALID_EVIDENCE_CATEGORY", "Evidence category is required.");
  }
  return normalized;
}

function assertValidFieldLink(sectionCode?: string, fieldCode?: string) {
  if (!sectionCode && !fieldCode) return { sectionCode: null, fieldCode: null };
  if (!sectionCode || !fieldCode) {
    throw new FgcEvidenceUploadError(400, "FGC_INVALID_EVIDENCE_FIELD_LINK", "Both section and field are required when linking evidence to a toolkit field.");
  }
  const match = fgcLecturerModules.some((module) => module.code === sectionCode && module.fields.some((field) => field.code === fieldCode));
  if (!match) {
    throw new FgcEvidenceUploadError(400, "FGC_INVALID_EVIDENCE_FIELD_LINK", "The evidence field link is not part of the lecturer toolkit.");
  }
  return { sectionCode, fieldCode };
}

function assertValidDocumentDate(documentDate?: string) {
  if (!documentDate) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(documentDate) || Number.isNaN(Date.parse(`${documentDate}T00:00:00.000Z`))) {
    throw new FgcEvidenceUploadError(400, "FGC_INVALID_EVIDENCE_DOCUMENT_DATE", "Evidence document date must use YYYY-MM-DD format.");
  }
  return documentDate;
}

function readUint16LE(bytes: Uint8Array, offset: number) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readUint32LE(bytes: Uint8Array, offset: number) {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

function listZipCentralDirectoryEntries(bytes: Uint8Array) {
  const minimumEocdSize = 22;
  const searchStart = Math.max(0, bytes.length - minimumEocdSize - 65_535);
  let eocdOffset = -1;
  for (let offset = bytes.length - minimumEocdSize; offset >= searchStart; offset -= 1) {
    if (readUint32LE(bytes, offset) === 0x06054b50) {
      eocdOffset = offset;
      break;
    }
  }
  if (eocdOffset < 0) {
    throw new FgcEvidenceUploadError(415, "FGC_EVIDENCE_SIGNATURE_MISMATCH", "The Office document package is incomplete or malformed.");
  }
  const entryCount = readUint16LE(bytes, eocdOffset + 10);
  const directorySize = readUint32LE(bytes, eocdOffset + 12);
  const directoryOffset = readUint32LE(bytes, eocdOffset + 16);
  if (directoryOffset + directorySize > bytes.length || directoryOffset >= eocdOffset) {
    throw new FgcEvidenceUploadError(415, "FGC_EVIDENCE_SIGNATURE_MISMATCH", "The Office document package directory is invalid.");
  }

  const decoder = new TextDecoder("utf-8");
  const entries: string[] = [];
  let offset = directoryOffset;
  for (let index = 0; index < entryCount; index += 1) {
    if (offset + 46 > bytes.length || readUint32LE(bytes, offset) !== 0x02014b50) {
      throw new FgcEvidenceUploadError(415, "FGC_EVIDENCE_SIGNATURE_MISMATCH", "The Office document package directory is malformed.");
    }
    const filenameLength = readUint16LE(bytes, offset + 28);
    const extraLength = readUint16LE(bytes, offset + 30);
    const commentLength = readUint16LE(bytes, offset + 32);
    const filenameStart = offset + 46;
    const filenameEnd = filenameStart + filenameLength;
    if (filenameEnd > bytes.length) {
      throw new FgcEvidenceUploadError(415, "FGC_EVIDENCE_SIGNATURE_MISMATCH", "The Office document package directory is malformed.");
    }
    entries.push(decoder.decode(bytes.slice(filenameStart, filenameEnd)).replace(/\\/g, "/"));
    offset = filenameEnd + extraLength + commentLength;
  }
  return entries;
}

function assertOfficePackage(extension: "docx" | "xlsx", bytes: Uint8Array, sample: Uint8Array) {
  if (!bytesStartWith(sample, [0x50, 0x4b, 0x03, 0x04])) {
    throw new FgcEvidenceUploadError(415, "FGC_EVIDENCE_SIGNATURE_MISMATCH", "The Office document does not have a valid package signature.");
  }
  const entries = new Set(listZipCentralDirectoryEntries(bytes));
  const hasContentTypes = entries.has("[Content_Types].xml");
  const hasRequiredDocumentPart = extension === "docx" ? entries.has("word/document.xml") : entries.has("xl/workbook.xml");
  if (!hasContentTypes || !hasRequiredDocumentPart) {
    throw new FgcEvidenceUploadError(415, "FGC_EVIDENCE_SIGNATURE_MISMATCH", "The Office document package is not a supported DOCX or XLSX file.");
  }
}

function decodeUtf8(bytes: Uint8Array) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new FgcEvidenceUploadError(415, "FGC_EVIDENCE_SIGNATURE_MISMATCH", "Text evidence must be valid UTF-8 content.");
  }
}

function assertNoActiveTextContent(text: string) {
  if (/(<\s*script\b|<\s*html\b|<!doctype\s+html|<\s*svg\b|javascript\s*:|<\?php\b|on[a-z]+\s*=)/i.test(text)) {
    throw new FgcEvidenceUploadError(415, "FGC_EVIDENCE_SIGNATURE_MISMATCH", "Text evidence cannot contain active HTML or script content.");
  }
}

function assertXmlLooksWellFormed(text: string) {
  const body = text.trim();
  if (!body.startsWith("<")) {
    throw new FgcEvidenceUploadError(415, "FGC_EVIDENCE_SIGNATURE_MISMATCH", "XML evidence must contain a well-formed XML document.");
  }
  const stripped = body.replace(/<!--[\s\S]*?-->/g, "").replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "").replace(/<\?[\s\S]*?\?>/g, "");
  const tags = stripped.match(/<[^>]+>/g) ?? [];
  const stack: string[] = [];
  let rootCount = 0;
  for (const tag of tags) {
    if (/^<!/.test(tag)) continue;
    if (/^<\//.test(tag)) {
      const name = tag.slice(2, -1).trim().split(/\s+/)[0];
      if (stack.pop() !== name) {
        throw new FgcEvidenceUploadError(415, "FGC_EVIDENCE_SIGNATURE_MISMATCH", "XML evidence must contain a well-formed XML document.");
      }
      continue;
    }
    if (/\/>$/.test(tag)) {
      if (stack.length === 0) rootCount += 1;
      continue;
    }
    const name = tag.slice(1, -1).trim().split(/\s+/)[0];
    if (!/^[A-Za-z_][\w:.-]*$/.test(name)) {
      throw new FgcEvidenceUploadError(415, "FGC_EVIDENCE_SIGNATURE_MISMATCH", "XML evidence must contain a well-formed XML document.");
    }
    if (stack.length === 0) rootCount += 1;
    stack.push(name);
  }
  if (stack.length || rootCount !== 1) {
    throw new FgcEvidenceUploadError(415, "FGC_EVIDENCE_SIGNATURE_MISMATCH", "XML evidence must contain a well-formed XML document.");
  }
}

function assertTextContent(extension: string, bytes: Uint8Array) {
  if (bytes.some((byte) => byte === 0)) {
    throw new FgcEvidenceUploadError(415, "FGC_EVIDENCE_SIGNATURE_MISMATCH", "Text evidence cannot contain binary control content.");
  }
  const text = decodeUtf8(bytes);
  assertNoActiveTextContent(text);
  if (extension === "json") {
    try {
      JSON.parse(text);
    } catch {
      throw new FgcEvidenceUploadError(415, "FGC_EVIDENCE_SIGNATURE_MISMATCH", "JSON evidence must contain valid JSON.");
    }
  }
  if (extension === "xml") assertXmlLooksWellFormed(text);
}

function assertAllowedFileType(filename: string, mimeType: string, bytes: Uint8Array) {
  const sample = bytes.slice(0, signatureSampleBytes);
  const extension = fileExtension(filename);
  const definition = supportedTypes.find((type) => type.extensions.includes(extension as never));
  if (!definition) {
    throw new FgcEvidenceUploadError(415, "FGC_UNSUPPORTED_EVIDENCE_TYPE", "This evidence file type is not supported.");
  }
  if (!definition.mimeTypes.includes(mimeType as never)) {
    throw new FgcEvidenceUploadError(415, "FGC_EVIDENCE_MIME_MISMATCH", "The evidence file extension and declared content type do not match.");
  }
  if ("signatures" in definition && definition.signatures && !definition.signatures.some((signature) => bytesStartWith(sample, signature))) {
    throw new FgcEvidenceUploadError(415, "FGC_EVIDENCE_SIGNATURE_MISMATCH", "The evidence file content does not match its declared type.");
  }
  if ("officePackage" in definition) assertOfficePackage(definition.officePackage, bytes, sample);
  if ("textBased" in definition && definition.textBased) assertTextContent(extension, bytes);
  return extension;
}

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(buffer: ArrayBuffer) {
  return bytesToHex(await globalThis.crypto.subtle.digest("SHA-256", buffer));
}

export function generateFgcEvidenceStorageKey(input: { userId: string; submissionId: string; extension: string; now?: Date }) {
  const random = new Uint8Array(24);
  globalThis.crypto.getRandomValues(random);
  const token = bytesToHex(random.buffer);
  const date = (input.now ?? new Date()).toISOString().slice(0, 10);
  return `lecturer-evidence/${date}/${input.userId.slice(0, 8)}/${input.submissionId.slice(0, 8)}/${token}.${input.extension}`;
}

function assertLecturerRoleAndAssignmentScope(access: Access, assignment: AssignmentRow) {
  if (assignment.assigned_to !== access.user.id) {
    throw new FgcEvidenceUploadError(404, "FGC_FORM_ASSIGNMENT_NOT_FOUND", "This FGC form assignment was not found for the signed-in lecturer.");
  }
  const approvedLecturerRoles = access.roles.filter((role) => role.code === "LECTURER" && role.status === "APPROVED");
  if (!approvedLecturerRoles.length) {
    throw new FgcEvidenceUploadError(403, "FGC_LECTURER_ROLE_REQUIRED", "Only an approved Lecturer can upload evidence.");
  }
  const scoped = approvedLecturerRoles.some((role) => {
    const collegeOk = !role.collegeId || role.collegeId === assignment.college_id;
    const campusOk = !role.campusId || role.campusId === assignment.campus_id;
    return collegeOk && campusOk;
  });
  if (!scoped) {
    throw new FgcEvidenceUploadError(403, "FGC_LECTURER_SCOPE_FORBIDDEN", "This evidence upload is outside the lecturer's approved institution scope.");
  }
}

async function getAssignment(assignmentId: string, userId: string, query: FgcQueryExecutor) {
  const result = await query<AssignmentRow>(
    `
      SELECT id::text, assigned_to::text, status AS assignment_status,
        reporting_period_id::text, programme_id::text, college_id::text, campus_id::text
      FROM fgc.form_assignments
      WHERE id = $1 AND assigned_to = $2
      LIMIT 1
    `,
    [assignmentId, userId]
  );
  return result.rows[0] ?? null;
}

async function getOrCreateEditableSubmission(assignment: AssignmentRow, userId: string, query: FgcQueryExecutor) {
  const current = await query<SubmissionRow>(
    `
      SELECT id::text, status::text, current_version, reporting_period_id::text, programme_id::text, college_id::text, campus_id::text
      FROM fgc.production_submissions
      WHERE assignment_id = $1
        AND submitted_by = $2
        AND status <> 'ARCHIVED'
      ORDER BY created_at DESC
      LIMIT 1
      FOR UPDATE
    `,
    [assignment.id, userId]
  );
  const existing = current.rows[0];
  if (existing) {
    if (!editableSubmissionStatuses.has(existing.status)) {
      throw new FgcEvidenceUploadError(409, "FGC_SUBMISSION_LOCKED", "This submission is locked and cannot accept lecturer evidence uploads.");
    }
    return existing;
  }
  const created = await query<SubmissionRow>(
    `
      INSERT INTO fgc.production_submissions (
        assignment_id, submitted_by, reporting_period_id, programme_id, college_id, campus_id, status, current_version
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT', 0)
      RETURNING id::text, status::text, current_version, reporting_period_id::text, programme_id::text, college_id::text, campus_id::text
    `,
    [assignment.id, userId, assignment.reporting_period_id, assignment.programme_id, assignment.college_id, assignment.campus_id]
  );
  await query("UPDATE fgc.form_assignments SET status = 'IN_PROGRESS' WHERE id = $1 AND status = 'ASSIGNED'", [assignment.id]);
  return created.rows[0];
}

async function getLatestResponseLink(submissionId: string, sectionCode: string | null, fieldCode: string | null, query: FgcQueryExecutor) {
  if (!sectionCode || !fieldCode) return { submissionVersionId: null, responseValueId: null };
  const result = await query<{ submission_version_id: string; response_value_id: string | null }>(
    `
      SELECT psv.id::text AS submission_version_id, prv.id::text AS response_value_id
      FROM fgc.production_submission_versions psv
      LEFT JOIN fgc.production_response_values prv
        ON prv.submission_version_id = psv.id
       AND prv.section_code = $2
       AND prv.field_code = $3
      WHERE psv.submission_id = $1
      ORDER BY psv.version DESC
      LIMIT 1
    `,
    [submissionId, sectionCode, fieldCode]
  );
  return {
    submissionVersionId: result.rows[0]?.submission_version_id ?? null,
    responseValueId: result.rows[0]?.response_value_id ?? null
  };
}

async function assertNoDuplicateCompletedEvidence(input: { submissionId: string; uploadedBy: string; evidenceCategory: string; checksumSha256: string }, query: FgcQueryExecutor) {
  const duplicate = await query<{ id: string }>(
    `
      SELECT id::text
      FROM fgc.evidence_files
      WHERE submission_id = $1
        AND uploaded_by = $2
        AND evidence_category = $3
        AND checksum_sha256 = $4
        AND upload_status = 'COMPLETED'
        AND review_status <> 'REPLACED'
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [input.submissionId, input.uploadedBy, input.evidenceCategory, input.checksumSha256]
  );
  if (duplicate.rows[0]) {
    throw new FgcEvidenceUploadError(409, "FGC_DUPLICATE_EVIDENCE_FILE", "This evidence file has already been uploaded for this submission and category.");
  }
}

function encodeStorageKey(storageKey: string) {
  return storageKey.split("/").map((segment) => encodeURIComponent(segment)).join("/");
}

async function uploadToSupabaseStorage(params: { arrayBuffer: ArrayBuffer; storageKey: string; contentType: string }) {
  const config = getFgcRuntimeConfig();
  if (config.evidenceStorageProvider !== "supabase" || !config.supabaseUrl || !config.supabaseServiceRoleKey || !config.evidenceStorageBucket) {
    throw new FgcConfigurationError("Private Supabase evidence storage is not fully configured.");
  }
  const response = await fetch(`${config.supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${encodeURIComponent(config.evidenceStorageBucket)}/${encodeStorageKey(params.storageKey)}`, {
    method: "POST",
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": params.contentType,
      "x-upsert": "false"
    },
    body: params.arrayBuffer
  });
  if (!response.ok) {
    throw new FgcEvidenceUploadError(502, "FGC_EVIDENCE_STORAGE_UPLOAD_FAILED", "Evidence storage upload failed.");
  }
}

async function deleteSupabaseObject(storageKey: string) {
  const config = getFgcRuntimeConfig();
  if (config.evidenceStorageProvider !== "supabase" || !config.supabaseUrl || !config.supabaseServiceRoleKey || !config.evidenceStorageBucket) return false;
  const response = await fetch(`${config.supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${encodeURIComponent(config.evidenceStorageBucket)}`, {
    method: "DELETE",
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prefixes: [storageKey] })
  });
  if (!response.ok) throw new Error("Evidence storage cleanup failed.");
  return true;
}

export async function recordEvidenceUploadRejection(access: Access | null, input: { assignmentId?: string; code: string; message: string; filename?: string; status?: number }) {
  await fgcQuery(
    `
      INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, reason, metadata)
      VALUES ($1, $2, 'REJECT_EVIDENCE_UPLOAD', 'evidence_file', $3, $4::jsonb)
    `,
    [
      access?.user.id ?? null,
      access?.access.activeRole?.code ?? access?.access.accessState ?? null,
      input.message,
      JSON.stringify({ assignmentId: input.assignmentId ?? null, code: input.code, filename: input.filename ?? null, status: input.status ?? null })
    ]
  ).catch(() => undefined);
}

async function recordEvidenceUploadCleanupFailure(access: Access, input: { assignmentId: string; filename: string; code: string }) {
  await fgcQuery(
    `
      INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, reason, metadata)
      VALUES ($1, $2, 'EVIDENCE_UPLOAD_CLEANUP_FAILED', 'evidence_file', 'Storage cleanup failed after evidence upload metadata persistence failure.', $3::jsonb)
    `,
    [
      access.user.id,
      access.access.activeRole?.code ?? access.access.accessState ?? null,
      JSON.stringify({ assignmentId: input.assignmentId, code: input.code, filename: input.filename })
    ]
  ).catch(() => undefined);
}

function isUniqueViolation(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: unknown }).code === "23505");
}

export async function uploadLecturerEvidenceFile(access: Access, input: FgcEvidenceUploadInput): Promise<FgcEvidenceFileMetadata> {
  const config = getFgcRuntimeConfig();
  const originalFilename = assertSafeFilename(input.file.name);
  const mimeType = normalizeMimeType(input.file.type);
  if (!mimeType) throw new FgcEvidenceUploadError(415, "FGC_EVIDENCE_MIME_REQUIRED", "Evidence content type is required.");
  if (input.file.size <= 0) throw new FgcEvidenceUploadError(400, "FGC_EMPTY_EVIDENCE_FILE", "Evidence file is empty.");
  if (input.file.size > config.maxUploadBytes) {
    throw new FgcEvidenceUploadError(413, "FGC_EVIDENCE_FILE_TOO_LARGE", "Evidence file exceeds the configured upload limit.", { maxUploadBytes: config.maxUploadBytes });
  }

  const arrayBuffer = await input.file.arrayBuffer();
  const fileBytes = new Uint8Array(arrayBuffer);
  const extension = assertAllowedFileType(originalFilename, mimeType, fileBytes);
  const evidenceCategory = assertValidCategory(input.evidenceCategory);
  const link = assertValidFieldLink(input.sectionCode, input.fieldCode);
  const documentDate = assertValidDocumentDate(input.documentDate);
  const confidentiality = input.confidentiality && allowedConfidentiality.has(input.confidentiality) ? input.confidentiality : "INTERNAL";
  const checksumSha256 = await sha256Hex(arrayBuffer);

  let storageKey = "";
  let evidenceId = "";
  try {
    const prepared = await withFgcTransaction(async (query) => {
      const assignment = await getAssignment(input.assignmentId, access.user.id, query);
      if (!assignment) {
        throw new FgcEvidenceUploadError(404, "FGC_FORM_ASSIGNMENT_NOT_FOUND", "This FGC form assignment was not found for the signed-in lecturer.");
      }
      assertLecturerRoleAndAssignmentScope(access, assignment);
      const submission = await getOrCreateEditableSubmission(assignment, access.user.id, query);
      const replacement = input.replacementForFileId
        ? await query<ReplacementRow>(
            `
              SELECT id::text, submission_id::text, uploaded_by::text, review_status::text, evidence_version, replaced_by_file_id::text
              FROM fgc.evidence_files
              WHERE id = $1 AND deleted_at IS NULL
              LIMIT 1
              FOR UPDATE
            `,
            [input.replacementForFileId]
          )
        : { rows: [] };
      const replacementFile = replacement.rows[0] ?? null;
      if (input.replacementForFileId && (!replacementFile || replacementFile.submission_id !== submission.id || replacementFile.uploaded_by !== access.user.id)) {
        throw new FgcEvidenceUploadError(404, "FGC_REPLACEMENT_EVIDENCE_NOT_FOUND", "The evidence file selected for replacement was not found in this lecturer submission.");
      }
      if (replacementFile?.replaced_by_file_id) {
        throw new FgcEvidenceUploadError(409, "FGC_EVIDENCE_ALREADY_REPLACED", "This evidence file already has a replacement version.");
      }
      await assertNoDuplicateCompletedEvidence({ submissionId: submission.id, uploadedBy: access.user.id, evidenceCategory, checksumSha256 }, query);
      const latestVersion = Math.max(1, (replacementFile?.evidence_version ?? 0) + 1);
      const responseLink = await getLatestResponseLink(submission.id, link.sectionCode, link.fieldCode, query);
      const key = generateFgcEvidenceStorageKey({ userId: access.user.id, submissionId: submission.id, extension });
      await query(
        `
          INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, object_id, reason, metadata)
          VALUES ($1, 'LECTURER', 'INITIATE_EVIDENCE_UPLOAD', 'production_submission', $2, 'Lecturer initiated validated private evidence upload.', $3::jsonb)
        `,
        [access.user.id, submission.id, JSON.stringify({ assignmentId: input.assignmentId, filename: originalFilename, mimeType, fileSizeBytes: input.file.size, evidenceCategory, sectionCode: link.sectionCode, fieldCode: link.fieldCode, replacementForFileId: input.replacementForFileId ?? null })]
      );
      const initiated = await query<{ id: string }>(
        `
          INSERT INTO fgc.evidence_files (
            submission_id, uploaded_by, college_id, campus_id, evidence_category, original_filename,
            stored_filename, storage_provider, storage_bucket, storage_key, mime_type, file_size_bytes,
            checksum_sha256, document_date, reporting_period_id, description, confidentiality_classification,
            review_status, replaced_file_id, submission_version_id, response_value_id, section_code, field_code,
            upload_status, scanner_status, evidence_version
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'supabase', $8, $9, $10, $11, $12, $13::date, $14, $15, $16,
            'PENDING_REVIEW', $17, $18, $19, $20, $21, 'INITIATED', 'UNAVAILABLE', $22)
          RETURNING id::text
        `,
        [
          submission.id, access.user.id, submission.college_id, submission.campus_id, evidenceCategory,
          originalFilename, key.split("/").at(-1) ?? key, getFgcRuntimeConfig().evidenceStorageBucket,
          key, mimeType, input.file.size, checksumSha256, documentDate, submission.reporting_period_id,
          input.description?.trim() || null, confidentiality, replacementFile?.id ?? null,
          responseLink.submissionVersionId, responseLink.responseValueId, link.sectionCode, link.fieldCode,
          latestVersion
        ]
      );
      return { assignment, submission, replacementFile, responseLink, storageKey: key, evidenceVersion: latestVersion, evidenceId: initiated.rows[0].id };
    });

    storageKey = prepared.storageKey;
    evidenceId = prepared.evidenceId;
    await uploadToSupabaseStorage({ arrayBuffer, storageKey, contentType: mimeType });

    const inserted = await withFgcTransaction(async (query) => {
      const assignment = await getAssignment(input.assignmentId, access.user.id, query);
      if (!assignment) throw new FgcEvidenceUploadError(404, "FGC_FORM_ASSIGNMENT_NOT_FOUND", "This FGC form assignment was not found for the signed-in lecturer.");
      assertLecturerRoleAndAssignmentScope(access, assignment);
      const submission = await getOrCreateEditableSubmission(assignment, access.user.id, query);
      if (submission.id !== prepared.submission.id) {
        throw new FgcEvidenceUploadError(409, "FGC_EVIDENCE_UPLOAD_STATE_CHANGED", "Submission state changed during upload. Please retry.");
      }
      await assertNoDuplicateCompletedEvidence({ submissionId: submission.id, uploadedBy: access.user.id, evidenceCategory, checksumSha256 }, query);
      const replacement = input.replacementForFileId
        ? await query<ReplacementRow>(
            `
              SELECT id::text, submission_id::text, uploaded_by::text, review_status::text, evidence_version, replaced_by_file_id::text
              FROM fgc.evidence_files
              WHERE id = $1 AND deleted_at IS NULL
              LIMIT 1
              FOR UPDATE
            `,
            [input.replacementForFileId]
          )
        : { rows: [] };
      const replacementFile = replacement.rows[0] ?? null;
      if (input.replacementForFileId && (!replacementFile || replacementFile.submission_id !== submission.id || replacementFile.uploaded_by !== access.user.id)) {
        throw new FgcEvidenceUploadError(404, "FGC_REPLACEMENT_EVIDENCE_NOT_FOUND", "The evidence file selected for replacement was not found in this lecturer submission.");
      }
      if (replacementFile?.replaced_by_file_id) {
        throw new FgcEvidenceUploadError(409, "FGC_EVIDENCE_ALREADY_REPLACED", "This evidence file already has a replacement version.");
      }
      const row = await query<InsertedEvidenceRow>(
        `
          UPDATE fgc.evidence_files
          SET upload_status = 'COMPLETED', upload_completed_at = now()
          WHERE id = $1 AND submission_id = $2 AND uploaded_by = $3 AND upload_status = 'INITIATED'
          RETURNING id::text, evidence_category, original_filename, mime_type, file_size_bytes::text, checksum_sha256,
            review_status::text, upload_status, scanner_status, evidence_version, created_at::text
        `,
        [evidenceId, submission.id, access.user.id]
      );
      const evidenceFile = row.rows[0];
      if (!evidenceFile) throw new FgcEvidenceUploadError(409, "FGC_EVIDENCE_UPLOAD_STATE_CHANGED", "Evidence upload state changed before completion. Please retry.");
      if (replacementFile) {
        await query(
          "UPDATE fgc.evidence_files SET review_status = 'REPLACED', replaced_by_file_id = $2 WHERE id = $1",
          [replacementFile.id, evidenceFile.id]
        );
        await query(
          `
            INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, object_id, reason, metadata)
            VALUES ($1, 'LECTURER', 'REPLACE_EVIDENCE_FILE', 'evidence_file', $2, 'Lecturer uploaded a replacement evidence version.', $3::jsonb)
          `,
          [access.user.id, evidenceFile.id, JSON.stringify({ previousFileId: replacementFile.id, submissionId: submission.id, evidenceVersion: evidenceFile.evidence_version })]
        );
      }
      await query(
        `
          INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, object_id, reason, metadata)
          VALUES ($1, 'LECTURER', 'COMPLETE_EVIDENCE_UPLOAD', 'evidence_file', $2, 'Private evidence upload completed and metadata persisted pending review.', $3::jsonb)
        `,
        [access.user.id, evidenceFile.id, JSON.stringify({ submissionId: submission.id, assignmentId: input.assignmentId, checksumSha256, fileSizeBytes: input.file.size, scannerStatus: "UNAVAILABLE" })]
      );
      return evidenceFile;
    });

    return {
      id: inserted.id,
      category: inserted.evidence_category,
      filename: inserted.original_filename,
      mimeType: inserted.mime_type,
      sizeBytes: Number(inserted.file_size_bytes),
      checksumSha256: inserted.checksum_sha256,
      reviewStatus: inserted.review_status,
      uploadStatus: inserted.upload_status,
      scannerStatus: inserted.scanner_status,
      version: inserted.evidence_version,
      uploadedAt: inserted.created_at,
      viewUrl: `/api/fgc/evidence/files/${inserted.id}/download`
    };
  } catch (error) {
    if (evidenceId) {
      await fgcQuery(
        "UPDATE fgc.evidence_files SET upload_status = 'FAILED', upload_failure_reason = $2 WHERE id = $1 AND upload_status <> 'COMPLETED'",
        [evidenceId, error instanceof FgcEvidenceUploadError ? error.code : "FGC_EVIDENCE_UPLOAD_FAILED"]
      ).catch(() => undefined);
    }
    if (storageKey) {
      try {
        await deleteSupabaseObject(storageKey);
      } catch {
        await recordEvidenceUploadCleanupFailure(access, {
          assignmentId: input.assignmentId,
          filename: originalFilename,
          code: error instanceof FgcEvidenceUploadError ? error.code : "FGC_EVIDENCE_UPLOAD_PERSISTENCE_FAILED"
        });
      }
    }
    if (error instanceof FgcEvidenceUploadError) {
      await recordEvidenceUploadRejection(access, { assignmentId: input.assignmentId, code: error.code, message: error.message, filename: originalFilename, status: error.status });
    } else if (isUniqueViolation(error)) {
      const duplicateError = new FgcEvidenceUploadError(409, "FGC_DUPLICATE_EVIDENCE_FILE", "This evidence file has already been uploaded or replaced by another request.");
      await recordEvidenceUploadRejection(access, { assignmentId: input.assignmentId, code: duplicateError.code, message: duplicateError.message, filename: originalFilename, status: duplicateError.status });
      throw duplicateError;
    }
    throw error;
  }
}
