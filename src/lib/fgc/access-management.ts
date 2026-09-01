import { FgcValidationError } from "@/lib/fgc/api";
import { fgcQuery, withFgcTransaction } from "@/lib/fgc/db";
import { sendFgcMail } from "@/lib/fgc/mailer";

export type FgcAccessApplicantRole = {
  id: string;
  code: string;
  name: string;
  status: string;
  approvedAt: string | null;
  collegeId: string | null;
  collegeName: string | null;
  campusId: string | null;
  campusName: string | null;
};

export type FgcAccessApplicant = {
  id: string;
  name: string;
  email: string;
  jobTitle: string | null;
  accountState: string;
  emailVerified: boolean;
  verifiedAt: string | null;
  registrationDate: string;
  selectedOrganisation: string;
  tvetCollege: string | null;
  campus: string | null;
  roles: FgcAccessApplicantRole[];
  formAssignments: Array<{ id: string; templateName: string; status: string; createdAt: string }>;
};

export type FgcAdminActor = {
  user: { id: string; email: string; name: string };
  role: { code: string };
};

type ApplicantRow = {
  id: string;
  email: string;
  first_name: string;
  surname: string;
  job_title: string | null;
  account_state: string;
  email_verified: boolean;
  verified_at: string | null;
  registration_date: string;
};

type ApplicantRoleRow = {
  id: string;
  user_id: string;
  code: string;
  name: string;
  status: string;
  approved_at: string | null;
  college_id: string | null;
  college_name: string | null;
  campus_id: string | null;
  campus_name: string | null;
};

type AssignmentRow = {
  id: string;
  assigned_to: string;
  template_name: string;
  status: string;
  created_at: string;
};

async function notifyUser(userId: string, email: string, subject: string, body: string, relatedObjectType: string, relatedObjectId: string, query = fgcQuery) {
  const inApp = await query<{ id: string }>(
    `
      INSERT INTO fgc.notifications (user_id, channel, notification_type, subject, body, status, related_object_type, related_object_id)
      VALUES ($1, 'IN_APP', 'ACCESS_DECISION', $2, $3, 'SENT', $4, $5)
      RETURNING id::text
    `,
    [userId, subject, body, relatedObjectType, relatedObjectId]
  );
  const emailNotification = await query<{ id: string }>(
    `
      INSERT INTO fgc.notifications (user_id, channel, notification_type, subject, body, status, related_object_type, related_object_id)
      VALUES ($1, 'EMAIL', 'ACCESS_DECISION', $2, $3, 'PENDING', $4, $5)
      RETURNING id::text
    `,
    [userId, subject, body, relatedObjectType, relatedObjectId]
  );

  try {
    await sendFgcMail({ to: email, subject, text: body });
    await fgcQuery("UPDATE fgc.notifications SET status = 'SENT', sent_at = now() WHERE id = $1", [emailNotification.rows[0].id]);
  } catch (error) {
    await fgcQuery("UPDATE fgc.notifications SET status = 'FAILED', failure_reason = $2 WHERE id = $1", [
      emailNotification.rows[0].id,
      error instanceof Error ? error.message : "Email delivery failed."
    ]);
  }

  return { inAppNotificationId: inApp.rows[0].id, emailNotificationId: emailNotification.rows[0].id };
}

async function recordWorkflowAudit(
  actor: FgcAdminActor,
  action: string,
  objectType: string,
  objectId: string,
  reason: string,
  metadata: Record<string, unknown>,
  query = fgcQuery
) {
  await query(
    `
      INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, object_id, reason, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
    `,
    [actor.user.id, actor.role.code, action, objectType, objectId, reason, JSON.stringify(metadata)]
  );
}

