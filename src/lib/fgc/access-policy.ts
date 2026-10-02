export type FgcProductionRole = {
  id: string;
  code: string;
  name: string;
  status: string;
  organisationId: string | null;
  organisationName: string | null;
  collegeId: string | null;
  collegeName: string | null;
  campusId: string | null;
  campusName: string | null;
  approvedAt: string | null;
};

export type FgcAccessState =
  | "ANONYMOUS"
  | "INVALID_SESSION"
  | "EMAIL_UNVERIFIED"
  | "AFFILIATION_PENDING"
  | "ROLE_PENDING"
  | "LECTURER_ACTIVE"
  | "COLLEGE_ACTIVE"
  | "ASSESSOR_ACTIVE"
  | "MODERATOR_ACTIVE"
  | "MERSETA_ACTIVE"
  | "JEF_ADMIN_ACTIVE"
  | "PLATFORM_SUPER_ACTIVE"
  | "SUSPENDED"
  | "DEACTIVATED";

export type FgcAccessPolicyInput = {
  accountState: string;
  emailVerified: boolean;
  roles: FgcProductionRole[];
};

export type FgcAccessPolicyResult = {
  accessState: FgcAccessState;
  expectedPortal: string;
  activeRole: FgcProductionRole | null;
  canOpenProtectedWorkspace: boolean;
};

const rolePortalPriority: Array<{ codes: string[]; accessState: FgcAccessState; expectedPortal: string }> = [
  { codes: ["PLATFORM_SUPER_ADMINISTRATOR"], accessState: "PLATFORM_SUPER_ACTIVE", expectedPortal: "/fgc-ekm/admin/system" },
  { codes: ["JEF_ADMINISTRATOR"], accessState: "JEF_ADMIN_ACTIVE", expectedPortal: "/fgc-ekm/admin/users-roles" },
  { codes: ["MERSETA_ADMINISTRATOR", "MERSETA_VIEWER", "MERSETA_OVERSIGHT"], accessState: "MERSETA_ACTIVE", expectedPortal: "/fgc-ekm/merseta" },
  { codes: ["MODERATOR"], accessState: "MODERATOR_ACTIVE", expectedPortal: "/fgc-ekm/moderation" },
  { codes: ["ASSESSOR"], accessState: "ASSESSOR_ACTIVE", expectedPortal: "/fgc-ekm/assessments/challenges" },
  { codes: ["COLLEGE_EVIDENCE_OWNER"], accessState: "COLLEGE_ACTIVE", expectedPortal: "/fgc-ekm/college/overview" },
  { codes: ["LECTURER"], accessState: "LECTURER_ACTIVE", expectedPortal: "/fgc-ekm/dashboard" }
];

export function resolveFgcAccessPolicy(input: FgcAccessPolicyInput): FgcAccessPolicyResult {
  if (!input.emailVerified || input.accountState === "EMAIL_UNVERIFIED" || input.accountState === "EMAIL_VERIFIED") {
    return {
      accessState: "EMAIL_UNVERIFIED",
      expectedPortal: "/fgc-ekm/verification-pending",
      activeRole: null,
      canOpenProtectedWorkspace: false
    };
  }

  if (input.accountState === "SUSPENDED" || input.accountState === "DEACTIVATED") {
    return {
      accessState: input.accountState,
      expectedPortal: "/fgc-ekm/sign-in",
      activeRole: null,
      canOpenProtectedWorkspace: false
    };
  }

  const approvedRoles = input.roles.filter((role) => role.status === "APPROVED");
  for (const portal of rolePortalPriority) {
    const activeRole = approvedRoles.find((role) => portal.codes.includes(role.code));
    if (activeRole) {
      return {
        accessState: portal.accessState,
        expectedPortal: portal.expectedPortal,
        activeRole,
        canOpenProtectedWorkspace: true
      };
    }
  }

  const hasPendingRole = input.roles.some((role) => role.status === "REQUESTED" || role.status === "RETURNED");
  return {
    accessState: input.accountState === "AFFILIATION_PENDING" ? "AFFILIATION_PENDING" : hasPendingRole ? "ROLE_PENDING" : "ROLE_PENDING",
    expectedPortal: "/fgc-ekm/access-pending",
    activeRole: null,
    canOpenProtectedWorkspace: false
  };
}
