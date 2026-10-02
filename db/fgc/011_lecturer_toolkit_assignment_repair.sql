-- Repair missing Toolkit assignments for already-approved lecturers.
-- Forward-only and idempotent. Campus scope remains optional by design.

INSERT INTO fgc.form_templates (code, name, version, description, active)
VALUES (
  'FGC_LECTURER_EVIDENCE_V1',
  'FGC Lecturer Evidence Validation Form',
  1,
  'Production data-capture form assigned to eligible lecturers.',
  TRUE
)
ON CONFLICT (code) DO UPDATE SET active = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_fgc_active_lecturer_assignment
  ON fgc.form_assignments(template_id, assigned_to)
  WHERE status IN ('ASSIGNED', 'IN_PROGRESS', 'RETURNED');

WITH lecturer_scope AS (
  SELECT DISTINCT ON (pra.user_id)
    pra.user_id,
    pra.tvet_college_id,
    pra.campus_id
  FROM fgc.production_role_assignments pra
  JOIN fgc.roles r ON r.id = pra.role_id
  JOIN fgc.production_users u ON u.id = pra.user_id
  WHERE r.code = 'LECTURER'
    AND pra.status = 'APPROVED'
    AND u.account_state = 'ACTIVE'
    AND u.email_verified_at IS NOT NULL
    AND u.deleted_at IS NULL
  ORDER BY pra.user_id, pra.approved_at DESC NULLS LAST, pra.requested_at DESC
), lecturer_template AS (
  SELECT id
  FROM fgc.form_templates
  WHERE code = 'FGC_LECTURER_EVIDENCE_V1'
), inserted_assignments AS (
  INSERT INTO fgc.form_assignments (
  template_id,
  assigned_to,
  assigned_by,
  college_id,
  campus_id,
  due_at
  )
  SELECT
  template.id,
  scope.user_id,
  NULL,
  scope.tvet_college_id,
  scope.campus_id,
  now() + interval '30 days'
  FROM lecturer_scope scope
  CROSS JOIN lecturer_template template
  ON CONFLICT (template_id, assigned_to)
    WHERE status IN ('ASSIGNED', 'IN_PROGRESS', 'RETURNED')
  DO NOTHING
  RETURNING id
)

INSERT INTO fgc.production_audit_events (
  actor_user_id,
  actor_role,
  action,
  object_type,
  object_id,
  reason,
  metadata
)
SELECT
  NULL,
  'SYSTEM',
  'PROVISION_LECTURER_TOOLKIT_ASSIGNMENT',
  'form_assignment',
  inserted.id,
  'Backfilled an initial Toolkit 1-13 assignment for an eligible approved lecturer.',
  jsonb_build_object('migration', '011_lecturer_toolkit_assignment_repair.sql')
FROM inserted_assignments inserted;