async function recalculateAccountState(userId: string, query = fgcQuery) {
  const result = await query<{ next_state: string }>(
    `
      SELECT CASE
        WHEN u.account_state = 'SUSPENDED' THEN 'SUSPENDED'
        WHEN u.account_state = 'DEACTIVATED' THEN 'DEACTIVATED'
        WHEN u.account_state = 'AFFILIATION_REJECTED' THEN 'AFFILIATION_REJECTED'
        WHEN u.email_verified_at IS NULL THEN 'EMAIL_UNVERIFIED'
        WHEN EXISTS (
          SELECT 1
          FROM fgc.production_role_assignments pra
          JOIN fgc.roles r ON r.id = pra.role_id
          WHERE pra.user_id = u.id
            AND pra.status = 'APPROVED'
            AND r.code = 'LECTURER'
        )
        AND u.account_state IN ('AFFILIATION_APPROVED', 'ACTIVE') THEN 'ACTIVE'
        WHEN u.account_state = 'AFFILIATION_APPROVED' THEN 'AFFILIATION_APPROVED'
        ELSE 'AFFILIATION_PENDING'
      END AS next_state
      FROM fgc.production_users u
      WHERE u.id = $1
    `,
    [userId]
  );

  const nextState = result.rows[0]?.next_state;
  if (!nextState) return;
  await query("UPDATE fgc.production_users SET account_state = $2::fgc.account_state, updated_at = now() WHERE id = $1", [userId, nextState]);
}

async function ensureLecturerFormAssignment(userId: string, actorUserId: string, query = fgcQuery) {
  const eligibility = await query<{ eligible: boolean; college_id: string | null; campus_id: string | null }>(
    `
      SELECT
        EXISTS (
          SELECT 1
          FROM fgc.production_users u
          JOIN fgc.production_role_assignments pra ON pra.user_id = u.id
          JOIN fgc.roles r ON r.id = pra.role_id
          WHERE u.id = $1
            AND u.account_state = 'ACTIVE'
            AND u.email_verified_at IS NOT NULL
            AND pra.status = 'APPROVED'
            AND r.code = 'LECTURER'
        ) AS eligible,
        (
          SELECT pra.tvet_college_id::text
          FROM fgc.production_role_assignments pra
          JOIN fgc.roles r ON r.id = pra.role_id
          WHERE pra.user_id = $1 AND pra.status = 'APPROVED' AND r.code = 'LECTURER'
          LIMIT 1
        ) AS college_id,
        (
          SELECT pra.campus_id::text
          FROM fgc.production_role_assignments pra
          JOIN fgc.roles r ON r.id = pra.role_id
          WHERE pra.user_id = $1 AND pra.status = 'APPROVED' AND r.code = 'LECTURER'
          LIMIT 1
        ) AS campus_id
    `,
    [userId]
  );

  const row = eligibility.rows[0];
  if (!row?.eligible) return null;

  const template = await query<{ id: string }>(
    `
      INSERT INTO fgc.form_templates (code, name, version, description, active)
      VALUES ('FGC_LECTURER_EVIDENCE_V1', 'FGC Lecturer Evidence Validation Form', 1, 'Production data-capture form assigned to eligible lecturers.', TRUE)
      ON CONFLICT (code) DO UPDATE SET active = TRUE
      RETURNING id::text
    `
  );

  const existing = await query<{ id: string }>(
    `
      SELECT id::text
      FROM fgc.form_assignments
      WHERE template_id = $1
        AND assigned_to = $2
        AND status IN ('ASSIGNED', 'IN_PROGRESS', 'RETURNED')
      LIMIT 1
    `,
    [template.rows[0].id, userId]
  );

  if (existing.rows[0]) return existing.rows[0].id;

  const assignment = await query<{ id: string }>(
    `
      INSERT INTO fgc.form_assignments (template_id, assigned_to, assigned_by, college_id, campus_id, due_at)
      VALUES ($1, $2, $3, $4, $5, now() + interval '30 days')
      RETURNING id::text
    `,
    [template.rows[0].id, userId, actorUserId, row.college_id, row.campus_id]
  );

  return assignment.rows[0].id;
}

