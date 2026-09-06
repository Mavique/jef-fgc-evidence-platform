export function mersetaScopeForAlias(alias: string, userParameter = "$1", options: { programme?: boolean; reportingPeriod?: boolean; collegeColumn?: string } = {}) {
  const collegeColumn = options.collegeColumn ?? `${alias}.college_id`;
  const programme = options.programme !== false ? `\n      AND (mas.programme_id IS NULL OR mas.programme_id = ${alias}.programme_id)` : "";
  const reportingPeriod = options.reportingPeriod !== false ? `\n      AND (mas.reporting_period_id IS NULL OR mas.reporting_period_id = ${alias}.reporting_period_id)` : "";
  return `EXISTS (
    SELECT 1
    FROM fgc.merseta_access_scopes mas
    WHERE mas.user_id = ${userParameter}
      AND mas.status = 'ACTIVE'
      AND mas.valid_from <= now()
      AND (mas.valid_until IS NULL OR mas.valid_until > now())
      AND mas.tvet_college_id = ${collegeColumn}
      AND (mas.campus_id IS NULL OR mas.campus_id = ${alias}.campus_id)
      ${programme}${reportingPeriod}
  )`;
}

export function mersetaAffiliatedUserScope(userParameter = "$1") {
  return `EXISTS (
    SELECT 1
    FROM fgc.production_role_assignments target_pra
    WHERE target_pra.user_id = u.id
      AND target_pra.status = 'APPROVED'
      AND EXISTS (
        SELECT 1
        FROM fgc.merseta_access_scopes mas
        WHERE mas.user_id = ${userParameter}
          AND mas.status = 'ACTIVE'
          AND mas.valid_from <= now()
          AND (mas.valid_until IS NULL OR mas.valid_until > now())
          AND mas.tvet_college_id = target_pra.tvet_college_id
          AND (mas.campus_id IS NULL OR mas.campus_id = target_pra.campus_id)
      )
  )`;
}
