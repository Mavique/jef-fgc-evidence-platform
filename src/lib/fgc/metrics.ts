import { fgcQuery } from "@/lib/fgc/db";
import type { FgcCurrentUserResult } from "@/lib/fgc/current-user";
import { mersetaAffiliatedUserScope, mersetaScopeForAlias } from "@/lib/fgc/merseta-scope";

type ResolvedProductionAccess = Extract<FgcCurrentUserResult, { ok: true }>;

type CountRow = {
  total_users: string;
  active_users: string;
  verified_users: string;
  pending_affiliations: string;
  suspended_users: string;
};

type RoleCountRow = {
  role_code: string;
  status: string;
  total: string;
};

type AssignmentCountRow = {
  status: string;
  total: string;
};

type SubmissionCountRow = {
  status: string;
  total: string;
};

type AuditCountRow = {
  total_events: string;
  last_event_at: string | null;
};

export type FgcProductionMetric = {
  id: string;
  label: string;
  value: number;
  note: string;
  tone: "cyan" | "lime" | "amber" | "rose";
};

export type FgcProductionMetricsSummary = {
  generatedAt: string;
  accessState: ResolvedProductionAccess["access"]["accessState"];
  activeRole: string | null;
  metrics: FgcProductionMetric[];
  roleBreakdown: Array<{ roleCode: string; status: string; total: number }>;
  assignmentBreakdown: Array<{ status: string; total: number }>;
  audit: { totalEvents: number; lastEventAt: string | null };
};

function toNumber(value: string | null | undefined) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function userWhere(access: ResolvedProductionAccess) {
  if (access.access.accessState === "PLATFORM_SUPER_ACTIVE") return { sql: "false", values: [] as string[] };
  if (access.access.accessState === "JEF_ADMIN_ACTIVE") {
    const role = access.access.activeRole;
    if (!role?.collegeId) return { sql: "false", values: [] as string[] };
    return role.campusId
      ? { sql: "u.deleted_at IS NULL AND EXISTS (SELECT 1 FROM fgc.production_role_assignments scoped_pra WHERE scoped_pra.user_id = u.id AND scoped_pra.tvet_college_id = $1 AND scoped_pra.campus_id = $2)", values: [role.collegeId, role.campusId] }
      : { sql: "u.deleted_at IS NULL AND EXISTS (SELECT 1 FROM fgc.production_role_assignments scoped_pra WHERE scoped_pra.user_id = u.id AND scoped_pra.tvet_college_id = $1)", values: [role.collegeId] };
  }
  if (access.access.accessState === "MERSETA_ACTIVE") return { sql: `${mersetaAffiliatedUserScope()} AND u.deleted_at IS NULL`, values: [access.user.id] };
  if (access.access.accessState === "COLLEGE_ACTIVE") {
    const role = access.access.activeRole;
    if (!role?.collegeId) return { sql: "false", values: [] as string[] };
    return role.campusId
      ? { sql: "u.deleted_at IS NULL AND EXISTS (SELECT 1 FROM fgc.production_role_assignments scoped_pra WHERE scoped_pra.user_id = u.id AND scoped_pra.tvet_college_id = $1 AND scoped_pra.campus_id = $2)", values: [role.collegeId, role.campusId] }
      : { sql: "u.deleted_at IS NULL AND EXISTS (SELECT 1 FROM fgc.production_role_assignments scoped_pra WHERE scoped_pra.user_id = u.id AND scoped_pra.tvet_college_id = $1)", values: [role.collegeId] };
  }
  return { sql: "u.deleted_at IS NULL AND u.id = $1", values: [access.user.id] };
}

function roleWhere(access: ResolvedProductionAccess) {
  if (access.access.accessState === "PLATFORM_SUPER_ACTIVE") return { sql: "false", values: [] as string[] };
  if (access.access.accessState === "JEF_ADMIN_ACTIVE") {
    const role = access.access.activeRole;
    if (!role?.collegeId) return { sql: "false", values: [] as string[] };
    return role.campusId
      ? { sql: "pra.tvet_college_id = $1 AND pra.campus_id = $2", values: [role.collegeId, role.campusId] }
      : { sql: "pra.tvet_college_id = $1", values: [role.collegeId] };
  }
  if (access.access.accessState === "MERSETA_ACTIVE") return { sql: mersetaScopeForAlias("pra", "$1", { programme: false, reportingPeriod: false, collegeColumn: "pra.tvet_college_id" }), values: [access.user.id] };
  if (access.access.accessState === "COLLEGE_ACTIVE") {
    const role = access.access.activeRole;
    if (!role?.collegeId) return { sql: "false", values: [] as string[] };
    return role.campusId
      ? { sql: "pra.tvet_college_id = $1 AND pra.campus_id = $2", values: [role.collegeId, role.campusId] }
      : { sql: "pra.tvet_college_id = $1", values: [role.collegeId] };
  }
  return { sql: "pra.user_id = $1", values: [access.user.id] };
}