export async function listAccessApplicants(): Promise<FgcAccessApplicant[]> {
  const applicants = await fgcQuery<ApplicantRow>(
    `
      SELECT
        u.id::text,
        u.email::text,
        u.first_name,
        u.surname,
        u.job_title,
        u.account_state::text,
        u.email_verified_at IS NOT NULL AS email_verified,
        u.email_verified_at::text AS verified_at,
        u.created_at::text AS registration_date
      FROM fgc.production_users u
      WHERE u.deleted_at IS NULL
        AND EXISTS (SELECT 1 FROM fgc.production_role_assignments pra WHERE pra.user_id = u.id)
      ORDER BY
        CASE u.account_state
          WHEN 'AFFILIATION_PENDING' THEN 0
          WHEN 'AFFILIATION_APPROVED' THEN 1
          WHEN 'ACTIVE' THEN 2
          ELSE 3
        END,
        u.created_at DESC
    `
  );

  const userIds = applicants.rows.map((row) => row.id);
  if (!userIds.length) return [];

  const roles = await fgcQuery<ApplicantRoleRow>(
    `
      SELECT
        pra.id::text,
        pra.user_id::text,
        r.code::text,
        r.name,
        pra.status,
        pra.approved_at::text,
        pra.tvet_college_id::text AS college_id,
        c.official_name AS college_name,
        pra.campus_id::text,
        cs.official_name AS campus_name
      FROM fgc.production_role_assignments pra
      JOIN fgc.roles r ON r.id = pra.role_id
      LEFT JOIN fgc.tvet_colleges c ON c.id = pra.tvet_college_id
      LEFT JOIN fgc.campus_sites cs ON cs.id = pra.campus_id
      WHERE pra.user_id = ANY($1::uuid[])
      ORDER BY pra.requested_at DESC
    `,
    [userIds]
  );

  const assignments = await fgcQuery<AssignmentRow>(
    `
      SELECT fa.id::text, fa.assigned_to::text, ft.name AS template_name, fa.status, fa.created_at::text
      FROM fgc.form_assignments fa
      JOIN fgc.form_templates ft ON ft.id = fa.template_id
      WHERE fa.assigned_to = ANY($1::uuid[])
      ORDER BY fa.created_at DESC
    `,
    [userIds]
  );

  return applicants.rows.map((applicant) => {
    const applicantRoles = roles.rows.filter((role) => role.user_id === applicant.id);
    return {
      id: applicant.id,
      name: `${applicant.first_name} ${applicant.surname}`,
      email: applicant.email,
      jobTitle: applicant.job_title,
      accountState: applicant.account_state,
      emailVerified: applicant.email_verified,
      verifiedAt: applicant.verified_at,
      registrationDate: applicant.registration_date,
      selectedOrganisation: applicantRoles[0]?.college_name ?? "Jengrac Education Foundation",
      tvetCollege: applicantRoles[0]?.college_name ?? null,
      campus: applicantRoles[0]?.campus_name ?? null,
      roles: applicantRoles.map((role) => ({
        id: role.id,
        code: role.code,
        name: role.name,
        status: role.status,
        approvedAt: role.approved_at,
        collegeId: role.college_id,
        collegeName: role.college_name,
        campusId: role.campus_id,
        campusName: role.campus_name
      })),
      formAssignments: assignments.rows
        .filter((assignment) => assignment.assigned_to === applicant.id)
        .map((assignment) => ({
          id: assignment.id,
          templateName: assignment.template_name,
          status: assignment.status,
          createdAt: assignment.created_at
        }))
    };
  });
}

