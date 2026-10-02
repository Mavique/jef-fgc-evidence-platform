import { describe, expect, it } from "vitest";
import { resolveFgcAccessPolicy, type FgcProductionRole } from "@/lib/fgc/access-policy";

const role = (overrides: Partial<FgcProductionRole>): FgcProductionRole => ({
  id: "role-1",
  code: "LECTURER",
  name: "Lecturer",
  status: "APPROVED",
  organisationId: null,
  organisationName: null,
  collegeId: "college-1",
  collegeName: "Example TVET College",
  campusId: "campus-1",
  campusName: "Example Campus",
  approvedAt: "2026-08-29T18:00:00.000Z",
  ...overrides
});

describe("FGC production access policy", () => {
  it("routes an active verified lecturer to the canonical lecturer dashboard", () => {
    const result = resolveFgcAccessPolicy({
      accountState: "ACTIVE",
      emailVerified: true,
      roles: [role({})]
    });

    expect(result.accessState).toBe("LECTURER_ACTIVE");
    expect(result.expectedPortal).toBe("/fgc-ekm/dashboard");
    expect(result.canOpenProtectedWorkspace).toBe(true);
  });

  it("keeps an authenticated pending user signed in but blocks protected workspace data", () => {
    const result = resolveFgcAccessPolicy({
      accountState: "AFFILIATION_PENDING",
      emailVerified: true,
      roles: [role({ status: "REQUESTED", code: "COLLEGE_EVIDENCE_OWNER", name: "College Evidence Owner", approvedAt: null })]
    });

    expect(result.accessState).toBe("AFFILIATION_PENDING");
    expect(result.expectedPortal).toBe("/fgc-ekm/access-pending");
    expect(result.canOpenProtectedWorkspace).toBe(false);
  });

  it("does not allow unverified users into protected data", () => {
    const result = resolveFgcAccessPolicy({
      accountState: "EMAIL_UNVERIFIED",
      emailVerified: false,
      roles: [role({})]
    });

    expect(result.accessState).toBe("EMAIL_UNVERIFIED");
    expect(result.canOpenProtectedWorkspace).toBe(false);
  });
});
