import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { resolveFgcAccessPolicy, type FgcAccessState, type FgcProductionRole } from "@/lib/fgc/access-policy";
import type { FgcCurrentUserResult } from "@/lib/fgc/current-user";

const db = vi.hoisted(() => ({
  fgcQuery: vi.fn(),
  currentUser: vi.fn()
}));

vi.mock("@/lib/fgc/db", () => ({
  FgcConfigurationError: class FgcConfigurationError extends Error {},
  fgcQuery: (...args: unknown[]) => db.fgcQuery(...args),
  withFgcTransaction: async (callback: (query: typeof db.fgcQuery) => Promise<unknown>) => callback(db.fgcQuery)
}));

vi.mock("@/lib/fgc/current-user", () => ({
  getCurrentFgcUserFromCookies: () => db.currentUser()
}));

function role(overrides: Partial<FgcProductionRole> = {}): FgcProductionRole {
  return {
    id: "role-1",
    code: "LECTURER",
    name: "Lecturer",
    status: "APPROVED",
    organisationId: "org-1",
    organisationName: "Test Organisation",
    collegeId: null,
    collegeName: null,
    campusId: null,
    campusName: null,
    approvedAt: "2026-09-03T00:00:00.000Z",
    ...overrides
  };
}

function access(accessState: FgcAccessState, activeRole = role()): Extract<FgcCurrentUserResult, { ok: true }> {
  return {
    ok: true,
    user: {
      id: "user-1",
      email: "user@example.invalid",
      name: "Test User",
      firstName: "Test",
      surname: "User",
      accountState: "ACTIVE",
      emailVerified: true,
      lastLoginAt: null
    },
    session: { expiresAt: "2026-09-04T00:00:00.000Z", createdAt: "2026-09-03T00:00:00.000Z" },
    formAssignments: [],
    diagnostic: "SESSION_RESOLVED",
    roles: [activeRole],
    access: {
      accessState,
      expectedPortal: "/fgc-ekm",
      activeRole,
      canOpenProtectedWorkspace: true
    }
  };
}

function installEmptyCanonicalQueries() {
  db.fgcQuery.mockImplementation((sql: string) => {
    if (sql.includes("FROM fgc.production_users")) {
      return Promise.resolve({ rows: [{ total_users: "0", active_users: "0", verified_users: "0", pending_affiliations: "0", suspended_users: "0" }] });
    }
    if (sql.includes("COUNT(*)::text AS total_events")) {
      return Promise.resolve({ rows: [{ total_events: "0", last_event_at: null }] });
    }
    return Promise.resolve({ rows: [] });
  });
}

