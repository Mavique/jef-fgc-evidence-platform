import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { fgcTtlBounds, getFgcRuntimeConfig, getFgcTtlSeconds, getMissingProductionConfig } from "@/lib/fgc/env";
import { constantTimeEqual, createSecureToken, hashPassword, hashToken, passwordMeetsPolicy, verifyPassword } from "@/lib/fgc/security";

const productionMigration = readFileSync(join(process.cwd(), "db", "fgc", "007_production_hardening_schema.sql"), "utf8");
const lecturerSubmissionsSource = readFileSync(join(process.cwd(), "src", "lib", "fgc", "lecturer-submissions.ts"), "utf8");
const workbenchSource = readFileSync(join(process.cwd(), "src", "lib", "fgc", "workbench.ts"), "utf8");
const workbenchUiSource = readFileSync(join(process.cwd(), "src", "components", "merseta-fgc", "FgcAccessExperience.tsx"), "utf8");
const submissionDetailRouteSource = readFileSync(join(process.cwd(), "src", "app", "api", "fgc", "submissions", "[submissionId]", "route.ts"), "utf8");
const evidenceDownloadRouteSource = readFileSync(join(process.cwd(), "src", "app", "api", "fgc", "evidence", "files", "[fileId]", "download", "route.ts"), "utf8");
const evidenceUploadSource = readFileSync(join(process.cwd(), "src", "lib", "fgc", "evidence-upload.ts"), "utf8");
const evidenceUploadRouteSource = readFileSync(join(process.cwd(), "src", "app", "api", "fgc", "lecturer", "forms", "[assignmentId]", "evidence", "route.ts"), "utf8");

describe("FGC production security helpers", () => {
  it("hashes passwords without storing the clear text and verifies only the right password", async () => {
    const password = "CorrectHorse9!";
    const hash = await hashPassword(password);

    expect(hash).not.toContain(password);
    expect(hash.startsWith("scrypt:")).toBe(true);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
    await expect(verifyPassword("WrongHorse9!", hash)).resolves.toBe(false);
  });

  it("creates non-plaintext token hashes", () => {
    const token = createSecureToken();
    const hashed = hashToken(token);

    expect(token).not.toEqual(hashed);
    expect(hashed).toHaveLength(64);
    expect(hashToken(token)).toEqual(hashed);
  });

  it("compares bootstrap secrets without a plain equality shortcut", () => {
    expect(constantTimeEqual("test-bootstrap-token", "test-bootstrap-token")).toBe(true);
    expect(constantTimeEqual("test-bootstrap-token", "wrong-bootstrap-token")).toBe(false);
    expect(constantTimeEqual("short", "longer")).toBe(false);
  });

  it("enforces the minimum production password policy", () => {
    expect(passwordMeetsPolicy("short")).toBe(false);
    expect(passwordMeetsPolicy("lowercase-only-password")).toBe(false);
    expect(passwordMeetsPolicy("Production9!")).toBe(true);
  });
});

describe("FGC production configuration", () => {
  it("reports missing infrastructure honestly", () => {
    expect(
      getMissingProductionConfig({
        environment: "development",
        appUrl: "http://localhost:3000"
      })
    ).toEqual([
      "DATABASE_URL",
      "FGC_SESSION_SECRET",
      "FGC_EMAIL_PROVIDER",
      "FGC_EMAIL_FROM",
      "FGC_EMAIL_API_KEY",
      "FGC_EVIDENCE_STORAGE_PROVIDER",
      "FGC_EVIDENCE_STORAGE_BUCKET"
    ]);
  });

  it("uses bounded configurable TTLs and rejects unsafe deployment URLs", () => {
    const original = { ...process.env };
    process.env.FGC_SESSION_TTL_SECONDS = "1800";
    process.env.FGC_VERIFICATION_TOKEN_TTL_SECONDS = "7200";
    process.env.FGC_PASSWORD_RESET_TOKEN_TTL_SECONDS = "3600";
    expect(getFgcTtlSeconds()).toEqual({ session: 1800, verification: 7200, passwordReset: 3600 });
    process.env.FGC_SESSION_TTL_SECONDS = "1";
    expect(getFgcRuntimeConfig().sessionTtlSeconds).toBe(fgcTtlBounds.session.fallback);
    process.env.FGC_ENVIRONMENT = "staging";
    expect(getMissingProductionConfig(getFgcRuntimeConfig())).toEqual(expect.arrayContaining(["FGC_APP_URL_HTTPS", "FGC_APP_URL_PUBLIC_HOST"]));
    for (const key of Object.keys(process.env)) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  });
});