export async function applyAccessDecision(
  actor: FgcAdminActor,
  input: {
    applicantId: string;
    action: string;
    reason: string;
    roleAssignmentId?: string;
    roleDecision?: "APPROVED" | "REJECTED" | "RETURNED" | "REVOKED";
    roleCode?: string;
    collegeId?: string;
    campusId?: string | null;
  }
) {
  if (input.reason.trim().length < 8) {
    throw new FgcValidationError(400, "FGC_DECISION_REASON_REQUIRED", "Record a meaningful decision reason of at least 8 characters.");
  }

  const result = await withFgcTransaction(async (query) => {
    const applicant = await query<{ id: string; email: string; first_name: string; surname: string; account_state: string }>(
      "SELECT id::text, email::text, first_name, surname, account_state::text FROM fgc.production_users WHERE id = $1 AND deleted_at IS NULL FOR UPDATE",
      [input.applicantId]
    );
    const user = applicant.rows[0];
    if (!user) throw new FgcValidationError(404, "FGC_APPLICANT_NOT_FOUND", "The selected applicant no longer exists.");

    let relatedObjectType = "production_user";
    let relatedObjectId = user.id;
    let subject = "FGC access request updated";
    let body = `Hello ${user.first_name}, your FGC access request has been updated.`;
    let assignmentId: string | null = null;

    if (input.action === "APPROVE_AFFILIATION") {
      await query("UPDATE fgc.production_users SET account_state = 'AFFILIATION_APPROVED', updated_at = now() WHERE id = $1", [user.id]);
      await recalculateAccountState(user.id, query);
      subject = "FGC affiliation approved";
      body = `Hello ${user.first_name}, your FGC college/campus affiliation has been approved. Role access is decided separately.`;
    } else if (input.action === "REJECT_AFFILIATION") {
      await query("UPDATE fgc.production_users SET account_state = 'AFFILIATION_REJECTED', updated_at = now() WHERE id = $1", [user.id]);
      subject = "FGC affiliation rejected";
      body = `Hello ${user.first_name}, your FGC affiliation request was rejected. Reason: ${input.reason}`;
    } else if (input.action === "REQUEST_CLARIFICATION") {
      await query("UPDATE fgc.production_users SET account_state = 'AFFILIATION_PENDING', updated_at = now() WHERE id = $1", [user.id]);
      subject = "FGC access clarification requested";
      body = `Hello ${user.first_name}, JEF requires clarification before completing your FGC access approval. Reason: ${input.reason}`;
    } else if (input.action === "SUSPEND_AFFILIATION") {
      await query("UPDATE fgc.production_users SET account_state = 'SUSPENDED', suspended_at = now(), suspension_reason = $2, updated_at = now() WHERE id = $1", [user.id, input.reason]);
      subject = "FGC access suspended";
      body = `Hello ${user.first_name}, your FGC access has been suspended. Reason: ${input.reason}`;
    } else if (input.action === "CORRECT_SCOPE") {
      if (!input.collegeId) throw new FgcValidationError(400, "FGC_COLLEGE_REQUIRED", "Select the corrected TVET college.");
      await query(
        `
          UPDATE fgc.production_role_assignments
          SET tvet_college_id = $2, campus_id = $3
          WHERE user_id = $1
            AND status IN ('REQUESTED', 'APPROVED', 'RETURNED')
        `,
        [user.id, input.collegeId, input.campusId ?? null]
      );
      subject = "FGC affiliation scope corrected";
      body = `Hello ${user.first_name}, your FGC college/campus scope was corrected by JEF. Reason: ${input.reason}`;
    } else if (input.action === "ADD_ROLE_REQUEST") {
      if (!input.roleCode) throw new FgcValidationError(400, "FGC_ROLE_CODE_REQUIRED", "Select the role that must be added.");
      const baseScope = await query<{ college_id: string | null; campus_id: string | null }>(
        `
          SELECT tvet_college_id::text AS college_id, campus_id::text
          FROM fgc.production_role_assignments
          WHERE user_id = $1
          ORDER BY requested_at DESC
          LIMIT 1
        `,
        [user.id]
      );
      const role = await query<{ id: string }>("SELECT id::text FROM fgc.roles WHERE code = $1", [input.roleCode]);
      if (!role.rows[0]) throw new FgcValidationError(400, "FGC_UNKNOWN_ROLE", "The selected FGC role is not in the role catalogue.");
      const inserted = await query<{ id: string }>(
        `
          INSERT INTO fgc.production_role_assignments (user_id, role_id, tvet_college_id, campus_id, status)
          VALUES ($1, $2, $3, $4, 'REQUESTED')
          ON CONFLICT (
            user_id,
            role_id,
            COALESCE(tvet_college_id, '00000000-0000-0000-0000-000000000000'::uuid),
            COALESCE(campus_id, '00000000-0000-0000-0000-000000000000'::uuid)
          ) DO UPDATE SET status = fgc.production_role_assignments.status
          RETURNING id::text
        `,
        [user.id, role.rows[0].id, input.collegeId ?? baseScope.rows[0]?.college_id ?? null, input.campusId ?? baseScope.rows[0]?.campus_id ?? null]
      );
      relatedObjectType = "production_role_assignment";
      relatedObjectId = inserted.rows[0].id;
      subject = "FGC role request added";
      body = `Hello ${user.first_name}, JEF added a ${input.roleCode} role request to your FGC access record. Reason: ${input.reason}`;
    } else if (input.action === "DECIDE_ROLE") {
      if (!input.roleAssignmentId || !input.roleDecision) {
        throw new FgcValidationError(400, "FGC_ROLE_DECISION_REQUIRED", "Select a role assignment and a role decision.");
      }
      const role = await query<{ id: string; code: string; name: string }>(
        `
          SELECT pra.id::text, r.code::text, r.name
          FROM fgc.production_role_assignments pra
          JOIN fgc.roles r ON r.id = pra.role_id
          WHERE pra.id = $1 AND pra.user_id = $2
          FOR UPDATE
        `,
        [input.roleAssignmentId, user.id]
      );
      const roleRow = role.rows[0];
      if (!roleRow) throw new FgcValidationError(404, "FGC_ROLE_ASSIGNMENT_NOT_FOUND", "The selected role assignment no longer exists.");
      await query(
        `
          UPDATE fgc.production_role_assignments
          SET
            status = $2,
            approved_by = CASE WHEN $2 = 'APPROVED' THEN $3 ELSE approved_by END,
            approved_at = CASE WHEN $2 = 'APPROVED' THEN now() ELSE approved_at END,
            revoked_by = CASE WHEN $2 = 'REVOKED' THEN $3 ELSE revoked_by END,
            revoked_at = CASE WHEN $2 = 'REVOKED' THEN now() ELSE revoked_at END,
            decision_reason = $4
          WHERE id = $1
        `,
        [roleRow.id, input.roleDecision, actor.user.id, input.reason]
      );
      await recalculateAccountState(user.id, query);
      if (roleRow.code === "LECTURER" && input.roleDecision === "APPROVED") {
        assignmentId = await ensureLecturerFormAssignment(user.id, actor.user.id, query);
      }
      relatedObjectType = "production_role_assignment";
      relatedObjectId = roleRow.id;
      subject = `FGC ${roleRow.name} role ${input.roleDecision.toLowerCase()}`;
      body = `Hello ${user.first_name}, your ${roleRow.name} role was ${input.roleDecision.toLowerCase()}. Reason: ${input.reason}`;
    } else {
      throw new FgcValidationError(400, "FGC_UNKNOWN_ACCESS_ACTION", "The selected access-management action is not supported.");
    }

    await recordWorkflowAudit(actor, input.action, relatedObjectType, relatedObjectId, input.reason, { applicantId: user.id, assignmentId }, query);

    return { user, relatedObjectType, relatedObjectId, subject, body, assignmentId };
  });

  await notifyUser(result.user.id, result.user.email, result.subject, result.body, result.relatedObjectType, result.relatedObjectId);

  return {
    ok: true,
    applicantId: result.user.id,
    assignmentId: result.assignmentId,
    message: result.body
  };
}