describe("FGC production runtime data boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    installEmptyCanonicalQueries();
  });

  it("returns honest empty workbench state when canonical tables contain no scoped records", async () => {
    const { getFgcRoleWorkbench } = await import("@/lib/fgc/workbench");

    const workbench = await getFgcRoleWorkbench(access("LECTURER_ACTIVE"));

    expect(workbench.submissions).toEqual([]);
    expect(workbench.notifications).toEqual([]);
    expect(workbench.reports).toEqual([]);
    expect(workbench.auditEvents).toEqual([]);
    expect(workbench.queues.every((queue) => queue.count === 0)).toBe(true);
  });

  it("propagates database failures instead of returning operational fallback records", async () => {
    const { getFgcRoleWorkbench } = await import("@/lib/fgc/workbench");
    db.fgcQuery.mockRejectedValueOnce(new Error("database unavailable"));

    await expect(getFgcRoleWorkbench(access("LECTURER_ACTIVE"))).rejects.toThrow("database unavailable");
  });

  it("scopes lecturer workbench records to the authenticated lecturer", async () => {
    const { getFgcRoleWorkbench } = await import("@/lib/fgc/workbench");

    await getFgcRoleWorkbench(access("LECTURER_ACTIVE"));

    const submissionQuery = db.fgcQuery.mock.calls.find(([sql]) => String(sql).includes("SELECT ps.id::text"));
    expect(String(submissionQuery?.[0])).toContain("ps.submitted_by = $1");
    expect(submissionQuery?.[1]).toEqual(["user-1"]);
  });

  it("scopes college workbench records to the approved college and campus", async () => {
    const { getFgcRoleWorkbench } = await import("@/lib/fgc/workbench");

    await getFgcRoleWorkbench(access("COLLEGE_ACTIVE", role({ code: "COLLEGE_EVIDENCE_OWNER", name: "College Evidence Owner", collegeId: "college-1", campusId: "campus-1" })));

    const submissionQuery = db.fgcQuery.mock.calls.find(([sql]) => String(sql).includes("SELECT ps.id::text"));
    expect(String(submissionQuery?.[0])).toContain("ps.college_id = $1 AND ps.campus_id = $2");
    expect(submissionQuery?.[1]).toEqual(["college-1", "campus-1"]);
  });

  it("uses only canonical active assignments for assessor and moderator queues", async () => {
    const { assertSubmissionVisibleToAccess, getFgcRoleWorkbench } = await import("@/lib/fgc/workbench");

    await getFgcRoleWorkbench(access("ASSESSOR_ACTIVE", role({ code: "ASSESSOR", name: "Assessor" })));
    const assessorQuery = db.fgcQuery.mock.calls.find(([sql]) => String(sql).includes("FROM fgc.review_assignments"));
    expect(String(assessorQuery?.[0])).toContain("ra.assignee_user_id = $2");
    expect(String(assessorQuery?.[0])).toContain("ra.status IN ('ASSIGNED', 'IN_PROGRESS')");

    await expect(assertSubmissionVisibleToAccess(access("MODERATOR_ACTIVE", role({ code: "MODERATOR", name: "Moderator" })), "submission-2")).rejects.toMatchObject({
      status: 404,
      code: "FGC_SUBMISSION_NOT_VISIBLE"
    });
  });

  it("does not let a review row for somebody else authorize assessor or moderator API visibility", async () => {
    const { assertSubmissionVisibleToAccess } = await import("@/lib/fgc/workbench");

    await expect(assertSubmissionVisibleToAccess(access("ASSESSOR_ACTIVE", role({ code: "ASSESSOR", name: "Assessor" })), "submission-foreign")).rejects.toMatchObject({
      code: "FGC_SUBMISSION_NOT_VISIBLE"
    });
    const query = db.fgcQuery.mock.calls[0];
    expect(String(query[0])).toContain("ra.assignee_user_id = $1");
    expect(String(query[0])).toContain("ra.status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED')");
  });

  it("returns 401 from the workbench API without fallback records", async () => {
    const { GET } = await import("@/app/api/fgc/workbench/route");
    db.currentUser.mockResolvedValueOnce({
      ok: false,
      accessState: "ANONYMOUS",
      expectedPortal: "/fgc-ekm/sign-in",
      message: "No FGC production session cookie was sent.",
      diagnostic: "NO_COOKIE"
    });

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toMatchObject({ ok: false });
    expect(payload.workbench).toBeUndefined();
    expect(db.fgcQuery).not.toHaveBeenCalled();
  });

  it("returns 403 from the workbench API for signed-in users without an approved active role", async () => {
    const { GET } = await import("@/app/api/fgc/workbench/route");
    const pending = access("ROLE_PENDING", role({ status: "REQUESTED" }));
    pending.access.canOpenProtectedWorkspace = false;
    db.currentUser.mockResolvedValueOnce(pending);

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload).toMatchObject({ ok: false, code: "FGC_WORKBENCH_FORBIDDEN" });
    expect(payload.workbench).toBeUndefined();
  });

  it("returns safe 500 from the workbench API on database failure without fallback records", async () => {
    const { GET } = await import("@/app/api/fgc/workbench/route");
    db.currentUser.mockResolvedValueOnce(access("LECTURER_ACTIVE"));
    db.fgcQuery.mockRejectedValueOnce(new Error("sensitive database detail"));

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toMatchObject({ ok: false, code: "FGC_SERVER_ERROR", message: "The FGC operation could not be completed." });
    expect(JSON.stringify(payload)).not.toContain("sensitive database detail");
    expect(payload.workbench).toBeUndefined();
  });

  it("keeps unscoped JEF and platform technical roles out of operational evidence metrics", async () => {
    const { getFgcRoleWorkbench, recordFgcWorkbenchDecision } = await import("@/lib/fgc/workbench");
    const jef = access("JEF_ADMIN_ACTIVE", role({ code: "JEF_ADMINISTRATOR", name: "JEF Administrator", collegeId: null, campusId: null }));
    const platform = access("PLATFORM_SUPER_ACTIVE", role({ code: "PLATFORM_SUPER_ADMINISTRATOR", name: "Platform Super Administrator", collegeId: null, campusId: null }));

    await getFgcRoleWorkbench(jef);
    let submissionQuery = db.fgcQuery.mock.calls.find(([sql]) => String(sql).includes("SELECT ps.id::text"));
    expect(String(submissionQuery?.[0])).toContain("WHERE false");

    vi.clearAllMocks();
    installEmptyCanonicalQueries();
    await getFgcRoleWorkbench(platform);
    submissionQuery = db.fgcQuery.mock.calls.find(([sql]) => String(sql).includes("SELECT ps.id::text"));
    expect(String(submissionQuery?.[0])).toContain("WHERE false");
    await expect(recordFgcWorkbenchDecision(platform, { submissionId: "submission-1", action: "JEF_REOPEN", decision: "Reopen", notes: "Unit test" })).rejects.toMatchObject({
      status: 403,
      code: "FGC_ACTION_FORBIDDEN"
    });
  });

  it("does not allow the legacy workbench action to bypass canonical review assignments", async () => {
    const { recordFgcWorkbenchDecision } = await import("@/lib/fgc/workbench");
    const jef = access("JEF_ADMIN_ACTIVE", role({ code: "JEF_ADMINISTRATOR", name: "JEF Administrator", collegeId: "college-1" }));
    const assessor = access("ASSESSOR_ACTIVE", role({ code: "ASSESSOR", name: "Assessor" }));
    await expect(recordFgcWorkbenchDecision(jef, { submissionId: "submission-1", action: "ASSESSOR_REVIEW", decision: "handoff", notes: "legacy bypass" })).rejects.toMatchObject({ status: 403, code: "FGC_ACTION_FORBIDDEN" });
    await expect(recordFgcWorkbenchDecision(assessor, { submissionId: "submission-1", action: "MODERATOR_FINALISE", decision: "handoff", notes: "legacy bypass" })).rejects.toMatchObject({ status: 403, code: "FGC_ACTION_FORBIDDEN" });
  });

  it("keeps scoped merSETA read-only and denies out-of-scope submissions when no configured institution scope exists", async () => {
    const { assertSubmissionVisibleToAccess, getFgcRoleWorkbench } = await import("@/lib/fgc/workbench");
    const merseta = access("MERSETA_ACTIVE", role({ code: "MERSETA_OVERSIGHT", name: "merSETA Oversight", collegeId: null, campusId: null }));

    const workbench = await getFgcRoleWorkbench(merseta);

    expect(workbench.readOnly).toBe(true);
    const submissionQuery = db.fgcQuery.mock.calls.find(([sql]) => String(sql).includes("SELECT ps.id::text"));
    expect(String(submissionQuery?.[0])).toContain("FROM fgc.merseta_access_scopes");
    expect(String(submissionQuery?.[0])).toContain("mas.status = 'ACTIVE'");
    expect(String(submissionQuery?.[0])).toContain("mas.valid_from <= now()");
    await expect(assertSubmissionVisibleToAccess(merseta, "submission-3")).rejects.toMatchObject({ code: "FGC_SUBMISSION_NOT_VISIBLE" });
  });

  it("keeps pending and verified workflow aggregation separate", async () => {
    const { getFgcProductionMetricsSummary } = await import("@/lib/fgc/metrics");
    db.fgcQuery.mockImplementation((sql: string) => {
      if (sql.includes("FROM fgc.production_users")) {
        return Promise.resolve({ rows: [{ total_users: "1", active_users: "1", verified_users: "1", pending_affiliations: "0", suspended_users: "0" }] });
      }
      if (sql.includes("FROM fgc.production_role_assignments")) return Promise.resolve({ rows: [] });
      if (sql.includes("FROM fgc.form_assignments")) return Promise.resolve({ rows: [] });
      if (sql.includes("FROM fgc.production_submissions ps")) {
        return Promise.resolve({ rows: [
          { status: "DRAFT", total: "1" },
          { status: "CLARIFICATION_REQUESTED", total: "1" },
          { status: "SUBMITTED_BY_LECTURER", total: "1" },
          { status: "VERIFIED", total: "1" }
        ] });
      }
      if (sql.includes("FROM fgc.production_audit_events")) return Promise.resolve({ rows: [{ total_events: "0", last_event_at: null }] });
      return Promise.resolve({ rows: [] });
    });

    const metrics = await getFgcProductionMetricsSummary(access("LECTURER_ACTIVE"));

    expect(metrics.metrics.find((metric) => metric.id === "draft-submissions")?.value).toBe(2);
    expect(metrics.metrics.find((metric) => metric.id === "submitted-evidence-packs")?.value).toBe(2);
  });

  it("counts submissions from canonical submission rows without version or review joins", async () => {
    const { getFgcProductionMetricsSummary } = await import("@/lib/fgc/metrics");

    await getFgcProductionMetricsSummary(access("LECTURER_ACTIVE"));

    const submissionCountQuery = db.fgcQuery.mock.calls.find(([sql]) => String(sql).includes("FROM fgc.production_submissions ps"));
    expect(String(submissionCountQuery?.[0])).toContain("GROUP BY ps.status");
    expect(String(submissionCountQuery?.[0])).not.toContain("production_submission_versions");
    expect(String(submissionCountQuery?.[0])).not.toContain("production_response_values");
    expect(String(submissionCountQuery?.[0])).not.toContain("evidence_reviews");
  });

  it("keeps college access routes canonical and non-local", () => {
    const result = resolveFgcAccessPolicy({
      accountState: "ACTIVE",
      emailVerified: true,
      roles: [role({ code: "COLLEGE_EVIDENCE_OWNER", name: "College Evidence Owner", collegeId: "college-1", campusId: "campus-1" })]
    });

    expect(result.expectedPortal).toBe("/fgc-ekm/college/overview");
  });

  it("does not expose removed operational fallback identifiers from production source files", () => {
    const productionFiles = [
      "src/content/merseta-fgc.ts",
      "src/services/merseta-fgc.ts",
      "src/components/merseta-fgc/FgcEkmApp.tsx",
      "src/components/merseta-fgc/FgcAccessExperience.tsx",
      "src/components/SiteNav.tsx",
      "src/lib/fgc/access-policy.ts"
    ];
    const joined = productionFiles.map((file) => readFileSync(join(process.cwd(), file), "utf8")).join("\n");

    expect(joined).not.toMatch(/mockFgcServices|fgcDemoSessionKey|demoUserProfiles|demoAdminProfile|demo-token|demo-college-01/i);
  });

  it("confirms production service modules do not import test fixtures", () => {
    const productionFiles = [
      "src/app/fgc-ekm/page.tsx",
      "src/app/fgc-ekm/[...route]/page.tsx",
      "src/components/merseta-fgc/FgcEkmApp.tsx",
      "src/components/merseta-fgc/FgcAccessExperience.tsx",
      "src/components/SiteNav.tsx",
      "src/lib/fgc/workbench.ts",
      "src/lib/fgc/metrics.ts"
    ];
    const joined = productionFiles.map((file) => readFileSync(join(process.cwd(), file), "utf8")).join("\n");

    expect(joined).not.toMatch(/tests\/|@\/tests|fixture|mockFgcServices|localStorage|sessionStorage/i);
  });

  it("keeps historical seed files out of the normal migration runner", () => {
    const config = readFileSync(join(process.cwd(), "scripts/fgc/config.mjs"), "utf8");
    const packageJson = readFileSync(join(process.cwd(), "package.json"), "utf8");

    expect(config).toContain("migrationFiles");
    expect(config).not.toMatch(/migrationFiles[\s\S]*002_seed_demo\.sql/);
    expect(packageJson).not.toMatch(/db:seed:demo|002_seed_demo\.sql/);
  });
});
