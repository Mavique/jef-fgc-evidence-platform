import { cookies } from "next/headers";
import { fgcQuery } from "@/lib/fgc/db";
import { hashToken } from "@/lib/fgc/security";
import { fgcSessionCookieName, requireSessionSecret } from "@/lib/fgc/session";
import { resolveFgcAccessPolicy, type FgcAccessPolicyResult, type FgcProductionRole } from "@/lib/fgc/access-policy";

export type FgcProductionUser = {
  id: string;
  email: string;
  name: string;
  firstName: string;
  surname: string;
  accountState: string;
  emailVerified: boolean;
  lastLoginAt: string | null;
};

export type FgcCurrentUserResult =
  | {
      ok: true;
      session: { expiresAt: string; createdAt: string };
      user: FgcProductionUser;
      roles: FgcProductionRole[];
      formAssignments: Array<{ id: string; templateName: string; status: string; dueAt: string | null; createdAt: string }>;
      access: FgcAccessPolicyResult;
      diagnostic: "SESSION_RESOLVED";
    }
  | {
      ok: false;
      accessState: "ANONYMOUS" | "INVALID_SESSION";
      expectedPortal: "/fgc-ekm/sign-in";
      message: string;
      diagnostic: "NO_COOKIE" | "SESSION_NOT_FOUND";
    };

type SessionUserRow = {
  user_id: string;
  email: string;
  first_name: string;
  surname: string;
  account_state: string;
  email_verified_at: string | null;
  last_login_at: string | null;
  expires_at: string;
  created_at: string;
};

type RoleRow = {
  id: string;
  code: string;
  name: string;
  status: string;
  organisation_id: string | null;
  organisation_name: string | null;
  college_id: string | null;
  college_name: string | null;
  campus_id: string | null;
  campus_name: string | null;
  approved_at: string | null;
};

type FormAssignmentRow = {
  id: string;
  template_name: string;
  status: string;
  due_at: string | null;
  created_at: string;
};

export async function resolveFgcCurrentUserFromToken(token: string | undefined): Promise<FgcCurrentUserResult> {
  if (!token) {
    return {
      ok: false,
      accessState: "ANONYMOUS",
      expectedPortal: "/fgc-ekm/sign-in",
      message: "No FGC production session cookie was sent.",
      diagnostic: "NO_COOKIE"
    };
  }

  const sessionHash = hashToken(`${token}:${requireSessionSecret()}`);
  const sessionResult = await fgcQuery<SessionUserRow>(
    `
      SELECT
        u.id::text AS user_id,
        u.email::text,
        u.first_name,
        u.surname,
        u.account_state::text,
        u.email_verified_at::text,
        u.last_login_at::text,
        s.expires_at::text,
        s.created_at::text
      FROM fgc.production_sessions s
      JOIN fgc.production_users u ON u.id = s.user_id
      WHERE s.session_hash = $1
        AND s.revoked_at IS NULL
        AND s.expires_at > now()
        AND u.deleted_at IS NULL
      LIMIT 1
    `,
    [sessionHash]
  );

  const row = sessionResult.rows[0];
  if (!row) {
    return {
      ok: false,
      accessState: "INVALID_SESSION",
      expectedPortal: "/fgc-ekm/sign-in",
      message: "The FGC production session is missing, expired or revoked.",
      diagnostic: "SESSION_NOT_FOUND"
    };
  }

  const roleResult = await fgcQuery<RoleRow>(
    `
      SELECT
        pra.id::text,
        r.code::text,
        r.name,
        pra.status,
        pra.organisation_id::text,
        o.name AS organisation_name,
        pra.tvet_college_id::text AS college_id,
        c.official_name AS college_name,
        pra.campus_id::text,
        cs.official_name AS campus_name,
        pra.approved_at::text
      FROM fgc.production_role_assignments pra
      JOIN fgc.roles r ON r.id = pra.role_id
      LEFT JOIN fgc.organisations o ON o.id = pra.organisation_id
      LEFT JOIN fgc.tvet_colleges c ON c.id = pra.tvet_college_id
      LEFT JOIN fgc.campus_sites cs ON cs.id = pra.campus_id
      WHERE pra.user_id = $1
      ORDER BY
        CASE pra.status WHEN 'APPROVED' THEN 0 WHEN 'REQUESTED' THEN 1 WHEN 'RETURNED' THEN 2 ELSE 3 END,
        pra.requested_at DESC
    `,
    [row.user_id]
  );

  const roles: FgcProductionRole[] = roleResult.rows.map((role) => ({
    id: role.id,
    code: role.code,
    name: role.name,
    status: role.status,
    organisationId: role.organisation_id,
    organisationName: role.organisation_name,
    collegeId: role.college_id,
    collegeName: role.college_name,
    campusId: role.campus_id,
    campusName: role.campus_name,
    approvedAt: role.approved_at
  }));

  const assignmentResult = await fgcQuery<FormAssignmentRow>(
    `
      SELECT fa.id::text, ft.name AS template_name, fa.status, fa.due_at::text, fa.created_at::text
      FROM fgc.form_assignments fa
      JOIN fgc.form_templates ft ON ft.id = fa.template_id
      WHERE fa.assigned_to = $1
      ORDER BY fa.created_at DESC
    `,
    [row.user_id]
  );

  const user: FgcProductionUser = {
    id: row.user_id,
    email: row.email,
    firstName: row.first_name,
    surname: row.surname,
    name: `${row.first_name} ${row.surname}`,
    accountState: row.account_state,
    emailVerified: Boolean(row.email_verified_at),
    lastLoginAt: row.last_login_at
  };

  return {
    ok: true,
    session: { expiresAt: row.expires_at, createdAt: row.created_at },
    user,
    roles,
    formAssignments: assignmentResult.rows.map((assignment) => ({
      id: assignment.id,
      templateName: assignment.template_name,
      status: assignment.status,
      dueAt: assignment.due_at,
      createdAt: assignment.created_at
    })),
    access: resolveFgcAccessPolicy({ accountState: user.accountState, emailVerified: user.emailVerified, roles }),
    diagnostic: "SESSION_RESOLVED"
  };
}

export async function getCurrentFgcUserFromCookies() {
  const cookieStore = await cookies();
  return resolveFgcCurrentUserFromToken(cookieStore.get(fgcSessionCookieName)?.value);
}