function assignmentWhere(access: ResolvedProductionAccess) {
  if (access.access.accessState === "PLATFORM_SUPER_ACTIVE") return { sql: "false", values: [] as string[] };
  if (access.access.accessState === "JEF_ADMIN_ACTIVE") {
    const role = access.access.activeRole;
    if (!role?.collegeId) return { sql: "false", values: [] as string[] };
    return role.campusId
      ? { sql: "fa.college_id = $1 AND fa.campus_id = $2", values: [role.collegeId, role.campusId] }
      : { sql: "fa.college_id = $1", values: [role.collegeId] };
  }
  if (access.access.accessState === "LECTURER_ACTIVE") return { sql: "fa.assigned_to = $1", values: [access.user.id] };
  if (access.access.accessState === "MERSETA_ACTIVE") return { sql: mersetaScopeForAlias("fa", "$1", { programme: false }), values: [access.user.id] };
  if (access.access.accessState === "COLLEGE_ACTIVE") {
    const role = access.access.activeRole;
    if (!role?.collegeId) return { sql: "false", values: [] as string[] };
    return role.campusId
      ? { sql: "fa.college_id = $1 AND fa.campus_id = $2", values: [role.collegeId, role.campusId] }
      : { sql: "fa.college_id = $1", values: [role.collegeId] };
  }
  return { sql: "false", values: [] as string[] };
}

function submissionWhere(access: ResolvedProductionAccess) {
  if (access.access.accessState === "PLATFORM_SUPER_ACTIVE") return { sql: "false", values: [] as string[] };
  if (access.access.accessState === "JEF_ADMIN_ACTIVE") {
    const role = access.access.activeRole;
    if (!role?.collegeId) return { sql: "false", values: [] as string[] };
    return role.campusId
      ? { sql: "ps.college_id = $1 AND ps.campus_id = $2", values: [role.collegeId, role.campusId] }
      : { sql: "ps.college_id = $1", values: [role.collegeId] };
  }
  if (access.access.accessState === "LECTURER_ACTIVE") return { sql: "ps.submitted_by = $1", values: [access.user.id] };
  if (access.access.accessState === "MERSETA_ACTIVE") return { sql: mersetaScopeForAlias("ps"), values: [access.user.id] };
  if (access.access.accessState === "COLLEGE_ACTIVE") {
    const role = access.access.activeRole;
    if (!role?.collegeId) return { sql: "false", values: [] as string[] };
    return role.campusId
      ? { sql: "ps.college_id = $1 AND ps.campus_id = $2", values: [role.collegeId, role.campusId] }
      : { sql: "ps.college_id = $1", values: [role.collegeId] };
  }
  return { sql: "false", values: [] as string[] };
}

function auditWhere(access: ResolvedProductionAccess) {
  return { sql: "pae.actor_user_id = $1", values: [access.user.id] };
}