describe("FGC production hardening migration", () => {
  it("adds durable auth, workflow, evidence, report, notification and audit tables", () => {
    [
      "CREATE EXTENSION IF NOT EXISTS citext",
      "CREATE TABLE fgc.production_users",
      "CREATE TABLE fgc.production_auth_tokens",
      "CREATE TABLE fgc.production_sessions",
      "CREATE TABLE fgc.production_role_assignments",
      "CREATE TABLE fgc.campus_addition_requests",
      "CREATE TABLE fgc.form_templates",
      "CREATE TABLE fgc.production_submissions",
      "CREATE TABLE fgc.evidence_files",
      "CREATE TABLE fgc.generated_reports",
      "CREATE TABLE fgc.notifications",
      "CREATE TABLE fgc.production_audit_events",
      "CREATE OR REPLACE VIEW fgc.v_production_readiness"
    ].forEach((fragment) => {
      expect(productionMigration).toContain(fragment);
    });
  });

  it("uses a valid PostgreSQL expression index for nullable role scopes", () => {
    expect(productionMigration.replace(/\r?\n/g, " ")).not.toMatch(/UNIQUE\s*\([^;]*COALESCE/i);
    expect(productionMigration).toContain("CREATE UNIQUE INDEX idx_fgc_role_assignments_unique_scope");
  });
});

describe("FGC lecturer capture persistence", () => {
  it("allows the lecturer form by approved Lecturer role, not only the default active portal role", () => {
    expect(lecturerSubmissionsSource).toContain('role.code === "LECTURER" && role.status === "APPROVED"');
    expect(lecturerSubmissionsSource).not.toContain('access.access.accessState !== "LECTURER_ACTIVE"');
  });

  it("submits the final lecturer snapshot without nesting draft transactions", () => {
    const submitFunction = lecturerSubmissionsSource.slice(
      lecturerSubmissionsSource.indexOf("export async function submitLecturerForm"),
      lecturerSubmissionsSource.length
    );

    expect(lecturerSubmissionsSource).toContain("saveLecturerDraftWithinTransaction");
    expect(submitFunction).not.toContain("await saveLecturerDraft(");
    expect(submitFunction).toContain("saveLecturerDraftWithinTransaction");
  });
});

describe("FGC canonical submission visibility", () => {
  it("exposes a scoped submission detail API instead of duplicating role datasets", () => {
    expect(workbenchSource).toContain("export async function getFgcSubmissionDetail");
    expect(workbenchSource).toContain("export async function assertSubmissionVisibleToAccess");
    expect(submissionDetailRouteSource).toContain("getFgcSubmissionDetail(access, parsed.data.submissionId)");
  });

  it("checks role scope before recording production workbench decisions", () => {
    const decisionFunction = workbenchSource.slice(
      workbenchSource.indexOf("export async function recordFgcWorkbenchDecision"),
      workbenchSource.indexOf("export async function generateFgcWorkbenchReport")
    );

    expect(decisionFunction).toContain("await assertSubmissionVisibleToAccess(access, input.submissionId, query)");
  });

  it("does not expose evidence storage keys through the submission viewer API", () => {
    const detailFunction = workbenchSource.slice(workbenchSource.indexOf("export async function getFgcSubmissionDetail"));

    expect(detailFunction).toContain("FROM fgc.evidence_files");
    expect(detailFunction).toContain("viewUrl");
  });

  it("adds a reusable full submission viewer to the authorised role workbench UI", () => {
    expect(workbenchUiSource).toContain("Open full submission");
    expect(workbenchUiSource).toContain("ProductionSubmissionDetailViewer");
    expect(workbenchUiSource).toContain("Field-level submission detail");
  });

  it("renders submitted lecturer forms as a presentable report instead of disabled inputs", () => {
    const captureFunction = workbenchUiSource.slice(
      workbenchUiSource.indexOf("function ProductionLecturerCaptureForm"),
      workbenchUiSource.indexOf("function ProductionDataCaptureWorkspace")
    );

    expect(workbenchUiSource).toContain("function SubmittedLecturerReport");
    expect(workbenchUiSource).toContain("FGC lecturer evidence report");
    expect(workbenchUiSource).toContain("Toolkit response register");
    expect(workbenchUiSource).toContain("Print report");
    expect(captureFunction).toContain("if (isLocked)");
    expect(captureFunction).toContain("<SubmittedLecturerReport");
  });

  it("makes stored evidence documents viewable through a governed signed-link route", () => {
    expect(workbenchSource).toContain("export async function createFgcEvidenceFileViewUrl");
    expect(workbenchSource).toContain("await assertSubmissionVisibleToAccess(access, file.submission_id)");
    expect(workbenchSource).toContain("DOWNLOAD_EVIDENCE_FILE");
    expect(evidenceDownloadRouteSource).toContain("createFgcEvidenceFileViewUrl");
    expect(evidenceDownloadRouteSource).toContain("NextResponse.redirect");
  });

  it("uses real private evidence upload instead of recording filenames only", () => {
    expect(evidenceUploadSource).toContain("uploadLecturerEvidenceFile");
    expect(evidenceUploadSource).toContain("uploadToSupabaseStorage");
    expect(evidenceUploadSource).toContain("checksumSha256");
    expect(evidenceUploadSource).toContain("'PENDING_REVIEW'");
    expect(evidenceUploadRouteSource).toContain("request.formData()");
    expect(workbenchUiSource).toContain("Upload evidence files to private storage");
    expect(workbenchUiSource).not.toContain("Register evidence files for this draft");
  });

  it("shows manifest-only evidence entries separately from uploaded files", () => {
    expect(workbenchUiSource).toContain("Evidence document register");
    expect(workbenchUiSource).toContain("Stored evidence files");
    expect(workbenchUiSource).toContain("Manifest-only entries");
    expect(workbenchUiSource).toContain("Listed in manifest; binary file not stored yet");
    expect(workbenchUiSource).toContain("View document");
  });
});