export async function getFgcProductionMetricsSummary(access: ResolvedProductionAccess): Promise<FgcProductionMetricsSummary> {
  const users = userWhere(access);
  const roles = roleWhere(access);
  const assignments = assignmentWhere(access);
  const submissions = submissionWhere(access);
  const audit = auditWhere(access);
  const [userCounts, roleCounts, assignmentCounts, submissionCounts, auditCounts] = await Promise.all([
    fgcQuery<CountRow>(`
      SELECT
        COUNT(*)::text AS total_users,
        COUNT(*) FILTER (WHERE account_state = 'ACTIVE')::text AS active_users,
        COUNT(*) FILTER (WHERE email_verified_at IS NOT NULL)::text AS verified_users,
        COUNT(*) FILTER (WHERE account_state = 'AFFILIATION_PENDING')::text AS pending_affiliations,
        COUNT(*) FILTER (WHERE account_state = 'SUSPENDED')::text AS suspended_users
      FROM fgc.production_users u
      WHERE ${users.sql}
    `, users.values),
    fgcQuery<RoleCountRow>(`
      SELECT r.code::text AS role_code, pra.status::text AS status, COUNT(*)::text AS total
      FROM fgc.production_role_assignments pra
      JOIN fgc.roles r ON r.id = pra.role_id
      WHERE ${roles.sql}
      GROUP BY r.code, pra.status
      ORDER BY r.code, pra.status
    `, roles.values),
    fgcQuery<AssignmentCountRow>(`
      SELECT fa.status::text, COUNT(*)::text AS total
      FROM fgc.form_assignments fa
      WHERE ${assignments.sql}
      GROUP BY fa.status
      ORDER BY fa.status
    `, assignments.values),
    fgcQuery<SubmissionCountRow>(`
      SELECT ps.status::text, COUNT(*)::text AS total
      FROM fgc.production_submissions ps
      WHERE ${submissions.sql}
      GROUP BY ps.status
      ORDER BY ps.status
    `, submissions.values),
    fgcQuery<AuditCountRow>(`
      SELECT COUNT(*)::text AS total_events, MAX(created_at)::text AS last_event_at
      FROM fgc.production_audit_events pae
      WHERE ${audit.sql}
    `, audit.values)
  ]);

  const counts = userCounts.rows[0];
  const roleBreakdown = roleCounts.rows.map((row) => ({
    roleCode: row.role_code,
    status: row.status,
    total: toNumber(row.total)
  }));
  const assignmentBreakdown = assignmentCounts.rows.map((row) => ({
    status: row.status,
    total: toNumber(row.total)
  }));
  const submissionBreakdown = submissionCounts.rows.map((row) => ({
    status: row.status,
    total: toNumber(row.total)
  }));
  const approvedLecturers = roleBreakdown
    .filter((row) => row.roleCode === "LECTURER" && row.status === "APPROVED")
    .reduce((total, row) => total + row.total, 0);
  const pendingOwners = roleBreakdown
    .filter((row) => row.roleCode === "COLLEGE_EVIDENCE_OWNER" && row.status !== "APPROVED")
    .reduce((total, row) => total + row.total, 0);
  const assignedForms = assignmentBreakdown.reduce((total, row) => total + row.total, 0);
  const draftSubmissions = submissionBreakdown
    .filter((row) => ["DRAFT", "READY_FOR_LECTURER_REVIEW", "CLARIFICATION_REQUESTED", "RESUBMITTED"].includes(row.status))
    .reduce((total, row) => total + row.total, 0);
  const submittedEvidencePacks = submissionBreakdown
    .filter((row) => !["DRAFT", "READY_FOR_LECTURER_REVIEW", "CLARIFICATION_REQUESTED", "ARCHIVED", "SUPERSEDED"].includes(row.status))
    .reduce((total, row) => total + row.total, 0);

  return {
    generatedAt: new Date().toISOString(),
    accessState: access.access.accessState,
    activeRole: access.access.activeRole?.code ?? null,
    metrics: [
      {
        id: "verified-users",
        label: "Verified production users",
        value: toNumber(counts?.verified_users),
        note: "Accounts with confirmed email identity.",
        tone: "cyan"
      },
      {
        id: "active-users",
        label: "Active users",
        value: toNumber(counts?.active_users),
        note: "Users with governed portal access available.",
        tone: "lime"
      },
      {
        id: "pending-affiliations",
        label: "Pending affiliations",
        value: toNumber(counts?.pending_affiliations),
        note: "Applicants awaiting JEF administrator scope decisions.",
        tone: "amber"
      },
      {
        id: "approved-lecturers",
        label: "Approved lecturers",
        value: approvedLecturers,
        note: "Lecturer role approvals that can unlock lecturer portal access.",
        tone: "lime"
      },
      {
        id: "pending-college-owners",
        label: "Pending evidence owners",
        value: pendingOwners,
        note: "College Evidence Owner requests still requiring separate decisions.",
        tone: "amber"
      },
      {
        id: "assigned-forms",
        label: "Assigned FGC forms",
        value: assignedForms,
        note: "Production form assignments created from eligibility rules.",
        tone: "cyan"
      },
      {
        id: "draft-submissions",
        label: "Draft evidence packs",
        value: draftSubmissions,
        note: "Saved lecturer forms not yet locked for review.",
        tone: "amber"
      },
      {
        id: "submitted-evidence-packs",
        label: "Submitted evidence packs",
        value: submittedEvidencePacks,
        note: "Lecturer submissions now in the governed review lineage.",
        tone: "lime"
      },
      {
        id: "suspended-users",
        label: "Suspended users",
        value: toNumber(counts?.suspended_users),
        note: "Accounts temporarily blocked by administrator decision.",
        tone: "rose"
      }
    ],
    roleBreakdown,
    assignmentBreakdown,
    audit: {
      totalEvents: toNumber(auditCounts.rows[0]?.total_events),
      lastEventAt: auditCounts.rows[0]?.last_event_at ?? null
    }
  };
}
